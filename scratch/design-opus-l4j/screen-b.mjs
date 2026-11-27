// (a)/(b) on tuning seeds: FIXED = best depth-1 arm, L2 = best ROT, per-seed hindsight best ROT beta.
// node screen-b.mjs rowsA.ndjson [rowsRep.ndjson]
import fs from 'node:fs';
import { signflip } from '../../docs/paper/stats.mjs';
const load = f => fs.readFileSync(f, 'utf8').split(/\r?\n/).filter(Boolean).map(JSON.parse);
const rows = load(process.argv[2]);
const seeds = Array.from({ length: 16 }, (_, i) => 953001 + i);
const P = new Map(); for (const r of rows) P.set(`${r.seed}:${r.arm}`, r.pop);
const arms = [...new Set(rows.map(r => r.arm))].filter(a => seeds.every(s => P.has(`${s}:${a}`)));
const mean = a => seeds.reduce((t, s) => t + P.get(`${s}:${a}`), 0) / seeds.length;
const d1 = arms.filter(a => /^(KRW|LAST|CV)/.test(a)), rot = arms.filter(a => /^ROT_b[0-9.]+$/.test(a));
const best = xs => xs.reduce((b, a) => mean(a) > mean(b) ? a : b);
const F = best(d1), L2 = best(rot);
const d = seeds.map(s => P.get(`${s}:${L2}`) - P.get(`${s}:${F}`));
const g = mean(L2) - mean(F);
console.log(`FIXED ${F} ${mean(F).toFixed(2)} | L2 ${L2} ${mean(L2).toFixed(2)} | gain ${g.toFixed(2)} ${d.filter(x => x > 0).length}/16 p=${signflip(d).toPrecision(3)}`);
console.log('ROT sweep', rot.map(a => `${a.slice(5)}:${mean(a).toFixed(2)}`).join(' '));
const per = seeds.map(s => Math.max(...rot.map(a => P.get(`${s}:${a}`))));
const room = per.reduce((a, b) => a + b, 0) / 16 - mean(L2);
console.log(`per-lineage hindsight best ${(mean(L2) + room).toFixed(2)} room ${room.toFixed(2)} need ${(g / 2).toFixed(2)}`);
if (process.argv[3]) {
  const rep = load(process.argv[3]), R = new Map(rep.map(r => [`${r.seed}:${r.arm.replace(/_R1$/, '')}`, r.pop]));
  const diffs = seeds.filter(s => R.has(`${s}:${L2}`)).map(s => R.get(`${s}:${L2}`) - P.get(`${s}:${L2}`));
  const sd = Math.sqrt(diffs.reduce((a, x) => a + x * x, 0) / diffs.length / 2);
  console.log(`replicate noise sd per run ${sd.toFixed(2)} (n=${diffs.length})`);
  // null expectation of the per-seed max over the sweep if all betas were equal: simulate
  let acc = 0; const K = rot.length, M = 20000;
  for (let m = 0; m < M; m++) { let mx = -Infinity; for (let k = 0; k < K; k++) { let u = 0; while (!u) u = Math.random(); mx = Math.max(mx, sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * Math.random())); } acc += mx; }
  console.log(`selection-noise bias of a max over ${K} iid runs ~ +${(acc / M).toFixed(2)} (upper bound on bias for correlated arms)`);
}
