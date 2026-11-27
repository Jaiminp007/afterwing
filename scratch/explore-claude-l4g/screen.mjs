// L4-G abstract oracle screen: meta-learning a lineage task subspace.
// Exploration only, seeds 5001..5016. Not an ecology; checks learning headroom.
// Per lineage: subspace U (D x k) drifting slowly across generations.
// Each life: T tastes; target w = U z, z ~ N(0, a^2 I_k), redrawn every S tastes.
// x in {-1,+1}^D, y = w.x + N(0, sigma^2). Score: mean payoff of accept-if-pred>0 (E[w.x]).
const args = Object.fromEntries(process.argv.slice(2).map(s => s.split('=')));
const D = +(args.D ?? 16), K = +(args.k ?? 2), T = +(args.T ?? 120), S = +(args.S ?? 30);
const G = +(args.G ?? 60), A = +(args.a ?? 1), SIG = +(args.sig ?? 1), DRIFT = +(args.drift ?? 0.05);
const SEEDS = (args.seeds ?? '5001-5016').split('-').map(Number);

function rng(seed) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function randn(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
function gs(M) { // orthonormalize columns of D x k (array of k column vectors)
  for (let i = 0; i < M.length; i++) { for (let j = 0; j < i; j++) { let d = 0; for (let c = 0; c < D; c++) d += M[i][c] * M[j][c]; for (let c = 0; c < D; c++) M[i][c] -= d * M[j][c]; }
    let n = 0; for (let c = 0; c < D; c++) n += M[i][c] ** 2; n = Math.sqrt(n); for (let c = 0; c < D; c++) M[i][c] /= n; } return M; }
function eigSym(C) { // Jacobi; returns {vals, vecs (rows)}
  const n = C.length, a = C.map(r => Float64Array.from(r)), v = Array.from({ length: n }, (_, i) => { const r = new Float64Array(n); r[i] = 1; return r; });
  for (let sweep = 0; sweep < 30; sweep++) { let off = 0; for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) off += a[p][q] ** 2; if (off < 1e-14) break;
    for (let p = 0; p < n; p++) for (let q = p + 1; q < n; q++) { if (Math.abs(a[p][q]) < 1e-15) continue;
      const th = (a[q][q] - a[p][p]) / (2 * a[p][q]), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < n; k++) { const akp = a[k][p], akq = a[k][q]; a[k][p] = c * akp - s * akq; a[k][q] = s * akp + c * akq; }
      for (let k = 0; k < n; k++) { const apk = a[p][k], aqk = a[q][k]; a[p][k] = c * apk - s * aqk; a[q][k] = s * apk + c * aqk; }
      for (let k = 0; k < n; k++) { const vp = v[p][k], vq = v[q][k]; v[p][k] = c * vp - s * vq; v[q][k] = s * vp + c * vq; } } }
  return { vals: a.map((r, i) => r[i]), vecs: v };
}

