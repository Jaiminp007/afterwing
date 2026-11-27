import { mean } from '../../docs/paper/stats.mjs';

function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
function randn(r) { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }

function randOrtho(k, r) {
  const M = Array.from({ length: k }, () => Float64Array.from({ length: k }, () => randn(r)));
  for (let i = 0; i < k; i++) {
    for (let j = 0; j < i; j++) { let dot = 0; for (let c = 0; c < k; c++) dot += M[i][c] * M[j][c]; for (let c = 0; c < k; c++) M[i][c] -= dot * M[j][c]; }
    let norm = 0; for (let c = 0; c < k; c++) norm += M[i][c] * M[i][c]; norm = Math.sqrt(norm) || 1;
    for (let c = 0; c < k; c++) M[i][c] /= norm;
  }
  return M;
}
function makeBlockOrtho(nBlocks, B, r) {
  const D = nBlocks * B, Q = Array.from({ length: D }, () => new Float64Array(D));
  for (let b = 0; b < nBlocks; b++) { const Qb = randOrtho(B, r), off = b * B; for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) Q[off + i][off + j] = Qb[i][j]; }
  return Q;
}
function orthonormalize(Q) {
  const D = Q.length;
  for (let i = 0; i < D; i++) {
    const qi = Q[i];
    for (let j = 0; j < i; j++) { const qj = Q[j]; let dot = 0; for (let c = 0; c < D; c++) dot += qi[c] * qj[c]; for (let c = 0; c < D; c++) qi[c] -= dot * qj[c]; }
    let n2 = 0; for (let c = 0; c < D; c++) n2 += qi[c] * qi[c]; const inv = 1 / (Math.sqrt(n2) || 1);
    for (let c = 0; c < D; c++) qi[c] *= inv;
  }
}
function eye(D) { const Q = Array.from({ length: D }, () => new Float64Array(D)); for (let i = 0; i < D; i++) Q[i][i] = 1; return Q; }
function alignmentScore(Q, Qtrue) {
  const D = Q.length; let sum = 0;
  for (let i = 0; i < D; i++) { let best = 0; for (let j = 0; j < D; j++) { let d = 0; for (let c = 0; c < D; c++) d += Qtrue[i][c] * Q[j][c]; if (Math.abs(d) > best) best = Math.abs(d); } sum += best; }
  return sum / D;
}

function generateStream(seed) {
  const nBlocks = 2, B = 10, T = 20000, blockEvery = 3000, modeEvery = 700, driftEvery = 80, noiseStd = 1.0, nFast = 2;
  const r = rng32(mix(seed ^ 0xaaaaaaaa));
  const D = nBlocks * B;
  const Qtrue = makeBlockOrtho(nBlocks, B, r);
  const xs = new Array(T), ys = new Float64Array(T), vTrue = new Float64Array(T);
  let blk = Math.floor(r() * nBlocks), m0 = Math.floor(r() * B);
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
      blk = 1 - blk; m0 = Math.floor(r() * B); mFast = pickFast();
      c0 = (r() < 0.5 ? -1 : 1) * 2.5; cFast = mFast.map(() => (r() < 0.5 ? -1 : 1) * 2.5);
    } else if (t > 0 && t % modeEvery === 0) {
      mFast = pickFast(); cFast = mFast.map(() => (r() < 0.5 ? -1 : 1) * 2.5);
    } else if (t > 0 && t % driftEvery === 0) {
      const k = Math.floor(r() * nFast); cFast[k] = -cFast[k];
    }
    const q0 = Qtrue[blk * B + m0];
    const x = new Int8Array(D); let s = 0;
    for (let i = 0; i < D; i++) {
      x[i] = r() < 0.5 ? -1 : 1;
      let wi = c0 * q0[i];
      for (let k = 0; k < nFast; k++) wi += cFast[k] * Qtrue[blk * B + mFast[k]][i];
      s += wi * x[i];
    }
    xs[t] = x; vTrue[t] = s; ys[t] = s + noiseStd * randn(r);
  }
  return { D, T, xs, ys, vTrue, Qtrue };
}

