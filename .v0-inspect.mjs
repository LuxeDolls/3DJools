import { loadEnv } from './.v0-env.mjs'
loadEnv()
import pg from 'pg'
const c = new pg.Client({ connectionString: process.env.DATABASE_URL })
await c.connect()
const r = await c.query("select slug, name, brand_slug, category, images from products where category in ('printers','laser-engravers') order by category, brand_slug, slug")
const rows = r.rows.map(row=>{
  const imgs = row.images||[]
  const png = imgs.filter(i=>i.toLowerCase().endsWith('.png')).length
  const real = imgs.length - png
  return {...row, n: imgs.length, png, real}
})
const targets = rows.filter(x=> x.n<3 || x.png>0)
console.log('TOTAL target products:', targets.length, 'of', rows.length)
console.log('\nslug | name | brand | cat | total | png(gen) | real')
for (const x of targets) {
  console.log(`${x.slug} | ${x.name} | ${x.brand_slug} | ${x.category} | n=${x.n} | png=${x.png} | real=${x.real}`)
}
await c.end()
