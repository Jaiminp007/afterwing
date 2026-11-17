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
Comparison tool `microverse/compare.mjs` (practice only). First, the decomposition: taste-learning-only vs FROZEN was 0/8, and move-learning-only vs FROZEN was 4/8, so taste learning is what hurts.

| Attempt | Change | Result |
|---|---|---|
| 1 | Confidence gate: trust the taste model only while its running log-loss beats a base-rate guess | FIXED vs FROZEN 5/8 (from 0/8) |
| 2 | Smell and food movement features weigh food by its expected value to the fly, p − (1−p)·toxin, counting only food it would eat. The old (2p−1) weighting made an unconfident fly smell nothing. | see below |

**Null controls.** Identical strains: FIXED vs FIXED gave 9/24 wins (share .38) with no extinctions. That is consistent with chance; there is no structural A/B bias. Outcomes are drift-heavy (mostly 0 or 1), so the 7/8 bars demand large real effects.

**Full practice suite after attempt 2.** Passed: G1–G5, all 8/8. Failed:
- **G6:** gain .181, late skill .566.
- **G7:** SELF vs TASTEONLY 5/8; vs MOVEONLY 8/8.

## G6 loop
Trace (SELF, seed 101): the taste feature set reaches its cap of 16 by tick 3,000 and stays full. Target terms held drop in later epochs (second pairs epoch: about 1.0–1.4, against 2.9 in the first).

| Attempt | Change | G6 |
|---|---|---|
| 1 | Forgetting: evidence decays (×(1−1/200) per tasting); when the set is full, drop the weakest added feature with \|w\| < 2. SHAM shares the same pruning, so the control stays matched. | **pass**: gain .368, late skill .757 |

**Full practice suite.** Passed: G1–G6. Failed: G7 (SELF vs TASTEONLY 3/8, share .47; vs MOVEONLY 8/8).

## G7 loop
Headroom check: a measuring-only planner strain (heads for the best food it senses, judged by its own taste) beat TASTEONLY 5/8 (share .72). So movement had modest room to improve.

| Attempt | Change | SELF vs TASTEONLY |
|---|---|---|
| 1 | Movement-revision evidence uses the decaying trace (delayed credit) | 3/8, .45: no progress |
| 2 | **Bug fix:** movement candidates were mostly duplicates (bias × x = x) or move-invariant. Candidates now must be products of real features with at least one move-dependent feature. | 5/8, .54 |
| 3 | Prune the weakest added movement feature when full (\|w\| < .5), as for taste | 6/8, .66 |

**Full practice suite after attempt 3: all of G1–G7 pass.**

## Final run 1

Fresh seeds 50001–50008, never used before. The code is frozen at the commit before this run.
**Result:**
- **G1–G6 CLOSED** on fresh seeds. G2–G5 were all 8/8; G6 gain .394, late skill .775.
- **G7 FAILED:** SELF vs TASTEONLY 3/8, share .33; vs MOVEONLY 8/8. The practice pass did not generalize.
- Seeds 50001–50008 are spent.

## G7 loop, continued (step back)

The planner headroom check gave only 5/8 against TASTEONLY, so the G7 bar (6/8) is out of reach in this world even for perfect planning. Next: make movement matter more in the world, then re-check headroom before any brain change. All goals will be re-tested on the next final run.
| Attempt | Change | SELF vs TASTEONLY |
|---|---|---|
| 4 (world) | Food relocates every 50 ticks with 8 patches. Planner headroom vs TASTEONLY rises to 8/8. | 2/8. Movement learning helps (6/8 vs instinct-only), but revision does not |
| 5 (brain) | Sense menu: optional senses (near smell r2, far smell r6, heads-toward-best-food, food-worth-staying) wired in by the fly's own evidence; TASTEONLY can reach them only by random mutation | 3/8 |
| diagnostic | brainCost 0 | 6/8. The feature cost (.002 per feature per tick, about +20% metabolism) ate the gain |
| 6 (world) | brainCost .0005 (still a real cost) | 7/8, .89 |

**Full practice suite in the new world (relocate 50, 8 patches, brainCost .0005): all of G1–G7 pass.**

## Final run 2

Fresh seeds 60001–60008. Every goal is re-tested, because the world changed.
