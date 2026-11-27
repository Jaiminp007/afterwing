// L4-I world family 1: "regime-switching foraging worlds".
//
// Food quality of an odor code x in {-1,+1}^D is
//   value(x) = S(t) * [ sqrt(1 - lam(t)^2) * w(t).x / |w(t)|  +  lam(t) * I(x)  +  b(t) ]
// where w(t) is a hidden rule vector (optionally masked to k relevant bits), I(x) is a fixed
// set of unit-variance pairwise conjunctions, b(t) is a bias in SD units, and S(t) a stakes scale.
// For random codes the bracket has mean ~b and SD ~1, so good and bad odors are both common.
//
// What changes over time is governed by a hidden semi-Markov chain of REGIMES. Each world has a
// menu of 3-5 regimes; each regime has its own change mechanism and rate, its own noise level,
// stakes, bias target and (for some worlds) conjunction weight. Sojourns are exponential with
// world mean M in [120, 1000] ticks (times a per-regime factor in [0.5, 2], min 20 ticks), so a
// fly (lifespan 2400) lives through several regimes: the rate AND character of change shift
// within a lifetime. Each entry into a regime re-jitters its rate by a factor in [0.6, 1.7].
// When the sojourn ends the next regime is drawn uniformly from the other menu entries.
//
// Change mechanisms (per tick):
//   still    : rule frozen.
//   drift    : w += sigma * N(0, I), sigma per regime (slow 0.002-0.01, fast 0.015-0.05).
//   flip     : at hazard h, m random weights are sign-flipped (or redrawn, p 0.5); m = D is a
//              full reversal of good and bad.
//   glide    : w relaxes toward one of K in [2, 5] recurrent prototype rules at rate rho; at
//              hazard h the target switches to another prototype. rho = 1 is an abrupt jump.
//   cycle    : (w, B) rotate in a plane at angular speed omega = +-2pi / P, P in [150, 3000]:
//              a seasonal clock whose speed and direction differ between regimes.
//   turnover : (sparse worlds) at hazard h one relevant bit becomes irrelevant and a fresh
//              irrelevant bit gains a new random weight.
// Bias, stakes and conjunction weight relax toward the regime's targets (tau 60-400 ticks);
// taste noise relaxes toward sd0 * regime noise factor (tau 50), clamped to [0.3, 2].
//
// World types (one per seed, uniform over 6):
//   weather  : still + slow drift + fast drift (+ second fast drift, p 0.5). Noise rises
//              with drift speed (storms are noisy).
//   shocks   : still + frequent small flips (m 1-2, h 1/300-1/40) + rare large flips
//              (m 4-8, h 1/900-1/150) (+ full reversals, h 1/2000-1/400, p 0.6).
//   niches   : still + slow glide (h 1/600-1/150, rho 0.002-0.01) + fast glide (h 1/300-1/60,
//              rho 0.02-0.1) + jumps (h 1/700-1/150, rho 1).
//   sparse   : k in [3, 7] relevant bits; still + slow turnover (h 1/600-1/150) + fast
//              turnover (h 1/120-1/30) + drift (sigma 0.003-0.02).
//   seasonal : 3-4 cycle regimes with independent periods/directions (+ still, p 0.5).
//   mixed    : 3-5 regimes drawn from all mechanisms above; sparse with p 0.5 (turnover only
//              when sparse).
// Per-world parameters (all worlds): stakes S0 in [0.9, 2.2]; noise sd0 in [0.35, 1.3]
// (log-uniform); bias bound bmax in [0, 0.35] with per-regime targets in [-bmax, bmax];
// regime stakes factor in [0.75, 1.35]; regime noise factor in [0.6, 1.8] (log-uniform; for
// weather it is tied to sigma instead); conjunctions: 2-5 pairs, mode none (p 0.5),
// fixed lam in [0.2, 0.6] (p 0.25), or per-regime lam targets in [0, 0.7] (p 0.25).
//
// Seed handling: a single sfc32 generator seeded from `seed` (via splitmix32) draws, in order,
// the type, the per-world parameters, the initial vectors, the menu and then all per-tick
// events. value() and noiseSd() read only cached state and draw nothing.

const TAU = 2 * Math.PI;

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

const TYPES = ['weather', 'shocks', 'niches', 'sparse', 'seasonal', 'mixed'];

