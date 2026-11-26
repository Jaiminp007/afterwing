// V1 of docs/PAPER_VERIFICATION_PLAN.md: recompute every headline number from raw data.
// Usage: node docs/paper/verify.mjs   -> writes docs/paper/numbers.tex, exits 1 on any mismatch.
// The sign-flip test here is independent of the runners' code and exact. The runners'
// Monte Carlo branch is broken (see docs/paper/AUDIT_CONTROLS.md, finding 2), so no
// p-value in the paper is taken from runner output.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const load = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;

function xorshift(seed) { let a = BigInt(seed) | 1n, b = 0x9E3779B97F4A7C15n; const M = (1n << 64n) - 1n;
  return () => { let s1 = a; const s0 = b; a = s0; s1 ^= (s1 << 23n) & M; b = s1 ^ s0 ^ (s1 >> 17n) ^ (s0 >> 26n); return Number(((b + s0) & M) >> 11n) / 2 ** 53; }; }

// Exact one-sided sign-flip p: P(sum of randomly signed d >= observed sum), all 2^n flips.
// Differences are put on a 0.01 grid and the null distribution of the signed sum is
// built by dynamic programming, so this is exact for the gridded data (no Monte Carlo).
export function signflip(d, grid = 100) {
  const v = d.map(x => Math.round(Math.abs(x) * grid)), obs = d.reduce((a, x, i) => a + Math.sign(x) * v[i], 0), S = v.reduce((a, b) => a + b, 0);
  let dist = new Float64Array(2 * S + 1); dist[S] = 1; // index = signed sum + S
  for (const k of v) { if (!k) continue; const next = new Float64Array(2 * S + 1);
    for (let i = 0; i <= 2 * S; i++) if (dist[i]) { next[i + k] += dist[i] / 2; next[i - k] += dist[i] / 2; } dist = next; }
  let p = 0; for (let i = obs + S; i <= 2 * S; i++) p += dist[i]; return p;
}

// Percentile bootstrap 95% CI of the mean over seeds.
export function bootCI(d, reps = 20000) {
  const r = xorshift(4242), n = d.length, ms = new Float64Array(reps);
  for (let k = 0; k < reps; k++) { let s = 0; for (let i = 0; i < n; i++) s += d[Math.floor(r() * n)]; ms[k] = s / n; }
  ms.sort(); return [ms[Math.floor(.025 * reps)], ms[Math.ceil(.975 * reps) - 1]];
}

// Self-checks of the test itself (the audit's counterexample, and a closed form).
{
  const six = [...Array(6).fill(1), ...Array(42).fill(0)];
  if (Math.abs(signflip(six) - 1 / 64) > 1e-12) throw new Error('signflip self-check failed (1/64)');
  if (Math.abs(signflip(Array(48).fill(1)) - 2 ** -48) > 1e-25) throw new Error('signflip self-check failed (2^-48)');
}

const contrasts = [];
function contrast(key, label, d, expect) {
  const c = { key, label, n: d.length, mean: mean(d), wins: d.filter(x => x > 0).length, p: signflip(d), ci: bootCI(d), expect };
  contrasts.push(c); return c;
}

// G7c (diffs saved at 0.1 precision by solo.mjs).
for (const B of ['TASTEONLY', 'MOVEONLY']) {
  const j = load(`evidence/microverse/g7c-final-94001-94096-vs-${B}.json`);
  contrast(`GsevenC${B === 'TASTEONLY' ? 'Taste' : 'Move'}`, `G7c SELF − ${B}`, j.diffs, { mean: j.meanDiff, wins: j.positive });
}

// Fly-RSI L2.
{
  const j = load('evidence/microverse/fly-rsi-l2-final-95001-95048.json'), seeds = Object.keys(j.perSeed);
  for (const B of ['EVOR', 'SHAM', 'FIXED']) contrast(`Ltwo${B[0] + B.slice(1).toLowerCase().replace('evor', 'Evor')}`, `L2 META − ${B}`,
    seeds.map(s => j.perSeed[s].META - j.perSeed[s][B]), { mean: j[`META-${B}`].meanDiff, wins: j[`META-${B}`].positive });
}

// P11b gate (per-seed data from the V2 reproduction).
if (existsSync(new URL('evidence/microverse/p11b-final-80001-80048.json', root))) {
  const j = load('evidence/microverse/p11b-final-80001-80048.json');
  contrast('PelevenB', 'P11b R* − R_P12', j.gate_RSTAR_vs_R_P12.diffs, { mean: 5.73, wins: 48 });
  contrast('PelevenBvsRzero', 'P11b R* − R0', j.reported_RSTAR_vs_R0.diffs, { mean: -0.54, wins: 21 });
} else console.warn('P11b per-seed data missing: run node microverse/p11b-gate.mjs');

let bad = 0;
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const texSci = p => { const [m, e] = p.toExponential(1).split('e'); return `${m} \\times 10^{${+e}}`; };
for (const c of contrasts) {
  const tol = c.key.startsWith('GsevenC') ? .05 : .0051; // G7c diffs were saved rounded to 0.1
  const okMean = Math.abs(c.mean - c.expect.mean) <= tol, okWins = c.wins === c.expect.wins;
  if (!okMean || !okWins) bad++;
  console.log(`${okMean && okWins ? 'ok ' : 'BAD'} ${c.label.padEnd(22)} n=${c.n} mean ${f2(c.mean)} (log ${c.expect.mean}) wins ${c.wins}/${c.n} (log ${c.expect.wins}) p ${c.p.toExponential(2)} CI [${f2(c.ci[0])}, ${f2(c.ci[1])}]`);
}
const tex = contrasts.flatMap(c => [
  `\\newcommand{\\${c.key}Mean}{${(c.mean >= 0 ? '+' : '-') + f2(Math.abs(c.mean))}}`,
  `\\newcommand{\\${c.key}Wins}{${c.wins}/${c.n}}`,
  `\\newcommand{\\${c.key}CI}{[${f2(c.ci[0])}, ${f2(c.ci[1])}]}`,
  `\\newcommand{\\${c.key}P}{${c.p < 1e-4 ? '= ' + texSci(c.p) : '= ' + c.p.toPrecision(2)}}`]).join('\n');
writeFileSync(new URL('docs/paper/numbers.tex', root), `% Generated by docs/paper/verify.mjs. Do not edit.\n${tex}\n`);
if (bad) { console.error(`${bad} contrast(s) disagree with the logs`); process.exit(1); }
console.log('all contrasts match the logs; wrote docs/paper/numbers.tex');
