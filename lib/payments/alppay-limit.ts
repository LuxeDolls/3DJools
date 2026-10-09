import "server-only"

import { pool } from "@/lib/db"

const MAX_FAILURES = 3
const HOLD_MS = 24 * 60 * 60 * 1000

const FAILED_STATES = new Set([
  "DECLINED",
  "CANCELLED",
  "CANCELED",
  "EXPIRED",
  "TIMEOUT",
  "TIMED_OUT",
  "FAILED",
  "ERROR",
  "REJECTED",
  "VOIDED",
  "VOID",
  "ABANDONED",
])

const OPEN_STATES = new Set([
  "",
  "CHECKOUT",
  "PENDING",
  "AUTHORIZED",
  "PROCESSING",
  "AWAITING_WEBHOOK",
  "AWAITING_REDIRECT",
  "WAITING",
  "CREATED",
  "IN_PROGRESS",
  "COMPLETED",
])

/** Terminal card failures. Pending and completed payments are not attempts. */
export function isAlppayFailureState(state: string): boolean {
  const normalized = state.trim().toUpperCase()
  if (FAILED_STATES.has(normalized)) return true
  return normalized.length > 0 && !OPEN_STATES.has(normalized)
}

function customerEmail(email: string): string {
  return email.trim().toLowerCase()
}

let ready: Promise<void> | null = null

function ensureTables(): Promise<void> {
  ready ??= pool
    .query(`
      CREATE TABLE IF NOT EXISTS alppay_attempts (
        payment_id text PRIMARY KEY,
        email text NOT NULL,
        order_number text NOT NULL,
        state text NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      );
      CREATE TABLE IF NOT EXISTS alppay_holds (
        email text PRIMARY KEY,
        fail_count integer NOT NULL DEFAULT 0,
        hold_until timestamptz,
        updated_at timestamptz NOT NULL DEFAULT now()
      );
    `)
    .then(() => undefined)
    .catch((err) => {
      ready = null
      throw err
    })
  return ready
}

/** Active 24-hour pause after three unsuccessful AlpPay attempts, if any. */
export async function alppayHoldUntil(email: string): Promise<Date | null> {
  const key = customerEmail(email)
  if (!key.includes("@")) return null
  await ensureTables()
  const held = await pool.query<{ hold_until: Date }>(
    "SELECT hold_until FROM alppay_holds WHERE email = $1 AND hold_until > now()",
    [key],
  )
  return held.rows[0]?.hold_until ?? null
}

/**
 * Counts one unsuccessful payment once. The third failure pauses that email for 24 hours.
 * After the pause ends, the customer gets three fresh attempts.
 */
export async function recordAlppayFailure(input: {
  email: string
  paymentId: string
  orderNumber: string
  state: string
}): Promise<Date | null> {
  const key = customerEmail(input.email)
  const state = input.state.trim().toUpperCase().slice(0, 40)
  if (!key.includes("@") || !/^[a-zA-Z0-9]{32}$/.test(input.paymentId) || !isAlppayFailureState(state)) {
    return alppayHoldUntil(input.email)
  }
  await ensureTables()
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    const inserted = await client.query(
      `INSERT INTO alppay_attempts (payment_id, email, order_number, state)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (payment_id) DO NOTHING
       RETURNING payment_id`,
      [input.paymentId, key, input.orderNumber.slice(0, 40), state],
    )
    if ((inserted.rowCount ?? 0) === 0) {
      const held = await client.query<{ hold_until: Date }>(
        "SELECT hold_until FROM alppay_holds WHERE email = $1 AND hold_until > now()",
        [key],
      )
      await client.query("COMMIT")
      return held.rows[0]?.hold_until ?? null
    }

    await client.query(
      `INSERT INTO alppay_holds (email, fail_count, hold_until, updated_at)
       VALUES ($1, 0, NULL, now())
       ON CONFLICT (email) DO NOTHING`,
      [key],
    )
    const locked = await client.query<{ fail_count: number; hold_until: Date | null }>(
      "SELECT fail_count, hold_until FROM alppay_holds WHERE email = $1 FOR UPDATE",
      [key],
    )
    const current = locked.rows[0]
    const activeUntil = current?.hold_until ? new Date(current.hold_until) : null
    if (activeUntil && activeUntil.getTime() > Date.now()) {
      await client.query("COMMIT")
      return activeUntil
    }
    const count = (activeUntil ? 0 : (current?.fail_count ?? 0)) + 1
    const holdUntil = count >= MAX_FAILURES ? new Date(Date.now() + HOLD_MS) : null
    await client.query(
      `UPDATE alppay_holds
       SET fail_count = $2, hold_until = $3, updated_at = now()
       WHERE email = $1`,
      [key, count, holdUntil],
    )
    await client.query("COMMIT")
    return holdUntil
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
  }
}
