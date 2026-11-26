// Frozen V4/A1 gates. Usage: node docs/paper/score-v4.mjs
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { signflip, bootCI, mean } from './stats.mjs';

const root = new URL('../../evidence/microverse/paper-v4/', import.meta.url);
const load = file => JSON.parse(readFileSync(new URL(file, root), 'utf8'));
const l2 = load('r-l2-6100001-6100048.json');
const seeds = Array.from({ length: 48 }, (_, i) => String(6100001 + i));
const arms = ['META', 'SHAM', 'EVOR', 'FIXED'];
assert.equal(l2.seeds, seeds.length);
assert.deepEqual(Object.keys(l2.perSeed).sort(), seeds);
for (const s of seeds) {
  assert.deepEqual(Object.keys(l2.perSeed[s]).sort(), [...arms].sort());
  assert.ok(arms.every(a => Number.isFinite(l2.perSeed[s][a])), `Invalid L2 values for ${s}`);
}
const solo = ['TASTEONLY', 'MOVEONLY'].map(B => {
  const j = load(`r-g7c-${B.toLowerCase()}-6200001-6200096.json`);
  assert.equal(j.A, 'SELF');
  assert.equal(j.B, B);
  assert.equal(j.seeds, 96);
  assert.equal(j.diffs.length, 96);
  assert.ok(j.diffs.every(Number.isFinite));
  assert.ok(Number.isFinite(j.meanA) && Number.isFinite(j.meanB));
  return j;
});

console.log('V4/A1: exact one-sided sign-flip p from stats.mjs; runner p-values ignored.');
console.log('L2 uses perSeed arm differences; G7c uses saved diffs rounded to 0.1.');
console.log('Sign-flip grid: 0.01. Bootstrap: 20,000 percentile resamples, seed 4242.');
console.log('\nArm means (late mean population):');
for (const a of arms) console.log(`R-L2 ${a}: ${mean(seeds.map(s => l2.perSeed[s][a])).toFixed(6)}`);
for (const j of solo) console.log(`R-G7c vs ${j.B}: SELF ${j.meanA.toFixed(2)}, ${j.B} ${j.meanB.toFixed(2)} (stored means rounded to 0.01)`);

console.log('\n| Replication | Contrast | Mean difference | Positive seeds/n | Exact one-sided p | Bootstrap 95% CI | Bar | Verdict |');
console.log('|---|---|---:|---:|---:|---|---|---|');
function gate(replication, label, d, bar, strict = false) {
  const m = mean(d), p = signflip(d), ci = bootCI(d);
  const pass = (strict ? m > bar : m >= bar) && p < .01;
  console.log(`| ${replication} | ${label} | ${m.toFixed(6)} | ${d.filter(x => x > 0).length}/${d.length} | ${p.toPrecision(12)} | [${ci.map(x => x.toFixed(6)).join(', ')}] | mean ${strict ? '>' : '>='} ${bar}; p < .01 | ${pass ? 'PASS' : 'FAIL'} |`);
  return pass;
}
const l2Results = [
  gate('R-L2', 'META-EVOR', seeds.map(s => l2.perSeed[s].META - l2.perSeed[s].EVOR), 1),
  gate('R-L2', 'META-SHAM', seeds.map(s => l2.perSeed[s].META - l2.perSeed[s].SHAM), 1),
  gate('R-L2', 'META-FIXED', seeds.map(s => l2.perSeed[s].META - l2.perSeed[s].FIXED), 0, true),
];
const g7cResults = solo.map(j => gate('R-G7c', `SELF-${j.B}`, j.diffs, .7));
console.log(`\nR-L2 overall: ${l2Results.every(Boolean) ? 'PASS' : 'FAIL'} (all three gates required)`);
console.log(`R-G7c overall: ${g7cResults.every(Boolean) ? 'PASS' : 'FAIL'} (both gates required)`);
