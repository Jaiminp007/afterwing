// L4-A integrity fixtures (run before any registered measurement). Seed 2901 (never an
// exploration, practice or final seed) is used only for identity checks between arms that
// must match; no contrast between arms is measured or printed.
import { World4, runOne, samplePair, partnerScores, gConfidence, ALL_PAIRS, B, L2_GRID, EVOR3_GRID, META3_BASE, BASE_CFG, rng32 } from './l4.mjs';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const SCORER = fileURLToPath(new URL('./l4-score.mjs', import.meta.url));

const S = 2901;
let fails = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) fails++; };
const src = readFileSync(new URL('./l4.mjs', import.meta.url), 'utf8');
const sha = f => createHash('sha256').update(readFileSync(new URL(f, import.meta.url))).digest('hex').slice(0, 12);
const diverge = (a, b) => a.reduce((n, h, i) => n + (h !== b[i]), 0);

// F1. Isolation: l4.mjs imports nothing; frozen L3-V module untouched.
check(!/^\s*import\s/m.test(src), 'l4.mjs is self-contained (no imports; sim.mjs and l3v.mjs untouched)');
check(sha('./l3v.mjs') === '1fbb5b2eb105', `l3v.mjs sha256 ${sha('./l3v.mjs')} (frozen L3-V module unchanged)`);

// F2. Factorial cell P01: META3OFF runs META3's full G/alpha computation in shadow, yet is tickwise identical to FIXED.
const fx = runOne(S, 'FIXED', {}, { hashes: true, exo: true }), off = runOne(S, 'META3OFF', {}, { hashes: true });
check(diverge(fx.hashes, off.hashes) === 0 && fx.popSum === off.popSum, `META3OFF vs FIXED lockstep: ${diverge(fx.hashes, off.hashes)} divergent ticks of ${fx.hashes.length}`);
check(off.tel.l2Updates > 0 && off.gShareInModules > 0, `META3OFF shadow controller is live (${off.tel.l2Updates} shadow L2 updates, G share in modules ${off.gShareInModules.toFixed(3)})`);

// F3. Exogenous schedule identical across arms, though populations differ.
for (const [arm, cfg] of [['NOREV', {}], ['META', { l2Variant: 'D030B12' }], ['META3', {}], ['SHAM3', {}], ['EVOR3', { evorVariant: 'SV25' }], ['ORACLE3', {}], ['META3_RESET', {}]]) {
  const o = runOne(S, arm, cfg, { exo: true });
  check(diverge(fx.exo, o.exo) === 0 && o.popSum !== fx.popSum, `exogenous schedule ${arm} vs FIXED: ${diverge(fx.exo, o.exo)} differing ticks (populations differ: ${o.popSum !== fx.popSum ? 'yes' : 'NO'})`);
}

// F4. EVOR3:E0 (G = 0, no mutation) is exactly META on META3's base L2.
{ const e = runOne(S, 'EVOR3', { evorVariant: 'E0' }, { hashes: true }), m = runOne(S, 'META', { l2Variant: META3_BASE }, { hashes: true });
  check(diverge(e.hashes, m.hashes) === 0, `EVOR3:E0 vs META:${META3_BASE} lockstep: ${diverge(e.hashes, m.hashes)} divergent ticks`); }

// F5. World: 3 disjoint 4-bit modules cover all 12 bits; S is always a module; each macro switch moves to a different module.
{ const w = new World4(S, 'FIXED'), flat = w.partition.flat().sort((a, b) => a - b);
  check(w.partition.length === 3 && w.partition.every(g => g.length === 4) && flat.every((b, i) => b === i), `partition ${JSON.stringify(w.partition)} is 3 disjoint modules covering 12 bits`);
  let ok = true, switches = 0, prev = w.partIdx;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (!w.partition.includes(w.subset)) ok = false;
    if (w.tick % w.cfg.macroEvery === 1 && w.tick > 1) { if (w.partIdx === prev) ok = false; switches++; prev = w.partIdx; }
    if (!w.subset.includes(Math.log2(w.rule.mask & -w.rule.mask)) ) ok = false;
  }
  check(ok && switches === Math.floor((w.cfg.ticks - 1) / w.cfg.macroEvery), `S is always a module and the target pair lies in S; ${switches} macro switches, each to a different module`); }

