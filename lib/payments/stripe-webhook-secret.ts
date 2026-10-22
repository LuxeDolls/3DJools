import { pool } from "@/lib/db"

const SECRET_NAME = "stripe_webhook"

let ready: Promise<void> | null = null

function ensureTable(): Promise<void> {
  ready ??= pool
    .query(`
      CREATE TABLE IF NOT EXISTS payment_secrets (
        name text PRIMARY KEY,
        value text NOT NULL,
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `)
    .then(() => undefined)
    .catch((error) => {
      ready = null
      throw error
    })
  return ready
}

/** Env secrets first, then the live signing secret stored for this shop. */
export async function stripeWebhookSecrets(): Promise<string[]> {
  const secrets = [process.env.STRIPE_WEBHOOK_SECRET_3, process.env.STRIPE_WEBHOOK_SECRET]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
  try {
    await ensureTable()
    const result = await pool.query<{ value: string }>("SELECT value FROM payment_secrets WHERE name = $1", [SECRET_NAME])
    const stored = result.rows[0]?.value?.trim()
    if (stored) secrets.push(stored)
  } catch (error) {
    console.error("[v0] Stripe webhook secret lookup failed:", error instanceof Error ? error.message : "invalid")
  }
  return [...new Set(secrets)]
}
