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

Dank u voor uw bericht en de duidelijkheid over de nozzle - dat is inderdaad de veiligste keuze bij ASA.

Voor de Bambu Lab X2D met de AMS 2 Pro (4-kleurenmodule) komt de totaalprijs uit op:

- Bambu Lab X2D: EUR 586,49
- Bambu Lab AMS 2 Pro (4 spoelen, automatische materiaalwissel): EUR 298,29
Totaal: EUR 884,78, inclusief btw en gratis verzending.

Levertermijn: 3 tot 7 werkdagen vanaf bestelling (0-2 werkdagen verwerking + 3-5 werkdagen transport).

Zodra u akkoord bent, zet ik beide artikelen voor u klaar in een bestelling, zodat ze samen verzonden worden. Laat het mij gerust weten.

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
    inReplyTo: undefined,
    text,
    html,
  })
  console.log("[v0] Sent:", info.messageId)
} catch (err) {
  console.error("[v0] Send failed:", err)
  process.exit(1)
}
