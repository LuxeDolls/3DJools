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

const text = `Bonjour Daniel,

Merci pour votre message.

Ce produit est bien un systeme de la marque Creality (le Creality Filament System, CFS), c'est un boitier de stockage et d'alimentation automatique pour plusieurs bobines de filament. En revanche, aucune bobine de filament n'est fournie avec le boitier : les photos montrent le systeme vide, elles illustrent simplement ses 4 emplacements, pas des couleurs de filament incluses.

Si vous souhaitez des bobines Creality de couleurs specifiques, elles doivent etre commandees separement sur notre site, et nous pourrons les reunir dans la meme commande.

N'hesitez pas si vous avez d'autres questions avant de commander.

Bien a vous,
DnD3D`

const html = text
  .split("\n\n")
  .map((p) => `<p>${p.replace(/\n/g, "<br>")}</p>`)
  .join("\n")

try {
  const info = await transporter.sendMail({
    from: `DnD3D <${smtpUser}>`,
    to: "stichlilo1972@hotmail.com",
    subject: "Re: filament . Order: 6977726812306",
    text,
    html,
  })
  console.log("[v0] Sent:", info.messageId)
} catch (err) {
  console.error("[v0] Send failed:", err)
  process.exit(1)
}
