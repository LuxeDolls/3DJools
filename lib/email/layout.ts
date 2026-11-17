import { COMPANY, companyStreetLine } from "@/lib/company"

export type EmailVariant =
  | "invoice"
  | "waybill"
  | "remittance"
  | "verification"
  | "certificate"
  | "passport"

export type EmailRenderInput = {
  preheader: string
  body: string
  variant?: EmailVariant
  eyebrow?: string
  badgeText?: string
  badgeTone?: "cobalt" | "signal" | "emerald" | "amber" | "rose" | "slate"
  referenceLabel?: string
  referenceValue?: string
  headerTitle?: string
  headerSubtitle?: string
  footerNote?: string
}

export const EMAIL_PALETTE = {
  canvas: "#EEF2F8",
  ink: "#0C1530",
  inkSoft: "#131F42",
  cobalt: "#1E40D8",
  cobaltLight: "#EEF2FF",
  cobaltBorder: "#C7D2FE",
  signal: "#FACC15",
  signalInk: "#111827",
  emerald: "#059669",
  emeraldLight: "#ECFDF5",
  emeraldBorder: "#A7F3D0",
  amber: "#D97706",
  amberLight: "#FFFBEB",
  amberBorder: "#FDE68A",
  rose: "#E11D48",
  roseLight: "#FFF1F2",
  roseBorder: "#FECDD3",
  surface: "#FFFFFF",
  surfaceAlt: "#F8FAFC",
  border: "#E2E8F0",
  text: "#0F172A",
  textMuted: "#475569",
  textSubtle: "#64748B",
} as const

export function escapeEmailHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
}

const BADGE_STYLES: Record<
  NonNullable<EmailRenderInput["badgeTone"]>,
  { bg: string; fg: string; border: string }
> = {
  cobalt: { bg: "#1E3A8A", fg: "#DBEAFE", border: "#3B82F6" },
  signal: { bg: "#FACC15", fg: "#0C1530", border: "#EAB308" },
  emerald: { bg: "#065F46", fg: "#D1FAE5", border: "#10B981" },
  amber: { bg: "#FFFBEB", fg: "#92400E", border: "#F59E0B" },
  rose: { bg: "#FFF1F2", fg: "#9F1239", border: "#FDA4AF" },
  slate: { bg: "#1E293B", fg: "#E2E8F0", border: "#475569" },
}

const VARIANT_META: Record<
  EmailVariant,
  {
    topBarColor: string
    mastheadBg: string
    mastheadAccent: string
    defaultEyebrow: string
    defaultTone: NonNullable<EmailRenderInput["badgeTone"]>
    shellBorder: string
  }
> = {
  invoice: {
    topBarColor: "#1E40D8",
    mastheadBg: "#0C1530",
    mastheadAccent: "#FACC15",
    defaultEyebrow: "COMMERCIAL ORDER DOSSIER",
    defaultTone: "signal",
    shellBorder: "#CBD5E1",
  },
  waybill: {
    topBarColor: "#FACC15",
    mastheadBg: "#091126",
    mastheadAccent: "#38BDF8",
    defaultEyebrow: "LOGISTICS & PARCEL TELEMETRY",
    defaultTone: "cobalt",
    shellBorder: "#94A3B8",
  },
  remittance: {
    topBarColor: "#F59E0B",
    mastheadBg: "#131C38",
    mastheadAccent: "#FBBF24",
    defaultEyebrow: "PAYMENT REMITTANCE VOUCHER",
    defaultTone: "amber",
    shellBorder: "#FCD34D",
  },
  verification: {
    topBarColor: "#3B82F6",
    mastheadBg: "#0F172A",
    mastheadAccent: "#60A5FA",
    defaultEyebrow: "OPERATIONS & STATUS BULLETIN",
    defaultTone: "cobalt",
    shellBorder: "#CBD5E1",
  },
  certificate: {
    topBarColor: "#10B981",
    mastheadBg: "#071F1B",
    mastheadAccent: "#34D399",
    defaultEyebrow: "OFFICIAL CONFIRMATION RECORD",
    defaultTone: "emerald",
    shellBorder: "#A7F3D0",
  },
  passport: {
    topBarColor: "#1E40D8",
    mastheadBg: "#0C1530",
    mastheadAccent: "#FACC15",
    defaultEyebrow: "3DEUREKA CLIENT PORTAL",
    defaultTone: "cobalt",
    shellBorder: "#CBD5E1",
  },
}

