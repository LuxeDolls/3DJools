import nodemailer from "nodemailer"

const to = "patrick.lewyllie@telenet.be"
const subject = "Re: U1 Snapmaker"
const text = `Beste Patrick,

Bedankt voor uw bericht.

Wij hebben geen depot in Brugge. De Snapmaker U1 wordt thuis geleverd op het adres dat u bij de bestelling invult. U hoeft daarvoor niets extra te vermelden.

Als u in Bredene woont, vult u dat adres in bij het afrekenen. De verzending blijft gratis. Door de huidige drukte gaat een bestelling die nu binnenkomt op maandag 12 oktober de deur uit. Daarna duurt de levering doorgaans 3 tot 6 werkdagen.

Met vriendelijke groet,
3DJools
info@3djools.com`

const html = `<div style="font-family:Arial,sans-serif;font-size:16px;line-height:1.5;color:#111">
<p>Beste Patrick,</p>
<p>Bedankt voor uw bericht.</p>
<p>Wij hebben geen depot in Brugge. De Snapmaker U1 wordt thuis geleverd op het adres dat u bij de bestelling invult. U hoeft daarvoor niets extra te vermelden.</p>
<p>Als u in Bredene woont, vult u dat adres in bij het afrekenen. De verzending blijft gratis. Door de huidige drukte gaat een bestelling die nu binnenkomt op maandag 12 oktober de deur uit. Daarna duurt de levering doorgaans 3 tot 6 werkdagen.</p>
<p>Met vriendelijke groet,<br>3DJools<br>info@3djools.com</p>
</div>`

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_SMTP_PASSWORD,
  },
})

const info = await transporter.sendMail({
  from: process.env.EMAIL_FROM || "3DJools <info@3djools.com>",
  to,
  replyTo: "info@3djools.com",
  subject,
  text,
  html,
})

console.log(JSON.stringify({ messageId: info.messageId, accepted: info.accepted, rejected: info.rejected }))
