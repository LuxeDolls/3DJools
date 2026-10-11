import Image from "next/image"
import Link from "next/link"
import { CheckCircle2, Clock, PackageX, Truck } from "lucide-react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { getOrderByOrderNumber } from "@/lib/orders/queries"
import { formatPrice, formatUsd } from "@/lib/format"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { OrderStatusBadge } from "@/components/orders/order-status-badge"
import { OrderPaymentInstructions } from "@/components/checkout/order-payment-instructions"
import { CardPayButton } from "@/components/checkout/card-pay-button"
import { PaypalPayButton } from "@/components/checkout/paypal-pay-button"
import { isPaypalCheckoutEnabled } from "@/lib/payments/paypal-availability"
import { ALPPAY_CHECKOUT_ENABLED } from "@/lib/payments/alppay-availability"
import { alppayHoldUntil } from "@/lib/payments/alppay-limit"
import { STRIPE_CHECKOUT_ENABLED } from "@/lib/payments/stripe-availability"
import { SQUARE_CHECKOUT_ENABLED } from "@/lib/payments/square-availability"
import { ensureSquareQuote } from "@/lib/payments/square-order"
import { ClearCart } from "@/components/checkout/clear-cart"
import { parseOrderNotes } from "@/lib/orders/notes"
import type { OrderStatus, PaymentMethod } from "@/lib/db/schema"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.orderConfirmation.thankYou, robots: { index: false, follow: false } }
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; orderNumber: string }>
  searchParams: Promise<{ paypal?: string; stripe?: string; alppay?: string }>
}) {
  const { lang, orderNumber } = await params
  const { paypal, stripe, alppay } = await searchParams
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  const order = await getOrderByOrderNumber(decodeURIComponent(orderNumber))

  if (!order) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <div className="flex flex-col items-center gap-4 rounded-lg border border-dashed border-border py-20 text-center">
          <PackageX className="size-10 text-muted-foreground" />
          <div>
            <p className="font-heading text-lg font-semibold text-foreground">{dict.orderConfirmation.notFound}</p>
            <p className="mt-1 text-sm text-muted-foreground">{dict.orderConfirmation.notFoundText}</p>
          </div>
          <Button render={<Link href={localizedPath(locale, "/catalog")}>{dict.orderConfirmation.continueShopping}</Link>} />
        </div>
      </div>
    )
  }

  const status = order.status as OrderStatus
  const notes = parseOrderNotes(order.notes)
  const alppayHeld = order.paymentMethod === "alppay" ? Boolean(await alppayHoldUntil(order.email)) : false
  const memberFromNotes = Number(notes.member_discount_cents || 0)
  const personalDiscountCents = Number(notes.personal_discount_cents || 0)
  const discountGap = order.subtotalCents + order.shippingCents - order.totalCents
  const memberDiscountCents = memberFromNotes > 0 ? memberFromNotes : personalDiscountCents > 0 ? 0 : discountGap
  const paymentLabels: Record<PaymentMethod, string> = {
    card: dict.checkout.payCard,
    alppay: dict.checkout.payAlppay,
    paypal: dict.checkout.payPaypal,
    square: dict.checkout.paySquare,
    bank_transfer: dict.checkout.paySepa,
    crypto: dict.checkout.payCrypto,
    installments: dict.checkout.payInstallments,
  }
  const squareQuote =
    order.paymentMethod === "square" && status === "awaiting_payment" && SQUARE_CHECKOUT_ENABLED
      ? await ensureSquareQuote(order)
      : null
  const squareFx = squareQuote
    ? dict.checkout.paySquareFx
        .replace("{eur}", formatPrice(order.totalCents, locale))
        .replace("{usd}", formatUsd(squareQuote.usdCents, locale))
        .replace("{rate}", squareQuote.rate)
        .replace("{date}", squareQuote.date)
    : ""
  const awaitingOfflinePayment =
    (order.paymentMethod === "bank_transfer" || order.paymentMethod === "crypto") && status === "awaiting_payment"
  const cryptoCoin = parseOrderNotes(order.notes).crypto_coin

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <ClearCart />
      <Breadcrumb
        locale={locale}
        items={[{ label: dict.common.home, href: "/" }, { label: dict.orderConfirmation.orderNumber }]}
      />

      {/* Success header */}
      <div className="mt-6 flex flex-col items-center gap-3 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10">
          <CheckCircle2 className="size-8 text-primary" />
        </span>
        <h1 className="text-balance font-heading text-3xl font-bold tracking-tight text-foreground">
          {dict.orderConfirmation.thankYou}
        </h1>
        <p className="max-w-md text-pretty text-sm text-muted-foreground">{dict.orderConfirmation.received}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className="font-mono text-sm font-semibold text-foreground">{order.orderNumber}</span>
          <OrderStatusBadge status={status} label={dict.auth.orderStatus[status]} />
        </div>
      </div>

      <div className="mt-8 rounded-lg border border-border bg-card p-5 sm:p-6">
        {/* Items */}
        <h2 className="font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {dict.orderConfirmation.items}
        </h2>
        <ul className="mt-4 space-y-3">
          {order.items.map((item) => (
            <li key={item.id} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/40">
                <Image
                  src={item.image || "/placeholder.svg"}
                  alt={item.productName}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {item.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                {item.brandName && <p className="text-xs text-muted-foreground">{item.brandName}</p>}
                <p className="line-clamp-2 text-sm font-medium text-foreground">{item.productName}</p>
              </div>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatPrice(item.lineTotalCents, locale)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        {/* Totals */}
        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dict.common.subtotal}</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatPrice(order.subtotalCents, locale)}</dd>
          </div>
          {memberDiscountCents > 0 && (
            <div className="flex justify-between text-primary">
              <dt>{dict.cart.memberDiscount}</dt>
              <dd className="font-medium tabular-nums">-{formatPrice(memberDiscountCents, locale)}</dd>
            </div>
          )}
          {personalDiscountCents > 0 && (
            <div className="flex justify-between text-primary">
              <dt>{dict.cart.personalDiscount}</dt>
              <dd className="font-medium tabular-nums">-{formatPrice(personalDiscountCents, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dict.cart.shipping}</dt>
            <dd className="font-medium tabular-nums text-foreground">
              {order.shippingCents === 0 ? dict.cart.shippingFree : formatPrice(order.shippingCents, locale)}
            </dd>
          </div>
        </dl>

        <Separator className="my-4" />

        <div className="flex items-baseline justify-between">
          <span className="font-medium text-foreground">{dict.common.total}</span>
          <span className="font-heading text-xl font-bold tabular-nums text-foreground">
            {formatPrice(order.totalCents, locale)}
          </span>
        </div>

        <Separator className="my-4" />

        {/* Shipping + payment */}
        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dict.orderConfirmation.shipTo}
            </h3>
            <address className="mt-2 text-sm not-italic text-foreground">
              {order.shippingName && <p>{order.shippingName}</p>}
              {order.shippingAddress1 && <p>{order.shippingAddress1}</p>}
              {order.shippingAddress2 && <p>{order.shippingAddress2}</p>}
              <p>
                {[order.shippingPostalCode, order.shippingCity].filter(Boolean).join(" ")}
              </p>
              {order.shippingCountry && <p>{order.shippingCountry}</p>}
              <p className="mt-1 text-muted-foreground">{order.email}</p>
            </address>
          </div>
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {dict.orderConfirmation.payment}
            </h3>
            <p className="mt-2 text-sm text-foreground">{paymentLabels[order.paymentMethod as PaymentMethod]}</p>
          </div>
        </div>

        {order.trackingNumber && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-foreground">
            <Truck className="size-5 shrink-0 text-primary" />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{dict.orderConfirmation.trackingTitle}</p>
              <dl className="mt-2 space-y-1 text-muted-foreground">
                {order.carrier && (
                  <div className="flex justify-between gap-4">
                    <dt>{dict.orderConfirmation.carrier}</dt>
                    <dd className="text-foreground">{order.carrier}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-4">
                  <dt>{dict.orderConfirmation.trackingNo}</dt>
                  <dd className="font-mono text-foreground">{order.trackingNumber}</dd>
                </div>
              </dl>
              {order.trackingUrl && (
                <Button
                  className="mt-3"
                  size="sm"
                  render={
                    <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                      {dict.orderConfirmation.trackParcel}
                    </a>
                  }
                />
              )}
            </div>
          </div>
        )}

        {order.paymentMethod === "paypal" && status === "awaiting_payment" && (
          <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground">
            {isPaypalCheckoutEnabled() ? (
              <>
                <p>{dict.checkout.payPaypalNote}</p>
                {paypal === "cancelled" ? (
                  <p className="mt-2 text-destructive">{dict.checkout.payPaypalCancelled}</p>
                ) : paypal === "failed" || notes.paypal_last_status === "not_completed" ? (
                  <p className="mt-2 text-destructive">{dict.checkout.payPaypalFailed}</p>
                ) : null}
                <PaypalPayButton
                  orderNumber={order.orderNumber}
                  locale={locale}
                  label={dict.checkout.payPaypal}
                  errorLabel={dict.checkout.payPaypalUnavailable}
                />
              </>
            ) : (
              <p>{dict.checkout.payPaypalUnavailable}</p>
            )}
          </div>
        )}

        {order.paymentMethod === "alppay" && status === "awaiting_payment" && (
          <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground">
            {ALPPAY_CHECKOUT_ENABLED ? <p>{dict.checkout.payAlppayNote}</p> : <p>{dict.checkout.payAlppayUnavailable}</p>}
            {alppay === "failed" ||
            notes.alppay_last_status === "DECLINED" ||
            notes.alppay_last_status === "CANCELLED" ? (
              <p className="mt-2 text-destructive">{dict.checkout.payAlppayFailed}</p>
            ) : null}
            {alppayHeld ? (
              <p className="mt-2 text-destructive">{dict.checkout.payAlppayHold}</p>
            ) : ALPPAY_CHECKOUT_ENABLED ? (
              <CardPayButton
                orderNumber={order.orderNumber}
                locale={locale}
                method="alppay"
                label={dict.checkout.payAlppay}
                errorLabel={dict.checkout.payAlppayUnavailable}
                holdLabel={dict.checkout.payAlppayHold}
                needsPhone={!notes.phone}
                phoneLabel={dict.checkout.phone}
              />
            ) : null}
          </div>
        )}

        {order.paymentMethod === "square" && status === "awaiting_payment" && (
          <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground">
            <p>{dict.checkout.paySquareNote}</p>
            {notes.square_last_status &&
            notes.square_last_status !== "COMPLETED" &&
            notes.square_last_status !== "PENDING" &&
            notes.square_last_status !== "APPROVED" ? (
              <p className="mt-2 text-destructive">{dict.checkout.paySquareFailed}</p>
            ) : null}
            {squareQuote ? (
              <>
                <p className="mt-2">{squareFx}</p>
                <CardPayButton
                  orderNumber={order.orderNumber}
                  locale={locale}
                  method="square"
                  label={dict.checkout.paySquarePay.replace("{amount}", formatUsd(squareQuote.usdCents, locale))}
                  errorLabel={dict.checkout.paySquareUnavailable}
                />
              </>
            ) : (
              <p className="mt-2">{dict.checkout.paySquareUnavailable}</p>
            )}
          </div>
        )}

        {order.paymentMethod === "card" && status === "awaiting_payment" && (
          <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-foreground">
            {STRIPE_CHECKOUT_ENABLED ? <p>{dict.checkout.payCardNote}</p> : <p>{dict.checkout.payCardUnavailable}</p>}
            {stripe === "cancelled" ||
            stripe === "failed" ||
            notes.aviagram_last_status === "canceled" ||
            notes.aviagram_last_status === "cancelled" ||
            notes.aviagram_last_status === "timeout" ? (
              <p className="mt-2 text-destructive">{dict.checkout.payCardFailed}</p>
            ) : null}
            {notes.aviagram_declined_reason ? (
              <p className="mt-1 text-muted-foreground">{notes.aviagram_declined_reason}</p>
            ) : null}
            {STRIPE_CHECKOUT_ENABLED ? (
              <CardPayButton
                orderNumber={order.orderNumber}
                locale={locale}
                label={dict.checkout.payCard}
                errorLabel={dict.checkout.payCardUnavailable}
              />
            ) : null}
          </div>
        )}

        {awaitingOfflinePayment && (
          <div className="mt-6 flex items-start justify-between gap-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-sm text-foreground">
            <p className="min-w-0">{dict.orderConfirmation.sepaNotice}</p>
            <OrderPaymentInstructions
              orderNumber={order.orderNumber}
              paymentMethod={order.paymentMethod as PaymentMethod}
              amountCents={order.totalCents}
              locale={locale}
              cryptoCoin={cryptoCoin}
              dict={{
                paymentInstructions: dict.orderConfirmation.paymentInstructions,
                iPaidButton: dict.orderConfirmation.iPaidButton,
                showPaymentDetails: dict.orderConfirmation.showPaymentDetails,
                payCard: dict.checkout.payCard,
                paySepa: dict.checkout.paySepa,
                payCrypto: dict.checkout.payCrypto,
                payCryptoNoteText: dict.checkout.payCryptoNoteText,
                payCryptoNetwork: dict.checkout.payCryptoNetwork,
                payCryptoAddress: dict.checkout.payCryptoAddress,
                orderNumber: dict.orderConfirmation.orderNumber,
              }}
            />
          </div>
        )}

        {status === "reviewing_payment" && (
          <div className="mt-6 flex items-start gap-3 rounded-lg border border-blue-500/30 bg-blue-500/5 p-4 text-sm text-foreground">
            <Clock className="size-5 shrink-0 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium">{dict.orderConfirmation.reviewingPaymentTitle}</p>
              <p className="mt-1 text-muted-foreground">{dict.orderConfirmation.reviewingPaymentText}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button variant="outline" render={<Link href={localizedPath(locale, "/account")}>{dict.orderConfirmation.viewOrders}</Link>} />
        <Button render={<Link href={localizedPath(locale, "/catalog")}>{dict.orderConfirmation.continueShopping}</Link>} />
      </div>
    </div>
  )
}
