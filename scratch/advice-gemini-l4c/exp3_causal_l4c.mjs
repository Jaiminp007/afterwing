// Exp 3: Full Causal-Intervention L4-C Prototype (stay_vs_exhaust world)
// Stage 1: Tune & lock ALL challengers + META3 + EVO-R3 strictly on seeds 2801-2816.
// Stage 2: Evaluate locked arms ONCE on held-out seeds 2817-2832 (no retuning after Stage 2).
// Every arm has identical exogenous schedule (rRule, rPatch) and identical probe budget/records.
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { writeFileSync } from 'node:fs';
import {
  WorldL4C, ALL_BITS, ALL_PAIRS, B, pairBits, bitOverlap, drawFromWeights, rng32, mix,
} from './l4c_world.mjs';
import { mean, signflip } from '../../docs/paper/stats.mjs';

const TUNE_SEEDS = Array.from({ length: 16 }, (_, i) => 2801 + i);
const HELD_SEEDS = Array.from({ length: 16 }, (_, i) => 2817 + i);

function applyRuleWrite(alpha, a, b, ruleIdx, cfg) {
  if (ruleIdx === 0) {
    // REINFORCE: boost validated bits a, b
    alpha[a] = Math.min(cfg.alphaMax, alpha[a] + cfg.alphaBoost);
    alpha[b] = Math.min(cfg.alphaMax, alpha[b] + cfg.alphaBoost);
  } else {
    // SUPPRESS: push validated bits a, b down to 0.01 (below baseline 1.0)
    alpha[a] = 0.01;
    alpha[b] = 0.01;
  }
}

function applyDetShamWrite(alpha, a, b, cfg) {
  // Deterministic label-neutral SHAM3: exact 50/50 average of post-clip outcomes of Rule 0 and Rule 1
  const t0 = [...alpha], t1 = [...alpha];
  applyRuleWrite(t0, a, b, 0, cfg);
  applyRuleWrite(t1, a, b, 1, cfg);
  for (let k = 0; k < B; k++) alpha[k] = 0.5 * (t0[k] + t1[k]);
}

class WorldCausal extends WorldL4C {
  constructor(seed, armSpec, cfg = {}) {
    super(seed, 'stay_vs_exhaust', armSpec, { eraEvery: 4000, subEvery: 250, alphaFloor: .01, ...cfg });
    this.diag = { probesDone: 0, probesStarted: 0, ruleUses: 0, ruleMatches: 0, yTrueSum: 0, yTrueN: 0, yWrongSum: 0, yWrongN: 0 };
  }

  spawn(parent, x, y, energy, gen) {
    const f = super.spawn(parent, x, y, energy, gen);
    const arm = this.arm;
    const key = t => rng32(mix(this.seed ^ Math.imul(f.id, 2654435761) ^ t));
    f.rProbe = key(0x50524f42);
    f.rMut = key(0x4d555441);
    f.yMean = (parent && arm.usesProbe && !arm.resetY) ? [...parent.yMean] : [0, 0];
    f.yN = (parent && arm.usesProbe && !arm.resetY) ? [...parent.yN] : [0, 0];
    f.probe = null; // { rule, endTick, vals, seasonAtStart }
    // EVO-R3 gene on top of locked L2 background
    if (arm.evo) {
      if (!parent) {
        f.evoGene = arm.evo === 'E0' ? -1 : ((f.id - 1) % 2);
      } else {
        f.evoGene = parent.evoGene;
        const pm = arm.evo === 'SV10' ? 0.10 : arm.evo === 'SV50' ? 0.50 : 0;
        if (pm > 0 && f.rMut() < pm) f.evoGene = 1 - f.evoGene;
      }
    } else {
      f.evoGene = -1;
    }
    return f;
  }

  chosenRule(f) {
    if (f.yN[0] < 1 || f.yN[1] < 1) return 0;
    return f.yMean[1] > f.yMean[0] + (this.cfg.yMargin ?? 0) ? 1 : 0;
  }

