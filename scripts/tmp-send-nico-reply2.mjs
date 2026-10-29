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

Bedankt voor de gegevens.

Een belangrijk punt vooraf: deze 3 Bambu Lab X2D Combo's liggen niet op voorraad in ons magazijn in Amsterdam, maar in ons magazijn in Frankrijk. Mocht u ze liever zelf ophalen, dan zou u daarvoor naar ons magazijn in Frankrijk moeten rijden, niet naar Amsterdam.

Voor de zakelijke aankoop op naam van Greenic: stuur ons graag uw volledige bedrijfsgegevens (bedrijfsnaam, adres en btw-nummer), zodat wij een pro-formafactuur kunnen opstellen met btw-verlegging (0% btw), aangezien het om een intracommunautaire levering gaat.

Om het voor u af te ronden: plaats de bestelling van de 3 stuks gewoon via onze webshop. Zodra de bestelling binnen is, stellen wij de pro-formafactuur op.

Daarnaast hebben we, als vriendelijk gebaar en gezien Black Friday eraan komt, besloten u EUR 100 korting per printer te geven op deze bestelling. Dat betekent EUR 100 x 3 = EUR 300 korting in totaal op uw order van 3 stuks.

Laat gerust weten als u nog vragen heeft.

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
    subject: "RE: [DnD3D] Bambu x2d combo",
    text,
    html,
  })
  console.log("[v0] Sent:", info.messageId)
} catch (err) {
  console.error("[v0] Send failed:", err)
  process.exit(1)
}
