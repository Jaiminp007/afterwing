// L4-H scorer. Stage A runs on tuning seeds in three steps; each lock picks the best arithmetic
// mean popSum, ties broken by arm name (deterministic).
//   armsA1 <out.json> [extraModule...]        all depth-1 and depth-2 members
//   lock1  <A1.ndjson> <lock1.json>           FIXED = best depth 1; L2A = best depth 2
//   armsA2 <lock1.json> <out.json>            flat static-rate sweep of L2A over META3's reachable range
//   lock2  <A2.ndjson> <lock1.json> <lock2.json>   L2BEST = best static (offset 0 included)
//   armsA3 <lock2.json> <out.json>            META3 grid and EVOR grid around L2BEST
//   lock3  <A3.ndjson> <lock2.json> <lock.json>    META3, EVOR hyperparameters
//   arms   <lock.json> <out.json>             gate arm set (stage B / final)
//   gate   <batch.ndjson> <lock.json> <seedSpec>
import fs from 'node:fs';
import { signflip, bootCI, mean } from '../docs/paper/stats.mjs';
import * as A from './l4h-arms.mjs';

const [mode, ...rest] = process.argv.slice(2);
const readJ = f => JSON.parse(fs.readFileSync(f, 'utf8'));
const writeJ = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 1));
const MANDATORY = ['microverse/l4h.mjs', 'microverse/l4h-arms.mjs', 'microverse/l4h-run.mjs', 'microverse/l4h-score.mjs', 'docs/paper/stats.mjs'];

function load(file, armsFile) {
  const lines = fs.readFileSync(file, 'utf8').trim().split('\n').map(l => JSON.parse(l));
  const h = lines[0]; if (!h.header) throw new Error('no header in ' + file);
  for (const k of MANDATORY) if (!h.sha[k]) throw new Error('header lacks hash of ' + k);
  const rows = lines.slice(1);
  const spec = armsFile ? readJ(armsFile) : null;
  const names = h.armNames, seen = new Set();
  if (spec && JSON.stringify(spec.arms.map(a => a.name)) !== JSON.stringify(names)) throw new Error('arm set differs from spec');
  for (const r of rows) {
    const key = r.armName + '|' + r.seed;
    if (seen.has(key)) throw new Error('duplicate row ' + key);
    seen.add(key);
    if (!Number.isInteger(r.popSum) || !(r.nLate > 0)) throw new Error('bad row ' + key);
    if (spec && JSON.stringify(spec.arms.find(a => a.name === r.armName)) !== JSON.stringify(r.arm)) throw new Error('row config differs from spec ' + key);
  }
  for (const s of h.seeds) for (const n of names) if (!seen.has(n + '|' + s)) throw new Error('missing row ' + n + '|' + s);
  if (seen.size !== h.seeds.length * names.length) throw new Error('row count mismatch');
  const nLate = rows[0].nLate; if (rows.some(r => r.nLate !== nLate)) throw new Error('nLate differs');
  return { h, rows, nLate };
}
const byArm = rows => { const m = new Map(); for (const r of rows) { if (!m.has(r.armName)) m.set(r.armName, new Map()); m.get(r.armName).set(r.seed, r); } return m; };
function best(rows, pred) {
  const m = byArm(rows.filter(r => pred(r.arm)));
  let top = null;
  for (const [name, s] of [...m].sort((a, b) => a[0] < b[0] ? -1 : 1)) { const v = mean([...s.values()].map(r => r.popSum)); if (!top || v > top.v) top = { name, v, arm: [...s.values()][0].arm }; }
  if (!top) throw new Error('no candidates');
  return top;
}
const isD1 = a => a.kind === 'lms' || a.kind === 'kalRW';

