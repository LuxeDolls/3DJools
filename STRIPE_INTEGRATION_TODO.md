# Stripe Checkout

Hosted Checkout is wired to card orders. The amount comes from the order in the database, not from the browser.

## Values to Replace

No Checkout Studio placeholders remain in code.

**Files containing the live values:**
- [lib/payments/stripe.ts](lib/payments/stripe.ts)

| Field | Current value | What to set |
| --- | --- | --- |
| mode | `payment` | One-time card payment. Do not change unless the store starts selling subscriptions. |
| success_url | `https://www.3djools.com/api/payments/stripe/return?order=...&session_id={CHECKOUT_SESSION_ID}` | Already the order return route. Keep `{CHECKOUT_SESSION_ID}`. |
| cancel_url | `https://www.3djools.com/{locale}/order/{orderNumber}?stripe=cancelled` | Already the unpaid order page. |
| line_items | `price_data` for the stored euro total | Do not replace this with a Dashboard Price ID. Catalog prices live in the database and can include discounts. |

## Configured Parameters

These Checkout Studio values are set in [lib/payments/stripe.ts](lib/payments/stripe.ts).

| Parameter | Value |
| --- | --- |
| ui_mode | `hosted_page` |
| billing_address_collection | `auto` |
| phone_number_collection | `{ enabled: true }` |
| automatic_tax | `{ enabled: false }` |
| allow_promotion_codes | `false` |
| submit_type | `auto` |
| name_collection | individual and business, both optional |
| saved_payment_method_options | `{ payment_method_save: "enabled" }` |
| integration_identifier | `hosted_web_0001` |
| origin_context | `web` |

`payment_method_collection` was set to `always` in Checkout Studio, but the Stripe API only allows that parameter in `subscription` mode. It is omitted for one-time payments.

`customer_creation: "always"` is set so the save-card checkbox has a Customer to attach to.

## Setup and next steps

Stripe SDK 23 is installed. It sends API version `2026-09-30.endive`, the same date as the linked preview docs. The client does not override that version.

The server reads `STRIPE_ACCESS_TOKEN` first, then `STRIPE_ACCESS_TOKEN_2`, then `STRIPE_SECRET_KEY`. `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET` and `DOMAIN` are also present. Do not put key values in code.

In the Stripe Dashboard, add a webhook endpoint:

`https://www.3djools.com/api/payments/stripe/webhook`

Subscribe it to:

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`

The signing secret must be the value already stored as `STRIPE_WEBHOOK_SECRET`. An order is marked paid only after that signed event, and only when the euro amount matches the order. The return page is not enough.

Card checkout now uses Stripe instead of the previous card gateway. PayPal stays disabled. Bank transfer and crypto are unchanged.

Which methods appear on the Stripe page is controlled in the Dashboard payment method settings. This integration does not send `payment_method_types`.

Test with Stripe test keys and card `4242 4242 4242 4242` before relying on live charges. The current project keys are live, so a real checkout charges a real card.

Resources: https://support.stripe.com and https://docs.stripe.com/payments/checkout
