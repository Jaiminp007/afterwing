// node analyze.mjs <rows.ndjson> [seedLo seedHi] [refArm]
import fs from 'node:fs';
import { signflip } from '../../docs/paper/stats.mjs';
const [file, lo = 0, hi = 1e9, ref] = process.argv.slice(2);
const rows = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse).filter(r => r.seed >= +lo && r.seed <= +hi);
const by = new Map();
for (const r of rows) { if (!by.has(r.arm)) by.set(r.arm, new Map()); by.get(r.arm).set(r.seed, r); }
const seeds = [...new Set(rows.map(r => r.seed))].sort();
const m = xs => xs.reduce((a, b) => a + b, 0) / xs.length;
const refM = ref && by.get(ref);
const out = [...by.entries()].map(([a, mp]) => {
  const ss = seeds.filter(s => mp.has(s));
  const pop = m(ss.map(s => mp.get(s).pop)), skill = m(ss.map(s => mp.get(s).skill));
  let extra = '';
  if (refM && a !== ref) { const d = ss.filter(s => refM.has(s)).map(s => mp.get(s).pop - refM.get(s).pop); extra = ` d=${m(d).toFixed(2)} ${d.filter(x => x > 0).length}/${d.length} p=${signflip(d).toPrecision(2)}`; }
  return [pop, `${a.padEnd(26)} n=${ss.length} pop=${pop.toFixed(2)} skill=${skill.toFixed(4)} ext=${ss.filter(s => mp.get(s).extinct).length}${extra}`];
}).sort((a, b) => b[0] - a[0]);
for (const [, l] of out) console.log(l);
