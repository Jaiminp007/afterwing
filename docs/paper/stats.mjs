// Exact statistics for the Microverse paper. Independent of the runners' Monte Carlo code,
// which is defective (docs/paper/AUDIT_CONTROLS.md, finding 2).

export const mean = xs => xs.reduce((a, b) => a + b, 0) / xs.length;

function xorshift(seed) { let a = BigInt(seed) | 1n, b = 0x9E3779B97F4A7C15n; const M = (1n << 64n) - 1n;
  return () => { let s1 = a; const s0 = b; a = s0; s1 ^= (s1 << 23n) & M; b = s1 ^ s0 ^ (s1 >> 17n) ^ (s0 >> 26n); return Number(((b + s0) & M) >> 11n) / 2 ** 53; }; }

// Exact one-sided sign-flip p: P(sum of randomly signed d >= observed sum), all 2^n flips.
// Differences are put on a 1/grid lattice and the null distribution of the signed sum is
// built by dynamic programming, so this is exact for the gridded data (no Monte Carlo).
export function signflip(d, grid = 100) {
  const v = d.map(x => Math.round(Math.abs(x) * grid)), obs = d.reduce((a, x, i) => a + Math.sign(x) * v[i], 0), S = v.reduce((a, b) => a + b, 0);
  let dist = new Float64Array(2 * S + 1); dist[S] = 1; // index = signed sum + S
  for (const k of v) { if (!k) continue; const next = new Float64Array(2 * S + 1);
    for (let i = 0; i <= 2 * S; i++) if (dist[i]) { next[i + k] += dist[i] / 2; next[i - k] += dist[i] / 2; } dist = next; }
  let p = 0; for (let i = obs + S; i <= 2 * S; i++) p += dist[i]; return p;
}

// Percentile bootstrap 95% CI of the mean over seeds.
export function bootCI(d, reps = 20000) {
  const r = xorshift(4242), n = d.length, ms = new Float64Array(reps);
  for (let k = 0; k < reps; k++) { let s = 0; for (let i = 0; i < n; i++) s += d[Math.floor(r() * n)]; ms[k] = s / n; }
  ms.sort(); return [ms[Math.floor(.025 * reps)], ms[Math.ceil(.975 * reps) - 1]];
}

// Self-checks of the test itself (the audit's counterexample, and a closed form).
const six = [...Array(6).fill(1), ...Array(42).fill(0)];
if (Math.abs(signflip(six) - 1 / 64) > 1e-12) throw new Error('signflip self-check failed (1/64)');
if (Math.abs(signflip(Array(48).fill(1)) - 2 ** -48) > 1e-25) throw new Error('signflip self-check failed (2^-48)');
