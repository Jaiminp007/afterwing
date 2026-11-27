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

function generateFrameStream(seed, { nBlocks = 4, B = 6, T = 16000, blockEvery = 2000, modeEvery = 500, driftEvery = 100, noiseStd = 1.0 }) {
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

function alignmentScore(Q, Qtrue) {
  // Average max |q_i . q^*_j| over true rows
  const D = Q.length;
  let sum = 0;
  for (let i = 0; i < D; i++) {
    let best = 0;
    for (let j = 0; j < D; j++) {
      let d = 0;
      for (let c = 0; c < D; c++) d += Qtrue[i][c] * Q[j][c];
      if (Math.abs(d) > best) best = Math.abs(d);
    }
    sum += best;
  }
  return sum / D;
}

function evalArm(st, arm) {
  const { D, T, xs, ys, vTrue, Qtrue } = st;
  const late = Math.floor(T / 2);
  let Q = arm.useOracleQ ? Qtrue.map(row => new Float64Array(row)) : eye(D);
  const u = new Float64Array(D);
  const beta = new Float64Array(D).fill(arm.betaInit ?? -4.5);
  const h = new Float64Array(D);
  const v = new Float64Array(D).fill(0.1);
  const e = new Float64Array(D);
  const z = new Float64Array(D);
  const g = new Float64Array(D);
  const alphas = new Float64Array(D);
  const Cema = Array.from({ length: D }, () => new Float64Array(D));

  let mseSum = 0, accSum = 0, nLate = 0;
  const bMin = arm.bMin ?? -6.5, bMax = -0.3;

  for (let t = 0; t < T; t++) {
    const x = xs[t], y = ys[t];
    let pred = 0;
    if (arm.kind === 'fixed') {
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
    } else {
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

      // L1 weight update & L2 trace update
      for (let i = 0; i < D; i++) {
        const a = alphas[i], gi = g[i];
        u[i] = clamp(u[i] + a * gi, -12, 12);
        h[i] = h[i] * Math.max(0, 1 - a * z[i] * z[i]) + a * gi;
        e[i] = 0.80 * e[i] + gi;
      }

      // L3: update orthogonal frame Q
      if (arm.l3) {
        const wRaw = new Float64Array(D), hRaw = new Float64Array(D), eRaw = new Float64Array(D);
        for (let i = 0; i < D; i++) {
          const qi = Q[i], ui = u[i], hi = h[i], ei = e[i];
          for (let c = 0; c < D; c++) { wRaw[c] += qi[c] * ui; hRaw[c] += qi[c] * hi; eRaw[c] += qi[c] * ei; }
        }
        let u2sum = 0;
        for (let i = 0; i < D; i++) u2sum += u[i] * u[i];

        if (arm.l3 === 'l2_align_u' || arm.l3 === 'ica_u' || arm.l3 === 'l2_ica_hybrid') {
          if (u2sum > 0.25) {
            const eta3 = arm.eta3;
            const Qnew = Q.map(row => new Float64Array(row));
            for (let j = 0; j < D; j++) {
              const uj = u[j], uj2 = uj * uj;
              if (Math.abs(uj) < 0.05) continue;
              for (let k = j + 1; k < D; k++) {
                const uk = u[k], uk2 = uk * uk;
                if (Math.abs(uk) < 0.05) continue;
                let om = 0;
                if (arm.l3 === 'ica_u') {
                  om = clamp(eta3 * uj * uk * (uj2 - uk2) / (u2sum * u2sum + 1e-4), -0.05, 0.05);
                } else if (arm.l3 === 'l2_align_u') {
                  // Driven purely by L2's step-size difference (alpha_j - alpha_k) * u_j * u_k!
                  // If L2 is off (alpha_j == alpha_k), om == 0 identically!
                  om = clamp(eta3 * (alphas[j] - alphas[k]) * uj * uk / (u2sum + 0.1), -0.05, 0.05);
                } else if (arm.l3 === 'l2_ica_hybrid') {
                  // Pure L2-gated: uses (alpha_j^2 - alpha_k^2) or (alpha_j*u_j^2 - alpha_k*u_k^2) * u_j * u_k
                  // Still IDENTICALLY ZERO when alpha_j == alpha_k AND uses u^2 to break exact ties!
                  const num = (alphas[j] * uj2 - alphas[k] * uk2) * uj * uk;
                  om = clamp(eta3 * num / (u2sum * u2sum + 0.1), -0.05, 0.05);
                }
                if (om === 0) continue;
                const qj = Q[j], qk = Q[k], qnj = Qnew[j], qnk = Qnew[k];
                for (let c = 0; c < D; c++) { qnj[c] += om * qk[c]; qnk[c] -= om * qj[c]; }
              }
            }
            orthonormalize(Qnew);
            Q = Qnew;
            for (let i = 0; i < D; i++) {
              const qi = Q[i];
              let su = 0, sh = 0, se = 0;
              for (let c = 0; c < D; c++) { su += qi[c] * wRaw[c]; sh += qi[c] * hRaw[c]; se += qi[c] * eRaw[c]; }
              u[i] = su; h[i] = sh; e[i] = se;
            }
          }
        } else if (arm.l3 === 'lie_ema') {
          // Exact Lie-algebra hypergradient with EMA smoothing of g_j e_k + g_k e_j
          const rho = 0.05;
          const eta3 = arm.eta3;
          const Qnew = Q.map(row => new Float64Array(row));
          for (let j = 0; j < D; j++) {
            for (let k = j + 1; k < D; k++) {
              const cval = g[j] * e[k] + g[k] * e[j];
              Cema[j][k] = (1 - rho) * Cema[j][k] + rho * cval;
              const da = alphas[j] - alphas[k];
              if (Math.abs(da) < 0.005) continue;
              const om = clamp(eta3 * da * Cema[j][k], -0.03, 0.03);
              if (om === 0) continue;
              const qj = Q[j], qk = Q[k], qnj = Qnew[j], qnk = Qnew[k];
              for (let c = 0; c < D; c++) { qnj[c] += om * qk[c]; qnk[c] -= om * qj[c]; }
            }
          }
          orthonormalize(Qnew);
          Q = Qnew;
          for (let i = 0; i < D; i++) {
            const qi = Q[i];
            let su = 0, sh = 0, se = 0;
            for (let c = 0; c < D; c++) { su += qi[c] * wRaw[c]; sh += qi[c] * hRaw[c]; se += qi[c] * eRaw[c]; }
            u[i] = su; h[i] = sh; e[i] = se;
          }
        }
      }
    }
  }
  return { mse: mseSum / nLate, acc: accSum / nLate, align: alignmentScore(Q, Qtrue) };
}

const SEEDS = [3001, 3002, 3003, 3004, 3005, 3006];
const cfg = { nBlocks: 4, B: 6, T: 16000, blockEvery: 2000, modeEvery: 500, driftEvery: 100, noiseStd: 1.0 };
const streams = SEEDS.map(s => generateFrameStream(s, cfg));

const ARMS = [
  { name: 'FIX_030', kind: 'fixed', alpha: 0.030 },
  { name: 'FIX_060', kind: 'fixed', alpha: 0.060 },
  { name: 'AUTO_015', kind: 'autostep', mu: 0.15 },
  { name: 'AUTO_025', kind: 'autostep', mu: 0.25 },
  { name: 'AUTO_035', kind: 'autostep', mu: 0.35 },
  { name: 'M3_ICA_02', kind: 'autostep', mu: 0.25, l3: 'ica_u', eta3: 0.02 },
  { name: 'M3_ICA_06', kind: 'autostep', mu: 0.25, l3: 'ica_u', eta3: 0.06 },
  { name: 'M3_L2U_05', kind: 'autostep', mu: 0.25, l3: 'l2_align_u', eta3: 0.05 },
  { name: 'M3_L2U_20', kind: 'autostep', mu: 0.25, l3: 'l2_align_u', eta3: 0.20 },
  { name: 'M3_L2U_50', kind: 'autostep', mu: 0.25, l3: 'l2_align_u', eta3: 0.50 },
  { name: 'M3_HYB_20', kind: 'autostep', mu: 0.25, l3: 'l2_ica_hybrid', eta3: 0.20 },
  { name: 'M3_HYB_60', kind: 'autostep', mu: 0.25, l3: 'l2_ica_hybrid', eta3: 0.60 },
  { name: 'M3_LIE_02', kind: 'autostep', mu: 0.25, l3: 'lie_ema', eta3: 0.02 },
  { name: 'M3_LIE_08', kind: 'autostep', mu: 0.25, l3: 'lie_ema', eta3: 0.08 },
  { name: 'ORC_Q_25', kind: 'autostep', mu: 0.25, useOracleQ: true },
];

console.log(`=== Exp 5: Testing L3 Frame Learners (D=24, 4x6 blocks, T=16000) ===`);
const res = new Map();
for (const arm of ARMS) {
  const rs = streams.map(st => evalArm(st, arm));
  res.set(arm.name, rs);
  console.log(`  ${arm.name.padEnd(12)} acc=${(mean(rs.map(r => r.acc)) * 100).toFixed(2)}%  mse=${mean(rs.map(r => r.mse)).toFixed(3)}  align=${mean(rs.map(r => r.align)).toFixed(3)}`);
}
const bestFix = Math.max(...['FIX_030', 'FIX_060'].map(n => mean(res.get(n).map(r => r.acc))));
const bestL2 = Math.max(...['AUTO_015', 'AUTO_025', 'AUTO_035'].map(n => mean(res.get(n).map(r => r.acc))));
console.log(`\nBest FIXED: ${(bestFix * 100).toFixed(2)}%, Best L2: ${(bestL2 * 100).toFixed(2)}% (gain +${((bestL2 - bestFix) * 100).toFixed(2)}%)`);
for (const arm of ARMS.filter(a => a.l3 || a.useOracleQ)) {
  const a = mean(res.get(arm.name).map(r => r.acc));
  const ratio = (a - bestFix) / (bestL2 - bestFix);
  console.log(`  ${arm.name.padEnd(12)}: acc=${(a * 100).toFixed(2)}%  gain=+${((a - bestFix) * 100).toFixed(2)}%  ratio=${ratio.toFixed(2)}x`);
}
