// Proxy learners for the ORBIT screen. Interface: L = make(cfg, D, st) -> { w, learn(x, y, tick), inherit() }.
// All share one Kalman core over w (D x D covariance), so per-bite cost is O(D^2).
const dot = (a, b, D) => { let s = 0; for (let i = 0; i < D; i++) s += a[i] * b[i]; return s; };

function core(D, R) {
  const w = new Float64Array(D), P = new Float64Array(D * D), px = new Float64Array(D), c = new Float64Array(D);
  for (let i = 0; i < D; i++) P[i * D + i] = 1;
  return { w, P, px, c, R,
    diffuse(q) { for (let i = 0; i < D; i++) P[i * D + i] += q; },
    // Kalman measurement update; leaves the correction vector in c; returns innovation e and S.
    update(x, y) {
      let S = this.R, p = 0;
      for (let i = 0; i < D; i++) { let v = 0; const row = i * D; for (let j = 0; j < D; j++) v += P[row + j] * x[j]; px[i] = v; S += v * x[i]; p += w[i] * x[i]; }
      const e = y - p, g = e / S;
      for (let i = 0; i < D; i++) { c[i] = px[i] * g; w[i] += c[i]; }
      for (let i = 0; i < D; i++) { const a = px[i] / S, row = i * D; for (let j = 0; j < D; j++) P[row + j] -= a * px[j]; }
      return { e, S };
    },
    // Rotate w-space by angle th in plane (e1, e2) (orthonormal): w <- M w, P <- M P M'.
    rotate(e1, e2, th) {
      const ct = Math.cos(th) - 1, st = Math.sin(th);
      // M = I + ct (e1 e1' + e2 e2') + st (e2 e1' - e1 e2')
      const a1 = dot(e1, w, D), a2 = dot(e2, w, D);
      for (let i = 0; i < D; i++) w[i] += ct * (e1[i] * a1 + e2[i] * a2) + st * (e2[i] * a1 - e1[i] * a2);
      // P <- M P M' = (I+K) P (I+K)' with K rank 2: do left then right multiply.
      const u1 = new Float64Array(D), u2 = new Float64Array(D);
      for (let pass = 0; pass < 2; pass++) {
        // left: P <- (I+K) P. Row-space: for each column j, Pcol += K Pcol. K v = ct(e1(e1.v)+e2(e2.v)) + st(e2(e1.v) - e1(e2.v))
        // compute u1 = e1' P (row vector), u2 = e2' P
        u1.fill(0); u2.fill(0);
        for (let i = 0; i < D; i++) { const row = i * D, b1 = e1[i], b2 = e2[i]; for (let j = 0; j < D; j++) { u1[j] += b1 * P[row + j]; u2[j] += b2 * P[row + j]; } }
        for (let i = 0; i < D; i++) { const k1 = ct * e1[i] + st * e2[i], k2 = ct * e2[i] - st * e1[i], row = i * D; for (let j = 0; j < D; j++) P[row + j] += k1 * u1[j] + k2 * u2[j]; }
        // transpose in place (P symmetric before left multiply; after left multiply, (I+K)P; right multiply = transpose trick)
        for (let i = 0; i < D; i++) for (let j = i + 1; j < D; j++) { const t = P[i * D + j]; P[i * D + j] = P[j * D + i]; P[j * D + i] = t; }
      }
    },
  };
}

// depth 1: random-walk Kalman, q per tick.
export function krw(cfg, D, st) {
  const k = core(D, cfg.R); let last = -1;
  if (st?.length) k.w.set(st.subarray(0, D)), k.P.fill(0), [...Array(D)].forEach((_, i) => k.P[i * D + i] = cfg.p0 ?? .05);
  return { w: k.w, depth: 1, learn(x, y, t) { const dt = last < 0 ? 1 : t - last; last = t; k.diffuse(cfg.q * dt); k.update(x, y); },
    inherit: () => cfg.last ? Float64Array.from(k.w) : new Float64Array(0) };
}

