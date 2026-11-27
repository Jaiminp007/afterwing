// Exp 5: Stress-test L4-B Design 1 (M=11 complete 1-factorization of K_12) on seeds 2401-2416 ONLY.
// Tests:
//   - Strongest single-level challengers: SCALAR grid, SCALAR_SUPP, PAIRX grid, ANTIPAIRX grid,
//     TRANSX_SHARP grid (12x12 clean single-bit-shared transition matrix!), MIX_SHADOW.
//   - META3_MC refinements (mcDecay, recency window dt<=600t, confidence-scaled suppression).
//   - Fair controls: SHAM3_MC, SHAM3_MC_DET (deterministic label-neutral), EVOR_SV grid, META3_RESET, ORACLE3.
//   - Also checks eraEvery=3600 vs 4800.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { WorldCreditV2, MATCHINGS_11, BASE_CFG, B, isPredictedByRule } from './l4b_credit_v2.mjs';
import { signflip, mean } from '../../docs/paper/stats.mjs';

const ALL_BITS = Array.from({ length: B }, (_, i) => i);
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

class WorldCreditV3 extends WorldCreditV2 {
  spawn(parent, x, y, energy, gen) {
    const f = super.spawn(parent, x, y, energy, gen);
    f.lastValTick = (parent && this.arm.inheritLast) ? parent.lastValTick : -1e9;
    return f;
  }

  l2Update(f) {
    const cfg = this.cfg, arm = this.arm;
    const newlyVal = [], allVal = [];
    for (let i = 1; i < f.masks.length; i++) {
      if (f.maskAge[i] >= cfg.graceTastings && Math.abs(f.w[i]) >= cfg.valThresh) {
        allVal.push(i);
        if (!f.maskVal[i]) {
          f.maskVal[i] = true;
          newlyVal.push(i);
          this.tel.vals++;
        }
      }
    }

    if (newlyVal.length) {
      for (const idx of newlyVal) {
        const m = f.masks[idx];
        const dt = this.tick - f.lastValTick;
        const fresh = !cfg.maxValDt || dt <= cfg.maxValDt;
        if ((arm.l3 === 'metacredit' || arm.l3 === 'sham_mc' || arm.l3 === 'sham_mc_det') && f.lastVal && f.lastVal !== m && fresh) {
          let anyHit = false;
          const hits = new Uint8Array(this.M);
          for (let r = 0; r < this.M; r++) {
            if (isPredictedByRule(this.matchings[r], f.lastVal, m)) { hits[r] = 1; anyHit = true; }
          }
          if (anyHit) {
            for (let r = 0; r < this.M; r++) f.u[r] = (1 - cfg.mcDecay) * f.u[r] + hits[r];
          }
        }
        // TRANSX_SHARP: cleanest possible single-level temporal partner learner (no rule menu):
        // when lastVal and m share exactly 1 bit, the two differing bits are partners -> increment T[u][v]!
        if (arm.usesTSharp && f.lastVal && f.lastVal !== m && fresh) {
          const [la, lb] = pairBits(f.lastVal);
          const [ca, cb] = pairBits(m);
          let u = -1, v = -1;
          if (la === ca) { u = lb; v = cb; }
          else if (la === cb) { u = lb; v = ca; }
          else if (lb === ca) { u = la; v = cb; }
          else if (lb === cb) { u = la; v = ca; }
          if (u >= 0 && v >= 0 && u !== v) {
            f.T[u][v] = f.T[v][u] = Math.min(cfg.tCap, f.T[u][v] + cfg.tInc);
          }
        }
        f.lastVal = m;
        f.lastValTick = this.tick;
      }
    }

    for (let b = 0; b < B; b++) f.alpha[b] = Math.max(.05, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));
    if (f.G) for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.G[i][j] *= (1 - cfg.gDecay);
    if (f.T) for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.T[i][j] *= (1 - cfg.tDecay);

