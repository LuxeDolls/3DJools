import PDFDocument from "pdfkit"
import fs from "node:fs"
import pg from "pg"

const FONT = "/tmp/fonts/NotoSans-Regular.ttf"
const FONT_BOLD = "/tmp/fonts/NotoSans-Bold.ttf"
const OUT = "/tmp/3djools-stripe-paypal-orders.pdf"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })

function eur(cents) {
  const n = Number(cents) / 100
  const [whole, frac] = n.toFixed(2).split(".")
  return `${whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ")}.${frac}`
}

function field(notes, key) {
  const match = String(notes || "").match(new RegExp(`${key}=([^;]+)`))
  return match ? match[1].trim() : ""
}

function lastId(value) {
  if (!value) return ""
  const parts = value.split(",").map((part) => part.trim()).filter(Boolean)
  return parts[parts.length - 1] || ""
}

const COUNTRY = {
  Belgium: "BE",
  Germany: "DE",
  France: "FR",
  Netherlands: "NL",
  Spain: "ES",
  Italy: "IT",
  Cyprus: "CY",
  Luxembourg: "LU",
  Romania: "RO",
  Croatia: "HR",
  Malta: "MT",
}

function txn(row) {
  if (row.payment_method === "paypal") {
    return field(row.notes, "paypal_capture_id") || lastId(field(row.notes, "paypal_order_ids"))
  }
  return field(row.notes, "stripe_payment_intent") || lastId(field(row.notes, "stripe_session_ids"))
}

const STATUS = {
  shipped: "Shipped",
  processing: "Processing",
  paid: "Paid",
  refunded: "Refunded",
  awaiting_payment: "Awaiting",
  cancelled: "Cancelled",
  reviewing_payment: "Review",
}

const COLLECTED = new Set(["paid", "processing", "shipped"])

const rowsResult = await pool.query(`
  select
    o.order_number,
    o.email,
    o.status,
    o.payment_method,
    o.total_cents,
    o.shipping_name,
    o.shipping_country,
    o.notes,
    to_char(o.created_at at time zone 'Europe/Brussels', 'DD.MM.YYYY HH24:MI') as created_label,
    coalesce((
      select string_agg(
        i.product_name || case when i.quantity > 1 then ' x' || i.quantity::text else '' end,
        '; ' order by i.product_name
      )
      from order_items i
      where i.order_id = o.id
    ), '') as items
  from orders o
  where o.payment_method = 'paypal'
     or (o.payment_method = 'card' and coalesce(o.notes, '') like '%stripe_%')
  order by o.created_at asc
`)

const excluded = await pool.query(`
  select
    count(*) filter (where payment_method = 'square')::int as square,
    count(*) filter (
      where payment_method = 'card' and coalesce(notes, '') not like '%stripe_%'
    )::int as aviagram
  from orders
`)

await pool.end()

const rows = rowsResult.rows.map((row) => ({
  ...row,
  method: row.payment_method === "paypal" ? "PayPal" : "Stripe",
  statusLabel: STATUS[row.status] || row.status,
  txn: txn(row),
}))

function totals(list) {
  const byStatus = new Map()
  for (const row of list) {
    const current = byStatus.get(row.status) || { n: 0, cents: 0 }
    current.n += 1
    current.cents += Number(row.total_cents)
    byStatus.set(row.status, current)
  }
  const collected = list.filter((row) => COLLECTED.has(row.status))
  const refunded = list.filter((row) => row.status === "refunded")
  return {
    n: list.length,
    cents: list.reduce((sum, row) => sum + Number(row.total_cents), 0),
    collectedN: collected.length,
    collectedCents: collected.reduce((sum, row) => sum + Number(row.total_cents), 0),
    refundedN: refunded.length,
    refundedCents: refunded.reduce((sum, row) => sum + Number(row.total_cents), 0),
    byStatus,
  }
}

const stripe = totals(rows.filter((row) => row.method === "Stripe"))
const paypal = totals(rows.filter((row) => row.method === "PayPal"))
const allCollected = stripe.collectedCents + paypal.collectedCents
const allRefunded = stripe.refundedCents + paypal.refundedCents

const doc = new PDFDocument({ size: "A4", layout: "landscape", margin: 28 })
doc.registerFont("Regular", FONT)
doc.registerFont("Bold", FONT_BOLD)
const stream = fs.createWriteStream(OUT)
doc.pipe(stream)

