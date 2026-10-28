import "server-only"

import { pool } from "@/lib/db"

export type BlockedCustomer = {
  email: string
  reason: string | null
  orderNumber: string | null
  blockedAt: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
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
    `)
    .then(() => undefined)
    .catch((err) => {
      ready = null
      throw err
    })
  return ready
}

/** Whether checkout should be refused for this email. Used at order creation time. */
export async function isCustomerBlocked(email: string): Promise<boolean> {
  const key = normalizeEmail(email)
  if (!key.includes("@")) return false
  await ensureTable()
  const res = await pool.query("SELECT 1 FROM blocked_customers WHERE email = $1", [key])
  return (res.rowCount ?? 0) > 0
}

/** Blocks an email from placing new orders. `orderNumber` records which order triggered the block, if any. */
export async function blockCustomer(email: string, input: { reason?: string; orderNumber?: string } = {}): Promise<void> {
  const key = normalizeEmail(email)
  if (!key.includes("@")) throw new Error("Invalid email")
  await ensureTable()
  await pool.query(
    `INSERT INTO blocked_customers (email, reason, order_number, blocked_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (email) DO UPDATE SET reason = EXCLUDED.reason, order_number = EXCLUDED.order_number, blocked_at = now()`,
    [key, input.reason?.trim() || null, input.orderNumber ?? null],
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