    for (const idx of allVal) {
      const m = f.masks[idx];
      const [a, b] = pairBits(m);
      if (f.G && newlyVal.includes(idx)) f.G[a][b] = f.G[b][a] = Math.min(cfg.gCap, f.G[a][b] + cfg.gInc);

      if (arm.kind === 'scalar' || arm.kind === 'pairx' || arm.kind === 'antipairx') {
        f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
        f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
        if (arm.suppressOthers) {
          for (let k = 0; k < B; k++) if (k !== a && k !== b) f.alpha[k] = Math.max(.05, 1 + (1 - cfg.suppressDecay) * (f.alpha[k] - 1));
        }
      } else if (arm.kind === 'transx_sharp') {
        f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
        f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
        let maxSc = 0;
        const sc = new Float64Array(B);
        for (let k = 0; k < B; k++) {
          if (k === a || k === b) continue;
          sc[k] = Math.min(1, Math.max(f.T[a][k], f.T[b][k]) / cfg.tHalf);
          if (sc[k] > maxSc) maxSc = sc[k];
        }
        for (let k = 0; k < B; k++) {
          if (k === a || k === b) continue;
          if (sc[k] > .25) f.alpha[k] = Math.min(cfg.alphaMax, f.alpha[k] + cfg.partnerBoost * sc[k]);
          else if (maxSc > .5) f.alpha[k] = Math.max(.05, 1 + (1 - cfg.suppressDecay) * (f.alpha[k] - 1));
        }
      } else {
        let rIdx = -1, strength = 1;
        if (arm.kind === 'oracle') rIdx = this.eraRule;
        else if (arm.l3 === 'evor') rIdx = f.evorRule;
        else if (arm.l3 === 'metacredit' || arm.l3 === 'sham_mc' || arm.l3 === 'sham_mc_det') {
          let mx = f.u[0], best = 0, sum = 0;
          for (let r = 0; r < this.M; r++) { sum += f.u[r]; if (f.u[r] > mx) { mx = f.u[r]; best = r; } }
          if (mx < cfg.mcConfThresh) {
            f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
            f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
            continue;
          }
          if (cfg.confScale) {
            // Confidence in [0, 1]: high when one rule dominates, lower when split after an era switch
            strength = mx / (sum + cfg.confPrior);
          }
          if (arm.l3 === 'sham_mc_det') {
            this.applyDetShamCredit(f.alpha, m, cfg, strength);
            continue;
          } else if (arm.l3 === 'sham_mc') {
            const perm = Array.from({ length: this.M }, (_, i) => i);
            for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(f.rSham() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
            rIdx = perm[best];
          } else {
            rIdx = best;
          }
        }
        this.tel.ruleUses++;
        if (rIdx === this.eraRule) this.tel.ruleMatches++;
        this.applyCreditRuleToAlpha(f.alpha, m, rIdx, cfg, strength);
      }
    }
  }
}

function runV3(seed, armSpec, cfg) {
  const w = new WorldCreditV3(seed, armSpec, cfg);
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  return { seed, popSum, pop: popSum / nLate, ruleAcc: w.tel.ruleUses ? w.tel.ruleMatches / w.tel.ruleUses : 0, vals: w.tel.vals };
}

const SEEDS = Array.from({ length: 16 }, (_, i) => 2401 + i);

const WORLD_CFG = { M: 11, eraEvery: 4800, macroEvery: 1200, subEvery: 300 };

const ARMS = {
  FIXED:          { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
  SCALAR_045:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .045, alphaBoost: 20 } },
  SCALAR_060:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 20 } },
  SCALAR_090:     { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .090, alphaBoost: 25 } },
  SCALAR_SUPP:    { spec: { l1: true, kind: 'scalar', usesL2: true, suppressOthers: true }, cfg: { alphaDecay: .060, alphaBoost: 20, suppressDecay: .40 } },
  PAIRX_A:        { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .060, alphaBoost: 20, gDecay: .005, gFloor: .15 } },
  PAIRX_B:        { spec: { l1: true, kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .060, alphaBoost: 20, gDecay: .020, gFloor: .30 } },
  ANTIPAIRX_A:    { spec: { l1: true, kind: 'antipairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .060, alphaBoost: 20, gDecay: .015, gSuppress: 5 } },
  TRANSX_S002:    { spec: { l1: true, kind: 'transx_sharp', usesL2: true, usesT: true, usesTSharp: true, inheritLast: true }, cfg: { alphaDecay: .060, tDecay: .002, tHalf: 1.0, maxValDt: 700 } },
  TRANSX_S008:    { spec: { l1: true, kind: 'transx_sharp', usesL2: true, usesT: true, usesTSharp: true, inheritLast: true }, cfg: { alphaDecay: .060, tDecay: .008, tHalf: 1.0, maxValDt: 700 } },
  EVOR_SV10:      { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .10, usesL2: true }, cfg: {} },
  EVOR_SV25:      { spec: { l1: true, kind: 'evor', l3: 'evor', standing: true, pm: .25, usesL2: true }, cfg: {} },
  META3_D50:      { spec: { l1: true, kind: 'mc', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .50, maxValDt: 700, confScale: true, confPrior: .4 } },
  META3_D65:      { spec: { l1: true, kind: 'mc', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4 } },
  META3_D65_HARD: { spec: { l1: true, kind: 'mc', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: false } },
  META3_D65_RST:  { spec: { l1: true, kind: 'mc', l3: 'metacredit', resetU: true, usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4 } },
  SHAM3_D65_DET:  { spec: { l1: true, kind: 'sham', l3: 'sham_mc_det', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4 } },
  SHAM3_D65_PRM:  { spec: { l1: true, kind: 'sham', l3: 'sham_mc', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4 } },
  ORACLE3:        { spec: { l1: true, kind: 'oracle', usesL2: true }, cfg: {} },
};