if (mode === 'armsA1') {
  const [out, ...extra] = rest;
  let arms = [...A.DEPTH1, ...A.DEPTH2];
  for (const e of extra) { const mod = await import(new URL('../' + e, import.meta.url)); mod.register?.(A); arms = arms.concat(mod.DEPTH2_EXTRA ?? []); }
  writeJ(out, { arms, extraModules: extra }); console.log(arms.length + ' arms');
} else if (mode === 'lock1') {
  const [file, out] = rest, { h, rows } = load(file, null);
  const spec = readJ(new URL('../' + h.arms, import.meta.url));
  const d1 = best(rows, isD1), d2 = best(rows, a => !isD1(a));
  writeJ(out, { stage: 'A1', source: file, head: h.head, sha: h.sha, seedSpec: h.seedSpec, extraModules: spec.extraModules ?? [], FIXED: d1.arm, L2A: d2.arm, means: { FIXED: d1.v, L2A: d2.v } });
  console.log(d1.name, d1.v, '|', d2.name, d2.v);
} else if (mode === 'armsA2') {
  const [lfile, out] = rest, L = readJ(lfile);
  const arms = A.STATIC_OFFSETS.map(o => ({ kind: 'static', name: `STATIC_${o}`, base: L.L2A, offset: o }));
  writeJ(out, { arms, extraModules: L.extraModules }); console.log(arms.length + ' arms');
} else if (mode === 'lock2') {
  const [file, l1file, out] = rest, { h, rows } = load(file, null), L = readJ(l1file);
  const s = best(rows, () => true);
  // L2BEST is a base config with its rate parameter re-centered: META3 wraps a 'static' base.
  writeJ(out, { ...L, stage: 'A2', source2: file, L2BEST: s.arm, means2: { L2BEST: s.v } }); console.log(s.name, s.v);
} else if (mode === 'armsA3') {
  const [lfile, out] = rest, L = readJ(lfile);
  const arms = [...A.L3GRID.map((g, i) => ({ ...A.meta3(L.L2BEST, g), name: `META3_g${i}` })),
    ...A.EVOGRID.map((e, i) => ({ kind: 'l3', l3: 'evo', name: `EVOR_g${i}`, base: L.L2BEST, ...e }))];
  writeJ(out, { arms, extraModules: L.extraModules }); console.log(arms.length + ' arms');
} else if (mode === 'lock3') {
  const [file, l2file, out] = rest, { h, rows } = load(file, null), L = readJ(l2file);
  const m3 = best(rows, a => a.l3 === 'learn'), ev = best(rows, a => a.l3 === 'evo');
  writeJ(out, { ...L, stage: 'A3', source3: file, head3: h.head, sha3: h.sha, META3: m3.arm, EVOR: ev.arm, means3: { META3: m3.v, EVOR: ev.v } });
  console.log(m3.name, m3.v, '|', ev.name, ev.v);
} else if (mode === 'arms') {
  const [lfile, out] = rest, L = readJ(lfile);
  const { n, c, eta, span } = L.META3;
  const arms = [{ ...L.FIXED, name: 'FIXED' }, { ...L.L2BEST, name: 'L2BEST' }, { ...L.META3, name: 'META3' },
    ...A.controls(L.L2BEST, { n, c, eta, span }, (({ kind, l3, name, base, ...e }) => e)(L.EVOR))];
  writeJ(out, { arms, extraModules: L.extraModules }); console.log(arms.map(a => a.name).join(' '));
} else if (mode === 'gate') {
  const [file, lfile, seedSpec] = rest, L = readJ(lfile);
  const { h, rows, nLate } = load(file, null);
  for (const k of MANDATORY) if (h.sha[k] !== L.sha3[k]) throw new Error(`code changed since lock: ${k}`);
  if (h.seedSpec !== seedSpec) throw new Error(`seed spec ${h.seedSpec} != registered ${seedSpec}`);
  const m = byArm(rows), seeds = h.seeds;
  const P = name => seeds.map(s => m.get(name).get(s).popSum);
  const F = P('FIXED'), L2 = P('L2BEST'), M3 = P('META3');
  const fl = x => (x / nLate).toFixed(2);
  const report = (label, d) => { const p = signflip(d, 1), w = d.filter(x => x > 0).length, ci = bootCI(d.map(x => x / nLate));
    const ok = p < .01 && mean(d) > 0;
    console.log(`${label.padEnd(28)} ${fl(mean(d)).padStart(7)} flies  CI [${ci[0].toFixed(2)}, ${ci[1].toFixed(2)}]  ${w}/${d.length}  p ${p.toExponential(2)}  ${ok ? 'PASS' : 'FAIL'}`); return ok; };
  console.log(`n seeds ${seeds.length}; FIXED ${fl(mean(F))}  L2BEST ${fl(mean(L2))}  META3 ${fl(mean(M3))}`);
  for (const n of ['SHAM_NOWRITE', 'SHAM_RANDSIGN', 'RESET', 'EVOR']) console.log(`  ${n.padEnd(14)} ${fl(mean(P(n)))}`);
  const den = mean(L2) - mean(F);
  console.log(`L2 gain ${fl(den)} flies; ratio ${den > 0 ? ((mean(M3) - mean(F)) / den).toFixed(2) + 'x' : 'undefined (L2 gain <= 0)'} (needs >= 1.5)`);
  const diff = (a, b) => seeds.map((_, i) => a[i] - b[i]);
  const ok = [den > 0, report('d4 = 2M3 - 3L2 + F', seeds.map((_, i) => 2 * M3[i] - 3 * L2[i] + F[i])),
    report('META3 - L2BEST', diff(M3, L2)),
    ...['SHAM_NOWRITE', 'SHAM_RANDSIGN', 'EVOR'].map(n => report('META3 - ' + n, diff(M3, P(n))))];
  console.log('descriptive:');
  report('SHAM_NOWRITE - L2BEST', diff(P('SHAM_NOWRITE'), L2)); report('SHAM_RANDSIGN - SHAM_NOWRITE', diff(P('SHAM_RANDSIGN'), P('SHAM_NOWRITE')));
  report('SHAM_RANDSIGN - L2BEST', diff(P('SHAM_RANDSIGN'), L2)); report('META3 - RESET', diff(M3, P('RESET')));
  console.log(ok.every(Boolean) ? 'GATE PASS' : 'GATE FAIL');
} else { console.error('mode?'); process.exit(2); }
