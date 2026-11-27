// L4-D Microverse Ecology: Orthogonal-Frame Step-Size Hierarchy
// Built on the microverse/l4.mjs ecology (40x40 grid, 9 patches, Q-learning movement,
// energy, toxins, births, deaths, carrying capacity).
//
// Architecture (changed interface — L2 controls internal learning dynamics, NOT a proposal prior):
//   L0 (NOLEARN):  fixed zero taste weights (no learning)
//   L1 (FIXED):    taste weight learner u <- u + alpha * delta * z  (constant scalar alpha)
//   L2 (AUTO/IDBD/RMS/SNR/COVW/COVDW/DIRECT): per-coordinate adaptive step sizes alpha_k
//                  (or full-matrix preconditioner A for COVW/COVDW) adapted from L1 errors.
//                  Inherited across generations; L1 weights w start at 0 at birth.
//   L3 (META3):    inherited orthogonal coordinate frame Q in O(D) in which L2 adapts its
//                  per-coordinate step sizes alpha_k. Updated strictly via skew-symmetric
//                  Lie-algebra rotation gated by L2's step-size differences (alpha_j - alpha_k),
//                  with exact basis-change invariance w = Q^T u (zero direct effect on L1).

export function rng32(seed) {
  let s = (seed >>> 0) || 1;
  return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; };
}
export const mix = x => { x = (x >>> 0) ^ 0x9e3779b9; x = Math.imul(x ^ x >>> 16, 0x85ebca6b); x = Math.imul(x ^ x >>> 13, 0xc2b2ae35); return (x ^ x >>> 16) >>> 0 || 1; };
const sigmoid = x => 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, x))));
const clip = (x, a) => Math.max(-a, Math.min(a, x));
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const shuffleInPlace = (a, r) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
function randn(r) {
  let u = 0, v = 0;
  while (u === 0) u = r();
  while (v === 0) v = r();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

const MOVES = [[0, 0], [0, -1], [1, 0], [0, 1], [-1, 0]];
const MOVE0 = [1, 2, 4, 8, 16, 32];
const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };

export const BASE_CFG = Object.freeze({
  size: 40, patches: 9, patchRadius: 4, plantDensity: .6, regrow: .11, plantCap: 4,
  bite: 1.5, toxin: .90, acceptAt: .40, tasteEps: .08,
  metabolism: .06, moveCost: .02, brainCost: .005, maxEnergy: 100, maxAge: 2400,
  relocateEvery: 50, shiftEvery: 30,
  childEnergy: 25, birthCost: 30, capacity: 400, founders: 60,
  nBlocks: 2, blockSize: 10, kinds: 32,
  blockEvery: 4000, modeEvery: 1200, driftEvery: 220, slowDriftEvery: 1200,
  nFast: 2, ampSlow: 2.5, ampFast: 2.5, tasteNoise: 1.0, predScale: 0.85,
  betaInit: -4.0, bMin: -6.5, bMax: -0.3, wClip: 12.0,
  ticks: 20000, every: 100, lateFrom: 10000,
});

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

function eye(D) {
  const Q = Array.from({ length: D }, () => new Float64Array(D));
  for (let i = 0; i < D; i++) Q[i][i] = 1;
  return Q;
}