  drawCandidate(f, excl) {
    const arm = this.arm, cfg = this.cfg;
    if (arm.kind === 'deck') return super.drawCandidate(f, excl);

    // Determine effective proposal mode
    const inProbe = f.probe !== null;
    // For DIRECT / EVO-on-DIRECT: during a probe, propose according to the probed rule (so probe yields are identical causal outcomes!)
    let directMode = -1; // -1 = normal alpha, 0 = reinforce, 1 = invert/suppress
    if (arm.kind === 'direct_inv' || arm.kind === 'direct_last') {
      directMode = inProbe ? f.probe.rule : this.chosenRule(f);
      if (!inProbe) {
        this.diag.ruleUses++;
        if (directMode === this.season) this.diag.ruleMatches++;
      }
    } else if (arm.evo && arm.evo !== 'E0') {
      // EVO-R3 standing variation over rule 0 vs 1 applied on locked L2 background
      if (arm.evoBaseKind === 'direct_inv' || arm.evoBaseKind === 'direct_last') {
        directMode = f.evoGene;
      }
    }

    const masks = [], ws = [];
    for (const p of ALL_PAIRS) {
      if (excl.has(p.mask)) continue;
      let w = (cfg.alphaFloor + f.alpha[p.a]) * (cfg.alphaFloor + f.alpha[p.b]);
      if (arm.kind === 'pairx') {
        w *= (cfg.gFloor + f.G[p.a][p.b]);
      } else if (arm.kind === 'tx_inv') {
        if (f.ovEma < 0.45) {
          w = (1 / (cfg.invC + f.alpha[p.a])) * (1 / (cfg.invC + f.alpha[p.b]));
        }
      } else if (arm.kind === 'tx_overlap') {
        if (f.lastVal) {
          const ov = bitOverlap(p.mask, f.lastVal);
          w = (f.ovEma >= 0.45) ? (ov >= 1 ? 25 : 1) : (ov === 0 ? 25 : 1);
        }
      } else if (directMode === 1) {
        if (arm.kind === 'direct_last' || arm.evoBaseKind === 'direct_last') {
          if (f.lastVal) w = bitOverlap(p.mask, f.lastVal) === 0 ? 30 : 1;
        } else {
          w = (1 / (cfg.invC + f.alpha[p.a])) * (1 / (cfg.invC + f.alpha[p.b]));
        }
      }
      masks.push(p.mask); ws.push(w);
    }
    return drawFromWeights(ws, masks, f.rProp);
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

    // Check probe window completion / tally new validations during probe
    if (f.probe) {
      if (newlyVal.length) f.probe.vals += newlyVal.length;
      if (this.tick >= f.probe.endTick) {
        const r = f.probe.rule, y = f.probe.vals;
        const lr = cfg.yLr ?? 0.25;
        f.yMean[r] = f.yN[r] === 0 ? y : (1 - lr) * f.yMean[r] + lr * y;
        f.yN[r]++;
        this.diag.probesDone++;
        if (r === f.probe.seasonAtStart) { this.diag.yTrueSum += y; this.diag.yTrueN++; }
        else { this.diag.yWrongSum += y; this.diag.yWrongN++; }
        f.probe = null;
      }
    }

    // Update lastVal and TX overlap memory on newly validated masks
    if (newlyVal.length) {
      for (const idx of newlyVal) {
        const m = f.masks[idx];
        if (arm.usesTx && f.lastVal && f.lastVal !== m) {
          const shared = bitOverlap(f.lastVal, m) > 0 ? 1 : 0;
          f.ovEma = (1 - (cfg.txDecay ?? 0.35)) * f.ovEma + (cfg.txDecay ?? 0.35) * shared;
        }
        f.lastVal = m;
      }
    }

    // Trigger randomized probe on newly validated mask if eligible and not already in probe
    let startedProbeNow = false;
    if (arm.usesProbe && !f.probe && newlyVal.length) {
      if (f.rProbe() < (cfg.pProbe ?? 0.30)) {
        const prRule = f.rProbe() < 0.5 ? 0 : 1;
        f.probe = { rule: prRule, endTick: this.tick + (cfg.probeWin ?? 260), vals: 0, seasonAtStart: this.season };
        this.diag.probesStarted++;
        startedProbeNow = true;
        const [a, b] = pairBits(f.masks[newlyVal[0]]);
        // Write-rule arms apply the probed rule to alpha; DIRECT keeps scalar L2 write (and switches proposal rule during hold)
        applyRuleWrite(f.alpha, a, b, arm.writeProbeToAlpha ? prRule : 0, cfg);
      }
    }

    // During a hold window, hold alpha (no other L2 writes for BOTH META3 and DIRECT!)
    if (f.probe) {
      return;
    }

    // Decay alpha toward 1.0 (symmetric neutral baseline!)
    for (let b = 0; b < B; b++) {
      f.alpha[b] = Math.max(.01, 1 + (1 - cfg.alphaDecay) * (f.alpha[b] - 1));
    }
    if (f.G) for (let i = 0; i < B; i++) for (let j = 0; j < B; j++) if (i !== j) f.G[i][j] *= (1 - cfg.gDecay);

    // Apply L2 writes on validated masks
    for (const idx of allVal) {
      const m = f.masks[idx];
      const [a, b] = pairBits(m);
      if (f.G && newlyVal.includes(idx)) f.G[a][b] = f.G[b][a] = Math.min(cfg.gCap, f.G[a][b] + cfg.gInc);

      if (arm.kind === 'meta3') {
        const r = this.chosenRule(f);
        this.diag.ruleUses++;
        if (r === this.season) this.diag.ruleMatches++;
        applyRuleWrite(f.alpha, a, b, r, cfg);
      } else if (arm.kind === 'sham3') {
        applyDetShamWrite(f.alpha, a, b, cfg);
      } else if (arm.kind === 'oracle_clean' || arm.kind === 'oracle_probed') {
        this.diag.ruleUses++;
        this.diag.ruleMatches++;
        applyRuleWrite(f.alpha, a, b, this.season, cfg);
      } else if (arm.evo && arm.evo !== 'E0' && arm.evoBaseKind !== 'direct_inv' && arm.evoBaseKind !== 'direct_last') {
        applyRuleWrite(f.alpha, a, b, f.evoGene, cfg);
      } else if (arm.usesL2) {
        // Fixed scalar write (used by SCALAR, PAIRX, TX, DIRECT, E0)
        applyRuleWrite(f.alpha, a, b, 0, cfg);
      }
    }
  }
}

