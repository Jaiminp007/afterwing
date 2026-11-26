// V5 of docs/PAPER_VERIFICATION_PLAN.md: score the practice-seed sensitivity runs with the exact test.
// Usage (from repo root): node docs/paper/score-v5.mjs
import { readFileSync } from 'node:fs';
import { mean, signflip } from './stats.mjs';
const L = f => JSON.parse(readFileSync(`evidence/microverse/paper-v5/${f}.json`, 'utf8'));
const row = (name, d) => `${name.padEnd(28)} mean ${mean(d).toFixed(2).padStart(6)}  wins ${d.filter(x => x > 0).length}/${d.length}  p ${signflip(d).toExponential(1)}`;
for (const v of ['base', 'lowcost', 'highcost', 'slowswitch', 'fastswitch']) {
  const j = L(`l2-${v}`), S = Object.keys(j.perSeed);
  console.log(`L2 ${v}: means ${JSON.stringify(j.means)}`);
  for (const B of ['EVOR', 'SHAM', 'FIXED']) console.log('  ' + row(`META-${B}`, S.map(s => j.perSeed[s].META - j.perSeed[s][B])));
}
{ const j = L('l2-inert'), S = Object.keys(j.perSeed); console.log(`L2 inert (lean=full): means ${JSON.stringify(j.means)}`); console.log('  ' + row('META-SHAM (RNG only)', S.map(s => j.perSeed[s].META - j.perSeed[s].SHAM))); }
for (const E of [3000, 2000, 4500]) for (const B of ['TASTEONLY', 'MOVEONLY']) { const j = L(`g7c-${B}-epoch${E}`); console.log(`G7c epoch ${E}: ` + row(`SELF-${B}`, j.diffs) + `  (SELF ${j.meanA}, ${B} ${j.meanB})`); }
