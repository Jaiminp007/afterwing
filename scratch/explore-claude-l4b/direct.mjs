// Claude exploration ONLY on seeds 2601-2616: DIRECT challengers (same u scores as META3, read at proposal time;
// alpha keeps the scalar rule) vs META3_D65. Derived from Gemini's exp6.
// Exp 6: Honest adversarial stress-test of ALL same-information single-level challengers
// (tuned scalar L2 grid, tuned PAIRX grid, tuned TRANSX_SHARP grid, TRANSX_PROP using T directly
// in proposals, plus full EVOR3 grid incl. SV0) vs META3_D65 on seeds 2401-2416 ONLY.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { WorldCreditV2, ALL_PAIRS, B, isPredictedByRule } from '../advice-gemini-l4b/l4b_credit_v2.mjs';
import { signflip, mean } from '../../docs/paper/stats.mjs';

const ALL_BITS = Array.from({ length: B }, (_, i) => i);
const pairBits = mask => ALL_BITS.filter(b => (mask >>> b) & 1);

function drawFromWeights(ws, masks, r) {
  let sum = 0; for (let i = 0; i < ws.length; i++) sum += ws[i];
  if (sum <= 0) return -1;
  let u = r() * sum;
  for (let i = 0; i < masks.length; i++) { u -= ws[i]; if (u <= 0) return masks[i]; }
  return masks[masks.length - 1];
}

class WorldStress extends WorldCreditV2 {
  spawn(parent, x, y, energy, gen) {
    const f = super.spawn(parent, x, y, energy, gen);
    f.lastValTick = (parent && this.arm.inheritLast) ? parent.lastValTick : -1e9;
    return f;
  }

  drawCandidate(f, excl) {
    if (this.arm.kind === 'transx_prop') {
      // Single-level challenger using T directly in proposals: effective bit weight
      // eff[k] = alpha[k] + tPropGain * sum_u (alpha[u]-1) * min(1, T[u][k]/tHalf)
      const cfg = this.cfg;
      const eff = new Float64Array(B);
      for (let k = 0; k < B; k++) {
        let e = f.alpha[k];
        for (let u = 0; u < B; u++) if (u !== k && f.T[u][k] > 0) {
          e += cfg.tPropGain * Math.max(0, f.alpha[u] - 1) * Math.min(1, f.T[u][k] / cfg.tHalf);
        }
        eff[k] = Math.min(cfg.alphaMax, e);
      }
      const masks = [], ws = [];
      for (const p of ALL_PAIRS) {
        if (excl.has(p.mask)) continue;
        masks.push(p.mask);
        ws.push((cfg.alphaFloor + eff[p.a]) * (cfg.alphaFloor + eff[p.b]));
      }
      return { mask: drawFromWeights(ws, masks, f.rProp), src: -1 };
    }
    if (this.arm.kind === 'direct') {
      const cfg = this.cfg, eff = Float64Array.from(f.alpha);
      let mx = f.u[0], best = 0, sum = 0;
      for (let r = 0; r < this.M; r++) { sum += f.u[r]; if (f.u[r] > mx) { mx = f.u[r]; best = r; } }
      const masks = [], ws = [];
      const strength = mx >= cfg.mcConfThresh ? mx / (sum + cfg.confPrior) : 0;
      const p = this.matchings[best];
      const pred = new Set();
      if (strength > 0) {
        if (cfg.directPair) { if (f.lastVal) { const [la, lb] = pairBits(f.lastVal); pred.add((1 << la) | (1 << p[lb])); pred.add((1 << p[la]) | (1 << lb)); pred.add((1 << p[la]) | (1 << p[lb])); } }
        else for (let i = 1; i < f.masks.length; i++) if (f.maskVal[i]) { const [a, b] = pairBits(f.masks[i]);
          eff[p[a]] = Math.min(cfg.alphaMax, eff[p[a]] + cfg.directGain * cfg.partnerBoost * strength);
          eff[p[b]] = Math.min(cfg.alphaMax, eff[p[b]] + cfg.directGain * cfg.partnerBoost * strength); }
      }
      for (const q of ALL_PAIRS) { if (excl.has(q.mask)) continue; masks.push(q.mask);
        ws.push((cfg.alphaFloor + eff[q.a]) * (cfg.alphaFloor + eff[q.b]) * (pred.has(q.mask) ? 1 + cfg.directKappa * strength : 1)); }
      return { mask: drawFromWeights(ws, masks, f.rProp), src: -1 };
    }
    return super.drawCandidate(f, excl);
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

      if (arm.kind === 'scalar' || arm.kind === 'pairx' || arm.kind === 'antipairx' || arm.kind === 'transx_prop' || arm.kind === 'direct') {
        f.alpha[a] = Math.min(cfg.alphaMax, f.alpha[a] + cfg.alphaBoost);
        f.alpha[b] = Math.min(cfg.alphaMax, f.alpha[b] + cfg.alphaBoost);
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
          if (cfg.confScale) strength = mx / (sum + cfg.confPrior);
          if (arm.l3 === 'sham_mc_det') { this.applyDetShamCredit(f.alpha, m, cfg, strength); continue; }
          else if (arm.l3 === 'sham_mc') {
            const perm = Array.from({ length: this.M }, (_, i) => i);
            for (let i = perm.length - 1; i > 0; i--) { const j = Math.floor(f.rSham() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
            rIdx = perm[best];
          } else rIdx = best;
        }
        this.tel.ruleUses++;
        if (rIdx === this.eraRule) this.tel.ruleMatches++;
        this.applyCreditRuleToAlpha(f.alpha, m, rIdx, cfg, strength);
      }
    }
  }
}

