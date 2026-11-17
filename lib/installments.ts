import type { ScheduleEntry } from "./db/schema"

/**
 * Installment plan constants. The plan is 3 equal payments over ~4 weeks:
 * a 1/3 down payment due at approval, then two further 1/3 payments
 * every two weeks.
 */
export const INSTALLMENT_COUNT = 3
export const DOWN_PAYMENT_RATIO = 1 / 3
export const INSTALLMENT_INTERVAL_DAYS = 14

/** Installments are only available for orders of €1,000 or more. */
export const MIN_INSTALLMENT_TOTAL_CENTS = 100_000

/** Set to true to allow 3x interest-free installment applications. */
export const INSTALLMENTS_CHECKOUT_ENABLED = true

export function qualifiesForInstallments(totalCents: number): boolean {
  return INSTALLMENTS_CHECKOUT_ENABLED && totalCents >= MIN_INSTALLMENT_TOTAL_CENTS
}

/**
 * Split a total (in cents) into 3 payments that sum EXACTLY to the total.
 * Each payment targets 1/3; any rounding remainder is absorbed by the down
 * payment so the customer is never over- or under-charged in aggregate.
 */
export function computeInstallmentAmounts(totalCents: number): {
  downPaymentCents: number
  installmentCents: number[]
  remainingCents: number
} {
  const perPayment = Math.floor(totalCents / INSTALLMENT_COUNT)
  const laterPayments = Array.from({ length: INSTALLMENT_COUNT - 1 }, () => perPayment)
  const laterSum = laterPayments.reduce((a, b) => a + b, 0)
  const downPaymentCents = totalCents - laterSum
  return {
    downPaymentCents,
    installmentCents: laterPayments,
    remainingCents: laterSum,
  }
}

function addDays(base: Date, days: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  return d
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

/**
 * Build the full 4-entry schedule from a total. `startDate` defaults to today;
 * the down payment is due immediately, the rest every 14 days.
 */
export function buildSchedule(totalCents: number, startDate: Date = new Date()): ScheduleEntry[] {
  const { downPaymentCents, installmentCents } = computeInstallmentAmounts(totalCents)
  const schedule: ScheduleEntry[] = [
    {
      index: 0,
      label: "down_payment",
      dueDate: toISODate(startDate),
      amountCents: downPaymentCents,
      paid: false,
      status: "unpaid",
    },
  ]
  installmentCents.forEach((amountCents, i) => {
    schedule.push({
      index: i + 1,
      label: "installment",
      dueDate: toISODate(addDays(startDate, INSTALLMENT_INTERVAL_DAYS * (i + 1))),
      amountCents,
      paid: false,
      status: "unpaid",
    })
  })
  return schedule
}

/** Human-readable, reasonably unique application reference, e.g. INST-7F3K9Q. */
export function generateApplicationRef(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  let out = ""
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)]
  }
  return `INST-${out}`
}
