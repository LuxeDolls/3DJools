import PDFDocument from "pdfkit"
import fs from "node:fs"
import path from "node:path"
import nodemailer from "nodemailer"

const OUT_DIR = "/tmp/invoices"
fs.mkdirSync(OUT_DIR, { recursive: true })

const orders = [
  {
    invoiceNumber: 914,
    buyer: "Michel Maggi",
    orderDate: "10/06/2026",
    amount: "606.69",
    transactionId: "9PY64520G6169761K",
  },
  {
    invoiceNumber: 915,
    buyer: "Sheng Feng",
    orderDate: "10/06/2026",
    amount: "606.69",
    transactionId: "6WC56829M7504601D",
  },
  {
    invoiceNumber: 916,
    buyer: "Ferit Veliju",
    orderDate: "10/10/2026",
    amount: "630.99",
    transactionId: "6GP27556BC2166437",
  },
  {
    invoiceNumber: 917,
    buyer: "Marko Heinzel",
    orderDate: "10/12/2026",
    amount: "630.99",
    transactionId: "75L6577758044603D",
  },
  {
    invoiceNumber: 918,
    buyer: "Chris van de Fliert",
    orderDate: "10/06/2026",
    amount: "671.49",
    transactionId: "7K495200CU4484814",
  },
  {
    invoiceNumber: 919,
    buyer: "Christian Lehnert",
    orderDate: "10/11/2026",
    amount: "2024.19",
    transactionId: "2EB53178WV270650C",
  },
  {
    invoiceNumber: 920,
    buyer: "Tim Höhler",
    orderDate: "10/11/2026",
    amount: "396.09",
    transactionId: "36332640AC437912M",
  },
  {
    invoiceNumber: 921,
    buyer: "Heidi Schaffrinna",
    orderDate: "10/13/2026",
    amount: "701.10",
    transactionId: "74457110N0683080E",
  },
]

function money(v) {
  return `EUR ${v}`
}

function buildInvoice(order) {
  const filePath = path.join(OUT_DIR, `Invoice_${order.invoiceNumber}_${order.buyer.replace(/\s+/g, "_")}.pdf`)
  const doc = new PDFDocument({ size: "A4", margin: 56 })
  doc.pipe(fs.createWriteStream(filePath))

  doc.fontSize(20).font("Helvetica-Bold").text("77 AUTO SERVICE", { align: "left" })
  doc.moveDown(0.3)
  doc.fontSize(13).font("Helvetica-Bold").fillColor("#444").text("SERVICE INVOICE")
  doc.fillColor("#000")
  doc.moveDown(1.2)

  doc.fontSize(10).font("Helvetica-Bold").text("BILL TO")
  doc.fontSize(12).font("Helvetica").text(order.buyer)
  doc.moveDown(0.6)

  doc.fontSize(10).font("Helvetica-Bold").text(`Order date: ${order.orderDate}`)
  doc.font("Helvetica-Bold").text("Service type: General")
  doc.font("Helvetica-Bold").text(`Invoice number: ${order.invoiceNumber}`)
  doc.moveDown(1)

  const tableTop = doc.y
  const col1 = 56
  const col2 = 420
  doc.font("Helvetica-Bold").fontSize(10)
  doc.text("SERVICE", col1, tableTop)
  doc.text("AMOUNT (EUR)", col2, tableTop)
  doc.moveTo(col1, tableTop + 16).lineTo(540, tableTop + 16).strokeColor("#ccc").stroke()

  const rowY = tableTop + 26
  doc.font("Helvetica").fontSize(11)
  doc.text("Оказание платных услуг / продажа товара", col1, rowY, { width: col2 - col1 - 10 })
  doc.text(money(order.amount), col2, rowY)

  const totalY = rowY + 40
  doc.moveTo(col1, totalY).lineTo(540, totalY).strokeColor("#ccc").stroke()
  doc.font("Helvetica-Bold").fontSize(12)
  doc.text("TOTAL PAID", col1, totalY + 10)
  doc.text(money(order.amount), col2, totalY + 10)

  doc.moveDown(4)
  doc.font("Helvetica").fontSize(10)
  doc.text("Payment status: Paid")
  doc.text("Payment method: PayPal")
  doc.text(`PayPal transaction ID: ${order.transactionId}`)

  doc.end()
  return filePath
}

const files = orders.map(buildInvoice)

await new Promise((resolve) => setTimeout(resolve, 500))

const user = process.env.ZOHO_SMTP_USER || "info@3djools.com"
const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.eu",
  port: Number(process.env.ZOHO_SMTP_PORT || 465),
  secure: Number(process.env.ZOHO_SMTP_PORT || 465) === 465,
  auth: { user, pass: process.env.ZOHO_SMTP_PASSWORD },
})

await transporter.sendMail({
  from: `3DJools <${user}>`,
  to: user,
  subject: "77 Auto Service — 8 invoices for PayPal proof of fulfillment",
  text: "Attached: 8 invoices (914-921) for the PayPal transactions requiring proof of fulfillment.",
  attachments: files.map((f) => ({ filename: path.basename(f), path: f })),
})

console.log("Sent", files.length, "invoices to", user)
