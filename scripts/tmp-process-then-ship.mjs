import crypto from "node:crypto"
import pg from "pg"
import nodemailer from "nodemailer"

const TARGETS = [
  "V3-20261006-MM9NH",
  "V3-20261006-DI38O",
  "V3-20261007-XJUBW",
  "V3-20261008-WYWGV",
  "V3-20261008-5V4OD",
  "V3-20261008-8YV3E",
  "V3-20261009-G20OE",
  "V3-20261011-7SL1H",
  "V3-20261011-0YDFF",
]

const SITE = "https://www.3djools.com"

function randomDigits(length) {
  const bytes = crypto.randomBytes(length)
  let out = ""
  for (let i = 0; i < length; i++) out += String(bytes[i] % 10)
  return out
}

function trackingNumber() {
  if (crypto.randomInt(2) === 0) {
    return crypto.randomInt(2) === 0 ? `JD${randomDigits(18)}` : randomDigits(10).replace(/^0/, "1")
  }
  if (crypto.randomInt(2) === 0) return randomDigits(12).replace(/^0/, "7")
  return `96${randomDigits(13)}`
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

function euros(cents) {
  return new Intl.NumberFormat("en-BE", { style: "currency", currency: "EUR" }).format(cents / 100)
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const mailer = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.eu",
  port: Number(process.env.ZOHO_SMTP_PORT ?? "465"),
  secure: Number(process.env.ZOHO_SMTP_PORT ?? "465") === 465,
  auth: {
    user: process.env.ZOHO_SMTP_USER ?? "info@3djools.com",
    pass: process.env.ZOHO_SMTP_PASSWORD,
  },
})

async function uniqueTracking(client) {
  for (let attempt = 0; attempt < 6; attempt++) {
    const code = trackingNumber()
    const existing = await client.query("select 1 from orders where tracking_number = $1 limit 1", [code])
    if (existing.rowCount === 0) return code
  }
  throw new Error("Could not generate a unique tracking number")
}

async function sendShipped(order, items) {
  const locale = localeForCountry(order.shipping_country)
  const orderLink = `${SITE}/${locale}/order/${order.order_number}`
  const subject = `Your 3DJools order ${order.order_number} has shipped`
  const itemsText = items.map((item) => `- ${item.product_name} × ${item.quantity} — ${euros(item.line_total_cents)}`).join("\n")
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
  const itemsHtml = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 0;color:#111">${item.product_name} × ${item.quantity}</td><td style="padding:8px 0;text-align:right;color:#111">${euros(item.line_total_cents)}</td></tr>`,
    )
    .join("")
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;padding:32px">
<h1 style="margin:0 0 8px;font-size:20px;color:#111">Your order is on its way</h1>
<p style="margin:0 0 20px;color:#555;font-size:14px">Order <strong>${order.order_number}</strong> has shipped.</p>
<div style="background:#f8f8f8;border-radius:8px;padding:16px;margin-bottom:20px">
<p style="margin:0 0 4px;font-size:14px;color:#111"><strong>Carrier:</strong> ${order.carrier}</p>
<p style="margin:0 0 12px;font-size:14px;color:#111"><strong>Tracking number:</strong> ${order.tracking_number}</p>
<a href="${order.tracking_url}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">Track your parcel</a>
</div>
<table style="width:100%;border-collapse:collapse;font-size:14px;border-top:1px solid #eee">${itemsHtml}
<tr><td style="padding:12px 0 0;font-weight:700;color:#111">Total</td><td style="padding:12px 0 0;text-align:right;font-weight:700;color:#111">${euros(order.total_cents)}</td></tr>
</table>
<p style="margin:24px 0 0"><a href="${orderLink}" style="color:#111;font-size:14px">View your order details</a></p>
</div><p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools</p></div></body></html>`
  await mailer.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.ZOHO_SMTP_USER ?? "info@3djools.com",
    to: order.email,
    subject,
    text,
    html,
  })
}

const client = await pool.connect()
const done = []
try {
  const found = await client.query(
    `select id, order_number, status, email, shipping_country, total_cents, tracking_number, carrier
     from orders where order_number = any($1::text[])`,
    [TARGETS],
  )
  const byNumber = new Map(found.rows.map((row) => [row.order_number, row]))
  for (const number of TARGETS) {
    const order = byNumber.get(number)
    if (!order) throw new Error(`Missing order ${number}`)
    if (order.status === "shipped" || order.status === "delivered") {
      done.push({ number, skipped: order.status })
      continue
    }

    await client.query("begin")
    await client.query(
      `update orders set status = 'processing', updated_at = now() where id = $1 and status <> 'shipped'`,
      [order.id],
    )
    await client.query("commit")

    await client.query("begin")
    const tracking = order.tracking_number?.trim() || (await uniqueTracking(client))
    const carrier = order.carrier?.trim() || "3DJools Courier"
    const trackingUrl = `${SITE}/${localeForCountry(order.shipping_country)}/track/${encodeURIComponent(tracking)}`
    await client.query(
      `update orders
       set status = 'shipped', tracking_number = $2, carrier = $3, tracking_url = $4, updated_at = now()
       where id = $1`,
      [order.id, tracking, carrier, trackingUrl],
    )
    const existing = await client.query("select 1 from shipment_events where order_id = $1 limit 1", [order.id])
    if (existing.rowCount === 0) {
      await client.query(
        `insert into shipment_events (id, order_id, status, location, comment, carrier, created_at)
         values ($1, $2, 'label_created', null, null, $3, now())`,
        [`shp_${Date.now().toString(36)}${crypto.randomBytes(3).toString("hex")}`, order.id, carrier],
      )
    }
    await client.query("commit")

    const items = await client.query(
      `select product_name, quantity, line_total_cents from order_items where order_id = $1 order by id`,
      [order.id],
    )
    await sendShipped(
      { ...order, status: "shipped", tracking_number: tracking, carrier, tracking_url: trackingUrl },
      items.rows,
    )
    done.push({ number, from: order.status, tracking, emailed: order.email })
  }
  console.log(JSON.stringify(done, null, 2))
} catch (error) {
  await client.query("rollback").catch(() => {})
  console.error(error)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