const ink = "#1c2430"
const muted = "#5c6670"
const line = "#d5dbe1"
const paper = "#f4f6f8"
const collectedColor = "#1f6b4a"

function header(title) {
  doc.save()
  doc.rect(0, 0, doc.page.width, 46).fill(ink)
  doc.fillColor("#ffffff").font("Bold").fontSize(13).text("3DJools", 28, 12)
  doc.font("Regular").fontSize(9).text(title, 92, 15)
  doc.fontSize(8).text("LN-SQUARED  ·  internal order report  ·  13.10.2026", 28, 30, {
    width: doc.page.width - 160,
  })
  doc.restore()
}

function footer(page, pages) {
  const previous = doc.page.margins.bottom
  doc.page.margins.bottom = 8
  doc.font("Regular").fontSize(8).fillColor(muted)
  doc.text("Figures come from the 3DJools order database, not a Stripe or PayPal payout export.", 28, doc.page.height - 22, {
    width: 560,
    height: 12,
    lineBreak: false,
  })
  doc.text(`${page} / ${pages}`, doc.page.width - 78, doc.page.height - 22, {
    width: 50,
    height: 12,
    align: "right",
    lineBreak: false,
  })
  doc.page.margins.bottom = previous
}

header("Stripe and PayPal orders, all time")

doc.fillColor(ink).font("Bold").fontSize(16).text("Stripe and PayPal orders", 28, 64)
doc.font("Regular").fontSize(9).fillColor(muted).text(
  "Every store order paid or started through Stripe or PayPal. Square and the earlier Aviagram card checkout are not included.",
  28,
  86,
  { width: 760 },
)

const cards = [
  ["Stripe orders", String(stripe.n), `Collected ${eur(stripe.collectedCents)} EUR`],
  ["PayPal orders", String(paypal.n), `Collected ${eur(paypal.collectedCents)} EUR`],
  ["Collected", eur(allCollected), "Paid, processing, shipped"],
  ["Refunded", eur(allRefunded), "Order totals later refunded"],
  ["Net collected", eur(allCollected - allRefunded), "Collected minus refunded"],
]

cards.forEach((card, index) => {
  const x = 28 + index * 158
  doc.roundedRect(x, 118, 150, 58, 4).fill(paper)
  doc.fillColor(muted).font("Regular").fontSize(8).text(card[0], x + 10, 126, { width: 130, lineBreak: false })
  doc.fillColor(ink).font("Bold").fontSize(13).text(card[1], x + 10, 140, { width: 130, lineBreak: false })
  doc.fillColor(muted).font("Regular").fontSize(7.5).text(card[2], x + 10, 160, { width: 130 })
})

function statusTable(title, summary, x, y) {
  doc.fillColor(ink).font("Bold").fontSize(11).text(title, x, y)
  const statuses = ["shipped", "processing", "paid", "refunded", "awaiting_payment", "cancelled"]
  let rowY = y + 20
  doc.font("Regular").fontSize(8).fillColor(muted)
  doc.text("Status", x, rowY, { lineBreak: false })
  doc.text("Orders", x + 110, rowY, { width: 50, align: "right", lineBreak: false })
  doc.text("EUR", x + 170, rowY, { width: 80, align: "right", lineBreak: false })
  rowY += 14
  doc.moveTo(x, rowY - 3).lineTo(x + 250, rowY - 3).strokeColor(line).stroke()
  for (const status of statuses) {
    const item = summary.byStatus.get(status) || { n: 0, cents: 0 }
    doc.fillColor(ink).font("Regular").fontSize(9)
    doc.text(STATUS[status], x, rowY, { lineBreak: false })
    doc.text(String(item.n), x + 110, rowY, { width: 50, align: "right", lineBreak: false })
    doc.text(eur(item.cents), x + 170, rowY, { width: 80, align: "right", lineBreak: false })
    rowY += 16
  }
  doc.font("Bold").fillColor(collectedColor)
  doc.text("Collected", x, rowY, { lineBreak: false })
  doc.text(String(summary.collectedN), x + 110, rowY, { width: 50, align: "right", lineBreak: false })
  doc.text(eur(summary.collectedCents), x + 170, rowY, { width: 80, align: "right", lineBreak: false })
}

statusTable("Stripe", stripe, 28, 196)
statusTable("PayPal", paypal, 320, 196)

