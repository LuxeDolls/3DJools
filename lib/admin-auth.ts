import "server-only"
import { cookies } from "next/headers"
import crypto from "crypto"

/**
 * Lightweight admin gate for Step 2. The admin area exposes sensitive KYC data
 * and ID documents, so it must never be open. This uses a single shared
 * password (ADMIN_PASSWORD) plus a signed, httpOnly session cookie.
 *
 * In Step 2 (full Better Auth), this becomes a role-based check. The rest of
 * the admin code only depends on `requireAdmin()` / `isAdmin()`, so swapping
 * the mechanism later is isolated to this file.
 */

const COOKIE_NAME = "v3d_admin"
const SESSION_TTL_MS = 1000 * 60 * 60 * 8 // 8 hours

function secret(): string {
  const pw = process.env.ADMIN_PASSWORD
  if (!pw) throw new Error("ADMIN_PASSWORD is not set")
  return pw
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  if (input.length !== expected.length) return false
  return safeEqual(input, expected)
}

export async function createAdminSession(): Promise<void> {
  const expires = Date.now() + SESSION_TTL_MS
  const payload = `admin.${expires}`
  const token = `${payload}.${sign(payload)}`
  const jar = await cookies()
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,
    // The v0 preview renders the app inside a cross-site iframe (top-level
    // origin is v0.app, the app itself runs on a separate preview domain).
    // A "lax" cookie is dropped by the browser in that cross-site context,
    // so the session cookie would never persist after login. "none" (with
    // secure: true) is required for the cookie to survive inside the
    // preview iframe as well as in normal top-level browsing after deploy.
    sameSite: "none",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  })
}

export async function destroyAdminSession(): Promise<void> {
  const jar = await cookies()
  jar.delete(COOKIE_NAME)
}

export async function isAdmin(): Promise<boolean> {
  const jar = await cookies()
  const token = jar.get(COOKIE_NAME)?.value
  if (!token) return false
  const parts = token.split(".")
  if (parts.length !== 3) return false
  const [prefix, expiresStr, mac] = parts
  const payload = `${prefix}.${expiresStr}`
  if (!safeEqual(mac, sign(payload))) return false
  const expires = Number(expiresStr)
  if (!Number.isFinite(expires) || Date.now() > expires) return false
  return true
}
