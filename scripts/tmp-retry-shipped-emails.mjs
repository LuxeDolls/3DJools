import { Pool } from "pg"
import nodemailer from "nodemailer"

const NUMBERS = [
  "V3-20261011-PGP4I",
  "V3-20261011-V5W9X",
  "V3-20261011-ANJUG",
  "V3-20261011-ODHCS",
  "V3-20261011-ACD7U",
  "V3-20261011-9XKKF",
  "V3-20261011-92BNN",
  "V3-20261011-YYR5Q",
  "V3-20261011-PZMKS",
]

const SITE = "https://www.3djools.com"

function euros(cents) {
  return `€${(Number(cents) / 100).toFixed(2)}`
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

function shippedMessage(order) {
  const orderLink = `${SITE}/en/order/${order.id}`
  const itemsText = order.items
    .map((item) => `- ${item.product_name} × ${item.quantity} — ${euros(item.line_total_cents)}`)
    .join("\n")
  const text = [
    `Your 3DJools order ${order.order_number} has shipped.`,
    "",
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
  return { subject: `Your 3DJools order ${order.order_number} has shipped`, text, html }
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const mailer = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT || 465),
  secure: Number(process.env.ZOHO_SMTP_PORT || 465) === 465,
  auth: { user: process.env.ZOHO_SMTP_USER, pass: process.env.ZOHO_SMTP_PASSWORD },
})

const found = await pool.query(
  `select o.id, o.order_number, o.email, o.total_cents, o.carrier, o.tracking_number, o.tracking_url,
          coalesce(json_agg(json_build_object(
            'product_name', i.product_name,
            'quantity', i.quantity,
            'line_total_cents', i.line_total_cents
          ) order by i.id) filter (where i.id is not null), '[]') as items
   from orders o
   left join order_items i on i.order_id = o.id
   where o.order_number = any($1::text[])
     and o.status = 'shipped'
     and o.tracking_number is not null
   group by o.id
   order by o.created_at`,
  [NUMBERS],
)
if (found.rowCount !== NUMBERS.length) {
  console.error(`Expected ${NUMBERS.length} shipped orders, found ${found.rowCount}`)
  await pool.end()
  process.exit(1)
}

const sent = []
const failed = []
for (const [index, order] of found.rows.entries()) {
  if (index > 0) await new Promise((resolve) => setTimeout(resolve, 25000))
  const message = shippedMessage(order)
  try {
    const info = await mailer.sendMail({
      from: process.env.EMAIL_FROM || process.env.ZOHO_SMTP_USER,
      to: order.email,
      subject: message.subject,
      text: message.text,
      html: message.html,
    })
    sent.push(order.order_number)
    console.log(`sent ${order.order_number} ${info.messageId}`)
  } catch (error) {
    failed.push({ order: order.order_number, error: error.message })
    console.error(`failed ${order.order_number} ${error.message}`)
    if (String(error.message).includes("5.4.6")) break
  }
}

console.log(JSON.stringify({ sent, failed }, null, 2))
await pool.end()
if (failed.length > 0) process.exit(1)
