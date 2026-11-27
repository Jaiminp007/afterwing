// Fast per-regime diagnostic on tuning seed 951001 ONLY (D=12, N=66 pairs)
// Tests each of the 16 regimes individually to measure:
//   - FIXED (LAST_HUBER) vs L2 vs ORACLE3 vs SHARE3 vs OPENLOOP_CF
//   - Whether all 4 axes have large, genuine, non-redundant effects on L2!
import { WorldL4J } from './harness.mjs';
import { createWorld } from './world.mjs';
import * as armsMod from './learners.mjs';
import { regimeL2Params, interpL2Params } from './learners.mjs';

const CFG = { D: 12, toxin: 1.05, acceptAt: 0.48, ticks: 8000, lateFrom: 3000, every: 100 };
const SEED = 951001;

function runRegime(regId, arm) {
  const worldMod = { createWorld: (s, D) => createWorld(s, D, { fixedRegime: regId, subEvery: 260, S: 2.5 }) };
  const w = new WorldL4J(SEED, arm, worldMod, armsMod, CFG);
  let popSum = 0, skillSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) {
      popSum += w.flies.length; skillSum += w.skill(); nLate++;
    }
  }
  return { pop: popSum / nLate, skill: skillSum / nLate };
}

const ARMS = [
  { name: 'LAST', kind: 'pairLMS', alpha: 0.012, eClip: 1.8, wDecay: 0.004, inheritW: true },
  { name: 'L2_MID', kind: 'pairL2', params: interpL2Params(0.5, 0.5, 0.5, 0.5) },
  { name: 'L2_P0N0C0S0', kind: 'pairL2', params: regimeL2Params({ supportMode: 0, noiseMode: 0, changeMode: 0, sparseMode: 0 }) },
  { name: 'L2_P1N1C0S0', kind: 'pairL2', params: regimeL2Params({ supportMode: 1, noiseMode: 1, changeMode: 0, sparseMode: 0 }) },
  { name: 'L2_P0N1C1S1', kind: 'pairL2', params: regimeL2Params({ supportMode: 0, noiseMode: 1, changeMode: 1, sparseMode: 1 }) },
  {
    name: 'SHARE3', kind: 'shareL2', etaMix: 0.25, share: 0.02, lossClip: 3.0,
    experts: [
      regimeL2Params({ supportMode: 0, noiseMode: 0, changeMode: 0, sparseMode: 0 }),
      regimeL2Params({ supportMode: 1, noiseMode: 1, changeMode: 0, sparseMode: 0 }),
      regimeL2Params({ supportMode: 0, noiseMode: 1, changeMode: 1, sparseMode: 1 }),
    ],
  },
  { name: 'OPENLOOP', kind: 'openLoopClassF' },
  { name: 'ORACLE3', kind: 'pairL2', params: interpL2Params(0.5, 0.5, 0.5, 0.5), isOracle: true },
];

console.log('Reg(SNCS) |   LAST    |  L2_MID   |  SHARE3   | OPENLOOP  |  ORACLE3  | O3-SH3(pop) | O3-OL(pop)');
console.log('----------|-----------|-----------|-----------|-----------|-----------|-------------|-----------');
const sums = Object.fromEntries(ARMS.map(a => [a.name, { pop: 0, skill: 0 }]));
for (let r = 0; r < 16; r++) {
  const tag = `${(r>>0)&1}${(r>>1)&1}${(r>>2)&1}${(r>>3)&1}`;
  const res = {};
  for (const a of ARMS) {
    res[a.name] = runRegime(r, a);
    sums[a.name].pop += res[a.name].pop;
    sums[a.name].skill += res[a.name].skill;
  }
  const fmt = x => `${x.pop.toFixed(1).padStart(4)}/${x.skill.toFixed(2)}`;
  console.log(`  ${String(r).padStart(2)} ${tag} | ${fmt(res.LAST)} | ${fmt(res.L2_MID)} | ${fmt(res.SHARE3)} | ${fmt(res.OPENLOOP)} | ${fmt(res.ORACLE3)} | ${(res.ORACLE3.pop - res.SHARE3.pop).toFixed(1).padStart(11)} | ${(res.ORACLE3.pop - res.OPENLOOP.pop).toFixed(1).padStart(9)}`);
}
console.log('----------|-----------|-----------|-----------|-----------|-----------|-------------|-----------');
const fmtAvg = n => `${(sums[n].pop/16).toFixed(1).padStart(4)}/${(sums[n].skill/16).toFixed(2)}`;
console.log(`  MEAN    | ${fmtAvg('LAST')} | ${fmtAvg('L2_MID')} | ${fmtAvg('SHARE3')} | ${fmtAvg('OPENLOOP')} | ${fmtAvg('ORACLE3')} | ${((sums.ORACLE3.pop - sums.SHARE3.pop)/16).toFixed(1).padStart(11)} | ${((sums.ORACLE3.pop - sums.OPENLOOP.pop)/16).toFixed(1).padStart(9)}`);
