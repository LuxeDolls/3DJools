import { headers } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Package, User, CreditCard } from "lucide-react"
import { auth } from "@/lib/auth"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { getOrdersByUserId } from "@/lib/orders/queries"
import { getShipmentEventsForOrders } from "@/lib/shipping/events"
import { trackingPageCopy } from "@/lib/shipping/tracking"
import { AccountOrders } from "@/components/account/account-orders"
import { getApplicationsByEmail } from "@/lib/actions/installments"
import { formatPrice } from "@/lib/format"
import { Breadcrumb } from "@/components/breadcrumb"
import { Button } from "@/components/ui/button"
import { SignOutButton } from "@/components/auth/sign-out-button"
import type { OrderStatus } from "@/lib/db/schema"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return { title: dict.account.title }
}

export default async function AccountPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    redirect(localizedPath(locale, "/sign-in?redirect=/account"))
  }

  const { user } = session
  const [orders, applications] = await Promise.all([
    getOrdersByUserId(user.id),
    getApplicationsByEmail(user.email),
  ])
  const eventsByOrder = await getShipmentEventsForOrders(orders.map((order) => order.id))
  const trackingCopy = trackingPageCopy(locale)

  const memberSince = new Intl.DateTimeFormat(locale, { year: "numeric", month: "long" }).format(
    new Date(user.createdAt),
  )

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.account.title }]} />

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">{dict.account.greeting}</p>
          <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">{user.name}</h1>
        </div>
        <SignOutButton locale={locale} label={dict.account.signOut} />
      </div>

      {/* Account details */}
      <section className="mt-8 rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <User className="size-4" />
          {dict.account.accountDetails}
        </h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-xs text-muted-foreground">{dict.account.name}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{user.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{dict.account.email}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{user.email}</dd>
          </div>
          <div>
            <dt className="text-xs text-muted-foreground">{dict.account.memberSince}</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{memberSince}</dd>
          </div>
        </dl>
      </section>

      {/* Orders */}
      <section className="mt-6 rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <Package className="size-4" />
          {dict.account.orders}
        </h2>
        {orders.length === 0 ? (
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-foreground">{dict.account.noOrders}</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{dict.account.noOrdersText}</p>
            <Link
              href={localizedPath(locale, "/catalog")}
              className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {dict.account.startShopping}
            </Link>
          </div>
        ) : (
          <AccountOrders
            locale={locale}
            labels={{
              orderNumber: dict.account.orderNumber,
              viewOrder: dict.account.viewOrder,
              trackingNo: dict.orderConfirmation.trackingNo,
              carrier: dict.orderConfirmation.carrier,
              trackParcel: dict.orderConfirmation.trackParcel,
              history: trackingCopy.history,
              noUpdates: trackingCopy.noUpdates,
            }}
            orders={orders.map((order) => ({
              id: order.id,
              orderNumber: order.orderNumber,
              dateLabel: new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(order.createdAt)),
              itemCount: order.items.length,
              totalLabel: formatPrice(order.totalCents, locale),
              status: order.status as OrderStatus,
              statusLabel: dict.auth.orderStatus[order.status as OrderStatus],
              trackingNumber: order.trackingNumber,
              carrier: order.carrier,
              events: (eventsByOrder[order.id] ?? []).map((event) => ({
                id: event.id,
                status: event.status,
                location: event.location,
                comment: event.comment,
                carrier: event.carrier,
                createdAt: event.createdAt.toISOString(),
              })),
            }))}
          />
        )}
      </section>

      {/* Installment plans */}
      <section className="mt-6 rounded-lg border border-border bg-card p-6">
        <h2 className="flex items-center gap-2 font-heading text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          <CreditCard className="size-4" />
          {dict.account.myInstallments}
        </h2>
        {applications.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">{dict.account.noInstallments}</p>
        ) : (
          <ul className="mt-4 divide-y divide-border">
            {applications.map((app) => (
              <li key={app.applicationRef} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <Link
                    href={localizedPath(locale, `/installments/${app.applicationRef}`)}
                    className="text-sm font-semibold text-primary hover:underline"
                  >
                    {app.applicationRef}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(new Date(app.createdAt))} ·{" "}
                    {formatPrice(app.totalAmountCents, locale)}
                  </p>
                </div>
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium capitalize text-muted-foreground">
                  {app.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
