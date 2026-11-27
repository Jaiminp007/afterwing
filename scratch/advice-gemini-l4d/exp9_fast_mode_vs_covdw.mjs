import { mean } from '../../docs/paper/stats.mjs';

function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
function randn(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function randOrtho(k, r) {
  const M = Array.from({ length: k }, () => Float64Array.from({ length: k }, () => randn(r)));
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < i; j++) {
      let dot = 0;
      for (let c = 0; c < k; c++) dot += M[i][c] * M[j][c];
      for (let c = 0; c < k; c++) M[i][c] -= dot * M[j][c];
    }
    let norm = 0;
    for (let c = 0; c < k; c++) norm += M[i][c] * M[i][c];
    norm = Math.sqrt(norm) || 1;
    for (let c = 0; c < k; c++) M[i][c] /= norm;
  }
  return M;
}

function makeBlockOrtho(nBlocks, B, r) {
  const D = nBlocks * B;
  const Q = Array.from({ length: D }, () => new Float64Array(D));
  for (let b = 0; b < nBlocks; b++) {
    const Qb = randOrtho(B, r);
    const off = b * B;
    for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) Q[off + i][off + j] = Qb[i][j];
  }
  return Q;
}

function orthonormalize(Q) {
  const D = Q.length;
  for (let i = 0; i < D; i++) {
    const qi = Q[i];
    for (let j = 0; j < i; j++) {
      const qj = Q[j];
      let dot = 0;
      for (let c = 0; c < D; c++) dot += qi[c] * qj[c];
      for (let c = 0; c < D; c++) qi[c] -= dot * qj[c];
    }
    let n2 = 0;
    for (let c = 0; c < D; c++) n2 += qi[c] * qi[c];
    const inv = 1 / (Math.sqrt(n2) || 1);
    for (let c = 0; c < D; c++) qi[c] *= inv;
  }
}

function eye(D) {
  const Q = Array.from({ length: D }, () => new Float64Array(D));
  for (let i = 0; i < D; i++) Q[i][i] = 1;
  return Q;
}

// Fast-switching modes inside a rotated block + static mode!
// Wait: we test BOTH:
//   (A) modeEvery=160, driftEvery=40 (fast switches, 2x12 blocks)
//   (B) modeEvery=200, TWO simultaneous drifting modes + 1 static mode (3x8 blocks)
function generateStream(seed, cfg) {
  const { nBlocks, B, T, blockEvery, modeEvery, driftEvery, noiseStd, nFast } = cfg;
  const r = rng32(mix(seed ^ 0x99999999));
  const D = nBlocks * B;
  const Qtrue = makeBlockOrtho(nBlocks, B, r);
  const xs = new Array(T), ys = new Float64Array(T), vTrue = new Float64Array(T);
  let blk = Math.floor(r() * nBlocks);
  let m0 = Math.floor(r() * B);
  const pickFast = () => {
    const avail = Array.from({ length: B }, (_, i) => i).filter(i => i !== m0);
    for (let i = avail.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [avail[i], avail[j]] = [avail[j], avail[i]]; }
    return avail.slice(0, nFast);
  };
  let mFast = pickFast();
  let c0 = (r() < 0.5 ? -1 : 1) * 2.5;
  let cFast = mFast.map(() => (r() < 0.5 ? -1 : 1) * 2.5);

  for (let t = 0; t < T; t++) {
    if (t > 0 && t % blockEvery === 0) {
      const others = Array.from({ length: nBlocks }, (_, i) => i).filter(i => i !== blk);
      blk = others[Math.floor(r() * others.length)];
      m0 = Math.floor(r() * B);
      mFast = pickFast();
      c0 = (r() < 0.5 ? -1 : 1) * 2.5;
      cFast = mFast.map(() => (r() < 0.5 ? -1 : 1) * 2.5);
    } else if (t > 0 && t % modeEvery === 0) {
      mFast = pickFast();
      cFast = mFast.map(() => (r() < 0.5 ? -1 : 1) * 2.5);
    } else if (t > 0 && t % driftEvery === 0) {
      const k = Math.floor(r() * nFast);
      cFast[k] = -cFast[k];
    }
    const q0 = Qtrue[blk * B + m0];
    const x = new Int8Array(D);
    let s = 0;
    for (let i = 0; i < D; i++) {
      x[i] = r() < 0.5 ? -1 : 1;
      let wi = c0 * q0[i];
      for (let k = 0; k < nFast; k++) wi += cFast[k] * Qtrue[blk * B + mFast[k]][i];
      s += wi * x[i];
    }
    xs[t] = x;
    vTrue[t] = s;
    ys[t] = s + noiseStd * randn(r);
  }
  return { D, T, xs, ys, vTrue, Qtrue };
}