export function createWorld(seed, D) {
  const r = makeRng(seed);
  const uni = (a, b) => a + (b - a) * r();
  const logU = (a, b) => Math.exp(uni(Math.log(a), Math.log(b)));
  const int = (a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = arr => arr[Math.floor(r() * arr.length)];
  const randn = () => { let u = 0, v = 0; while (u === 0) u = r(); while (v === 0) v = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  const randVec = () => Float64Array.from({ length: D }, randn);
  const norm = v => Math.sqrt(v.reduce((s, x) => s + x * x, 0));
  const rescale = (v, n) => { const k = n / (norm(v) || 1); for (let i = 0; i < D; i++) v[i] *= k; };
  const sample = (n, m) => { const idx = Array.from({ length: n }, (_, i) => i); for (let i = 0; i < m; i++) { const j = i + Math.floor(r() * (n - i)); [idx[i], idx[j]] = [idx[j], idx[i]]; } return idx.slice(0, m); };

  const type = pick(TYPES);
  const S0 = uni(0.9, 2.2), sd0 = logU(0.35, 1.3), meanStay = logU(120, 1000), bmax = uni(0, 0.35);
  const sparseK = type === 'sparse' || (type === 'mixed' && r() < 0.5) ? int(3, 7) : 0;
  const lamMode = pick(['none', 'none', 'fixed', 'regime']);
  const lamFixed = uni(0.2, 0.6);
  const RN = Math.sqrt(D);

  const u = randVec(); rescale(u, RN);
  const B = randVec();
  const orthB = () => {
    for (let tries = 0; tries < 4; tries++) {
      const dot = u.reduce((s, x, i) => s + x * B[i], 0) / (RN * RN);
      for (let i = 0; i < D; i++) B[i] -= dot * u[i];
      if (norm(B) > 1e-3) break;
      for (let i = 0; i < D; i++) B[i] = randn();
    }
    rescale(B, RN);
  };
  orthB();
  const mask = new Uint8Array(D).fill(sparseK ? 0 : 1);
  if (sparseK) for (const i of sample(D, sparseK)) mask[i] = 1;
  const nProto = int(2, 5);
  const protos = Array.from({ length: nProto }, () => { const p = randVec(); rescale(p, RN); return p; });
  let target = 0;
  if (type === 'niches') u.set(protos[0]);
  const pairs = sample(D * (D - 1) / 2, int(2, 5)).map(k => {
    let i = 0; while (k >= D - 1 - i) { k -= D - 1 - i; i++; }
    return [i, i + 1 + k, randn()];
  });
  const pairNorm = Math.sqrt(pairs.reduce((s, p) => s + p[2] * p[2], 0)) || 1;

  const regime = (kind, rate = {}) => ({
    kind, ...rate, stay: logU(0.5, 2), noise: logU(0.6, 1.8), mag: logU(0.75, 1.35),
    bias: uni(-bmax, bmax), lam: lamMode === 'regime' ? uni(0, 0.7) : lamMode === 'fixed' ? lamFixed : 0,
  });
  const make = {
    still: () => regime('still'),
    driftSlow: () => regime('drift', { sigma: logU(0.002, 0.01) }),
    driftFast: () => regime('drift', { sigma: logU(0.015, 0.05) }),
    flipSmall: () => regime('flip', { hazard: logU(1 / 300, 1 / 40), m: int(1, 2), redraw: r() < 0.5 }),
    flipLarge: () => regime('flip', { hazard: logU(1 / 900, 1 / 150), m: int(4, Math.max(4, D >> 1)), redraw: r() < 0.5 }),
    reversal: () => regime('flip', { hazard: logU(1 / 2000, 1 / 400), m: D, redraw: false }),
    glideSlow: () => regime('glide', { hazard: logU(1 / 600, 1 / 150), rho: logU(0.002, 0.01) }),
    glideFast: () => regime('glide', { hazard: logU(1 / 300, 1 / 60), rho: logU(0.02, 0.1) }),
    jump: () => regime('glide', { hazard: logU(1 / 700, 1 / 150), rho: 1 }),
    cycle: () => regime('cycle', { omega: (r() < 0.5 ? -1 : 1) * TAU / logU(150, 3000) }),
    turnSlow: () => regime('turnover', { hazard: logU(1 / 600, 1 / 150) }),
    turnFast: () => regime('turnover', { hazard: logU(1 / 120, 1 / 30) }),
    driftSparse: () => regime('drift', { sigma: logU(0.003, 0.02) }),
  };
  let names;
  if (type === 'weather') names = ['still', 'driftSlow', 'driftFast', ...(r() < 0.5 ? ['driftFast'] : [])];
  else if (type === 'shocks') names = ['still', 'flipSmall', 'flipLarge', ...(r() < 0.6 ? ['reversal'] : [])];
  else if (type === 'niches') names = ['still', 'glideSlow', 'glideFast', 'jump'];
  else if (type === 'sparse') names = ['still', 'turnSlow', 'turnFast', 'driftSparse'];
  else if (type === 'seasonal') names = [...Array(int(3, 4)).fill('cycle'), ...(r() < 0.5 ? ['still'] : [])];
  else {
    const pool = Object.keys(make).filter(n => n !== 'driftSparse' && (sparseK || !n.startsWith('turn')));
    names = Array.from({ length: int(3, 5) }, () => pick(pool));
  }
  const menu = names.map(n => make[n]());
  if (type === 'weather') for (const g of menu) g.noise = Math.exp(uni(-0.15, 0.15)) * (1 + 14 * (g.sigma ?? 0));

  let cur = null, curIdx = -1, jit = 1, stayLeft = 0;
  const enter = idx => {
    curIdx = idx; cur = menu[idx]; jit = logU(0.6, 1.7);
    stayLeft = Math.max(20, Math.round(-Math.log(1 - r()) * meanStay * cur.stay));
  };
  enter(Math.floor(r() * menu.length));
  let bias = cur.bias, mag = cur.mag, lam = cur.lam, sd = Math.min(2, Math.max(0.3, sd0 * cur.noise));
  const tauSlow = uni(60, 400);

  const wEff = new Float64Array(D), pairCoef = new Float64Array(pairs.length);
  let bEff = 0;
  const rebuild = () => {
    let n2 = 0;
    for (let i = 0; i < D; i++) { wEff[i] = mask[i] ? u[i] : 0; n2 += wEff[i] * wEff[i]; }
    const k = S0 * mag * Math.sqrt(1 - lam * lam) / (Math.sqrt(n2) || 1);
    for (let i = 0; i < D; i++) wEff[i] *= k;
    for (let p = 0; p < pairs.length; p++) pairCoef[p] = S0 * mag * lam * pairs[p][2] / pairNorm;
    bEff = S0 * mag * bias;
  };
  rebuild();

  const relax = (x, t, tau) => Math.abs(t - x) < 1e-4 ? t : x + (t - x) / tau;

  return {
    step(tick) {
      if (--stayLeft <= 0) {
        let next = Math.floor(r() * (menu.length - 1));
        if (next >= curIdx) next++;
        enter(menu.length > 1 ? next : curIdx);
      }
      let changed = false;
      const g = cur;
      if (g.kind === 'drift') {
        const s = g.sigma * jit;
        for (let i = 0; i < D; i++) u[i] += s * randn();
        changed = true;
      } else if (g.kind === 'flip') {
        if (r() < g.hazard * jit) {
          for (const i of sample(D, Math.min(D, g.m))) u[i] = g.redraw ? randn() : -u[i];
          changed = true;
        }
      } else if (g.kind === 'glide') {
        if (r() < g.hazard * jit) { let t = Math.floor(r() * (nProto - 1)); if (t >= target) t++; target = t; }
        const P = protos[target], rho = Math.min(1, g.rho * jit);
        let d2 = 0;
        for (let i = 0; i < D; i++) { const d = P[i] - u[i]; d2 += d * d; u[i] += rho * d; }
        changed = d2 > 1e-8;
      } else if (g.kind === 'cycle') {
        const c = Math.cos(g.omega * jit), s = Math.sin(g.omega * jit);
        for (let i = 0; i < D; i++) { const a = u[i], b = B[i]; u[i] = c * a + s * b; B[i] = -s * a + c * b; }
        changed = true;
      } else if (g.kind === 'turnover') {
        if (r() < g.hazard * jit) {
          const on = [], off = [];
          for (let i = 0; i < D; i++) (mask[i] ? on : off).push(i);
          if (off.length) { const j = pick(off); mask[pick(on)] = 0; mask[j] = 1; u[j] = randn(); changed = true; }
        }
      }
      if (changed) { rescale(u, RN); orthB(); }
      const b0 = bias, m0 = mag, l0 = lam;
      bias = relax(bias, g.bias, tauSlow); mag = relax(mag, g.mag, tauSlow); lam = relax(lam, g.lam, tauSlow);
      if (bias !== b0 || mag !== m0 || lam !== l0) changed = true;
      sd = Math.min(2, Math.max(0.3, relax(sd, sd0 * g.noise, 50)));
      if (changed) rebuild();
      return changed;
    },
    value(bits) {
      let z = bEff;
      for (let i = 0; i < D; i++) z += wEff[i] * bits[i];
      for (let p = 0; p < pairs.length; p++) z += pairCoef[p] * bits[pairs[p][0]] * bits[pairs[p][1]];
      return z;
    },
    noiseSd() { return sd; },
    describe() { return { type, sparseK, lamMode, regimes: names, regime: `${curIdx}:${names[curIdx]}` }; },
  };
}
