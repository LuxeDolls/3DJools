import { randomBytes } from "node:crypto"
import pg from "pg"

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()

try {
  await client.query("begin")
  const orders = await client.query(`
    select o.id, o.order_number, coalesce(nullif(btrim(o.carrier), ''), '3DJools Courier') as carrier
    from orders o
    where o.status = 'shipped'
      and not exists (
        select 1 from shipment_events e
        where e.order_id = o.id
          and e.status = 'at_warehouse'
          and e.location = 'Manage, Belgium'
      )
    order by o.order_number
    for update
  `)

  for (const order of orders.rows) {
    const id = `shp_${Date.now().toString(36)}${randomBytes(4).toString("hex")}`
    await client.query(
      `insert into shipment_events (id, order_id, status, location, comment, carrier, created_at)
       values ($1, $2, 'at_warehouse', 'Manage, Belgium', null, $3, now())`,
      [id, order.id, order.carrier],
    )
  }

  const check = await client.query(`
    select count(*)::int as shipped,
      count(*) filter (
        where exists (
          select 1 from shipment_events e
          where e.order_id = orders.id
            and e.status = 'at_warehouse'
            and e.location = 'Manage, Belgium'
        )
      )::int as with_warehouse
    from orders
    where status = 'shipped'
  `)
  if (check.rows[0].shipped !== check.rows[0].with_warehouse) {
    throw new Error(`Warehouse status missing on ${check.rows[0].shipped - check.rows[0].with_warehouse} shipped orders`)
  }

  await client.query("commit")
  console.log(JSON.stringify({ added: orders.rows.length, shipped: check.rows[0].shipped }, null, 2))
} catch (error) {
  await client.query("rollback")
  throw error
} finally {
  client.release()
  await pool.end()
}
