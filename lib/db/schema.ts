import { boolean, integer, jsonb, pgTable, real, serial, text, timestamp } from "drizzle-orm/pg-core"

/* ------------------------------------------------------------------ */
/* Better Auth tables (column names are camelCase to match Better      */
/* Auth defaults — do not rename).                                     */
/* ------------------------------------------------------------------ */

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
})

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

/**
 * Snapshot of a single cart line captured at application time, so the
 * installment agreement is tied to exact products/prices even if the
 * catalog changes later.
 */
export type ApplicationCartItem = {
  productId: string
  slug: string
  name: string
  quantity: number
  unitPriceCents: number
}

/**
 * One scheduled installment. `amountCents` for the 4 payments always sums
 * to the order total; the first entry is the 25% down payment (due now).
 * `status` tracks the customer/admin payment-confirmation cycle for this
 * entry: "unpaid" until the customer clicks "I've paid", then "reviewing"
 * until an admin confirms receipt, then "paid".
 */
export type ScheduleEntry = {
  index: number
  label: "down_payment" | "installment"
  dueDate: string // ISO date
  amountCents: number
  paid: boolean
  status?: "unpaid" | "reviewing" | "paid"
}

export const installmentApplications = pgTable("installment_applications", {
  id: serial("id").primaryKey(),
  applicationRef: text("application_ref").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected | cancelled
  // Linked order created at application time (paymentMethod: "installments").
  orderId: text("order_id"),

  // KYC — extended
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  nationality: text("nationality").notNull(),
  idDocumentType: text("id_document_type").notNull(), // passport | national_id | drivers_license
  idDocumentNumber: text("id_document_number").notNull(),
  addressLine1: text("address_line1").notNull(),
  addressLine2: text("address_line2"),
  city: text("city").notNull(),
  postalCode: text("postal_code").notNull(),
  country: text("country").notNull(),
  employmentStatus: text("employment_status").notNull(),
  monthlyIncomeCents: integer("monthly_income_cents").notNull().default(0),

  // Private Blob pathname for the uploaded ID document (never a public URL)
  idDocumentPathname: text("id_document_pathname").notNull(),

  // Order snapshot + finance breakdown
  currency: text("currency").notNull().default("EUR"),
  cartItems: jsonb("cart_items").$type<ApplicationCartItem[]>().notNull().default([]),
  totalAmountCents: integer("total_amount_cents").notNull(),
  downPaymentCents: integer("down_payment_cents").notNull(),
  remainingCents: integer("remaining_cents").notNull(),
  schedule: jsonb("schedule").$type<ScheduleEntry[]>().notNull().default([]),

  locale: text("locale").notNull().default("en"),
  termsAccepted: boolean("terms_accepted").notNull().default(false),
  dataConsent: boolean("data_consent").notNull().default(false),

  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
})

export type InstallmentApplication = typeof installmentApplications.$inferSelect
export type NewInstallmentApplication = typeof installmentApplications.$inferInsert

/* ------------------------------------------------------------------ */
/* Catalog — brands, categories, products.                             */
/* Nested shapes (specs, images, useCases, buildVolume) are stored as   */
/* JSONB so the Product shape used across the app is preserved exactly. */
/* ------------------------------------------------------------------ */

import type { Availability, CategorySlug, ProductSpec, ProductTranslation, Technology, UseCase } from "@/lib/catalog/types"

