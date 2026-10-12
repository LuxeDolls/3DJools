import { randomBytes } from "node:crypto"
import { Pool } from "pg"
import nodemailer from "nodemailer"

const NUMBERS = [
  "V3-20261011-PGP4I",
  "V3-20261011-V5W9X",
  "V3-20261011-GM1XC",
  "V3-20261011-CQZF8",
  "V3-20261011-ANJUG",
  "V3-20261011-ODHCS",
  "V3-20261011-ACD7U",
  "V3-20261011-9XKKF",
  "V3-20261011-CH5HF",
  "V3-20261011-92BNN",
  "V3-20261011-YYR5Q",
  "V3-20261011-PZMKS",
]

const SITE = "https://www.3djools.com"
const CARRIER = "3DJools Courier"

function euros(cents) {
  return `€${(Number(cents) / 100).toFixed(2)}`
}

function digits(length) {
  const bytes = randomBytes(length)
  return [...bytes].map((byte) => String(byte % 10)).join("")
}

function trackingNumber() {
  if (randomBytes(1)[0] % 2 === 0) {
    if (randomBytes(1)[0] % 2 === 0) return `JD${digits(18)}`
    const bill = digits(10)
    return bill.startsWith("0") ? `1${bill.slice(1)}` : bill
  }
  if (randomBytes(1)[0] % 2 === 0) {
    const number = digits(12)
    return number.startsWith("0") ? `7${number.slice(1)}` : number
  }
  return `96${digits(13)}`
}

function localeForCountry(country) {
  const value = (country ?? "").trim().toLowerCase()
  if (["germany", "deutschland", "austria", "österreich", "switzerland", "schweiz", "de", "at", "ch"].includes(value)) return "de"
  if (["france", "frankreich", "fr"].includes(value)) return "fr"
  if (["italy", "italia", "italien", "it"].includes(value)) return "it"
  if (["spain", "españa", "espana", "spanien", "es"].includes(value)) return "es"
  if (["netherlands", "the netherlands", "nederland", "pays-bas", "nl"].includes(value)) return "nl"
  if (["belgium", "belgique", "belgië", "belgie", "belgien", "be"].includes(value)) return "fr"
  return "en"
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function shippedMessage(order) {
  const orderLink = `${SITE}/en/order/${encodeURIComponent(order.order_number)}`
  const itemsText = order.items
    .map((item) => `- ${item.product_name} × ${item.quantity} — ${euros(item.line_total_cents)}`)
    .join("\n")
  const text = [
    `Good news — your order ${order.order_number} is on its way.`,
    "",
    `Carrier: ${order.carrier}`,
    `Tracking number: ${order.tracking_number}`,
    `Track your parcel: ${order.tracking_url}`,
    "",
    "Items:",
    itemsText,
    "",
    `Order total: ${euros(order.total_cents)}`,
    `View your order: ${orderLink}`,
  ].join("\n")
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;color:#111">${escapeHtml(item.product_name)} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;color:#111">${euros(item.line_total_cents)}</td></tr>`,
    )
    .join("")
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">Your order is on its way</h1>
    <p style="margin:0 0 20px;color:#555;font-size:14px">Order <strong>${escapeHtml(order.order_number)}</strong> has shipped.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="margin:0 0 4px;font-size:14px;color:#111"><strong>Carrier:</strong> ${escapeHtml(order.carrier)}</p>
      <p style="margin:0 0 12px;font-size:14px;color:#111"><strong>Tracking number:</strong> ${escapeHtml(order.tracking_number)}</p>
      <a href="${order.tracking_url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Track your parcel</a>
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #eee">${itemsHtml}
      <tr><td style="padding:12px 0 0;font-weight:700;color:#111">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#111">${euros(order.total_cents)}</td></tr>
    </table>
    <p style="margin:24px 0 0"><a href="${orderLink}" style="color:#111;font-size:14px">View your order details</a></p>
  </div>
  <p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools</p>
</div>
</body></html>`
  return {
    subject: `Your 3DJools order ${order.order_number} has shipped`,
    text,
    html,
  }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const mailer = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT || 465),
  secure: Number(process.env.ZOHO_SMTP_PORT || 465) === 465,
  auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASSWORD },
})

async function uniqueTracking() {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const code = trackingNumber()
    const existing = await pool.query("select 1 from orders where tracking_number = $1 limit 1", [code])
    if (existing.rowCount === 0) return code
  }
  return trackingNumber()
}

async function shipOne(client, orderNumber) {
  const locked = await client.query(
    `select id, order_number, email, shipping_country, total_cents
     from orders
     where order_number = $1 and status = 'paid'
     for update`,
    [orderNumber],
  )
  const order = locked.rows[0]
  if (!order) throw new Error(`${orderNumber} is no longer paid`)
  if (!order.email) throw new Error(`${orderNumber} has no email`)
  const items = await client.query(
    `select product_name, quantity, line_total_cents
     from order_items where order_id = $1 order by id`,
    [order.id],
  )
  if (items.rowCount === 0) throw new Error(`${orderNumber} has no items`)
  const code = await uniqueTracking()
  const locale = localeForCountry(order.shipping_country)
  const url = `${SITE}/${locale}/track/${encodeURIComponent(code)}`
  await client.query(
    `update orders
     set status = 'shipped', carrier = $2, tracking_number = $3, tracking_url = $4, updated_at = now()
     where id = $1`,
    [order.id, CARRIER, code, url],
  )
  await client.query(
    `insert into shipment_events (id, order_id, status, location, carrier, comment, created_at)
     values ($1, $2, 'label_created', null, $3, null, now())`,
    [`shp_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`, order.id, CARRIER],
  )
  return {
    ...order,
    carrier: CARRIER,
    tracking_number: code,
    tracking_url: url,
    items: items.rows,
  }
}

const shipped = []
const client = await pool.connect()
try {
  await client.query("begin")
  const found = await client.query(
    `select order_number from orders
     where order_number = any($1::text[]) and status = 'paid'
     order by created_at`,
    [NUMBERS],
  )
  if (found.rowCount !== NUMBERS.length) {
    throw new Error(`Expected ${NUMBERS.length} paid orders, found ${found.rowCount}`)
  }
  for (const number of NUMBERS) shipped.push(await shipOne(client, number))
  await client.query("commit")
} catch (error) {
  await client.query("rollback")
  client.release()
  await pool.end()
  console.error(error.message)
  process.exit(1)
}
client.release()

const sent = []
const failed = []
for (const order of shipped) {
  const message = shippedMessage(order)
  try {
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.ZOHO_SMTP_USER,
      to: order.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
    sent.push({ order: order.order_number, to: order.email, id: info.messageId })
    console.log(`sent ${order.order_number} ${info.messageId}`)
  } catch (error) {
    failed.push({ order: order.order_number, error: error.message })
    console.error(`failed ${order.order_number} ${error.message}`)
  }
}

console.log(JSON.stringify({ shipped: shipped.length, sent: sent.length, failed }, null, 2))
await pool.end()
if (failed.length > 0) process.exit(1)
