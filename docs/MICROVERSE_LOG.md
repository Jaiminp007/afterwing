# Microverse attempt log

Workflow and thresholds: [MICROVERSE_GOALS.md](MICROVERSE_GOALS.md). Practice seeds: 101–108. Final-run seeds are listed here and never reused.

## Baseline (2026-11-17)

**Passed:** G6, which was spurious. **Failed:** G1–G5 and G7.

- **G1:** every world goes extinct between ticks 570 and 1015, with almost no births. Flies find food, but the total supply is too low, and toxic bites drain them before they reach the birth threshold.
- **G2–G5, G7:** the competition shares are all 0, because every world dies out.
- **G6:** this "passed" on skill read from worlds that were dying out. That is a test bug. Validity fix: G6 now also requires the world to be alive at 20,000 in ≥ 7/8 seeds. The fix was made before any tuning against G6.

## G1 loop
Each attempt is one design change, scored on G1 over practice seeds 101–108.

| Attempt | Change | G1 seeds ok | Notes |
|---|---|---|---|
| 1 | More food (8 patches, regrow .08) | 0/8 | Extinct by tick 600–1900 |
| 2 | Milder toxin (1.5 → .6) | 0/8 | Lasts longer, few births |
| 3 | Movement learning: advantage + trace, replacing TD | 0/8 | Instinct no longer eroded; one world reached tick 12,578 |
| 4 | Cheaper reproduction (breed at 60, cost 30) | 0/8 | No progress |
| 5 | Lower metabolism (.06, move .02) | 2/8 | Deaths cluster after rule switches |
| 6 | Bigger world (40×40, 12 patches) | 2/8 | No progress |
| 7 | Taste-exploration gene (5% taste when predicted bad) | 3/8 | |
| 8 | Expected-value accept threshold gene (.4) | 2/8 | No progress. Diagnosis: the good-kind base rate swings 4–12 of 16 per draw, causing famines |
| 9 | Balanced chemistry (8 good / 8 bad kinds per draw) | **7/8: pass** | |

**Full practice suite after attempt 9.** Passed: G1, G3, G5, G6. Failed: G2, G4, G7.

| Goal | Result |
|---|---|
| G2 | ORACLE share .63, 5/8 wins |
| G3 | FIXED vs RANDMOVE .88, 7/8 |
| G4 | FROZEN wins 8/8: lifetime learning is harmful |
| G5 | SELF vs FIXED 8/8, SELF vs SHAM 8/8 |
| G6 | Gain .20, late skill .53 |
| G7 | TASTEONLY beats SELF 7/8; MOVEONLY loses 8/8 |

Shares are mostly 0 or 1: competitions end in one strain's extinction.

Diagnostics bug: `debug-taste.mjs` imported `suite.mjs` and re-ran the suite. The settings were moved to `config.mjs`.

## G2 / G4 loop (shared cause: the default taste learner chases noise on rules it cannot represent)
