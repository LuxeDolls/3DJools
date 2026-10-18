import { createHmac, randomInt, timingSafeEqual } from "node:crypto"

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
const TTL_MS = 10 * 60 * 1000

export type ContactCaptcha = {
  token: string
  svg: string
}

function secret(): string {
  const value = process.env.BETTER_AUTH_SECRET
  if (!value) throw new Error("BETTER_AUTH_SECRET is not set")
  return value
}

function sign(code: string, exp: number): string {
  return createHmac("sha256", secret()).update(`${code}.${exp}`).digest("hex")
}

function renderCaptcha(code: string): string {
  const letters = code.split("").map((character, index) => {
    const x = 18 + index * 22
    const y = 28 + randomInt(-4, 5)
    const rotate = randomInt(-18, 19)
    return `<text x="${x}" y="${y}" fill="#1C1917" font-size="22" font-family="ui-sans-serif,sans-serif" font-weight="700" transform="rotate(${rotate} ${x} ${y})">${character}</text>`
  })
  const lines = Array.from({ length: 4 }, () => {
    const y = randomInt(8, 40)
    return `<path d="M4 ${y} C 40 ${y + randomInt(-8, 9)}, 90 ${y + randomInt(-8, 9)}, 140 ${y}" stroke="#D86A32" stroke-width="1.2" fill="none"/>`
  })
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 148 48" width="148" height="48" role="img" aria-hidden="true"><rect width="148" height="48" rx="6" fill="#F6F3EE"/>${lines.join("")}${letters.join("")}</svg>`
}

export function issueContactCaptcha(): ContactCaptcha {
  let code = ""
  for (let index = 0; index < 5; index += 1) code += ALPHABET[randomInt(ALPHABET.length)]
  const exp = Date.now() + TTL_MS
  return { token: `${exp}.${sign(code, exp)}`, svg: renderCaptcha(code) }
}

export function verifyContactCaptcha(token: string, answer: string): boolean {
  const [expRaw, sig] = token.split(".")
  const exp = Number(expRaw)
  if (!sig || !Number.isFinite(exp) || exp < Date.now()) return false
  const normalized = answer.trim().toUpperCase().replace(/\s/g, "")
  if (!/^[A-Z2-9]{5}$/.test(normalized)) return false
  const expected = sign(normalized, exp)
  const left = Buffer.from(sig)
  const right = Buffer.from(expected)
  if (left.length !== right.length) return false
  return timingSafeEqual(left, right)
}
