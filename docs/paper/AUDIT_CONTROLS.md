# Adversarial audit of the Microverse controls

Auditor: GPT-6.2 Astra (xhigh), fresh thread, read-only, 2026-11-25. Brief: break
the controls behind G7c, P11b and fly-RSI L2. Checkout audited: `16b4372` (same
content as `main` at `90a372a`). The auditor ran only practice seeds.

This file keeps the findings and the paper's response to each. The auditor's full
report, including its drop-in test fixtures, is in the delegated thread; the
fixtures are summarized under each finding.

## Findings and responses

| # | Verdict | Finding | Response in the paper |
|---|---|---|---|
| 1 | LOOPHOLE | L2 META reads the simulator's current price multiplier (`f.brainMul`) directly, before any energy is spent. It is a perfect price sensor, not an estimate from the fly's own energy drain. With all costs set to zero, a newborn still switched to the lean package at price ×12. | Describe the cue as "a perfect, noise-free reading of the current brain-cost multiplier". Drop every phrasing that says the fly infers or feels the cost from its energy bill. |
| 2 | LOOPHOLE | The runners' Monte Carlo sign-flip test (n > 16) is broken. The LCG multiplies in floating point, loses low bits and falls into a 419-state cycle: about 570 distinct sign vectors in 200,000 draws at n = 48. A known case with exact p = 1/64 printed p = .0096, crossing the .01 bar. | No p-value in the paper comes from runner output. `docs/paper/verify.mjs` computes exact sign-flip p-values. They agree with the auditor's independent exact values (L2: 1.83e-12, 1.48e-7, 3.86e-10; G7c vs MOVEONLY 1.26e-29). Every past gate near .01 is rechecked in `docs/PAPER_VERIFICATION_LOG.md`. |
| 3 | LOOPHOLE | L2's package choice also changes birth mutation: a child copies the parent's current caps, and mutation checks those caps before adding a mask. With both L1 revisers off, a parent's price state changed its child's masks. | State that the L2 controller acts on both in-life revision and the mutation of offspring. The experiment does not separate the two paths. |
| 4 | UNCLEAR | P11b does not reproduce with current code: G7c later changed the default `SELF` strain. On practice seed 101, the same R\* genes give 59.62 flies at `ec3047c` and 55.39 today. | Confirmed independently (V2). Reproduce at `07b54e7`; report the current-code numbers too. |
| 5 | LOOPHOLE | SHAM matches the switching law, not the realized switches. SHAM's fake state draws from the fly's own RNG (`b.rand`), which also drives movement and taste replay. With identical lean and full packages, META and SHAM still diverge from tick 1. The auditor found no anti-correlation (49.9% agreement at birth). | State the limitation. Measure the size of this RNG effect with the inert-package check (lean = full, META vs SHAM) on practice seeds, added to V5 before any V5 run. |
| 6 | LOOPHOLE | Birth mutation perturbs `tasteZ`/`moveZ`. META and SHAM overwrite them every tick; FIXED never restores them, and EVO-R restores them only when its package flips. At tick 1,200 on seed 101, 6/32 EVO-R and 5/34 FIXED descendants were off-package, against 0 for META and SHAM. Direction of effect unknown. | State the limitation. The comparator is this particular two-package evolutionary policy, not optimized evolution of six free genes. |
| 7 | SOUND / LOOPHOLE | Pairing by seed is correct and solo arms cannot affect each other. But a world's RNG also drives odor redraws, patch moves and update order, and behavior changes how much of it is consumed. Arms in the same seed do not see identical food or price histories. | Say "paired by initial seed", not "identical worlds". |
| 8 | LOOPHOLE | `MV_SET=L2` without `MV_ARMS` crashes (calls `.split` on undefined). | `docs/REPRODUCE_MICROVERSE.md` already gives `MV_ARMS=META,SHAM,EVOR,FIXED`. |

## Controls the auditor found sound

- No arm can see the hidden rule, true food value, food color or future draws. Oracle fields are only read by flagged oracle arms or by telemetry.
- Every arm pays the same rent per active mask (`brainCost × real multiplier × masks`), and SHAM pays the real price, not its fake one. This is parity of active-mask rent, not of total computation.
- "Late flies" is the mean of the 100 snapshots at ticks 10,100 to 20,000 in all runners. Extinct runs contribute zeros, not a shorter average.
- G7c is a clean two-way ablation: SELF and MOVEONLY share the movement initialization, and all three strains keep ordinary learning and birth mutation.
