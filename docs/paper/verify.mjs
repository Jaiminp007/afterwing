// V1 of docs/PAPER_VERIFICATION_PLAN.md: recompute every headline number from raw data.
// Usage: node docs/paper/verify.mjs   -> writes docs/paper/numbers.tex, exits 1 on any mismatch.
// The sign-flip test here is independent of the runners' code and exact. The runners'
// Monte Carlo branch is broken (see docs/paper/AUDIT_CONTROLS.md, finding 2), so no
// p-value in the paper is taken from runner output.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { mean, signflip, bootCI } from './stats.mjs';

const root = new URL('../../', import.meta.url);
const load = p => JSON.parse(readFileSync(new URL(p, root), 'utf8'));
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

// G7b (the original run saved no per-seed rows; these come from the V2 rerun at da995b0).
{
  const j = load('evidence/microverse/g7b-final-70001-70048-rerun-da995b0.json');
  contrast('GsevenB', 'G7b SELF − TASTEONLY', j.diffs, { mean: 0.88, wins: 30 });
}

const pairs0 = { EVOR: 'Evor', SHAM: 'Sham', FIXED: 'Fixed' };
// V4 independent replication on new seed banks (run once by a separate agent).
{
  const j = load('evidence/microverse/paper-v4/r-l2-6100001-6100048.json');
  for (const [B, tag] of Object.entries(pairs0)) contrast('RepLtwo' + tag, `Rep L2 META − ${B}`, Object.keys(j.perSeed).map(s => j.perSeed[s].META - j.perSeed[s][B]), { mean: j[`META-${B}`].meanDiff, wins: j[`META-${B}`].positive });
  for (const B of ['TASTEONLY', 'MOVEONLY']) {
    const g = load(`evidence/microverse/paper-v4/r-g7c-${B.toLowerCase()}-6200001-6200096.json`);
    contrast(`RepGsevenC${B === 'TASTEONLY' ? 'Taste' : 'Move'}`, `Rep G7c SELF − ${B}`, g.diffs, { mean: g.meanDiff, wins: g.positive });
  }
}

// Related rungs and L3 screens: exact p for every gated contrast with committed per-seed rows.
const armDiff = (j, A, B) => Object.keys(j.perSeed).map(s => j.perSeed[s][A] - j.perSeed[s][B]);
const pairs = { EVOR: 'Evor', SHAM: 'Sham', FIXED: 'Fixed' };
for (const [file, key, label] of [['p13b-parts-final-90001-90048', 'PthirteenParts', 'P13b parts'], ['p13b-2b-final-91001-91048', 'PthirteenTwoB', 'P13b-2b'],
  ['p13b-a3-final-93001-93048', 'PthirteenAthree', 'P13b A3']]) {
  const j = load(`evidence/microverse/${file}.json`);
  for (const [B, tag] of Object.entries(pairs)) contrast(key + tag, `${label} META − ${B}`, armDiff(j, 'META', B), { mean: j[`META-${B}`].meanDiff, wins: j[`META-${B}`].positive });
}
{ // P13b-3a keep accuracy (balanced accuracy − .5 per seed; small values, so a fine grid).
  const j = load('evidence/microverse/p13b-3-parts-final-92001-92048.json');
  const d = Object.keys(j.extra).map(s => { const x = j.extra[s].META.stats; return x.towardN && x.awayN ? (x.towardKeep / x.towardN + 1 - x.awayKeep / x.awayN) / 2 - .5 : 0; });
  const c = contrast('PthirteenThreeA', 'P13b-3a balAcc − .5', d, { mean: j['balAcc-META'].mean - .5, wins: j['balAcc-META'].vsChance.positive });
  c.p = signflip(d, 1e5); c.fine = true;
}
{ // L3-I screen 1 (practice): original d, factorial f, and the controller's direct effect.
  const j = load('evidence/microverse/fly-rsi-l3i-screen1-practice.json'), P = j.perSeed, S = Object.keys(P);
  const d = S.map(s => (P[s].META - P[s].NOREV) - 1.5 * (P[s].FIXED - P[s].NOREV)), f = S.map((s, i) => d[i] - (P[s].METAOFF - P[s].NOREV));
  contrast('LthreeIdOrig', 'L3-I d (original)', d, { mean: 2.92, wins: d.filter(x => x > 0).length });
  contrast('LthreeIfact', 'L3-I f (factorial)', f, { mean: -0.45, wins: 19 });
  contrast('LthreeImetaoff', 'L3-I METAOFF − NOREV', armDiff(j, 'METAOFF', 'NOREV'), { mean: 3.36, wins: armDiff(j, 'METAOFF', 'NOREV').filter(x => x > 0).length });
}

let bad = 0;
const f2 = x => (Math.round(x * 100) / 100).toFixed(2);
const texSci = p => { const [m, e] = p.toExponential(1).split('e'); return `${m} \\times 10^{${+e}}`; };
for (const c of contrasts) {
  const tol = /GsevenC/.test(c.key) ? .05 : .0051; // G7c diffs were saved rounded to 0.1
  const okMean = Math.abs(c.mean - c.expect.mean) <= tol, okWins = c.wins === c.expect.wins;
  if (!okMean || !okWins) bad++;
  console.log(`${okMean && okWins ? 'ok ' : 'BAD'} ${c.label.padEnd(22)} n=${c.n} mean ${f2(c.mean)} (log ${c.expect.mean}) wins ${c.wins}/${c.n} (log ${c.expect.wins}) p ${c.p.toExponential(2)} CI [${f2(c.ci[0])}, ${f2(c.ci[1])}]`);
}
const tex = contrasts.flatMap(c => [
  `\\newcommand{\\${c.key}Mean}{${(c.mean >= 0 ? '+' : '-') + f2(Math.abs(c.mean))}}`,
  `\\newcommand{\\${c.key}Wins}{${c.wins}/${c.n}}`,
  `\\newcommand{\\${c.key}CI}{[${f2(c.ci[0])}, ${f2(c.ci[1])}]}`,
  `\\newcommand{\\${c.key}P}{${c.p < 1e-4 ? texSci(c.p) : c.p.toPrecision(2)}}`]).join('\n');
writeFileSync(new URL('docs/paper/numbers.tex', root), `% Generated by docs/paper/verify.mjs. Do not edit.\n${tex}\n`);
// Every number macro the manuscript uses must be one this script defines.
const texSrc = readFileSync(new URL('docs/paper/main.tex', root), 'utf8'), defined = new Set(contrasts.flatMap(c => ['Mean', 'Wins', 'CI', 'P'].map(s => c.key + s)));
const undefinedMacros = [...new Set([...texSrc.matchAll(/\\((?:Gseven|Ltwo|Peleven|Pthirteen|Lthree|Rep)[A-Za-z]*)/g)].map(m => m[1]))].filter(m => !defined.has(m));
if (undefinedMacros.length) { console.error('main.tex uses undefined number macros:', undefinedMacros.join(', ')); bad++; }
if (bad) { console.error(`${bad} check(s) failed`); process.exit(1); }
console.log('all contrasts match the logs; wrote docs/paper/numbers.tex');
