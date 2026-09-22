import Link from "next/link"
import { isLocale, type Locale } from "@/lib/i18n/config"
import { getDictionary } from "@/lib/i18n/get-dictionary"
import { localizedPath } from "@/lib/i18n/paths"
import { Breadcrumb } from "@/components/breadcrumb"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

const faqGroups = [
  {
    heading: "Orders & shipping",
    items: [
      {
        question: "How long does delivery take, and how much does it cost?",
        answer:
          "Standard shipping takes 3–6 business days in total and is completely free on every order, to every destination we deliver to — no minimum spend required. Handling takes 0–1 business day and transit takes 3–5 business days. Orders placed by 15:00 CET Monday to Friday enter the handling window that day.",
      },
      {
        question: "What are your business hours?",
        answer:
          "Our team is available Monday to Friday, 9:00–18:00 CET, excluding Belgian public holidays. Orders and messages received outside these hours are handled on the next business day.",
      },
      {
        question: "Which countries do you ship to?",
        answer:
          "We ship to Belgium and to the rest of the European Union plus a few neighbouring countries (Switzerland, Norway, United Kingdom) with trusted carriers (DPD, GLS, DHL and UPS). Shipping is free to every one of these destinations.",
      },
      {
        question: "Can I track my order?",
        answer:
          "Yes. You'll receive an email with a tracking number once your order ships, and you can follow every order from payment to delivery on our order tracking page.",
      },
    ],
  },
  {
    heading: "Returns & warranty",
    items: [
      {
        question: "What is your return policy?",
        answer:
          "We offer a 30-day return policy — well beyond the EU statutory 14-day minimum. Once we receive and inspect the return, we refund you within 7 working days.",
      },
      {
        question: "Who pays for return shipping?",
        answer:
          "If you simply change your mind, you cover the direct cost of returning the item. If your order arrived damaged, faulty or incorrect, we cover return shipping in full — contact us within 48 hours with photos.",
      },
      {
        question: "Do you offer a warranty?",
        answer:
          "Every item is covered by the EU statutory 2-year consumer guarantee against defects, and many manufacturers add their own warranty on top. Our support team helps arrange any repair or replacement.",
      },
    ],
  },
  {
    heading: "Payments",
    items: [
      {
        question: "What payment methods do you accept?",
        answer:
          "SEPA bank transfer, cryptocurrency and interest-free instalments. Card payment is temporarily unavailable — see our payment methods page for details.",
      },
      {
        question: "How do interest-free instalments work?",
        answer: "Your order is split into four equal payments over two months, with no interest and no fees.",
      },
      {
        question: "Are prices shown with VAT?",
        answer: "Yes. All prices are shown in euro (EUR) and include statutory VAT where applicable.",
      },
    ],
  },
  {
    heading: "Products & support",
    items: [
      {
        question: "Do your printers come fully assembled?",
        answer:
          "It depends on the model — most Bambu Lab and Prusa machines ship fully assembled, while some kits require light assembly. Each product page states exactly what's included.",
      },
      {
        question: "How can I contact support?",
        answer:
          "Use our contact form or live chat — we reply within 48 hours, Monday to Friday, 9:00–18:00 CET.",
      },
    ],
  },
]

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)
  return {
    title: dict.footer.faq,
    description: "Answers to common questions about orders, shipping, returns, warranty and payments at 3DJools.",
  }
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : "en"
  const dict = await getDictionary(locale)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqGroups.flatMap((group) =>
      group.items.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    ),
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Breadcrumb locale={locale} items={[{ label: dict.common.home, href: "/" }, { label: dict.footer.faq }]} />
      <h1 className="mt-4 text-balance font-heading text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        {dict.footer.faq}
      </h1>
      <p className="mt-2 max-w-2xl text-pretty text-muted-foreground">
        Answers to the questions we get asked most about orders, shipping, returns and payments.
      </p>

      <div className="mt-8 space-y-8">
        {faqGroups.map((group) => (
          <section key={group.heading}>
            <h2 className="font-heading text-lg font-bold text-foreground">{group.heading}</h2>
            <Accordion className="mt-2">
              {group.items.map((item, i) => (
                <AccordionItem key={item.question} value={`${group.heading}-${i}`}>
                  <AccordionTrigger className="text-foreground">{item.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    <p>{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ))}
      </div>

      <p className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
        {dict.legal.contactPrompt}{" "}
        <Link href={localizedPath(locale, "/contact")} className="underline underline-offset-2 hover:text-foreground">
          {dict.legal.contactLink}
        </Link>
      </p>
    </div>
  )
}