function renderBrandLogo(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td width="38" height="38" align="center" valign="middle" style="width:38px;height:38px;background:#16244D;border:1px solid #2D4379;border-radius:10px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:900;color:#FACC15;letter-spacing:-0.5px;">
        3D
      </td>
      <td style="padding-left:11px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td style="background:#1E40D8;color:#FFFFFF;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:800;padding:3px 6px;border-radius:5px;letter-spacing:-0.02em;line-height:1;">3D</td>
            <td style="padding-left:5px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:20px;font-weight:800;letter-spacing:-0.03em;color:#FFFFFF;line-height:1;">Eureka</td>
            <td valign="top" style="padding-left:3px;padding-top:1px;">
              <span style="display:inline-block;width:6px;height:6px;border-radius:999px;background:#FACC15;"></span>
            </td>
          </tr>
        </table>
        <div style="margin-top:4px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#94A3B8;">
          Additive &amp; Laser Systems
        </div>
      </td>
    </tr>
  </table>`
}

export function renderEmailButton(
  label: string,
  href: string,
  tone: "cobalt" | "signal" | "emerald" | "ink" = "cobalt",
): string {
  if (!href) return ""
  const palette = {
    cobalt: { bg: "#1E40D8", fg: "#FFFFFF", border: "#1E3A8A" },
    signal: { bg: "#FACC15", fg: "#0C1530", border: "#EAB308" },
    emerald: { bg: "#059669", fg: "#FFFFFF", border: "#047857" },
    ink: { bg: "#0C1530", fg: "#FFFFFF", border: "#0C1530" },
  }[tone]

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0;">
    <tr>
      <td align="center" style="border-radius:10px;background:${palette.bg};border:1px solid ${palette.border};">
        <a href="${escapeEmailHtml(href)}" style="display:inline-block;padding:13px 24px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;font-weight:700;color:${palette.fg};text-decoration:none;letter-spacing:-0.01em;line-height:1.2;">
          ${escapeEmailHtml(label)} &rarr;
        </a>
      </td>
    </tr>
  </table>`
}

