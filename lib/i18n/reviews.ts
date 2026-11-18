import type { Locale } from "@/lib/i18n/config"

export interface ReviewsCopy {
  one: string
  many: string
  outOf: string
  verifiedBuyer: string
  homeEyebrow: string
  homeTitle: string
  viewAll: string
  pageTitle: string
  pageDescription: string
  productTitle: string
  basedOn: string
  noReviews: string
  noReviewsHint: string
  reviewed: string
  storeReply: string
  prev: string
  next: string
  page: string
  poweredBy: string
  footerLabel: string
  seeAllForProduct: string
}

export const reviewsCopy: Record<Locale, ReviewsCopy> = {
  en: {
    one: "review",
    many: "reviews",
    outOf: "out of 5",
    verifiedBuyer: "Verified buyer",
    homeEyebrow: "Verified reviews",
    homeTitle: "What our customers say",
    viewAll: "All reviews",
    pageTitle: "Customer reviews",
    pageDescription:
      "Reviews from our customers, collected independently by Stamped.io after delivery.",
    productTitle: "Customer reviews",
    basedOn: "Based on",
    noReviews: "No reviews for this product yet",
    noReviewsHint: "After delivery, Stamped.io emails every buyer an invitation to review their order.",
    reviewed: "Reviewed",
    storeReply: "Reply from 3DEureka",
    prev: "Previous",
    next: "Next",
    page: "Page",
    poweredBy: "Reviews collected by",
    footerLabel: "Read all customer reviews",
    seeAllForProduct: "All store reviews",
  },
  de: {
    one: "Bewertung",
    many: "Bewertungen",
    outOf: "von 5",
    verifiedBuyer: "Verifizierter Käufer",
    homeEyebrow: "Verifizierte Bewertungen",
    homeTitle: "Das sagen unsere Kunden",
    viewAll: "Alle Bewertungen",
    pageTitle: "Kundenbewertungen",
    pageDescription:
      "Bewertungen unserer Kunden, nach der Lieferung unabhängig von Stamped.io eingeholt.",
    productTitle: "Kundenbewertungen",
    basedOn: "Basierend auf",
    noReviews: "Für dieses Produkt gibt es noch keine Bewertungen",
    noReviewsHint: "Nach der Lieferung lädt Stamped.io jeden Käufer per E-Mail zur Bewertung seiner Bestellung ein.",
    reviewed: "Bewertet",
    storeReply: "Antwort von 3DEureka",
    prev: "Zurück",
    next: "Weiter",
    page: "Seite",
    poweredBy: "Bewertungen gesammelt von",
    footerLabel: "Alle Kundenbewertungen lesen",
    seeAllForProduct: "Alle Shop-Bewertungen",
  },
  it: {
    one: "recensione",
    many: "recensioni",
    outOf: "su 5",
    verifiedBuyer: "Acquirente verificato",
    homeEyebrow: "Recensioni verificate",
    homeTitle: "Cosa dicono i nostri clienti",
    viewAll: "Tutte le recensioni",
    pageTitle: "Recensioni dei clienti",
    pageDescription:
      "Recensioni dei nostri clienti, raccolte in modo indipendente da Stamped.io dopo la consegna.",
    productTitle: "Recensioni dei clienti",
    basedOn: "Basato su",
    noReviews: "Questo prodotto non ha ancora recensioni",
    noReviewsHint: "Dopo la consegna, Stamped.io invita via e-mail ogni acquirente a recensire il proprio ordine.",
    reviewed: "Recensito",
    storeReply: "Risposta di 3DEureka",
    prev: "Precedente",
    next: "Successiva",
    page: "Pagina",
    poweredBy: "Recensioni raccolte da",
    footerLabel: "Leggi tutte le recensioni dei clienti",
    seeAllForProduct: "Tutte le recensioni del negozio",
  },
  fr: {
    one: "avis",
    many: "avis",
    outOf: "sur 5",
    verifiedBuyer: "Acheteur vérifié",
    homeEyebrow: "Avis vérifiés",
    homeTitle: "Ce que disent nos clients",
    viewAll: "Tous les avis",
    pageTitle: "Avis clients",
    pageDescription:
      "Les avis de nos clients, recueillis de manière indépendante par Stamped.io après la livraison.",
    productTitle: "Avis clients",
    basedOn: "Sur la base de",
    noReviews: "Aucun avis pour ce produit pour le moment",
    noReviewsHint: "Après la livraison, Stamped.io invite chaque acheteur par e-mail à évaluer sa commande.",
    reviewed: "Produit évalué",
    storeReply: "Réponse de 3DEureka",
    prev: "Précédent",
    next: "Suivant",
    page: "Page",
    poweredBy: "Avis recueillis par",
    footerLabel: "Lire tous les avis clients",
    seeAllForProduct: "Tous les avis de la boutique",
  },
  nl: {
    one: "review",
    many: "reviews",
    outOf: "van 5",
    verifiedBuyer: "Geverifieerde koper",
    homeEyebrow: "Geverifieerde reviews",
    homeTitle: "Wat onze klanten zeggen",
    viewAll: "Alle reviews",
    pageTitle: "Klantreviews",
    pageDescription:
      "Reviews van onze klanten, na levering onafhankelijk verzameld door Stamped.io.",
    productTitle: "Klantreviews",
    basedOn: "Gebaseerd op",
    noReviews: "Er zijn nog geen reviews voor dit product",
    noReviewsHint: "Na levering nodigt Stamped.io elke koper per e-mail uit om de bestelling te beoordelen.",
    reviewed: "Beoordeeld",
    storeReply: "Antwoord van 3DEureka",
    prev: "Vorige",
    next: "Volgende",
    page: "Pagina",
    poweredBy: "Reviews verzameld door",
    footerLabel: "Lees alle klantreviews",
    seeAllForProduct: "Alle winkelreviews",
  },
  es: {
    one: "reseña",
    many: "reseñas",
    outOf: "de 5",
    verifiedBuyer: "Comprador verificado",
    homeEyebrow: "Reseñas verificadas",
    homeTitle: "Lo que dicen nuestros clientes",
    viewAll: "Todas las reseñas",
    pageTitle: "Reseñas de clientes",
    pageDescription:
      "Reseñas de nuestros clientes, recogidas de forma independiente por Stamped.io tras la entrega.",
    productTitle: "Reseñas de clientes",
    basedOn: "Basado en",
    noReviews: "Este producto aún no tiene reseñas",
    noReviewsHint: "Tras la entrega, Stamped.io invita por e-mail a cada comprador a valorar su pedido.",
    reviewed: "Producto valorado",
    storeReply: "Respuesta de 3DEureka",
    prev: "Anterior",
    next: "Siguiente",
    page: "Página",
    poweredBy: "Reseñas recogidas por",
    footerLabel: "Leer todas las reseñas de clientes",
    seeAllForProduct: "Todas las reseñas de la tienda",
  },
}

export function reviewCountLabel(locale: Locale, count: number): string {
  const copy = reviewsCopy[locale]
  return `${count.toLocaleString(locale)} ${count === 1 ? copy.one : copy.many}`
}
