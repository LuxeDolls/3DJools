import nodemailer from "nodemailer"
import pg from "pg"

const ORDER_NUMBERS = [
  "V3-20261012-8KPCN",
  "V3-20261012-A2EO0",
  "V3-20261012-AY4MK",
  "V3-20261012-CYW3O",
  "V3-20261012-DHL8S",
  "V3-20261012-EZGMZ",
  "V3-20261012-IG6C8",
  "V3-20261012-MRAK6",
  "V3-20261012-P32ZB",
  "V3-20261012-Q1R9U",
  "V3-20261012-YFCTN",
  "V3-20261013-18Z6A",
  "V3-20261013-V7MK8",
]

const COPY = {
  de: {
    subject: (n, s) => `Sendungsupdate zu Bestellung ${n}: ${s}`,
    heading: "Neuer Status Ihrer Sendung",
    body: (n, s) => `Bestellung ${n} hat jetzt den Status: ${s}.`,
    location: "Ort",
    carrier: "Dienst",
    tracking: "Sendungsnummer",
    button: "Sendung verfolgen",
    status: "Sortiert",
  },
  fr: {
    subject: (n, s) => `Suivi de la commande ${n} : ${s}`,
    heading: "Nouveau statut de livraison",
    body: (n, s) => `La commande ${n} est maintenant : ${s}.`,
    location: "Lieu",
    carrier: "Transporteur",
    tracking: "Numéro de suivi",
    button: "Suivre le colis",
    status: "Trié",
  },
  es: {
    subject: (n, s) => `Actualización del pedido ${n}: ${s}`,
    heading: "Nuevo estado de la entrega",
    body: (n, s) => `El pedido ${n} está ahora: ${s}.`,
    location: "Lugar",
    carrier: "Transportista",
    tracking: "Número de seguimiento",
    button: "Seguir el paquete",
    status: "Clasificado",
  },
  nl: {
    subject: (n, s) => `Bezorgupdate voor bestelling ${n}: ${s}`,
    heading: "Nieuwe status van uw zending",
    body: (n, s) => `Bestelling ${n} heeft nu de status: ${s}.`,
    location: "Plaats",
    carrier: "Vervoerder",
    tracking: "Trackingnummer",
    button: "Zending volgen",
    status: "Gesorteerd",
  },
  en: {
    subject: (n, s) => `Delivery update for order ${n}: ${s}`,
    heading: "Your delivery has a new status",
    body: (n, s) => `Order ${n} is now: ${s}.`,
    location: "Location",
    carrier: "Carrier",
    tracking: "Tracking number",
    button: "Track your parcel",
    status: "Sorted",
  },
}

function localeFor(country) {
  const value = (country || "").trim().toLowerCase()
  if (["germany", "deutschland", "de"].includes(value)) return "de"
  if (["france", "fr"].includes(value)) return "fr"
  if (["spain", "españa", "espana", "es"].includes(value)) return "es"
  if (["netherlands", "the netherlands", "nederland", "nl"].includes(value)) return "nl"
  if (["belgium", "belgique", "belgië", "belgie", "be"].includes(value)) return "fr"
  return "en"
}

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const user = process.env.ZOHO_SMTP_USER || "info@3djools.com"
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.eu",
  port: Number(process.env.ZOHO_SMTP_PORT || 465),
  secure: Number(process.env.ZOHO_SMTP_PORT || 465) === 465,
  auth: { user, pass: process.env.ZOHO_SMTP_PASSWORD },
})

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const result = await pool.query(
  `select order_number, email, shipping_country, tracking_number, tracking_url, carrier, status
   from orders
   where order_number = any($1::text[])
   order by order_number`,
  [ORDER_NUMBERS],
)
await pool.end()

if (result.rows.length !== ORDER_NUMBERS.length) {
  console.error("expected 13 orders, got " + result.rows.length)
  process.exit(1)
}

for (const [index, row] of result.rows.entries()) {
  if (index > 0) {
    console.log("waiting 60s")
    await sleep(60_000)
  }
  if (row.status !== "shipped" || !row.email || !row.tracking_number) {
    console.error("skip " + row.order_number)
    continue
  }
  const locale = localeFor(row.shipping_country)
  const copy = COPY[locale]
  const status = copy.status
  const trackingUrl = row.tracking_url || `https://www.3djools.com/${locale}/track/${row.tracking_number}`
  const text = [
    copy.body(row.order_number, status),
    `${copy.location}: Manage`,
    `${copy.carrier}: 3DJools Courier`,
    `${copy.tracking}: ${row.tracking_number}`,
    trackingUrl,
  ].join("\n")
  const html = `<!doctype html><html><body style="margin:0;background:#f5f5f5;font-family:Arial,Helvetica,sans-serif">
<div style="max-width:560px;margin:0 auto;padding:24px"><div style="background:#fff;border-radius:12px;padding:32px">
<h1 style="margin:0 0 8px;font-size:20px;color:#111">${esc(copy.heading)}</h1>
<p style="margin:0 0 16px;color:#111;font-size:15px;line-height:1.6">${esc(copy.body(row.order_number, status))}</p>
<p style="margin:0 0 8px;color:#333;font-size:14px;line-height:1.6"><strong>${esc(copy.location)}:</strong> Manage</p>
<div style="background:#f8f8f8;border-radius:8px;padding:16px;margin:16px 0 0">
<p style="margin:0 0 4px;font-size:14px;color:#111"><strong>${esc(copy.carrier)}:</strong> 3DJools Courier</p>
<p style="margin:0 0 12px;font-size:14px;color:#111"><strong>${esc(copy.tracking)}:</strong> ${esc(row.tracking_number)}</p>
<a href="${esc(trackingUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${esc(copy.button)}</a>
</div>
</div><p style="text-align:center;color:#999;font-size:12px;margin-top:16px">3DJools</p></div>
</body></html>`
  const info = await transporter.sendMail({
    from: `3DJools <${user}>`,
    to: row.email,
    replyTo: user,
    subject: copy.subject(row.order_number, status),
    text,
    html,
  })
  console.log(JSON.stringify({
    n: index + 1,
    order: row.order_number,
    to: row.email,
    locale,
    accepted: info.accepted,
    rejected: info.rejected,
  }))
}

console.log("done")