// depth 1 (conservative): linear constant-velocity alpha-beta Kalman. v <- v + beta * c / dt.
export function cv(cfg, D, st) {
  const k = core(D, cfg.R), v = new Float64Array(D); let last = -1;
  if (st?.length) { k.w.set(st.subarray(0, D)); if (st.length >= 2 * D) v.set(st.subarray(D, 2 * D)); k.P.fill(0); for (let i = 0; i < D; i++) k.P[i * D + i] = cfg.p0 ?? .05; }
  return { w: k.w, v, depth: 1,
    learn(x, y, t) {
      const dt = last < 0 ? 1 : t - last; last = t;
      for (let i = 0; i < D; i++) k.w[i] += v[i] * dt;
      k.diffuse(cfg.q * dt); k.update(x, y);
      const b = cfg.beta / Math.max(1, dt);
      for (let i = 0; i < D; i++) v[i] = (1 - cfg.vdecay) * v[i] + b * k.c[i];
    },
    inherit: () => cfg.last ? Float64Array.from([...k.w, ...v]) : new Float64Array(0) };
}

// depth 2: rotation-geometry dynamics learner. L2 state v (velocity of w); L1's transition model is a
// rotation in span(w, v) at angular rate |v_perp|/|w|. L2 learns v from L1's corrections with gain beta.
// setBeta(lb) exposes the L2 setting (log beta) for ORACLE3/META3.
export function rot(cfg, D, st) {
  const k = core(D, cfg.R), v = new Float64Array(D), e1 = new Float64Array(D), e2 = new Float64Array(D); let last = -1, beta = cfg.beta;
  if (st?.length) { k.w.set(st.subarray(0, D)); if (st.length >= 2 * D) v.set(st.subarray(D, 2 * D)); k.P.fill(0); for (let i = 0; i < D; i++) k.P[i * D + i] = cfg.p0 ?? .05; }
  const L = { w: k.w, v, depth: 2, k, get beta() { return beta; }, setBeta(b) { beta = b; },
    predict(dt) {
      const n2 = dot(k.w, k.w, D); if (n2 < 1e-6) return;
      const n = Math.sqrt(n2), a = dot(v, k.w, D) / n2;
      let vp2 = 0; for (let i = 0; i < D; i++) { e1[i] = k.w[i] / n; e2[i] = v[i] - a * k.w[i]; vp2 += e2[i] * e2[i]; }
      const vp = Math.sqrt(vp2); if (vp < 1e-9) return;
      for (let i = 0; i < D; i++) e2[i] /= vp;
      const th = vp * dt / n;
      k.rotate(e1, e2, th);
      // rotate v's in-plane perpendicular component along with w; drop radial part (rotation keeps |w|)
      const c = Math.cos(th), s = Math.sin(th);
      for (let i = 0; i < D; i++) v[i] = vp * (-s * e1[i] + c * e2[i]);
    },
    learn(x, y, t) {
      const dt = last < 0 ? 1 : t - last; last = t;
      L.predict(dt);
      k.diffuse(cfg.q * dt); const r = k.update(x, y);
      // Class F schedule (flat): beta is a fixed function of L2's own state estimate omega_hat = |v|/|w|.
      if (cfg.sched) { const wn = Math.sqrt(dot(k.w, k.w, D)), om = wn > 1e-3 ? Math.sqrt(dot(v, v, D)) / wn : 0; beta = Math.min(.05, Math.max(cfg.floor, cfg.a * Math.pow(Math.max(om, 1e-5) / .01, cfg.g))); }
      const b = beta / Math.max(1, dt);
      for (let i = 0; i < D; i++) v[i] = (1 - cfg.vdecay) * v[i] + b * k.c[i];
      return r;
    },
    inherit: () => cfg.last ? Float64Array.from([...k.w, ...v]) : new Float64Array(0) };
  return L;
}

export const MAKERS = { krw, cv, rot };
