"use server"

import { db } from "@/lib/db"
import { installmentApplications, type ApplicationCartItem, type NewOrderItemRow, type ScheduleEntry } from "@/lib/db/schema"
import { getProductBySlug } from "@/lib/catalog"
import { buildSchedule, computeInstallmentAmounts, generateApplicationRef, qualifiesForInstallments } from "@/lib/installments"
import { createOrder, getOrderById, updateOrderStatus } from "@/lib/orders/queries"
import { sendPaymentUnderReviewEmail } from "@/lib/email/order-emails"
import { sendInstallmentApplicationReceivedEmail } from "@/lib/email/installment-emails"
import { desc, eq } from "drizzle-orm"

export type ApplicationInput = {
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  nationality: string
  idDocumentType: string
  idDocumentNumber: string
  addressLine1: string
  addressLine2?: string
  city: string
  postalCode: string
  country: string
  employmentStatus: string
  monthlyIncomeCents: number
  idDocumentPathname: string
  locale: string
  termsAccepted: boolean
  dataConsent: boolean
  items: { slug: string; quantity: number }[]
}

export type ApplicationResult = { ok: true; ref: string } | { ok: false; error: string }

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Creates an installment application. All monetary values are recomputed
 * server-side from the catalog — client-supplied prices are never trusted.
 * The ID document must already be uploaded (private Blob pathname passed in).
 */
export async function createInstallmentApplication(input: ApplicationInput): Promise<ApplicationResult> {
  // Required-field + consent validation
  const required: [keyof ApplicationInput, string][] = [
    ["firstName", input.firstName],
    ["lastName", input.lastName],
    ["email", input.email],
    ["phone", input.phone],
    ["dateOfBirth", input.dateOfBirth],
    ["nationality", input.nationality],
    ["idDocumentType", input.idDocumentType],
    ["idDocumentNumber", input.idDocumentNumber],
    ["addressLine1", input.addressLine1],
    ["city", input.city],
    ["postalCode", input.postalCode],
    ["country", input.country],
    ["employmentStatus", input.employmentStatus],
  ]
  for (const [field, value] of required) {
    if (!value || String(value).trim() === "") {
      return { ok: false, error: `Missing field: ${field}` }
    }
  }
  if (!isValidEmail(input.email)) return { ok: false, error: "Invalid email" }
  if (!input.idDocumentPathname?.startsWith("id-documents/")) {
    return { ok: false, error: "ID document is required" }
  }
  if (!input.termsAccepted || !input.dataConsent) {
    return { ok: false, error: "You must accept the agreement and data-processing consent" }
  }
  if (!input.items?.length) return { ok: false, error: "Cart is empty" }

  // Recompute the cart snapshot + total from the catalog (source of truth)
  const cartItems: ApplicationCartItem[] = []
  let totalCents = 0
  for (const line of input.items) {
    const product = await getProductBySlug(line.slug)
    if (!product) return { ok: false, error: `Unknown product: ${line.slug}` }
    const qty = Math.max(1, Math.min(10, Math.floor(line.quantity)))
    cartItems.push({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      quantity: qty,
      unitPriceCents: product.priceCents,
    })
    totalCents += product.priceCents * qty
  }
  if (totalCents <= 0) return { ok: false, error: "Invalid order total" }
  if (!qualifiesForInstallments(totalCents)) {
    return { ok: false, error: "Installments are only available for orders of €1,000 or more" }
  }

  const { downPaymentCents, remainingCents } = computeInstallmentAmounts(totalCents)
  const schedule = buildSchedule(totalCents)
  const ref = generateApplicationRef()

  // Create the real order behind this application up front (status "pending"
  // until an admin approves it) so the installment plan is a first-class
  // order in the system — visible in admin/orders and eligible for the same
  // status lifecycle as any other order.
  const orderItems: Array<Omit<NewOrderItemRow, "id" | "orderId">> = cartItems.map((item) => ({
    productId: item.productId,
    productSlug: item.slug,
    productName: item.name,
    brandName: null,
    image: null,
    unitPriceCents: item.unitPriceCents,
    quantity: item.quantity,
    lineTotalCents: item.unitPriceCents * item.quantity,
  }))

  const order = await createOrder({
    email: input.email.trim(),
    status: "pending",
    paymentMethod: "installments",
    subtotalCents: totalCents,
    shippingCents: 0,
    totalCents,
    shipping: {
      name: `${input.firstName.trim()} ${input.lastName.trim()}`.trim(),
      address1: input.addressLine1.trim(),
      address2: input.addressLine2?.trim() || undefined,
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
    },
    items: orderItems,
  })

  const [app] = await db
    .insert(installmentApplications)
    .values({
      applicationRef: ref,
      status: "pending",
      orderId: order.id,
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: input.email.trim(),
      phone: input.phone.trim(),
      dateOfBirth: input.dateOfBirth,
      nationality: input.nationality.trim(),
      idDocumentType: input.idDocumentType,
      idDocumentNumber: input.idDocumentNumber.trim(),
      addressLine1: input.addressLine1.trim(),
      addressLine2: input.addressLine2?.trim() || null,
      city: input.city.trim(),
      postalCode: input.postalCode.trim(),
      country: input.country.trim(),
      employmentStatus: input.employmentStatus,
      monthlyIncomeCents: Math.max(0, Math.floor(input.monthlyIncomeCents || 0)),
      idDocumentPathname: input.idDocumentPathname,
      currency: "EUR",
      cartItems,
      totalAmountCents: totalCents,
      downPaymentCents,
      remainingCents,
      schedule,
      locale: input.locale,
      termsAccepted: input.termsAccepted,
      dataConsent: input.dataConsent,
    })
    .returning()

  try {
    if (app) await sendInstallmentApplicationReceivedEmail(app)
  } catch (err) {
    console.error("[v0] Installment application-received email failed:", err)
  }

  return { ok: true, ref }
}

