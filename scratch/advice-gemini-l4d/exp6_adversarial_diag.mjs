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

function generateFrameStream(seed, { nBlocks = 4, B = 6, T = 16000, blockEvery = 1600, modeEvery = 250, driftEvery = 60, noiseStd = 1.0 }) {
  const r = rng32(mix(seed ^ 0x77777777));
  const D = nBlocks * B;
  const Qtrue = makeBlockOrtho(nBlocks, B, r);
  const Qsham = randOrtho(D, r);
  const xs = new Array(T), ys = new Float64Array(T), vTrue = new Float64Array(T);
  let blk = Math.floor(r() * nBlocks);
  let mode = Math.floor(r() * B);
  let coeff = (r() < 0.5 ? -1 : 1) * 2.5;

  for (let t = 0; t < T; t++) {
    if (t > 0 && t % blockEvery === 0) {
      const others = Array.from({ length: nBlocks }, (_, i) => i).filter(i => i !== blk);
      blk = others[Math.floor(r() * others.length)];
      mode = Math.floor(r() * B);
      coeff = (r() < 0.5 ? -1 : 1) * 2.5;
    } else if (t > 0 && t % modeEvery === 0) {
      const others = Array.from({ length: B }, (_, i) => i).filter(i => i !== mode);
      mode = others[Math.floor(r() * others.length)];
      coeff = (r() < 0.5 ? -1 : 1) * 2.5;
    } else if (t > 0 && t % driftEvery === 0) {
      coeff = -coeff;
    }
    const q = Qtrue[blk * B + mode];
    const x = new Int8Array(D);
    let s = 0;
    for (let i = 0; i < D; i++) {
      x[i] = r() < 0.5 ? -1 : 1;
      s += coeff * q[i] * x[i];
    }
    xs[t] = x;
    vTrue[t] = s;
    ys[t] = s + noiseStd * randn(r);
  }
  return { D, T, xs, ys, vTrue, Qtrue, Qsham };
}