function runCausal(seed, armSpec, cfg) {
  const w = new WorldCausal(seed, armSpec, cfg);
  let popSum = 0, nLate = 0;
  for (let t = 0; t < w.cfg.ticks; t++) {
    w.step();
    if (w.tick > w.cfg.lateFrom && w.tick % w.cfg.every === 0) { popSum += w.flies.length; nLate++; }
  }
  const d = w.diag;
  return {
    seed, popSum, pop: popSum / nLate,
    ruleAcc: d.ruleUses ? d.ruleMatches / d.ruleUses : 0,
    probesDone: d.probesDone,
    yTrue: d.yTrueN ? d.yTrueSum / d.yTrueN : 0,
    yWrong: d.yWrongN ? d.yWrongSum / d.yWrongN : 0,
  };
}

// Tuning catalog (evaluated ONLY on TUNE_SEEDS 2801-2816)
const PROBE_BASE = { pProbe: 0.30, probeWin: 260, yLr: 0.25 };
const TUNE_ARMS = {
  NOREV:       { group: 'base',   spec: { l1: false, kind: 'deck', usesL2: false }, cfg: {} },
  FIXED:       { group: 'base',   spec: { l1: true,  kind: 'deck', usesL2: false }, cfg: {} },
  // Scalar L2 grid
  S_015:       { group: 'scalar', spec: { l1: true,  kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .015, alphaBoost: 12 } },
  S_030:       { group: 'scalar', spec: { l1: true,  kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .030, alphaBoost: 20 } },
  S_060:       { group: 'scalar', spec: { l1: true,  kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .060, alphaBoost: 24 } },
  S_120:       { group: 'scalar', spec: { l1: true,  kind: 'scalar', usesL2: true }, cfg: { alphaDecay: .120, alphaBoost: 40 } },
  // PAIRX grid
  PX_S:        { group: 'pairx',  spec: { l1: true,  kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .020, alphaBoost: 16, gDecay: .010, gFloor: .15 } },
  PX_M:        { group: 'pairx',  spec: { l1: true,  kind: 'pairx', usesL2: true, usesG: true }, cfg: { alphaDecay: .060, alphaBoost: 24, gDecay: .020, gFloor: .15 } },
  // Transition memory grid
  TX_INV_S:    { group: 'tx',     spec: { l1: true,  kind: 'tx_inv', usesL2: true, usesTx: true, inheritLast: true }, cfg: { alphaDecay: .020, alphaBoost: 16, txDecay: .40, invC: .5 } },
  TX_INV_M:    { group: 'tx',     spec: { l1: true,  kind: 'tx_inv', usesL2: true, usesTx: true, inheritLast: true }, cfg: { alphaDecay: .040, alphaBoost: 24, txDecay: .40, invC: .5 } },
  TX_OV:       { group: 'tx',     spec: { l1: true,  kind: 'tx_overlap', usesL2: true, usesTx: true, inheritLast: true }, cfg: { alphaDecay: .030, alphaBoost: 20, txDecay: .40 } },
  // DIRECT using SAME causal yield statistics yMean directly in proposals
  DIR_INV_S:   { group: 'direct', spec: { l1: true,  kind: 'direct_inv', usesL2: true, usesProbe: true, writeProbeToAlpha: false }, cfg: { ...PROBE_BASE, alphaDecay: .020, alphaBoost: 16, invC: .5 } },
  DIR_INV_M:   { group: 'direct', spec: { l1: true,  kind: 'direct_inv', usesL2: true, usesProbe: true, writeProbeToAlpha: false }, cfg: { ...PROBE_BASE, alphaDecay: .040, alphaBoost: 24, invC: .5 } },
  DIR_LAST:    { group: 'direct', spec: { l1: true,  kind: 'direct_last', usesL2: true, usesProbe: true, writeProbeToAlpha: false, inheritLast: true }, cfg: { ...PROBE_BASE, alphaDecay: .030, alphaBoost: 20 } },
  // META3 variants
  M3_P25:      { group: 'meta3',  spec: { l1: true,  kind: 'meta3', usesL2: true, usesProbe: true, writeProbeToAlpha: true }, cfg: { ...PROBE_BASE, pProbe: 0.25, alphaDecay: .025, alphaBoost: 16 } },
  M3_P35:      { group: 'meta3',  spec: { l1: true,  kind: 'meta3', usesL2: true, usesProbe: true, writeProbeToAlpha: true }, cfg: { ...PROBE_BASE, pProbe: 0.35, alphaDecay: .025, alphaBoost: 16 } },
  // Oracles (symmetric suppress!)
  ORACLE_CLEAN:  { group: 'oracle', spec: { l1: true, kind: 'oracle_clean', usesL2: true }, cfg: { alphaDecay: .025, alphaBoost: 16 } },
  ORACLE_PROBED: { group: 'oracle', spec: { l1: true, kind: 'oracle_probed', usesL2: true, usesProbe: true, writeProbeToAlpha: true }, cfg: { ...PROBE_BASE, alphaDecay: .025, alphaBoost: 16 } },
};