export const brands = pgTable("brands", {
  slug: text("slug").primaryKey(),
  name: text("name").notNull(),
  blurb: text("blurb").notNull().default(""),
  country: text("country").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const categories = pgTable("categories", {
  slug: text("slug").primaryKey(),
  key: text("key").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const products = pgTable("products", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  brandSlug: text("brand_slug").notNull(),
  category: text("category").$type<CategorySlug>().notNull(),
  technology: text("technology").$type<Technology>(),
  useCases: jsonb("use_cases").$type<UseCase[]>().notNull().default([]),
  priceCents: integer("price_cents").notNull(),
  compareAtCents: integer("compare_at_cents"),
  /** When set, the discount reflected in priceCents/compareAtCents is a time-boxed sale.
   *  Once this timestamp passes, read queries automatically revert to compareAtCents as the
   *  selling price and drop the strike-through — no cron job required. */
  saleEndsAt: timestamp("sale_ends_at", { withTimezone: true }),
  availability: text("availability").$type<Availability>().notNull().default("in_stock"),
  condition: text("condition").notNull().default("new"),
  stock: integer("stock").notNull().default(0),
  gtin: text("gtin"),
  ean: text("ean"),
  mpn: text("mpn").notNull().default(""),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  highlights: jsonb("highlights").$type<string[]>().notNull().default([]),
  /** Per-locale overrides for name/shortDescription/description/highlights, keyed by locale code (e.g. "de"). English lives in the base columns above. */
  translations: jsonb("translations").$type<Record<string, ProductTranslation>>().notNull().default({}),
  specs: jsonb("specs").$type<ProductSpec[]>().notNull().default([]),
  images: jsonb("images").$type<string[]>().notNull().default([]),
  featured: boolean("featured").notNull().default(false),
  bestseller: boolean("bestseller").notNull().default(false),
  weightKg: real("weight_kg").notNull().default(0),
  buildVolumeMm: jsonb("build_volume_mm").$type<{ x: number; y: number; z: number }>(),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export type ProductRow = typeof products.$inferSelect
export type NewProductRow = typeof products.$inferInsert
export type BrandRow = typeof brands.$inferSelect
export type CategoryRow = typeof categories.$inferSelect

/* ------------------------------------------------------------------ */
/* Orders — order header + line items.                                 */
/* `userId` is nullable so guest orders are supported; when set it      */
/* scopes the order to a customer account for the customer area.        */
/* ------------------------------------------------------------------ */

/**
 * Full order lifecycle. `partially_paid` covers installment plans where
 * the down payment is settled but the remaining schedule is not.
 */
export const ORDER_STATUSES = [
  "pending",
  "awaiting_payment",
  "reviewing_payment",
  "partially_paid",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const

export type OrderStatus = (typeof ORDER_STATUSES)[number]

export const PAYMENT_METHODS = ["card", "alppay", "paypal", "square", "bank_transfer", "crypto", "installments"] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  userId: text("user_id"),
  email: text("email").notNull(),
  status: text("status").$type<OrderStatus>().notNull().default("pending"),
  paymentMethod: text("payment_method").$type<PaymentMethod>().notNull().default("card"),
  subtotalCents: integer("subtotal_cents").notNull(),
  shippingCents: integer("shipping_cents").notNull().default(0),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull().default("EUR"),
  shippingName: text("shipping_name"),
  shippingAddress1: text("shipping_address1"),
  shippingAddress2: text("shipping_address2"),
  shippingCity: text("shipping_city"),
  shippingPostalCode: text("shipping_postal_code"),
  shippingCountry: text("shipping_country"),
  trackingNumber: text("tracking_number"),
  trackingUrl: text("tracking_url"),
  carrier: text("carrier"),
  notes: text("notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

export const orderItems = pgTable("order_items", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull(),
  productSlug: text("product_slug").notNull(),
  productName: text("product_name").notNull(),
  brandName: text("brand_name"),
  image: text("image"),
  unitPriceCents: integer("unit_price_cents").notNull(),
  quantity: integer("quantity").notNull(),
  lineTotalCents: integer("line_total_cents").notNull(),
})

export type OrderRow = typeof orders.$inferSelect
export type NewOrderRow = typeof orders.$inferInsert
export type OrderItemRow = typeof orderItems.$inferSelect
export type NewOrderItemRow = typeof orderItems.$inferInsert

export const shipmentEvents = pgTable("shipment_events", {
  id: text("id").primaryKey(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: text("status").notNull(),
  location: text("location"),
  comment: text("comment"),
  carrier: text("carrier"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type ShipmentEventRow = typeof shipmentEvents.$inferSelect
export type NewShipmentEventRow = typeof shipmentEvents.$inferInsert

/* ------------------------------------------------------------------ */
/* Contact messages — feedback form submissions for the admin inbox.   */
/* ------------------------------------------------------------------ */

export const CONTACT_STATUSES = ["new", "read", "resolved"] as const
export type ContactStatus = (typeof CONTACT_STATUSES)[number]

export const contactMessages = pgTable("contact_messages", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  subject: text("subject"),
  message: text("message").notNull(),
  locale: text("locale").notNull().default("en"),
  status: text("status").$type<ContactStatus>().notNull().default("new"),
  adminNotes: text("admin_notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
})

export type ContactMessageRow = typeof contactMessages.$inferSelect
export type NewContactMessageRow = typeof contactMessages.$inferInsert

/* ------------------------------------------------------------------ */
/* Live chat — visitor-facing widget backed by AI, hand-off to admin.  */
/* ------------------------------------------------------------------ */

export const CHAT_MODES = ["ai", "human"] as const
export type ChatMode = (typeof CHAT_MODES)[number]

export const chatConversations = pgTable("chat_conversations", {
  id: text("id").primaryKey(),
  visitorId: text("visitor_id").notNull(),
  visitorName: text("visitor_name"),
  visitorEmail: text("visitor_email"),
  locale: text("locale").notNull().default("en"),
  mode: text("mode").$type<ChatMode>().notNull().default("ai"),
  unreadForAdmin: boolean("unread_for_admin").notNull().default(true),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  lastMessageAt: timestamp("last_message_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const CHAT_ROLES = ["user", "assistant", "admin"] as const
export type ChatRole = (typeof CHAT_ROLES)[number]

export const chatMessages = pgTable("chat_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  role: text("role").$type<ChatRole>().notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type ChatConversationRow = typeof chatConversations.$inferSelect
export type NewChatConversationRow = typeof chatConversations.$inferInsert
export type ChatMessageRow = typeof chatMessages.$inferSelect
export type NewChatMessageRow = typeof chatMessages.$inferInsert

/** Maps an outbound Telegram message to the live-chat conversation it belongs to. */
export const chatTelegramLinks = pgTable("chat_telegram_links", {
  telegramMessageId: text("telegram_message_id").primaryKey(),
  conversationId: text("conversation_id")
    .notNull()
    .references(() => chatConversations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

/** One row per unsuccessful AlpPay payment. The same payment id is never counted twice. */
export const alppayAttempts = pgTable("alppay_attempts", {
  paymentId: text("payment_id").primaryKey(),
  email: text("email").notNull(),
  orderNumber: text("order_number").notNull(),
  state: text("state").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

/** Pauses an email for 24 hours after three unsuccessful AlpPay attempts. */
export const alppayHolds = pgTable("alppay_holds", {
  email: text("email").primaryKey(),
  failCount: integer("fail_count").notNull().default(0),
  holdUntil: timestamp("hold_until", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
})
