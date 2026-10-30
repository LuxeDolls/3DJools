import nodemailer from "nodemailer"

const mailbox = "info@dnd3d.com"
const configuredUser = process.env.ZOHO_SMTP_USER?.trim()
const smtpUser = configuredUser?.toLowerCase().endsWith("@dnd3d.com") ? configuredUser : mailbox
const smtpHost = process.env.ZOHO_SMTP_HOST ?? "smtp.zoho.eu"
const smtpPort = Number(process.env.ZOHO_SMTP_PORT ?? "465")
const smtpPassword = process.env.ZOHO_SMTP_PASSWORD

if (!smtpPassword) {
  console.error("Missing ZOHO_SMTP_PASSWORD")
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

const text = `Hola Javier,

Gracias por tu interés en la Bambu Lab A1 Mini Combo. Con gusto confirmamos tus preguntas:

1. Stock: Sí, disponemos de stock físico real de este producto, no se trata de preventa ni de dropshipping.
2. Envío a España: Sí, el envío se realiza desde nuestro almacén en Europa (Países Bajos) y está incluido en el precio mostrado en la ficha del producto. El plazo de tramitación del pedido es de 0 a 2 días laborables, y el tránsito hasta España suele tardar entre 3 y 5 días laborables, por lo que el tiempo total estimado es de 3 a 7 días laborables.
3. Autenticidad y garantía: La impresora es 100% nueva y original, directamente de Bambu Lab, con garantía oficial del fabricante.
4. Factura con IVA: Sí, emitimos factura con IVA. Somos BJX Business Group B.V. (NIF-IVA NL861980669B01), con sede en Herengracht 449 A, 1017 BR Ámsterdam, Países Bajos.
5. Plazo de entrega: Como se indica arriba, entre 3 y 7 días laborables desde la confirmación del pedido.

Si tienes cualquier otra duda antes de finalizar tu pedido, quedamos a tu disposición.

Un saludo,
Equipo DnD3D`

const html = `
  <p style="margin:0 0 14px;">Hola Javier,</p>
  <p style="margin:0 0 14px;">Gracias por tu interés en la <strong>Bambu Lab A1 Mini Combo</strong>. Con gusto confirmamos tus preguntas:</p>
  <ol style="margin:0 0 14px;padding-left:20px;">
    <li style="margin-bottom:10px;"><strong>Stock:</strong> Sí, disponemos de stock físico real de este producto, no se trata de preventa ni de dropshipping.</li>
    <li style="margin-bottom:10px;"><strong>Envío a España:</strong> Sí, el envío se realiza desde nuestro almacén en Europa (Países Bajos) y está incluido en el precio mostrado en la ficha del producto. El plazo de tramitación del pedido es de 0 a 2 días laborables, y el tránsito hasta España suele tardar entre 3 y 5 días laborables, por lo que el tiempo total estimado es de 3 a 7 días laborables.</li>
    <li style="margin-bottom:10px;"><strong>Autenticidad y garantía:</strong> La impresora es 100% nueva y original, directamente de Bambu Lab, con garantía oficial del fabricante.</li>
    <li style="margin-bottom:10px;"><strong>Factura con IVA:</strong> Sí, emitimos factura con IVA. Somos BJX Business Group B.V. (NIF-IVA NL861980669B01), con sede en Herengracht 449 A, 1017 BR Ámsterdam, Países Bajos.</li>
    <li style="margin-bottom:0;"><strong>Plazo de entrega:</strong> Como se indica arriba, entre 3 y 7 días laborables desde la confirmación del pedido.</li>
  </ol>
  <p style="margin:0 0 14px;">Si tienes cualquier otra duda antes de finalizar tu pedido, quedamos a tu disposición.</p>
  <p style="margin:0;">Un saludo,<br>Equipo DnD3D</p>
`

const fullHtml = `<!doctype html>
<html lang="es" data-dnd-email="1">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>DnD3D</title>
</head>
<body style="margin:0;padding:0;background:#0c0c0c;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="padding:4px 8px 18px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" height="36" align="center" valign="middle" style="width:36px;height:36px;background:#f97316;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:#111111;line-height:36px;">D</td>
                  <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.4px;line-height:1;color:#ffffff;"><span style="color:#f97316">DnD</span>3D</td>
                </tr>
              </table>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#a3a3a3;">Serious 3D tools. Honest prices.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fffaf7;border:1px solid #f0e4da;border-top:4px solid #f97316;border-radius:18px;padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:#111111;font-size:15px;line-height:1.6;">
              ${html}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 4px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#8a8a8a;">
              DnD3D &middot; BJX Business Group B.V.<br>
              Herengracht 449 A, 1017 BR Amsterdam, Netherlands<br>
              <a href="tel:+3197010267578" style="color:#d4d4d4;text-decoration:none;">+31 970 102 675 78</a>
              &middot;
              <a href="mailto:info@dnd3d.com" style="color:#d4d4d4;text-decoration:none;">info@dnd3d.com</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const result = await transporter.sendMail({
  from: `DnD3D <${smtpUser}>`,
  to: "Javigump@gmail.com",
  replyTo: "info@dnd3d.com",
  subject: "Re: Bambú lab A1 mini Combo",
  html: fullHtml,
  text,
})

console.log("Sent:", result.messageId)
