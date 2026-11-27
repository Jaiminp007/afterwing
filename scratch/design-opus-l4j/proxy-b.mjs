import { proxyRun } from './proxy.mjs';
import { createWorld } from './world-orbit.mjs';
const seeds = Array.from({ length: 16 }, (_, i) => 953001 + i);
const betas = [.001, .002, .004, .007, .01, .015, .02, .03, .05];
const base = { kind: 'rot', q: 1e-3, R: 1, vdecay: 0, last: true };
const tab = seeds.map(s => betas.map(beta => proxyRun(s, { ...base, beta })));
const avg = f => seeds.reduce((a, _, i) => a + f(i), 0) / seeds.length;
const bi = betas.map((b, j) => avg(i => tab[i][j].loss));
console.log('global', betas.map((b, j) => `${b}:${bi[j].toFixed(4)}`).join(' '));
const jBest = bi.indexOf(Math.min(...bi));
// per-seed best
console.log('per-seed best', avg(i => Math.min(...tab[i].map(r => r.loss))).toFixed(4));
// per-regime hindsight: choose beta per (seed, regime) minimizing that regime's loss under constant-beta runs
const choice = seeds.map((s, i) => {
  const regs = new Set(tab[i].flatMap(r => [...r.perReg.keys()]));
  const m = new Map();
  for (const g of regs) { let bj = 0, bl = Infinity; betas.forEach((b, j) => { const a = tab[i][j].perReg.get(g); const l = a ? a[0] / a[1] : Infinity; if (l < bl) { bl = l; bj = j; } }); m.set(g, betas[bj]); }
  return m;
});
const or = seeds.map((s, i) => proxyRun(s, { ...base, beta: betas[jBest], betaOf: g => choice[i].get(g) ?? betas[jBest] }));
console.log('ORACLE3 per-regime', avg(i => or[i].loss).toFixed(4), 'err', avg(i => or[i].err).toFixed(4), ' vs best fixed', bi[jBest].toFixed(4), 'err', avg(i => tab[i][jBest].err).toFixed(4));
for (let i = 0; i < seeds.length; i++) {
  const W = createWorld(seeds[i], 16);
  console.log(seeds[i], [...choice[i].entries()].map(([g, b]) => `${g}:${b}`).join(' '), 'fix', tab[i][jBest].loss.toFixed(3), 'or', or[i].loss.toFixed(3));
}