export function renderStepTracker(steps: string[], activeIndex: number, accentColor = "#1E40D8"): string {
  const widthPct = Math.floor(100 / steps.length)
  const cells = steps
    .map((label, idx) => {
      const isDone = idx < activeIndex
      const isCurrent = idx === activeIndex
      const dotBg = isDone ? "#059669" : isCurrent ? accentColor : "#E2E8F0"
      const dotFg = isDone || isCurrent ? "#FFFFFF" : "#64748B"
      const textColor = isCurrent ? "#0F172A" : isDone ? "#059669" : "#64748B"
      const fontWeight = isCurrent || isDone ? "700" : "500"
      const barColor = isDone ? "#059669" : isCurrent ? accentColor : "#E2E8F0"
      const marker = isDone ? "&#10003;" : String(idx + 1)

      return `<td width="${widthPct}%" valign="top" style="padding:0 4px;">
        <div style="height:4px;border-radius:999px;background:${barColor};margin-bottom:8px;"></div>
        <table role="presentation" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="20" height="20" align="center" valign="middle" style="width:20px;height:20px;border-radius:999px;background:${dotBg};color:${dotFg};font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:800;line-height:20px;">
              ${marker}
            </td>
            <td style="padding-left:6px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:${fontWeight};color:${textColor};line-height:1.25;">
              ${escapeEmailHtml(label)}
            </td>
          </tr>
        </table>
      </td>`
    })
    .join("")

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;background:#F8FAFC;border:1px solid #E2E8F0;border-radius:12px;padding:12px 10px;">
    <tr>${cells}</tr>
  </table>`
}

export function renderEmail(input: EmailRenderInput): string {
  const variant = input.variant ?? "passport"
  const meta = VARIANT_META[variant]
  const hiddenPreheader = escapeEmailHtml(input.preheader)
  const eyebrow = escapeEmailHtml(input.eyebrow ?? meta.defaultEyebrow)
  const tone = input.badgeTone ?? meta.defaultTone
  const badgeStyle = BADGE_STYLES[tone]

  const badgeHtml = input.badgeText
    ? `<span style="display:inline-block;padding:5px 11px;border-radius:999px;background:${badgeStyle.bg};border:1px solid ${badgeStyle.border};color:${badgeStyle.fg};font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:800;letter-spacing:0.06em;text-transform:uppercase;line-height:1;">
        ${escapeEmailHtml(input.badgeText)}
      </span>`
    : ""

  const refBandHtml =
    input.referenceValue || input.headerTitle
      ? `<tr>
          <td style="background:${meta.mastheadBg};padding:0 28px 24px;border-bottom:1px solid #1E293B;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td valign="bottom">
                  <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${meta.mastheadAccent};margin-bottom:6px;">
                    ${eyebrow}
                  </div>
                  ${
                    input.headerTitle
                      ? `<h1 style="margin:0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.02em;line-height:1.22;color:#FFFFFF;">
                          ${escapeEmailHtml(input.headerTitle)}
                        </h1>`
                      : ""
                  }
                  ${
                    input.headerSubtitle
                      ? `<p style="margin:6px 0 0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:14px;line-height:1.5;color:#CBD5E1;">
                          ${escapeEmailHtml(input.headerSubtitle)}
                        </p>`
                      : ""
                  }
                </td>
                ${
                  input.referenceValue
                    ? `<td align="right" valign="bottom" style="padding-left:16px;white-space:nowrap;">
                        <div style="display:inline-block;text-align:right;background:#162244;border:1px solid #2B3D6B;border-radius:10px;padding:8px 12px;">
                          <div style="font-family:'Helvetica Neue',Arial,sans-serif;font-size:10px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#94A3B8;">
                            ${escapeEmailHtml(input.referenceLabel ?? "REFERENCE")}
                          </div>
                          <div style="margin-top:3px;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:13px;font-weight:700;color:#FACC15;">
                            ${escapeEmailHtml(input.referenceValue)}
                          </div>
                        </div>
                      </td>`
                    : ""
                }
              </tr>
            </table>
          </td>
        </tr>`
      : ""

  const variantSubbarHtml =
    variant === "waybill"
      ? `<tr>
          <td style="background:#132042;padding:8px 28px;border-bottom:1px solid #1E293B;font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;color:#93C5FD;letter-spacing:0.06em;">
            DISPATCH ORIGIN: ANTWERPEN EU HUB &nbsp;&bull;&nbsp; CARRIER TELEMETRY ACTIVE
          </td>
        </tr>`
      : variant === "remittance"
        ? `<tr>
            <td style="background:#FEF3C7;padding:9px 28px;border-bottom:1px solid #FDE68A;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;color:#92400E;">
              Stock reservation active &mdash; complete payment or confirm transfer on your order page
            </td>
          </tr>`
        : variant === "certificate"
          ? `<tr>
              <td style="background:#ECFDF5;padding:9px 28px;border-bottom:1px solid #A7F3D0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:12px;font-weight:700;color:#065F46;">
                Verified by ${escapeEmailHtml(COMPANY.tradingName)} (${escapeEmailHtml(COMPANY.legalName)}) &bull; VAT ${escapeEmailHtml(COMPANY.vat)}
              </td>
            </tr>`
          : ""

  return `<!doctype html>
<html lang="en" data-dnd-email="1" data-email-variant="${variant}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeEmailHtml(COMPANY.tradingName)}</title>
</head>
<body style="margin:0;padding:0;background:${EMAIL_PALETTE.canvas};-webkit-font-smoothing:antialiased;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${EMAIL_PALETTE.canvas};">${hiddenPreheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${EMAIL_PALETTE.canvas};">
    <tr>
      <td align="center" style="padding:28px 12px 36px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px;background:${EMAIL_PALETTE.surface};border:1px solid ${meta.shellBorder};border-radius:18px;overflow:hidden;box-shadow:0 8px 28px rgba(12,21,48,0.07);">
          <tr>
            <td style="height:5px;background:${meta.topBarColor};font-size:0;line-height:0;">&nbsp;</td>
          </tr>
          <tr>
            <td style="background:${meta.mastheadBg};padding:22px 28px 18px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="middle">
                    <a href="${escapeEmailHtml(COMPANY.url)}" style="text-decoration:none;">
                      ${renderBrandLogo()}
                    </a>
                  </td>
                  <td align="right" valign="middle">
                    ${badgeHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${refBandHtml}
          ${variantSubbarHtml}
          <tr>
            <td style="padding:28px 28px 30px;font-family:'Helvetica Neue',Arial,sans-serif;color:${EMAIL_PALETTE.text};font-size:15px;line-height:1.6;">
              ${input.body}
            </td>
          </tr>
          <tr>
            <td style="background:#F8FAFC;border-top:1px solid #E2E8F0;padding:18px 28px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td width="33%" valign="top" style="padding-right:8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.45;color:#475569;">
                    <strong style="color:#0F172A;display:block;margin-bottom:2px;">EU Dispatch</strong>
                    0&ndash;2 business days processing &bull; 3&ndash;5 days in transit
                  </td>
                  <td width="34%" valign="top" style="padding:0 8px;border-left:1px solid #E2E8F0;border-right:1px solid #E2E8F0;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.45;color:#475569;">
                    <strong style="color:#0F172A;display:block;margin-bottom:2px;">30-Day Free Returns</strong>
                    Prepaid return label &bull; Refund within 7 business days
                  </td>
                  <td width="33%" valign="top" style="padding-left:8px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.45;color:#475569;">
                    <strong style="color:#0F172A;display:block;margin-bottom:2px;">Direct Support</strong>
                    <a href="mailto:${escapeEmailHtml(COMPANY.email)}" style="color:#1E40D8;text-decoration:none;font-weight:600;">${escapeEmailHtml(COMPANY.email)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="background:#0C1530;padding:18px 28px;font-family:'Helvetica Neue',Arial,sans-serif;font-size:11px;line-height:1.65;color:#94A3B8;">
              ${
                input.footerNote
                  ? `<div style="margin-bottom:10px;padding-bottom:10px;border-bottom:1px solid #1E293B;color:#CBD5E1;">${escapeEmailHtml(input.footerNote)}</div>`
                  : ""
              }
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td valign="top" style="color:#94A3B8;">
                    <strong style="color:#FFFFFF;">${escapeEmailHtml(COMPANY.tradingName)}</strong> &middot; ${escapeEmailHtml(COMPANY.legalName)} (CommV)<br>
                    ${escapeEmailHtml(companyStreetLine)} &middot; KBO ${escapeEmailHtml(COMPANY.companyNumber)} &middot; VAT ${escapeEmailHtml(COMPANY.vat)}
                  </td>
                  <td align="right" valign="top" style="white-space:nowrap;padding-left:12px;">
                    <a href="mailto:${escapeEmailHtml(COMPANY.email)}" style="color:#93C5FD;text-decoration:none;">${escapeEmailHtml(COMPANY.email)}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