doc.fillColor(ink).font("Bold").fontSize(11).text("Not in this report", 612, 196)
doc.font("Regular").fontSize(9).fillColor(ink)
doc.text(`Square: ${excluded.rows[0].square} orders`, 612, 220, { width: 200 })
doc.text(`Aviagram card: ${excluded.rows[0].aviagram} orders`, 612, 236, { width: 200 })
doc.fillColor(muted).fontSize(8).text(
  "Collected means status paid, processing, or shipped. Awaiting and cancelled orders were started but not completed. Refunded totals are the original order amounts.",
  612,
  268,
  { width: 200 },
)

const firstDate = rows[0]?.created_label?.slice(0, 10) || "—"
const lastDate = rows[rows.length - 1]?.created_label?.slice(0, 10) || "—"
doc.fillColor(muted).font("Regular").fontSize(8).text(
  `Period ${firstDate} – ${lastDate}, Europe/Brussels. ${rows.length} orders. CC is the shipping country: BE Belgium, DE Germany, FR France, NL Netherlands, ES Spain, IT Italy, CY Cyprus, LU Luxembourg, RO Romania, HR Croatia, MT Malta.`,
  28,
  430,
)

const columns = [
  { key: "date", label: "Date", x: 28, w: 72 },
  { key: "order", label: "Order", x: 100, w: 92 },
  { key: "customer", label: "Customer", x: 192, w: 118 },
  { key: "country", label: "CC", x: 310, w: 28 },
  { key: "status", label: "Status", x: 338, w: 62 },
  { key: "method", label: "Method", x: 400, w: 42 },
  { key: "amount", label: "EUR", x: 442, w: 52 },
  { key: "txn", label: "Transaction", x: 496, w: 118 },
  { key: "items", label: "Items", x: 616, w: 198 },
]

const pages = []
let pageRows = []
let y = 0
const rowHeight = 26
const tableTop = 78

function flushPage() {
  if (pageRows.length) pages.push(pageRows)
  pageRows = []
}

for (const row of rows) {
  if (y === 0) y = tableTop
  if (y + rowHeight > 540) {
    flushPage()
    y = tableTop
  }
  pageRows.push(row)
  y += rowHeight
}
flushPage()

const pageCount = pages.length + 1

footer(1, pageCount)

pages.forEach((page, pageIndex) => {
  doc.addPage({ size: "A4", layout: "landscape", margin: 28 })
  header(`Orders  ·  page ${pageIndex + 2}`)
  let rowY = 62
  doc.font("Bold").fontSize(8).fillColor(muted)
  for (const column of columns) {
    doc.text(column.label, column.x, rowY, { width: column.w, lineBreak: false })
  }
  rowY += 14
  doc.moveTo(28, rowY - 3).lineTo(814, rowY - 3).strokeColor(line).stroke()

  page.forEach((row, index) => {
    if (index % 2 === 0) {
      doc.save()
      doc.rect(24, rowY - 3, 794, rowHeight).fill(paper)
      doc.restore()
    }
    const values = {
      date: row.created_label,
      order: row.order_number,
      customer: row.shipping_name || row.email,
      country: COUNTRY[row.shipping_country] || row.shipping_country || "",
      status: row.statusLabel,
      method: row.method,
      amount: eur(row.total_cents),
      txn: row.txn,
      items: row.items,
    }
    doc.fillColor(ink).font("Regular").fontSize(7.5)
    for (const column of columns) {
      const text = column.key === "amount" ? values[column.key] : String(values[column.key] || "")
      doc.text(text, column.x, rowY + 2, {
        width: column.w - 4,
        height: 12,
        ellipsis: true,
        lineBreak: false,
      })
    }
    doc.fillColor(muted).fontSize(6.5).text(row.email, columns[2].x, rowY + 12, {
      width: columns[2].w - 4,
      height: 9,
      ellipsis: true,
      lineBreak: false,
    })
    rowY += rowHeight
  })
  footer(pageIndex + 2, pageCount)
})

doc.end()
await new Promise((resolve, reject) => {
  stream.on("finish", resolve)
  stream.on("error", reject)
})

console.log(JSON.stringify({
  file: OUT,
  orders: rows.length,
  stripe: stripe.n,
  paypal: paypal.n,
  collected: eur(allCollected),
  refunded: eur(allRefunded),
  pages: pageCount,
}))