// Learners: each gets a stream; predict(x) then learn(x,y). Prior covariance P0 (D x D) and hazard h.
function kalman(P0, h) { // switching-prior Kalman: w ~ N(0,P0), resets with hazard h (moment-matched mixture)
  let w = new Float64Array(D), P = P0.map(r => Float64Array.from(r));
  return { pred: x => { let s = 0; for (let i = 0; i < D; i++) s += w[i] * x[i]; return s; },
    learn(x, y) {
      // predictive under "no switch" and "switch" (fresh prior)
      const px = new Float64Array(D); let s = SIG * SIG, m = 0, s0 = SIG * SIG;
      for (let i = 0; i < D; i++) { let v = 0, v0 = 0; for (let j = 0; j < D; j++) { v += P[i][j] * x[j]; v0 += P0[i][j] * x[j]; } px[i] = v; s += v * x[i]; s0 += v0 * x[i]; m += w[i] * x[i]; }
      const l1 = Math.log(1 - h) - .5 * (Math.log(s) + (y - m) ** 2 / s), l0 = Math.log(h) - .5 * (Math.log(s0) + y * y / s0);
      const mx = Math.max(l1, l0), r = Math.exp(l0 - mx) / (Math.exp(l0 - mx) + Math.exp(l1 - mx));
      const p0x = new Float64Array(D); for (let i = 0; i < D; i++) { let v = 0; for (let j = 0; j < D; j++) v += P0[i][j] * x[j]; p0x[i] = v; }
      const wA = new Float64Array(D), wB = new Float64Array(D);
      for (let i = 0; i < D; i++) { wA[i] = w[i] + px[i] * (y - m) / s; wB[i] = p0x[i] * y / s0; }
      const nw = new Float64Array(D); for (let i = 0; i < D; i++) nw[i] = (1 - r) * wA[i] + r * wB[i];
      for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) {
        const PA = P[i][j] - px[i] * px[j] / s, PB = P0[i][j] - p0x[i] * p0x[j] / s0;
        P[i][j] = (1 - r) * (PA + (wA[i] - nw[i]) * (wA[j] - nw[j])) + r * (PB + (wB[i] - nw[i]) * (wB[j] - nw[j]));
      }
      w = nw;
    } };
}
// L3-on, L2-off cell: LMS with fixed preconditioner (gain matrix c*P0), no covariance adaptation.
function precond(P0, c) { const w = new Float64Array(D); return { pred: x => { let s = 0; for (let i = 0; i < D; i++) s += w[i] * x[i]; return s; }, learn(x, y) { let p = 0; for (let i = 0; i < D; i++) p += w[i] * x[i]; const e = y - p; for (let i = 0; i < D; i++) { let v = 0; for (let j = 0; j < D; j++) v += P0[i][j] * x[j]; w[i] += c * e * v; } } }; }
function lms(alpha) { const w = new Float64Array(D); return { pred: x => { let s = 0; for (let i = 0; i < D; i++) s += w[i] * x[i]; return s; }, learn(x, y) { let p = 0; for (let i = 0; i < D; i++) p += w[i] * x[i]; const e = y - p; for (let i = 0; i < D; i++) w[i] += alpha * e * x[i]; } }; }
// Autostep (Mahmood et al. 2012) in a frame Q (rows = basis vectors); features z = Q x.
function autostep(Q, mu, beta0, inherit) {
  const u = new Float64Array(D), beta = inherit?.beta ? Float64Array.from(inherit.beta) : new Float64Array(D).fill(beta0), h = new Float64Array(D), v = new Float64Array(D).fill(1);
  const zf = x => { const z = new Float64Array(D); for (let i = 0; i < D; i++) { let s = 0; for (let c = 0; c < D; c++) s += Q[i][c] * x[c]; z[i] = s; } return z; };
  const dw = []; // L2 realized weight updates (for L3)
  return { beta, dw, pred: x => { const z = zf(x); let s = 0; for (let i = 0; i < D; i++) s += u[i] * z[i]; return s; },
    learn(x, y) { const z = zf(x); let p = 0; for (let i = 0; i < D; i++) p += u[i] * z[i]; const e = y - p;
      for (let i = 0; i < D; i++) { const g = e * z[i] * h[i]; v[i] = Math.max(Math.abs(g), v[i] + (1 / 1e4) * Math.exp(beta[i]) * z[i] * z[i] * (Math.abs(g) - v[i])); if (v[i] > 0) beta[i] += mu * g / v[i]; beta[i] = Math.max(-12, Math.min(Math.log(1), beta[i])); }
      let ss = 0; for (let i = 0; i < D; i++) ss += Math.exp(beta[i]) * z[i] * z[i]; if (ss > 1) for (let i = 0; i < D; i++) beta[i] -= Math.log(ss);
      const d = new Float64Array(D);
      for (let i = 0; i < D; i++) { const a = Math.exp(beta[i]); d[i] = a * e * z[i]; u[i] += d[i]; h[i] = h[i] * Math.max(0, 1 - a * z[i] * z[i]) + a * e * z[i]; }
      dw.push(d);
    } };
}
const eye = () => Array.from({ length: D }, (_, i) => { const r = new Float64Array(D); r[i] = 1; return r; });
const scaled = (M, c) => M.map(r => r.map(v => v * c));

