import { readFileSync, writeFileSync } from 'fs';

const affected = JSON.parse(readFileSync('/tmp/affected.json', 'utf8'));

const BRAND_NAMES = {
  'bambu-lab': 'Bambu Lab',
  creality: 'Creality',
  elegoo: 'Elegoo',
  anycubic: 'Anycubic',
  twotrees: 'TwoTrees',
  xtool: 'xTool',
  formlabs: 'Formlabs',
  prusa: 'Prusa',
  raise3d: 'Raise3D',
  snapmaker: 'Snapmaker',
  voltera: 'Voltera',
  zortrax: 'Zortrax',
};

function cleanName(name, brand) {
  // strip trailing combo/bundle qualifiers that confuse search, keep core model
  return name;
}

const out = affected.map((a) => {
  const brandName = BRAND_NAMES[a.brand] || a.brand;
  const kind = a.category === 'laser-engravers' ? 'laser engraver' : '3D printer';
  const name = cleanName(a.name, brandName);
  // primary query: full product name + kind
  const query = `${name} ${kind}`;
  const existingReal = a.paths.filter((p) => !/\.png(\?|$)/i.test(p));
  const needed = Math.max(3 - existingReal.length, 0);
  return { slug: a.slug, name: a.name, brand: brandName, category: a.category, query, existingReal, needed, totalWanted: Math.max(3, existingReal.length) };
});

writeFileSync('/tmp/queries.json', JSON.stringify(out, null, 2));
console.log('wrote', out.length, 'queries');
for (const o of out) console.log(o.slug, '|', o.query, '| existingReal=', o.existingReal.length, '| needed=', o.needed);