// F6. L1 never reads G: identical alpha and proposal stream give identical draws whatever G holds.
{ const w = new World4(S, 'META3'), [f, g] = w.flies;
  f.alpha = f.alpha.map((_, i) => 1 + i); g.alpha = [...f.alpha];
  for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) g.G[i][j] = (i * 7 + j * 3) % 11;
  f.rProp = rng32(5); g.rProp = rng32(5); let same = true;
  for (let i = 0; i < 2000; i++) if (w.drawCandidate(f, new Set()) !== w.drawCandidate(g, new Set())) same = false;
  check(same, 'META3 proposals depend on alpha only (2000 draws identical under different G)'); }

// F7. Credit rule on the oracle G: module partners score 1, non-partners 0; confidence 1; zero G gives confidence 0.
{ const w = new World4(S, 'ORACLE3'), G = w.oracleG, [a, b] = w.partition[0].slice(0, 2);
  const [others, sc] = partnerScores(G, a, b, w.cfg);
  const ok = others.every((k, i) => sc[i] === (w.partition[0].includes(k) ? 1 : 0));
  check(ok && gConfidence(G, w.cfg) === 1 && gConfidence(w.flies[0].G, w.cfg) === 0, 'oracle G: partners score 1, others 0; confidence 1 (oracle) and 0 (zero G)'); }

// F8. One scripted L2 update: META3 spreads to G-partners and suppresses the rest; SHAM3 spreads the same mass to random bits.
{ const cfg = BASE_CFG, v = L2_GRID[META3_BASE];
  const setup = arm => { const w = new World4(S, arm), f = w.flies[0];
    const [a, b, c, d] = [0, 1, 2, 3]; f.G[a][c] = f.G[c][a] = f.G[b][c] = f.G[c][b] = 2; f.G[a][d] = f.G[d][a] = f.G[b][d] = f.G[d][b] = 2;
    f.alpha = Array(B).fill(5); f.masks = [0, 3]; f.w = [0, 5]; f.maskAge = [0, 50]; w.l2Update(f); return f; };
  const m = setup('META3'), dec = v.alphaDecay + gConfidence(m.G, cfg) * (cfg.hiDecay - v.alphaDecay);
  const base = 1 + (1 - dec) * 4;
  const near = (x, y) => Math.abs(x - y) < 1e-9;
  const ok = near(m.alpha[0], Math.min(v.alphaMax, base + v.alphaBoost)) && near(m.alpha[2], Math.min(v.alphaMax, base + v.alphaBoost)) && near(m.alpha[3], Math.min(v.alphaMax, base + v.alphaBoost)) && near(m.alpha[7], 1 + (1 - cfg.suppressDecay) * (base - 1));
  check(ok, 'META3 scripted update: validated bits and G-partners boosted, other bits suppressed');
  let hitPartners = 0, n = 0;
  const w = new World4(S, 'SHAM3'), cnt = Array(B).fill(0);
  for (let t = 0; t < 3000; t++) { const f = w.flies[t % w.flies.length]; f.rSham = rng32(1000 + t); f.G = Array.from({ length: B }, () => new Float64Array(B));
    f.G[0][2] = f.G[2][0] = f.G[1][2] = f.G[2][1] = 2; f.alpha = Array(B).fill(5); f.masks = [0, 3]; f.w = [0, 5]; f.maskAge = [0, 50]; w.l2Update(f);
    for (let k = 2; k < B; k++) if (f.alpha[k] > 10) { cnt[k]++; n++; if (k === 2) hitPartners++; } }
  const share = hitPartners / n;
  check(Math.abs(share - .1) < .03 && n > 2800, `SHAM3 spread lands on the true G-partner ${(share * 100).toFixed(1)}% of the time (uniform over 10 others = 10%)`); }

// F9. Inheritance law, scripted: G copied (META3, SHAM3, EVOR3, META3OFF), zeroed (META3_RESET, ORACLE3); alpha copied in every alpha arm; masks never.
const law = { META3: 'G', SHAM3: 'G', META3OFF: 'G', 'EVOR3:E0': 'G', META3_RESET: 'zero', ORACLE3: 'zero', META: 'none', FIXED: 'none' };
for (const [label, what] of Object.entries(law)) {
  const [arm, ev] = label.split(':');
  const w = new World4(S, arm, ev ? { evorVariant: ev } : arm === 'META' ? { l2Variant: 'D030B12' } : {});
  const p = w.flies[0]; p.alpha = p.alpha.map((_, i) => 1 + i); p.masks = [0, 3]; p.w = [1, 5]; p.maskAge = [0, 50];
  if (p.G) for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) p.G[i][j] = (i + j) % 5;
  const c = w.spawn(p, 0, 0, 25, 1);
  const gOk = what === 'G' ? c.G.every((r, i) => r.every((x, j) => x === p.G[i][j])) : what === 'zero' ? c.G.every(r => r.every(x => x === 0)) : c.G === null;
  const alphaOk = arm === 'FIXED' ? c.alpha.every(x => x === 1) : c.alpha.every((x, i) => x === 1 + i);
  check(gOk && alphaOk && c.masks.length === 1 && c.w[0] === 0 && c.buf.length === 0, `${label}: child G ${what === 'G' ? 'copied' : what === 'zero' ? 'zero' : 'absent'}, alpha ${arm === 'FIXED' ? 'reset' : 'copied'}; masks [0], weights 0`);
}

