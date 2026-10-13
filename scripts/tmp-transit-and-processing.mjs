import { randomBytes } from "node:crypto"
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()

function eventId() {
  return `shp_${Date.now().toString(36)}${randomBytes(4).toString("hex")}`
}

try {
  await client.query("begin")
  const targets = await client.query(`
    select id, carrier
    from orders
    where status = 'shipped'
      and not exists (
        select 1
        from shipment_events e
        where e.order_id = orders.id
          and e.status = 'in_transit'
          and e.location = 'Belgium'
          and e.created_at = (
            select max(created_at) from shipment_events where order_id = orders.id
          )
      )
    order by created_at
  `)
  if (targets.rows.length !== 85) {
    throw new Error(`Expected 85 shipped orders without an in-transit Belgium event, found ${targets.rows.length}`)
  }
  for (const order of targets.rows) {
    await client.query(
      `insert into shipment_events (id, order_id, status, location, carrier, created_at)
       values ($1, $2, 'in_transit', 'Belgium', $3, now())`,
      [eventId(), order.id, order.carrier || "3DJools Courier"],
    )
  }
  const paid = await client.query(`
    update orders
    set status = 'processing', updated_at = now()
    where status = 'paid'
    returning order_number
  `)
  if (paid.rows.length !== 13) {
    throw new Error(`Expected 13 paid orders, updated ${paid.rows.length}`)
  }
  await client.query("commit")
  console.log(JSON.stringify({
    inTransitAdded: targets.rows.length,
    movedToProcessing: paid.rows.map((row) => row.order_number),
  }, null, 2))
} catch (error) {
  await client.query("rollback")
  console.error(error.message)
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}
