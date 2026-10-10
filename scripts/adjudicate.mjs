// Maps hand-assigned labels (per document, in report order) onto eval/adjudication.json.
// v = valid consumer risk missing from sparse gold, b = borderline, n = noise / false alarm.
// Usage: node scripts/adjudicate.mjs <results-tag> '<json {doc: "vbn..."}>'
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
const [tag, json] = process.argv.slice(2);
const labels = JSON.parse(json);
const extras = JSON.parse(readFileSync(`eval/results/${tag}/extras.json`, 'utf8'));
const M = { v: 'valid', b: 'borderline', n: 'noise' };
const out = existsSync('eval/adjudication.json') ? JSON.parse(readFileSync('eval/adjudication.json', 'utf8')) : {};
for (const [doc, ls] of Object.entries(labels)) {
  const mine = extras.filter((e) => e.doc === doc);
  if (mine.length !== ls.length) throw new Error(`${doc}: ${mine.length} extras but ${ls.length} labels`);
  mine.forEach((e, i) => (out[e.key] = M[ls[i]]));
}
writeFileSync('eval/adjudication.json', JSON.stringify(out, null, 2));
console.log('adjudicated', Object.keys(out).length);
