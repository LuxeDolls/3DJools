import Script from "next/script"
import { CONSENT_KEY } from "./consent"

export const GTM_ID = "GTM-M4FLXZ78"

// Consent Mode v2 defaults must be queued before gtm.js runs. Returning visitors who
// already accepted get analytics_storage granted immediately; ads signals stay denied.
const bootstrap = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = window.gtag || gtag;
var analytics = 'denied';
try {
  var saved = JSON.parse(localStorage.getItem(${JSON.stringify(CONSENT_KEY)}) || 'null');
  if (saved && saved.value === 'all') analytics = 'granted';
} catch (e) {}
gtag('consent', 'default', {
  analytics_storage: analytics,
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  functionality_storage: 'granted',
  security_storage: 'granted',
  wait_for_update: 500
});
gtag('js', new Date());
dataLayer.push({'gtm.start': new Date().getTime(), event: 'gtm.js'});
`

export function GoogleTag() {
  return (
    <>
      <Script id="google-tag-consent" strategy="beforeInteractive">
        {bootstrap}
      </Script>
      <Script
        id="google-tag-manager"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GTM_ID}`}
      />
    </>
  )
}

export function GoogleTagNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
        title="Google Tag Manager"
      />
    </noscript>
  )
}
