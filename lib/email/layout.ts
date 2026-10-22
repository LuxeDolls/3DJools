import { COMPANY, companyStreetLine } from "@/lib/company"

const ORANGE = "#f97316"
const INK = "#111111"

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
}

export function renderEmail({ preheader, body }: { preheader: string; body: string }): string {
  const hiddenPreheader = escapeHtml(preheader)

  return `<!doctype html>
<html lang="en" data-dnd-email="1">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light dark">
  <title>${COMPANY.tradingName}</title>
</head>
<body style="margin:0;padding:0;background:#0c0c0c;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0c0c0c;">${hiddenPreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c;">
    <tr>
      <td align="center" style="padding:28px 12px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
          <tr>
            <td style="padding:4px 8px 18px;">
              <table role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="36" height="36" align="center" valign="middle" style="width:36px;height:36px;background:${ORANGE};border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:800;color:${INK};line-height:36px;">D</td>
                  <td style="padding-left:10px;font-family:Arial,Helvetica,sans-serif;font-size:22px;font-weight:800;letter-spacing:-0.4px;line-height:1;color:#ffffff;"><span style="color:${ORANGE}">DnD</span>3D</td>
                </tr>
              </table>
              <p style="margin:10px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:#a3a3a3;">Serious 3D tools. Honest prices.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#fffaf7;border:1px solid #f0e4da;border-top:4px solid ${ORANGE};border-radius:18px;padding:32px 28px;font-family:Arial,Helvetica,sans-serif;color:${INK};font-size:15px;line-height:1.6;">
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 8px 4px;text-align:center;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.7;color:#8a8a8a;">
              ${COMPANY.tradingName} · ${COMPANY.legalName}<br>
              ${companyStreetLine}<br>
              <a href="tel:${COMPANY.phoneTel}" style="color:#d4d4d4;text-decoration:none;">${COMPANY.phoneDisplay}</a>
              ·
              <a href="${COMPANY.whatsappUrl}" style="color:#d4d4d4;text-decoration:none;">WhatsApp ${COMPANY.whatsappDisplay}</a>
              ·
              <a href="mailto:${COMPANY.email}" style="color:#d4d4d4;text-decoration:none;">${COMPANY.email}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
