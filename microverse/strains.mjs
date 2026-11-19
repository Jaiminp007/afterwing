// Strain programs (browser-safe; shared by the headless runners and the live viewer).
import { S0Masks, DEFAULT_GENES } from './sim.mjs';
export const MOVE0 = [1, 2, 4, 8, 16, 32];
// Innate movement instinct (heritable, not learned): approach food and good smell, avoid crowds.
export const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };
function SELF_P12() { return { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, tasteMemory: 1e12, tastePrune: 0 }, tasteRevise: 'evid', moveRevise: 'evid', mutate: true }; }
function SELF_RSTAR() { return { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, tasteMemory: 800, tastePrune: .5, tasteEvery: 4 }, tasteRevise: 'evid', moveRevise: 'evid', mutate: true }; }
// G7c (2026-11-18): movement self-revision starts an added sense at an evidence-signed weight of 2 (random sign for SHAM).
const L2_LEAN = { tasteCap: 9, tastePrune: 8, tasteZ: 100, moveCap: 6, movePrune: 8, moveZ: 100 }, L2_FULL = { tasteCap: 16, tastePrune: 2, tasteZ: 3, moveCap: 12, movePrune: .5, moveZ: 3 };
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
  // P13b amendment A3 (in-life switching toxin sensitivity): META tracks own body state from felt damage; SHAM same updates, fake state.
  A3_META: { ...SELF_RSTAR(), metaA: 'track' },
  A3_SHAM: { ...SELF_RSTAR(), metaA: 'tracksham' },
  A3_EVOR: { ...SELF_RSTAR(), evoA: true },
  A3_FIXED: { ...SELF_RSTAR() },
};
