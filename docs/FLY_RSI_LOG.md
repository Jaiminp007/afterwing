# Bounded fly-RSI log

Goals and gates: [FLY_RSI_GOALS.md](FLY_RSI_GOALS.md).

## Designs ruled out before L2 (headroom, practice seeds 101–116, Δ flies vs SELF)

| World | Best oracle | Fake-state oracle | Verdict |
|---|---|---|---|
| Sense drift, sign flips (`senseDrift`, switch .004, every 40); memory / prune / z oracles | +.77 | −.38 | no headroom |
| Sense drift, channel permutation (switch .002, every 150) | −.54 | — | no headroom |
| Brain cost switching, ×1 / ×12, switch .004 | +3.69 | +1.78 | headroom, but a narrow gap |
| Brain cost switching, ×1 / ×20, switch .002 | +2.98 | +.44 | — |
| **Brain cost switching, ×1 / ×12, switch .001** | **+3.05** | **−.83** | chosen and frozen |

(A first sense-drift run had a perception bug: the odor codes are ±1 arrays, not integers. It was caught by the fingerprint check; its numbers are discarded.)

## L2 and L3 practice (48 seeds: 101–116 and 301–332)

Attempt 1, means: META 44.73, SHAM 41.18, EVO-R 41.61, FIXED 41.09, NOREV 32.74.

| Attempt | META rule | META − FIXED | L1 gain ratio (L3 bar 1.5) |
|---|---|---|---|
| 1 | Lean package while costly | **+3.64** (vs EVO-R +3.12, vs SHAM +3.55; all ≥ 41/48) | 1.44 |
| 2 | Lean taste only | +1.49 | 1.18 |
| 3 | Lean movement only | +1.50 | 1.18 |
| 4 | Attempt 1 plus a 300-tick fast-regrowth phase | +3.17 | 1.38 |
| 5 | Lean, but keep strong features (prune 2 / 1) | +3.26 | 1.39 |

**L2.** Attempt 1 clears every margin, so it goes to the one final.

**L3** fails on practice in all 5 attempts (best 1.44 < 1.5), so **L3 is not shown** and gets no final. The final leaves out the NOREV arm, so no fresh-seed L3 number is produced.

## L2 final (fresh seeds 95001–95048, run once; commit a8e5e6b) — PASSED

Mean flies: META 44.83, SHAM 41.96, EVO-R 41.19, FIXED 41.67. Raw data: `evidence/microverse/fly-rsi-l2-final-95001-95048.json`.

| Gate | Δ flies | Seeds positive | p (200k sign flips) | Bar | Result |
|---|---|---|---|---|---|
| META − EVO-R | +3.64 | 44/48 | < .00001 | ≥ 1.0, p < .01 | pass |
| META − SHAM | +2.87 | 39/48 | < .00001 | ≥ 1.0, p < .01 | pass |
| META − FIXED | +3.16 | 43/48 | < .00001 | > 0, p < .01 | pass |

**L2 PASSED: the flies improve their own improver.** In life, each fly retunes the genes that control its own level-1 self-revision (feature caps, pruning, and the evidence threshold, for taste and for movement) from the brain cost it feels. That beats evolution of the same genes, a matched sham and no tuning, on fresh worlds.

**Labels:**
- The meta-rule is hand-written, and the two gene packages come from the headroom oracle.
- The world was built so that the best reviser setting changes during life, and the felt signal is noise-free.

## Bounded fly-RSI: status

| Level | Status |
|---|---|
| L0: learning helps | **shown** (G4) |
| L1: flies improve their own learning program | **shown** (G5, G7c) |
| L2: flies improve their own improver | **shown** (this final) |
| L3: compounding (L1 pays ≥ 1.5× more with L2) | **not shown**: practice best 1.44 in 5 attempts; no final |

## L3b practice (world `brainSwitch` mul [1, hi], switch .001; 48 practice seeds)

| Attempt | Change | META − FIXED | vs EVO-R | vs SHAM | L1 ratio (bar 1.5) |
|---|---|---|---|---|---|
| 1 | hi 20 | +3.78 | +3.09 | +4.39 | 1.372 |
| 2 | hi 50 | +.63 | +.60 | +6.00 | 1.026 |
| 3 | hi 30 | +1.58 | +2.59 | +4.33 | 1.106 |
| 4 | hi 20; lean package also revises every step (fast shedding); same packages for EVO-R | +4.02 | +3.60 | +4.85 | 1.395 |
| 5 | as 4, plus 300 ticks of frequent revision after costs fall (fast regrowth) | +4.52 | +4.09 | +5.12 | 1.444 |

**L3b FAILED on practice** (5 attempts, best 1.444 < 1.5); no final was run.

A costlier world raises level-1 revision's value for every arm, so it lowers the ratio. Partly this is because NOREV keeps accumulating mutated movement features it can never prune. Changes to the rule form gave steady progress (1.372 → 1.395 → 1.444).
