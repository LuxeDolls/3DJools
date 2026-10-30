import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.ZOHO_SMTP_HOST,
  port: Number(process.env.ZOHO_SMTP_PORT || 465),
  secure: true,
  auth: {
    user: process.env.ZOHO_SMTP_USER,
    pass: process.env.ZOHO_SMTP_PASSWORD,
  },
})

const html = `
<div style="background:#000;padding:0;margin:0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#000;">
    <div style="padding:32px 24px 16px;">
      <span style="display:inline-block;background:#f97316;color:#000;font-weight:bold;font-size:20px;padding:6px 10px;border-radius:6px;">D</span>
      <span style="color:#f97316;font-weight:bold;font-size:22px;margin-left:8px;">DnD<span style="color:#fff;">3D</span></span>
      <div style="color:#9ca3af;font-size:12px;letter-spacing:1px;margin-top:8px;text-transform:uppercase;">Serious 3D tools. Honest prices.</div>
    </div>
    <div style="background:#fff7f0;border-radius:16px;margin:0 16px 24px;padding:28px 24px;color:#111;font-size:15px;line-height:1.6;">
      <p>Hola Javier,</p>
      <p>Gracias por tu pregunta, queremos ser totalmente transparentes contigo:</p>
      <p>No somos un distribuidor oficial certificado de Bambu Lab, por lo que no podemos facilitarte un enlace de acreditación como tal. Lo que sí podemos garantizarte es que las unidades que vendemos son 100% nuevas, originales y precintadas de fábrica, adquiridas a través de canales de suministro legítimos, y no unidades reacondicionadas ni de segunda mano.</p>
      <p>En cuanto a la garantía: como vendedor, somos responsables ante ti de la garantía legal de 2 años conforme a la normativa de consumo de la UE, independientemente de nuestro estatus de distribuidor. Esto significa que, en caso de avería, puedes tramitar la garantía directamente con nosotros desde España (reparación, sustitución o reembolso según corresponda), sin necesidad de contactar con Bambu Lab por tu cuenta.</p>
      <p>Entendemos que esta información puede ser relevante para tu decisión de compra, y preferimos dártela con claridad antes de que realices el pedido.</p>
      <p>Quedamos a tu disposición para cualquier otra duda.</p>
      <p>Un saludo,<br/>Equipo DnD3D</p>
    </div>
    <div style="text-align:center;color:#9ca3af;font-size:12px;padding:0 24px 32px;">
      DnD3D · BJX Business Group B.V.<br/>
      Herengracht 449 A, 1017 BR Amsterdam, Netherlands
    </div>
  </div>
</div>
`

const text = `Hola Javier,

Gracias por tu pregunta, queremos ser totalmente transparentes contigo:

No somos un distribuidor oficial certificado de Bambu Lab, por lo que no podemos facilitarte un enlace de acreditación como tal. Lo que sí podemos garantizarte es que las unidades que vendemos son 100% nuevas, originales y precintadas de fábrica, adquiridas a través de canales de suministro legítimos, y no unidades reacondicionadas ni de segunda mano.

En cuanto a la garantía: como vendedor, somos responsables ante ti de la garantía legal de 2 años conforme a la normativa de consumo de la UE, independientemente de nuestro estatus de distribuidor. Esto significa que, en caso de avería, puedes tramitar la garantía directamente con nosotros desde España (reparación, sustitución o reembolso según corresponda), sin necesidad de contactar con Bambu Lab por tu cuenta.

Entendemos que esta información puede ser relevante para tu decisión de compra, y preferimos dártela con claridad antes de que realices el pedido.

Quedamos a tu disposición para cualquier otra duda.

Un saludo,
Equipo DnD3D`

const info = await transporter.sendMail({
  from: `"DnD3D" <${process.env.ZOHO_SMTP_USER}>`,
  to: "Javigump@gmail.com",
  subject: "Re: Bambú lab A1 mini Combo",
  html,
  text,
})

console.log("Sent:", info.messageId)