function runStress(seed, armSpec, cfg) {
  const w = new WorldStress(seed, armSpec, cfg);
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  return { seed, popSum, pop: popSum / nLate, ruleAcc: w.tel.ruleUses ? w.tel.ruleMatches / w.tel.ruleUses : 0 };
}

const SEEDS = Array.from({ length: 16 }, (_, i) => 2601 + i);
const WORLD_CFG = { M: 11, eraEvery: 4800, macroEvery: 1200, subEvery: 300 };

const ARMS = {
  FIXED:          { spec: { l1: true, kind: 'deck', usesL2: false }, cfg: {} },
  SCALAR_120B40:  { spec: { l1: true, kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .120, alphaBoost: 40 } },
  TX_S015_H05:    { spec: { l1: true, kind: 'transx_sharp', usesL2: true, usesT: true, usesTSharp: true, inheritLast: true }, cfg: { alphaDecay: .060, tDecay: .015, tHalf: 0.5, maxValDt: 700 } },
  META3_D65:      { spec: { l1: true, kind: 'mc', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4 } },
  DIRECT_G05:     { spec: { l1: true, kind: 'direct', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4, directGain: .5 } },
  DIRECT_G1:      { spec: { l1: true, kind: 'direct', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4, directGain: 1 } },
  DIRECT_G2:      { spec: { l1: true, kind: 'direct', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4, directGain: 2 } },
  DIRECT_P10:     { spec: { l1: true, kind: 'direct', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4, directPair: true, directKappa: 10 } },
  DIRECT_P40:     { spec: { l1: true, kind: 'direct', l3: 'metacredit', usesL2: true, inheritLast: true }, cfg: { mcDecay: .65, maxValDt: 700, confScale: true, confPrior: .4, directPair: true, directKappa: 40 } },
};

if (!isMainThread) {
  const { seed, armName } = workerData;
  const a = ARMS[armName];
  const r = runStress(seed, a.spec, { ...WORLD_CFG, ...a.cfg });
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
  console.log(`=== Exp 6: Full Challenger Sweep (M=11, era=4800, mac=1200, sub=300, n=16, ${((Date.now()-t0)/1000).toFixed(1)}s) ===`);
  const P = a => SEEDS.map(s => results[a][s].popSum);
  for (const a of Object.keys(ARMS)) {
    const pop = mean(P(a)) / 100;
    const acc = mean(SEEDS.map(s => results[a][s].ruleAcc));
    console.log(`${a.padEnd(15)} pop=${pop.toFixed(2)}  ruleAcc=${(acc * 100).toFixed(1).padStart(5)}%`);
  }
  const d4 = (m3, l2) => { const p3 = P(m3), pL = P(l2), pF = P('FIXED'); const d = SEEDS.map((_, i) => 2 * p3[i] - 3 * pL[i] + pF[i]);
    console.log(`d4 ${m3} vs ${l2}`.padEnd(40), (mean(d) / 200).toFixed(2), `ratio ${((mean(p3) - mean(pF)) / (mean(pL) - mean(pF))).toFixed(2)}x`, `${d.filter(x => x > 0).length}/16`, `p=${signflip(d, 1).toExponential(2)}`); };
  const df = (a, b) => { const d = SEEDS.map((_, i) => P(a)[i] - P(b)[i]); console.log(`${a} - ${b}`.padEnd(40), (mean(d) / 100).toFixed(2), `${d.filter(x => x > 0).length}/16`, `p=${signflip(d, 1).toExponential(2)}`); };
  for (const l2 of ['SCALAR_120B40', 'TX_S015_H05', 'DIRECT_G05', 'DIRECT_G1', 'DIRECT_G2', 'DIRECT_P10', 'DIRECT_P40']) { d4('META3_D65', l2); df('META3_D65', l2); }
}