// F10. EVO-R3: visible mutation rates follow the grid; standing founders carry a random 3x4 partition.
for (const [v, g] of Object.entries(EVOR3_GRID)) {
  const w = new World4(S, 'EVOR3', { evorVariant: v }), p = w.flies[0]; let mut = 0; const n = 4000;
  for (let i = 0; i < n; i++) { const c = w.spawn(p, 0, 0, 25, 1); if (c.G.some((r, a) => r.some((x, b) => x !== p.G[a][b]))) mut++; w.flies.pop(); }
  const lo = g.pm * .4, hi = g.pm + .02;
  check(mut / n >= lo && mut / n <= hi, `EVOR3 ${v}: visible mutation rate ${(mut / n).toFixed(3)} (pm ${g.pm}; invisible no-op mutations allowed)`);
}
{ const w = new World4(S, 'EVOR3', { evorVariant: 'SV25' });
  const ok = w.flies.every(f => f.G.every((r, i) => r.filter(x => x === BASE_CFG.evorG).length === 3 && r[i] === 0));
  check(ok && new Set(w.flies.map(f => f.G.map(r => r.join()).join())).size > 50, 'EVOR3 SV founders: each bit has exactly 3 G-partners at evorG; > 50 distinct founder partitions'); }

// F11. Grid shape.
check(Object.keys(L2_GRID).length === 29 && L2_GRID[META3_BASE] && L2_GRID.L3V.alphaMax === 30, `L2_GRID has ${Object.keys(L2_GRID).length} constant variants incl. ${META3_BASE} and frozen L3V`);

// F12. Scorer on a synthetic batch with known contrasts; and it rejects a dirty batch.
{ const dir = mkdtempSync(join(tmpdir(), 'l4fx-')), seeds = Array.from({ length: 48 }, (_, i) => 1 + i);
  const arms = ['NOREV', 'FIXED', 'META:D060B20', 'META3', 'META3OFF', 'SHAM3', 'EVOR3:J25'];
  const base = { NOREV: 4000, FIXED: 5000, 'META:D060B20': 5400, META3: 6000, META3OFF: 5000, SHAM3: 5300, 'EVOR3:J25': 5500 };
  const rows = Object.fromEntries(seeds.map(s => [s, Object.fromEntries(arms.map(a => [a, { seed: s, popSum: base[a] + (a === 'META3' ? s % 3 : 0), skill: 0, alphaShareOnS: 0, gShareInModules: 0, correctPerEvBite: 0, extinct: false }]))]));
  const J = { test: 'L4-A', commit: 'x', dirty: false, seeds, arms, rows };
  writeFileSync(join(dir, 'b.json'), JSON.stringify(J));
  writeFileSync(join(dir, 'lock.json'), JSON.stringify({ test: 'L4-A', seeds: [999001], meta: 'META:D060B20', evor: 'EVOR3:J25' }));
  const out = JSON.parse(execFileSync('node', [SCORER, 'gates', join(dir, 'b.json'), join(dir, 'lock.json')]).toString());
  const d4 = out.gates[3], exp = (2 * (6000 + 1) - 3 * 5400 + 5000) / 200; // mean of s%3 over 1..48 is 1
  check(Math.abs(d4.mean - exp) < 1e-9 && d4.p === 2 ** -48 && Math.abs(out.ratio - 2.5025) < .001 && out.allGatesPass, `scorer synthetic: d4 ${d4.mean} (expect ${exp}), p ${d4.p.toExponential(2)}, ratio ${out.ratio}, all gates pass`);
  writeFileSync(join(dir, 'd.json'), JSON.stringify({ ...J, dirty: true }));
  let rejected = false; try { execFileSync('node', [SCORER, 'gates', join(dir, 'd.json'), join(dir, 'lock.json')], { stdio: 'pipe' }); } catch (e) { rejected = e.status === 3; }
  check(rejected, 'scorer rejects a batch produced from uncommitted code'); }

console.log(`\nl4.mjs sha256 ${sha('./l4.mjs')}; ${fails ? fails + ' FAILED' : 'all fixtures passed'}`);
process.exit(fails ? 1 : 0);