function evalArm(st, arm) {
  const { D, T, xs, ys, vTrue, Qtrue } = st;
  const late = Math.floor(T / 2);
  let Q = arm.useOracleQ ? Qtrue.map(row => new Float64Array(row)) : eye(D);
  const u = new Float64Array(D);
  const uSlow = new Float64Array(D);
  const beta = new Float64Array(D).fill(arm.betaInit ?? -4.0);
  const h = new Float64Array(D);
  const v = new Float64Array(D).fill(0.1);
  const z = new Float64Array(D);
  const g = new Float64Array(D);
  const alphas = new Float64Array(D);
  const C = Array.from({ length: D }, () => new Float64Array(D));
  for (let i = 0; i < D; i++) C[i][i] = 1 / D;

  let mseSum = 0, accSum = 0, nLate = 0;
  const bMin = arm.bMin ?? -6.0, bMax = -0.3;

  for (let t = 0; t < T; t++) {
    const x = xs[t], y = ys[t];
    let pred = 0;
    if (arm.kind === 'fixed' || arm.kind === 'cov_dw' || arm.kind === 'cov_w') {
      for (let i = 0; i < D; i++) pred += u[i] * x[i];
    } else {
      for (let i = 0; i < D; i++) {
        const qi = Q[i];
        let s = 0;
        for (let c = 0; c < D; c++) s += qi[c] * x[c];
        z[i] = s;
        pred += u[i] * s;
      }
    }

    if (t >= late) {
      const err = pred - vTrue[t];
      mseSum += err * err;
      if ((pred > 0) === (vTrue[t] > 0)) accSum++;
      nLate++;
    }
    const delta = clamp(y - pred, -12, 12);

    if (arm.kind === 'fixed') {
      const a = arm.alpha;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + a * delta * x[i], -12, 12);
    } else if (arm.kind === 'cov_w' || arm.kind === 'cov_dw') {
      for (let i = 0; i < D; i++) g[i] = delta * x[i];
      let tr = 0;
      for (let i = 0; i < D; i++) tr += C[i][i];
      const invTr = 1 / (tr + 1e-4);
      const ag = new Float64Array(D);
      let xAx = 0;
      for (let i = 0; i < D; i++) {
        let cg = 0, cx = 0;
        const Ci = C[i];
        for (let j = 0; j < D; j++) { cg += Ci[j] * g[j]; cx += Ci[j] * x[j]; }
        ag[i] = arm.a0 * g[i] + arm.a1 * cg * invTr;
        xAx += (arm.a0 * x[i] + arm.a1 * cx * invTr) * x[i];
      }
      const sc = xAx > 0.9 ? 0.9 / xAx : 1.0;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + sc * ag[i], -12, 12);

      const src = new Float64Array(D);
      if (arm.kind === 'cov_dw') {
        for (let i = 0; i < D; i++) {
          uSlow[i] = (1 - arm.slowRho) * uSlow[i] + arm.slowRho * u[i];
          src[i] = u[i] - uSlow[i];
        }
      } else src.set(u);
      let s2 = 0;
      for (let i = 0; i < D; i++) s2 += src[i] * src[i];
      if (s2 > 0.05) {
        const invS2 = 1 / s2, rho = arm.rho;
        for (let i = 0; i < D; i++) {
          const Ci = C[i], si = src[i];
          for (let j = 0; j < D; j++) Ci[j] = (1 - rho) * Ci[j] + rho * si * src[j] * invS2;
        }
      }
    } else {
      const tau = 50;
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * z[i];
        g[i] = gi;
        const gh = gi * h[i];
        const a0 = Math.exp(beta[i]), agh = Math.abs(gh);
        v[i] = Math.max(agh, v[i] + (1 / tau) * a0 * (agh - v[i]));
        if (v[i] > 1e-12) beta[i] = clamp(beta[i] + arm.mu * (gh / v[i]), bMin, bMax);
        alphas[i] = Math.exp(beta[i]);
        sumEff += alphas[i] * z[i] * z[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) alphas[i] *= sc;

      for (let i = 0; i < D; i++) {
        const a = alphas[i], gi = g[i];
        u[i] = clamp(u[i] + a * gi, -12, 12);
        h[i] = h[i] * Math.max(0, 1 - a * z[i] * z[i]) + a * gi;
      }

      if (arm.l3) {
        let u2sum = 0;
        for (let i = 0; i < D; i++) u2sum += u[i] * u[i];
        if (u2sum > 0.25) {
          const wRaw = new Float64Array(D), hRaw = new Float64Array(D);
          for (let i = 0; i < D; i++) {
            const qi = Q[i], ui = u[i], hi = h[i];
            for (let c = 0; c < D; c++) { wRaw[c] += qi[c] * ui; hRaw[c] += qi[c] * hi; }
          }
          const eta3 = arm.eta3;
          const Qnew = Q.map(row => new Float64Array(row));
          for (let j = 0; j < D; j++) {
            const uj = u[j], uj2 = uj * uj;
            if (Math.abs(uj) < 0.05) continue;
            for (let k = j + 1; k < D; k++) {
              const uk = u[k], uk2 = uk * uk;
              if (Math.abs(uk) < 0.05) continue;
              const om = clamp(eta3 * (alphas[j] - alphas[k]) * uj * uk / (u2sum + 0.1), -0.05, 0.05);
              if (om === 0) continue;
              const qj = Q[j], qk = Q[k], qnj = Qnew[j], qnk = Qnew[k];
              for (let c = 0; c < D; c++) { qnj[c] += om * qk[c]; qnk[c] -= om * qj[c]; }
            }
          }
          orthonormalize(Qnew);
          Q = Qnew;
          for (let i = 0; i < D; i++) {
            const qi = Q[i];
            let su = 0, sh = 0;
            for (let c = 0; c < D; c++) { su += qi[c] * wRaw[c]; sh += qi[c] * hRaw[c]; }
            u[i] = su; h[i] = sh;
          }
        }
      }
    }
  }
  return { mse: mseSum / nLate, acc: accSum / nLate };
}

