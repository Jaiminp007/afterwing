// L3-V integrity fixtures (run before any registered measurement). Seed 901 (never a practice or final seed) is used only
// for identity checks between arms that must match; no contrast is measured.
import { WorldV, runOne, samplePair, ALL_PAIRS, B, EVOR_GRID, rng32 } from './l3v.mjs';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

let fails = 0;
const check = (ok, msg) => { console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`); if (!ok) fails++; };
const src = readFileSync(new URL('./l3v.mjs', import.meta.url), 'utf8');

// F1. Default microverse untouched.
check(!/from '\.\/sim\.mjs'/.test(src), 'l3v.mjs is self-contained (default-world sim.mjs untouched)');

// F2. METAOFF vs NOREV tick-wise lockstep, 20,000 ticks.
const a = runOne(901, 'NOREV', {}, { hashes: true, exo: true }), b = runOne(901, 'METAOFF', {}, { hashes: true });
const div = a.hashes.reduce((n, h, i) => n + (h !== b.hashes[i]), 0);
check(div === 0 && a.popSum === b.popSum, `METAOFF vs NOREV lockstep: ${div} divergent ticks of ${a.hashes.length}; popSum equal: ${a.popSum === b.popSum}`);
check(b.tel.l2Updates === 0 && b.tel.admissions === 0, 'METAOFF makes 0 L2 updates and 0 admissions');

// F3. Exogenous schedule (rule, codebook, patches, plant kinds) identical across arms despite different populations.
for (const arm of ['META', 'SHAM', 'FIXED_DECK', 'ORACLE_L2']) {
  const o = runOne(901, arm, {}, { exo: true });
  const d = a.exo.reduce((n, h, i) => n + (h !== o.exo[i]), 0);
  check(d === 0 && o.popSum !== a.popSum, `exogenous schedule ${arm} vs NOREV: ${d} differing ticks (populations differ: yes)`);
}

// F4. EVOR:E0 is exactly FIXED_U (same proposal stream, uniform alpha, no mutation).
{ const u = runOne(901, 'FIXED_U', {}, { hashes: true }), e = runOne(901, 'EVOR', { evorVariant: 'E0' }, { hashes: true });
  const d = u.hashes.reduce((n, h, i) => n + (h !== e.hashes[i]), 0);
  check(d === 0, `EVOR:E0 vs FIXED_U lockstep: ${d} divergent ticks`); }

// F5. Uniform alpha gives uniform proposals; concentrated alpha concentrates them.
{ const r = rng32(7), cnt = new Map(), al = Array(B).fill(1);
  for (let i = 0; i < 132000; i++) { const m = samplePair(al, new Set(), r, .02); cnt.set(m, (cnt.get(m) ?? 0) + 1); }
  const v = [...cnt.values()]; check(cnt.size === ALL_PAIRS.length && Math.max(...v) / Math.min(...v) < 1.15, `uniform proposals: ${cnt.size} pairs, max/min ${(Math.max(...v) / Math.min(...v)).toFixed(3)}`); }
{ const r = rng32(9), al = Array(B).fill(.05); al[0] = al[1] = 30; let hit = 0;
  for (let i = 0; i < 10000; i++) hit += samplePair(al, new Set(), r, .02) === 3; check(hit > 9000, `alpha on bits 0,1 -> pair 0b11 proposed ${hit}/10000`); }

// F6. Information-neutral SHAM: with the same concentrated alpha, per-draw weight permutation gives uniform pairs.
{ const r = rng32(11), rp = rng32(12), al = Array(B).fill(.05); al[0] = al[1] = al[2] = 30; const cnt = new Map();
  for (let i = 0; i < 132000; i++) { const m = samplePair(al, new Set(), r, .02, rp); cnt.set(m, (cnt.get(m) ?? 0) + 1); }
  const v = [...cnt.values()]; check(cnt.size === 66 && Math.max(...v) / Math.min(...v) < 1.2, `SHAM (neutral) proposals uniform under concentrated alpha: max/min ${(Math.max(...v) / Math.min(...v)).toFixed(3)}`); }

// F7. Oracle support: exhausted support returns -1; one remaining supported pair is always chosen.
{ const w = new WorldV(901, 'ORACLE_L2'), [al, fl] = w.proposal(w.flies[0]);
  const inS = ALL_PAIRS.filter(p => w.subset.includes(p.a) && w.subset.includes(p.b)).map(p => p.mask);
  check(inS.length === 6 && samplePair(al, new Set(inS), rng32(1), fl) === -1, 'ORACLE_L2 with all 6 S-pairs excluded returns -1');
  const ex = new Set(inS.slice(1)); let ok = true; const r = rng32(2);
  for (let i = 0; i < 500; i++) if (samplePair(al, ex, r, fl) !== inS[0]) ok = false;
  check(ok, 'ORACLE_L2 with one S-pair left always proposes it');
  let inside = true; const r3 = rng32(3);
  for (let i = 0; i < 2000; i++) { const m = samplePair(al, new Set(), r3, fl); if (!inS.includes(m)) inside = false; }
  check(inside, 'ORACLE_L2 proposes only pairs inside S'); }

// F8. Deck covers all 66 pairs in its first 66 draws when nothing is excluded.
{ const w = new WorldV(901, 'FIXED_DECK'), f = w.flies[0], seen = new Set();
  for (let i = 0; i < 66; i++) seen.add(w.drawCandidate(f, new Set()));
  check(seen.size === 66, `FIXED_DECK covers ${seen.size}/66 pairs in one pass`); }

// F9. Inheritance law, scripted.
const law = { META: 'alpha', SHAM: 'alpha', SHAM_PERM: 'alpha', EVOR: 'alpha', META_RESET: 'none', REUSE: 'cache', FIXED_U: 'none', FIXED_DECK: 'none' };
for (const [arm, what] of Object.entries(law)) {
  const w = new WorldV(901, arm, arm === 'EVOR' ? { evorVariant: 'E0' } : {});
  const p = w.flies[0]; p.alpha = p.alpha.map((_, i) => 1 + i); p.masks = [0, 3]; p.w = [1, 5]; p.maskAge = [0, 50]; p.cache = [3];
  const c = w.spawn(p, 0, 0, 25, 1);
  const alphaOk = what === 'alpha' ? c.alpha.every((x, i) => x === 1 + i) : c.alpha.every(x => x === 1);
  const cacheOk = what === 'cache' ? c.cache.length === 1 && c.cache[0] === 3 : c.cache.length === 0;
  check(alphaOk && cacheOk && c.masks.length === 1 && c.masks[0] === 0 && c.w[0] === 0 && c.buf.length === 0, `${arm}: child inherits ${what}; masks [0], weights 0, empty buffer`);
}

// F10. EVO-R mutation rates and kinds match the grid; SV founders carry 4 bits at 30.
for (const [v, g] of Object.entries(EVOR_GRID)) {
  const w = new WorldV(901, 'EVOR', { evorVariant: v }), p = w.flies[0]; let mut = 0; const n = 4000;
  for (let i = 0; i < n; i++) { const c = w.spawn(p, 0, 0, 25, 1); if (c.alpha.some((x, j) => x !== p.alpha[j])) mut++; w.flies.pop(); }
  const expect = g.pm * (g.kind === 'jump' ? .5 : 1) * (g.kind === 'jump' ? 1 : 1);
  const jumpNote = g.kind === 'jump' ? ' (jump to an unchanged value is invisible)' : '';
  check(Math.abs(mut / n - expect) < .04, `EVOR ${v}: visible mutation rate ${(mut / n).toFixed(3)} (expect ~${expect.toFixed(3)})${jumpNote}`);
}
{ const w = new WorldV(901, 'EVOR', { evorVariant: 'SV25' });
  const ok = w.flies.every(f => f.alpha.filter(x => x === 30).length === 4 && f.alpha.filter(x => x === 1).length === 8);
  const distinct = new Set(w.flies.map(f => f.alpha.join())).size;
  check(ok && distinct > 30, `EVOR SV25 founders: 4 bits at 30 each, ${distinct} distinct founder genotypes`); }

// F11. SHAM_PERM permutation is a bijection.
{ const f = new WorldV(901, 'SHAM_PERM').flies[0]; check([...f.shamPerm].sort((x, y) => x - y).every((x, i) => x === i), 'SHAM_PERM permutation is a bijection'); }

const h = createHash('sha256').update(src).digest('hex').slice(0, 12);
console.log(`\nl3v.mjs sha256 ${h}; ${fails ? fails + ' FAILED' : 'all fixtures passed'}`);
process.exit(fails ? 1 : 0);
