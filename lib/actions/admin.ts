"use server"

import { db } from "@/lib/db"
import {
  contactMessages,
  installmentApplications,
  orders,
  products,
  type ContactStatus,
  type OrderStatus,
  type ScheduleEntry,
} from "@/lib/db/schema"
import { createAdminSession, destroyAdminSession, isAdmin, verifyPassword } from "@/lib/admin-auth"
import { updateMessageStatus } from "@/lib/contact/queries"
import { getOrderById, updateOrderStatus, updateOrderTracking } from "@/lib/orders/queries"
import {
  sendInstallmentApplicationApprovedEmail,
  sendInstallmentApplicationRejectedEmail,
  sendInstallmentPaymentStatusEmail,
} from "@/lib/email/installment-emails"
import { getAdminProductBySlug, type AdminProductDetail } from "@/lib/catalog/queries"
import type { Availability, CategorySlug, ProductSpec, Technology, UseCase } from "@/lib/catalog/types"
import {
  getMessagesForConversation,
  getUnreadConversationCount,
  insertMessage,
  listConversationsForAdmin,
  markReadForAdmin,
  setConversationMode,
  touchConversation,
} from "@/lib/chat/queries"
import type { ChatMode } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function adminLogin(password: string): Promise<{ ok: boolean; error?: string }> {
  if (!verifyPassword(password)) {
    return { ok: false, error: "Incorrect password" }
  }
  await createAdminSession()
  return { ok: true }
}

export async function adminLogout(): Promise<void> {
  await destroyAdminSession()
  revalidatePath("/admin")
}

async function assertAdmin() {
  if (!(await isAdmin())) throw new Error("Unauthorized")
}

/** List applications for the admin table. Excludes the raw ID number for safety in list view. */
export async function listApplications() {
  await assertAdmin()
  return db
    .select({
      id: installmentApplications.id,
      applicationRef: installmentApplications.applicationRef,
      status: installmentApplications.status,
      firstName: installmentApplications.firstName,
      lastName: installmentApplications.lastName,
      email: installmentApplications.email,
      country: installmentApplications.country,
      totalAmountCents: installmentApplications.totalAmountCents,
      downPaymentCents: installmentApplications.downPaymentCents,
      currency: installmentApplications.currency,
      createdAt: installmentApplications.createdAt,
    })
    .from(installmentApplications)
    .orderBy(desc(installmentApplications.createdAt))
}

export async function getApplicationDetail(id: number) {
  await assertAdmin()
  const rows = await db.select().from(installmentApplications).where(eq(installmentApplications.id, id)).limit(1)
  const app = rows[0]
  if (!app) return null
  const order = app.orderId ? await getOrderById(app.orderId) : null
  return { ...app, order }
}

