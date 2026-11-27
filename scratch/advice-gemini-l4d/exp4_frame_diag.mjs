import { mean, signflip } from '../../docs/paper/stats.mjs';

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

// Random orthogonal k x k matrix via QR (Gram-Schmidt) on Gaussian matrix
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

// Block-orthogonal D x D matrix: nBlocks blocks of size B (D = nBlocks * B)
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

// Orthonormalize rows of Q in-place (modified Gram-Schmidt)
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

function generateFrameStream(seed, { nBlocks = 4, B = 6, T = 10000, blockEvery = 1500, modeEvery = 300, driftEvery = 25, noiseStd = 1.0 }) {
  const r = rng32(mix(seed ^ 0x77777777));
  const D = nBlocks * B;
  const Qtrue = makeBlockOrtho(nBlocks, B, r);
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
  return { D, T, xs, ys, vTrue, Qtrue };
}

function evalFrameArm(st, arm) {
  const { D, T, xs, ys, vTrue, Qtrue } = st;
  const late = Math.floor(T / 2);
  let Q = arm.useOracleQ ? Qtrue.map(row => new Float64Array(row)) : eye(D);
  const u = new Float64Array(D);
  const beta = new Float64Array(D).fill(arm.betaInit ?? -4.5);
  const h = new Float64Array(D);
  const v = new Float64Array(D).fill(0.1);
  const e = new Float64Array(D); // gradient trace for Lie-algebra L3
  const z = new Float64Array(D);
  const g = new Float64Array(D);
  const alphas = new Float64Array(D);

  // For matrix_idbd challenger: symmetric D x D step-size matrix A = A0 + sym update
  let A = null, Hmat = null;
  if (arm.kind === 'matrix_idbd') {
    A = eye(D);
    for (let i = 0; i < D; i++) A[i][i] = arm.aInit ?? 0.015;
    Hmat = Array.from({ length: D }, () => new Float64Array(D));
  }
  // For full_rms (Shampoo/AdaGrad-like) challenger
  let Gcov = null;
  if (arm.kind === 'full_rms') {
    Gcov = eye(D);
    for (let i = 0; i < D; i++) Gcov[i][i] = 1.0;
  }

  let mseSum = 0, accSum = 0, nLate = 0;
  const bMin = arm.bMin ?? -6.5, bMax = -0.3;

  for (let t = 0; t < T; t++) {
    const x = xs[t], y = ys[t];
    // z = Q x
    let pred = 0;
    if (arm.kind === 'fixed' || arm.kind === 'matrix_idbd') {
      for (let i = 0; i < D; i++) { z[i] = x[i]; pred += u[i] * x[i]; }
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
    } else if (arm.kind === 'direct_oracle_q') {
      // Uses ORACLE Q directly with constant alpha (no L2) -> mathematically identical to FIXED!
      const a = arm.alpha;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + a * delta * z[i], -12, 12);
    } else if (arm.kind === 'matrix_idbd') {
      // Single-level full-matrix step-size learner (honest normalized Matrix-IDBD)
      for (let i = 0; i < D; i++) g[i] = delta * x[i];
      const th = arm.theta;
      let gnorm = 0, enorm = 0;
      for (let i = 0; i < D; i++) { gnorm += g[i] * g[i]; enorm += e[i] * e[i]; }
      const denom = Math.sqrt(gnorm * enorm) + 1e-4;
      for (let i = 0; i < D; i++) {
        const gi = g[i], Ai = A[i];
        for (let j = 0; j < D; j++) {
          Ai[j] = (1 - (arm.aDecay ?? 0.002)) * Ai[j] + th * 0.5 * (gi * e[j] + g[j] * e[i]) / denom;
        }
        Ai[i] = clamp(Ai[i], 1e-4, 0.5);
      }
      // Cap spectral/row-sum norm so A stays strictly stable
      let maxRow = 0;
      for (let i = 0; i < D; i++) {
        let rs = 0;
        for (let j = 0; j < D; j++) rs += Math.abs(A[i][j]);
        if (rs > maxRow) maxRow = rs;
      }
      if (maxRow > 0.6) {
        const sc = 0.6 / maxRow;
        for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) A[i][j] *= sc;
      }
      for (let i = 0; i < D; i++) {
        let dw = 0;
        const Ai = A[i];
        for (let j = 0; j < D; j++) dw += Ai[j] * g[j];
        u[i] = clamp(u[i] + dw, -12, 12);
      }
      const lam = arm.lam ?? 0.80;
      for (let i = 0; i < D; i++) e[i] = lam * e[i] + g[i];
    } else if (arm.kind === 'idbd' || arm.kind === 'autostep' || arm.kind === 'meta3') {
      const tau = arm.tau ?? 50;
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * z[i];
        g[i] = gi;
        const gh = gi * h[i];
        if (arm.l2 === 'idbd') {
          beta[i] = clamp(beta[i] + arm.mu * gh, bMin, bMax);
        } else {
          const a0 = Math.exp(beta[i]), agh = Math.abs(gh);
          v[i] = Math.max(agh, v[i] + (1 / tau) * a0 * (agh - v[i]));
          if (v[i] > 1e-12) beta[i] = clamp(beta[i] + arm.mu * (gh / v[i]), bMin, bMax);
        }
        alphas[i] = Math.exp(beta[i]);
        sumEff += alphas[i] * z[i] * z[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) {
        alphas[i] = alphas[i] * sc;
      }

      // L3: Lie-algebra hypergradient update of orthogonal frame Q!
      // Exact derivative: d(-L_t)/dOmega_{jk} = (alpha_j - alpha_k) * (g_j * e_k + g_k * e_j)
      if (arm.kind === 'meta3') {
        const eta3 = arm.eta3;
        // Save raw-space vectors w = Q^T u, hw = Q^T h, ew = Q^T e for exact basis-change invariance
        const wRaw = new Float64Array(D), hRaw = new Float64Array(D), eRaw = new Float64Array(D);
        for (let i = 0; i < D; i++) {
          const qi = Q[i], ui = u[i], hi = h[i], ei = e[i];
          for (let c = 0; c < D; c++) {
            wRaw[c] += qi[c] * ui;
            hRaw[c] += qi[c] * hi;
            eRaw[c] += qi[c] * ei;
          }
        }
        const Qnew = Q.map(row => new Float64Array(row));
        for (let j = 0; j < D; j++) {
          for (let k = j + 1; k < D; k++) {
            const da = alphas[j] - alphas[k];
            if (Math.abs(da) < 1e-4) continue;
            const om = clamp(eta3 * da * (g[j] * e[k] + g[k] * e[j]), -0.04, 0.04);
            if (om === 0) continue;
            const qj = Q[j], qk = Q[k], qnj = Qnew[j], qnk = Qnew[k];
            for (let c = 0; c < D; c++) {
              qnj[c] += om * qk[c];
              qnk[c] -= om * qj[c];
            }
          }
        }
        orthonormalize(Qnew);
        Q = Qnew;
        // Project raw vectors into Qnew: u = Qnew wRaw (keeps predictions 100% invariant!)
        for (let i = 0; i < D; i++) {
          const qi = Q[i];
          let su = 0, sh = 0, se = 0;
          for (let c = 0; c < D; c++) { su += qi[c] * wRaw[c]; sh += qi[c] * hRaw[c]; se += qi[c] * eRaw[c]; }
          u[i] = su; h[i] = sh; e[i] = se;
        }
      }

      // L1 weight update and L2 trace update
      for (let i = 0; i < D; i++) {
        const a = alphas[i], gi = g[i];
        u[i] = clamp(u[i] + a * gi, -12, 12);
        h[i] = h[i] * Math.max(0, 1 - a * z[i] * z[i]) + a * gi;
        e[i] = (arm.eLam ?? 0.85) * e[i] + gi;
      }
    }
  }
  return { mse: mseSum / nLate, acc: accSum / nLate };
}

