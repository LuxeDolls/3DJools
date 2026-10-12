import nodemailer from "nodemailer"
import pg from "pg"

const alreadyEmailed = [
  "V3-20261006-MM9NH",
  "V3-20261008-WYWGV",
  "V3-20261008-5V4OD",
  "V3-20261008-8YV3E",
  "V3-20261006-DI38O",
  "V3-20261009-G20OE",
  "V3-20261011-7SL1H",
  "V3-20261011-0YDFF",
  "V3-20261007-XJUBW",
  "V3-20261007-I2X92",
]

const site = "https://www.3djools.com"
const smtpUser = process.env.ZOHO_SMTP_USER ?? "info@3djools.com"
const smtpHost = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.eu"
const smtpPort = Number(process.env.ZOHO_SMTP_PORT ?? "465")
const smtpPassword = process.env.ZOHO_SMTP_PASSWORD

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is missing")
if (!smtpPassword) throw new Error("ZOHO_SMTP_PASSWORD is missing")

function euros(cents) {
  return `€${(Number(cents) / 100).toFixed(2)}`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function shippedEmail(order) {
  const orderLink = `${site}/en/order/${encodeURIComponent(order.order_number)}`
  const carrier = order.carrier?.trim() ?? ""
  const trackingNumber = order.tracking_number?.trim() ?? ""
  const trackingUrl = order.tracking_url?.trim() ?? ""
  const subject = `Your 3DJools order ${order.order_number} has shipped`
  const itemsText = order.items
    .map((item) => `- ${item.product_name} × ${item.quantity} — ${euros(item.line_total_cents)}`)
    .join("\n")
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
  const header = `<div style="padding:0 0 20px;text-align:center;font-family:Arial,Helvetica,sans-serif">
    <div style="display:inline-flex;align-items:center;gap:8px;font-size:24px;font-weight:700;letter-spacing:-0.5px;color:#111">
      <span style="display:inline-flex;width:32px;height:32px;align-items:center;justify-content:center;border-radius:7px;background:#f97316;color:#fff;font-size:13px;font-weight:800;letter-spacing:-1px">3D</span>
      <span><span style="color:#f97316">3D</span>Jools</span>
    </div>
  </div>`
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">${header}
<div style="max-width:560px;margin:0 auto;padding:24px">
  <div style="background:#fff;border-radius:12px;padding:32px">
    <h1 style="margin:0 0 8px;font-size:20px;color:#111">Your order is on its way</h1>
    <p style="margin:0 0 20px;color:#555;font-size:14px">Order <strong>${escapeHtml(order.order_number)}</strong> has shipped.</p>
    <div style="background:#f8f8f8;border-radius:8px;padding:16px;margin-bottom:20px">
      ${carrier ? `<p style="margin:0 0 4px;font-size:14px;color:#111"><strong>Carrier:</strong> ${escapeHtml(carrier)}</p>` : ""}
      ${trackingNumber ? `<p style="margin:0 0 12px;font-size:14px;color:#111"><strong>Tracking number:</strong> ${escapeHtml(trackingNumber)}</p>` : ""}
      ${trackingUrl ? `<a href="${escapeHtml(trackingUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Track your parcel</a>` : ""}
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
const orders = await pool.query(
  `select o.id, o.order_number, o.email, o.carrier, o.tracking_number, o.tracking_url, o.total_cents,
          coalesce(json_agg(json_build_object(
            'product_name', i.product_name,
            'quantity', i.quantity,
            'line_total_cents', i.line_total_cents
          ) order by i.product_name) filter (where i.id is not null), '[]') as items
   from orders o
   left join order_items i on i.order_id = o.id
   where o.status = 'shipped'
     and o.updated_at >= timestamptz '2026-10-12 09:10:00+00'
     and o.updated_at < timestamptz '2026-10-12 09:40:00+00'
     and not (o.order_number = any($1::text[]))
   group by o.id
   order by o.order_number`,
  [alreadyEmailed],
)

const missing = orders.rows.filter((order) => !order.email || !order.tracking_number || !order.tracking_url)
if (orders.rows.length !== 65 || missing.length > 0) {
  console.error(JSON.stringify({ count: orders.rows.length, missing: missing.map((order) => order.order_number) }))
  await pool.end()
  process.exit(1)
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: { user: smtpUser, pass: smtpPassword },
  connectionTimeout: 10_000,
  socketTimeout: 20_000,
})

const failed = []
for (const order of orders.rows) {
  const message = shippedEmail(order)
  try {
    await transporter.sendMail({
      from: `3DJools <${smtpUser}>`,
      to: order.email,
      subject: message.subject,
      html: message.html,
      text: message.text,
    })
    console.log(`sent ${order.order_number}`)
  } catch (error) {
    failed.push({ order: order.order_number, error: error instanceof Error ? error.message : String(error) })
    console.error(`failed ${order.order_number}`)
  }
  await new Promise((resolve) => setTimeout(resolve, 400))
}

console.log(JSON.stringify({ sent: orders.rows.length - failed.length, failed }, null, 2))
await pool.end()
if (failed.length > 0) process.exit(1)
