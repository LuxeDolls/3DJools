import "server-only"

import { pool } from "@/lib/db"

export type BlockedCustomer = {
  email: string
  reason: string | null
  orderNumber: string | null
  blockedAt: string
}

export type BlockedIp = {
  ip: string
  reason: string | null
  orderNumber: string | null
  email: string | null
  blockedAt: string
}

export type BlockedCharacteristic = {
  id: string
  kind: "name" | "address" | "postal_code" | "city" | "email_pattern"
  value: string
  reason: string | null
  orderNumber: string | null
  blockedAt: string
}

export type CustomerBlockCheckInput = {
  email?: string | null
  ip?: string | null
  firstName?: string | null
  lastName?: string | null
  fullName?: string | null
  address?: string | null
  city?: string | null
  postalCode?: string | null
  country?: string | null
  orderNumber?: string | null
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function normalizeTextCharacteristic(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ")
}

export function extractClientRequestMeta(h: Headers): {
  ip: string | null
  ipCountry: string | null
  userAgent: string | null
} {
  const rawIp =
    h.get("x-vercel-forwarded-for") ??
    h.get("x-forwarded-for") ??
    h.get("x-real-ip") ??
    ""
  const firstIp = rawIp
    .split(",")[0]
    ?.trim()
    .replace(/^::ffff:/i, "")
    .slice(0, 64)
  const ip = firstIp && /^[0-9a-fA-F.:]{3,64}$/.test(firstIp) ? firstIp : null
  const rawCountry = h.get("x-vercel-ip-country") ?? h.get("x-country") ?? ""
  const ipCountry = rawCountry.trim().toUpperCase().slice(0, 8) || null
  const rawUa = h.get("user-agent") ?? ""
  const userAgent = rawUa.trim().replace(/[;=]/g, " ").slice(0, 180) || null
  return { ip, ipCountry, userAgent }
}

let ready: Promise<void> | null = null

function ensureTable(): Promise<void> {
  ready ??= pool
    .query(`
      CREATE TABLE IF NOT EXISTS blocked_customers (
        email text PRIMARY KEY,
        reason text,
        order_number text,
        blocked_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS blocked_ips (
        ip text PRIMARY KEY,
        reason text,
        order_number text,
        email text,
        blocked_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS blocked_characteristics (
        id text PRIMARY KEY,
        kind text NOT NULL,
        value text NOT NULL,
        reason text,
        order_number text,
        blocked_at timestamptz NOT NULL DEFAULT now()
      );
    `)
    .then(() => undefined)
    .catch((err) => {
      ready = null
      throw err
    })
  return ready
}

// Known scammer / keyboard-mash tokens and disposable domains observed in abuse attempts
const BLOCKED_EMAIL_SUBSTRINGS = ["holyscam", "adjhifhadfa", "dowococ797"]
const BLOCKED_EMAIL_DOMAINS = new Set(["micropaste.com", "agaexpress.com"])
const BLOCKED_EXACT_NAMES = new Set(["adg", "adg adg", "adga", "asdf", "asdf asdf", "asdf lkajslk", "test test"])
const BLOCKED_EXACT_ADDRESSES = new Set(["adga", "adg", "123", "asdf", "alskdjf 3"])
const BLOCKED_EXACT_POSTAL_CODES = new Set(["212143", "123", "123456", "00000", "0000"])
const BLOCKED_EXACT_CITIES = new Set(["123", "adg", "adga", "alksfjkl", "asdf"])

// Keyboard-row mash detector for short gibberish names/addresses (e.g. "adg", "adga", "adjhifhadfa", "alskdjf")
function looksLikeKeyboardMash(raw: string): boolean {
  const s = normalizeTextCharacteristic(raw).replace(/[^a-z]/g, "")
  if (!s) return false
  if (s === "adg" || s === "adga" || s.startsWith("adg") || s.includes("adjhif") || s.includes("alskdj")) {
    return true
  }
  // 5+ letters with no vowels at all (including y)
  if (s.length >= 4 && !/[aeiouyäöü]/i.test(s)) {
    return true
  }
  // 6+ characters composed exclusively of home-row letters [asdfghjkl]
  if (s.length >= 6 && /^[asdfghjkl]+$/.test(s)) {
    return true
  }
  return false
}

/**
 * Checks whether checkout / order actions should be refused based on:
 * 1. Client IP address (in `blocked_ips`)
 * 2. Customer email (in `blocked_customers` or scam email pattern)
 * 3. Buyer characteristics (in `blocked_characteristics` or gibberish/scam heuristics:
 *    e.g. name "adg adg", address "adga", postal code "212143", numeric city "123")
 *
 * When a blocked email or characteristic is matched and `input.ip` is present,
 * the client's IP is automatically persisted into `blocked_ips` so future attempts
 * with rotated emails/names from the same IP are also blocked immediately.
 */
export async function checkCustomerBlock(
  input: CustomerBlockCheckInput,
): Promise<{ blocked: boolean; reason?: string }> {
  await ensureTable()

  const ip = input.ip?.trim() || null
  const email = input.email ? normalizeEmail(input.email) : ""
  const firstName = normalizeTextCharacteristic(input.firstName)
  const lastName = normalizeTextCharacteristic(input.lastName)
  const fullName = normalizeTextCharacteristic(
    input.fullName ?? ([input.firstName, input.lastName].filter(Boolean).join(" ") || ""),
  )
  const address = normalizeTextCharacteristic(input.address)
  const city = normalizeTextCharacteristic(input.city)
  const postalCode = normalizeTextCharacteristic(input.postalCode)
  const country = normalizeTextCharacteristic(input.country)

  // 1. Check IP blocklist first
  if (ip) {
    const ipRes = await pool.query<{ reason: string | null }>(
      "SELECT reason FROM blocked_ips WHERE ip = $1 LIMIT 1",
      [ip],
    )
    if ((ipRes.rowCount ?? 0) > 0) {
      return { blocked: true, reason: ipRes.rows[0]?.reason ?? "blocked_ip" }
    }
  }

  let matchedReason: string | null = null

  // 2. Check Email blocklist & patterns
  if (email && email.includes("@")) {
    const emailDomain = email.split("@")[1] ?? ""
    if (BLOCKED_EMAIL_DOMAINS.has(emailDomain)) {
      matchedReason = `Blocked disposable domain: ${emailDomain}`
    } else if (BLOCKED_EMAIL_SUBSTRINGS.some((sub) => email.includes(sub))) {
      matchedReason = `Blocked scam email pattern: ${email}`
    } else {
      const emailRes = await pool.query<{ reason: string | null }>(
        "SELECT reason FROM blocked_customers WHERE email = $1 LIMIT 1",
        [email],
      )
      if ((emailRes.rowCount ?? 0) > 0) {
        matchedReason = emailRes.rows[0]?.reason ?? "blocked_email"
      }
    }
  }

  // 3. Check exact & heuristic buyer characteristics
  if (!matchedReason) {
    if (
      (fullName && BLOCKED_EXACT_NAMES.has(fullName)) ||
      (firstName && BLOCKED_EXACT_NAMES.has(firstName)) ||
      (lastName && BLOCKED_EXACT_NAMES.has(lastName))
    ) {
      matchedReason = `Blocked buyer name characteristic: ${fullName || firstName}`
    } else if (firstName && lastName && firstName === lastName && firstName.length <= 4) {
      matchedReason = `Blocked duplicate short name: ${firstName} ${lastName}`
    } else if (
      (firstName && looksLikeKeyboardMash(firstName)) ||
      (lastName && looksLikeKeyboardMash(lastName))
    ) {
      matchedReason = `Blocked gibberish name: ${fullName}`
    } else if (address && (BLOCKED_EXACT_ADDRESSES.has(address) || looksLikeKeyboardMash(address))) {
      matchedReason = `Blocked address characteristic: ${address}`
    } else if (address && (/^\d+$/.test(address) || (address.length < 4 && !/\d/.test(address)))) {
      matchedReason = `Blocked invalid short address: ${address}`
    } else if (postalCode && BLOCKED_EXACT_POSTAL_CODES.has(postalCode)) {
      matchedReason = `Blocked postal code characteristic: ${postalCode}`
    } else if (
      postalCode &&
      /^\d{6}$/.test(postalCode) &&
      ["germany", "netherlands", "belgium", "france", "austria", "italy", "spain", "luxembourg", "denmark"].includes(
        country,
      )
    ) {
      matchedReason = `Blocked invalid 6-digit postal code ${postalCode} for ${country}`
    } else if (city && (BLOCKED_EXACT_CITIES.has(city) || /^\d+$/.test(city) || looksLikeKeyboardMash(city))) {
      matchedReason = `Blocked city characteristic: ${city}`
    }
  }

  // 4. Check DB-stored blocked_characteristics
  if (!matchedReason) {
    const candidateValues = [fullName, firstName, lastName, address, postalCode, city].filter(Boolean)
    if (candidateValues.length > 0) {
      const charRes = await pool.query<{ kind: string; value: string; reason: string | null }>(
        "SELECT kind, value, reason FROM blocked_characteristics WHERE value = ANY($1::text[]) LIMIT 1",
        [candidateValues],
      )
      if ((charRes.rowCount ?? 0) > 0) {
        const row = charRes.rows[0]
        matchedReason = row?.reason ?? `Blocked characteristic (${row?.kind}: ${row?.value})`
      }
    }
  }

  if (matchedReason) {
    // Auto-record the offending IP and email so even if they change fields next time, they stay blocked
    if (ip) {
      await blockIpAddress(ip, {
        reason: `Auto-blocked on match: ${matchedReason}`,
        email: email || undefined,
        orderNumber: input.orderNumber ?? undefined,
      }).catch(() => undefined)
    }
    if (email && email.includes("@")) {
      await blockCustomer(email, {
        reason: matchedReason,
        orderNumber: input.orderNumber ?? undefined,
      }).catch(() => undefined)
    }
    return { blocked: true, reason: matchedReason }
  }

  return { blocked: false }
}

/** Whether checkout should be refused for this email (and optional IP). Used at order creation time. */
export async function isCustomerBlocked(email: string, ip?: string | null): Promise<boolean> {
  const res = await checkCustomerBlock({ email, ip })
  return res.blocked
}

/** Blocks an email from placing new orders. `orderNumber` records which order triggered the block, if any. */
export async function blockCustomer(email: string, input: { reason?: string; orderNumber?: string } = {}): Promise<void> {
  const key = normalizeEmail(email)
  if (!key.includes("@")) throw new Error("Invalid email")
  await ensureTable()
  await pool.query(
    `INSERT INTO blocked_customers (email, reason, order_number, blocked_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason, order_number = COALESCE(EXCLUDED.order_number, blocked_customers.order_number), blocked_at = now()`,
    [key, input.reason?.trim() || null, input.orderNumber ?? null],
  )
}

/** Blocks an IP address from placing orders or triggering payment confirmations. */
export async function blockIpAddress(
  ip: string,
  input: { reason?: string; orderNumber?: string; email?: string } = {},
): Promise<void> {
  const cleanIp = ip.trim().replace(/^::ffff:/i, "").slice(0, 64)
  if (!cleanIp || !/^[0-9a-fA-F.:]{3,64}$/.test(cleanIp)) return
  await ensureTable()
  await pool.query(
    `INSERT INTO blocked_ips (ip, reason, order_number, email, blocked_at)
     VALUES ($1, $2, $3, $4, now())
     ON CONFLICT (ip) DO UPDATE SET
       reason = COALESCE(EXCLUDED.reason, blocked_ips.reason),
       order_number = COALESCE(EXCLUDED.order_number, blocked_ips.order_number),
       email = COALESCE(EXCLUDED.email, blocked_ips.email),
       blocked_at = now()`,
    [
      cleanIp,
      input.reason?.trim() || null,
      input.orderNumber ?? null,
      input.email ? normalizeEmail(input.email) : null,
    ],
  )
}

/** Blocks specific shipping/buyer characteristics (name, address, postal_code, city, email_pattern). */
export async function blockCharacteristic(
  kind: BlockedCharacteristic["kind"],
  value: string,
  input: { reason?: string; orderNumber?: string } = {},
): Promise<void> {
  const norm = normalizeTextCharacteristic(value)
  if (!norm || norm.length < 2) return
  const id = `${kind}:${norm}`
  await ensureTable()
  await pool.query(
    `INSERT INTO blocked_characteristics (id, kind, value, reason, order_number, blocked_at)
     VALUES ($1, $2, $3, $4, $5, now())
     ON CONFLICT (id) DO UPDATE SET
       reason = COALESCE(EXCLUDED.reason, blocked_characteristics.reason),
       order_number = COALESCE(EXCLUDED.order_number, blocked_characteristics.order_number),
       blocked_at = now()`,
    [id, kind, norm, input.reason?.trim() || null, input.orderNumber ?? null],
  )
}

export async function unblockCustomer(email: string): Promise<void> {
  const key = normalizeEmail(email)
  await ensureTable()
  await pool.query("DELETE FROM blocked_customers WHERE email = $1", [key])
}

export async function listBlockedCustomers(): Promise<BlockedCustomer[]> {
  await ensureTable()
  const res = await pool.query<{ email: string; reason: string | null; order_number: string | null; blocked_at: string }>(
    "SELECT email, reason, order_number, blocked_at FROM blocked_customers ORDER BY blocked_at DESC",
  )
  return res.rows.map((row) => ({
    email: row.email,
    reason: row.reason,
    orderNumber: row.order_number,
    blockedAt: row.blocked_at,
  }))
}
