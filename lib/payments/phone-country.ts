/** Calling codes for the countries offered at checkout. The Stripe account is US, so its payment page opens on +1 unless we send a full international number. */

const CALLING_CODES: Record<string, string> = {
  Austria: "43",
  Belgium: "32",
  Bulgaria: "359",
  Croatia: "385",
  Cyprus: "357",
  Czechia: "420",
  Denmark: "45",
  Estonia: "372",
  Finland: "358",
  France: "33",
  Germany: "49",
  Greece: "30",
  Hungary: "36",
  Ireland: "353",
  Italy: "39",
  Latvia: "371",
  Lithuania: "370",
  Luxembourg: "352",
  Malta: "356",
  Netherlands: "31",
  Norway: "47",
  Poland: "48",
  Portugal: "351",
  Romania: "40",
  Slovakia: "421",
  Slovenia: "386",
  Spain: "34",
  Sweden: "46",
  Switzerland: "41",
  "United Kingdom": "44",
}

const COUNTRY_CODES: Record<string, string> = {
  Austria: "AT",
  Belgium: "BE",
  Bulgaria: "BG",
  Croatia: "HR",
  Cyprus: "CY",
  Czechia: "CZ",
  Denmark: "DK",
  Estonia: "EE",
  Finland: "FI",
  France: "FR",
  Germany: "DE",
  Greece: "GR",
  Hungary: "HU",
  Ireland: "IE",
  Italy: "IT",
  Latvia: "LV",
  Lithuania: "LT",
  Luxembourg: "LU",
  Malta: "MT",
  Netherlands: "NL",
  Norway: "NO",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Slovakia: "SK",
  Slovenia: "SI",
  Spain: "ES",
  Sweden: "SE",
  Switzerland: "CH",
  "United Kingdom": "GB",
}

export function callingCode(country: string): string {
  return CALLING_CODES[country.trim()] ?? ""
}

export function countryIso(country: string): string {
  return COUNTRY_CODES[country.trim()] ?? ""
}

/** Local number plus the delivery-country code, as +31612345678. */
export function toE164Phone(raw: string | undefined, country: string): string | null {
  const code = callingCode(country)
  if (!raw?.trim() || !code) return null
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("00")) digits = digits.slice(2)
  const national = digits.startsWith(code) && digits.length - code.length >= 6
    ? digits.slice(code.length)
    : digits.replace(/^0+/, "")
  if (national.length < 6 || national.length > 12) return null
  const phone = `+${code}${national}`
  return /^\+[1-9]\d{7,15}$/.test(phone) ? phone : null
}
