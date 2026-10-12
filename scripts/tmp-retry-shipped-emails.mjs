import nodemailer from "nodemailer"
import pg from "pg"

const numbers = [
  "V3-20261011-ODHCS",
  "V3-20261011-ACD7U",
  "V3-20261011-9XKKF",
  "V3-20261011-92BNN",
  "V3-20261011-YYR5Q",
  "V3-20261011-PZMKS",
  "V3-20261011-GM1XC",
  "V3-20261011-CQZF8",
  "V3-20261011-CH5HF",
]

const gapMs = 60_000

function euros(cents) {
  return `€${(cents / 100).toFixed(2)}`
}

function escapeHtml(value) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function shippedEmail(order) {
  const orderLink = `https://www.3djools.com/en/order/${order.order_number}`
  const carrier = order.carrier?.trim() || ""
  const trackingNumber = order.tracking_number?.trim() || ""
  const trackingUrl = order.tracking_url?.trim() || ""
  const subject = `Your 3DJools order ${order.order_number} has shipped`
  const itemsText = order.items.map((item) => `- ${item.product_name} × ${item.quantity} — ${euros(item.line_total_cents)}`).join("\n")
  const text = [
    `Good news — your order ${order.order_number} is on its way.`,
    "",
    carrier ? `Carrier: ${carrier}` : null,
    trackingNumber ? `Tracking number: ${trackingNumber}` : null,
    trackingUrl ? `Track your parcel: ${trackingUrl}` : null,
    "",
    "Items:",
    itemsText,
    "",
    `Order total: ${euros(order.total_cents)}`,
    `View your order: ${orderLink}`,
  ]
    .filter((line) => line !== null)
    .join("\n")
  const itemsHtml = order.items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;color:#111">${escapeHtml(item.product_name)} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;color:#111">${euros(item.line_total_cents)}</td></tr>`,
    )
    .join("")
  const trackBtn = trackingUrl
    ? `<a href="${escapeHtml(trackingUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Track your parcel</a>`
    : ""
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="padding:0 0 20px;text-align:center;font-family:Arial,Helvetica,sans-serif">
  <div style="display:inline-flex;align-items:center;gap:8px;font-size:24px;font-weight:700;letter-spacing:-0.5px;color:#111">
    <span style="display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:7px;background:#f97316;color:#fff;font-size:13px;font-weight:800;letter-spacing:-1px">3D</span>
    <span><span style="color:#f97316">3D</span>Jools</span>
  </div>
</div>
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">Your order is on its way</h1>
    <p style="margin:0 0 20px;color:#555;font-size:14px">Order <strong>${escapeHtml(order.order_number)}</strong> has shipped.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin-bottom:20px">
      ${carrier ? `<p style="margin:0 0 4px;font-size:14px;color:#111"><strong>Carrier:</strong> ${escapeHtml(carrier)}</p>` : ""}
      ${trackingNumber ? `<p style="margin:0 0 12px;font-size:14px;color:#111"><strong>Tracking number:</strong> ${escapeHtml(trackingNumber)}</p>` : ""}
      ${trackBtn}
    </div>
    <table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #eee">${itemsHtml}
      <tr><td style="padding:12px 0 0;font-weight:700;color:#111">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#111">${euros(order.total_cents)}</td></tr>
    </table>
    <p style="margin:24px 0 0"><a href="${orderLink}" style="color:#111;font-size:14px">View your order details</a></p>
  </div>
  <p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools</p>
</div>
</body></html>`
  return { subject, html, text }
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const port = Number(process.env.ZOHO_SMTP_PORT ?? "465")
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.eu",
  port,
  secure: port === 465,
  auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASSWORD },
  connectionTimeout: 10_000,
  socketTimeout: 20_000,
})

const orders = await pool.query(
  `select o.id, o.order_number, o.email, o.carrier, o.tracking_number, o.tracking_url, o.total_cents
   from orders o
   where o.order_number = any($1::text[])
   order by array_position($1::text[], o.order_number)`,
  [numbers],
)
if (orders.rows.length !== numbers.length) {
  const found = new Set(orders.rows.map((row) => row.order_number))
  throw new Error(`Missing orders: ${numbers.filter((number) => !found.has(number)).join(", ")}`)
}
const items = await pool.query(
  `select order_id, product_name, quantity, line_total_cents
   from order_items
   where order_id = any($1::text[])
   order by id`,
  [orders.rows.map((row) => row.id)],
)
for (const order of orders.rows) {
  order.items = items.rows.filter((item) => item.order_id === order.id)
  if (!order.email || !order.tracking_number || order.items.length === 0) {
    throw new Error(`${order.order_number} is missing email, tracking, or items`)
  }
}

const sent = []
const failed = []
for (let index = 0; index < orders.rows.length; index += 1) {
  if (index > 0) await sleep(gapMs)
  const order = orders.rows[index]
  const message = shippedEmail(order)
  try {
    await transporter.sendMail({
      from: `3DJools <${process.env.ZOHO_SMTP_USER}>`,
      to: order.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    })
    sent.push(order.order_number)
    console.log(`sent ${order.order_number}`)
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    failed.push({ order: order.order_number, error: detail })
    console.error(`failed ${order.order_number}: ${detail}`)
    if (detail.includes("550")) break
  }
}

console.log(JSON.stringify({ sent, failed, remaining: numbers.length - sent.length - failed.length }, null, 2))
await pool.end()
if (failed.length > 0) process.exitCode = 1