const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006];
const cfg = { nBlocks: 4, B: 6, T: 15000, blockEvery: 2500, modeEvery: 600, driftEvery: 100, noiseStd: 1.0 };
const streams = SEEDS.map(s => generateFrameStream(s, cfg));

const ARMS = [
  { name: 'FIX_005', kind: 'fixed', alpha: 0.005 },
  { name: 'FIX_015', kind: 'fixed', alpha: 0.015 },
  { name: 'FIX_030', kind: 'fixed', alpha: 0.030 },
  { name: 'FIX_060', kind: 'fixed', alpha: 0.060 },
  { name: 'DIR_ORCQ_030', kind: 'direct_oracle_q', useOracleQ: true, alpha: 0.030 },
  { name: 'AUTO_005', kind: 'autostep', mu: 0.05 },
  { name: 'AUTO_012', kind: 'autostep', mu: 0.12 },
  { name: 'AUTO_025', kind: 'autostep', mu: 0.25 },
  { name: 'IDBD_010', kind: 'idbd', l2: 'idbd', mu: 0.01 },
  { name: 'IDBD_030', kind: 'idbd', l2: 'idbd', mu: 0.03 },
  { name: 'MAT_IDBD_002', kind: 'matrix_idbd', theta: 0.002, lam: 0.80, aDecay: 0.002 },
  { name: 'MAT_IDBD_008', kind: 'matrix_idbd', theta: 0.008, lam: 0.80, aDecay: 0.005 },
  { name: 'MAT_IDBD_020', kind: 'matrix_idbd', theta: 0.020, lam: 0.80, aDecay: 0.010 },
  { name: 'META3_002', kind: 'meta3', mu: 0.12, eta3: 0.002, eLam: 0.80 },
  { name: 'META3_010', kind: 'meta3', mu: 0.12, eta3: 0.010, eLam: 0.80 },
  { name: 'META3_030', kind: 'meta3', mu: 0.12, eta3: 0.030, eLam: 0.80 },
  { name: 'ORC_Q_AUTO12', kind: 'autostep', useOracleQ: true, mu: 0.12 },
  { name: 'ORC_Q_AUTO25', kind: 'autostep', useOracleQ: true, mu: 0.25 },
];

