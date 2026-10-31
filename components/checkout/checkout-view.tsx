"use client"

import Image from "next/image"
import Link from "next/link"
import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Landmark, Bitcoin, CalendarClock, Truck, Lock, AlertTriangle } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useCart } from "@/components/cart/cart-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { formatPrice } from "@/lib/format"
import { memberDiscountCents } from "@/lib/discount"
import { useSession } from "@/lib/auth-client"
import type { Locale } from "@/lib/i18n/config"
import { getInstallmentDict } from "@/lib/i18n/installments"
import { computeInstallmentAmounts, qualifiesForInstallments } from "@/lib/installments"
import { cn } from "@/lib/utils"
import { dateSeparator, isAdultDateOfBirth, isCardPayment, maskBirthDate, splitFullName } from "@/lib/payments/cardholder"
import { callingCode, toE164Phone } from "@/lib/payments/phone-country"
import { computeShippingCents, SHIPPING_COUNTRIES } from "@/lib/shipping"
import { CRYPTO_CHECKOUT_ENABLED, CRYPTO_COIN_OPTIONS, DEFAULT_CRYPTO_COIN_ID, getCryptoCoinOption } from "@/lib/payments/crypto"
import { BANK_TRANSFER_ACCOUNT, BANK_TRANSFER_CHECKOUT_ENABLED, isBankTransferCheckoutEnabled } from "@/lib/payments/bank-transfer"
import { isPaypalCheckoutEnabled } from "@/lib/payments/paypal-availability"
import { ALPPAY_CHECKOUT_ENABLED } from "@/lib/payments/alppay-availability"
import { STRIPE_CHECKOUT_ENABLED } from "@/lib/payments/stripe-availability"
import { SQUARE_CHECKOUT_ENABLED } from "@/lib/payments/square-availability"
import { SUMUP_CHECKOUT_ENABLED } from "@/lib/payments/sumup-availability"

type PaymentId = "card" | "alppay" | "square" | "sumup" | "paypal" | "sepa" | "crypto" | "installments"

function checkoutErrorText(checkout: {
  payCardholderRequired: string
  payCardholderDobInvalid: string
  payCardholderPhoneRequired: string
  payCardholderRegionRequired: string
  payCardUnavailable: string
  payAlppayUnavailable: string
  payAlppayHold: string
  payPaypalUnavailable: string
  paySquareUnavailable: string
  paySumupUnavailable: string
  orderError: string
}, code: string): string {
  if (code === "cardholder_required") return checkout.payCardholderRequired
  if (code === "dob_invalid") return checkout.payCardholderDobInvalid
  if (code === "phone_required") return checkout.payCardholderPhoneRequired
  if (code === "region_required") return checkout.payCardholderRegionRequired
  if (code === "card_unavailable" || code === "card_start_failed") return checkout.payCardUnavailable
  if (code === "alppay_hold") return checkout.payAlppayHold
  if (code === "alppay_unavailable" || code === "alppay_start_failed" || code === "ip_required") return checkout.payAlppayUnavailable
  if (code === "paypal_unavailable" || code === "paypal_start_failed") return checkout.payPaypalUnavailable
  if (code === "square_unavailable" || code === "square_start_failed") return checkout.paySquareUnavailable
  if (code === "sumup_unavailable" || code === "sumup_start_failed") return checkout.paySumupUnavailable
  return checkout.orderError
}

