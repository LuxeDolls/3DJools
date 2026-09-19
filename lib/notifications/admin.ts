import "server-only"

import { getToken } from "@vercel/connect"
import { sendEmail } from "@/lib/email/send"
import type { OrderWithItems } from "@/lib/orders/queries"

type AdminNotification = {
  subject: string
  title: string
  text: string
  html: string
}

const telegramConnector = "api.telegram.org/3djools-live-chat-alerts"
const telegramChatId = process.env.TELEGRAM_CHAT_ID
const adminEmail = "info@3djools.com"

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }
    return entities[character]
  })
}

function euros(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`
}

function linesToHtml(lines: string[]): string {
  return lines.map((line) => (line ? `<p style="margin:0 0 8px;color:#222">${escapeHtml(line)}</p>` : "<br>")).join("")
}

async function notifyAdmin(notification: AdminNotification): Promise<void> {
  await Promise.allSettled([
    sendEmail({
      to: adminEmail,
      subject: notification.subject,
      text: notification.text,
      html: `<h1 style="font-family:Arial,sans-serif">${escapeHtml(notification.title)}</h1><div style="font-family:Arial,sans-serif;line-height:1.5">${notification.html}</div>`,
    }),
    sendTelegramNotification(`${notification.title}\n\n${notification.text}`),
  ])
}

async function sendTelegramNotification(text: string): Promise<void> {
  if (!telegramChatId) {
    console.warn("[v0] Telegram admin notification skipped: TELEGRAM_CHAT_ID is not configured")
    return
  }

  try {
    const token = await getToken(telegramConnector, { subject: { type: "app" } })
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: telegramChatId, text: text.slice(0, 4000) }),
    })

    if (!response.ok) {
      console.error("[v0] Telegram admin notification failed:", response.status, await response.text())
    }
  } catch (error) {
    console.error("[v0] Telegram admin notification error:", error)
  }
}

export async function notifyNewCustomer(user: {
  id: string
  name: string
  email: string
  createdAt: Date
}): Promise<void> {
  const lines = [
    "A new customer account was registered on 3DJools.",
    `Name: ${user.name}`,
    `Email: ${user.email}`,
    `Customer ID: ${user.id}`,
    `Registered: ${user.createdAt.toISOString()}`,
  ]

  await notifyAdmin({
    subject: `New customer registration — ${user.email}`,
    title: "New customer registration",
    text: lines.join("\n"),
    html: linesToHtml(lines),
  })
}

function orderLines(order: OrderWithItems): string[] {
  return [
    `Order: ${order.orderNumber}`,
    `Status: ${order.status}`,
    `Payment method: ${order.paymentMethod}`,
    `Customer email: ${order.email}`,
    `Customer name: ${order.shippingName ?? "Not provided"}`,
    `Customer account ID: ${order.userId ?? "Guest checkout"}`,
    `Created: ${order.createdAt.toISOString()}`,
    "",
    "Items:",
    ...order.items.map(
      (item) => `- ${item.productName} × ${item.quantity} — ${euros(item.lineTotalCents)} (unit: ${euros(item.unitPriceCents)})`,
    ),
    "",
    `Subtotal: ${euros(order.subtotalCents)}`,
    `Shipping: ${euros(order.shippingCents)}`,
    `Total: ${euros(order.totalCents)} ${order.currency}`,
    `Shipping address: ${[
      order.shippingAddress1,
      order.shippingAddress2,
      order.shippingPostalCode,
      order.shippingCity,
      order.shippingCountry,
    ]
      .filter(Boolean)
      .join(", ") || "Not provided"}`,
    order.notes ? `Notes: ${order.notes}` : "",
  ]
}

export async function notifyNewOrder(order: OrderWithItems): Promise<void> {
  const lines = ["A new order was created on 3DJools.", "", ...orderLines(order)]
  await notifyAdmin({
    subject: `New order ${order.orderNumber} — ${euros(order.totalCents)}`,
    title: "New order",
    text: lines.join("\n"),
    html: linesToHtml(lines),
  })
}

export async function notifyOrderStatusChange(
  order: OrderWithItems,
  previousStatus: string,
): Promise<void> {
  const lines = [
    `Order status changed: ${previousStatus} → ${order.status}`,
    "",
    ...orderLines(order),
  ]
  await notifyAdmin({
    subject: `Order ${order.orderNumber}: ${previousStatus} → ${order.status}`,
    title: "Order or payment status changed",
    text: lines.join("\n"),
    html: linesToHtml(lines),
  })
}

export async function notifyPaymentSubmitted(order: OrderWithItems): Promise<void> {
  const lines = ["The customer submitted a payment confirmation.", "", ...orderLines(order)]
  await notifyAdmin({
    subject: `Payment submitted for order ${order.orderNumber}`,
    title: "Payment confirmation submitted",
    text: lines.join("\n"),
    html: linesToHtml(lines),
  })
}

export async function notifyInstallmentApplication(application: {
  applicationRef: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  totalAmountCents: number
  downPaymentCents: number
  createdAt: Date
}): Promise<void> {
  const lines = [
    "A new instalment application was submitted.",
    `Reference: ${application.applicationRef}`,
    `Name: ${application.firstName} ${application.lastName}`,
    `Email: ${application.email}`,
    `Phone: ${application.phone}`,
    `Country: ${application.country}`,
    `Total: ${euros(application.totalAmountCents)}`,
    `Down payment: ${euros(application.downPaymentCents)}`,
    `Created: ${application.createdAt.toISOString()}`,
  ]
  await notifyAdmin({
    subject: `New instalment application — ${application.applicationRef}`,
    title: "New instalment application",
    text: lines.join("\n"),
    html: linesToHtml(lines),
  })
}
