// Strain programs (browser-safe; shared by the headless runners and the live viewer).
import { S0Masks, DEFAULT_GENES } from './sim.mjs';
export const MOVE0 = [1, 2, 4, 8, 16, 32];
// Innate movement instinct (heritable, not learned): approach food and good smell, avoid crowds.
export const MOVE_INIT = { 2: .5, 4: 1, 8: 1, 16: -.3 };
export const STRAINS = {
  FIXED: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: null, mutate: false },
  SELF: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'evid', moveRevise: 'evid', mutate: true },
  SHAM: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'random', moveRevise: 'random', mutate: true },
  EVO: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: null, mutate: true },
  ORACLE: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: null, mutate: false, oracle: true },
  FROZEN: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: { ...DEFAULT_GENES, tasteStep: 0, moveStep: 0 }, tasteRevise: null, moveRevise: null, mutate: false },
  TASTEONLY: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: 'evid', moveRevise: null, mutate: true },
  MOVEONLY: { tasteMasks: S0Masks(), moveMasks: MOVE0, moveInit: MOVE_INIT, genes: DEFAULT_GENES, tasteRevise: null, moveRevise: 'evid', mutate: true },
  RANDMOVE: { tasteMasks: S0Masks(), moveMasks: [1], genes: { ...DEFAULT_GENES, eps: 1 }, tasteRevise: null, moveRevise: null, mutate: false },
};
