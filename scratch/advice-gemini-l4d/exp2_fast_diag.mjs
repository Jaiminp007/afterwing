import { mean, signflip } from '../../docs/paper/stats.mjs';

function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function randn(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

// Fast online LMS stream (equivalent to a fly lineage taking T bites)
// Tests exact IDBD, Autostep, SNR, DIRECT_ORACLE, and ORACLE L3 headroom.
function generateStream(seed, cfg) {
  const r = rng32(mix(seed ^ 0x12345678));
  const { D, T, worldType } = cfg;
  const xs = new Array(T);
  const ys = new Float64Array(T);
  const vTrue = new Float64Array(T);
  const fastMasks = new Array(T);

  const idx = Array.from({ length: D }, (_, i) => i);
  const wTrue = new Float64Array(D);
  let fastMask = new Uint8Array(D);

  if (worldType === 'S1_GLOBAL_DRIFT') {
    // Alternates between Calm Era (1500 bites: 3 fixed active bits drifting slowly, high noise)
    // and Storm Era (1500 bites: 3 active bits swap every 150 bites, drift fast, low noise)
    let era = r() < 0.5 ? 0 : 1;
    let active = shuffleInPlace([...idx], r).slice(0, 3);
    for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
    fastMask.fill(era);
    for (let t = 0; t < T; t++) {
      if (t > 0 && t % 1500 === 0) {
        era = 1 - era;
        fastMask = new Uint8Array(D).fill(era);
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 3);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
      } else if (era === 1 && t > 0 && t % 150 === 0) {
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 3);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
      } else if (era === 0 && t > 0 && t % 40 === 0) {
        // slow random walk on active weights
        for (const i of active) wTrue[i] = clamp(wTrue[i] + 0.35 * randn(r), -2.5, 2.5);
      } else if (era === 1 && t > 0 && t % 20 === 0) {
        for (const i of active) wTrue[i] = clamp(wTrue[i] + 0.6 * randn(r), -2.5, 2.5);
      }
      const x = new Int8Array(D);
      let s = 0;
      for (let i = 0; i < D; i++) { x[i] = r() < 0.5 ? -1 : 1; s += wTrue[i] * x[i]; }
      const noiseStd = era === 0 ? 1.8 : 0.15;
      xs[t] = x;
      vTrue[t] = s;
      ys[t] = s + noiseStd * randn(r);
      fastMasks[t] = fastMask;
    }
  } else if (worldType === 'S2_POOLS_SWAP') {
    // D=64 split into 2 pools of 32.
    // Slow pool: 2 fixed active bits (slow drift, stay active for 2000 bites).
    // Fast pool: 2 active bits swap every 120 bites (strong weights).
    // Pools swap every 2000 bites.
    const perm = shuffleInPlace([...idx], r);
    const pools = [perm.slice(0, D / 2), perm.slice(D / 2, D)];
    let fastPool = r() < 0.5 ? 0 : 1;
    let fastAct = shuffleInPlace([...pools[fastPool]], r).slice(0, 2);
    let slowAct = shuffleInPlace([...pools[1 - fastPool]], r).slice(0, 2);
    for (const i of fastAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
    for (const i of slowAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
    fastMask = new Uint8Array(D);
    for (const i of pools[fastPool]) fastMask[i] = 1;
    for (let t = 0; t < T; t++) {
      if (t > 0 && t % 2000 === 0) {
        fastPool = 1 - fastPool;
        fastMask = new Uint8Array(D);
        for (const i of pools[fastPool]) fastMask[i] = 1;
        wTrue.fill(0);
        fastAct = shuffleInPlace([...pools[fastPool]], r).slice(0, 2);
        slowAct = shuffleInPlace([...pools[1 - fastPool]], r).slice(0, 2);
        for (const i of fastAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
        for (const i of slowAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
      } else if (t > 0 && t % 120 === 0) {
        for (const i of fastAct) wTrue[i] = 0;
        fastAct = shuffleInPlace([...pools[fastPool]], r).slice(0, 2);
        for (const i of fastAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
      }
      if (t > 0 && t % 50 === 0) {
        for (const i of slowAct) wTrue[i] = clamp(wTrue[i] + 0.3 * randn(r), -2.5, 2.5);
      }
      const x = new Int8Array(D);
      let s = 0;
      for (let i = 0; i < D; i++) { x[i] = r() < 0.5 ? -1 : 1; s += wTrue[i] * x[i]; }
      xs[t] = x;
      vTrue[t] = s;
      ys[t] = s + 1.0 * randn(r);
      fastMasks[t] = fastMask;
    }
  } else if (worldType === 'S3_SUTTON_DRIFT_RATES') {
    // Classic Sutton-style: D=64, 4 active bits whose drift speeds jump between 0 and huge,
    // AND alternating eras: Era 0 (only slow continuous drift on 4 fixed bits, high noise),
    // Era 1 (abrupt subset switches of 4 bits every 80 bites, low noise)
    let era = r() < 0.5 ? 0 : 1;
    let active = shuffleInPlace([...idx], r).slice(0, 4);
    for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
    fastMask.fill(era);
    for (let t = 0; t < T; t++) {
      if (t > 0 && t % 2000 === 0) {
        era = 1 - era;
        fastMask = new Uint8Array(D).fill(era);
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 4);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
      } else if (era === 1 && t > 0 && t % 100 === 0) {
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 4);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 1.5;
      } else if (era === 0 && t > 0 && t % 20 === 0) {
        for (const i of active) wTrue[i] = clamp(wTrue[i] + 0.2 * randn(r), -2.5, 2.5);
      }
      const x = new Int8Array(D);
      let s = 0;
      for (let i = 0; i < D; i++) { x[i] = r() < 0.5 ? -1 : 1; s += wTrue[i] * x[i]; }
      const noiseStd = era === 0 ? 2.5 : 0.1;
      xs[t] = x;
      vTrue[t] = s;
      ys[t] = s + noiseStd * randn(r);
      fastMasks[t] = fastMask;
    }
  }
  return { xs, ys, vTrue, fastMasks };
}

function evalArm(stream, D, arm) {
  const { xs, ys, vTrue, fastMasks } = stream;
  const T = xs.length;
  const lateFrom = Math.floor(T / 2);
  const w = new Float64Array(D);
  const beta = new Float64Array(D).fill(arm.betaInit ?? -4.5);
  const h = new Float64Array(D);
  const v = new Float64Array(D).fill(0.1);
  const g1 = new Float64Array(D);
  const g2 = new Float64Array(D).fill(0.1);
  const alphas = new Float64Array(D);

  let mseSum = 0, accSum = 0, nLate = 0;
  const bMin = arm.betaMin ?? -10, bMax = arm.betaMax ?? -0.5;

  for (let t = 0; t < T; t++) {
    const x = xs[t], y = ys[t], fm = fastMasks[t];
    let pred = 0;
    for (let i = 0; i < D; i++) pred += w[i] * x[i];
    if (t >= lateFrom) {
      const err = pred - vTrue[t];
      mseSum += err * err;
      if ((pred > 0) === (vTrue[t] > 0)) accSum++;
      nLate++;
    }
    const delta = clamp(y - pred, -10, 10);

    if (arm.kind === 'fixed') {
      const a = arm.alpha;
      for (let i = 0; i < D; i++) w[i] = clamp(w[i] + a * delta * x[i], -10, 10);
    } else if (arm.kind === 'direct_oracle') {
      for (let i = 0; i < D; i++) {
        const a = fm[i] ? arm.aFast : arm.aSlow;
        w[i] = clamp(w[i] + a * delta * x[i], -10, 10);
      }
    } else if (arm.kind === 'snr') {
      let sumA = 0;
      for (let i = 0; i < D; i++) {
        const g = delta * x[i];
        g1[i] = (1 - arm.rho) * g1[i] + arm.rho * g;
        g2[i] = (1 - arm.rho) * g2[i] + arm.rho * g * g;
        alphas[i] = clamp(arm.eta * (g1[i] * g1[i]) / (g2[i] + 1e-4), 1e-5, 0.5);
        sumA += alphas[i];
      }
      const sc = sumA > 0.9 ? 0.9 / sumA : 1.0;
      for (let i = 0; i < D; i++) w[i] = clamp(w[i] + sc * alphas[i] * delta * x[i], -10, 10);
    } else if (arm.kind === 'idbd' || arm.kind === 'oracle_idbd') {
      let sumA = 0;
      for (let i = 0; i < D; i++) {
        const th = arm.kind === 'oracle_idbd' ? (fm[i] ? arm.thFast : arm.thSlow) : arm.theta;
        const g = delta * x[i];
        beta[i] = clamp(beta[i] + th * g * h[i], bMin, bMax);
        alphas[i] = Math.exp(beta[i]);
        sumA += alphas[i];
      }
      const sc = sumA > 0.9 ? 0.9 / sumA : 1.0;
      for (let i = 0; i < D; i++) {
        const a = alphas[i] * sc;
        if (sc < 1.0) beta[i] = Math.log(Math.max(1e-6, a));
        const g = delta * x[i];
        w[i] = clamp(w[i] + a * g, -10, 10);
        h[i] = h[i] * Math.max(0, 1 - a) + a * g;
      }
    } else if (arm.kind === 'autostep' || arm.kind === 'oracle_autostep') {
      const tau = arm.tau ?? 50;
      let sumA = 0;
      for (let i = 0; i < D; i++) {
        const mu = arm.kind === 'oracle_autostep' ? (fm[i] ? arm.muFast : arm.muSlow) : arm.mu;
        const g = delta * x[i];
        const gh = g * h[i];
        const a0 = Math.exp(beta[i]);
        const absGh = Math.abs(gh);
        v[i] = Math.max(absGh, v[i] + (1 / tau) * a0 * (absGh - v[i]));
        if (v[i] > 1e-12) beta[i] = clamp(beta[i] + mu * (gh / v[i]), bMin, bMax);
        if (arm.pullFast && fm[i]) beta[i] = clamp(beta[i] + arm.pullFast * (arm.pullTarget - beta[i]), bMin, bMax);
        alphas[i] = Math.exp(beta[i]);
        sumA += alphas[i];
      }
      const sc = sumA > 0.9 ? 0.9 / sumA : 1.0;
      for (let i = 0; i < D; i++) {
        const a = alphas[i] * sc;
        if (sc < 1.0) beta[i] = Math.log(Math.max(1e-6, a));
        const g = delta * x[i];
        w[i] = clamp(w[i] + a * g, -10, 10);
        h[i] = h[i] * Math.max(0, 1 - a) + a * g;
      }
    }
  }
  return { negMse: -mseSum / nLate, acc: accSum / nLate };
}

const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006, 3007, 3008];
const D = 64, T = 8000;
const WORLDS = ['S1_GLOBAL_DRIFT', 'S2_POOLS_SWAP', 'S3_SUTTON_DRIFT_RATES'];

const ARMS = [
  { name: 'FIX_001', kind: 'fixed', alpha: 0.001 },
  { name: 'FIX_003', kind: 'fixed', alpha: 0.003 },
  { name: 'FIX_006', kind: 'fixed', alpha: 0.006 },
  { name: 'FIX_010', kind: 'fixed', alpha: 0.010 },
  { name: 'FIX_015', kind: 'fixed', alpha: 0.015 },
  { name: 'IDBD_002', kind: 'idbd', theta: 0.002 },
  { name: 'IDBD_005', kind: 'idbd', theta: 0.005 },
  { name: 'IDBD_015', kind: 'idbd', theta: 0.015 },
  { name: 'IDBD_040', kind: 'idbd', theta: 0.040 },
  { name: 'IDBD_100', kind: 'idbd', theta: 0.100 },
  { name: 'AUTO_005', kind: 'autostep', mu: 0.005 },
  { name: 'AUTO_015', kind: 'autostep', mu: 0.015 },
  { name: 'AUTO_040', kind: 'autostep', mu: 0.040 },
  { name: 'AUTO_100', kind: 'autostep', mu: 0.100 },
  { name: 'AUTO_250', kind: 'autostep', mu: 0.250 },
  { name: 'AUTO_500', kind: 'autostep', mu: 0.500 },
  { name: 'SNR_05', kind: 'snr', rho: 0.05, eta: 0.2 },
  { name: 'SNR_15', kind: 'snr', rho: 0.15, eta: 0.2 },
  { name: 'DIR_ORC', kind: 'direct_oracle', aFast: 0.014, aSlow: 0.002 },
  { name: 'ORC_IDBD', kind: 'oracle_idbd', thFast: 0.08, thSlow: 0.002 },
  { name: 'ORC_AUTO', kind: 'oracle_autostep', muFast: 0.25, muSlow: 0.01 },
  { name: 'ORC_AFUL', kind: 'oracle_autostep', muFast: 0.30, muSlow: 0.005, pullFast: 0.03, pullTarget: -3.5 },
];

for (const wt of WORLDS) {
  console.log(`\n=== WORLD: ${wt} (D=${D}, T=${T}) ===`);
  const streams = SEEDS.map(s => generateStream(s, { D, T, worldType: wt }));
  const res = new Map();
  for (const arm of ARMS) {
    res.set(arm.name, streams.map(st => evalArm(st, D, arm)));
  }
  const metric = 'acc';
  const fixNames = ARMS.filter(a => a.kind === 'fixed').map(a => a.name);
  const bestFixName = fixNames.reduce((a, b) => mean(res.get(a).map(x => x[metric])) >= mean(res.get(b).map(x => x[metric])) ? a : b);
  const bestFix = res.get(bestFixName).map(x => x[metric]);
  const l2Names = ARMS.filter(a => ['idbd', 'autostep', 'snr', 'direct_oracle'].includes(a.kind)).map(a => a.name);
  const bestL2Name = l2Names.reduce((a, b) => mean(res.get(a).map(x => x[metric])) >= mean(res.get(b).map(x => x[metric])) ? a : b);
  const bestL2 = res.get(bestL2Name).map(x => x[metric]);

  for (const arm of ARMS) {
    const rs = res.get(arm.name);
    const acc = mean(rs.map(x => x.acc));
    const mse = -mean(rs.map(x => x.negMse));
    console.log(`  ${arm.name.padEnd(10)} acc=${(acc * 100).toFixed(2)}%  mse=${mse.toFixed(3)}`);
  }
  console.log(`  Best FIXED: ${bestFixName} (${(mean(bestFix) * 100).toFixed(2)}%), Best L2: ${bestL2Name} (${(mean(bestL2) * 100).toFixed(2)}%)`);
  for (const orcName of ['ORC_IDBD', 'ORC_AUTO', 'ORC_AFUL']) {
    const orc = res.get(orcName).map(x => x[metric]);
    const d4 = SEEDS.map((_, i) => (orc[i] - bestFix[i]) - 1.5 * (bestL2[i] - bestFix[i]));
    const ratio = (mean(orc) - mean(bestFix)) / (mean(bestL2) - mean(bestFix));
    console.log(`  ${orcName.padEnd(10)} vs ${bestL2Name.padEnd(10)}: d4=${(mean(d4) * 100).toFixed(2)}%  ratio=${ratio.toFixed(2)}x  signs=${d4.filter(x => x > 0).length}/8`);
  }
}
