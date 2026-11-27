// L4-A scorer (frozen with the registration).
//   node microverse/l4-score.mjs lock <stageA.json>                  -> locks META (L2_GRID) and EVOR3
//   node microverse/l4-score.mjs gates <stageB-or-C.json> <lock.json> -> applies every gate
// Endpoints are integer population sums P over the 100 late samples, so every contrast is an
// exact integer: margins in 1/100 fly, d4 = 2P_META3 - 3P_META + P_FIXED in 1/200 fly
// (d4 > 0 <=> META3 - FIXED > 1.5 (META - FIXED)).
// p-values: exact one-sided sign-flip (docs/paper/stats.mjs, grid 1 on integers).
import { readFileSync } from 'node:fs';
import { signflip, bootCI } from '../docs/paper/stats.mjs';
import { L2_GRID, EVOR3_GRID } from './l4.mjs';

const [mode, file, lockFile] = process.argv.slice(2);
const J = JSON.parse(readFileSync(file, 'utf8'));
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const fail = m => { console.error(`INVALID: ${m}`); process.exit(3); };
if (J.test !== 'L4-A') fail(`not an L4-A batch (${J.test})`);
if (J.dirty !== false) fail(`batch was produced from uncommitted code (dirty=${J.dirty})`);
if (new Set(J.seeds).size !== J.seeds.length) fail('duplicate seeds');
for (const s of J.seeds) for (const a of J.arms) { const r = J.rows[s]?.[a]; if (!r || !Number.isInteger(r.popSum) || r.seed !== s) fail(`missing/invalid row ${s} ${a}`); }
const P = a => J.seeds.map(s => J.rows[s][a].popSum);

if (mode === 'lock') {
  const pick = (prefix, keys) => {
    const labels = J.arms.filter(a => a.startsWith(prefix));
    for (const k of keys) if (!labels.includes(prefix + k)) fail(`stage A lacks ${prefix}${k}`);
    return labels.map(l => ({ l, m: mean(P(l)) })).sort((x, y) => y.m - x.m || keys.indexOf(x.l.slice(prefix.length)) - keys.indexOf(y.l.slice(prefix.length)));
  };
  const meta = pick('META:', Object.keys(L2_GRID)), evor = pick('EVOR3:', Object.keys(EVOR3_GRID));
  const lock = { stage: 'A', test: 'L4-A', seeds: J.seeds, commit: J.commit, meta: meta[0].l, evor: evor[0].l,
    means: Object.fromEntries([...meta, ...evor].map(x => [x.l, x.m / 100])) };
  console.log(JSON.stringify(lock, null, 1));
  process.exit(0);
}

if (mode !== 'gates') fail('mode must be lock or gates');
const lock = JSON.parse(readFileSync(lockFile, 'utf8'));
if (lock.test !== 'L4-A') fail('lock is not an L4-A lock');
const M = lock.meta, E = lock.evor;
for (const s of J.seeds) if (lock.seeds.includes(s)) fail(`seed ${s} was used in stage A`);
for (const a of ['NOREV', 'FIXED', M, 'META3', 'META3OFF', 'SHAM3', E]) if (!J.arms.includes(a)) fail(`arm ${a} missing`);
const n = J.seeds.length;
const sub = (x, y) => x.map((v, i) => v - y[i]);
const [p3, pM, pF, pN, pO, pS, pE] = ['META3', M, 'FIXED', 'NOREV', 'META3OFF', 'SHAM3', E].map(P);
const offMismatch = J.seeds.filter((s, i) => pO[i] !== pF[i]);
if (offMismatch.length) fail(`META3OFF != FIXED on seeds ${offMismatch.join(',')} (implementation error, not a result)`);
const binomP = (k, n) => { let p = 0; const lc = (n, k) => { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }; for (let j = k; j <= n; j++) p += Math.exp(lc(n, j) - n * Math.LN2); return p; };
const row = (name, ints, unit, bar, barKind) => {
  const m = mean(ints) / unit, p = signflip(ints, 1), wins = ints.filter(x => x > 0).length;
  const meanOk = barKind === 'ge' ? m >= bar : m > bar;
  return { name, mean: +m.toFixed(4), ci95: bootCI(ints.map(x => x / unit)).map(x => +x.toFixed(3)), wins: `${wins}/${n}`, p, bar: `${barKind === 'ge' ? '>=' : '>'} ${bar}, p < .01`, pass: meanOk && p < .01 };
};
const d4 = J.seeds.map((_, i) => 2 * p3[i] - 3 * pM[i] + pF[i]);
const f4 = J.seeds.map((_, i) => 2 * (p3[i] - pO[i]) - 3 * (pM[i] - pF[i]));
const fWins = f4.filter(x => x > 0).length;
const gates = [
  row(`META3 - META (${M})`, sub(p3, pM), 100, 1.0, 'ge'),
  row('META3 - SHAM3', sub(p3, pS), 100, 1.0, 'ge'),
  row(`META3 - EVO-R3 (${E})`, sub(p3, pE), 100, 1.0, 'ge'),
  row('d4 = (META3-FIXED) - 1.5(META-FIXED)', d4, 200, 0, 'gt'),
  { ...row('f4 = 2(P11-P01) - 3(P10-P00)', f4, 200, 0, 'gt'), signP: binomP(fWins, n), signBar: '>= 33/48' },
  row(`META (${M}) - FIXED`, sub(pM, pF), 100, 0, 'gt'),
  row('FIXED - NOREV', sub(pF, pN), 100, 0, 'gt'),
];
const fg = gates[4]; fg.pass = fg.pass && fWins >= Math.ceil(33 * n / 48);
const ratio = mean(sub(p3, pF)) / mean(sub(pM, pF));
const sk = a => J.seeds.map(s => J.rows[s][a].skill);
const skRatio = mean(sub(sk('META3'), sk('FIXED'))) / mean(sub(sk(M), sk('FIXED')));
const desc = {};
for (const a of J.arms) desc[a] = { pop: +(mean(P(a)) / 100).toFixed(3), skill: +mean(sk(a)).toFixed(4),
  extinct: J.seeds.filter(s => J.rows[s][a].extinct), alphaShareOnS: +mean(J.seeds.map(s => J.rows[s][a].alphaShareOnS)).toFixed(3),
  gShareInModules: +mean(J.seeds.map(s => J.rows[s][a].gShareInModules)).toFixed(3),
  correctPerEvBite: +mean(J.seeds.map(s => J.rows[s][a].correctPerEvBite)).toFixed(5) };
const extra = {};
for (const a of ['META3_RESET', 'ORACLE3', 'META:L3V', 'FIXED_U']) if (J.arms.includes(a) && a !== M) extra[`META3 - ${a}`] = row(`META3 - ${a}`, sub(p3, P(a)), 100, 0, 'gt');
if (J.arms.includes('ORACLE3')) { const o = P('ORACLE3'); extra['d4 oracle headroom'] = row('d4O', J.seeds.map((_, i) => 2 * o[i] - 3 * pM[i] + pF[i]), 200, 0, 'gt'); }
if (J.arms.includes('META:L3V') && M !== 'META:L3V') { const l = P('META:L3V'); extra['d4 vs frozen L3-V META'] = row('d4 vs META:L3V', J.seeds.map((_, i) => 2 * p3[i] - 3 * l[i] + pF[i]), 200, 0, 'gt'); }
console.log(JSON.stringify({ file, commit: J.commit, n, lock, ratio: +ratio.toFixed(3), skillRatio: +skRatio.toFixed(3), allGatesPass: gates.every(g => g.pass), gates, descriptive: { arms: desc, contrasts: extra } }, null, 1));