function lineage(seed, arm) {
  const r = rng(seed * 7919 + 13), re = rng(seed * 104729 + 7); // same world stream for all arms
  let U = gs(Array.from({ length: K }, () => Float64Array.from({ length: D }, () => randn(r))));
  const h = 1 / S; let score = 0, n = 0;
  let C = null, inheritBeta = null, P0 = null; const shamP0 = arm.kind === 'kal_sham' ? lineageP0s(seed + 100000, arm) : null;
  const hist = []; // L3 state: covariance of L2 updates in raw coords
  for (let g = 0; g < G; g++) {
    // drift subspace
    for (const u of U) for (let c = 0; c < D; c++) u[c] += DRIFT * randn(r); gs(U);
    const Ptrue = Array.from({ length: D }, (_, i) => Float64Array.from({ length: D }, (_, j) => { let s = 0; for (const u of U) s += A * A * u[i] * u[j]; return s; }));
    let L, frame = null;
    if (arm.kind === 'fixed') L = lms(arm.alpha);
    else if (arm.kind === 'kal_iso') L = kalman(scaled(eye(), A * A * K / D * (arm.scale ?? 1)), h);
    else if (arm.kind === 'kal_oracle') L = kalman(Ptrue, h);
    else if (arm.kind === 'auto') L = autostep(eye(), arm.mu, arm.beta0, arm.inheritL2 && g ? { beta: inheritBeta } : null);
    else if (arm.kind === 'auto_oracle') { // Autostep in true frame: rows = U then orthogonal complement
      const rows = [...U.map(u => Float64Array.from(u))]; while (rows.length < D) rows.push(Float64Array.from({ length: D }, () => randn(re))); gs(rows); frame = rows;
      L = autostep(frame, arm.mu, arm.beta0, arm.inheritL2 && g ? { beta: inheritBeta } : null);
    } else if (arm.kind === 'kal_meta3' || arm.kind === 'pre_meta3' || arm.kind === 'pre_oracle' || arm.kind === 'kal_sham') {
      const iso = scaled(eye(), A * A * K / D);
      const src = arm.kind === 'pre_oracle' ? Ptrue : arm.kind === 'kal_sham' ? (shamP0[g] ?? iso) : (P0 ?? iso);
      L = arm.kind === 'kal_meta3' || arm.kind === 'kal_sham' ? kalman(src, h) : precond(src, arm.c);
      L.track = arm.kind !== 'pre_oracle';
    } else if (arm.kind === 'meta3') {
      if (C) { const { vals, vecs } = eigSym(C); const ord = vals.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]); frame = ord.map(([, i]) => vecs[i]); } else frame = eye();
      L = autostep(frame, arm.mu, arm.beta0, arm.inheritL2 && g && C ? { beta: inheritBeta } : null);
    }
    let w = null;
    for (let t = 0; t < T; t++) {
      if (t % S === 0) { const z = Array.from({ length: K }, () => A * randn(r)); w = new Float64Array(D); for (let q = 0; q < K; q++) for (let c = 0; c < D; c++) w[c] += z[q] * U[q][c]; }
      const x = Float64Array.from({ length: D }, () => r() < .5 ? -1 : 1);
      let mu = 0; for (let c = 0; c < D; c++) mu += w[c] * x[c];
      const y = mu + SIG * randn(r);
      if (g >= G / 2) { if (L.pred(x) > 0) score += mu; n++; }
      L.learn(x, y);
      if (L.track) { const wh = new Float64Array(D); for (let c = 0; c < D; c++) { const e = new Float64Array(D); e[c] = 1; wh[c] = L.pred(e); } (L.Cl ??= Array.from({ length: D }, () => new Float64Array(D))); for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) L.Cl[i][j] += wh[i] * wh[j] / T; }
    }
    if (L.track) { // L3: blend L2's realized posterior-mean second moment into next generation's reset prior
      let tr = 0; for (let i = 0; i < D; i++) tr += L.Cl[i][i];
      const tgt = A * A * K, iso = A * A * K / D;
      const Cn = L.Cl.map((row, i) => row.map((v, j) => arm.lam * v * tgt / tr + (i === j ? (1 - arm.lam) * iso : 0)));
      P0 = P0 ? P0.map((row, i) => row.map((v, j) => (1 - arm.rho) * v + arm.rho * Cn[i][j])) : Cn;
      hist.push(P0);
    }
    if (L.beta) inheritBeta = Float64Array.from(L.beta);
    if (arm.kind === 'meta3') { // L3: accumulate covariance of L2's realized updates, mapped back to raw coords
      const Cn = Array.from({ length: D }, () => new Float64Array(D));
      // sum updates per switch-segment (the net move L2 made for each task)
      for (let s0 = 0; s0 < T; s0 += S) { const net = new Float64Array(D); for (let t = s0; t < Math.min(T, s0 + S); t++) for (let i = 0; i < D; i++) net[i] += L.dw[t][i];
        const raw = new Float64Array(D); for (let i = 0; i < D; i++) for (let c = 0; c < D; c++) raw[c] += frame[i][c] * net[i];
        for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) Cn[i][j] += raw[i] * raw[j]; }
      if (!C) C = Cn; else for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) C[i][j] = (1 - arm.rho) * C[i][j] + arm.rho * Cn[i][j];
      // re-express inherited beta: frame changes, keep beta sorted with eigen order (top-k get the large ones)
      const sorted = Float64Array.from(inheritBeta).sort((a, b) => b - a); inheritBeta = sorted;
    }
  }
  return arm.wantHist ? hist : score / n;
}
function lineageP0s(seed, arm) { return lineage(seed, { ...arm, kind: 'kal_meta3', wantHist: true }).map((P, i, a) => a[i - 1] ?? null); }

