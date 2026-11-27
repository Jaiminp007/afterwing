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

// Match exact ecology bite-timescales: ~6000 lineage bites over 20000 ticks,
// genTurnover every ~150 bites, blockEvery ~1200 bites, modeEvery ~360 bites, driftEvery ~65 bites!
function generateStream(seed, nBlocks = 2, B = 8, nFast = 2) {
  const T = 6000, blockEvery = 1200, modeEvery = 360, driftEvery = 65, noiseStd = 1.0;
  const r = rng32(mix(seed ^ 0xbbbbbbbb));
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
  const u = new Float64Array(D), uSlow = new Float64Array(D), beta = new Float64Array(D).fill(-4.0), h = new Float64Array(D), v = new Float64Array(D).fill(0.1);
  const z = new Float64Array(D), g = new Float64Array(D), alphas = new Float64Array(D), du = new Float64Array(D);
  let mseSum = 0, accSum = 0, nLate = 0, flyBites = 0;
  for (let t = 0; t < T; t++) {
    if (t > 0 && t % 150 === 0) { // realistic ~150-bite fly lifetime!
      u.fill(0); uSlow.fill(0); h.fill(0); flyBites = 0;
      if (arm.resetQ) Q = eye(D);
    }
    const x = xs[t], y = ys[t];
    let pred = 0;
    if (arm.kind === 'fixed') { for (let i = 0; i < D; i++) pred += u[i] * x[i]; }
    else { for (let i = 0; i < D; i++) { const qi = Q[i]; let s = 0; for (let c = 0; c < D; c++) s += qi[c] * x[c]; z[i] = s; pred += u[i] * s; } }
    if (t >= late) { mseSum += (pred - vTrue[t]) ** 2; if ((pred > 0) === (vTrue[t] > 0)) accSum++; nLate++; }
    const delta = clamp(y - pred, -12, 12);
    flyBites++;
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
      const a = alphas[i], gi = g[i];
      u[i] = clamp(u[i] + a * gi, -12, 12);
      h[i] = h[i] * Math.max(0, 1 - a * z[i] * z[i]) + a * gi;
      if (flyBites === 1) uSlow[i] = u[i];
      else uSlow[i] = (1 - (arm.slowRho ?? 0.04)) * uSlow[i] + (arm.slowRho ?? 0.04) * u[i];
      du[i] = u[i] - uSlow[i];
    }
    if (arm.l3 && flyBites >= (arm.warmup ?? 35)) {
      const src = arm.src === 'du' ? du : u;
      let s2 = 0, aMax = 0, aMin = Infinity;
      for (let i = 0; i < D; i++) { s2 += src[i] * src[i]; if (alphas[i] > aMax) aMax = alphas[i]; if (alphas[i] < aMin) aMin = alphas[i]; }
      const aSpread = aMax - aMin;
      if (s2 > (arm.s2Min ?? 1.0) && aSpread > 1e-5) {
        const wRaw = new Float64Array(D), sRaw = new Float64Array(D), hRaw = new Float64Array(D);
        for (let i = 0; i < D; i++) {
          const qi = Q[i], ui = u[i], usi = uSlow[i], hi = h[i];
          for (let c = 0; c < D; c++) { wRaw[c] += qi[c] * ui; sRaw[c] += qi[c] * usi; hRaw[c] += qi[c] * hi; }
        }
        const Qnew = Q.map(row => new Float64Array(row));
        const thresh = (arm.relThresh ?? 0.15) * Math.sqrt(s2);
        const invS2 = 1 / (s2 + 0.1), invS4 = 1 / (s2 * s2 + 0.05);
        for (let j = 0; j < D; j++) {
          const sj = src[j];
          if (Math.abs(sj) < thresh) continue;
          const sj2 = sj * sj, aj = alphas[j];
          for (let k = j + 1; k < D; k++) {
            const sk = src[k];
            if (Math.abs(sk) < thresh) continue;
            const da = aj - alphas[k];
            if (Math.abs(da) < 1e-5) continue;
            let om = 0;
            if (arm.l3 === 'du_ica') {
              om = clamp(arm.eta3 * (Math.abs(da) / aSpread) * sj * sk * (sj2 - sk * sk) * invS4, -0.05, 0.05);
            } else if (arm.l3 === 'jacobi_ica') {
              // Exact scale-invariant pairwise Jacobi kurtosis gradient: sin(4*phi)/4 in [-0.25, +0.25]
              // Strictly gated by L2's |alpha_j - alpha_k| / aSpread (0 when L2 is off!)
              const r2 = sj2 + sk * sk;
              const sin4 = sj * sk * (sj2 - sk * sk) / (r2 * r2 + 1e-6);
              om = clamp(arm.eta3 * (Math.abs(da) / aSpread) * sin4, -0.04, 0.04);
            } else if (arm.l3 === 'jacobi_dir') {
              // Pairwise alignment gated by signed (alpha_j - alpha_k)/aSpread: sin(2*phi)/2
              const r2 = sj2 + sk * sk;
              const sin2 = sj * sk / (r2 + 1e-6);
              om = clamp(arm.eta3 * (da / aSpread) * sin2, -0.04, 0.04);
            } else if (arm.l3 === 'du_dir') {
              om = clamp(arm.eta3 * (da / aSpread) * sj * sk * invS2, -0.05, 0.05);
            } else if (arm.l3 === 'l2u_thr') {
              om = clamp(arm.eta3 * da * sj * sk * invS2, -0.05, 0.05);
            }
            if (om === 0) continue;
            const qj = Q[j], qk = Q[k], qnj = Qnew[j], qnk = Qnew[k];
            for (let c = 0; c < D; c++) { qnj[c] += om * qk[c]; qnk[c] -= om * qj[c]; }
          }
        }
        orthonormalize(Qnew);
        Q = Qnew;
        for (let i = 0; i < D; i++) {
          const qi = Q[i]; let su = 0, ss = 0, sh = 0;
          for (let c = 0; c < D; c++) { su += qi[c] * wRaw[c]; ss += qi[c] * sRaw[c]; sh += qi[c] * hRaw[c]; }
          u[i] = su; uSlow[i] = ss; h[i] = sh;
        }
      }
    }
  }
  return { mse: mseSum / nLate, acc: accSum / nLate, align: alignmentScore(Q, Qtrue) };
}

