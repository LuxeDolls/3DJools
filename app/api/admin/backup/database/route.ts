import { isAdmin } from "@/lib/admin-auth"
import { pool } from "@/lib/db"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function quoteIdentifier(value: string): string {
  return `"${value.replaceAll('"', '""')}"`
}

function serialize(value: unknown): unknown {
  if (Buffer.isBuffer(value)) return { type: "Buffer", data: value.toString("base64") }
  if (value instanceof Date) return value.toISOString()
  if (typeof value === "bigint") return value.toString()
  return value
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const tableResult = await pool.query<{ table_schema: string; table_name: string }>(`
    SELECT table_schema, table_name
    FROM information_schema.tables
    WHERE table_type = 'BASE TABLE'
      AND table_schema IN ('public', 'neon_auth')
    ORDER BY table_schema, table_name
  `)

  const tables = []
  for (const table of tableResult.rows) {
    const qualified = `${quoteIdentifier(table.table_schema)}.${quoteIdentifier(table.table_name)}`
    const columnsResult = await pool.query<{ column_name: string; data_type: string; ordinal_position: number }>(
      `SELECT column_name, data_type, ordinal_position
       FROM information_schema.columns
       WHERE table_schema = $1 AND table_name = $2
       ORDER BY ordinal_position`,
      [table.table_schema, table.table_name],
    )
    const rows = await pool.query(`SELECT * FROM ${qualified}`)

    tables.push({
      schema: table.table_schema,
      name: table.table_name,
      columns: columnsResult.rows,
      rowCount: rows.rowCount ?? rows.rows.length,
      rows: rows.rows.map((row) =>
        Object.fromEntries(Object.entries(row).map(([key, value]) => [key, serialize(value)])),
      ),
    })
  }

  const body = JSON.stringify(
    {
      format: "3djools-postgres-json",
      version: 1,
      generatedAt: new Date().toISOString(),
      warning: "This backup contains sensitive authentication records. Store it encrypted and do not share it.",
      tables,
    },
    null,
    2,
  )

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="3djools-database-${new Date().toISOString().slice(0, 10)}.json"`,
      "Cache-Control": "no-store",
    },
  })
}
