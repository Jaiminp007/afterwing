// Proxy: does an oracle beta(omega) map beat the best constant beta? (tuning seeds only)
import { proxyRun } from './proxy.mjs';
const seeds = Array.from({ length: 16 }, (_, i) => 953001 + i);
const base = { kind: 'rot', q: 1e-3, R: 1, vdecay: 0, last: true };
const avg = rs => [rs.reduce((a, r) => a + r.loss, 0) / rs.length, rs.reduce((a, r) => a + r.err, 0) / rs.length];
const show = (name, rs) => { const [l, e] = avg(rs); console.log(name.padEnd(34), l.toFixed(4), e.toFixed(4)); return l; };
for (const beta of [.007, .01, .015]) show(`const ${beta}`, seeds.map(s => proxyRun(s, { ...base, beta })));
for (const a of [.007, .01, .015, .02]) for (const g of [-.5, 0, .5, 1]) for (const bStill of [.001, .005]) {
  const map = (_, d) => d.still ? bStill : a * Math.pow(Math.abs(d.omega) / 0.01, g);
  show(`map a${a} g${g} still${bStill}`, seeds.map(s => proxyRun(s, { ...base, beta: a, betaOf: map })));
}