const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006];
for (const [nBlocks, B, nFast] of [[2, 8, 2], [2, 8, 1], [2, 6, 1]]) {
  console.log(`\n=== Exp 15: ${nBlocks}x${B} (D=${nBlocks * B}, nFast=${nFast}, T=6000 bites, gen=150) ===`);
  const streams = SEEDS.map(s => generateStream(s, nBlocks, B, nFast));
  const ARMS = [
    { name: 'FIX_050', kind: 'fixed', alpha: 0.050 },
    { name: 'AUTO_020', kind: 'auto', mu: 0.20 },
    { name: 'DU_ICA_15', kind: 'auto', mu: 0.20, l3: 'du_ica', src: 'du', eta3: 0.15, warmup: 35, relThresh: 0.15 },
    { name: 'DU_ICA_30', kind: 'auto', mu: 0.20, l3: 'du_ica', src: 'du', eta3: 0.30, warmup: 35, relThresh: 0.15 },
    { name: 'DU_ICA_RST', kind: 'auto', mu: 0.20, l3: 'du_ica', src: 'du', eta3: 0.30, warmup: 35, relThresh: 0.15, resetQ: true },
    { name: 'JAC_ICA_06', kind: 'auto', mu: 0.20, l3: 'jacobi_ica', src: 'du', eta3: 0.06, warmup: 35, relThresh: 0.15 },
    { name: 'JAC_ICA_12', kind: 'auto', mu: 0.20, l3: 'jacobi_ica', src: 'du', eta3: 0.12, warmup: 35, relThresh: 0.15 },
    { name: 'JAC_RST', kind: 'auto', mu: 0.20, l3: 'jacobi_ica', src: 'du', eta3: 0.06, warmup: 35, relThresh: 0.15, resetQ: true },
    { name: 'L2U_T_30', kind: 'auto', mu: 0.20, l3: 'l2u_thr', src: 'u', eta3: 0.30, warmup: 25, relThresh: 0.15 },
    { name: 'L2U_RST', kind: 'auto', mu: 0.20, l3: 'l2u_thr', src: 'u', eta3: 0.30, warmup: 25, relThresh: 0.15, resetQ: true },
    { name: 'ORC_Q', kind: 'auto', mu: 0.20, useOracleQ: true },
  ];
  const res = new Map();
  for (const arm of ARMS) {
    const rs = streams.map(st => evalArm(st, arm));
    res.set(arm.name, rs);
    console.log(`  ${arm.name.padEnd(11)} acc=${(mean(rs.map(r => r.acc)) * 100).toFixed(2)}%  mse=${mean(rs.map(r => r.mse)).toFixed(3)}  align=${mean(rs.map(r => r.align)).toFixed(3)}`);
  }
  const f = mean(res.get('FIX_050').map(r => r.acc)), l2 = mean(res.get('AUTO_020').map(r => r.acc));
  for (const n of ['DU_ICA_15', 'DU_ICA_30', 'JAC_ICA_06', 'L2U_T_30', 'ORC_Q']) {
    const a = mean(res.get(n).map(r => r.acc));
    console.log(`    ${n.padEnd(11)} ratio=${((a - f) / (l2 - f)).toFixed(2)}x`);
  }
}