const arms = [
  { name: 'FIXED_.02', kind: 'fixed', alpha: .02 }, { name: 'FIXED_.05', kind: 'fixed', alpha: .05 },
  { name: 'AUTO', kind: 'auto', mu: .02, beta0: Math.log(.03), inheritL2: true },
  { name: 'AUTO_noinh', kind: 'auto', mu: .02, beta0: Math.log(.03) },
  { name: 'KAL_ISO', kind: 'kal_iso' }, { name: 'KAL_ISO_x2', kind: 'kal_iso', scale: 2 },
  { name: 'ORACLE3', kind: 'auto_oracle', mu: .02, beta0: Math.log(.03), inheritL2: true },
  { name: 'META3', kind: 'meta3', mu: .02, beta0: Math.log(.03), inheritL2: true, rho: .2 },
  { name: 'KAL_ORACLE(ref)', kind: 'kal_oracle' },
  { name: 'P11_KAL_META3', kind: 'kal_meta3', lam: .8, rho: .3 },
  { name: 'P01_PRE_META3', kind: 'pre_meta3', lam: .8, rho: .3, c: .1 },
  { name: 'PRE_ORACLE', kind: 'pre_oracle', c: .1 },
  { name: 'SHAM_KAL', kind: 'kal_sham', lam: .8, rho: .3 },
  ...[.01, .1].map(alpha => ({ name: 'FIXED_' + alpha, kind: 'fixed', alpha })),
  ...[.5, .25].map(scale => ({ name: 'KAL_ISO_' + scale, kind: 'kal_iso', scale })),
  ...[.03, .3, .6].map(c => ({ name: 'P01_c' + c, kind: 'pre_meta3', lam: .8, rho: .3, c })),
];
const only = args.arms ? args.arms.split(',') : null;
const res = {};
for (const a of arms) { if (only && !only.includes(a.name)) continue; res[a.name] = []; for (let s = SEEDS[0]; s <= SEEDS[1]; s++) res[a.name].push(lineage(s, a)); }
const mean = v => v.reduce((a, b) => a + b) / v.length;
for (const [k, v] of Object.entries(res)) console.log(k.padEnd(16), mean(v).toFixed(4));
const best = pre => Object.entries(res).filter(([k]) => k.startsWith(pre)).sort((a, b) => mean(b[1]) - mean(a[1]))[0];
const F = best('FIXED'), L2 = best('KAL_ISO'), P01 = best('P01'), P11 = res.P11_KAL_META3;
if (F && L2 && P01 && P11) { const f0 = mean(F[1]), d4 = 2 * (mean(P11) - f0) - 3 * (mean(L2[1]) - f0), fac = 2 * (mean(P11) - mean(P01[1])) - 3 * (mean(L2[1]) - f0);
  console.log(`best FIXED ${F[0]}  L2 ${L2[0]}  P01 ${P01[0]} | d4 ${d4.toFixed(4)} ratio ${((mean(P11) - f0) / (mean(L2[1]) - f0)).toFixed(2)} | factorial ${fac.toFixed(4)}`); }
