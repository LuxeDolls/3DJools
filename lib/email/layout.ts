import { COMPANY, companyStreetLine } from "@/lib/company"

export type EmailVariant =
  | "invoice"
  | "waybill"
  | "remittance"
  | "verification"
  | "certificate"
  | "passport"

export type EmailTone = "cobalt" | "signal" | "emerald" | "amber" | "rose" | "slate"

export type EmailRenderInput = {
  preheader: string
  body: string
  variant?: EmailVariant
  /** Kept for backwards compatibility; no longer rendered. */
  eyebrow?: string
  badgeText?: string
  badgeTone?: EmailTone
  referenceLabel?: string
  referenceValue?: string
  headerTitle?: string
  headerSubtitle?: string
  footerNote?: string
}

export const EMAIL_PALETTE = {
  canvas: "#F3F5F9",
  surface: "#FFFFFF",
  surfaceAlt: "#F7F8FB",
  border: "#E3E7EF",
  ink: "#0F1A3A",
  text: "#0F1A3A",
  textMuted: "#4B5568",
  textSubtle: "#6B7385",
  primary: "#2446D8",
  primarySoft: "#EEF2FD",
  success: "#0F7A4F",
  successSoft: "#EAF6F0",
  warning: "#8A5300",
  warningSoft: "#FDF5E6",
  danger: "#B42318",
  dangerSoft: "#FDEEEC",
} as const

const P = EMAIL_PALETTE

export const EMAIL_FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"
export const EMAIL_MONO = "ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace"

export function escapeEmailHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

type ToneStyle = { bg: string; fg: string; accent: string }

const TONES: Record<EmailTone, ToneStyle> = {
  cobalt: { bg: P.primarySoft, fg: P.primary, accent: P.primary },
  signal: { bg: P.primarySoft, fg: P.primary, accent: P.primary },
  slate: { bg: P.surfaceAlt, fg: P.textMuted, accent: P.textMuted },
  emerald: { bg: P.successSoft, fg: P.success, accent: P.success },
  amber: { bg: P.warningSoft, fg: P.warning, accent: P.warning },
  rose: { bg: P.dangerSoft, fg: P.danger, accent: P.danger },
}

const VARIANT_TONE: Record<EmailVariant, EmailTone> = {
  invoice: "cobalt",
  waybill: "cobalt",
  remittance: "amber",
  verification: "cobalt",
  certificate: "emerald",
  passport: "cobalt",
}

export function emailTone(tone: EmailTone): ToneStyle {
  return TONES[tone]
}

function sentenceCase(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed !== trimmed.toUpperCase()) return trimmed
  const lower = trimmed.toLowerCase()
  return lower.charAt(0).toUpperCase() + lower.slice(1)
}

/* ---------- Building blocks used by every template ---------- */

export function emailParagraph(html: string, options: { muted?: boolean; size?: number } = {}): string {
  const color = options.muted ? P.textMuted : P.text
  const size = options.size ?? 15
  return `<p style="margin:0 0 16px;font-family:${EMAIL_FONT};font-size:${size}px;line-height:1.6;color:${color};text-align:left;">${html}</p>`
}

export function emailSectionTitle(text: string): string {
  return `<p style="margin:24px 0 10px;font-family:${EMAIL_FONT};font-size:13px;font-weight:700;line-height:1.4;color:${P.text};text-align:left;">${escapeEmailHtml(text)}</p>`
}

export function emailNotice(options: { tone?: EmailTone; title?: string; html: string }): string {
  const tone = TONES[options.tone ?? "cobalt"]
  const title = options.title
    ? `<p style="margin:0 0 4px;font-family:${EMAIL_FONT};font-size:14px;font-weight:700;line-height:1.4;color:${tone.fg};">${escapeEmailHtml(options.title)}</p>`
    : ""
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-collapse:separate;">
    <tr>
      <td style="background:${tone.bg};border-radius:10px;padding:14px 16px;text-align:left;">
        ${title}
        <p style="margin:0;font-family:${EMAIL_FONT};font-size:14px;line-height:1.55;color:${P.text};">${options.html}</p>
      </td>
    </tr>
  </table>`
}

export type EmailDetailRow = {
  label: string
  /** Pre-escaped HTML. */
  value: string
  mono?: boolean
  /** Let long monospace values (e.g. wallet addresses) break across lines. */
  wrap?: boolean
  strong?: boolean
}

export function emailDetails(rows: EmailDetailRow[], options: { title?: string } = {}): string {
  const visible = rows.filter((row) => row.value)
  if (!visible.length) return ""
  const body = visible
    .map((row, idx) => {
      const border = idx === visible.length - 1 ? "" : `border-bottom:1px solid ${P.border};`
      const valueFont = row.mono
        ? `font-family:${EMAIL_MONO};font-size:13px;${row.wrap ? "word-break:break-all;" : "white-space:nowrap;"}`
        : `font-family:${EMAIL_FONT};font-size:14px;word-break:break-word;`
      const weight = row.strong ? "700" : "600"
      return `<tr>
        <td valign="top" style="padding:11px 0;${border}font-family:${EMAIL_FONT};font-size:14px;line-height:1.45;color:${P.textSubtle};text-align:left;">${escapeEmailHtml(row.label)}</td>
        <td valign="top" style="padding:11px 0 11px 12px;${border}${valueFont}line-height:1.45;font-weight:${weight};color:${P.text};text-align:right;">${row.value}</td>
      </tr>`
    })
    .join("")
  return `${options.title ? emailSectionTitle(options.title) : ""}<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;border-top:1px solid ${P.border};border-bottom:1px solid ${P.border};">${body}</table>`
}

