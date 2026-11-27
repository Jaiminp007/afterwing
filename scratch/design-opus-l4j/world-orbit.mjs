// L4-J design world "ORBIT" (constructed, not blind; scratch/design-opus-l4j).
//
// value(x) = S0 * [ u(t).x / D + bias ],  |u| = sqrt(D), so u.x/sqrt(D) ~ N(0,1) for random codes
// (we divide by D and scale S0 by sqrt(D)... see below: z = u.x / sqrt(D)).
// u(t) = sqrt(D) * ( sqrt(1-kap^2) * (cos phi a + sin phi b) + kap c ), with a, b, c orthonormal.
// The rule ROTATES in the hidden plane (a, b) at angular speed omega(t) rad/tick; c is a static part.
// omega is governed by a semi-Markov chain of regimes (menu of 3-4 per world): 'still' (omega 0) or
// 'rotate' with period P in logU[80, 2500] ticks and direction +-1. Sojourns are exponential with
// world mean M in logU[250, 1500] (x per-regime factor logU[0.5, 2], min 30 ticks); next regime is
// uniform over the other menu entries; each entry re-jitters the period by logU[0.8, 1.25].
// The frame (a, b, c) wanders: every tick each vector gets N(0, sp^2) per coordinate, then
// Gram-Schmidt; sp in logU[0.001, 0.005] per world.
// Noise sd = sd0 * regime factor (logU[0.6, 1.6]), relaxed with tau 50, clamped [0.3, 2];
// sd0 in logU[0.4, 1.2]. Stakes S0 in [1.0, 2.2]; bias in S0 units, per world in [-0.2, 0.2].
// describe() exposes the current regime for oracle arms only (never for learners).

function makeRng(seed) {
  let s = seed >>> 0;
  const sm = () => { s = (s + 0x9e3779b9) >>> 0; let z = s; z = Math.imul(z ^ z >>> 16, 0x85ebca6b); z = Math.imul(z ^ z >>> 13, 0xc2b2ae35); return (z ^ z >>> 16) >>> 0; };
  let a = sm(), b = sm(), c = sm(), d = sm();
  const r = () => {
    const t = (((a + b) | 0) + d) | 0; d = (d + 1) | 0;
    a = b ^ (b >>> 9); b = (c + (c << 3)) | 0; c = (c << 21) | (c >>> 11); c = (c + t) | 0;
    return (t >>> 0) / 4294967296;
  };
  for (let i = 0; i < 12; i++) r();
  return r;
}

export function createWorld(seed, D, opts = {}) {
  const r = makeRng(seed);
  const uni = (lo, hi) => lo + (hi - lo) * r();
  const logU = (lo, hi) => Math.exp(uni(Math.log(lo), Math.log(hi)));
  const randn = () => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
  const pLo = opts.pLo ?? 80, pHi = opts.pHi ?? 2500;
  const S0 = uni(1.0, 2.2), sd0 = logU(0.4, 1.2), meanStay = logU(250, 1500), bias = uni(-0.2, 0.2);
  const kap = uni(0, 0.5), sp = logU(0.001, 0.005);
  const frame = [0, 1, 2].map(() => Float64Array.from({ length: D }, randn));
  const gs = () => {
    for (let k = 0; k < 3; k++) {
      const v = frame[k];
      for (let j = 0; j < k; j++) { let d = 0; for (let i = 0; i < D; i++) d += v[i] * frame[j][i]; for (let i = 0; i < D; i++) v[i] -= d * frame[j][i]; }
      let n = 0; for (let i = 0; i < D; i++) n += v[i] * v[i]; n = Math.sqrt(n) || 1; for (let i = 0; i < D; i++) v[i] /= n;
    }
  };
  gs();
  const nReg = 3 + (r() < 0.5 ? 1 : 0);
  const menu = Array.from({ length: nReg }, (_, k) => {
    const still = k > 0 && r() < 0.25;
    return { still, P: still ? Infinity : logU(pLo, pHi), dir: r() < 0.5 ? -1 : 1, stay: logU(0.5, 2), noise: logU(0.6, 1.6) };
  });
  let phi = 2 * Math.PI * r(), cur = 0, omega = 0, stayLeft = 0, sd = 0, entries = 0, now = 0, entryTick = 0;
  const enter = idx => {
    cur = idx; entries++; entryTick = now;
    const g = menu[idx];
    omega = g.still ? 0 : g.dir * 2 * Math.PI / (g.P * logU(0.8, 1.25));
    stayLeft = Math.max(30, Math.round(-Math.log(1 - r()) * meanStay * g.stay));
  };
  enter(Math.floor(r() * nReg));
  sd = Math.min(2, Math.max(0.3, sd0 * menu[cur].noise));
  const u = new Float64Array(D), RN = Math.sqrt(D), ck = Math.sqrt(1 - kap * kap);
  const rebuild = () => { const ca = Math.cos(phi), sa = Math.sin(phi); for (let i = 0; i < D; i++) u[i] = RN * (ck * (ca * frame[0][i] + sa * frame[1][i]) + kap * frame[2][i]); };
  rebuild();
  return {
    step() {
      now++;
      if (--stayLeft <= 0) { let n = Math.floor(r() * (nReg - 1)); if (n >= cur) n++; enter(n); }
      phi += omega;
      for (let k = 0; k < 3; k++) for (let i = 0; i < D; i++) frame[k][i] += sp * randn();
      gs(); rebuild();
      sd = Math.min(2, Math.max(0.3, sd + (sd0 * menu[cur].noise - sd) / 50));
      return true;
    },
    value(bits) { let z = 0; for (let i = 0; i < D; i++) z += u[i] * bits[i]; return S0 * (z / RN + bias); },
    noiseSd() { return sd; },
    // oracle-only
    describe() { return { regime: cur, omega, still: menu[cur].still, P: menu[cur].P, entries, entryTick, now, S0, sd0, meanStay, sp, kap }; },
    trueW() { return Float64Array.from(u, x => S0 * x / RN); },
  };
}