export async function decideApplication(
  id: number,
  decision: "approved" | "rejected",
  notes?: string,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()
  const rows = await db.select().from(installmentApplications).where(eq(installmentApplications.id, id)).limit(1)
  const app = rows[0]
  if (!app) return { ok: false, error: "not_found" }

  await db
    .update(installmentApplications)
    .set({
      status: decision,
      adminNotes: notes?.trim() || null,
      reviewedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(installmentApplications.id, id))

  // Approving moves the linked order into "awaiting_payment" so the down
  // payment becomes due; rejecting cancels the order outright.
  if (app.orderId) {
    await updateOrderStatus(app.orderId, decision === "approved" ? "awaiting_payment" : "cancelled")
    revalidatePath("/admin/orders")
  }

  try {
    const result = decision === "approved"
      ? await sendInstallmentApplicationApprovedEmail(app)
      : await sendInstallmentApplicationRejectedEmail(app)
    if (!result.sent) {
      console.error("[v0] Installment decision email was not sent:", result.error ?? "email delivery skipped")
    }
  } catch (err) {
    console.error("[v0] Installment decision email failed:", err)
  }

  revalidatePath("/admin/applications")
  revalidatePath(`/admin/applications/${id}`)
  return { ok: true }
}

/**
 * Admin confirms a specific schedule entry (down payment or installment) was
 * actually received. Recomputes the linked order's status from the updated
 * schedule: "partially_paid" once the down payment is in, "paid" once every
 * entry is settled.
 */
export async function confirmInstallmentPayment(
  id: number,
  scheduleIndex: number,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()
  const rows = await db.select().from(installmentApplications).where(eq(installmentApplications.id, id)).limit(1)
  const app = rows[0]
  if (!app) return { ok: false, error: "not_found" }

  const schedule = [...app.schedule] as ScheduleEntry[]
  const entry = schedule[scheduleIndex]
  if (!entry) return { ok: false, error: "invalid_entry" }

  if (entry.status !== "paid") {
    schedule[scheduleIndex] = { ...entry, status: "paid", paid: true }
    await db
      .update(installmentApplications)
      .set({ schedule, updatedAt: new Date() })
      .where(eq(installmentApplications.id, id))
  }

  const allPaid = schedule.every((s) => s.status === "paid")
  const downPaid = schedule[0]?.status === "paid"
  const nextStatus: OrderStatus = allPaid ? "paid" : downPaid ? "partially_paid" : "awaiting_payment"

  if (app.orderId) {
    await updateOrderStatus(app.orderId, nextStatus)
    revalidatePath("/admin/orders")
  }

  try {
    const result = await sendInstallmentPaymentStatusEmail({ ...app, schedule }, scheduleIndex, nextStatus)
    if (!result.sent) {
      console.error("[v0] Installment payment status email was not sent:", result.error ?? "email delivery skipped")
    }
  } catch (error) {
    console.error("[v0] Installment payment status email failed:", error)
  }

  revalidatePath("/admin/applications")
  revalidatePath(`/admin/applications/${id}`)
  return { ok: true }
}

/* ------------------------------- catalog ------------------------------- */

export type ProductInput = {
  priceCents: number
  compareAtCents?: number | null
  stock: number
  featured: boolean
}

/** Admin: update the price / stock / flags of a product. */
export async function updateProduct(
  slug: string,
  input: ProductInput,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()

  if (!Number.isInteger(input.priceCents) || input.priceCents < 0) {
    return { ok: false, error: "Invalid price" }
  }
  if (!Number.isInteger(input.stock) || input.stock < 0) {
    return { ok: false, error: "Invalid stock" }
  }

  await db
    .update(products)
    .set({
      priceCents: input.priceCents,
      compareAtCents: input.compareAtCents && input.compareAtCents > 0 ? input.compareAtCents : null,
      stock: input.stock,
      featured: input.featured,
      updatedAt: new Date(),
    })
    .where(eq(products.slug, slug))

  revalidatePath("/admin/catalog")
  revalidatePath(`/admin/catalog/${slug}`)
  return { ok: true }
}

/* ---- full product create / edit / archive ---- */

export type ProductDetailsInput = {
  name: string
  brandSlug: string
  category: CategorySlug
  technology: Technology | null
  useCases: UseCase[]
  priceCents: number
  compareAtCents: number | null
  availability: Availability
  stock: number
  gtin: string | null
  ean: string | null
  mpn: string
  shortDescription: string
  description: string
  highlights: string[]
  specs: ProductSpec[]
  images: string[]
  featured: boolean
  bestseller: boolean
  weightKg: number
  buildVolumeMm: { x: number; y: number; z: number } | null
}

const CATEGORY_SLUGS: CategorySlug[] = [
  "printers",
  "filaments",
  "resins",
  "spare-parts",
  "accessories",
  "scanners",
  "laser-engravers",
]
const TECHNOLOGIES: Technology[] = ["fdm", "resin", "laser"]
const AVAILABILITIES: Availability[] = ["in_stock", "out_of_stock", "preorder"]
const USE_CASES: UseCase[] = ["home", "makers", "business", "engineering"]

function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60)
}

function validateProduct(input: ProductDetailsInput): string | null {
  if (!input.name?.trim()) return "Name is required"
  if (!input.brandSlug?.trim()) return "Brand is required"
  if (!CATEGORY_SLUGS.includes(input.category)) return "Invalid category"
  if (!Number.isInteger(input.priceCents) || input.priceCents <= 0) return "Invalid price"
  if (input.compareAtCents != null && (!Number.isInteger(input.compareAtCents) || input.compareAtCents < 0))
    return "Invalid compare-at price"
  if (!Number.isInteger(input.stock) || input.stock < 0) return "Invalid stock"
  if (input.technology != null && !TECHNOLOGIES.includes(input.technology)) return "Invalid technology"
  if (!AVAILABILITIES.includes(input.availability)) return "Invalid availability"
  return null
}

function toProductValues(input: ProductDetailsInput) {
  const bv = input.buildVolumeMm
  const validBv = bv && [bv.x, bv.y, bv.z].every((n) => Number.isFinite(n) && n > 0) ? bv : null
  return {
    name: input.name.trim(),
    brandSlug: input.brandSlug,
    category: input.category,
    technology: input.technology ?? null,
    useCases: (input.useCases ?? []).filter((u) => USE_CASES.includes(u)),
    priceCents: input.priceCents,
    compareAtCents: input.compareAtCents && input.compareAtCents > 0 ? input.compareAtCents : null,
    availability: input.availability,
    stock: input.stock,
    gtin: input.gtin?.trim() || null,
    ean: input.ean?.trim() || null,
    mpn: input.mpn?.trim() || "",
    shortDescription: input.shortDescription?.trim() || "",
    description: input.description?.trim() || "",
    highlights: (input.highlights ?? []).map((h) => h.trim()).filter(Boolean),
    specs: (input.specs ?? [])
      .filter((s) => s.label?.trim() && s.value?.trim())
      .map((s) => ({ key: s.key?.trim() || slugify(s.label), label: s.label.trim(), value: s.value.trim() })),
    images: (input.images ?? []).map((i) => i.trim()).filter(Boolean),
    featured: !!input.featured,
    bestseller: !!input.bestseller,
    weightKg: Number.isFinite(input.weightKg) && input.weightKg > 0 ? input.weightKg : 0,
    buildVolumeMm: validBv,
    updatedAt: new Date(),
  }
}

