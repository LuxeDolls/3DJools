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

/** Day-first European date, or ISO, as YYYY-MM-DD. Never uses the browser locale. */
export function toIsoDate(value: string): string | null {
  const trimmed = value.trim()
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed)
  const european = /^(\d{1,2})[./-](\d{1,2})[./-](\d{4})$/.exec(trimmed)
  const year = Number(iso?.[1] ?? european?.[3])
  const month = Number(iso?.[2] ?? european?.[2])
  const day = Number(iso?.[3] ?? european?.[1])
  if (!iso && !european) return null
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return null
  const born = new Date(Date.UTC(year, month - 1, day))
  if (born.getUTCFullYear() !== year || born.getUTCMonth() !== month - 1 || born.getUTCDate() !== day) return null
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
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
