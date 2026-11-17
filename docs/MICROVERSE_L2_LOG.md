# Microverse level 2: log

Goals: [MICROVERSE_L2_GOALS.md](MICROVERSE_L2_GOALS.md). Fable review was unavailable (no usage credits).

## P11b search (amendment A1, as frozen)

The climber started at R_P12 = memory 1e12, prune 0, z 3, every 8, cap 16. It ran 24 proposals on training seeds 101–116; runtime 473 s. Accepted steps:

| Proposal | Change | Δ flies | Positive seeds |
|---|---|---|---|
| 0 | tastePrune 0 → .5 | +2.15 | 12/16 |
| 1 | tasteEvery 8 → 4 | +.85 | 10/16 |
| 2 | tasteMemory 1e12 → 800 | +3.13 | 15/16 |

All 21 later proposals were rejected.

**R\* = memory 800, prune .5, z 3, every 4, cap 16.** Training population: 55.91. For reference, R_P12 is about 49.8 and the designer's R0 is 56.17.

Unprompted, the system's level-2 search found the two mechanisms the designer had added by hand in the G6 loop: forgetting and pruning.

## P11b gate (fresh seeds 80001–80048)
| Contrast | R* | Other | Δ | Positive seeds | p | Result |
|---|---|---|---|---|---|---|
| **Gate:** R* − R_P12 | 55.54 | 49.81 | **+5.73** | 48/48 | < .00001 | **PASS** (bar ≥ 1.0 flies, p < .01) |
| Reported: R* − R0 (designer) | 55.54 | 56.08 | −.54 | 21/48 | .89 | Not gated |

**P11b PASSES.** The system's own level-2 search improved its improvement rule, and the gain holds in the embodied world on fresh seeds. It is essentially as good as the designer's hand-tuning.

Labels:
- The climber is hand-written.
- The search grid is designer-chosen, and it contains the answers (forgetting and pruning knobs).
- The start point is the pre-tuning reviser (amendment A1, set after H1/H2 failed from R0).
- This is the microverse, not the old embodied P11 setup. **The original P11 stays FAILED.**

## P13b loop (practice seeds 101–116; paired solo, Δ flies)

| Attempt | Meta-rule | vs EVO-R | vs SHAM | vs FIXED |
|---|---|---|---|---|
| 1 (as frozen in A1) | Direction rules (weak features → prune more; distrust → forget faster; trust → forget slower) | +.13 (11/16) | −.51 (8/16) | +5.00 (14/16) |
| 2 | Drop the backfiring "trust → lengthen" step (long run 30, never back to ∞) | −.56 | +.44 | — |
| 3 | In-life trial-and-revert: try one grid step, keep it only if own running taste loss fell; SHAM = same trials, coin-flip keep | **+1.49 (10/16, p .018)** | +.26 (11/16) | +6.36 (15/16) |
| 4 | Trial evidence from window means instead of the running loss | +.85 | −.38 | — |

The attempt-3 tuner reached 56.12 flies, the level of the designer's R0. But its coin-flip sham reached 55.86. Trying steps plus selection does almost as well as the fly's own keep/revert evidence.

### Step back: is there anything for own-experience tuning to track? (headroom H3)

A measuring-only oracle shortens memory for 300 ticks after each rule switch.

| World | Contrast | Δ flies |
|---|---|---|
| Normal (rules every 3000 ticks) | oracle (50/800) − R* | +.03 |
| Normal | oracle (100/800) − R* | −.65 |
| Normal | oracle (50/400) − R* | −.57 |
| Fast variant (rules every 600 ticks) | oracle (50/800) − R* | +2.47 (13/16) |
| Fast variant | fixed memory 200 − R* | +1.81 (12/16) |

In the fast variant, the oracle's gain over the best fixed setting is about +.66 flies. Evolution can find the fixed setting by itself.

### Verdict: P13b BLOCKED (not shown), with a measured bound

**In the normal world** the best reviser setting is stable. Selection plus any variation (mutation or random trials) finds it, so a lineage's own experience adds almost nothing. **Even in a fast-switching variant**, perfect in-life tracking beats the best fixed setting by only about .66 flies, below the frozen 1.0 bar.

No final was run: practice never passed, and finals are not used to fish.

**What was shown on practice only, not gate-tested:** the lineage's own trial-and-revert tuner recovered the designer-level reviser from the pre-tuning start (+6.4 vs FIXED) and beat free evolution of the same genes (+1.49, p .018).

**The original P13 stays FAILED.**

## Summary

| Test | Result |
|---|---|
| **P11b** (level 2: the system's own search improves the reviser; embodied, fresh seeds) | **PASSED**: +5.73 flies, 48/48. It rediscovered forgetting and pruning and equals the designer's tuning |
| **P13b** (the lineage tunes its own reviser from its own experience, beating evolution and a sham) | **Blocked / not shown.** There is no headroom: the reviser optimum is stable, so evolution suffices |

## P13b escape-hatch redesign: volatility world (headroom H4; capped at two variants, decided in advance)

**Idea.** In-life tuning should beat evolution when the best learning setting changes within a lifetime, unpredictably. The variant alternates calm epochs (one rule for 4000 ticks) with volatile bursts (rule switches every 150 ticks, 2000 ticks long); see `microverse/volatility.mjs`. Flies cannot sense the regime.

Measuring-only regime oracle vs fixed settings (practice 101–116, paired solo, Δ flies vs R*):

| Variant | Best fixed memory | Best regime oracle | Oracle − best fixed |
|---|---|---|---|
| A: label noise .05 | 200: +1.26 (12/16) | calm ∞ / volatile 50: +2.34 (13/16) | **about +1.1** |
| B: label noise .15 | 200: +.07 | +.12 | **about 0** |

**Verdict: still blocked.** In variant A, a tuner would have to capture nearly the whole oracle gap (about 1.1) over the best fixed setting just to reach the 1.0 gate. Evolution can find that fixed setting on its own. The headroom bar of 1.5 is not met. Variant B has none. The variant search stops here, as decided in advance, rather than hunting for a world that passes.

**Diagnosis.** It is data-limited, the same limit that stopped in-life self-revision earlier. A fly's life holds too few tastings to measure which learning setting is better, and to profit from it, before evolution finds a good fixed setting anyway.

What could honestly change this: much longer, richer lives (more feedback per lifetime), or a reviser knob whose optimum swings strongly and unpredictably within a lifetime. Both would be new lines with their own headroom checks.
