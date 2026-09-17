import { readFileSync, writeFileSync } from 'fs';

const affected = JSON.parse(readFileSync('/tmp/affected.json', 'utf8'));

function cleanQuery(name) {
  // "Bambu Lab A2L" etc — add "3D printer" and bias toward retailer/real-world photos
  const kind = /laser/i.test(name) ? 'laser engraver' : '3D printer';
  return `${name} ${kind} photo review unboxing -render -mockup`;
}

const out = affected.map((a) => {
  const existingReal = a.paths.filter((p) => !/\.png(\?|$)/i.test(p));
  const target = Math.max(existingReal.length + 3, 6);
  const needed = Math.max(target - existingReal.length, 3);
  return {
    slug: a.slug,
    name: a.name,
    brand: 'Bambu Lab',
    category: a.category,
    query: cleanQuery(a.name),
    existingReal,
    needed,
    totalWanted: target,
  };
});

writeFileSync('/tmp/queries.json', JSON.stringify(out, null, 2));
console.log('wrote', out.length, 'queries');
for (const o of out) console.log(o.slug, '|', o.query, '| existingReal=', o.existingReal.length, '| needed=', o.needed);
