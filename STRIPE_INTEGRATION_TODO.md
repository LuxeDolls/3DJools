# Stripe Checkout integration

Hosted Checkout is already connected. This pass only synced the Checkout Session parameters with Checkout Studio.

## Values to Replace

No placeholder values remain.

**Files containing the Checkout Session call:**
- [lib/payments/stripe.ts](lib/payments/stripe.ts)

| Field | Current Value | What to Set |
|-------|--------------|-------------|
| mode | payment | Already set for one-time orders. Change only if a product becomes a subscription. |
| success_url | https://www.dnd3d.com/api/payments/stripe/return?order=...&session_id={CHECKOUT_SESSION_ID} | Already the live return route. Keep `{CHECKOUT_SESSION_ID}`. |
| cancel_url | https://www.dnd3d.com/{locale}/order/{order}?stripe=cancelled | Already the live order page. |
| line_items | Dynamic `price_data` for the stored order total | Already uses the order amount in EUR. Do not replace it with a Dashboard Price ID. |

## Configured Parameters

These parameters were configured in Checkout Studio and are set on the existing Checkout Session call.

**Files containing these parameters:**
- [lib/payments/stripe.ts](lib/payments/stripe.ts)

| Parameter | Value |
|-----------|-------|
| ui_mode | hosted_page |
| billing_address_collection | auto |
| phone_number_collection | enabled: true |
| automatic_tax | enabled: false |
| allow_promotion_codes | false |
| submit_type | auto |
| tax_id_collection | enabled: true, required: never |
| name_collection.individual | enabled: true, optional: true |
| integration_identifier | hosted_web_0001 |
| origin_context | web |

`payment_method_collection` is not sent. Stripe only accepts it in `subscription` mode, and this checkout is `payment`.

These Studio settings were removed because they are no longer configured: business name collection, saved payment methods, and forced customer creation.

`customer_email`, `client_reference_id`, and `metadata.order_number` stay. They link the Stripe session to the order and are not Checkout Studio fields.

## Setup and next steps

- Stripe keys and `STRIPE_WEBHOOK_SECRET` are already set. No new environment variables are required.
- The Stripe SDK is v23, so `ui_mode` is `hosted_page`. The client does not override the API version.
- No new routes or files were added. Checkout still redirects to Stripe Hosted Checkout and returns through `/api/payments/stripe/return`.
- Webhook: `https://www.dnd3d.com/api/payments/stripe/webhook`.
- Test cards: `4242 4242 4242 4242` in Stripe test mode. Use any future expiry, any CVC, and any postal code.
- Next: publish this change, then place a test checkout and confirm the optional tax ID and individual name fields appear.
- Support: https://support.stripe.com and https://docs.stripe.com/mcp