console.log(`=== Exp 4: Orthogonal Frame L3 Diagnostic (D=${cfg.nBlocks * cfg.B}, ${cfg.nBlocks}x${cfg.B} blocks, T=${cfg.T}) ===`);
const res = new Map();
for (const arm of ARMS) {
  const rs = streams.map(st => evalFrameArm(st, arm));
  res.set(arm.name, rs);
  console.log(`  ${arm.name.padEnd(14)} acc=${(mean(rs.map(r => r.acc)) * 100).toFixed(2)}%  mse=${mean(rs.map(r => r.mse)).toFixed(3)}`);
}
const bestFix = Math.max(...ARMS.filter(a => a.kind === 'fixed').map(a => mean(res.get(a.name).map(r => r.acc))));
const bestFixMse = Math.min(...ARMS.filter(a => a.kind === 'fixed').map(a => mean(res.get(a.name).map(r => r.mse))));
const l2s = ARMS.filter(a => ['autostep', 'idbd', 'matrix_idbd', 'direct_oracle_q'].includes(a.kind) && !a.name.startsWith('ORC_'));
const bestL2 = l2s.reduce((a, b) => mean(res.get(a.name).map(r => r.acc)) >= mean(res.get(b.name).map(r => r.acc)) ? a : b);
const bestL2Mse = l2s.reduce((a, b) => mean(res.get(a.name).map(r => r.mse)) <= mean(res.get(b.name).map(r => r.mse)) ? a : b);
console.log(`\nBest FIXED: acc=${(bestFix * 100).toFixed(2)}%, mse=${bestFixMse.toFixed(3)}`);
console.log(`Best L2 (incl MAT_IDBD): ${bestL2.name} acc=${(mean(res.get(bestL2.name).map(r => r.acc)) * 100).toFixed(2)}%, ${bestL2Mse.name} mse=${mean(res.get(bestL2Mse.name).map(r => r.mse)).toFixed(3)}`);
for (const name of ['META3_002', 'META3_010', 'META3_030', 'ORC_Q_AUTO12', 'ORC_Q_AUTO25']) {
  const oAcc = mean(res.get(name).map(r => r.acc));
  const oMse = mean(res.get(name).map(r => r.mse));
  const rAcc = (oAcc - bestFix) / (mean(res.get(bestL2.name).map(r => r.acc)) - bestFix);
  const rMse = (bestFixMse - oMse) / (bestFixMse - mean(res.get(bestL2Mse.name).map(r => r.mse)));
  console.log(`  ${name.padEnd(14)} vs ${bestL2.name.padEnd(12)}: accRatio=${rAcc.toFixed(2)}x  mseRatio=${rMse.toFixed(2)}x`);
}
