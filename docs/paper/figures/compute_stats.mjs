#!/usr/bin/env node
// Deterministic bootstrap CI and scorer-v2 verification over committed evidence/microverse/*.json.
// Reads committed JSON only; runs zero simulations and touches zero seed banks.
// Output: docs/paper/figures/stats_summary.json and a concise stdout report.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = resolve(__dirname, '../../..');
const EV = name => JSON.parse(readFileSync(resolve(REPO, 'evidence/microverse', name), 'utf8'));

// Deterministic 32-bit xorshift PRNG for bootstrap resampling (B = 20,000, seed = 20261125).
function makeRng(seed) {
  let s = (seed >>> 0) || 1;
  return () => {
    s ^= s << 13; s >>>= 0;
    s ^= s >>> 17;
    s ^= s << 5; s >>>= 0;
    return s / 4294967296;
  };
}

function mean(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function sd(arr) {
  const m = mean(arr);
  if (arr.length < 2) return 0;
  return Math.sqrt(arr.reduce((a, x) => a + (x - m) ** 2, 0) / (arr.length - 1));
}

function quantile(sorted, q) {
  const idx = q * (sorted.length - 1);
  const lo = Math.floor(idx), hi = Math.ceil(idx);
  return lo === hi ? sorted[lo] : sorted[lo] + (idx - lo) * (sorted[hi] - sorted[lo]);
}

function bootstrapCI(arr, B = 20000, seed = 20261125) {
  const n = arr.length;
  const r = makeRng(seed);
  const boots = new Float64Array(B);
  for (let b = 0; b < B; b++) {
    let sum = 0;
    for (let i = 0; i < n; i++) sum += arr[Math.floor(r() * n)];
    boots[b] = sum / n;
  }
  boots.sort();
  return {
    lo: quantile(boots, 0.025),
    hi: quantile(boots, 0.975),
    B,
    seed,
  };
}

// Scorer v2 from microverse/l3i.mjs: exact for n <= 16, else 200,000 MC draws with Math.imul LCG.
function signflipV2(d, draws = 200000) {
  const n = d.length;
  const obs = mean(d);
  let ge = 0;
  if (n <= 16) {
    for (let m = 0; m < (1 << n); m++) {
      let t = 0;
      for (let i = 0; i < n; i++) t += ((m >> i) & 1 ? -1 : 1) * d[i];
      if (t / n >= obs - 1e-12) ge++;
    }
    return { p: ge / (2 ** n), exact: true, draws: 2 ** n };
  }
  let r = 7;
  for (let k = 0; k < draws; k++) {
    let t = 0;
    for (let i = 0; i < n; i++) {
      r = (Math.imul(r, 1103515245) + 12345) >>> 0;
      t += ((r >>> 16) & 1 ? -1 : 1) * d[i];
    }
    if (t / n >= obs - 1e-12) ge++;
  }
  return { p: (ge + 1) / (draws + 1), exact: false, draws };
}

// Exact one-sided binomial sign test P(X >= wins | n, 0.5); zeros count as non-wins.
function signTestExact(d) {
  const n = d.length;
  const wins = d.filter(x => x > 0).length;
  const zeros = d.filter(x => x === 0).length;
  const losses = d.filter(x => x < 0).length;
  let num = 0, c = 1;
  for (let j = 0; j <= n; j++) {
    if (j >= wins) num += c;
    c = c * (n - j) / (j + 1);
  }
  return { wins, losses, zeros, n, p: num / (2 ** n) };
}

function summarize(diffs, { bootSeed = 20261125, reported = null } = {}) {
  const sorted = [...diffs].sort((a, b) => a - b);
  const m = mean(diffs);
  const s = sd(diffs);
  const ci = bootstrapCI(diffs, 20000, bootSeed);
  const sf = signflipV2(diffs);
  const st = signTestExact(diffs);
  const maxAbs = Math.max(...diffs.map(Math.abs));
  return {
    n: diffs.length,
    mean: m,
    sd: s,
    sem: s / Math.sqrt(diffs.length),
    median: quantile(sorted, 0.5),
    q25: quantile(sorted, 0.25),
    q75: quantile(sorted, 0.75),
    min: sorted[0],
    max: sorted[sorted.length - 1],
    maxContribToMean: sorted[sorted.length - 1] / diffs.length,
    minContribToMean: sorted[0] / diffs.length,
    ci95: [ci.lo, ci.hi],
    wins: st.wins,
    losses: st.losses,
    zeros: st.zeros,
    signTestP: st.p,
    signFlipV2P: sf.p,
    signFlipExact: sf.exact,
    ...(reported ? { reported } : {}),
  };
}

function seedsOf(obj) {
  return Object.keys(obj).map(Number).sort((a, b) => a - b);
}

const out = {
  generatedBy: 'docs/paper/figures/compute_stats.mjs',
  bootstrap: { method: 'percentile', resamples: 20000, baseSeed: 20261125 },
  scorerV2: { exactUpTo: 16, mcDraws: 200000, lcg: 'Math.imul(r, 1103515245) + 12345', pFormula: '(ge+1)/(draws+1)' },
  datasets: {},
};

// 1. G7c finals (n=96; diffs in JSON are rounded to 0.1 by solo.mjs)
{
  const vt = EV('g7c-final-94001-94096-vs-TASTEONLY.json');
  const vm = EV('g7c-final-94001-94096-vs-MOVEONLY.json');
  out.datasets.g7c = {
    sourceFiles: [
      'evidence/microverse/g7c-final-94001-94096-vs-TASTEONLY.json',
      'evidence/microverse/g7c-final-94001-94096-vs-MOVEONLY.json',
    ],
    note: 'solo.mjs rounds stored per-seed diffs to 1 decimal place (+x.toFixed(1)); recorded meanDiff/positive/p in JSON were computed on unrounded values.',
    vsTASTEONLY: {
      meanA: vt.meanA,
      meanB: vt.meanB,
      relPct: (vt.meanDiff / vt.meanB) * 100,
      ...summarize(vt.diffs, { bootSeed: 20261125 + 1, reported: { meanDiff: vt.meanDiff, positive: vt.positive, p: vt.p } }),
    },
    vsMOVEONLY: {
      meanA: vm.meanA,
      meanB: vm.meanB,
      relPct: (vm.meanDiff / vm.meanB) * 100,
      ...summarize(vm.diffs, { bootSeed: 20261125 + 2, reported: { meanDiff: vm.meanDiff, positive: vm.positive, p: vm.p } }),
    },
  };
}

// 2. Fly-RSI L2 final (seeds 95001-95048, n=48, exact 2-decimal perSeed values)
{
  const j = EV('fly-rsi-l2-final-95001-95048.json');
  const ss = seedsOf(j.perSeed);
  const pair = (a, b, sOff) => summarize(ss.map(s => j.perSeed[s][a] - j.perSeed[s][b]), {
    bootSeed: 20261125 + sOff,
    reported: j[`${a}-${b}`],
  });
  const mMeta = mean(ss.map(s => j.perSeed[s].META));
  const mSham = mean(ss.map(s => j.perSeed[s].SHAM));
  const mEvor = mean(ss.map(s => j.perSeed[s].EVOR));
  const mFixed = mean(ss.map(s => j.perSeed[s].FIXED));
  out.datasets.flyRsiL2 = {
    sourceFile: 'evidence/microverse/fly-rsi-l2-final-95001-95048.json',
    meansExact: { META: mMeta, SHAM: mSham, EVOR: mEvor, FIXED: mFixed },
    meansReported: j.means,
    relPctVsEVOR: ((mMeta - mEvor) / mEvor) * 100,
    relPctVsSHAM: ((mMeta - mSham) / mSham) * 100,
    relPctVsFIXED: ((mMeta - mFixed) / mFixed) * 100,
    'META-EVOR': pair('META', 'EVOR', 10),
    'META-SHAM': pair('META', 'SHAM', 11),
    'META-FIXED': pair('META', 'FIXED', 12),
  };
}

// 3. P13b parts final (90001-90048)
{
  const j = EV('p13b-parts-final-90001-90048.json');
  const ss = seedsOf(j.perSeed);
  const pair = (a, b, sOff) => summarize(ss.map(s => j.perSeed[s][a] - j.perSeed[s][b]), {
    bootSeed: 20261125 + sOff,
    reported: j[`${a}-${b}`],
  });
  out.datasets.p13bParts = {
    sourceFile: 'evidence/microverse/p13b-parts-final-90001-90048.json',
    meansReported: j.means,
    'META-FIXED': pair('META', 'FIXED', 20),
    'META-EVOR': pair('META', 'EVOR', 21),
    'META-SHAM': pair('META', 'SHAM', 22),
  };
}

// 4. P13b-2b final (91001-91048)
{
  const j = EV('p13b-2b-final-91001-91048.json');
  const ss = seedsOf(j.perSeed);
  const pair = (a, b, sOff) => summarize(ss.map(s => j.perSeed[s][a] - j.perSeed[s][b]), {
    bootSeed: 20261125 + sOff,
    reported: j[`${a}-${b}`],
  });
  out.datasets.p13b2b = {
    sourceFile: 'evidence/microverse/p13b-2b-final-91001-91048.json',
    meansReported: j.means,
    'META-EVOR': pair('META', 'EVOR', 30),
    'META-SHAM': pair('META', 'SHAM', 31),
    'META-FIXED': pair('META', 'FIXED', 32),
  };
}

// 5. P13b-3 headroom practice (48 practice seeds)
{
  const j = EV('p13b-3-headroom-practice.json');
  const ss = seedsOf(j.perSeed);
  const pair = (a, b, sOff) => summarize(ss.map(s => j.perSeed[s][a] - j.perSeed[s][b]), {
    bootSeed: 20261125 + sOff,
    reported: j[`${a}-${b}`],
  });
  out.datasets.p13b3Headroom = {
    sourceFile: 'evidence/microverse/p13b-3-headroom-practice.json',
    meansReported: j.means,
    'META-SHAM': pair('META', 'SHAM', 35),
    'ORACLE-SHAM': pair('ORACLE', 'SHAM', 36),
  };
}

// 6. P13b-3 parts final (92001-92048)
{
  const j = EV('p13b-3-parts-final-92001-92048.json');
  const ss = seedsOf(j.perSeed);
  const pair = (a, b, sOff) => summarize(ss.map(s => j.perSeed[s][a] - j.perSeed[s][b]), {
    bootSeed: 20261125 + sOff,
    reported: j[`${a}-${b}`],
  });
  const bal = (s, a) => {
    const x = j.extra[s][a].stats;
    return x.towardN && x.awayN ? (x.towardKeep / x.towardN + 1 - x.awayKeep / x.awayN) / 2 : 0.5;
  };
  const balMeta = ss.map(s => bal(s, 'META'));
  const balSham = ss.map(s => bal(s, 'SHAM'));
  const distDiff = ss.map(s => j.extra[s].SHAM.dist - j.extra[s].META.dist);
  // Independent 500k xorshift32 cross-check on P13b-3a (verifies float-LCG underestimation in p13parts.mjs)
  const balDiff = balMeta.map(x => x - 0.5);
  const balObs = mean(balDiff);
  const xr = makeRng(123456789);
  let xGe = 0;
  const xN = 500000;
  for (let k = 0; k < xN; k++) {
    let t = 0;
    for (let i = 0; i < balDiff.length; i++) t += (xr() < 0.5 ? -1 : 1) * balDiff[i];
    if (t / balDiff.length >= balObs - 1e-12) xGe++;
  }
  out.datasets.p13b3Parts = {
    sourceFile: 'evidence/microverse/p13b-3-parts-final-92001-92048.json',
    meansReported: j.means,
    'META-FIXED': pair('META', 'FIXED', 40),
    'META-EVOR': pair('META', 'EVOR', 41),
    'META-SHAM': pair('META', 'SHAM', 42),
    balAccMETA: summarize(balMeta, { bootSeed: 20261125 + 43 }),
    balAccMETA_minus_half: {
      ...summarize(balDiff, { bootSeed: 20261125 + 44, reported: j['balAcc-META'] }),
      xorshift500kP: (xGe + 1) / (xN + 1),
    },
    balAccSHAM_minus_half: summarize(balSham.map(x => x - 0.5), { bootSeed: 20261125 + 45, reported: j['balAcc-SHAM'] }),
    balAccMETA_minus_SHAM: summarize(balMeta.map((x, i) => x - balSham[i]), { bootSeed: 20261125 + 46 }),
    distSHAM_minus_META: summarize(distDiff, { bootSeed: 20261125 + 47, reported: j['dist-SHAM-minus-META'] }),
  };
}

// 7. P13b A3 final (93001-93048)
{
  const j = EV('p13b-a3-final-93001-93048.json');
  const ss = seedsOf(j.perSeed);
  const pair = (a, b, sOff) => summarize(ss.map(s => j.perSeed[s][a] - j.perSeed[s][b]), {
    bootSeed: 20261125 + sOff,
    reported: j[`${a}-${b}`],
  });
  out.datasets.p13bA3 = {
    sourceFile: 'evidence/microverse/p13b-a3-final-93001-93048.json',
    meansReported: j.means,
    'META-EVOR': pair('META', 'EVOR', 50),
    'META-SHAM': pair('META', 'SHAM', 51),
    'META-FIXED': pair('META', 'FIXED', 52),
  };
}

// 8. L3c META-OFF diagnostic (48 practice seeds)
{
  const j = EV('fly-rsi-l3c-metaoff-practice.json');
  const ss = seedsOf(j.perSeed);
  const vals = ss.map(s => j.perSeed[s].METAOFF);
  out.datasets.l3cMetaoff = {
    sourceFile: 'evidence/microverse/fly-rsi-l3c-metaoff-practice.json',
    n: vals.length,
    mean: mean(vals),
    extinctCount: vals.filter(v => v === 0).length,
    extinctSeeds: ss.filter(s => j.perSeed[s].METAOFF === 0),
  };
}

// 9. L3-I screen 1 (parking + inheritFull, 48 practice seeds)
{
  const j = EV('fly-rsi-l3i-screen1-practice.json');
  const ss = seedsOf(j.perSeed);
  const V = fn => ss.map(s => fn(j.perSeed[s]));
  const l1NoCtrl = V(x => x.FIXED - x.NOREV);
  const l1WithCtrl = V(x => x.META - x.METAOFF);
  const dOrig = V(x => (x.META - x.NOREV) - 1.5 * (x.FIXED - x.NOREV));
  const fac = V(x => (x.META - x.NOREV) - 1.5 * (x.FIXED - x.NOREV) - (x.METAOFF - x.NOREV));
  const direct = V(x => x.METAOFF - x.NOREV);
  // Seed 113 check (heavy tail)
  const x113 = j.perSeed['113'];
  const d113 = (x113.META - x113.NOREV) - 1.5 * (x113.FIXED - x113.NOREV);
  const f113 = d113 - (x113.METAOFF - x113.NOREV);
  out.datasets.l3iScreen1 = {
    sourceFile: 'evidence/microverse/fly-rsi-l3i-screen1-practice.json',
    meansReported: j.means,
    extinctions: j.extinctions,
    observedL1Ratio: mean(l1WithCtrl) / mean(l1NoCtrl),
    'META-EVOR': summarize(V(x => x.META - x.EVOR), { bootSeed: 20261125 + 60, reported: j.contrasts['META-EVOR'] }),
    'META-SHAM': summarize(V(x => x.META - x.SHAM), { bootSeed: 20261125 + 61, reported: j.contrasts['META-SHAM'] }),
    'META-FIXED': summarize(V(x => x.META - x.FIXED), { bootSeed: 20261125 + 62, reported: j.contrasts['META-FIXED'] }),
    L3_d: summarize(dOrig, { bootSeed: 20261125 + 63, reported: j.contrasts.L3_d }),
    factorial: summarize(fac, { bootSeed: 20261125 + 64, reported: j.contrasts.factorial }),
    'L1gain_FIXED-NOREV': summarize(l1NoCtrl, { bootSeed: 20261125 + 65, reported: j.contrasts['L1gain FIXED-NOREV'] }),
    'L1gain_META-METAOFF': summarize(l1WithCtrl, { bootSeed: 20261125 + 66 }),
    'direct_METAOFF-NOREV': summarize(direct, { bootSeed: 20261125 + 67, reported: j.contrasts['direct METAOFF-NOREV'] }),
    seed113: { ...x113, dOrig: d113, factorial: f113 },
  };
}

// 10. L3-I screen 2 (RewriteCost stage A, 16 practice seeds)
{
  const j = EV('fly-rsi-l3i-screen2-stageA.json');
  const sum = k => j.perSeed.reduce((a, x) => a + x[k], 0);
  const checks = j.perSeed.map(x => x.checks);
  out.datasets.l3iScreen2 = {
    sourceFile: 'evidence/microverse/fly-rsi-l3i-screen2-stageA.json',
    n: j.perSeed.length,
    qualifyingSeeds: j.qualifyingSeeds,
    accountingOkAll: j.accountingOkAll,
    minChecks: Math.min(...checks),
    maxChecks: Math.max(...checks),
    meanChecks: mean(checks),
    totals: {
      checks: sum('checks'),
      nominations: sum('nominations'),
      cancellations: sum('cancellations'),
      pendingAtDeath: sum('pendingAtDeath'),
      pendingAtEnd: sum('pendingAtEnd'),
      completions: sum('completions'),
      wins: sum('wins'),
    },
    seed114: j.perSeed.find(x => x.seed === 114),
  };
}

// 11. L3-II stage A (16 practice seeds)
{
  const j = EV('fly-rsi-l3ii-stageA.json');
  const ss = seedsOf(j.pop);
  out.datasets.l3iiStageA = {
    sourceFile: 'evidence/microverse/fly-rsi-l3ii-stageA.json',
    summary: j.summary,
    lockedFIXED: j.verdict.lockedFIXED,
    'ORACLE-S50_pop': summarize(ss.map(s => j.pop[s].AT_ORACLE - j.pop[s].AT_S50), { bootSeed: 20261125 + 70 }),
    'ORACLE-BLIND_pop': summarize(ss.map(s => j.pop[s].AT_ORACLE - j.pop[s].AT_BLIND), { bootSeed: 20261125 + 71 }),
    'BLIND-S50_pop': summarize(ss.map(s => j.pop[s].AT_BLIND - j.pop[s].AT_S50), { bootSeed: 20261125 + 72 }),
    'ORACLE-S0_pop': summarize(ss.map(s => j.pop[s].AT_ORACLE - j.pop[s].AT_S0), { bootSeed: 20261125 + 73 }),
    'ORACLE-S100_pop': summarize(ss.map(s => j.pop[s].AT_ORACLE - j.pop[s].AT_S100), { bootSeed: 20261125 + 74 }),
    'S50-ORACLE_loss': summarize(ss.map(s => j.tape[s].AT_S50 - j.tape[s].AT_ORACLE), { bootSeed: 20261125 + 75 }),
    'BLIND-ORACLE_loss': summarize(ss.map(s => j.tape[s].AT_BLIND - j.tape[s].AT_ORACLE), { bootSeed: 20261125 + 76 }),
  };
}

// 12. L3-III stage A and stage B (16 practice seeds each)
{
  const a = EV('fly-rsi-l3iii-stageA.json');
  const b = EV('fly-rsi-l3iii-stageB.json');
  const ssB = seedsOf(b.pop);
  out.datasets.l3iii = {
    sourceFiles: [
      'evidence/microverse/fly-rsi-l3iii-stageA.json',
      'evidence/microverse/fly-rsi-l3iii-stageB.json',
    ],
    stageA: { means: a.means, lockedFIXED: a.verdict.lockedFIXED, extinctions: a.extinctions },
    stageB: {
      means: b.means,
      extinctions: b.extinctions,
      g: summarize(b.verdict.perSeed.g, { bootSeed: 20261125 + 80 }),
      m: summarize(b.verdict.perSeed.m, { bootSeed: 20261125 + 81 }),
      d: summarize(b.verdict.perSeed.d, { bootSeed: 20261125 + 82 }),
      ratioWithOverWithout: (b.means.AT3_META - b.means.AT_NOREV) / (b.means.AT_S75 - b.means.AT_NOREV),
      telemetry: Object.fromEntries(['AT3_META', 'AT_S75'].map(arm => {
        const rows = ssB.map(s => b.telemetry[s][arm]);
        return [arm, {
          meanMatchRate: mean(rows.map(x => x.matchRate)),
          meanRouteRun: mean(rows.map(x => x.meanRouteRun)),
          totalAdmissionsA: rows.reduce((t, x) => t + x.admissions[0], 0),
          totalAdmissionsB: rows.reduce((t, x) => t + x.admissions[1], 0),
        }];
      })),
    },
  };
}

// 13. L3-IV-H0 (16 practice seeds × 2 toxins)
{
  const j = EV('fly-rsi-l3iv-h0.json');
  const ss = j.seeds;
  out.datasets.l3ivH0 = {
    sourceFile: 'evidence/microverse/fly-rsi-l3iv-h0.json',
    verdict: j.verdict,
    batches: {},
  };
  for (const tx of ['0.6', '0.85']) {
    const b = j.batches[tx];
    const F = b.selectedStatic;
    const pop = j.pop[tx];
    const sOff = tx === '0.6' ? 90 : 100;
    const g = b.perSeed.g;
    const dO = b.perSeed.dO;
    const bl = b.perSeed.b;
    const oMinusF = ss.map(s => pop[s].Q_ORACLE - pop[s][F]);
    const tMinusF = ss.map(s => pop[s].Q_TRUEORACLE - pop[s][F]);
    const tMinusN = ss.map(s => pop[s].Q_TRUEORACLE - pop[s].Q_NOREV);
    const telArms = ['Q_NOREV', F, 'Q_ORACLE', 'Q_BLIND', 'Q_TRUEORACLE'];
    const telSummary = Object.fromEntries(telArms.map(arm => {
      const rows = ss.map(s => j.telemetry[tx][s][arm]);
      return [arm, {
        meanMatchRate: rows[0].matchRate !== null ? mean(rows.map(x => x.matchRate)) : null,
        meanAdmissions: mean(rows.map(x => x.admissions)),
        meanCorrectAdmissions: mean(rows.map(x => x.correctAdmissions)),
        meanTasteMasksEnd: mean(rows.map(x => x.meanTasteMasksEnd)),
        meanBirths: mean(rows.map(x => x.births)),
        birthTargetsPerBirth: rows.reduce((t, x) => t + x.birthTargets, 0) / rows.reduce((t, x) => t + x.births, 0),
      }];
    }));
    out.datasets.l3ivH0.batches[tx] = {
      selectedStatic: F,
      selectedAlloc: b.selectedAlloc,
      means: {
        Q_NOREV: b.means.Q_NOREV,
        [F]: b.means[F],
        Q_ORACLE: b.means.Q_ORACLE,
        Q_BLIND: b.means.Q_BLIND,
        Q_TRUEORACLE: b.means.Q_TRUEORACLE,
      },
      alpha: b.alpha,
      oracleL1Ratio: (b.means.Q_ORACLE - b.means.Q_NOREV) / (b.means[F] - b.means.Q_NOREV),
      g: summarize(g, { bootSeed: 20261125 + sOff + 0 }),
      dO: summarize(dO, { bootSeed: 20261125 + sOff + 1 }),
      'ORACLE-BLIND': summarize(bl, { bootSeed: 20261125 + sOff + 2 }),
      'ORACLE-F': summarize(oMinusF, { bootSeed: 20261125 + sOff + 3 }),
      'TRUE_ORACLE-F': summarize(tMinusF, { bootSeed: 20261125 + sOff + 4 }),
      'TRUE_ORACLE-NOREV': summarize(tMinusN, { bootSeed: 20261125 + sOff + 5 }),
      telemetry: telSummary,
    };
  }
}

// 14. Practice universal suite after G7c
{
  const j = EV('suite-dev-1795046397911.json');
  out.datasets.suiteDevAfterG7c = {
    sourceFile: 'evidence/microverse/suite-dev-1795046397911.json',
    seeds: j.seeds,
    passed: j.passed,
    failed: j.failed,
    report: j.report,
  };
}

const outPath = resolve(__dirname, 'stats_summary.json');
writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n');

// Print compact verification table to stdout
const fmt = (label, s) => {
  const ci = `[${s.ci95[0].toFixed(2)}, ${s.ci95[1].toFixed(2)}]`;
  const pStr = s.signFlipV2P < 0.0001 ? s.signFlipV2P.toExponential(2) : s.signFlipV2P.toFixed(5);
  console.log(`${label.padEnd(36)} n=${String(s.n).padStart(2)}  mean=${s.mean.toFixed(3).padStart(7)}  sd=${s.sd.toFixed(2).padStart(5)}  95%CI=${ci.padStart(16)}  wins=${String(s.wins).padStart(2)}/${s.n} (z=${s.zeros})  p_v2=${pStr}`);
};

console.log('=== HEADLINE & SECONDARY CONTRASTS (from committed JSON) ===');
fmt('G7c SELF - TASTEONLY (0.1-rnd)', out.datasets.g7c.vsTASTEONLY);
fmt('G7c SELF - MOVEONLY (0.1-rnd)', out.datasets.g7c.vsMOVEONLY);
fmt('L2 META - EVO-R', out.datasets.flyRsiL2['META-EVOR']);
fmt('L2 META - SHAM', out.datasets.flyRsiL2['META-SHAM']);
fmt('L2 META - FIXED', out.datasets.flyRsiL2['META-FIXED']);
fmt('P13b-1 META - FIXED', out.datasets.p13bParts['META-FIXED']);
fmt('P13b-2 META - EVO-R', out.datasets.p13bParts['META-EVOR']);
fmt('P13b-3 META - SHAM', out.datasets.p13bParts['META-SHAM']);
fmt('P13b-2b META - EVO-R', out.datasets.p13b2b['META-EVOR']);
fmt('P13b-2b META - SHAM', out.datasets.p13b2b['META-SHAM']);
fmt('P13b-2b META - FIXED', out.datasets.p13b2b['META-FIXED']);
fmt('P13b-3 headroom ORACLE - SHAM', out.datasets.p13b3Headroom['ORACLE-SHAM']);
fmt('P13b-3a balAcc - 0.5', out.datasets.p13b3Parts.balAccMETA_minus_half);
fmt('P13b-3b dist SHAM - META', out.datasets.p13b3Parts.distSHAM_minus_META);
fmt('P13b A3 META - EVO-R', out.datasets.p13bA3['META-EVOR']);
fmt('P13b A3 META - SHAM', out.datasets.p13bA3['META-SHAM']);
fmt('P13b A3 META - FIXED', out.datasets.p13bA3['META-FIXED']);
fmt('L3-I scr1 L3_d', out.datasets.l3iScreen1.L3_d);
fmt('L3-I scr1 factorial f', out.datasets.l3iScreen1.factorial);
fmt('L3-I scr1 direct METAOFF-NOREV', out.datasets.l3iScreen1['direct_METAOFF-NOREV']);
fmt('L3-I scr1 L1 FIXED-NOREV', out.datasets.l3iScreen1['L1gain_FIXED-NOREV']);
fmt('L3-I scr1 L1 META-METAOFF', out.datasets.l3iScreen1['L1gain_META-METAOFF']);
fmt('L3-II stA ORACLE - S50 pop', out.datasets.l3iiStageA['ORACLE-S50_pop']);
fmt('L3-II stA ORACLE - BLIND pop', out.datasets.l3iiStageA['ORACLE-BLIND_pop']);
fmt('L3-III stB g (S75 - NOREV)', out.datasets.l3iii.stageB.g);
fmt('L3-III stB m (META - S75)', out.datasets.l3iii.stageB.m);
fmt('L3-III stB d (m - 0.5g)', out.datasets.l3iii.stageB.d);
fmt('L3-IV-H0 (.60) g (S10 - NOREV)', out.datasets.l3ivH0.batches['0.6'].g);
fmt('L3-IV-H0 (.60) dO', out.datasets.l3ivH0.batches['0.6'].dO);
fmt('L3-IV-H0 (.60) ORACLE - BLIND', out.datasets.l3ivH0.batches['0.6']['ORACLE-BLIND']);
fmt('L3-IV-H0 (.60) ORACLE - S10', out.datasets.l3ivH0.batches['0.6']['ORACLE-F']);
fmt('L3-IV-H0 (.85) g (S20 - NOREV)', out.datasets.l3ivH0.batches['0.85'].g);
fmt('L3-IV-H0 (.85) dO', out.datasets.l3ivH0.batches['0.85'].dO);
fmt('L3-IV-H0 (.85) ORACLE - BLIND', out.datasets.l3ivH0.batches['0.85']['ORACLE-BLIND']);
fmt('L3-IV-H0 (.85) ORACLE - S20', out.datasets.l3ivH0.batches['0.85']['ORACLE-F']);
console.log('Wrote:', outPath);
