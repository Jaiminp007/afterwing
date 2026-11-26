// Strain programs (browser-safe; shared by the headless runners and the live viewer).
import { S0Masks, DEFAULT_GENES } from './sim.mjs';
export const MOVE0 = [1, 2, 4, 8, 16, 32];
// Innate movement instinct (heritable, not learned): approach food and good smell, avoid crowds.
export const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };
function SELF_P12() { return { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, tasteMemory: 1e12, tastePrune: 0 }, tasteRevise: 'evid', moveRevise: 'evid', mutate: true }; }
function SELF_RSTAR() { return { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, tasteMemory: 800, tastePrune: .5, tasteEvery: 4 }, tasteRevise: 'evid', moveRevise: 'evid', mutate: true }; }
// G7c (2026-11-18): movement self-revision starts an added sense at an evidence-signed weight of 2 (random sign for SHAM).
const L2_LEAN = { tasteCap: 9, tastePrune: 8, tasteZ: 100, moveCap: 6, movePrune: 8, moveZ: 100 }, L2_FULL = { tasteCap: 16, tastePrune: 2, tasteZ: 3, moveCap: 12, movePrune: .5, moveZ: 3 };
const L3I_X = { park: true, parkSingles: 2, inheritFull: true };
const L2D_X = { pkgReset: true, l2dStats: true };
function SELF_RC(h) { return { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, swapHurdle: h }, tasteRevise: 'evid', moveRevise: 'evid', mutate: true, moveAddInit: 2, swap: true }; }
function SELF_AT(mode, a = .5) { return { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, attentionA: a }, tasteRevise: 'evid', moveRevise: 'evid', mutate: true, moveAddInit: 2, attention: true, attnMode: mode, inheritFull: true }; }
// L3-IV-H0 (four-bank routing headroom): 16-bit odor, founders = bias + 16 singletons, taste cap 24; gene alloc = per-tasting bank distribution.
export function SELF_Q(mode, alloc = [.25, .25, .25, .25]) { const b = SELF_AT(mode); return { ...b, tasteMasks: [0, ...[...Array(16).keys()].map(k => 1 << k)], genes: { ...b.genes, tasteCap: 24, alloc }, quad: true }; }
function SELF_L2() { return { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'evid', moveRevise: 'evid', mutate: true, moveAddInit: 2, leanGenes: L2_LEAN, fullGenes: L2_FULL }; }
export const STRAINS = {
  FIXED: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: null, mutate: false },
  SELF: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'evid', moveRevise: 'evid', mutate: true, moveAddInit: 2 },
  SHAM: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'random', moveRevise: 'random', mutate: true, moveAddInit: 2 },
  EVO: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: null, mutate: true },
  ORACLE: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: null, mutate: false, oracle: true },
  FROZEN: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, tasteStep: 0, moveStep: 0 }, tasteRevise: null, moveRevise: null, mutate: false },
  TASTEONLY: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'evid', moveRevise: null, mutate: true },
  MOVEONLY: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: 'evid', mutate: true, moveAddInit: 2 },
  RANDMOVE: { tasteMasks: S0Masks(), moveMasks: [1], genes: { ...DEFAULT_GENES, eps: 1 }, tasteRevise: null, moveRevise: null, mutate: false },
  // P13b (amendment A1): all start from R_P12 (no forgetting, no pruning); selection present for all.
  P13_META: { ...SELF_P12(), metaR: 'meta' },
  P13_SHAM: { ...SELF_P12(), metaR: 'sham' },
  P13_EVOR: { ...SELF_P12(), evoR: true },
  P13_FIXED: { ...SELF_P12() },
  // P13b amendment A2: base SELF with R* genes; the tuned gene is acceptAt (decision-and-sampling threshold).
  A2_META: { ...SELF_RSTAR(), metaA: 'trial' },
  A2_SHAM: { ...SELF_RSTAR(), metaA: 'sham' },
  A2_EVOR: { ...SELF_RSTAR(), evoA: true },
  A2_FIXED: { ...SELF_RSTAR() },
  // Fly-RSI L2 (docs/FLY_RSI_GOALS.md): the fly switches its reviser genes between lean and full packages from felt brain cost.
  L2_META: { ...SELF_L2(), metaB: 'brainTrack' },
  L2_SHAM: { ...SELF_L2(), metaB: 'brainTracksham' },
  L2_EVOR: { ...SELF_L2(), evoB: true },
  L2_FIXED: { ...SELF_L2() },
  L2_NOREV: { ...SELF_L2(), tasteRevise: null, moveRevise: null }, // L3 reference: no level-1 self-revision at all
  // Fly-RSI L3-I (docs/FLY_RSI_GOALS.md): parking screen with the fixed inheritance law; six arms.
  L3I_META: { ...SELF_L2(), ...L3I_X, metaB: 'brainTrack' },
  L3I_SHAM: { ...SELF_L2(), ...L3I_X, metaB: 'brainTracksham' },
  L3I_EVOR: { ...SELF_L2(), ...L3I_X, evoB: true },
  L3I_FIXED: { ...SELF_L2(), inheritFull: true },
  L3I_NOREV: { ...SELF_L2(), inheritFull: true, tasteRevise: null, moveRevise: null },
  L3I_METAOFF: { ...SELF_L2(), ...L3I_X, metaB: 'brainTrack', tasteRevise: null, moveRevise: null },
  // Fly-RSI L3-I screen 2 (RewriteCost): swap trial operator; hurdle set in life from the felt rewrite price.
  RC_META: { ...SELF_RC(.075), metaRW: 'track', stableHurdle: .075 },
  RC_SHAM: { ...SELF_RC(.075), metaRW: 'tracksham', stableHurdle: .075 },
  RC_EVOR: { ...SELF_RC(.075), evoH: true },
  RC_H0: SELF_RC(0), RC_H025: SELF_RC(.025), RC_H075: SELF_RC(.075), RC_H15: SELF_RC(.15), RC_NEVER: SELF_RC('NEVER'),
  RC_NOSWAP: { ...SELF_RC('NEVER'), swap: false },
  RC_NOREV: { ...SELF_RC('NEVER'), swap: false, tasteRevise: null, moveRevise: null },
  RC_METAOFF: { ...SELF_RC(.075), metaRW: 'track', stableHurdle: .075, tasteRevise: null, moveRevise: null },
  // Fly-RSI L3-II (attention-limited structural revision): route each tasting's structural evidence to one odor bank.
  AT_ORACLE: SELF_AT('oracle'), AT_META: SELF_AT('meta'), AT_SHAM: SELF_AT('sham'), AT_BLIND: SELF_AT('blind'),
  AT_EVOR: { ...SELF_AT('static', .5), evoAttn: true },
  AT_S0: SELF_AT('static', 0), AT_S25: SELF_AT('static', .25), AT_S50: SELF_AT('static', .5), AT_S75: SELF_AT('static', .75), AT_S100: SELF_AT('static', 1),
  AT_NOREV: { ...SELF_AT('static', .5), attention: false, tasteRevise: null, moveRevise: null },
  AT_METAOFF: { ...SELF_AT('meta'), tasteRevise: null, moveRevise: null },
  // L3-III (evidence-routed attention): META = former BLIND policy writing attentionA; SHAM = same controller fed an independent sensory twin's innovation.
  Q_ORACLE: SELF_Q('oracle'), Q_BLIND: SELF_Q('blind'), Q_NOREV: { ...SELF_Q('static'), attention: false, tasteRevise: null, moveRevise: null },
  Q_TRUEORACLE: { ...SELF_Q('static'), attention: false, tasteRevise: null, oracle: true },
  AT3_META: SELF_AT('ev'), AT3_SHAM: SELF_AT('evsham'), AT3_METAOFF: { ...SELF_AT('ev'), tasteRevise: null, moveRevise: null },
  // P13b amendment A3 (in-life switching toxin sensitivity): META tracks own body state from felt damage; SHAM same updates, fake state.
  A3_META: { ...SELF_RSTAR(), metaA: 'track' },
  A3_SHAM: { ...SELF_RSTAR(), metaA: 'tracksham' },
  A3_EVOR: { ...SELF_RSTAR(), evoA: true },
  A3_FIXED: { ...SELF_RSTAR() },
  // L2-D decomposition (docs/PAPER_REVISION_PLAN.md): matched controls for the L2 claim. Every arm re-applies its package
  // each tick (thresholds reset alike), controllers reset to the full package before offspring mutation, the sham's cue
  // has its own random stream, and telemetry counts price switches seen before death.
  L2D_META: { ...SELF_L2(), ...L2D_X, metaB: 'brainTrack' },
  L2D_BIRTH: { ...SELF_L2(), ...L2D_X, metaB: 'brainBirth' },
  L2D_SHAM: { ...SELF_L2(), ...L2D_X, metaB: 'brainShamS' },
  L2D_EVOR: { ...SELF_L2(), ...L2D_X, evoB: true, pkgTick: 'evo' },
  L2D_FIXED: { ...SELF_L2(), ...L2D_X, pkgTick: 'full' },
  L2D_LEAN: { ...SELF_L2(), ...L2D_X, pkgTick: 'lean', genes: { ...DEFAULT_GENES, ...L2_LEAN } },
  L2D_METAOFF: { ...SELF_L2(), ...L2D_X, metaB: 'brainTrack', tasteRevise: null, moveRevise: null },
  L2D_NOREV: { ...SELF_L2(), ...L2D_X, pkgTick: 'full', tasteRevise: null, moveRevise: null },
  // G7d (evidence-selection controls on the final fly): MOVESHAM = taste revision by evidence, movement revision random
  // (random sign at weight 2); GIFT = no movement revision, but born with the "toward best food" and "stay" senses at weight 2.
  MOVESHAM: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'evid', moveRevise: 'random', mutate: true, moveAddInit: 2 },
  GIFT: { tasteMasks: S0Masks(), moveMasks: [...MOVE0, 256, 512], moveInit: { ...MOVE_INIT, 256: 2, 512: 2 }, genes: DEFAULT_GENES, tasteRevise: 'evid', moveRevise: null, mutate: true },
};