export function renderEmailButton(
  label: string,
  href: string,
  tone: "cobalt" | "signal" | "emerald" | "ink" = "cobalt",
): string {
  if (!href) return ""
  const bg = tone === "emerald" ? P.success : tone === "ink" ? P.ink : P.primary
  const safeHref = escapeEmailHtml(href)
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 8px;">
    <tr>
      <td align="center">
        <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeHref}" style="height:48px;v-text-anchor:middle;width:280px;" arcsize="17%" stroke="f" fillcolor="${bg}"><center style="color:#FFFFFF;font-family:Arial,sans-serif;font-size:15px;font-weight:bold;">${escapeEmailHtml(label)}</center></v:roundrect><![endif]-->
        <!--[if !mso]><!-- --><a href="${safeHref}" style="display:inline-block;background:${bg};color:#FFFFFF;font-family:${EMAIL_FONT};font-size:15px;font-weight:700;line-height:20px;text-decoration:none;padding:14px 28px;border-radius:8px;mso-hide:all;">${escapeEmailHtml(label)}</a><!--<![endif]-->
      </td>
    </tr>
  </table>`
}

export function emailLink(label: string, href: string): string {
  if (!href) return ""
  return `<p style="margin:4px 0 0;font-family:${EMAIL_FONT};font-size:14px;line-height:1.5;text-align:center;"><a href="${escapeEmailHtml(href)}" style="color:${P.primary};font-weight:600;text-decoration:underline;">${escapeEmailHtml(label)}</a></p>`
}

/**
 * Compact progress indicator: one segmented bar plus a single caption line,
 * so it never overflows or wraps awkwardly on narrow screens.
 */
export function renderStepTracker(steps: string[], activeIndex: number, accentColor: string = P.primary): string {
  if (!steps.length) return ""
  const current = Math.min(Math.max(activeIndex, 0), steps.length - 1)
  const accent = accentColor.toUpperCase() === "#059669" ? P.success : accentColor.toUpperCase() === "#1E40D8" ? P.primary : accentColor
  const width = Math.floor(100 / steps.length)
  const segments = steps
    .map((_, idx) => {
      const color = idx <= current ? accent : P.border
      const gap = idx === steps.length - 1 ? "" : "padding-right:4px;"
      return `<td width="${width}%" style="${gap}"><div style="height:6px;line-height:6px;font-size:0;border-radius:3px;background:${color};">&nbsp;</div></td>`
    })
    .join("")
  const next = steps[current + 1]
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 8px;"><tr>${segments}</tr></table>
  <p style="margin:0 0 24px;font-family:${EMAIL_FONT};font-size:13px;line-height:1.5;color:${P.textMuted};text-align:left;">
    <strong style="color:${P.text};">Step ${current + 1} of ${steps.length}:</strong> ${escapeEmailHtml(steps[current])}${next ? ` &middot; Next: ${escapeEmailHtml(next)}` : ""}
  </p>`
}

/* ---------- Document shell ---------- */

function renderLogo(): string {
  return `<a href="${escapeEmailHtml(COMPANY.url)}" style="text-decoration:none;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="background:${P.primary};border-radius:6px;padding:4px 7px;font-family:${EMAIL_FONT};font-size:14px;font-weight:800;line-height:1;color:#FFFFFF;">3D</td>
        <td style="padding-left:6px;font-family:${EMAIL_FONT};font-size:20px;font-weight:800;line-height:1;letter-spacing:-0.3px;color:${P.ink};">Eureka</td>
      </tr>
    </table>
  </a>`
}