const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006];
const CONFIGS = [
  { name: 'A_3x8_fast150_nF1', nBlocks: 3, B: 8, T: 16000, blockEvery: 2000, modeEvery: 160, driftEvery: 50, noiseStd: 1.0, nFast: 1 },
  { name: 'B_3x8_fast250_nF2', nBlocks: 3, B: 8, T: 16000, blockEvery: 2000, modeEvery: 250, driftEvery: 60, noiseStd: 1.0, nFast: 2 },
  { name: 'C_4x8_fast300_nF2', nBlocks: 4, B: 8, T: 16000, blockEvery: 2000, modeEvery: 300, driftEvery: 75, noiseStd: 1.0, nFast: 2 },
];

for (const cfg of CONFIGS) {
  console.log(`\n========== ${cfg.name} ==========`);
  const streams = SEEDS.map(s => generateStream(s, cfg));
  const ARMS = [
    { name: 'FIX_015', kind: 'fixed', alpha: 0.015 },
    { name: 'FIX_030', kind: 'fixed', alpha: 0.030 },
    { name: 'FIX_050', kind: 'fixed', alpha: 0.050 },
    { name: 'AUTO_015', kind: 'autostep', mu: 0.15 },
    { name: 'AUTO_025', kind: 'autostep', mu: 0.25 },
    { name: 'AUTO_040', kind: 'autostep', mu: 0.40 },
    { name: 'COVDW_005', kind: 'cov_dw', a0: 0.008, a1: 0.25, rho: 0.005, slowRho: 0.005 },
    { name: 'COVDW_02', kind: 'cov_dw', a0: 0.008, a1: 0.25, rho: 0.02, slowRho: 0.005 },
    { name: 'COVDW_08', kind: 'cov_dw', a0: 0.008, a1: 0.25, rho: 0.08, slowRho: 0.010 },
    { name: 'COVDW_20', kind: 'cov_dw', a0: 0.008, a1: 0.25, rho: 0.20, slowRho: 0.020 },
    { name: 'M3_L2U', kind: 'autostep', mu: 0.25, l3: 'l2u', eta3: 0.25 },
    { name: 'ORC_Q', kind: 'autostep', mu: 0.25, useOracleQ: true },
  ];
  const res = new Map();
  for (const arm of ARMS) {
    const rs = streams.map(st => evalArm(st, arm));
    res.set(arm.name, rs);
    console.log(`  ${arm.name.padEnd(11)} acc=${(mean(rs.map(r => r.acc)) * 100).toFixed(2)}%  mse=${mean(rs.map(r => r.mse)).toFixed(3)}`);
  }
  const bestFix = Math.max(...['FIX_015', 'FIX_030', 'FIX_050'].map(n => mean(res.get(n).map(r => r.acc))));
  const chalDiag = ['AUTO_015', 'AUTO_025', 'AUTO_040'];
  const chalAll = [...chalDiag, 'COVDW_005', 'COVDW_02', 'COVDW_08', 'COVDW_20'];
  const bestDiag = chalDiag.reduce((a, b) => mean(res.get(a).map(r => r.acc)) >= mean(res.get(b).map(r => r.acc)) ? a : b);
  const bestAll = chalAll.reduce((a, b) => mean(res.get(a).map(r => r.acc)) >= mean(res.get(b).map(r => r.acc)) ? a : b);
  console.log(`  Best FIXED=${(bestFix * 100).toFixed(2)}% | Best Diag=${bestDiag}(${(mean(res.get(bestDiag).map(r => r.acc)) * 100).toFixed(2)}%) | Best All=${bestAll}(${(mean(res.get(bestAll).map(r => r.acc)) * 100).toFixed(2)}%)`);
  for (const n of ['M3_L2U', 'ORC_Q']) {
    const a = mean(res.get(n).map(r => r.acc));
    const rDiag = (a - bestFix) / (mean(res.get(bestDiag).map(r => r.acc)) - bestFix);
    const rAll = (a - bestFix) / (mean(res.get(bestAll).map(r => r.acc)) - bestFix);
    console.log(`  ${n.padEnd(8)}: acc=${(a * 100).toFixed(2)}%  vsDiag=${rDiag.toFixed(2)}x  vsAll(incl COVDW)=${rAll.toFixed(2)}x`);
  }
}
