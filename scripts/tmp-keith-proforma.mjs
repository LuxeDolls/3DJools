import PDFDocument from "pdfkit"
import fs from "node:fs"

const out = "/tmp/proforma-PF-20261014-3J4U8.pdf"
const doc = new PDFDocument({ size: "A4", margin: 48 })
const stream = fs.createWriteStream(out)
doc.pipe(stream)

const ink = "#111111"
const muted = "#5c5c5c"
const line = "#d7d7d7"

function euros(cents) {
  return (cents / 100).toFixed(2)
}

function labelValue(label, value, x, y, width) {
  doc.font("Helvetica-Bold").fontSize(8).fillColor(muted).text(label, x, y, { width, lineBreak: false })
  doc.font("Helvetica").fontSize(10).fillColor(ink).text(value, x, y + 12, { width })
}

doc.font("Helvetica-Bold").fontSize(20).fillColor(ink).text("3DJools", 48, 42, { lineBreak: false })
doc.font("Helvetica").fontSize(9).fillColor(muted).text("LN-SQUARED", 48, 66, { lineBreak: false })

doc.font("Helvetica-Bold").fontSize(16).fillColor(ink).text("PROFORMA INVOICE", 320, 46, { width: 227, align: "right" })
doc.font("Helvetica").fontSize(10).fillColor(muted).text("PF-20261014-3J4U8", 320, 68, { width: 227, align: "right" })

doc.moveTo(48, 96).lineTo(547, 96).strokeColor(line).stroke()

labelValue("DATE", "14 October 2026", 48, 112, 150)
labelValue("ORDER", "V3-20261014-3J4U8", 210, 112, 160)
labelValue("CURRENCY", "EUR", 400, 112, 147)

doc.font("Helvetica-Bold").fontSize(8).fillColor(muted).text("FROM", 48, 168)
doc.font("Helvetica").fontSize(10).fillColor(ink).text(
  "LN-SQUARED, trading as 3DJools\nRue du Chénia 17\n7170 Manage, Belgium\nCompany no. 0564.743.304\nVAT BE0564743304\ninfo@3djools.com",
  48,
  182,
  { width: 230 },
)

doc.font("Helvetica-Bold").fontSize(8).fillColor(muted).text("BILL AND SHIP TO", 310, 168)
doc.font("Helvetica").fontSize(10).fillColor(ink).text(
  "Keith Borg\nDigiline Electronics\n148B, Triq il Kungress Ewkaristiku\nMST 9037 Mosta\nMalta\nVAT MT14905436\nborgk17@gmail.com",
  310,
  182,
  { width: 237 },
)

const tableTop = 330
doc.font("Helvetica-Bold").fontSize(8).fillColor(muted)
doc.text("DESCRIPTION", 48, tableTop, { width: 250, lineBreak: false })
doc.text("QTY", 310, tableTop, { width: 40, align: "right", lineBreak: false })
doc.text("UNIT EXCL. VAT", 360, tableTop, { width: 90, align: "right", lineBreak: false })
doc.text("AMOUNT", 455, tableTop, { width: 92, align: "right", lineBreak: false })
doc.moveTo(48, tableTop + 16).lineTo(547, tableTop + 16).strokeColor(line).stroke()

doc.font("Helvetica").fontSize(10).fillColor(ink)
doc.text("Bambu Lab X2D Combo", 48, tableTop + 28, { width: 250 })
doc.text("1", 310, tableTop + 28, { width: 40, align: "right" })
doc.text(euros(70587), 360, tableTop + 28, { width: 90, align: "right" })
doc.text(euros(70587), 455, tableTop + 28, { width: 92, align: "right" })

doc.text("Member discount, 10%", 48, tableTop + 48, { width: 250 })
doc.text(`-${euros(7059)}`, 455, tableTop + 48, { width: 92, align: "right" })

const totalsTop = tableTop + 86
doc.moveTo(320, totalsTop).lineTo(547, totalsTop).strokeColor(line).stroke()

function totalRow(label, value, y, bold = false) {
  doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(10).fillColor(ink)
  doc.text(label, 320, y, { width: 130 })
  doc.text(value, 455, y, { width: 92, align: "right" })
}

totalRow("Subtotal excl. VAT", euros(63528), totalsTop + 12)
totalRow("Belgian VAT 0%", euros(0), totalsTop + 30)
totalRow("Amount due", `EUR ${euros(63528)}`, totalsTop + 54, true)

doc.font("Helvetica-Bold").fontSize(8).fillColor(muted).text("VAT", 48, 500)
doc.font("Helvetica").fontSize(9).fillColor(ink).text(
  "Intra-Community supply of goods to a taxable person in another EU member state. Belgian VAT 0%. Reverse charge applies under Article 138 of Directive 2006/112/EC. VAT number MT14905436 was validated in VIES on 14 October 2026, in the name of Keith Borg.",
  48,
  514,
  { width: 499 },
)

doc.font("Helvetica").fontSize(9).fillColor(ink).text(
  "The order page shows EUR 768.69. That amount includes Belgian VAT at 21% and the 10% member discount. Do not pay that amount. The amount to transfer is EUR 635.28.",
  48,
  568,
  { width: 499 },
)

doc.font("Helvetica-Bold").fontSize(8).fillColor(muted).text("PAYMENT", 48, 620)
doc.font("Helvetica").fontSize(10).fillColor(ink).text(
  "Please transfer EUR 635.28 and use the order number as the payment reference.\nAccount name: SEIMANIS S.R.O.\nIBAN: NL89 FNOM 0347 6766 08\nBIC: FNOMNL22XXX\nReference: V3-20261014-3J4U8",
  48,
  634,
  { width: 499 },
)

doc.font("Helvetica").fontSize(9).fillColor(muted).text(
  "This is a proforma invoice, not a tax invoice. The tax invoice is issued after payment. We dispatch within 0 to 1 business day after the payment arrives. Delivery to Malta is by DHL or DPD, with 3 to 5 business days in transit.",
  48,
  730,
  { width: 499 },
)

doc.end()
await new Promise((resolve, reject) => {
  stream.on("finish", resolve)
  stream.on("error", reject)
})
console.log(out)