export type MarkInstallmentPaidResult = { ok: true } | { ok: false; error: string }

/**
 * Called when the customer clicks "I've paid" for a specific schedule entry
 * (down payment or a later installment) on their application status page.
 * Entries must be paid in order — this never marks a payment as actually
 * received, only moves it into "reviewing" for admin confirmation.
 */
export async function markInstallmentPaymentSubmitted(
  applicationRef: string,
  scheduleIndex: number,
): Promise<MarkInstallmentPaidResult> {
  const rows = await db
    .select()
    .from(installmentApplications)
    .where(eq(installmentApplications.applicationRef, applicationRef))
    .limit(1)
  const app = rows[0]
  if (!app) return { ok: false, error: "not_found" }
  if (app.status !== "approved") return { ok: false, error: "not_approved" }

  const schedule = [...app.schedule] as ScheduleEntry[]
  const entry = schedule[scheduleIndex]
  if (!entry) return { ok: false, error: "invalid_entry" }
  if (entry.status === "paid") return { ok: true }
  if (scheduleIndex > 0 && schedule[scheduleIndex - 1]?.status !== "paid") {
    return { ok: false, error: "previous_unpaid" }
  }
  if (entry.status === "reviewing") return { ok: true }

  schedule[scheduleIndex] = { ...entry, status: "reviewing" }

  await db
    .update(installmentApplications)
    .set({ schedule, updatedAt: new Date() })
    .where(eq(installmentApplications.id, app.id))

  if (app.orderId) {
    await updateOrderStatus(app.orderId, "reviewing_payment")
    try {
      const order = await getOrderById(app.orderId)
      if (order) await sendPaymentUnderReviewEmail(order)
    } catch (err) {
      console.error("[v0] Installment payment-under-review email failed:", err)
    }
  }

  return { ok: true }
}

/** Customer-area read: installment applications tied to a user's email. */
export async function getApplicationsByEmail(email: string) {
  return db
    .select({
      applicationRef: installmentApplications.applicationRef,
      status: installmentApplications.status,
      currency: installmentApplications.currency,
      totalAmountCents: installmentApplications.totalAmountCents,
      downPaymentCents: installmentApplications.downPaymentCents,
      remainingCents: installmentApplications.remainingCents,
      createdAt: installmentApplications.createdAt,
    })
    .from(installmentApplications)
    .where(eq(installmentApplications.email, email))
    .orderBy(desc(installmentApplications.createdAt))
}

/** Public status lookup by reference — returns only customer-safe fields. */
export async function getApplicationStatus(ref: string) {
  const rows = await db
    .select({
      applicationRef: installmentApplications.applicationRef,
      status: installmentApplications.status,
      firstName: installmentApplications.firstName,
      currency: installmentApplications.currency,
      totalAmountCents: installmentApplications.totalAmountCents,
      downPaymentCents: installmentApplications.downPaymentCents,
      remainingCents: installmentApplications.remainingCents,
      schedule: installmentApplications.schedule,
      cartItems: installmentApplications.cartItems,
      createdAt: installmentApplications.createdAt,
    })
    .from(installmentApplications)
    .where(eq(installmentApplications.applicationRef, ref))
    .limit(1)

  return rows[0] ?? null
}
