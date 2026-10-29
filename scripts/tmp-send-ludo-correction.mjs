import nodemailer from "nodemailer"

const smtpUser = process.env.ZOHO_SMTP_USER?.trim() || "info@dnd3d.com"
const smtpHost = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.eu"
const smtpPort = Number(process.env.ZOHO_SMTP_PORT ?? "465")
const smtpPassword = process.env.ZOHO_SMTP_PASSWORD

if (!smtpPassword) {
  console.error("[v0] Missing ZOHO_SMTP_PASSWORD")
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

const text = `Beste Ludo,

Mijn excuses voor de verwarring in mijn vorige bericht - dat klopte niet. De AMS 2 Pro (4-kleurenmodule) zit al inbegrepen in de X2D Combo, u hoeft die dus niet apart aan te schaffen.

De juiste, volledige prijs is dan ook ongewijzigd:

Bambu Lab X2D Combo (incl. AMS 2 Pro): EUR 727,49, inclusief btw en gratis verzending.
Op voorraad.

Levertermijn: 3 tot 7 werkdagen vanaf bestelling (0-2 werkdagen verwerking + 3-5 werkdagen transport).

Nogmaals excuses voor de onduidelijkheid. Zal ik deze voor u klaarzetten?

Met vriendelijke groet,
DnD3D`

const html = text
  .split("\n\n")
  .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
  .join("\n")

try {
  const info = await transporter.sendMail({
    from: `DnD3D <${smtpUser}>`,
    to: "ludo.roovers@telenet.be",
    subject: "Re: bambulab x2d combo",
    text,
    html,
  })
  console.log("[v0] Sent:", info.messageId)
} catch (err) {
  console.error("[v0] Send failed:", err)
  process.exit(1)
}
