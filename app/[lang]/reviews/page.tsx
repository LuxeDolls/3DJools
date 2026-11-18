import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { reviewsCopy } from "@/lib/i18n/reviews"
import { getAllProducts } from "@/lib/catalog"
import { getStampedReviews, summarizeReviews } from "@/lib/reviews/stamped-reviews"
import { localizeReviews } from "@/lib/reviews/translations"
import { Breadcrumb } from "@/components/breadcrumb"
import { RatingSummary } from "@/components/reviews/rating-summary"
import { ReviewCard } from "@/components/reviews/review-card"
import { StampedMark } from "@/components/reviews/stamped-mark"
import { cn } from "@/lib/utils"

const PER_PAGE = 24

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const copy = reviewsCopy[locale]
  return {
    title: copy.pageTitle,
    description: copy.pageDescription,
  }
}

export default async function ReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ page?: string }>
}) {
  const [{ lang }, { page: pageParam }] = await Promise.all([params, searchParams])
  const locale: Locale = isLocale(lang) ? lang : "en"
  const copy = reviewsCopy[locale]
  const [dict, reviews, products] = await Promise.all([getDictionary(locale), getStampedReviews().then((list) => localizeReviews(list, locale)), getAllProducts(locale)])

  const summary = summarizeReviews(reviews)
  const totalPages = Math.max(1, Math.ceil(reviews.length / PER_PAGE))
  const requested = Number.parseInt(pageParam ?? "1", 10)
  const page = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), totalPages) : 1
  const visible = reviews.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const byId = new Map(products.map((p) => [p.productId, p]))

  const pageHref = (n: number) => localizedPath(locale, n > 1 ? `/reviews?page=${n}` : "/reviews")

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8">
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: copy.pageTitle }]} />

      <header className="mt-5 grid gap-6 sm:mt-8 lg:grid-cols-5 lg:items-end lg:gap-10">
        <div className="flex flex-col gap-3 lg:col-span-3">
          <StampedMark label={copy.poweredBy} />
          <h1 className="font-heading text-3xl leading-none font-bold text-balance text-foreground sm:text-5xl">
            {copy.pageTitle}
          </h1>
          <p className="max-w-xl text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {copy.pageDescription}
          </p>
        </div>
        {summary.count > 0 ? (
          <div className="lg:col-span-2">
            <RatingSummary summary={summary} locale={locale} />
          </div>
        ) : null}
      </header>

      {visible.length > 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((review) => {
            const product = byId.get(review.productId)
            return (
              <li key={review.id} className="min-w-0">
                <ReviewCard
                  review={review}
                  locale={locale}
                  product={
                    product
                      ? {
                          name: product.name,
                          href: localizedPath(locale, `/product/${product.slug}`),
                          image: product.images[0],
                        }
                      : review.productName
                        ? { name: review.productName, href: localizedPath(locale, "/catalog") }
                        : undefined
                  }
                />
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-10 rounded-3xl border border-dashed border-border bg-card/60 px-6 py-10 text-center text-sm text-muted-foreground">
          {copy.noReviewsHint}
        </p>
      )}

      {totalPages > 1 ? (
        <nav aria-label={copy.page} className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
          <PageLink href={pageHref(page - 1)} disabled={page === 1} label={copy.prev}>
            <ChevronLeft className="size-4" aria-hidden="true" />
          </PageLink>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <Link
              key={n}
              href={pageHref(n)}
              aria-label={`${copy.page} ${n}`}
              aria-current={n === page ? "page" : undefined}
              className={cn(
                "flex size-10 items-center justify-center rounded-full border text-sm font-semibold tabular-nums transition-colors",
                n === page
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:border-primary/60",
              )}
            >
              {n}
            </Link>
          ))}
          <PageLink href={pageHref(page + 1)} disabled={page === totalPages} label={copy.next}>
            <ChevronRight className="size-4" aria-hidden="true" />
          </PageLink>
        </nav>
      ) : null}
    </div>
  )
}

function PageLink({
  href,
  disabled,
  label,
  children,
}: {
  href: string
  disabled: boolean
  label: string
  children: React.ReactNode
}) {
  const className =
    "flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-colors"
  if (disabled) {
    return (
      <span aria-hidden="true" className={cn(className, "opacity-40")}>
        {children}
      </span>
    )
  }
  return (
    <Link href={href} aria-label={label} className={cn(className, "hover:border-primary/60")}>
      {children}
    </Link>
  )
}
