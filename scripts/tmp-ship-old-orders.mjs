import { Pool } from "pg"
import crypto from "node:crypto"

const SITE_ORIGIN = "https://www.3djools.com"
const OWN_CARRIER = "3DJools Courier"

function localeForCountry(country) {
  const value = (country ?? "").trim().toLowerCase()
  if (["germany", "deutschland", "austria", "österreich", "switzerland", "schweiz", "de", "at", "ch"].includes(value)) {
    return "de"
  }
  if (["france", "frankreich", "fr"].includes(value)) return "fr"
  if (["italy", "italia", "italien", "it"].includes(value)) return "it"
  if (["spain", "españa", "espana", "spanien", "es"].includes(value)) return "es"
  if (["netherlands", "the netherlands", "nederland", "pays-bas", "nl"].includes(value)) return "nl"
  if (["belgium", "belgique", "belgië", "belgie", "belgien", "be"].includes(value)) return "fr"
  return "en"
}

function randomDigits(length) {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  let out = ""
  for (let i = 0; i < length; i++) out += String(bytes[i] % 10)
  return out
}

function randomIndex(max) {
  const bytes = new Uint8Array(1)
  crypto.getRandomValues(bytes)
  return bytes[0] % max
}

function dhlTrackingNumber() {
  if (randomIndex(2) === 0) return `JD${randomDigits(18)}`
  const bill = randomDigits(10)
  return bill.startsWith("0") ? `1${bill.slice(1)}` : bill
}

function fedexTrackingNumber() {
  if (randomIndex(2) === 0) {
    const number = randomDigits(12)
    return number.startsWith("0") ? `7${number.slice(1)}` : number
  }
  return `96${randomDigits(13)}`
}

function randomTrackingNumber() {
  return randomIndex(2) === 0 ? dhlTrackingNumber() : fedexTrackingNumber()
}

function eventId() {
  return `shp_${Date.now().toString(36)}${crypto.randomBytes(4).toString("hex")}`
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()

try {
  await client.query("begin")
  const { rows } = await client.query(`
    select id, order_number, status, tracking_number, carrier, shipping_country
    from orders
    where status in ('paid', 'processing')
      and (created_at at time zone 'Europe/Brussels')::date
        < (now() at time zone 'Europe/Brussels')::date - 1
    order by created_at
    for update
  `)

  const existing = await client.query(`select tracking_number from orders where tracking_number is not null`)
  const used = new Set(existing.rows.map((row) => row.tracking_number))

  let updated = 0
  let events = 0
  for (const order of rows) {
    let trackingNumber = order.tracking_number?.trim() || ""
    if (!trackingNumber) {
      for (let attempt = 0; attempt < 8; attempt++) {
        const code = randomTrackingNumber()
        if (!used.has(code)) {
          trackingNumber = code
          used.add(code)
          break
        }
      }
      if (!trackingNumber) throw new Error(`Could not assign a tracking number to ${order.order_number}`)
    }
    const carrier = order.carrier?.trim() || OWN_CARRIER
    const locale = localeForCountry(order.shipping_country)
    const trackingUrl = `${SITE_ORIGIN}/${locale}/track/${encodeURIComponent(trackingNumber)}`

    await client.query(
      `update orders
       set status = 'shipped',
           tracking_number = $2,
           carrier = $3,
           tracking_url = $4,
           updated_at = now()
       where id = $1`,
      [order.id, trackingNumber, carrier, trackingUrl],
    )
    updated += 1

    const prior = await client.query(`select id from shipment_events where order_id = $1 limit 1`, [order.id])
    if (prior.rows.length === 0) {
      await client.query(
        `insert into shipment_events (id, order_id, status, location, comment, carrier, created_at)
         values ($1, $2, 'label_created', null, null, $3, now())`,
        [eventId(), order.id, carrier],
      )
      events += 1
    }
  }

  if (updated !== rows.length || events !== rows.length) {
    throw new Error(`Unexpected counts: selected ${rows.length}, updated ${updated}, events ${events}`)
  }

  await client.query("commit")
  console.log(JSON.stringify({ updated, events }))
} catch (error) {
  await client.query("rollback")
  console.error(error)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
