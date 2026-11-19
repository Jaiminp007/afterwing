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
