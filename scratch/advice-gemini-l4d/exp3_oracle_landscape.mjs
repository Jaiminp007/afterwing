import { mean } from '../../docs/paper/stats.mjs';

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

// =========================================================================
// TEST 1: Pure Step-Size Hierarchy (LMS + IDBD/Autostep)
// Separate Era 0 (Calm/High-Noise, Fixed Active Subset, Drifting Weights)
// vs Era 1 (Storm/Low-Noise, Rapidly Switching Active Subset)
// We print J_era0(mu), J_era1(mu), J_avg(mu), and ORACLE(mu0, mu1)!
// =========================================================================
function genStepSizeWorld(seed, mode) {
  const r = rng32(mix(seed ^ 0x44444444));
  const D = 64, T = 12000;
  const xs = new Array(T), ys = new Float64Array(T), vTrue = new Float64Array(T);
  const eras = new Uint8Array(T);
  const fastMasks = new Array(T);
  const idx = Array.from({ length: D }, (_, i) => i);
  const wTrue = new Float64Array(D);

  if (mode === 'GLOBAL_EXTREME') {
    // Era 0 (3000 steps): 2 FIXED active bits with continuous weight drift (random walk), HIGH noise (std=2.5)
    // Era 1 (3000 steps): 2 active bits SWAP every 150 steps (strong jump), LOW noise (std=0.1)
    let era = r() < 0.5 ? 0 : 1;
    let active = shuffleInPlace([...idx], r).slice(0, 2);
    for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
    let fm = new Uint8Array(D).fill(era);
    for (let t = 0; t < T; t++) {
      if (t > 0 && t % 3000 === 0) {
        era = 1 - era;
        fm = new Uint8Array(D).fill(era);
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 2);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
      } else if (era === 1 && t > 0 && t % 150 === 0) {
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 2);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
      } else if (era === 0 && t > 0 && t % 15 === 0) {
        for (const i of active) wTrue[i] = clamp(wTrue[i] + 0.35 * randn(r), -3.0, 3.0);
      }
      const x = new Int8Array(D);
      let s = 0;
      for (let i = 0; i < D; i++) { x[i] = r() < 0.5 ? -1 : 1; s += wTrue[i] * x[i]; }
      xs[t] = x; vTrue[t] = s;
      ys[t] = s + (era === 0 ? 2.5 : 0.1) * randn(r);
      eras[t] = era; fastMasks[t] = fm;
    }
  } else if (mode === 'GLOBAL_SLOW_VS_FAST_SWAP') {
    // Era 0 (3000 steps): 3 FIXED active bits, sign flips every 30 steps (fast weight drift on FIXED support), noise=1.5
    // Era 1 (3000 steps): 3 active bits SWAP every 200 steps, fixed weights during 200 steps, noise=0.1
    let era = r() < 0.5 ? 0 : 1;
    let active = shuffleInPlace([...idx], r).slice(0, 3);
    for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
    let fm = new Uint8Array(D).fill(era);
    for (let t = 0; t < T; t++) {
      if (t > 0 && t % 3000 === 0) {
        era = 1 - era;
        fm = new Uint8Array(D).fill(era);
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 3);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
      } else if (era === 1 && t > 0 && t % 200 === 0) {
        wTrue.fill(0);
        active = shuffleInPlace([...idx], r).slice(0, 3);
        for (const i of active) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
      } else if (era === 0 && t > 0 && t % 25 === 0) {
        const pick = active[Math.floor(r() * active.length)];
        wTrue[pick] = -wTrue[pick];
      }
      const x = new Int8Array(D);
      let s = 0;
      for (let i = 0; i < D; i++) { x[i] = r() < 0.5 ? -1 : 1; s += wTrue[i] * x[i]; }
      xs[t] = x; vTrue[t] = s;
      ys[t] = s + (era === 0 ? 1.5 : 0.1) * randn(r);
      eras[t] = era; fastMasks[t] = fm;
    }
  } else if (mode === 'PER_FEATURE_16_VS_48') {
    // 4 pools of 16 bits. 1 fast pool (2 active bits swap every 150 steps, weight 2.0).
    // 3 slow pools (2 fixed active bits whose signs flip every 60 steps, weight 2.0).
    // Fast pool rotates every 3000 steps. Noise = 1.0.
    const perm = shuffleInPlace([...idx], r);
    const pools = [perm.slice(0, 16), perm.slice(16, 32), perm.slice(32, 48), perm.slice(48, 64)];
    let fp = Math.floor(r() * 4);
    const getSlow = p => pools.filter((_, k) => k !== p).flat();
    let fastAct = shuffleInPlace([...pools[fp]], r).slice(0, 2);
    let slowAct = shuffleInPlace(getSlow(fp), r).slice(0, 2);
    for (const i of fastAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
    for (const i of slowAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
    let fm = new Uint8Array(D);
    for (const i of pools[fp]) fm[i] = 1;
    for (let t = 0; t < T; t++) {
      if (t > 0 && t % 3000 === 0) {
        fp = (fp + 1 + Math.floor(r() * 3)) % 4;
        fm = new Uint8Array(D);
        for (const i of pools[fp]) fm[i] = 1;
        wTrue.fill(0);
        fastAct = shuffleInPlace([...pools[fp]], r).slice(0, 2);
        slowAct = shuffleInPlace(getSlow(fp), r).slice(0, 2);
        for (const i of fastAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
        for (const i of slowAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
      } else if (t > 0 && t % 150 === 0) {
        for (const i of fastAct) wTrue[i] = 0;
        fastAct = shuffleInPlace([...pools[fp]], r).slice(0, 2);
        for (const i of fastAct) wTrue[i] = (r() < 0.5 ? -1 : 1) * 2.0;
      }
      if (t > 0 && t % 60 === 0) {
        const pick = slowAct[Math.floor(r() * slowAct.length)];
        wTrue[pick] = -wTrue[pick];
      }
      const x = new Int8Array(D);
      let s = 0;
      for (let i = 0; i < D; i++) { x[i] = r() < 0.5 ? -1 : 1; s += wTrue[i] * x[i]; }
      xs[t] = x; vTrue[t] = s;
      ys[t] = s + 1.0 * randn(r);
      eras[t] = 0; fastMasks[t] = fm;
    }
  }
  return { D, T, xs, ys, vTrue, eras, fastMasks };
}

function runLMS(st, arm) {
  const { D, T, xs, ys, vTrue, eras, fastMasks } = st;
  const late = Math.floor(T / 3);
  const w = new Float64Array(D);
  const beta = new Float64Array(D).fill(arm.betaInit ?? -5.0);
  const h = new Float64Array(D);
  const v = new Float64Array(D).fill(0.1);
  const alphas = new Float64Array(D);
  const bMin = arm.bMin ?? -10, bMax = arm.bMax ?? -0.5;
  let mseAll = 0, mse0 = 0, mse1 = 0, nAll = 0, n0 = 0, n1 = 0;
  let accAll = 0, acc0 = 0, acc1 = 0;

  for (let t = 0; t < T; t++) {
    const x = xs[t], y = ys[t], fm = fastMasks[t], era = eras[t];
    let pred = 0;
    for (let i = 0; i < D; i++) pred += w[i] * x[i];
    if (t >= late) {
      const e2 = (pred - vTrue[t]) ** 2;
      const ok = (pred > 0) === (vTrue[t] > 0) ? 1 : 0;
      mseAll += e2; accAll += ok; nAll++;
      if (era === 0) { mse0 += e2; acc0 += ok; n0++; } else { mse1 += e2; acc1 += ok; n1++; }
    }
    const delta = clamp(y - pred, -12, 12);

    if (arm.kind === 'fixed') {
      const a = arm.alpha;
      for (let i = 0; i < D; i++) w[i] = clamp(w[i] + a * delta * x[i], -10, 10);
    } else if (arm.kind === 'autostep') {
      const tau = arm.tau ?? 50;
      let sumA = 0;
      for (let i = 0; i < D; i++) {
        const mu = arm.oracle ? (fm[i] ? arm.muFast : arm.muSlow) : arm.mu;
        const g = delta * x[i], gh = g * h[i];
        const a0 = Math.exp(beta[i]), agh = Math.abs(gh);
        v[i] = Math.max(agh, v[i] + (1 / tau) * a0 * (agh - v[i]));
        if (v[i] > 1e-12) beta[i] = clamp(beta[i] + mu * (gh / v[i]), bMin, bMax);
        if (arm.pullFast && fm[i]) beta[i] = clamp(beta[i] + arm.pullFast * (arm.pullTarget - beta[i]), bMin, bMax);
        if (arm.decaySlow && !fm[i]) beta[i] = clamp(beta[i] - arm.decaySlow, bMin, bMax);
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
    } else if (arm.kind === 'idbd') {
      let sumA = 0;
      for (let i = 0; i < D; i++) {
        const th = arm.oracle ? (fm[i] ? arm.thFast : arm.thSlow) : arm.theta;
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
    }
  }
  return {
    mse: mseAll / nAll, acc: accAll / nAll,
    mse0: n0 ? mse0 / n0 : 0, acc0: n0 ? acc0 / n0 : 0,
    mse1: n1 ? mse1 / n1 : 0, acc1: n1 ? acc1 / n1 : 0,
  };
}

const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006];
for (const mode of ['GLOBAL_EXTREME', 'GLOBAL_SLOW_VS_FAST_SWAP', 'PER_FEATURE_16_VS_48']) {
  console.log(`\n========== ${mode} ==========`);
  const streams = SEEDS.map(s => genStepSizeWorld(s, mode));
  const arms = [
    ...[0.002, 0.005, 0.010, 0.015, 0.025].map(a => ({ name: `FIX_${a}`, kind: 'fixed', alpha: a })),
    ...[0.001, 0.003, 0.01, 0.03, 0.06, 0.12, 0.20, 0.30].map(m => ({ name: `AUTO_${m}`, kind: 'autostep', mu: m })),
    ...[0.001, 0.005, 0.015, 0.03, 0.05].map(t => ({ name: `IDBD_${t}`, kind: 'idbd', theta: t })),
    { name: 'ORC_AUTO_12_01', kind: 'autostep', oracle: true, muFast: 0.12, muSlow: 0.01 },
    { name: 'ORC_AUTO_20_005', kind: 'autostep', oracle: true, muFast: 0.20, muSlow: 0.005 },
    { name: 'ORC_AUTO_15_003', kind: 'autostep', oracle: true, muFast: 0.15, muSlow: 0.003 },
    { name: 'ORC_PULL_15_003', kind: 'autostep', oracle: true, muFast: 0.15, muSlow: 0.003, pullFast: 0.05, pullTarget: -3.5 },
    { name: 'DIR_PULL_03', kind: 'autostep', oracle: false, mu: 0.03, pullFast: 0.05, pullTarget: -3.5 },
    { name: 'DIR_PULL_06', kind: 'autostep', oracle: false, mu: 0.06, pullFast: 0.05, pullTarget: -3.5 },
    { name: 'ORC_IDBD_04_002', kind: 'idbd', oracle: true, thFast: 0.04, thSlow: 0.002 },
  ];
  const out = new Map();
  for (const arm of arms) {
    const rs = streams.map(st => runLMS(st, arm));
    out.set(arm.name, rs);
    console.log(
      `  ${arm.name.padEnd(16)} acc=${(mean(rs.map(r => r.acc)) * 100).toFixed(2)}%  mse=${mean(rs.map(r => r.mse)).toFixed(3)}` +
      (mode.startsWith('GLOBAL') ? `  (e0: acc=${(mean(rs.map(r => r.acc0)) * 100).toFixed(1)}% mse=${mean(rs.map(r => r.mse0)).toFixed(2)} | e1: acc=${(mean(rs.map(r => r.acc1)) * 100).toFixed(1)}% mse=${mean(rs.map(r => r.mse1)).toFixed(2)})` : '')
    );
  }
  const bestFix = Math.max(...arms.filter(a => a.kind === 'fixed').map(a => mean(out.get(a.name).map(r => r.acc))));
  const bestFixMse = Math.min(...arms.filter(a => a.kind === 'fixed').map(a => mean(out.get(a.name).map(r => r.mse))));
  const l2s = arms.filter(a => !a.oracle && a.kind !== 'fixed' && !a.name.startsWith('DIR_'));
  const bestL2 = l2s.reduce((a, b) => mean(out.get(a.name).map(r => r.acc)) >= mean(out.get(b.name).map(r => r.acc)) ? a : b);
  const bestL2Mse = l2s.reduce((a, b) => mean(out.get(a.name).map(r => r.mse)) <= mean(out.get(b.name).map(r => r.mse)) ? a : b);
  for (const orc of arms.filter(a => a.oracle || a.name.startsWith('DIR_'))) {
    const oAcc = mean(out.get(orc.name).map(r => r.acc));
    const oMse = mean(out.get(orc.name).map(r => r.mse));
    const rAcc = (oAcc - bestFix) / (mean(out.get(bestL2.name).map(r => r.acc)) - bestFix);
    const rMse = (bestFixMse - oMse) / (bestFixMse - mean(out.get(bestL2Mse.name).map(r => r.mse)));
    console.log(`  Ratio ${orc.name.padEnd(16)} vs ${bestL2.name}: accRatio=${rAcc.toFixed(2)}x, mseRatio=${rMse.toFixed(2)}x`);
  }
}