function evalArm(st, arm) {
  const { D, T, xs, ys, vTrue, Qtrue, Qsham } = st;
  const late = Math.floor(T / 2);
  let Q = arm.useOracleQ ? Qtrue.map(row => new Float64Array(row)) : arm.useShamQ ? Qsham.map(row => new Float64Array(row)) : eye(D);
  const u = new Float64Array(D);
  const beta = new Float64Array(D).fill(arm.betaInit ?? -4.5);
  const h = new Float64Array(D);
  const v = new Float64Array(D).fill(0.1);
  const e = new Float64Array(D);
  const z = new Float64Array(D);
  const g = new Float64Array(D);
  const alphas = new Float64Array(D);
  // For cov_w challenger: EMA of w w^T (or e e^T)
  const C = Array.from({ length: D }, () => new Float64Array(D));
  for (let i = 0; i < D; i++) C[i][i] = 1 / D;

  let mseSum = 0, accSum = 0, nLate = 0;
  const bMin = arm.bMin ?? -6.5, bMax = -0.3;

  for (let t = 0; t < T; t++) {
    // Mimic generation turnover: every 400 bites, L1 weights reset to 0 (newborn fly), L2/L3 inherited!
    if (arm.genTurnover && t > 0 && t % 400 === 0) {
      u.fill(0);
      h.fill(0);
      e.fill(0);
      if (arm.resetQ) Q = eye(D);
    }

    const x = xs[t], y = ys[t];
    let pred = 0;
    if (arm.kind === 'fixed' || arm.kind === 'cov_w' || arm.kind === 'rank1_e') {
      for (let i = 0; i < D; i++) pred += u[i] * x[i];
    } else if (arm.kind === 'direct_q_rawl2') {
      // Computes raw-space weights u directly; prediction is u . x
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
    } else if (arm.kind === 'cov_w') {
      // Single-level covariance preconditioner: A = a0*I + a1 * C / tr(C), where C = EMA(u u^T)
      for (let i = 0; i < D; i++) g[i] = delta * x[i];
      let tr = 0;
      for (let i = 0; i < D; i++) tr += C[i][i];
      const invTr = 1 / (tr + 1e-4);
      // Compute A g = a0*g + a1*(C g)/tr
      let eff = 0;
      const ag = new Float64Array(D);
      for (let i = 0; i < D; i++) {
        let cg = 0;
        const Ci = C[i];
        for (let j = 0; j < D; j++) cg += Ci[j] * g[j];
        ag[i] = arm.a0 * g[i] + arm.a1 * cg * invTr;
        eff += ag[i] * x[i]; // delta * x^T A x
      }
      // Cap step size if x^T A x > 0.9
      const effStep = Math.abs(delta) > 1e-6 ? eff / delta : 0;
      const sc = effStep > 0.9 ? 0.9 / effStep : 1.0;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + sc * ag[i], -12, 12);
      // Update C = (1 - rho) C + rho u u^T
      const rho = arm.rho;
      let u2 = 0;
      for (let i = 0; i < D; i++) u2 += u[i] * u[i];
      if (u2 > 0.05) {
        const invU2 = 1 / u2;
        for (let i = 0; i < D; i++) {
          const Ci = C[i], ui = u[i];
          for (let j = 0; j < D; j++) Ci[j] = (1 - rho) * Ci[j] + rho * ui * u[j] * invU2;
        }
      }
    } else if (arm.kind === 'rank1_e') {
      // Single-level rank-1 gradient-trace preconditioner: A = a0*I + a1 * (e e^T)/(||e||^2 + eps)
      for (let i = 0; i < D; i++) g[i] = delta * x[i];
      let e2 = 0, eg = 0;
      for (let i = 0; i < D; i++) { e2 += e[i] * e[i]; eg += e[i] * g[i]; }
      const c1 = arm.a1 * eg / (e2 + 0.5);
      // effective step: x^T A x = a0*D + a1*(e.x)^2/(e2+0.5)
      let ex = 0;
      for (let i = 0; i < D; i++) ex += e[i] * x[i];
      const effStep = arm.a0 * D + arm.a1 * (ex * ex) / (e2 + 0.5);
      const sc = effStep > 0.9 ? 0.9 / effStep : 1.0;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + sc * (arm.a0 * g[i] + c1 * e[i]), -12, 12);
      for (let i = 0; i < D; i++) e[i] = arm.lam * e[i] + g[i];
    } else if (arm.kind === 'direct_q_rawl2') {
      // Raw-coordinate Autostep learns alpha_raw, then DIRECT applies A = Qtrue^T diag(alpha_raw) Qtrue
      const tau = 50;
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * x[i];
        g[i] = gi;
        const gh = gi * h[i];
        const a0 = Math.exp(beta[i]), agh = Math.abs(gh);
        v[i] = Math.max(agh, v[i] + (1 / tau) * a0 * (agh - v[i]));
        if (v[i] > 1e-12) beta[i] = clamp(beta[i] + arm.mu * (gh / v[i]), bMin, bMax);
        alphas[i] = Math.exp(beta[i]);
        sumEff += alphas[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) alphas[i] *= sc;
      // Apply Q^T diag(alphas) Q g
      const qg = new Float64Array(D);
      for (let i = 0; i < D; i++) {
        let s = 0; const qi = Qtrue[i];
        for (let c = 0; c < D; c++) s += qi[c] * g[c];
        qg[i] = alphas[i] * s;
      }
      for (let c = 0; c < D; c++) {
        let dw = 0;
        for (let i = 0; i < D; i++) dw += Qtrue[i][c] * qg[i];
        u[c] = clamp(u[c] + dw, -12, 12);
        h[c] = h[c] * Math.max(0, 1 - alphas[c]) + alphas[c] * g[c];
      }
    } else {
      // Autostep in frame Q (L2 without L3 has Q=I; META3 learns Q; ORC_Q has Q=Qtrue; SHAM has Q=Qsham)
      const tau = arm.tau ?? 50;
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
              const om = arm.l3 === 'l2u'
                ? clamp(eta3 * (alphas[j] - alphas[k]) * uj * uk / (u2sum + 0.1), -0.05, 0.05)
                : clamp(eta3 * (alphas[j] * uj2 - alphas[k] * uk2) * uj * uk / (u2sum * u2sum + 0.1), -0.05, 0.05);
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
const cfg = { nBlocks: 4, B: 6, T: 16000, blockEvery: 1600, modeEvery: 250, driftEvery: 60, noiseStd: 1.0 };
const streams = SEEDS.map(s => generateFrameStream(s, cfg));

const ARMS = [
  { name: 'FIX_015', kind: 'fixed', alpha: 0.015, genTurnover: true },
  { name: 'FIX_030', kind: 'fixed', alpha: 0.030, genTurnover: true },
  { name: 'FIX_060', kind: 'fixed', alpha: 0.060, genTurnover: true },
  { name: 'AUTO_015', kind: 'autostep', mu: 0.15, genTurnover: true },
  { name: 'AUTO_025', kind: 'autostep', mu: 0.25, genTurnover: true },
  { name: 'AUTO_040', kind: 'autostep', mu: 0.40, genTurnover: true },
  { name: 'DIR_Q_RAWL2', kind: 'direct_q_rawl2', mu: 0.25, genTurnover: true },
  { name: 'COVW_005', kind: 'cov_w', a0: 0.005, a1: 0.30, rho: 0.005, genTurnover: true },
  { name: 'COVW_020', kind: 'cov_w', a0: 0.005, a1: 0.30, rho: 0.020, genTurnover: true },
  { name: 'COVW_080', kind: 'cov_w', a0: 0.005, a1: 0.30, rho: 0.080, genTurnover: true },
  { name: 'COVW_200', kind: 'cov_w', a0: 0.005, a1: 0.30, rho: 0.200, genTurnover: true },
  { name: 'RANK1E_60', kind: 'rank1_e', a0: 0.008, a1: 0.25, lam: 0.60, genTurnover: true },
  { name: 'RANK1E_85', kind: 'rank1_e', a0: 0.008, a1: 0.25, lam: 0.85, genTurnover: true },
  { name: 'RANK1E_95', kind: 'rank1_e', a0: 0.008, a1: 0.25, lam: 0.95, genTurnover: true },
  { name: 'SHAM_Q', kind: 'autostep', mu: 0.25, useShamQ: true, genTurnover: true },
  { name: 'M3_L2U_20', kind: 'autostep', mu: 0.25, l3: 'l2u', eta3: 0.20, genTurnover: true },
  { name: 'M3_HYB_30', kind: 'autostep', mu: 0.25, l3: 'hyb', eta3: 0.30, genTurnover: true },
  { name: 'M3_RESET', kind: 'autostep', mu: 0.25, l3: 'hyb', eta3: 0.30, genTurnover: true, resetQ: true },
  { name: 'ORC_Q', kind: 'autostep', mu: 0.25, useOracleQ: true, genTurnover: true },
];

console.log(`=== Exp 6: Ruthless Adversarial Challenge (incl COV_W, RANK1_E, DIR_Q_RAWL2, genTurnover=400) ===`);
const res = new Map();
for (const arm of ARMS) {
  const rs = streams.map(st => evalArm(st, arm));
  res.set(arm.name, rs);
  console.log(`  ${arm.name.padEnd(13)} acc=${(mean(rs.map(r => r.acc)) * 100).toFixed(2)}%  mse=${mean(rs.map(r => r.mse)).toFixed(3)}`);
}
const bestFix = Math.max(...['FIX_015', 'FIX_030', 'FIX_060'].map(n => mean(res.get(n).map(r => r.acc))));
const chalNames = ['AUTO_015', 'AUTO_025', 'AUTO_040', 'DIR_Q_RAWL2', 'COVW_005', 'COVW_020', 'COVW_080', 'COVW_200', 'RANK1E_60', 'RANK1E_85', 'RANK1E_95'];
const bestChalName = chalNames.reduce((a, b) => mean(res.get(a).map(r => r.acc)) >= mean(res.get(b).map(r => r.acc)) ? a : b);
const bestChal = mean(res.get(bestChalName).map(r => r.acc));
console.log(`\nBest FIXED: ${(bestFix * 100).toFixed(2)}%, Best Challenger: ${bestChalName} (${(bestChal * 100).toFixed(2)}%, gain +${((bestChal - bestFix) * 100).toFixed(2)}%)`);
for (const n of ['SHAM_Q', 'M3_RESET', 'M3_L2U_20', 'M3_HYB_30', 'ORC_Q']) {
  const a = mean(res.get(n).map(r => r.acc));
  console.log(`  ${n.padEnd(13)}: acc=${(a * 100).toFixed(2)}%  gain=+${((a - bestFix) * 100).toFixed(2)}%  ratio=${((a - bestFix) / (bestChal - bestFix)).toFixed(2)}x`);
}