async function uniqueSlug(base: string): Promise<string> {
  const root = slugify(base) || "product"
  const existing = await db.select({ slug: products.slug }).from(products)
  const taken = new Set(existing.map((r) => r.slug))
  if (!taken.has(root)) return root
  let n = 2
  while (taken.has(`${root}-${n}`)) n++
  return `${root}-${n}`
}

export async function createProduct(
  input: ProductDetailsInput,
): Promise<{ ok: boolean; error?: string; slug?: string }> {
  await assertAdmin()
  const err = validateProduct(input)
  if (err) return { ok: false, error: err }
  const slug = await uniqueSlug(input.name)
  await db.insert(products).values({
    id: crypto.randomUUID(),
    slug,
    ...toProductValues(input),
    archived: false,
    createdAt: new Date(),
  })
  revalidatePath("/admin/catalog")
  revalidatePath("/", "layout")
  return { ok: true, slug }
}

export async function updateProductDetails(
  slug: string,
  input: ProductDetailsInput,
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()
  const err = validateProduct(input)
  if (err) return { ok: false, error: err }
  await db.update(products).set(toProductValues(input)).where(eq(products.slug, slug))
  revalidatePath("/admin/catalog")
  revalidatePath(`/admin/catalog/${slug}`)
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function setProductArchived(slug: string, archived: boolean): Promise<{ ok: boolean }> {
  await assertAdmin()
  await db.update(products).set({ archived, updatedAt: new Date() }).where(eq(products.slug, slug))
  revalidatePath("/admin/catalog")
  revalidatePath("/", "layout")
  return { ok: true }
}

export async function getProductForEdit(slug: string): Promise<AdminProductDetail | null> {
  await assertAdmin()
  return getAdminProductBySlug(slug)
}

/* -------------------------------- orders ------------------------------- */

export async function setOrderStatus(orderId: string, status: OrderStatus): Promise<{ ok: boolean }> {
  await assertAdmin()
  await updateOrderStatus(orderId, status)
  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}

export async function setOrderTracking(
  orderId: string,
  input: { trackingNumber: string; trackingUrl?: string; carrier?: string },
): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()

  const trackingNumber = input.trackingNumber.trim()
  if (!trackingNumber) {
    return { ok: false, error: "Tracking number is required" }
  }
  const trackingUrl = input.trackingUrl?.trim() || undefined
  if (trackingUrl && !/^https?:\/\//i.test(trackingUrl)) {
    return { ok: false, error: "Tracking link must start with http:// or https://" }
  }

  const order = await updateOrderTracking(orderId, {
    trackingNumber,
    trackingUrl,
    carrier: input.carrier?.trim() || undefined,
  })

  revalidatePath("/admin/orders")
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}

/* ------------------------------- messages ------------------------------ */

export async function setMessageStatus(id: string, status: ContactStatus): Promise<{ ok: boolean }> {
  await assertAdmin()
  await updateMessageStatus(id, status)
  revalidatePath("/admin/messages")
  return { ok: true }
}

/* ------------------------------- live chat ------------------------------ */

export async function listChatConversations() {
  await assertAdmin()
  return listConversationsForAdmin()
}

export async function getUnreadChatCount(): Promise<number> {
  await assertAdmin()
  return getUnreadConversationCount()
}

export async function getChatThread(conversationId: string) {
  await assertAdmin()
  const messages = await getMessagesForConversation(conversationId)
  await markReadForAdmin(conversationId)
  return messages
}

export async function sendAdminReply(conversationId: string, text: string): Promise<{ ok: boolean; error?: string }> {
  await assertAdmin()
  const content = text.trim().slice(0, 4000)
  if (!content) return { ok: false, error: "Message is empty" }

  await insertMessage(conversationId, "admin", content)
  await setConversationMode(conversationId, "human")
  await touchConversation(conversationId, { unreadForAdmin: false })
  revalidatePath("/admin/chat")
  return { ok: true }
}

export async function setChatMode(conversationId: string, mode: ChatMode): Promise<{ ok: boolean }> {
  await assertAdmin()
  await setConversationMode(conversationId, mode)
  revalidatePath("/admin/chat")
  return { ok: true }
}
