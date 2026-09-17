import { Client } from 'pg';
const client = new Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
const { rows } = await client.query(`
  select id, name, category, jsonb_array_length(images) as img_count,
    (select count(*) from jsonb_array_elements_text(images) img where img like '%.png')::int as png_count
  from products
  where category in ('printers','laser-engravers')
  order by category, name
`);
console.log(JSON.stringify(rows, null, 2));
await client.end();
