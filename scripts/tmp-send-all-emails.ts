import { sendWelcomeEmail } from "@/lib/email/auth-emails"
import {
  sendOrderConfirmationEmail,
  sendOrderShippedEmail,
  sendOrderStatusUpdateEmail,
  sendPaymentReminderEmail,
  sendPaymentUnderReviewEmail,
  sendShipmentEventEmail,
} from "@/lib/email/order-emails"
import {
  sendInstallmentApplicationApprovedEmail,
  sendInstallmentApplicationReceivedEmail,
  sendInstallmentApplicationRejectedEmail,
  sendInstallmentPaymentStatusEmail,
} from "@/lib/email/installment-emails"
import { SHIPMENT_STATUSES } from "@/lib/shipping/tracking"

const TO = "1mlndollars2@gmail.com"

function order(overrides: Record<string, unknown> = {}): any {
  return {
    id: "ord_test",
    orderNumber: "3DE-20261118-TEST1",
    email: TO,
    status: "awaiting_payment",
    paymentMethod: "card",
    subtotalCents: 156000,
    shippingCents: 0,
    totalCents: 156000,
    notes: null,
    shippingName: "Adam El Fikri",
    shippingAddress1: "Turnhoutsebaan 243",
    shippingAddress2: null,
    shippingPostalCode: "2100",
    shippingCity: "Antwerpen",
    shippingCountry: "Belgium",
    carrier: "3DEureka Courier",
    trackingNumber: "3DE123456789BE",
    trackingUrl: null,
    createdAt: new Date().toISOString(),
    items: [
      { productName: "Bambu Lab H2D", quantity: 1, lineTotalCents: 146300 },
      { productName: "Bambu Lab PLA Basic 1 kg", quantity: 2, lineTotalCents: 9700 },
    ],
    ...overrides,
  }
}

function app(schedule: Array<"unpaid" | "reviewing" | "paid">): any {
  const amounts = [52000, 52000, 52000]
  return {
    applicationRef: "INS-20261118-TEST1",
    email: TO,
    firstName: "Adam",
    totalAmountCents: 156000,
    downPaymentCents: 52000,
    remainingCents: 104000,
    schedule: schedule.map((status, index) => ({
      index,
      label: index === 0 ? "down_payment" : "installment",
      dueDate: new Date(Date.now() + index * 14 * 86400000).toISOString(),
      amountCents: amounts[index],
      paid: status === "paid",
      status,
    })),
  }
}

const jobs: Array<[string, () => Promise<{ sent: boolean; error?: string; skipped?: boolean }>]> = [
  ["Welcome", () => sendWelcomeEmail({ name: "Adam", email: TO })],
  ["Confirmation · card awaiting", () => sendOrderConfirmationEmail(order())],
  ["Confirmation · Open Banking awaiting", () => sendOrderConfirmationEmail(order({ paymentMethod: "open_banking" }))],
  ["Confirmation · SEPA awaiting", () => sendOrderConfirmationEmail(order({ paymentMethod: "bank_transfer" }))],
  ["Confirmation · installments", () => sendOrderConfirmationEmail(order({ paymentMethod: "installments", status: "pending" }))],
  ["Confirmation · paid", () => sendOrderConfirmationEmail(order({ status: "paid", notes: "member_discount_cents=7800", totalCents: 148200 }))],
  ["Reminder · card", () => sendPaymentReminderEmail(order())],
  ["Reminder · Open Banking", () => sendPaymentReminderEmail(order({ paymentMethod: "open_banking" }))],
  ["Reminder · SEPA", () => sendPaymentReminderEmail(order({ paymentMethod: "bank_transfer" }))],
  ["Payment under review", () => sendPaymentUnderReviewEmail(order({ paymentMethod: "bank_transfer", status: "reviewing_payment" }))],
  ["Status · paid", () => sendOrderStatusUpdateEmail(order({ status: "paid" }), "reviewing_payment")],
  ["Status · partially paid", () => sendOrderStatusUpdateEmail(order({ status: "partially_paid", paymentMethod: "installments" }), "pending")],
  ["Status · processing", () => sendOrderStatusUpdateEmail(order({ status: "processing" }), "paid")],
  ["Status · reviewing (generic)", () => sendOrderStatusUpdateEmail(order({ status: "reviewing_payment", trackingNumber: null }), "awaiting_payment")],
  ["Status · delivered", () => sendOrderStatusUpdateEmail(order({ status: "delivered" }), "shipped")],
  ["Status · cancelled", () => sendOrderStatusUpdateEmail(order({ status: "cancelled" }), "awaiting_payment")],
  ["Status · refunded", () => sendOrderStatusUpdateEmail(order({ status: "refunded" }), "delivered")],
  ["Shipped", () => sendOrderShippedEmail(order({ status: "shipped", trackingUrl: "https://3deureka.com/en/track/3DE123456789BE" }))],
  ...SHIPMENT_STATUSES.map(
    (status) =>
      [
        `Shipment EN · ${status}`,
        () =>
          sendShipmentEventEmail(order({ status: "shipped", shippingCountry: "United Kingdom" }), {
            status,
            location: "Antwerpen, BE",
            comment: status === "delayed" || status === "address_issue" ? "Sample courier comment for this checkpoint." : null,
            carrier: "3DEureka Courier",
          }),
      ] as [string, () => Promise<any>],
  ),
  ...(["Germany", "France", "Italy", "Spain", "Netherlands"] as const).map(
    (country) =>
      [
        `Shipment ${country} · in_transit`,
        () =>
          sendShipmentEventEmail(order({ status: "shipped", shippingCountry: country }), {
            status: "in_transit",
            location: "Antwerpen, BE",
            comment: null,
            carrier: "3DEureka Courier",
          }),
      ] as [string, () => Promise<any>],
  ),
  ["Installments · received", () => sendInstallmentApplicationReceivedEmail(app(["unpaid", "unpaid", "unpaid"]))],
  ["Installments · approved", () => sendInstallmentApplicationApprovedEmail(app(["unpaid", "unpaid", "unpaid"]))],
  ["Installments · down payment reviewing", () => sendInstallmentPaymentStatusEmail(app(["reviewing", "unpaid", "unpaid"]), 0, "Payment under review")],
  ["Installments · down payment paid", () => sendInstallmentPaymentStatusEmail(app(["paid", "unpaid", "unpaid"]), 0, "Partially paid")],
  ["Installments · final payment paid", () => sendInstallmentPaymentStatusEmail(app(["paid", "paid", "paid"]), 2, "Paid")],
  ["Installments · rejected", () => sendInstallmentApplicationRejectedEmail(app(["unpaid", "unpaid", "unpaid"]))],
]

async function main() {
  let ok = 0
  for (const [index, [label, run]] of jobs.entries()) {
    const result = await run()
    if (result.sent) ok++
    console.log(`${index + 1}/${jobs.length} ${label}: ${result.sent ? "sent" : `FAILED ${result.error ?? "skipped"}`}`)
    await new Promise((r) => setTimeout(r, 3000))
  }
  console.log(`done ${ok}/${jobs.length}`)
}

main()
