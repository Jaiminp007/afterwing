# Paper revision experiments (after two blind reviews)

Frozen before any fresh-seed run below. Two reviewers (Opus 5.5 and GPT-6.2 Astra), given
only the PDF, asked for controls the paper lacked. Results go in
`docs/PAPER_VERIFICATION_LOG.md` and into the paper whatever they show. Nothing here
changes a result already reported.

Code: the commit that adds this file. New behavior is opt-in (new strains `L2D_*`,
`MOVESHAM`, `GIFT`; new program flags `pkgReset`, `pkgTick`, `l2dStats`; controllers
`brainBirth`, `brainShamS`). `tests/l2d.test.mjs` checks that the original L2 and G7c arms
reproduce their committed finals exactly, and that each new control does what it claims.

Before this file, the only runs of the new arms were smoke runs on practice seeds 101–104
(L2-D) and 101–102 (G7d), to check that the code runs and how long it takes. Nothing was
tuned on them. No further practice runs will be made.

All p-values: exact one-sided sign-flip test (`docs/paper/stats.mjs`) on per-seed
mean late population (ticks 10,100–20,000, extinct = 0), never runner output. Each run is
made once; a crash before results may be restarted; any completed output is final.

## E1. L2 decomposition (L2-D), fresh seeds 6300001–6300048

World: `brainSwitch` mul [1, 12], switch .001 (the L2 world). Command:

```sh
MV_WORLD='{"brainSwitch":{"mul":[1,12],"switch":0.001}}' \
node microverse/arms.mjs L2D_META,L2D_BIRTH,L2D_SHAM,L2D_EVOR,L2D_FIXED,L2D_LEAN,L2D_METAOFF,L2D_NOREV 6300001-6300048
```

Matched controls in every arm: the package is re-applied every tick (mutated thresholds
reset alike); in-life controllers reset to the full package before offspring mutation, so
the parent's price state cannot change offspring mutation; the sham's fake price has its
own random stream.

| Arm | What it is |
|---|---|
| META | reads the true price every tick, switches lean/full |
| BIRTH | reads the true price once, at its first tick, keeps that package for life |
| SHAM | same rule, independent fake price on its own random stream |
| EVO-R | package flips at birth with probability .1, no in-life rule |
| FIXED | always the full package |
| LEAN | always the lean package |
| METAOFF | META with L1 revision switched off |
| NOREV | no L1 revision, full package |

**Gates** (p < .01):

- **E1a (primary, the reviewers' question):** META − BIRTH > 0. Tracking the price during
  life adds to choosing the right package at birth.
- **E1b (L2 under matched controls):** META − EVO-R ≥ 1.0; META − SHAM ≥ 1.0;
  META − FIXED > 0; META − LEAN > 0.

**Reported, not gated:**

- Factorial: f = (META − FIXED) − (METAOFF − NOREV), the part of the controller's effect that
  needs L1 revision. With the package reset at birth, METAOFF and NOREV should be identical
  (no direct path), which would make f = META − FIXED.
- BIRTH − FIXED; LEAN − FIXED.
- Telemetry per arm: share of deaths that experienced at least one price switch in life,
  mean lifespan, mean active features per fly-tick.

Reading, fixed now: if E1a fails, the paper says the L2 benefit is shown for state-conditioned
package assignment, and not shown for tracking changes during life. If E1b fails under the
matched controls, the paper says so and drops the L2 claim to what survives.

## E2. G7c evidence-selection controls (G7d), fresh seeds 6400001–6400096

Default world, current fly. Command:

```sh
node microverse/arms.mjs SELF,SHAM,MOVESHAM,GIFT,FIXED 6400001-6400096
```

| Arm | What it is |
|---|---|
| SELF | evidence-driven taste and movement revision (the G7c fly) |
| SHAM | random taste and movement revision (random sign at weight 2) |
| MOVESHAM | evidence-driven taste revision, random movement revision |
| GIFT | evidence-driven taste revision, no movement revision, born with the "toward best food" and "stay" senses at weight 2 |
| FIXED | no revision, no mutation |

**Gates** (p < .01):

- **E2a:** SELF − SHAM ≥ 0.7.
- **E2b (movement evidence matters):** SELF − MOVESHAM ≥ 0.7.
- **E2c (evidence beats a gift of the useful senses):** SELF − GIFT > 0.
- **E2d:** SELF − FIXED ≥ 0.7.

Reading, fixed now: if E2c fails, the paper says the G7c movement gain is matched by giving
the fly the useful senses without evidence, and narrows the G7c claim to that.