if (!isMainThread) {
  const { seed, armName, spec, cfg } = workerData;
  const r = runCausal(seed, spec, cfg);
  parentPort.postMessage({ seed, armName, ...r });
} else {
  async function runBatch(armMap, seeds) {
    const jobs = [];
    for (const armName of Object.keys(armMap)) {
      for (const seed of seeds) jobs.push({ seed, armName, spec: armMap[armName].spec, cfg: armMap[armName].cfg });
    }
    const results = {};
    let next = 0;
    await Promise.all(Array.from({ length: 10 }, () => new Promise((resolve, reject) => {
      const go = () => {
        if (next >= jobs.length) return resolve();
        const job = jobs[next++];
        const wk = new Worker(new URL(import.meta.url), { workerData: job });
        wk.once('message', m => { (results[m.armName] ??= {})[m.seed] = m; go(); });
        wk.once('error', reject);
      };
      go();
    })));
    return results;
  }

  const t0 = Date.now();
  console.log('=== STAGE 1: TUNING ON SEEDS 2801-2816 ONLY ===');
  const tuneRes = await runBatch(TUNE_ARMS, TUNE_SEEDS);
  const popOf = (res, seeds, a) => mean(seeds.map(s => res[a][s].popSum)) / 100;
  for (const a of Object.keys(TUNE_ARMS)) {
    const pop = popOf(tuneRes, TUNE_SEEDS, a);
    const acc = mean(TUNE_SEEDS.map(s => tuneRes[a][s].ruleAcc));
    const yt = mean(TUNE_SEEDS.map(s => tuneRes[a][s].yTrue));
    const yw = mean(TUNE_SEEDS.map(s => tuneRes[a][s].yWrong));
    const pr = mean(TUNE_SEEDS.map(s => tuneRes[a][s].probesDone));
    console.log(`  ${a.padEnd(15)} pop=${pop.toFixed(2)}  ruleAcc=${(acc*100).toFixed(1).padStart(5)}%  probes=${pr.toFixed(0).padStart(4)}  yTrue=${yt.toFixed(3)}  yWrong=${yw.toFixed(3)}`);
  }

  const pickBest = grp => Object.keys(TUNE_ARMS).filter(a => TUNE_ARMS[a].group === grp)
    .reduce((b, a) => popOf(tuneRes, TUNE_SEEDS, a) > popOf(tuneRes, TUNE_SEEDS, b) ? a : b);
  const lockScalar = pickBest('scalar');
  const lockPairx = pickBest('pairx');
  const lockTx = pickBest('tx');
  const lockDirect = pickBest('direct');
  const lockMeta3 = pickBest('meta3');
  const l2Candidates = [lockScalar, lockPairx, lockTx, lockDirect];
  const lockL2Best = l2Candidates.reduce((b, a) => popOf(tuneRes, TUNE_SEEDS, a) > popOf(tuneRes, TUNE_SEEDS, b) ? a : b);

  // Tune EVO-R3 on locked L2best (2801-2816 ONLY): E0 equals locked L2best exactly
  const baseL2 = TUNE_ARMS[lockL2Best];
  const EVO_TUNE = {};
  for (const ev of ['E0', 'SV0', 'SV10', 'SV50']) {
    EVO_TUNE['EVO_' + ev] = {
      spec: ev === 'E0'
        ? { ...baseL2.spec }
        : { ...baseL2.spec, evo: ev, evoBaseKind: baseL2.spec.kind, usesProbe: false },
      cfg: { ...baseL2.cfg },
    };
  }
  const evoTuneRes = await runBatch(EVO_TUNE, TUNE_SEEDS);
  for (const a of Object.keys(EVO_TUNE)) console.log(`  ${a.padEnd(15)} pop=${popOf(evoTuneRes, TUNE_SEEDS, a).toFixed(2)}`);
  const lockEvo = Object.keys(EVO_TUNE).reduce((b, a) => popOf(evoTuneRes, TUNE_SEEDS, a) > popOf(evoTuneRes, TUNE_SEEDS, b) ? a : b);

  console.log(`\nLOCKED FROM 2801-2816: scalar=${lockScalar}, pairx=${lockPairx}, tx=${lockTx}, direct=${lockDirect}, L2best=${lockL2Best}, meta3=${lockMeta3}, evo=${lockEvo} (${((Date.now()-t0)/1000).toFixed(1)}s)`);

  // STAGE 2: HELD-OUT EVALUATION ONCE ON 2817-2832 (ZERO RETUNING!)
  const m3 = TUNE_ARMS[lockMeta3];
  const HELD_ARMS = {
    NOREV:         TUNE_ARMS.NOREV,
    FIXED:         TUNE_ARMS.FIXED,
    META3_L1OFF:   { spec: { ...m3.spec, l1: false }, cfg: { ...m3.cfg } },
    SCALAR_LOCK:   TUNE_ARMS[lockScalar],
    PAIRX_LOCK:    TUNE_ARMS[lockPairx],
    TX_LOCK:       TUNE_ARMS[lockTx],
    DIRECT_LOCK:   TUNE_ARMS[lockDirect],
    META3:         m3,
    SHAM3:         { spec: { ...m3.spec, kind: 'sham3' }, cfg: { ...m3.cfg } },
    META3_RESET:   { spec: { ...m3.spec, resetY: true }, cfg: { ...m3.cfg } },
    EVO_LOCK:      EVO_TUNE[lockEvo],
    ORACLE_CLEAN:  TUNE_ARMS.ORACLE_CLEAN,
    ORACLE_PROBED: TUNE_ARMS.ORACLE_PROBED,
  };

  console.log('\n=== STAGE 2: HELD-OUT EVALUATION ON SEEDS 2817-2832 ONLY ===');
  const heldRes = await runBatch(HELD_ARMS, HELD_SEEDS);
  const P = a => HELD_SEEDS.map(s => heldRes[a][s].popSum);
  const pF = P('FIXED'), mF = mean(pF) / 100;
  for (const a of Object.keys(HELD_ARMS)) {
    const pop = mean(P(a)) / 100;
    const acc = mean(HELD_SEEDS.map(s => heldRes[a][s].ruleAcc));
    const yt = mean(HELD_SEEDS.map(s => heldRes[a][s].yTrue));
    const yw = mean(HELD_SEEDS.map(s => heldRes[a][s].yWrong));
    const pr = mean(HELD_SEEDS.map(s => heldRes[a][s].probesDone));
    console.log(`  ${a.padEnd(15)} pop=${pop.toFixed(2)}  gain=${(pop - mF >= 0 ? '+' : '') + (pop - mF).toFixed(2)}  ruleAcc=${(acc*100).toFixed(1).padStart(5)}%  probes=${pr.toFixed(0).padStart(4)}  yTrue=${yt.toFixed(3)}  yWrong=${yw.toFixed(3)}`);
  }

  const l2Key = lockL2Best === lockScalar ? 'SCALAR_LOCK'
    : lockL2Best === lockPairx ? 'PAIRX_LOCK'
    : lockL2Best === lockTx ? 'TX_LOCK' : 'DIRECT_LOCK';

  console.log('\n--- HELD-OUT CONTRASTS (n=16, exact one-sided sign-flip p) ---');
  const reportD4 = (top, base) => {
    const pT = P(top), pB = P(base);
    const d = HELD_SEEDS.map((_, i) => 2 * pT[i] - 3 * pB[i] + pF[i]);
    const ratio = (mean(pT) - mean(pF)) / (mean(pB) - mean(pF));
    console.log(`  d4(${top} vs ${base})`.padEnd(36) + `d4=${(mean(d)/200).toFixed(2)}  ratio=${ratio.toFixed(2)}x  signs=${d.filter(x=>x>0).length}/16  p=${signflip(d,1).toExponential(2)}`);
  };
  const reportDiff = (a, b) => {
    const d = HELD_SEEDS.map((_, i) => P(a)[i] - P(b)[i]);
    console.log(`  ${a} - ${b}`.padEnd(36) + `diff=${(mean(d)/100).toFixed(2)}  signs=${d.filter(x=>x>0).length}/16  p=${signflip(d,1).toExponential(2)}`);
  };

  reportD4('META3', l2Key);
  reportD4('META3', 'DIRECT_LOCK');
  reportD4('META3', 'TX_LOCK');
  reportD4('META3', 'SCALAR_LOCK');
  reportD4('ORACLE_CLEAN', l2Key);
  reportD4('ORACLE_CLEAN', 'DIRECT_LOCK');
  reportD4('ORACLE_PROBED', 'DIRECT_LOCK');
  reportDiff('META3', 'DIRECT_LOCK');
  reportDiff('META3', 'SHAM3');
  reportDiff('META3', 'EVO_LOCK');
  reportDiff('META3', 'META3_RESET');
  // Matched factorial: f4 = (META3 - META3_L1OFF) - 1.5*(L2best - NOREV)
  const pM = P('META3'), pOff = P('META3_L1OFF'), pL = P(l2Key), pN = P('NOREV');
  const f4 = HELD_SEEDS.map((_, i) => 2 * (pM[i] - pOff[i]) - 3 * (pL[i] - pN[i]));
  console.log(`  matched f4 (${l2Key} as P10)`.padEnd(36) + `f4=${(mean(f4)/200).toFixed(2)}  signs=${f4.filter(x=>x>0).length}/16  p=${signflip(f4,1).toExponential(2)}`);
  console.log(`\nTotal runtime: ${((Date.now()-t0)/1000).toFixed(1)}s`);

  writeFileSync(new URL('./exp3_results.json', import.meta.url), JSON.stringify({
    locks: { lockScalar, lockPairx, lockTx, lockDirect, lockL2Best, lockMeta3, lockEvo, l2Key },
    tuneSeeds: TUNE_SEEDS, heldSeeds: HELD_SEEDS,
    tuneRes, evoTuneRes, heldRes,
  }, null, 2));
}
