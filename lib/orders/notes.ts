// `orders.notes` stores a small set of key=value pairs joined by ";" (e.g.
// "member_discount_cents=500;crypto_coin=usdt_trc20"). This keeps the schema
// unchanged while letting checkout attach extra context to an order.
export function parseOrderNotes(notes: string | null | undefined): Record<string, string> {
  if (!notes) return {}
  const result: Record<string, string> = {}
  for (const part of notes.split(";")) {
    const [key, ...rest] = part.split("=")
    const value = rest.join("=").trim()
    if (key?.trim() && value) result[key.trim()] = value
  }
  return result
}

export function buildOrderNotes(fields: Record<string, string | undefined>): string | undefined {
  const parts = Object.entries(fields)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value}`)
  return parts.length ? parts.join(";") : undefined
}