function evalArm(st, arm) {
  const { D, T, xs, ys, vTrue, Qtrue } = st;
  const late = Math.floor(T / 2);
  let Q = arm.useOracleQ ? Qtrue.map(r => new Float64Array(r)) : eye(D);
  const u = new Float64Array(D), beta = new Float64Array(D).fill(-4.0), h = new Float64Array(D), v = new Float64Array(D).fill(0.1);
  const dTrace = new Float64Array(D); // EMA of L2's weight updates (1-sparse on every sign flip!)
  const z = new Float64Array(D), g = new Float64Array(D), alphas = new Float64Array(D);
  let mseSum = 0, accSum = 0, nLate = 0;
  for (let t = 0; t < T; t++) {
    // Simulate generation turnover every 500 bites!
    if (arm.genTurnover && t > 0 && t % 500 === 0) {
      u.fill(0); h.fill(0); dTrace.fill(0);
      if (arm.resetQ) Q = eye(D);
    }
    const x = xs[t], y = ys[t];
    let pred = 0;
    if (arm.kind === 'fixed') { for (let i = 0; i < D; i++) pred += u[i] * x[i]; }
    else {
      for (let i = 0; i < D; i++) { const qi = Q[i]; let s = 0; for (let c = 0; c < D; c++) s += qi[c] * x[c]; z[i] = s; pred += u[i] * s; }
    }
    if (t >= late) { mseSum += (pred - vTrue[t]) ** 2; if ((pred > 0) === (vTrue[t] > 0)) accSum++; nLate++; }
    const delta = clamp(y - pred, -12, 12);
    if (arm.kind === 'fixed') { for (let i = 0; i < D; i++) u[i] = clamp(u[i] + arm.alpha * delta * x[i], -12, 12); continue; }
    let sumEff = 0;
    for (let i = 0; i < D; i++) {
      const gi = delta * z[i]; g[i] = gi; const gh = gi * h[i];
      const a0 = Math.exp(beta[i]), agh = Math.abs(gh);
      v[i] = Math.max(agh, v[i] + (1 / 50) * a0 * (agh - v[i]));
      if (v[i] > 1e-12) beta[i] = clamp(beta[i] + arm.mu * (gh / v[i]), -6.5, -0.3);
      alphas[i] = Math.exp(beta[i]); sumEff += alphas[i] * z[i] * z[i];
    }
    const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
    for (let i = 0; i < D; i++) alphas[i] *= sc;
    for (let i = 0; i < D; i++) {
      const a = alphas[i], gi = g[i], du = a * gi;
      u[i] = clamp(u[i] + du, -12, 12);
      h[i] = h[i] * Math.max(0, 1 - a * z[i] * z[i]) + du;
      dTrace[i] = (arm.dLam ?? 0.92) * dTrace[i] + du;
    }
    if (arm.l3) {
      const src = arm.src === 'dTrace' ? dTrace : arm.src === 'h' ? h : u;
      let s2 = 0, bMin = Infinity, bMax = -Infinity;
      for (let i = 0; i < D; i++) { s2 += src[i] * src[i]; if (beta[i] < bMin) bMin = beta[i]; if (beta[i] > bMax) bMax = beta[i]; }
      const bRange = bMax - bMin;
      if (s2 > (arm.s2Min ?? 0.25) && bRange > 1e-4) {
        const wRaw = new Float64Array(D), hRaw = new Float64Array(D), dRaw = new Float64Array(D);
        for (let i = 0; i < D; i++) {
          const qi = Q[i], ui = u[i], hi = h[i], di = dTrace[i];
          for (let c = 0; c < D; c++) { wRaw[c] += qi[c] * ui; hRaw[c] += qi[c] * hi; dRaw[c] += qi[c] * di; }
        }
        const Qnew = Q.map(row => new Float64Array(row));
        const invS2 = 1 / (s2 + 0.05), invS4 = 1 / (s2 * s2 + 0.02);
        const invB = 1 / (bRange + 0.5);
        for (let j = 0; j < D; j++) {
          const sj = src[j], sj2 = sj * sj;
          if (Math.abs(sj) < 0.02) continue;
          for (let k = j + 1; k < D; k++) {
            const sk = src[k], sk2 = sk * sk;
            if (Math.abs(sk) < 0.02) continue;
            const db = (beta[j] - beta[k]) * invB;
            if (Math.abs(db) < 1e-5) continue;
            let om = 0;
            if (arm.l3 === 'norm_ica') {
              om = clamp(arm.eta3 * Math.abs(db) * sj * sk * (sj2 - sk2) * invS4, -0.04, 0.04);
            } else if (arm.l3 === 'norm_dir') {
              om = clamp(arm.eta3 * db * sj * sk * invS2, -0.04, 0.04);
            }
            if (om === 0) continue;
            const qj = Q[j], qk = Q[k], qnj = Qnew[j], qnk = Qnew[k];
            for (let c = 0; c < D; c++) { qnj[c] += om * qk[c]; qnk[c] -= om * qj[c]; }
          }
        }
        orthonormalize(Qnew);
        Q = Qnew;
        for (let i = 0; i < D; i++) {
          const qi = Q[i]; let su = 0, sh = 0, sd = 0;
          for (let c = 0; c < D; c++) { su += qi[c] * wRaw[c]; sh += qi[c] * hRaw[c]; sd += qi[c] * dRaw[c]; }
          u[i] = su; h[i] = sh; dTrace[i] = sd;
        }
      }
    }
  }
  return { mse: mseSum / nLate, acc: accSum / nLate, align: alignmentScore(Q, Qtrue) };
}

