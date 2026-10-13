import PDFDocument from "pdfkit"
import nodemailer from "nodemailer"
import fs from "node:fs"
import path from "node:path"

const orders = [
  { invoiceNumber: 913, buyer: "Michel Maggi", date: "06/10/2026", amount: "606.69", txnId: "9PY64520G6169761K" },
  { invoiceNumber: 914, buyer: "Sheng Feng", date: "06/10/2026", amount: "606.69", txnId: "6WC56829M7504601D" },
  { invoiceNumber: 915, buyer: "Ferit Veliju", date: "10/10/2026", amount: "630.99", txnId: "6GP27556BC2166437" },
  { invoiceNumber: 916, buyer: "Marko Heinzel", date: "12/10/2026", amount: "630.99", txnId: "75L6577758044603D" },
  { invoiceNumber: 917, buyer: "Chris van de Fliert", date: "06/10/2026", amount: "1899.00", txnId: "7K495200CU4484814" },
  { invoiceNumber: 918, buyer: "Christian Lehnert", date: "11/10/2026", amount: "2599.00", txnId: "2EB53178WV270650C" },
  { invoiceNumber: 919, buyer: "Tim Höhler", date: "11/10/2026", amount: "1099.00", txnId: "36332640AC437912M" },
  { invoiceNumber: 920, buyer: "Heidi Schaffrinna", date: "13/10/2026", amount: "630.99", txnId: "74457110N0683080E" },
]

const SERVICE_LABEL = "Paid services rendered / goods sold"

function buildInvoicePdf(order) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 })
    const chunks = []
    doc.on("data", (c) => chunks.push(c))
    doc.on("end", () => resolve(Buffer.concat(chunks)))
    doc.on("error", reject)

    doc.font("Helvetica-Bold").fontSize(22).text("77 AUTO SERVICE", 50, 50)
    doc.font("Helvetica").fontSize(12).fillColor("#555").text("SERVICE INVOICE", 50, 82)

    doc.fillColor("#000")
    doc.font("Helvetica-Bold").fontSize(10).text("BILL TO", 50, 120)
    doc.font("Helvetica").fontSize(11).text(order.buyer, 50, 136)

    doc.font("Helvetica-Bold").fontSize(10)
    doc.text(`Order date: ${order.date}`, 50, 170)
    doc.text("Service type: General", 50, 184)
    doc.text(`Invoice number: ${order.invoiceNumber}`, 50, 198)

    const tableTop = 230
    doc.font("Helvetica-Bold").fontSize(10)
    doc.text("SERVICE", 50, tableTop)
    doc.text("AMOUNT (EUR)", 400, tableTop)
    doc.moveTo(50, tableTop + 16).lineTo(545, tableTop + 16).strokeColor("#ccc").stroke()

    doc.font("Helvetica").fontSize(10)
    doc.text(SERVICE_LABEL, 50, tableTop + 26, { width: 330 })
    doc.text(`EUR ${order.amount}`, 400, tableTop + 26)

    const totalsTop = tableTop + 80
    doc.moveTo(50, totalsTop - 10).lineTo(545, totalsTop - 10).strokeColor("#ccc").stroke()
    doc.font("Helvetica-Bold").fontSize(11)
    doc.text("TOTAL PAID", 50, totalsTop)
    doc.text(`EUR ${order.amount}`, 400, totalsTop)

    const paymentTop = totalsTop + 60
    doc.font("Helvetica").fontSize(10)
    doc.text("Payment status: Paid", 400, paymentTop)
    doc.text("Payment method: PayPal", 400, paymentTop + 14)
    doc.text("PayPal transaction ID:", 400, paymentTop + 28)
    doc.text(order.txnId, 400, paymentTop + 42)

    doc.end()
  })
}

async function main() {
  const outDir = "/tmp/invoices-77autoservice"
  fs.mkdirSync(outDir, { recursive: true })

  const attachments = []
  for (const order of orders) {
    const buf = await buildInvoicePdf(order)
    const filename = `Invoice_${order.invoiceNumber}_${order.buyer.replace(/\s+/g, "_")}.pdf`
    fs.writeFileSync(path.join(outDir, filename), buf)
    attachments.push({ filename, content: buf })
    console.log("[v0] generated", filename)
  }

  const user = process.env.ZOHO_SMTP_USER || "info@3djools.com"
  const transporter = nodemailer.createTransport({
    host: process.env.ZOHO_SMTP_HOST || "smtp.zoho.eu",
    port: Number(process.env.ZOHO_SMTP_PORT || 465),
    secure: Number(process.env.ZOHO_SMTP_PORT || 465) === 465,
    auth: { user, pass: process.env.ZOHO_SMTP_PASSWORD },
  })

  const info = await transporter.sendMail({
    from: `3DJools <${user}>`,
    to: "info@3djools.com",
    subject: "77 Auto Service — 8 invoices for PayPal proof of fulfillment",
    text: "Attached: 8 invoices (913, 914, 916-921) for the PayPal transactions requiring proof of fulfillment.",
    attachments,
  })
  console.log("[v0] mail sent", JSON.stringify({ accepted: info.accepted, rejected: info.rejected }))
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
