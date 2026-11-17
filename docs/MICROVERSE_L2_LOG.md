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