export function renderEmail(input: EmailRenderInput): string {
  const variant = input.variant ?? "passport"
  const tone = TONES[input.badgeTone ?? VARIANT_TONE[variant]]
  const preheader = escapeEmailHtml(input.preheader)

  const badge = input.badgeText
    ? `<span style="display:inline-block;background:${tone.bg};color:${tone.fg};font-family:${EMAIL_FONT};font-size:12px;font-weight:700;line-height:1;padding:6px 10px;border-radius:999px;">${escapeEmailHtml(sentenceCase(input.badgeText))}</span>`
    : ""

  const reference = input.referenceValue
    ? `<p style="margin:12px 0 0;font-family:${EMAIL_FONT};font-size:13px;line-height:1.5;color:${P.textSubtle};">${escapeEmailHtml(sentenceCase(input.referenceLabel ?? "Reference"))}: <span style="font-family:${EMAIL_MONO};font-weight:700;color:${P.text};">${escapeEmailHtml(input.referenceValue)}</span></p>`
    : ""

  const intro =
    input.headerTitle || badge
      ? `<tr>
          <td class="px" style="padding:28px 36px 4px;text-align:left;">
            ${badge ? `<div style="margin:0 0 14px;">${badge}</div>` : ""}
            ${input.headerTitle ? `<h1 style="margin:0;font-family:${EMAIL_FONT};font-size:24px;font-weight:800;line-height:1.3;letter-spacing:-0.3px;color:${P.text};">${escapeEmailHtml(input.headerTitle)}</h1>` : ""}
            ${input.headerSubtitle ? `<p style="margin:8px 0 0;font-family:${EMAIL_FONT};font-size:15px;line-height:1.55;color:${P.textMuted};">${escapeEmailHtml(input.headerSubtitle)}</p>` : ""}
            ${reference}
          </td>
        </tr>`
      : ""

  const footerNote = input.footerNote
    ? `<p style="margin:0 0 12px;font-family:${EMAIL_FONT};font-size:13px;line-height:1.55;color:${P.textMuted};">${escapeEmailHtml(input.footerNote)}</p>`
    : ""

  return `<!doctype html>
<html lang="en" dir="ltr" data-dnd-email="1" data-email-variant="${variant}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeEmailHtml(COMPANY.tradingName)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
  <style>
    body,table,td,p,a{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;}
    table,td{mso-table-lspace:0pt;mso-table-rspace:0pt;}
    table{border-collapse:collapse;}
    a{color:${P.primary};}
    @media only screen and (max-width:620px){
      .shell{width:100% !important;border-radius:0 !important;}
      .px{padding-left:20px !important;padding-right:20px !important;}
      .outer{padding:0 !important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background:${P.canvas};">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">${preheader}&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;&#8203;&nbsp;</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${P.canvas};">
    <tr>
      <td class="outer" align="center" style="padding:32px 12px;">
        <!--[if mso]><table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0"><tr><td><![endif]-->
        <table role="presentation" class="shell" width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;background:${P.surface};border:1px solid ${P.border};border-radius:14px;border-collapse:separate;overflow:hidden;">
          <tr>
            <td class="px" style="padding:24px 36px 20px;border-bottom:1px solid ${P.border};text-align:left;">
              ${renderLogo()}
            </td>
          </tr>
          ${intro}
          <tr>
            <td class="px" style="padding:24px 36px 32px;font-family:${EMAIL_FONT};font-size:15px;line-height:1.6;color:${P.text};text-align:left;">
              ${input.body}
            </td>
          </tr>
          <tr>
            <td class="px" style="padding:20px 36px;background:${P.surfaceAlt};border-top:1px solid ${P.border};text-align:left;">
              <p style="margin:0;font-family:${EMAIL_FONT};font-size:13px;line-height:1.55;color:${P.textMuted};">
                Questions? Reply to this email or write to <a href="mailto:${escapeEmailHtml(COMPANY.email)}" style="color:${P.primary};font-weight:600;text-decoration:none;">${escapeEmailHtml(COMPANY.email)}</a>.
              </p>
              <p style="margin:6px 0 0;font-family:${EMAIL_FONT};font-size:13px;line-height:1.55;color:${P.textMuted};">
                Dispatch in 0&ndash;2 business days &middot; Delivery in 3&ndash;5 days &middot; 30-day free returns
              </p>
            </td>
          </tr>
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
        <table role="presentation" width="600" align="center" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;margin:0 auto;">
          <tr>
            <td class="px" align="center" style="padding:20px 24px 0;font-family:${EMAIL_FONT};font-size:12px;line-height:1.6;color:${P.textSubtle};text-align:center;">
              ${footerNote}
              <strong style="color:${P.textMuted};">${escapeEmailHtml(COMPANY.tradingName)}</strong> is operated by ${escapeEmailHtml(COMPANY.legalName)} CommV<br>
              ${escapeEmailHtml(companyStreetLine)}<br>
              KBO ${escapeEmailHtml(COMPANY.companyNumber)} &middot; VAT ${escapeEmailHtml(COMPANY.vat)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
