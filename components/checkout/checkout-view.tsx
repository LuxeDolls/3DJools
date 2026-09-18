"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Landmark, Bitcoin, CalendarClock, Truck, Info, Lock } from "lucide-react"
import { useI18n, useLocalizedPath } from "@/components/i18n-provider"
import { useCart, FREE_SHIPPING_THRESHOLD_CENTS } from "@/components/cart/cart-provider"
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
import { placeOrder } from "@/lib/actions/orders"
import { computeShippingCents, SHIPPING_COUNTRIES } from "@/lib/shipping"

type PaymentId = "card" | "sepa" | "crypto" | "installments"

export function CheckoutView({ locale }: { locale: Locale }) {
  const { dict } = useI18n()
  const it = getInstallmentDict(locale)
  const lp = useLocalizedPath()
  const { lines, subtotalCents, clear } = useCart()
  const { data: session } = useSession()
  const isMember = Boolean(session?.user)
  const discountCents = isMember ? memberDiscountCents(subtotalCents) : 0

  const qualifiesFree = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
  const [payment, setPayment] = useState<PaymentId>("sepa")
  const [country, setCountry] = useState("Belgium")
  const [submitting, setSubmitting] = useState(false)
  const [orderError, setOrderError] = useState<string | null>(null)
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

  const paymentOptions: { id: PaymentId; icon: typeof CreditCard; title: string; desc: string; disabled?: boolean }[] = [
    { id: "card", icon: CreditCard, title: dict.checkout.payCard, desc: dict.checkout.payCardUnavailable, disabled: true },
    { id: "sepa", icon: Landmark, title: dict.checkout.paySepa, desc: dict.checkout.paySepaDesc },
    { id: "crypto", icon: Bitcoin, title: dict.checkout.payCrypto, desc: dict.checkout.payCryptoDesc },
    {
      id: "installments",
      icon: CalendarClock,
      title: dict.checkout.payInstallments,
      desc: installmentsEligible ? dict.checkout.payInstallmentsDesc : dict.checkout.payInstallmentsMinNote,
      disabled: !installmentsEligible,
    },
  ]

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (submitting) return
    setOrderError(null)
    const fd = new FormData(e.currentTarget)
    const str = (k: string) => String(fd.get(k) ?? "").trim()
    setSubmitting(true)
    try {
      const res = await placeOrder({
        email: str("email"),
        firstName: str("firstName"),
        lastName: str("lastName"),
        address: str("address"),
        city: str("city"),
        postalCode: str("postalCode"),
        country,
        phone: str("phone"),
        payment,
        items: lines.map((l) => ({ slug: l.slug, quantity: l.quantity, brand: l.brand, image: l.image })),
      })
      if (!res.ok) {
        setOrderError(dict.checkout.orderError)
        setSubmitting(false)
        return
      }
      clear()
      router.push(lp(`/order/${res.orderNumber}`))
    } catch {
      setOrderError(dict.checkout.orderError)
      setSubmitting(false)
    }
  }
  const { downPaymentCents, remainingCents } = computeInstallmentAmounts(totalCents)

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
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
            <div className="space-y-1.5">
              <Label htmlFor="phone">{dict.checkout.phone}</Label>
              <Input id="phone" name="phone" type="tel" autoComplete="tel" />
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
              desc={qualifiesFree ? dict.checkout.shippingFreeDesc : dict.checkout.shippingStandardDesc}
              trailing={shippingCents === 0 ? dict.cart.shippingFree : formatPrice(shippingCents, locale)}
            />
          </div>
        </section>

        {/* Payment method */}
        <section>
          <h2 className="font-heading text-lg font-bold text-foreground">{dict.checkout.paymentMethod}</h2>
          <div className="mt-4 space-y-2.5">
            {paymentOptions.map((opt) => (
              <OptionCard
                key={opt.id}
                selected={payment === opt.id}
                disabled={opt.disabled}
                onSelect={() => !opt.disabled && setPayment(opt.id)}
                icon={opt.icon}
                title={opt.title}
                desc={opt.desc}
              />
            ))}
          </div>

          {/* Contextual panels per payment method */}
          {payment === "sepa" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Bank transfer details (shown after ordering)</p>
              <dl className="mt-2 space-y-1">
                <div className="flex justify-between gap-4"><dt>IBAN</dt><dd className="font-mono text-foreground">DE00 0000 0000 0000 0000 00</dd></div>
                <div className="flex justify-between gap-4"><dt>BIC</dt><dd className="font-mono text-foreground">XXXXDEXXXXX</dd></div>
                <div className="flex justify-between gap-4"><dt>Reference</dt><dd className="font-mono text-foreground">Your order number</dd></div>
              </dl>
            </div>
          )}
          {payment === "crypto" && (
            <div className="mt-4 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">{dict.checkout.payCryptoNoteTitle}</p>
              <p className="mt-1">{dict.checkout.payCryptoNoteText}</p>
              <dl className="mt-3 space-y-1">
                <div className="flex justify-between gap-4">
                  <dt>{dict.checkout.payCryptoNetwork}</dt>
                  <dd className="font-mono text-foreground">USDT · TRC20</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt>{dict.checkout.payCryptoAddress}</dt>
                  <dd className="break-all font-mono text-foreground">TXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX</dd>
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

        <div className="flex items-start gap-3 rounded-lg border border-accent/40 bg-accent/10 p-4 text-sm text-foreground">
          <Info className="size-5 shrink-0 text-accent-foreground" />
          <p>{dict.checkout.demoNotice}</p>
        </div>
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

        {orderError && (
                <p className="mb-3 text-sm text-destructive" role="alert">
                  {orderError}
                </p>
              )}
              {payment === "installments" && installmentsEligible ? (
          <Button
            size="lg"
            className="mt-4 w-full"
            render={<Link href={lp("/installments/apply")}>{it.checkoutInstallmentCta}</Link>}
          />
        ) : (
          <Button size="lg" className="mt-4 w-full" type="submit" disabled={submitting}>
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
  title,
  desc,
  trailing,
}: {
  selected: boolean
  disabled?: boolean
  onSelect?: () => void
  icon: typeof CreditCard
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
      <Icon className={cn("size-5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium text-foreground">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
      {trailing && <span className="shrink-0 text-sm font-semibold tabular-nums text-foreground">{trailing}</span>}
    </button>
  )
}
