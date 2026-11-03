import "server-only"

import { COMPANY } from "@/lib/company"
import { countryCode } from "@/lib/payments/country-codes"
import {
  SKRILL_CHECKOUT_ENABLED,
  SKRILL_CURRENCY,
  SKRILL_HOSTED_URL,
  SKRILL_RECEIVING_EMAIL,
  skrillMethodError,
  type SkrillMethod,
} from "@/lib/payments/skrill-availability"

const ISO2_TO_ALPHA3: Record<string, string> = {
  AT: "AUT",
  BE: "BEL",
  BG: "BGR",
  HR: "HRV",
  CY: "CYP",
  CZ: "CZE",
  DK: "DNK",
  EE: "EST",
  FI: "FIN",
  FR: "FRA",
  DE: "DEU",
  GR: "GRC",
  HU: "HUN",
  IE: "IRL",
  IT: "ITA",
  LV: "LVA",
  LT: "LTU",
  LU: "LUX",
  MT: "MLT",
  NL: "NLD",
  NO: "NOR",
  PL: "POL",
  PT: "PRT",
  RO: "ROU",
  SK: "SVK",
  SI: "SVN",
  ES: "ESP",
  SE: "SWE",
  CH: "CHE",
  GB: "GBR",
}

const DETAIL_LABELS: Record<string, string> = {
  en: "Order",
  de: "Bestellung",
  fr: "Commande",
  it: "Ordine",
  es: "Pedido",
  nl: "Bestelling",
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SID_REGEX = /^[0-9a-fA-F]{32}$/

export function skrillSecretWord(): string {
  return process.env.SKRILL_SECRET_WORD?.trim() ?? ""
}

export function skrillConfigured(): boolean {
  return SKRILL_CHECKOUT_ENABLED && Boolean(skrillSecretWord())
}

export function isSkrillTransactionId(value: string | null | undefined): boolean {
  return UUID_REGEX.test(value?.trim() ?? "")
}

export function isSkrillSessionId(value: string | null | undefined): boolean {
  return SID_REGEX.test(value?.trim() ?? "")
}

export function appendSkrillTransactionId(stored: string | undefined, id: string): string {
  const ids = (stored ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
  if (!ids.includes(id)) ids.push(id)
  return ids.join(",")
}

export function skrillCountryAlpha3(country: string | null | undefined): string | null {
  const trimmed = country?.trim() ?? ""
  if (!trimmed) return null
  const upper = trimmed.toUpperCase()
  if (/^[A-Z]{3}$/.test(upper) && Object.values(ISO2_TO_ALPHA3).includes(upper)) {
    return upper
  }
  if (ISO2_TO_ALPHA3[upper]) {
    return ISO2_TO_ALPHA3[upper]
  }
  const iso2 = countryCode(trimmed)
  return iso2 ? (ISO2_TO_ALPHA3[iso2] ?? null) : null
}

export function skrillLanguage(locale: string | null | undefined): string {
  const code = locale?.trim().slice(0, 2).toLowerCase() ?? "en"
  if (["en", "de", "fr", "it", "es", "nl"].includes(code)) {
    return code.toUpperCase()
  }
  return "EN"
}

export function skrillDetailLabel(locale: string | null | undefined): string {
  const code = locale?.trim().slice(0, 2).toLowerCase() ?? "en"
  return DETAIL_LABELS[code] ?? DETAIL_LABELS.en
}

export type CreateSkrillPaymentInput = {
  method: SkrillMethod
  orderNumber: string
  transactionId: string
  amountCents: number
  locale: string
  email: string
  firstName: string
  lastName: string
  country: string
}

export async function createSkrillPayment(
  input: CreateSkrillPaymentInput,
): Promise<{ sid: string; redirectUrl: string }> {
  if (!skrillConfigured()) throw new Error("skrill_not_configured")
  const methodErr = skrillMethodError(input.method, input.amountCents, input.country)
  if (methodErr) throw new Error(methodErr)
  if (!isSkrillTransactionId(input.transactionId)) throw new Error("skrill_bad_transaction_id")
  const countryAlpha3 = skrillCountryAlpha3(input.country)
  if (!countryAlpha3) throw new Error("skrill_bad_country")

  const orderNumber = input.orderNumber.trim()
  const amount = (input.amountCents / 100).toFixed(2)
  const paymentMethods = input.method === "skrill_ideal" ? "IDL" : "VSA,MSC"

  const params = new URLSearchParams({
    prepare_only: "1",
    pay_to_email: SKRILL_RECEIVING_EMAIL,
    transaction_id: input.transactionId.trim(),
    amount,
    currency: SKRILL_CURRENCY,
    payment_methods: paymentMethods,
    country: countryAlpha3,
    language: skrillLanguage(input.locale),
    pay_from_email: input.email.trim().slice(0, 100),
    firstname: input.firstName.trim().slice(0, 50) || "Customer",
    lastname: input.lastName.trim().slice(0, 50) || "Customer",
    recipient_description: COMPANY.tradingName,
    detail1_description: skrillDetailLabel(input.locale),
    detail1_text: `${COMPANY.tradingName} ${orderNumber}`.slice(0, 240),
    status_url: `${COMPANY.url}/api/payments/skrill/webhook`,
    return_url: `${COMPANY.url}/api/payments/skrill/return?order=${encodeURIComponent(orderNumber)}`,
    cancel_url: `${COMPANY.url}/api/payments/skrill/return?order=${encodeURIComponent(orderNumber)}&cancelled=1`,
  })

  const response = await fetch(SKRILL_HOSTED_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  })

  const rawText = (await response.text()).trim()
  if (!response.ok || !isSkrillSessionId(rawText)) {
    console.error("[v0] Skrill session prepare failed", response.status)
    throw new Error("skrill_prepare_failed")
  }

  return {
    sid: rawText,
    redirectUrl: `${SKRILL_HOSTED_URL}?sid=${encodeURIComponent(rawText)}`,
  }
}