const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006];
const streams = SEEDS.map(s => generateStream(s));
const ARMS = [
  { name: 'FIX_050', kind: 'fixed', alpha: 0.050, genTurnover: true },
  { name: 'AUTO_020', kind: 'auto', mu: 0.20, genTurnover: true },
  { name: 'DT_ICA_02', kind: 'auto', mu: 0.20, l3: 'norm_ica', src: 'dTrace', eta3: 0.02, s2Min: 0.3, genTurnover: true },
  { name: 'DT_ICA_06', kind: 'auto', mu: 0.20, l3: 'norm_ica', src: 'dTrace', eta3: 0.06, s2Min: 0.3, genTurnover: true },
  { name: 'DT_ICA_15', kind: 'auto', mu: 0.20, l3: 'norm_ica', src: 'dTrace', eta3: 0.15, s2Min: 0.3, genTurnover: true },
  { name: 'DT_ICA_RST', kind: 'auto', mu: 0.20, l3: 'norm_ica', src: 'dTrace', eta3: 0.06, s2Min: 0.3, genTurnover: true, resetQ: true },
  { name: 'DT_DIR_03', kind: 'auto', mu: 0.20, l3: 'norm_dir', src: 'dTrace', eta3: 0.03, s2Min: 0.3, genTurnover: true },
  { name: 'DT_DIR_10', kind: 'auto', mu: 0.20, l3: 'norm_dir', src: 'dTrace', eta3: 0.10, s2Min: 0.3, genTurnover: true },
  { name: 'DT_DIR_RST', kind: 'auto', mu: 0.20, l3: 'norm_dir', src: 'dTrace', eta3: 0.03, s2Min: 0.3, genTurnover: true, resetQ: true },
  { name: 'U_ICA_06', kind: 'auto', mu: 0.20, l3: 'norm_ica', src: 'u', eta3: 0.06, s2Min: 2.0, genTurnover: true },
  { name: 'ORC_Q', kind: 'auto', mu: 0.20, useOracleQ: true, genTurnover: true },
];
console.log('=== Exp 13: Testing 1-Sparse L2-Update-Trace (dTrace) Frame Learning (genTurnover=500) ===');
for (const arm of ARMS) {
  const rs = streams.map(st => evalArm(st, arm));
  console.log(`  ${arm.name.padEnd(11)} acc=${(mean(rs.map(r => r.acc)) * 100).toFixed(2)}%  mse=${mean(rs.map(r => r.mse)).toFixed(3)}  align=${mean(rs.map(r => r.align)).toFixed(3)}`);
}