if (!isMainThread) {
  const { seed, armName } = workerData;
  const a = ARMS[armName];
  const r = runV3(seed, a.spec, { ...WORLD_CFG, ...a.cfg });
  parentPort.postMessage({ seed, armName, ...r });
} else {
  const t0 = Date.now();
  const jobs = [];
  for (const seed of SEEDS) for (const armName of Object.keys(ARMS)) jobs.push({ seed, armName });
  const results = {};
  let next = 0;
  await Promise.all(Array.from({ length: 10 }, () => new Promise((resolve, reject) => {
    const go = () => {
      if (next >= jobs.length) return resolve();
      const job = jobs[next++];
      const w = new Worker(new URL(import.meta.url), { workerData: job });
      w.once('message', m => { (results[m.armName] ??= {})[m.seed] = m; go(); });
      w.once('error', reject);
    };
    go();
  })));
  console.log(`=== Exp 5: M=11 Stress Test (era=4800, mac=1200, sub=300, n=16, ${((Date.now()-t0)/1000).toFixed(1)}s) ===`);
  const P = a => SEEDS.map(s => results[a][s].popSum);
  for (const a of Object.keys(ARMS)) {
    const pop = mean(P(a)) / 100;
    const acc = mean(SEEDS.map(s => results[a][s].ruleAcc));
    const vals = mean(SEEDS.map(s => results[a][s].vals));
    console.log(`${a.padEnd(15)} pop=${pop.toFixed(2)}  ruleAcc=${(acc * 100).toFixed(1).padStart(5)}%  vals=${vals.toFixed(0)}`);
  }

  const l2Cands = ['SCALAR_045', 'SCALAR_060', 'SCALAR_090', 'SCALAR_SUPP', 'PAIRX_A', 'PAIRX_B', 'ANTIPAIRX_A', 'TRANSX_S002', 'TRANSX_S008'];
  const l2Best = l2Cands.reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
  const evorBest = ['EVOR_SV10', 'EVOR_SV25'].reduce((b, a) => mean(P(a)) > mean(P(b)) ? a : b);
  console.log(`\nBest L2 challenger (incl. SCALAR_SUPP, PAIRX, ANTIPAIRX, TRANSX_SHARP): ${l2Best} (${(mean(P(l2Best)) / 100).toFixed(2)})`);
  console.log(`Best EVOR3 challenger: ${evorBest} (${(mean(P(evorBest)) / 100).toFixed(2)})`);

  const report = (label, aName, bName) => {
    const diff = SEEDS.map((_, i) => P(aName)[i] - P(bName)[i]);
    const m = mean(diff) / 100, wins = diff.filter(x => x > 0).length, p = signflip(diff, 1);
    console.log(`${label.padEnd(36)} ${m >= 0 ? '+' : ''}${m.toFixed(2)}  ${wins}/16  p=${p.toExponential(2)}`);
  };
  const reportD4 = (label, m3Name, l2Name) => {
    const p3 = P(m3Name), pL = P(l2Name), pF = P('FIXED');
    const d4 = SEEDS.map((_, i) => 2 * p3[i] - 3 * pL[i] + pF[i]);
    const ratio = (mean(p3) - mean(pF)) / (mean(pL) - mean(pF));
    const wins = d4.filter(x => x > 0).length, p = signflip(d4, 1);
    console.log(`${label.padEnd(36)} d4=${(mean(d4) / 200).toFixed(2)}  ratio=${ratio.toFixed(2)}x  ${wins}/16  p=${p.toExponential(2)}`);
  };

  console.log('\n--- Key contrasts ---');
  report(`L2best (${l2Best}) - FIXED`, l2Best, 'FIXED');
  reportD4(`ORACLE3 vs ${l2Best}`, 'ORACLE3', l2Best);
  for (const m3 of ['META3_D50', 'META3_D65', 'META3_D65_HARD']) {
    console.log(`\n[${m3}]`);
    reportD4(`${m3} vs ${l2Best}`, m3, l2Best);
    report(`${m3} - ${l2Best}`, m3, l2Best);
    report(`${m3} - SHAM3_D65_DET`, m3, 'SHAM3_D65_DET');
    report(`${m3} - SHAM3_D65_PRM`, m3, 'SHAM3_D65_PRM');
    report(`${m3} - ${evorBest}`, m3, evorBest);
  }
  report(`META3_D65 - META3_D65_RST`, 'META3_D65', 'META3_D65_RST');
}
