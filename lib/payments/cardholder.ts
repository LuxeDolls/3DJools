/** Cardholder details collected before a hosted card page. The card number stays there. */

export function isCardPayment(payment: string): boolean {
  return payment === "card" || payment === "alppay"
}

export function splitFullName(fullName: string): { firstName: string; lastName: string } | null {
  const parts = fullName.trim().replace(/\s+/g, " ").split(" ").filter(Boolean)
  if (parts.length < 2) return null
  return {
    firstName: parts.slice(0, -1).join(" ").slice(0, 128),
    lastName: parts[parts.length - 1].slice(0, 128),
  }
}

function realDate(year: number, month: number, day: number): string | null {
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const born = new Date(Date.UTC(year, month - 1, day))
  if (born.getUTCFullYear() !== year || born.getUTCMonth() !== month - 1 || born.getUTCDate() !== day) return null
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function dateSeparator(sample: string): "." | "/" | "-" {
  if (sample.includes(".")) return "."
  if (sample.includes("-")) return "-"
  return "/"
}

/** Inserts the site-language separator while the date is typed. */
export function maskBirthDate(raw: string, previous: string, separator: "." | "/" | "-"): string {
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw.trim())
  if (iso) return `${iso[3]}${separator}${iso[2]}${separator}${iso[1]}`

  const deleting = raw.length < previous.length
  let digits = raw.replace(/\D/g, "").slice(0, 8)
  const previousDigits = previous.replace(/\D/g, "")
  // Backspace on an inserted separator removes the digit before it too.
  if (deleting && previous.endsWith(separator) && digits === previousDigits) digits = digits.slice(0, -1)
  if (!digits) return ""

  const day = digits.slice(0, 2)
  const month = digits.slice(2, 4)
  const year = digits.slice(4, 8)
  let masked = day
  if (month || (!deleting && day.length === 2)) masked += `${separator}${month}`
  if (year || (!deleting && digits.length >= 4)) masked += `${separator}${year}`
  return masked
}

/** Day-first European date, or ISO, as YYYY-MM-DD. Digits without separators count too. */
export function toIsoDate(value: string): string | null {
  const trimmed = value.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  if (iso) return realDate(Number(iso[1]), Number(iso[2]), Number(iso[3]))
  const european = /^(\d{1,2})[./\-\s](\d{1,2})[./\-\s](\d{4})$/.exec(trimmed)
  if (european) return realDate(Number(european[3]), Number(european[2]), Number(european[1]))
  const digits = trimmed.replace(/\D/g, "")
  if (digits.length !== 8) return null
  // 07072007 is 7 July 2007. Only fall back to YYYYMMDD when the day-first year is impossible.
  return realDate(Number(digits.slice(4)), Number(digits.slice(2, 4)), Number(digits.slice(0, 2)))
    ?? realDate(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)), Number(digits.slice(6)))
}

/** A real date, at least 18 years old. Accepts YYYY-MM-DD or DD/MM/YYYY. */
export function isAdultDateOfBirth(value: string, now = new Date()): boolean {
  const iso = toIsoDate(value)
  if (!iso) return false
  const [year, month, day] = iso.split("-").map(Number)
  const born = new Date(Date.UTC(year, month - 1, day))
  const adultOn = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()))
  return born.getTime() <= adultOn.getTime()
}

/** Notes are `key=value` pairs split on `;`, so those characters cannot appear in a value. */
export function noteSafeName(value: string): string {
  return value.replace(/[;=\r\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)
}
