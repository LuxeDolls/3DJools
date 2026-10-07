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

/** Latest birth date that is already 18, as YYYY-MM-DD in the local calendar. */
export function adultDobLimit(now = new Date()): string {
  const limit = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate())
  const month = String(limit.getMonth() + 1).padStart(2, "0")
  const day = String(limit.getDate()).padStart(2, "0")
  return `${limit.getFullYear()}-${month}-${day}`
}

/** YYYY-MM-DD, a real date, and at least 18 years old. */
export function isAdultDateOfBirth(value: string, now = new Date()): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const [year, month, day] = value.split("-").map(Number)
  if (year < 1900) return false
  const born = new Date(Date.UTC(year, month - 1, day))
  if (born.getUTCFullYear() !== year || born.getUTCMonth() !== month - 1 || born.getUTCDate() !== day) return false
  const adultOn = new Date(Date.UTC(now.getUTCFullYear() - 18, now.getUTCMonth(), now.getUTCDate()))
  return born.getTime() <= adultOn.getTime()
}

/** Notes are `key=value` pairs split on `;`, so those characters cannot appear in a value. */
export function noteSafeName(value: string): string {
  return value.replace(/[;=\r\n]/g, " ").replace(/\s+/g, " ").trim().slice(0, 120)
}
