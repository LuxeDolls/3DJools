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

const text = `Beste Nico,

Bedankt voor uw interesse in de Bambu Lab X2D Combo.

3 stuks zijn op voorraad, dus dat is geen probleem. Om u een passende prijs op maat te kunnen geven, had ik graag nog het volgende geweten:

1. Bestelt u als particulier of als bedrijf (met btw-nummer)?
2. Naar welk land/adres moeten de 3 toestellen geleverd worden?
3. Is er een gewenste levertermijn, of mag de standaardtermijn van 3 tot 7 werkdagen aangehouden worden?
4. Wenst u de 3 stuks in een en dezelfde bestelling/verzending, of apart?

Zodra ik dit weet, stel ik u graag een scherpe offerte voor de 3 stuks samen op.

Met vriendelijke groet,
DnD3D`

const html = text
  .split("\n\n")
  .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
  .join("\n")

try {
  const info = await transporter.sendMail({
    from: `DnD3D <${smtpUser}>`,
    to: "nico.oudshoorn@outlook.com",
    subject: "Re: [DnD3D] Bambu x2d combo",
    text,
    html,
  })
  console.log("[v0] Sent:", info.messageId)
} catch (err) {
  console.error("[v0] Send failed:", err)
  process.exit(1)
}