export function CheckoutView({ locale, initialError }: { locale: Locale; initialError?: string }) {
  const { dict } = useI18n()
  const it = getInstallmentDict(locale)
  const lp = useLocalizedPath()
  const { lines, subtotalCents } = useCart()
  const { data: session } = useSession()
  const isMember = Boolean(session?.user)
  const bankTransferEnabled = isBankTransferCheckoutEnabled(session?.user?.email)
  const discountCents = isMember ? memberDiscountCents(subtotalCents) : 0

  const [payment, setPayment] = useState<PaymentId>(
    STRIPE_CHECKOUT_ENABLED
      ? "card"
      : SQUARE_CHECKOUT_ENABLED
        ? "square"
        : SUMUP_CHECKOUT_ENABLED
          ? "sumup"
        : ALPPAY_CHECKOUT_ENABLED
          ? "alppay"
          : BANK_TRANSFER_CHECKOUT_ENABLED
            ? "sepa"
            : "installments",
  )
  const [cryptoCoin, setCryptoCoin] = useState<string>(DEFAULT_CRYPTO_COIN_ID)
  const [country, setCountry] = useState("Netherlands")
  const [submitting, setSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [cardholderName, setCardholderName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [region, setRegion] = useState("")
  const [orderError, setOrderError] = useState<string | null>(
    initialError ? checkoutErrorText(dict.checkout, initialError) : null,
  )
  const router = useRouter()

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed border-border py-24 text-center">
        <p className="font-heading text-lg font-semibold text-foreground">{dict.cart.empty}</p>
        <Button render={<Link href={lp("/catalog/printers")}>{dict.cart.startShopping}</Link>} />
      </div>
    )
  }

 const shippingCents = computeShippingCents(subtotalCents, country)
 const totalCents = subtotalCents - discountCents + shippingCents
  const installmentsEligible = qualifiesForInstallments(totalCents)

  const paymentOptions: { id: PaymentId; icon: typeof Landmark; title: string; desc: string; disabled?: boolean; mark?: string }[] = [
    ...(STRIPE_CHECKOUT_ENABLED
      ? [{ id: "card" as const, icon: CreditCard, title: dict.checkout.payCard, desc: dict.checkout.payCardDesc }]
      : []),
    ...(SQUARE_CHECKOUT_ENABLED
      ? [{ id: "square" as const, icon: CreditCard, title: dict.checkout.paySquare, desc: dict.checkout.paySquareDesc }]
      : []),
    ...(SUMUP_CHECKOUT_ENABLED
      ? [{ id: "sumup" as const, icon: CreditCard, title: dict.checkout.paySumup, desc: dict.checkout.paySumupDesc }]
      : []),
    ...(ALPPAY_CHECKOUT_ENABLED
      ? [{ id: "alppay" as const, icon: CreditCard, title: dict.checkout.payAlppay, desc: dict.checkout.payAlppayDesc }]
      : []),
    ...(bankTransferEnabled
      ? [{ id: "sepa" as const, icon: Landmark, title: dict.checkout.paySepa, desc: dict.checkout.paySepaDesc }]
      : []),
    ...(CRYPTO_CHECKOUT_ENABLED
      ? [{ id: "crypto" as const, icon: Bitcoin, title: dict.checkout.payCrypto, desc: dict.checkout.payCryptoDesc }]
      : []),
    ...(isPaypalCheckoutEnabled()
      ? [{ id: "paypal" as const, icon: Landmark, title: dict.checkout.payPaypal, desc: dict.checkout.payPaypalDesc, mark: "/payments/paypal.svg" }]
      : []),
    {
      id: "installments",
      icon: CalendarClock,
      title: dict.checkout.payInstallments,
      desc: installmentsEligible ? dict.checkout.payInstallmentsDesc : dict.checkout.payInstallmentsMinNote,
      disabled: !installmentsEligible,
    },
  ]

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    if (payment === "installments") return
    if (!termsAccepted) {
      setOrderError(dict.checkout.termsConsentError)
      return
    }
    if (payment === "card" && !STRIPE_CHECKOUT_ENABLED) {
      setOrderError(dict.checkout.payCardUnavailable)
      return
    }
    if (payment === "square" && !SQUARE_CHECKOUT_ENABLED) {
      setOrderError(dict.checkout.paySquareUnavailable)
      return
    }
    if (payment === "sumup" && !SUMUP_CHECKOUT_ENABLED) {
      setOrderError(dict.checkout.paySumupUnavailable)
      return
    }
    if (payment === "alppay" && !ALPPAY_CHECKOUT_ENABLED) {
      setOrderError(dict.checkout.payAlppayUnavailable)
      return
    }
    if (payment === "paypal" && !isPaypalCheckoutEnabled()) {
      setOrderError(dict.checkout.payPaypalUnavailable)
      return
    }
    if (payment === "sepa" && !bankTransferEnabled) {
      setOrderError(dict.checkout.paySepaUnavailable)
      return
    }
    if (isCardPayment(payment) && !splitFullName(cardholderName)) {
      setOrderError(dict.checkout.payCardholderRequired)
      return
    }
    if (isCardPayment(payment) && !isAdultDateOfBirth(dateOfBirth)) {
      setOrderError(dict.checkout.payCardholderDobInvalid)
      return
    }
    const fd = new FormData(e.currentTarget)
    const str = (k: string) => String(fd.get(k) ?? "").trim()
    if (payment === "card" && !toE164Phone(str("phone"), country)) {
      setOrderError(dict.checkout.payCardholderPhoneRequired)
      return
    }
    if (payment === "alppay" && !str("phone")) {
      setOrderError(dict.checkout.payCardholderPhoneRequired)
      return
    }
    if (payment === "alppay" && !region.trim()) {
      setOrderError(dict.checkout.payCardholderRegionRequired)
      return
    }
    setOrderError(null)
    setSubmitting(true)
    // Native submit, not a server action: the preview was leaving that promise pending.
    e.currentTarget.submit()
  }
  const { downPaymentCents, remainingCents } = computeInstallmentAmounts(totalCents)

  return (
    <form method="post" action="/api/checkout" onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="payment" value={payment} />
      <input type="hidden" name="country" value={country} />
      <input type="hidden" name="cryptoCoin" value={cryptoCoin} />
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(lines.map((line) => ({ slug: line.slug, quantity: line.quantity, brand: line.brand, image: line.image })))}
      />
      <div className="space-y-8">
        {/* Contact */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">{dict.checkout.contact}</h2>
          <div className="mt-4 space-y-1.5">
            <Label htmlFor="email">{dict.checkout.email}</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>
        </section>

        {/* Shipping address */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">{dict.checkout.shippingAddress}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="firstName">{dict.checkout.firstName}</Label>
              <Input id="firstName" name="firstName" autoComplete="given-name" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="lastName">{dict.checkout.lastName}</Label>
              <Input id="lastName" name="lastName" autoComplete="family-name" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="address">{dict.checkout.address}</Label>
              <Input id="address" name="address" autoComplete="street-address" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="postalCode">{dict.checkout.postalCode}</Label>
              <Input id="postalCode" name="postalCode" autoComplete="postal-code" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">{dict.checkout.city}</Label>
              <Input id="city" name="city" autoComplete="address-level2" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="country">{dict.checkout.country}</Label>
              <Select value={country} onValueChange={(v) => v && setCountry(v)}>
                <SelectTrigger id="country" className="w-full">
                  <SelectValue placeholder={dict.checkout.country} />
                </SelectTrigger>
                <SelectContent>
                  {SHIPPING_COUNTRIES.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="phone">{dict.checkout.phone}</Label>
              <div className="flex gap-2">
                <span className="flex h-8 shrink-0 items-center rounded-lg border border-input bg-secondary px-2.5 text-sm font-medium text-foreground">
                  +{callingCode(country)}
                </span>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  required={payment === "card" || payment === "alppay"}
                />
              </div>
              {payment === "card" ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{dict.checkout.phoneCountryHint}</p>
              ) : null}
            </div>
          </div>
        </section>

        {/* Shipping method */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">{dict.checkout.shippingMethod}</h2>
          <div className="mt-4">
            <OptionCard
              selected
              icon={Truck}
              title={dict.checkout.shippingStandard}
              desc={dict.checkout.shippingFreeDesc}
              trailing={dict.cart.shippingFree}
            />
          </div>
        </section>

        {/* Payment method */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">{dict.checkout.paymentMethod}</h2>
          {!STRIPE_CHECKOUT_ENABLED && !SQUARE_CHECKOUT_ENABLED && !SUMUP_CHECKOUT_ENABLED && !ALPPAY_CHECKOUT_ENABLED && (
            <p
              role="alert"
              className="mt-2.5 flex items-start gap-2 rounded-lg border border-destructive/35 bg-destructive/10 px-3.5 py-2.5 text-sm font-medium leading-relaxed text-destructive"
            >
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" aria-hidden="true" />
              <span>{dict.checkout.payCardGatewayNotice}</span>
            </p>
          )}
          <div className="mt-4 space-y-2.5">
            {paymentOptions.map((opt) => (
              <OptionCard
                key={opt.id}
                selected={payment === opt.id}
                disabled={opt.disabled}
                onSelect={() => !opt.disabled && setPayment(opt.id)}
                icon={opt.icon}
                mark={opt.mark}
                title={opt.title}
                desc={opt.desc}
              />
            ))}
          </div>

          {(payment === "card" || payment === "alppay") && (
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="cardholderName">{dict.checkout.payCardholderName}</Label>
                <Input
                  id="cardholderName"
                  name="cardholderName"
                  autoComplete="name"
                  required
                  value={cardholderName}
                  onChange={(e) => setCardholderName(e.target.value)}
                />
              </div>
              {payment === "alppay" && (
                <div className="space-y-1.5">
                  <Label htmlFor="billingRegion">{dict.checkout.payCardholderRegion}</Label>
                  <Input
                    id="billingRegion"
                    name="billingRegion"
                    autoComplete="address-level1"
                    required
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="dateOfBirth">{dict.checkout.payCardholderDob}</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="text"
                  inputMode="numeric"
                  autoComplete="bday"
                  lang={locale}
                  placeholder={dict.checkout.payCardholderDobPlaceholder}
                  required
                  value={dateOfBirth}
                  onChange={(e) => {
                    const el = e.currentTarget
                    const typingAtEnd = (el.selectionStart ?? el.value.length) >= el.value.length
                    const next = maskBirthDate(el.value, dateOfBirth, dateSeparator(dict.checkout.payCardholderDobPlaceholder))
                    setDateOfBirth(next)
                    if (typingAtEnd) requestAnimationFrame(() => el.setSelectionRange(next.length, next.length))
                  }}
                />
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground sm:col-span-2">
                {dict.checkout.payCardholderHint}
              </p>
            </div>
          )}

          {/* Contextual panels per payment method */}
          {payment === "square" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>{dict.checkout.paySquareNote}</p>
            </div>
          )}
          {payment === "card" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>{dict.checkout.payCardNote}</p>
            </div>
          )}
          {payment === "sumup" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>{dict.checkout.paySumupNote}</p>
            </div>
          )}
          {payment === "alppay" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>{dict.checkout.payAlppayNote}</p>
            </div>
          )}
          {payment === "paypal" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm leading-relaxed text-muted-foreground">
              <p>{dict.checkout.payPaypalNote}</p>
            </div>
          )}
          {payment === "sepa" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Bank transfer details (shown after ordering)</p>
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between gap-4"><dt>Name</dt><dd className="font-mono text-foreground">{BANK_TRANSFER_ACCOUNT.accountName}</dd></div>
                <div className="flex justify-between gap-4"><dt>IBAN</dt><dd className="font-mono text-foreground">{BANK_TRANSFER_ACCOUNT.iban}</dd></div>
                <div className="flex justify-between gap-4"><dt>BIC</dt><dd className="font-mono text-foreground">{BANK_TRANSFER_ACCOUNT.bic}</dd></div>
                <div className="flex justify-between gap-4"><dt>Reference</dt><dd className="font-mono text-foreground">Your order number</dd></div>
              </dl>
            </div>
          )}
          {payment === "crypto" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{dict.checkout.payCryptoNoteTitle}</p>
              <p className="mt-1">{dict.checkout.payCryptoNoteText}</p>
              <div className="mt-3 space-y-1.5">
                <Label htmlFor="cryptoCoin" className="text-xs text-muted-foreground">
                  {dict.checkout.payCryptoCoin}
                </Label>
                <Select value={cryptoCoin} onValueChange={(v) => v && setCryptoCoin(v)}>
                  <SelectTrigger id="cryptoCoin" className="w-full bg-card">
                    <SelectValue placeholder={dict.checkout.payCryptoCoin}>
                      {(value: string) => {
                        const opt = getCryptoCoinOption(value)
                        return `${opt.coinLabel} · ${opt.network}`
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {CRYPTO_COIN_OPTIONS.map((coin) => (
                      <SelectItem key={coin.id} value={coin.id}>
                        {coin.coinLabel} · {coin.network}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <dl className="mt-3 space-y-1">
                <div className="flex justify-between gap-4">
                  <dt>{dict.checkout.payCryptoNetwork}</dt>
                  <dd className="font-mono text-foreground">
                    {getCryptoCoinOption(cryptoCoin).coinLabel} · {getCryptoCoinOption(cryptoCoin).network}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{dict.checkout.payCryptoAddress}</dt>
                  <dd className="break-all font-mono text-foreground">{getCryptoCoinOption(cryptoCoin).address}</dd>
                </div>
              </dl>
            </div>
          )}
          {payment === "installments" && installmentsEligible && (
            <div className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{it.planTagline}</p>
              <p className="mt-1">
                {`${it.downPaymentNow}: `}
                <span className="font-semibold text-primary">{formatPrice(downPaymentCents, locale)}</span>
                {` · ${it.remaining}: ${formatPrice(remainingCents, locale)}`}
              </p>
              <p className="mt-2 text-xs">{it.checkoutInstallmentNote}</p>
            </div>
          )}
        </section>
      </div>

      {/* Order summary */}
      <aside className="h-fit rounded-lg border border-border bg-card p-5 lg:sticky lg:top-40">
        <h2 className="font-heading text-lg font-bold text-foreground">{dict.cart.orderSummary}</h2>
        <ul className="mt-4 space-y-3">
          {lines.map((line) => (
            <li key={line.id} className="flex gap-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/40">
                <Image src={line.image || "/placeholder.svg"} alt={line.name} fill sizes="56px" className="object-cover" />
                <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                  {line.quantity}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-foreground">{line.name}</p>
              </div>
              <span className="text-sm font-medium tabular-nums text-foreground">
                {formatPrice(line.priceCents * line.quantity, locale)}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-4" />

        <dl className="space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dict.common.subtotal}</dt>
            <dd className="font-medium tabular-nums text-foreground">{formatPrice(subtotalCents, locale)}</dd>
          </div>
          {isMember && discountCents > 0 && (
            <div className="flex justify-between text-primary">
              <dt>{dict.cart.memberDiscount}</dt>
              <dd className="font-medium tabular-nums">-{formatPrice(discountCents, locale)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-muted-foreground">{dict.cart.shipping}</dt>
            <dd className="font-medium tabular-nums text-foreground">
              {shippingCents === 0 ? dict.cart.shippingFree : formatPrice(shippingCents, locale)}
            </dd>
          </div>
        </dl>
        {!isMember && (
          <Link
            href={lp("/sign-in")}
            className="mt-3 flex items-center justify-center rounded-md border border-dashed border-primary/50 bg-primary/5 px-3 py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/10"
          >
            {dict.cart.signInToSave}
          </Link>
        )}

        <Separator className="my-4" />

        <div className="flex items-baseline justify-between">
          <span className="font-medium text-foreground">{dict.common.total}</span>
          <span className="font-heading text-xl font-bold tabular-nums text-foreground">
            {formatPrice(totalCents, locale)}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{dict.cart.vatIncluded}</p>

        <label className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <input
            type="checkbox"
            name="termsAccepted"
            checked={termsAccepted}
            onChange={(event) => setTermsAccepted(event.target.checked)}
            required
            className="mt-0.5 size-4 shrink-0 accent-primary"
          />
          <span>
            {dict.checkout.termsConsentBefore}{" "}
            <Link href={lp("/terms")} className="font-medium text-primary underline-offset-4 hover:underline">
              {dict.footer.terms}
            </Link>{" "}
            {dict.checkout.termsConsentAnd}{" "}
            <Link href={lp("/privacy")} className="font-medium text-primary underline-offset-4 hover:underline">
              {dict.footer.privacy}
            </Link>{" "}
            {dict.checkout.termsConsentAfter}
          </span>
        </label>
        {orderError && (
                <p className="mb-3 text-sm text-destructive" role="alert">
                  {orderError}
                </p>
              )}
              {payment === "installments" && installmentsEligible ? (
          <Button
            size="lg"
            className="mt-4 w-full"
            type="button"
            disabled={!termsAccepted}
            onClick={() => {
              if (!termsAccepted) {
                setOrderError(dict.checkout.termsConsentError)
                return
              }
              router.push(lp("/installments/apply"))
            }}
          >
            {it.checkoutInstallmentCta}
          </Button>
        ) : (
          <Button size="lg" className="mt-4 w-full" type="submit" disabled={submitting || !termsAccepted}>
            <Lock className="size-4" />
            {submitting ? dict.checkout.processing : dict.checkout.placeOrder}
          </Button>
        )}
      </aside>
    </form>
  )
}

function OptionCard({
  selected,
  disabled,
  onSelect,
  icon: Icon,
  mark,
  title,
  desc,
  trailing,
}: {
  selected: boolean
  disabled?: boolean
  onSelect?: () => void
  icon: typeof Landmark
  mark?: string
  title: string
  desc: string
  trailing?: string
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      tabIndex={onSelect ? 0 : -1}
      aria-pressed={selected}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-4 text-left transition-colors",
        selected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-muted-foreground",
        !onSelect && "cursor-default",
        disabled && "cursor-not-allowed opacity-50",
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border-2",
          selected ? "border-primary" : "border-input",
        )}
      >
        {selected && <span className="size-2.5 rounded-full bg-primary" />}
      </span>
      {mark ? (
        <span className="flex h-7 shrink-0 items-center rounded-sm bg-white px-1.5">
          <Image src={mark} alt="" width={72} height={18} className="h-[18px] w-auto" />
        </span>
      ) : (
        <Icon className={cn("size-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
      )}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      {trailing && <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{trailing}</span>}
    </button>
  )
}