function cloneMat(M) {
  return M.map(row => new Float64Array(row));
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

// Deterministic label-neutral within-block derangement of indices 0..D-1 for SHAM3
// Preserves the block-diagonal structure of I so SHAM3 suffers zero cross-block penalty!
function makeBlockDerangement(nBlocks, B, shift = 1) {
  const p = new Int32Array(nBlocks * B);
  for (let b = 0; b < nBlocks; b++) {
    const off = b * B;
    for (let i = 0; i < B; i++) p[off + i] = off + ((i + shift) % B);
  }
  return p;
}

export function alignmentScore(Q, Qtrue) {
  const D = Q.length;
  let sum = 0;
  for (let i = 0; i < D; i++) {
    let best = 0;
    const ti = Qtrue[i];
    for (let j = 0; j < D; j++) {
      const qj = Q[j];
      let d = 0;
      for (let c = 0; c < D; c++) d += ti[c] * qj[c];
      const ad = Math.abs(d);
      if (ad > best) best = ad;
    }
    sum += best;
  }
  return sum / D;
}

export class WorldL4D {
  constructor(seed, arm, cfg = {}) {
    this.cfg = { ...BASE_CFG, ...cfg };
    this.arm = arm;
    this.seed = seed;
    this.D = this.cfg.nBlocks * this.cfg.blockSize;
    this.rRule = rng32(mix(seed ^ 0x52554c45));
    this.rPatch = rng32(mix(seed ^ 0x50415443));
    this.rBeh = rng32(mix(seed));
    this.tick = 0;
    this.nextId = 1;
    const N = this.cfg.size;
    this.plant = Array(N * N).fill(null);
    this.patchCenters = Array.from({ length: this.cfg.patches }, () => [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)]);

    // Exogenous world rule: hidden block-orthogonal basis Qtrue
    this.Qtrue = makeBlockOrtho(this.cfg.nBlocks, this.cfg.blockSize, this.rRule);
    this.blk = Math.floor(this.rRule() * this.cfg.nBlocks);
    this.m0 = Math.floor(this.rRule() * this.cfg.blockSize);
    this.mFast = this.pickFastModes();
    this.c0 = (this.rRule() < 0.5 ? -1 : 1) * this.cfg.ampSlow;
    this.cFast = this.mFast.map(() => (this.rRule() < 0.5 ? -1 : 1) * this.cfg.ampFast);
    this.wTrue = new Float64Array(this.D);
    this.rebuildWTrue();

    // Scratch buffers (zero per-bite allocations)
    this.zTmp = new Float64Array(this.D);
    this.gTmp = new Float64Array(this.D);
    this.aTmp = new Float64Array(this.D);
    this.wRawTmp = new Float64Array(this.D);
    this.sRawTmp = new Float64Array(this.D);
    this.hRawTmp = new Float64Array(this.D);
    this.dRawTmp = new Float64Array(this.D);
    this.duTmp = new Float64Array(this.D);
    this.agTmp = new Float64Array(this.D);
    this.srcTmp = new Float64Array(this.D);
    this.shamPerm = makeBlockDerangement(this.cfg.nBlocks, this.cfg.blockSize, 3);

    this.codeVer = 0;
    this.redrawCodes();
    for (let i = 0; i < this.cfg.patches; i++) this.seedPatch(i);
    this.flies = [];
    this.tel = { bites: 0, births: 0, deaths: 0, l3Updates: 0 };
    for (let i = 0; i < this.cfg.founders; i++) this.spawn(null, Math.floor(this.rBeh() * N), Math.floor(this.rBeh() * N), 50, 0);
  }

  pickFastModes() {
    const B = this.cfg.blockSize;
    const avail = Array.from({ length: B }, (_, i) => i).filter(i => i !== this.m0);
    shuffleInPlace(avail, this.rRule);
    return avail.slice(0, this.cfg.nFast);
  }

  rebuildWTrue() {
    const B = this.cfg.blockSize, off = this.blk * B;
    this.wTrue.fill(0);
    const q0 = this.Qtrue[off + this.m0];
    for (let i = 0; i < this.D; i++) this.wTrue[i] += this.c0 * q0[i];
    for (let k = 0; k < this.mFast.length; k++) {
      const qk = this.Qtrue[off + this.mFast[k]];
      const ck = this.cFast[k];
      for (let i = 0; i < this.D; i++) this.wTrue[i] += ck * qk[i];
    }
  }

  ruleValence(bits) {
    let s = 0;
    const w = this.wTrue;
    for (let i = 0; i < this.D; i++) s += w[i] * bits[i];
    return s;
  }

  redrawCodes() {
    const half = this.cfg.kinds / 2;
    const good = [], bad = [];
    while (good.length < half || bad.length < half) {
      const bits = new Int8Array(this.D);
      for (let i = 0; i < this.D; i++) bits[i] = this.rRule() < 0.5 ? -1 : 1;
      const v = this.ruleValence(bits);
      if (v > 0.05 && good.length < half) good.push(bits);
      else if (v < -0.05 && bad.length < half) bad.push(bits);
    }
    this.codes = shuffleInPlace([...good, ...bad], this.rRule);
    this.kindValence = this.codes.map(bits => this.ruleValence(bits));
    this.codeVer++;
  }

  seedPatch(i) {
    const [cx, cy] = this.patchCenters[i], N = this.cfg.size, R = this.cfg.patchRadius;
    for (let dx = -R; dx <= R; dx++) for (let dy = -R; dy <= R; dy++) {
      if (dx * dx + dy * dy > R * R || this.rPatch() > this.cfg.plantDensity) continue;
      const x = (cx + dx + N) % N, y = (cy + dy + N) % N, k = y * N + x;
      if (!this.plant[k]) this.plant[k] = { kind: Math.floor(this.rPatch() * this.codes.length), amount: this.cfg.plantCap * this.rPatch(), patch: i };
    }
  }
  cell(x, y) { const N = this.cfg.size; return ((y + N) % N) * N + ((x + N) % N); }

  spawn(parent, x, y, energy, gen) {
    const id = this.nextId++, D = this.D, arm = this.arm, cfg = this.cfg;
    const key = t => rng32(mix(this.seed ^ Math.imul(id, 2654435761) ^ t));
    const r = key(0), rMut = key(0x4d555441);

    // L1 weights ALWAYS start at 0 at birth (never inherited)
    const u = new Float64Array(D);
    const wRaw = new Float64Array(D); // cached Q^T u for fast prediction
    const uSlow = new Float64Array(D);
    const h = new Float64Array(D);
    const dTrace = new Float64Array(D); // EMA of L2's weight updates (alpha_i * g_i)

    // L2 state (inherited in all adaptive L2 arms)
    const beta = new Float64Array(D);
    const v = new Float64Array(D);
    const g1 = new Float64Array(D);
    const g2 = new Float64Array(D);
    let C = null;
    if (parent && arm.inheritL2) {
      beta.set(parent.beta);
      v.set(parent.v);
      g1.set(parent.g1);
      g2.set(parent.g2);
      if (parent.C) C = cloneMat(parent.C);
    } else {
      beta.fill(arm.betaInit ?? cfg.betaInit);
      v.fill(0.1);
      g2.fill(0.1);
      if (arm.kind === 'cov_w' || arm.kind === 'cov_dw' || arm.kind === 'cov_dtrace') {
        C = Array.from({ length: D }, () => new Float64Array(D));
        for (let i = 0; i < D; i++) C[i][i] = 1 / D;
      }
    }

    // L3 state: orthogonal frame Q in O(D) and optional per-row maturity qAge
    let Q = null;
    const qAge = new Float64Array(D);
    if (arm.usesQ) {
      if (arm.l3 === 'oracle') {
        Q = cloneMat(this.Qtrue);
      } else if (arm.l3 === 'evor') {
        if (parent) {
          Q = cloneMat(parent.Q);
          if (arm.pm > 0 && rMut() < arm.pm) {
            // Birth-only random orthogonal mutation: apply k random Givens rotations (within-block for fairness!)
            const nRot = arm.nRot ?? 4;
            const angScale = arm.angScale ?? 0.5;
            const B = cfg.blockSize;
            for (let t = 0; t < nRot; t++) {
              const blk = Math.floor(rMut() * cfg.nBlocks);
              const off = blk * B;
              const j = off + Math.floor(rMut() * B);
              let k = off + Math.floor(rMut() * (B - 1));
              if (k >= j) k++;
              const ang = (rMut() * 2 - 1) * angScale;
              const cs = Math.cos(ang), sn = Math.sin(ang);
              const qj = Q[j], qk = Q[k];
              for (let c = 0; c < D; c++) {
                const a = qj[c], b = qk[c];
                qj[c] = cs * a + sn * b;
                qk[c] = -sn * a + cs * b;
              }
            }
          }
        } else {
          Q = arm.standing ? makeBlockOrtho(cfg.nBlocks, cfg.blockSize, rMut) : eye(D);
        }
      } else if (parent && arm.inheritQ) {
        Q = cloneMat(parent.Q);
        qAge.set(parent.qAge);
      } else {
        Q = eye(D);
      }
    }

    const f = {
      id, x, y, energy, age: 0, gen, r, bites: 0,
      u, wRaw, uSlow, beta, h, dTrace, v, g1, g2, C, Q, qAge,
      goodPred: new Float64Array(cfg.kinds), codeVer: -1, wDirty: true,
      moveW: MOVE0.map(m => MOVE_INIT[m] ?? 0), moveTrace: Array(MOVE0.length).fill(0), movePending: null, rbar: 0,
    };
    this.flies.push(f);
    if (parent) this.tel.births++;
    return f;
  }

  syncWRaw(f) {
    const D = this.D, wRaw = f.wRaw, u = f.u;
    if (!f.Q || this.arm.rawPred) {
      wRaw.set(u);
    } else {
      wRaw.fill(0);
      const Q = f.Q;
      for (let i = 0; i < D; i++) {
        const ui = u[i];
        if (ui === 0) continue;
        const qi = Q[i];
        for (let c = 0; c < D; c++) wRaw[c] += qi[c] * ui;
      }
    }
  }

  tastePredict(f, bits) {
    let z = 0;
    const w = f.wRaw;
    for (let i = 0; i < this.D; i++) z += w[i] * bits[i];
    return 0.05 + 0.90 * sigmoid(this.cfg.predScale * z);
  }

  getGoodPred(f) {
    if (!f.wDirty && f.codeVer === this.codeVer) return f.goodPred;
    this.syncWRaw(f);
    const gp = f.goodPred, codes = this.codes, D = this.D, w = f.wRaw;
    const acc = this.cfg.acceptAt, tox = this.cfg.toxin, sc = this.cfg.predScale;
    for (let k = 0; k < codes.length; k++) {
      const bits = codes[k];
      let z = 0;
      for (let i = 0; i < D; i++) z += w[i] * bits[i];
      const p = 0.05 + 0.90 * sigmoid(sc * z);
      gp[k] = p > acc ? p - (1 - p) * tox : 0;
    }
    f.codeVer = this.codeVer;
    f.wDirty = false;
    return gp;
  }

  tasteLearn(f, bits, y) {
    const arm = this.arm, D = this.D, cfg = this.cfg;
    if (arm.kind === 'nolearn') return;
    f.wDirty = true;
    const u = f.u, z = this.zTmp, g = this.gTmp, alphas = this.aTmp;

    // Prediction in coordinate frame (raw x if no Q, else z = Q x)
    let pred = 0;
    if (!f.Q || arm.rawPred) {
      for (let i = 0; i < D; i++) { z[i] = bits[i]; pred += u[i] * bits[i]; }
    } else {
      const Q = f.Q;
      for (let i = 0; i < D; i++) {
        const qi = Q[i];
        let s = 0;
        for (let c = 0; c < D; c++) s += qi[c] * bits[c];
        z[i] = s;
        pred += u[i] * s;
      }
    }
    const delta = clamp(y - pred, -12, 12);

    if (arm.kind === 'fixed' || arm.kind === 'meta3off') {
      // L2 off: constant scalar alpha.
      // Note: in meta3off (factorial P01), Q is active (even oracle Q!) with constant alpha:
      // u <- u + alpha * delta * z => w <- w + Q^T (alpha I) Q (delta x) = w + alpha * delta * x!
      // And since alpha_j - alpha_k = 0, L3 rotation is identically 0.
      const a = arm.alpha;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + a * delta * z[i], -cfg.wClip, cfg.wClip);
      return;
    }

    if (arm.kind === 'rms') {
      const rho = arm.rho, eta = arm.eta;
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * bits[i];
        g[i] = gi;
        f.g2[i] = (1 - rho) * f.g2[i] + rho * gi * gi;
        alphas[i] = clamp(eta / (Math.sqrt(f.g2[i]) + 0.1), 1e-4, 0.5);
        sumEff += alphas[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + sc * alphas[i] * g[i], -cfg.wClip, cfg.wClip);
      return;
    }

    if (arm.kind === 'snr') {
      const rho = arm.rho, eta = arm.eta;
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * bits[i];
        g[i] = gi;
        f.g1[i] = (1 - rho) * f.g1[i] + rho * gi;
        f.g2[i] = (1 - rho) * f.g2[i] + rho * gi * gi;
        alphas[i] = clamp(eta * (f.g1[i] * f.g1[i]) / (f.g2[i] + 1e-3), 1e-4, 0.5);
        sumEff += alphas[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) u[i] = clamp(u[i] + sc * alphas[i] * g[i], -cfg.wClip, cfg.wClip);
      return;
    }

    if (arm.kind === 'cov_w' || arm.kind === 'cov_dw' || arm.kind === 'cov_dtrace') {
      for (let i = 0; i < D; i++) g[i] = delta * bits[i];
      const C = f.C;
      let tr = 0;
      for (let i = 0; i < D; i++) tr += C[i][i];
      const invTr = 1 / (tr + 1e-4);
      const ag = this.agTmp;
      let xAx = 0;
      for (let i = 0; i < D; i++) {
        let cg = 0, cx = 0;
        const Ci = C[i];
        for (let j = 0; j < D; j++) { cg += Ci[j] * g[j]; cx += Ci[j] * bits[j]; }
        ag[i] = arm.a0 * g[i] + arm.a1 * cg * invTr;
        xAx += (arm.a0 * bits[i] + arm.a1 * cx * invTr) * bits[i];
      }
      const sc = xAx > 0.9 ? 0.9 / xAx : 1.0;
      for (let i = 0; i < D; i++) {
        const du = sc * ag[i];
        u[i] = clamp(u[i] + du, -cfg.wClip, cfg.wClip);
        if (arm.kind === 'cov_dtrace') f.dTrace[i] = (arm.dLam ?? 0.92) * f.dTrace[i] + du;
      }

      const src = this.srcTmp;
      if (arm.kind === 'cov_dw') {
        for (let i = 0; i < D; i++) {
          f.uSlow[i] = (1 - arm.slowRho) * f.uSlow[i] + arm.slowRho * u[i];
          src[i] = u[i] - f.uSlow[i];
        }
      } else if (arm.kind === 'cov_dtrace') {
        src.set(f.dTrace);
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
      return;
    }

    if (arm.kind === 'direct_du') {
      // DIRECT challenger: uses the EXACT du = u - uSlow & uSlow statistics that META3's L3 uses
      // to set per-feature L1 step sizes directly in raw space!
      f.bites++;
      const tau = 50, bMin = cfg.bMin, bMax = cfg.bMax, slowRho = arm.slowRho ?? 0.04;
      let du2 = 0;
      for (let i = 0; i < D; i++) { const d = u[i] - f.uSlow[i]; du2 += d * d; }
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * bits[i];
        g[i] = gi;
        const gh = gi * f.h[i];
        const a0 = Math.exp(f.beta[i]), agh = Math.abs(gh);
        f.v[i] = Math.max(agh, f.v[i] + (1 / tau) * a0 * (agh - f.v[i]));
        if (f.v[i] > 1e-12) f.beta[i] = clamp(f.beta[i] + arm.mu * (gh / f.v[i]), bMin, bMax);
        const d = u[i] - f.uSlow[i];
        const share = du2 > 0.05 ? (d * d) / du2 : 1 / D;
        const bEff = clamp(f.beta[i] + (arm.dGain ?? 1.0) * (share - 1 / D), bMin, bMax);
        alphas[i] = Math.exp(bEff);
        sumEff += alphas[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) {
        const a = alphas[i] * sc, du = a * g[i];
        u[i] = clamp(u[i] + du, -cfg.wClip, cfg.wClip);
        f.h[i] = f.h[i] * Math.max(0, 1 - a) + du;
        if (f.bites === 1) f.uSlow[i] = u[i];
        else f.uSlow[i] = (1 - slowRho) * f.uSlow[i] + slowRho * u[i];
      }
      return;
    }

    if (arm.kind === 'direct_dtrace') {
      // DIRECT challenger: uses the EXACT dTrace statistic that META3's L3 uses
      // to set per-feature L1 step sizes directly in raw space!
      const tau = 50, bMin = cfg.bMin, bMax = cfg.bMax;
      let d2sum = 0;
      for (let i = 0; i < D; i++) d2sum += f.dTrace[i] * f.dTrace[i];
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * bits[i];
        g[i] = gi;
        const gh = gi * f.h[i];
        const a0 = Math.exp(f.beta[i]), agh = Math.abs(gh);
        f.v[i] = Math.max(agh, f.v[i] + (1 / tau) * a0 * (agh - f.v[i]));
        if (f.v[i] > 1e-12) f.beta[i] = clamp(f.beta[i] + arm.mu * (gh / f.v[i]), bMin, bMax);
        const share = d2sum > 0.05 ? (f.dTrace[i] * f.dTrace[i]) / d2sum : 1 / D;
        const bEff = clamp(f.beta[i] + (arm.dGain ?? 1.0) * (share - 1 / D), bMin, bMax);
        alphas[i] = Math.exp(bEff);
        sumEff += alphas[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) {
        const a = alphas[i] * sc, du = a * g[i];
        u[i] = clamp(u[i] + du, -cfg.wClip, cfg.wClip);
        f.h[i] = f.h[i] * Math.max(0, 1 - a) + du;
        f.dTrace[i] = (arm.dLam ?? 0.92) * f.dTrace[i] + du;
      }
      return;
    }

    if (arm.kind === 'direct_q_rawl2') {
      // DIRECT challenger: has exact Q (oracle or learned) AND raw-space Autostep alpha_raw.
      // Computes raw-space Autostep update dw_raw = alpha_raw * g, then also blends/projects
      // with Q^T diag(alpha_raw) Q g using exact matched trace.
      const tau = 50, bMin = cfg.bMin, bMax = cfg.bMax;
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * bits[i];
        g[i] = gi;
        const gh = gi * f.h[i];
        const a0 = Math.exp(f.beta[i]), agh = Math.abs(gh);
        f.v[i] = Math.max(agh, f.v[i] + (1 / tau) * a0 * (agh - f.v[i]));
        if (f.v[i] > 1e-12) f.beta[i] = clamp(f.beta[i] + arm.mu * (gh / f.v[i]), bMin, bMax);
        alphas[i] = Math.exp(f.beta[i]);
        sumEff += alphas[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) alphas[i] *= sc;
      const Q = f.Q, qg = this.agTmp;
      for (let i = 0; i < D; i++) {
        let s = 0; const qi = Q[i];
        for (let c = 0; c < D; c++) s += qi[c] * g[c];
        qg[i] = alphas[i] * s;
      }
      const mixQ = arm.mixQ ?? 1.0;
      for (let c = 0; c < D; c++) {
        let dwQ = 0;
        for (let i = 0; i < D; i++) dwQ += Q[i][c] * qg[i];
        const dw = mixQ * dwQ + (1 - mixQ) * alphas[c] * g[c];
        u[c] = clamp(u[c] + dw, -cfg.wClip, cfg.wClip);
        f.h[c] = f.h[c] * Math.max(0, 1 - alphas[c]) + dw;
      }
      return;
    }

    if (arm.kind === 'direct_q_diag') {
      // DIRECT challenger: sets diagonal step sizes in raw space from L3's statistic Q
      // (using row/column l4-concentration of Q to modulate Autostep beta directly in raw space)
      const tau = 50, bMin = cfg.bMin, bMax = cfg.bMax;
      const Q = f.Q;
      let sumEff = 0;
      for (let i = 0; i < D; i++) {
        const gi = delta * bits[i];
        g[i] = gi;
        const gh = gi * f.h[i];
        const a0 = Math.exp(f.beta[i]), agh = Math.abs(gh);
        f.v[i] = Math.max(agh, f.v[i] + (1 / tau) * a0 * (agh - f.v[i]));
        if (f.v[i] > 1e-12) f.beta[i] = clamp(f.beta[i] + arm.mu * (gh / f.v[i]), bMin, bMax);
        // Column concentration of Q on raw bit i: sum_r Q[r][i]^4
        let q4 = 0;
        for (let r = 0; r < D; r++) { const qri = Q[r][i]; q4 += qri * qri * qri * qri; }
        const bEff = clamp(f.beta[i] + (arm.qGain ?? 0.5) * (q4 - 0.2), bMin, bMax);
        alphas[i] = Math.exp(bEff);
        sumEff += alphas[i];
      }
      const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
      for (let i = 0; i < D; i++) {
        const a = alphas[i] * sc;
        u[i] = clamp(u[i] + a * g[i], -cfg.wClip, cfg.wClip);
        f.h[i] = f.h[i] * Math.max(0, 1 - a) + a * g[i];
      }
      return;
    }

    // IDBD or Autostep (in raw space if !f.Q, or in frame Q for META3/SHAM3/EVOR3/ORACLE3)
    const bMin = cfg.bMin, bMax = cfg.bMax;
    const tau = arm.tau ?? 50;
    let sumEff = 0;
    for (let i = 0; i < D; i++) {
      const gi = delta * z[i];
      g[i] = gi;
      const gh = gi * f.h[i];
      if (arm.l2 === 'idbd') {
        f.beta[i] = clamp(f.beta[i] + arm.theta * gh, bMin, bMax);
      } else {
        const a0 = Math.exp(f.beta[i]), agh = Math.abs(gh);
        f.v[i] = Math.max(agh, f.v[i] + (1 / tau) * a0 * (agh - f.v[i]));
        if (f.v[i] > 1e-12) f.beta[i] = clamp(f.beta[i] + arm.mu * (gh / f.v[i]), bMin, bMax);
      }
      alphas[i] = Math.exp(f.beta[i]);
      sumEff += alphas[i] * z[i] * z[i];
    }
    const sc = sumEff > 0.9 ? 0.9 / sumEff : 1.0;
    for (let i = 0; i < D; i++) alphas[i] *= sc;

    // L1 weight update, L2 eligibility trace update, slow weight EMA uSlow, and dTrace
    f.bites++;
    const dLam = arm.dLam ?? 0.92;
    const slowRho = arm.slowRho ?? 0.04;
    const duArr = this.duTmp;
    for (let i = 0; i < D; i++) {
      const a = alphas[i], gi = g[i], du = a * gi;
      u[i] = clamp(u[i] + du, -cfg.wClip, cfg.wClip);
      f.h[i] = f.h[i] * Math.max(0, 1 - a * z[i] * z[i]) + du;
      f.dTrace[i] = dLam * f.dTrace[i] + du;
      if (f.bites === 1) f.uSlow[i] = u[i];
      else f.uSlow[i] = (1 - slowRho) * f.uSlow[i] + slowRho * u[i];
      duArr[i] = u[i] - f.uSlow[i];
    }

    // L3 update of orthogonal frame Q (learn, reset, or deterministic label-neutral sham)
    if ((arm.l3 === 'learn' || arm.l3 === 'reset' || arm.l3 === 'sham') && f.bites >= (arm.warmup ?? 35)) {
      const rule = arm.l3Rule ?? 'du_ica';
      const src = (rule === 'du_ica' || rule === 'du_both') ? duArr : (rule === 'dt_ica' || rule === 'dt_dir') ? f.dTrace : u;
      let s2sum = 0, aLo = Infinity, aHi = -Infinity;
      for (let i = 0; i < D; i++) {
        s2sum += src[i] * src[i];
        if (alphas[i] < aLo) aLo = alphas[i];
        if (alphas[i] > aHi) aHi = alphas[i];
      }
      const aSpread = aHi - aLo;
      const s2Min = arm.s2Min ?? 1.0;
      if (s2sum > s2Min && aSpread > 1e-5) {
        this.tel.l3Updates++;
        const Q = f.Q;
        // Save raw-space vectors w = Q^T u, s_raw = Q^T uSlow, h_raw = Q^T h, d_raw = Q^T dTrace for exact invariance
        const wRaw = this.wRawTmp, sRaw = this.sRawTmp, hRaw = this.hRawTmp, dRaw = this.dRawTmp;
        wRaw.fill(0); sRaw.fill(0); hRaw.fill(0); dRaw.fill(0);
        for (let i = 0; i < D; i++) {
          const qi = Q[i], ui = u[i], usi = f.uSlow[i], hi = f.h[i], di = f.dTrace[i];
          for (let c = 0; c < D; c++) {
            wRaw[c] += qi[c] * ui;
            sRaw[c] += qi[c] * usi;
            hRaw[c] += qi[c] * hi;
            dRaw[c] += qi[c] * di;
          }
        }
        const eta3 = arm.eta3;
        const Qold = cloneMat(Q);
        const isSham = arm.l3 === 'sham';
        const perm = this.shamPerm;
        const qHalf = arm.qHalf ?? 0;
        const applyRot = (vec, v2sum, rate) => {
          const thresh = (arm.relThresh ?? 0.15) * Math.sqrt(v2sum);
          const invV4 = 1 / (v2sum * v2sum + 0.05);
          const invSpread = 1 / aSpread;
          for (let j = 0; j < D; j++) {
            const sj = vec[j];
            if (Math.abs(sj) < thresh) continue;
            const aj = alphas[j], sj2 = sj * sj;
            for (let k = j + 1; k < D; k++) {
              const sk = vec[k];
              if (Math.abs(sk) < thresh) continue;
              const da = aj - alphas[k];
              if (Math.abs(da) < 1e-5) continue;
              const damp = qHalf > 0 ? 1 / (1 + 0.5 * (f.qAge[j] + f.qAge[k]) / qHalf) : 1.0;
              let om = 0;
              if (rule === 'du_ica' || rule === 'du_both') {
                // Strictly gated by |alpha_j - alpha_k| / aSpread so identically 0 when L2 is off!
                om = clamp(rate * damp * Math.abs(da) * invSpread * sj * sk * (sj2 - sk * sk) * invV4, -0.05, 0.05);
              } else if (rule === 'l2u') {
                om = clamp(rate * damp * da * sj * sk / (v2sum + 0.1), -0.04, 0.04);
              }
              if (om === 0) continue;
              const rj = isSham ? perm[j] : j;
              const rk = isSham ? perm[k] : k;
              if (qHalf > 0) { const aom = Math.abs(om); f.qAge[rj] += aom; f.qAge[rk] += aom; }
              const qoj = Qold[rj], qok = Qold[rk], qj = Q[rj], qk = Q[rk];
              for (let c = 0; c < D; c++) { qj[c] += om * qok[c]; qk[c] -= om * qoj[c]; }
            }
          }
        };
        applyRot(src, s2sum, eta3);
        if (rule === 'du_both') {
          let us2 = 0;
          for (let i = 0; i < D; i++) us2 += f.uSlow[i] * f.uSlow[i];
          if (us2 > s2Min) applyRot(f.uSlow, us2, eta3 * (arm.slowScale ?? 0.5));
        }
        orthonormalize(Q);
        // Re-project u = Q wRaw, uSlow = Q sRaw, h = Q hRaw, dTrace = Q dRaw so L1 weights w = Q^T u are 100% unchanged!
        for (let i = 0; i < D; i++) {
          const qi = Q[i];
          let su = 0, ss = 0, sh = 0, sd = 0;
          for (let c = 0; c < D; c++) {
            su += qi[c] * wRaw[c];
            ss += qi[c] * sRaw[c];
            sh += qi[c] * hRaw[c];
            sd += qi[c] * dRaw[c];
          }
          u[i] = su; f.uSlow[i] = ss; f.h[i] = sh; f.dTrace[i] = sd;
        }
      }
    }
  }

  moveFeatures(f, goodPred, dir, occ) {
    const [dx, dy] = MOVES[dir], x = f.x + dx, y = f.y + dy, p = this.plant[this.cell(x, y)];
    const food = p ? p.amount / this.cfg.plantCap : 0, good = p ? food * goodPred[p.kind] : 0;
    let s4 = 0;
    if (dir) for (let d = 1; d <= 4; d++) for (let s = -d; s <= d; s++) {
      const cx = dx ? f.x + dx * d : f.x + s, cy = dy ? f.y + dy * d : f.y + s, q = this.plant[this.cell(cx, cy)];
      if (q) s4 += q.amount * goodPred[q.kind] / (d * d);
    }
    return [1, food, good, Math.tanh(s4 / 4), Math.min(1, (occ.get(this.cell(x, y)) ?? 0) / 3), f.energy / this.cfg.maxEnergy * 2 - 1];
  }

  step() {
    const cfg = this.cfg, N = cfg.size;
    if (this.tick > 0) {
      let changed = false;
      if (this.tick % cfg.blockEvery === 0) {
        const others = Array.from({ length: cfg.nBlocks }, (_, i) => i).filter(i => i !== this.blk);
        this.blk = others[Math.floor(this.rRule() * others.length)];
        this.m0 = Math.floor(this.rRule() * cfg.blockSize);
        this.mFast = this.pickFastModes();
        this.c0 = (this.rRule() < 0.5 ? -1 : 1) * cfg.ampSlow;
        this.cFast = this.mFast.map(() => (this.rRule() < 0.5 ? -1 : 1) * cfg.ampFast);
        this.rebuildWTrue();
        changed = true;
      } else if (this.tick % cfg.modeEvery === 0) {
        this.mFast = this.pickFastModes();
        this.cFast = this.mFast.map(() => (this.rRule() < 0.5 ? -1 : 1) * cfg.ampFast);
        if (this.tick % cfg.slowDriftEvery === 0) this.c0 = -this.c0;
        this.rebuildWTrue();
        changed = true;
      } else if (this.tick % cfg.driftEvery === 0) {
        const k = Math.floor(this.rRule() * this.mFast.length);
        this.cFast[k] = -this.cFast[k];
        this.rebuildWTrue();
        changed = true;
      }
      if (changed || this.tick % cfg.shiftEvery === 0) this.redrawCodes();
    }

    if (this.tick > 0 && this.tick % cfg.relocateEvery === 0) {
      const i = Math.floor(this.rPatch() * cfg.patches);
      for (let k = 0; k < this.plant.length; k++) if (this.plant[k]?.patch === i) this.plant[k] = null;
      this.patchCenters[i] = [Math.floor(this.rPatch() * N), Math.floor(this.rPatch() * N)];
      this.seedPatch(i);
    }
    for (const p of this.plant) if (p) p.amount = Math.min(cfg.plantCap, p.amount + cfg.regrow);
    if (!this.flies.length) { this.tick++; return; }

    const occ = new Map();
    for (const f of this.flies) { const k = this.cell(f.x, f.y); occ.set(k, (occ.get(k) ?? 0) + 1); }
    const order = shuffleInPlace(this.flies.map((_, i) => i), this.rBeh);
    const born = [];
    for (const idx of order) {
      const f = this.flies[idx], e0 = f.energy;
      const goodPred = this.getGoodPred(f);
      const bases = MOVES.map((_, d) => this.moveFeatures(f, goodPred, d, occ));
      const qs = bases.map(base => base.reduce((s, v, j) => s + f.moveW[j] * v, 0));
      if (f.movePending) {
        const rew = f.movePending.reward ?? 0, delta = clip(rew - f.rbar, 4);
        f.rbar += .02 * (rew - f.rbar);
        for (let j = 0; j < f.moveW.length; j++) { f.moveTrace[j] = .8 * f.moveTrace[j] + f.movePending.base[j]; f.moveW[j] = clip(f.moveW[j] + .05 * delta * f.moveTrace[j], 8); }
      }
      const qmax = Math.max(...qs), ties = [];
      for (let d = 0; d < 5; d++) if (qs[d] >= qmax - 1e-9) ties.push(d);
      let dir = ties[Math.floor(f.r() * ties.length)];
      if (f.r() < .08) dir = Math.floor(f.r() * 5);
      f.movePending = { base: bases[dir], reward: 0 };
      const from = this.cell(f.x, f.y); occ.set(from, occ.get(from) - 1);
      f.x = (f.x + MOVES[dir][0] + N) % N; f.y = (f.y + MOVES[dir][1] + N) % N;
      const to = this.cell(f.x, f.y); occ.set(to, (occ.get(to) ?? 0) + 1);
      f.energy -= cfg.metabolism + (dir ? cfg.moveCost : 0) + cfg.brainCost;
      const pl = this.plant[to];
      if (pl && pl.amount > .2) {
        const bits = this.codes[pl.kind];
        if (f.wDirty) this.syncWRaw(f);
        const pred = this.tastePredict(f, bits);
        if (pred > cfg.acceptAt || f.r() < cfg.tasteEps) {
          const take = Math.min(pl.amount, cfg.bite); pl.amount -= take;
          const vTrue = this.kindValence[pl.kind];
          const good = vTrue > 0;
          f.energy += good ? take : -take * cfg.toxin;
          this.tel.bites++;
          const yObs = vTrue + cfg.tasteNoise * randn(f.r);
          this.tasteLearn(f, bits, yObs);
        }
      }
      f.energy = Math.min(cfg.maxEnergy, f.energy); f.age++;
      f.movePending.reward = (f.energy - e0) / 4;
      if (f.energy >= 60 && this.flies.length + born.length < cfg.capacity) {
        f.energy -= cfg.birthCost;
        born.push([f, (f.x + Math.floor(f.r() * 3) - 1 + N) % N, (f.y + Math.floor(f.r() * 3) - 1 + N) % N]);
      }
    }
    const alive = [];
    for (const f of this.flies) { if (f.energy <= 0 || f.age >= cfg.maxAge) this.tel.deaths++; else alive.push(f); }
    this.flies = alive;
    for (const [p, x, y] of born) this.spawn(p, x, y, cfg.childEnergy, p.gen + 1);
    this.tick++;
  }

  skill() {
    if (!this.flies.length) return 0;
    let sum = 0;
    for (const f of this.flies) {
      if (f.wDirty) this.syncWRaw(f);
      let g = 0, gn = 0, b = 0, bn = 0;
      for (let k = 0; k < this.codes.length; k++) {
        const acc = this.tastePredict(f, this.codes[k]) > 0.5 ? 1 : 0;
        if (this.kindValence[k] > 0) { g += acc; gn++; } else { b += acc; bn++; }
      }
      sum += g / gn - b / bn;
    }
    return sum / this.flies.length;
  }

  meanAlign() {
    if (!this.flies.length || !this.flies[0].Q) return 0;
    let s = 0;
    for (const f of this.flies) s += alignmentScore(f.Q, this.Qtrue);
    return s / this.flies.length;
  }
}

export function runOne(seed, arm, cfg = {}) {
  const w = new WorldL4D(seed, arm, cfg);
  let popSum = 0, skillSum = 0, alignSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) {
      popSum += w.flies.length;
      skillSum += w.skill();
      alignSum += w.meanAlign();
      nLate++;
    }
  }
  return {
    seed, armName: arm.name, popSum, pop: popSum / nLate,
    skill: skillSum / nLate, align: alignSum / nLate,
    extinct: !w.flies.length, bites: w.tel.bites, births: w.tel.births, l3Updates: w.tel.l3Updates,
  };
}
