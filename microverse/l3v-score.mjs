// L3-V scorer (frozen with the registration).
//   node microverse/l3v-score.mjs lock <stageA.json>                 -> locks FIXED and EVO-R
//   node microverse/l3v-score.mjs gates <stageB-or-C.json> <lock.json> -> applies every gate
// Endpoints are integer population sums P over the 100 late samples, so every contrast is
// an exact integer: L2 margins in 1/100 fly, d = 2P_META - 3P_FIXED + P_NOREV in 1/200 fly.
// p-values: exact one-sided sign-flip (docs/paper/stats.mjs, grid 1 on integers).
import { readFileSync } from 'node:fs';
import { signflip, bootCI } from '../docs/paper/stats.mjs';
import { EVOR_GRID } from './l3v.mjs';

const [mode, file, lockFile] = process.argv.slice(2);
const J = JSON.parse(readFileSync(file, 'utf8'));
const mean = a => a.reduce((s, x) => s + x, 0) / a.length;
const fail = m => { console.error(`INVALID: ${m}`); process.exit(3); };
if (J.dirty !== false) fail(`batch was produced from uncommitted code (dirty=${J.dirty})`);
for (const s of J.seeds) for (const a of J.arms) { const r = J.rows[s]?.[a]; if (!r || !Number.isInteger(r.popSum) || r.seed !== s) fail(`missing/invalid row ${s} ${a}`); }
if (new Set(J.seeds).size !== J.seeds.length) fail('duplicate seeds');
const P = a => J.seeds.map(s => J.rows[s][a].popSum);

if (mode === 'lock') {
  const pick = (labels, order) => labels.map(l => ({ l, m: mean(P(l)) })).sort((x, y) => y.m - x.m || order(x.l) - order(y.l));
  const fixed = pick(J.arms.filter(a => a.startsWith('FIXED')), l => l === 'FIXED_U' ? 0 : 1);
  const kindRank = { undefined: 0, logn: 1, jump: 2, swap: 3 };
  const evor = pick(J.arms.filter(a => a.startsWith('EVOR:')), l => { const g = EVOR_GRID[l.split(':')[1]]; return g.pm * 10 + kindRank[g.kind]; });
  const lock = { stage: 'A', seeds: J.seeds, commit: J.commit, fixed: fixed[0].l, evor: evor[0].l,
    means: Object.fromEntries([...fixed, ...evor].map(x => [x.l, x.m / 100])) };
  console.log(JSON.stringify(lock, null, 1));
  process.exit(0);
}

if (mode !== 'gates') fail('mode must be lock or gates');
const lock = JSON.parse(readFileSync(lockFile, 'utf8'));
const F = lock.fixed, E = lock.evor;
for (const a of ['NOREV', 'METAOFF', 'META', 'SHAM', F, E]) if (!J.arms.includes(a)) fail(`arm ${a} missing`);
const n = J.seeds.length;
const sub = (x, y) => x.map((v, i) => v - y[i]);
const [pM, pF, pN, pO, pS, pE] = ['META', F, 'NOREV', 'METAOFF', 'SHAM', E].map(P);
const offMismatch = J.seeds.filter((s, i) => pO[i] !== pN[i]);
if (offMismatch.length) fail(`METAOFF != NOREV on seeds ${offMismatch.join(',')} (implementation error, not a result)`);
const binomP = (k, n) => { let p = 0; const lc = (n, k) => { let s = 0; for (let i = 1; i <= k; i++) s += Math.log(n - k + i) - Math.log(i); return s; }; for (let j = k; j <= n; j++) p += Math.exp(lc(n, j) - n * Math.LN2); return p; };
const row = (name, ints, unit, bar, barKind) => {
  const m = mean(ints) / unit, p = signflip(ints, 1), wins = ints.filter(x => x > 0).length;
  const meanOk = barKind === 'ge' ? m >= bar : m > bar;
  return { name, mean: +m.toFixed(4), ci95: bootCI(ints.map(x => x / unit)).map(x => +x.toFixed(3)), wins: `${wins}/${n}`, p, bar: `${barKind === 'ge' ? '>=' : '>'} ${bar}, p < .01`, pass: meanOk && p < .01 };
};
const d200 = J.seeds.map((_, i) => 2 * pM[i] - 3 * pF[i] + pN[i]);
const f200 = d200.map((v, i) => v - 2 * (pO[i] - pN[i]));
const fWins = f200.filter(x => x > 0).length;
const gates = [
  row('META - EVO-R', sub(pM, pE), 100, 1.0, 'ge'),
  row('META - SHAM', sub(pM, pS), 100, 1.0, 'ge'),
  row(`META - FIXED (${F})`, sub(pM, pF), 100, 1.0, 'ge'),
  row('d = (META-NOREV) - 1.5(FIXED-NOREV)', d200, 200, 0, 'gt'),
  { ...row('f = d - (METAOFF-NOREV)', f200, 200, 0, 'gt'), signP: binomP(fWins, n), signBar: '>= 33/48' },
  row('FIXED - NOREV', sub(pF, pN), 100, 0, 'gt'),
];
const fg = gates[4]; fg.pass = fg.pass && fWins >= Math.ceil(33 * n / 48);
const ratio = mean(sub(pM, pN)) / mean(sub(pF, pN));
const desc = {};
for (const a of J.arms) desc[a] = { pop: +(mean(P(a)) / 100).toFixed(3), skill: +mean(J.seeds.map(s => J.rows[s][a].skill)).toFixed(4),
  extinct: J.seeds.filter(s => J.rows[s][a].extinct), alphaShareOnS: +mean(J.seeds.map(s => J.rows[s][a].alphaShareOnS)).toFixed(3),
  correctPerEvBite: +mean(J.seeds.map(s => J.rows[s][a].correctPerEvBite)).toFixed(5) };
const extra = {};
for (const a of ['REUSE', 'META_RESET', 'SHAM_PERM', 'ORACLE_L2']) if (J.arms.includes(a)) extra[`META - ${a}`] = row(`META - ${a}`, sub(pM, P(a)), 100, 0, 'gt');
if (J.arms.includes('ORACLE_L2')) { const o = P('ORACLE_L2'); extra['dO (oracle headroom)'] = row('dO', J.seeds.map((_, i) => 2 * o[i] - 3 * pF[i] + pN[i]), 200, 0, 'gt'); }
const sk = a => J.seeds.map(s => J.rows[s][a].skill);
const skRatio = mean(sub(sk('META'), sk('NOREV'))) / mean(sub(sk(F), sk('NOREV')));
console.log(JSON.stringify({ file, commit: J.commit, n, lock, ratio: +ratio.toFixed(3), skillRatio: +skRatio.toFixed(3), allGatesPass: gates.every(g => g.pass), gates, descriptive: { arms: desc, contrasts: extra } }, null, 1));
