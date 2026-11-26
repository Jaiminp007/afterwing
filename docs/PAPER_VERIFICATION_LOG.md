# Verification log for the Microverse paper

Plan: [PAPER_VERIFICATION_PLAN.md](PAPER_VERIFICATION_PLAN.md), frozen at `83e5f24`
before any run below.

## V2. Reruns of existing finals

### P11b gate (seeds 80001–80048)

**Rerun with current code: does not match the log.** Raw data:
`evidence/microverse/p11b-rerun-currentcode-80001-80048.json`.

| Contrast | Log (`07b54e7`) | Current code |
|---|---|---|
| R\* − R_P12 | +5.73, 48/48 | +7.50, 48/48 |
| R\* − R0 | −0.54, 21/48 | −1.52, 12/48 |

The plan assumed the default world was unchanged since P11b. That was wrong for
this strain: later commits changed the default `SELF` strain (the G7c movement
reviser, `dd0ea19`), so `SELF` with R\* genes is not the same fly as at P11b. The
gate contrast still passes with current code, and by more. The tie with the
designer's R0 does not hold with current code: R0 is 1.52 flies better.

**Rerun at the original commit `07b54e7`: reproduces the log exactly.** Means R\*
55.54, R_P12 49.81, R0 56.08; R\* − R_P12 +5.73 (48/48), R\* − R0 −0.54 (21/48).
Raw data: `evidence/microverse/p11b-final-80001-80048.json`. Exact one-sided
sign-flip p for the gate: 3.55e-15; 95% bootstrap CI [5.10, 6.34]. For R\* − R0 the
CI is [−1.32, 0.25]: the paper says "not significantly different from the designer's
version", not "equal to it", because no equivalence test was registered.

### G7b (seeds 70001–70048, code `da995b0`)

**Reproduces the log exactly.** SELF 55.44, TASTEONLY 54.56, +0.88, 30/48 positive;
the runner prints p = .01194, the same value as the original run. Raw data (full
precision): `evidence/microverse/g7b-final-70001-70048-rerun-da995b0.json`.
Exact one-sided sign-flip p = **.0130**, so G7b still misses the .01 bar, by a little
more than the printed value suggested. The defective Monte Carlo test did not cause
the miss.

## V1. Exact recomputation (`docs/paper/verify.mjs`)

All 21 contrasts match the logged means and win counts. The exact p-values agree
with the auditor's independent exact implementation (L2: 1.83e-12, 1.48e-7,
3.86e-10; G7c vs MOVEONLY 1.26e-29). Verdicts near the .01 bar, rechecked exactly:

| Contrast | Printed p | Exact p | Verdict |
|---|---|---|---|
| G7b SELF − TASTEONLY | .0119 | .0130 | miss (unchanged) |
| P13b-2b META − EVO-R | .00238 | .00243 | pass (unchanged) |
| P13b-3a keep accuracy | .0191 | .0332 | miss (unchanged) |
| L3-I screen 1, original d | .01085 (Scorer v2) | .0116 | miss (unchanged; also missed both factorial gates) |

No verdict changes. A second defect was found while checking: Scorer v2 (used from
L3-I on) takes its sign from bit 16 of a power-of-two LCG, period 2^17, so 200,000
draws give only 8,192 distinct sign vectors at n = 48 and 4,096 at n = 96.

### G1–G6 final run 1 (seeds 50001–50008): first rerun used the wrong commit

The first rerun used `da995b0`, the code of final run 2. Final run 1 was frozen at
`73ffefe`; `da995b0` changed the world (faster food relocation, lower brain cost).
That rerun is therefore not a reproduction and does not count. For the record, it
gave G1–G6 pass, G6 gain .373 / late .735 (log at `73ffefe`: .394 / .775), and G7
8/8 (log: 3/8). It is the final-run-1 seeds under final-run-2 code, an unplanned
look at spent seeds; it is not a test of anything and the paper does not use it.
The rerun at `73ffefe` follows.

### G1–G6 finals (seeds 50001–50008 at `73ffefe`, 60001–60008 at `da995b0`)

**Both reproduce bit for bit.** For each final, the rerun's report (pass/fail, shares,
G6 gain and late skill) and its full raw snapshot data are identical to the committed
files `evidence/microverse/suite-final-50000-1794893331557.json` and
`suite-final-60000-1794893845135.json`. G1–G6 pass and G7 fails in both, as logged.

### G7c (seeds 94001–94096) and fly-RSI L2 (seeds 95001–95048), current code

**Both reproduce exactly with current code** (this branch, default world unchanged
since `90a372a`). G7c: SELF 57.19, TASTEONLY 55.06, MOVEONLY 47.80; all 96 stored
differences identical for both contrasts. L2: means META 44.83, SHAM 41.96, EVO-R
41.19, FIXED 41.67; all 192 per-seed values identical (max absolute difference 0;
only the key order, which follows worker completion, differs). So the commands in
`docs/REPRODUCE_MICROVERSE.md` are confirmed for these two finals, and current code
is a valid base for the V4 replication.

**V2 summary:** every final the paper cites reproduces exactly at its recorded commit
(G1–G6 ×2, G7b, G7c, P11b, L2). P11b alone does not reproduce with current code,
because G7c changed the default fly.

## V4. Independent replication (run once)

Executor: Devin (GPT-6 Astra), the independent test sub-agent. This executor did
not write the frozen protocol. Work ran only in
`C:\Users\nisar\fly-ecosystem-paper`, on `paper/microverse-ladder`, using Bash and
Node v22.19.0 on Windows.

The run started at **2026-11-26T03:57:19Z**, at commit
`120601c91259f9bcc79b02fbc2b74f1cd8749786`. The final simulation output completed
at **2026-11-26T04:37:19.710Z**. Scoring completed at
**2026-11-26T04:38:09.643Z**. All times below are UTC.

Before creating any artifact, `git log --oneline -1 --
docs/PAPER_VERIFICATION_PLAN.md` identified
`d008d58f2c8492d1329ab2acfdaff020fe6b5225`, committed at
2026-11-26T03:06:12Z. Its timestamp predates the creation and modification times
of all five new files. Both banks, 6100001–6100048 and 6200001–6200096, were
already marked spent in `docs/SPENT_BANKS_RSI.md`, as expected.

The initial preflight saw HEAD `26df34f2f33b990be5581103b5f86f0431e5f9dd`.
HEAD advanced to the run-start commit before the first simulation. That change
touched only `docs/paper/main.tex`. The simulation code, statistical helpers,
and frozen plan remained unchanged throughout this replication.

The three V4 commands ran verbatim, sequentially, once each. No seeds, arms,
world settings, or measures changed. **Restarts: none.** The terminal monitor
disconnected around completion of each run. Each complete JSON output was
validated before proceeding; no completed command was rerun. Completion times
below are the output files' final modification times because terminal exit
notifications were unavailable.

| Run | Start | Output completed | Saved stdout |
|---|---|---|---|
| R-L2 | 2026-11-26T03:57:19Z | 2026-11-26T04:07:56.965Z | `evidence/microverse/paper-v4/r-l2-6100001-6100048.json` |
| R-G7c-T | 2026-11-26T04:13:00Z | 2026-11-26T04:24:32.017Z | `evidence/microverse/paper-v4/r-g7c-tasteonly-6200001-6200096.json` |
| R-G7c-M | 2026-11-26T04:26:04Z | 2026-11-26T04:37:19.710Z | `evidence/microverse/paper-v4/r-g7c-moveonly-6200001-6200096.json` |

`node docs/paper/score-v4.mjs` produced
`evidence/microverse/paper-v4/score.txt`. The scorer imports `signflip`, `bootCI`,
and `mean` from `docs/paper/stats.mjs`, as required by Amendment A1. It uses the
48 complete L2 `perSeed` rows and each solo output's 96 saved `diffs`, rounded
to 0.1. Runner p-values are ignored. The exact one-sided sign-flip test uses
the helper's 0.01 grid. Confidence intervals use 20,000 percentile bootstrap
resamples with seed 4242.

Arm means for R-L2 are META 44.958333, SHAM 41.353750, EVOR 41.122917, and
FIXED 41.237292. The solo outputs report SELF 57.57 in both comparisons,
TASTEONLY 54.82, and MOVEONLY 47.87, rounded to 0.01.

| Replication | Contrast | Mean difference | Positive seeds/n | Exact one-sided p | Bootstrap 95% CI | Bar | Verdict |
|---|---|---:|---:|---:|---|---|---|
| R-L2 | META-EVOR | 3.835417 | 44/48 | 2.38884467763e-11 | [2.998542, 4.670208] | mean >= 1; p < .01 | PASS |
| R-L2 | META-SHAM | 3.604583 | 42/48 | 1.50345513816e-9 | [2.690417, 4.501458] | mean >= 1; p < .01 | PASS |
| R-L2 | META-FIXED | 3.721042 | 45/48 | 1.25304211451e-11 | [2.940417, 4.471667] | mean > 0; p < .01 | PASS |
| R-G7c | SELF-TASTEONLY | 2.747917 | 77/96 | 2.53804770174e-13 | [2.137500, 3.354167] | mean >= 0.7; p < .01 | PASS |
| R-G7c | SELF-MOVEONLY | 9.705208 | 96/96 | 1.26217744835e-29 | [9.138542, 10.281250] | mean >= 0.7; p < .01 | PASS |

**R-L2 overall: PASS**, with all three gates passing.
**R-G7c overall: PASS**, with both gates passing. No gated contrast failed.

## V5. Sensitivity to world settings (practice seeds 101–116, report-only)

Runner: `docs/paper/run-v5.sh`; scorer: `docs/paper/score-v5.mjs` (exact test). Raw data
and the printed summary: `evidence/microverse/paper-v5/`.

| Test | Variant | vs EVO-R / TASTEONLY | vs SHAM / MOVEONLY | vs FIXED |
|---|---|---|---|---|
| L2 | base (×12, switch .001) | +3.02, 14/16, 6e-5 | +3.88, 16/16, 1.5e-5 | +3.05, 15/16, 1.8e-4 |
| L2 | low cost ×8 | +0.85, 10/16, .085 | +1.20, 10/16, .091 | +1.46, 13/16, .008 |
| L2 | high cost ×16 | +1.19, 13/16, .033 | +3.27, 13/16, .0023 | +2.50, 14/16, 2.3e-4 |
| L2 | slow switch .0005 | +3.44, 14/16, 2.3e-4 | +4.21, 14/16, 1.4e-4 | +3.80, 14/16, 9.2e-5 |
| L2 | fast switch .002 | +2.61, 13/16, .0014 | +1.74, 11/16, .025 | +3.36, 15/16, 3.1e-5 |
| G7c | epoch 3000 (base) | +2.17, 15/16, 4.6e-5 | +9.13, 16/16, 1.5e-5 | |
| G7c | epoch 2000 | +2.77, 12/16, .0056 | +9.38, 16/16, 1.5e-5 | |
| G7c | epoch 4500 | +3.05, 12/16, .0068 | +5.88, 15/16, 1.1e-4 | |
| L2 | inert packages, META − SHAM | −0.26, 7/16, p .65 | | |

**Reading (rule fixed in the plan):** every gated contrast is positive in every
variant, so both effects are "robust to these settings" in the plan's sense. The L2
effect's size depends on the world: at ×8 the gains over EVO-R and SHAM are about one
fly and would not clear the original bars, and at ×16 the gain over EVO-R shrinks to
+1.19. The chosen ×12 sits near the best value tried. **Inert check (amendment A1):**
with lean = full, META − SHAM = −0.26 (p .65), so SHAM's separate random stream does not
explain the L2 SHAM contrast.

## Revision experiments after blind review (plan `docs/PAPER_REVISION_PLAN.md`, frozen at `ccb4ce1`)

Run once each by Opus 5.5 at `ccb4ce1`, 2026-11-26 01:13–01:52, no restarts. Raw data:
`evidence/microverse/paper-rev/`. Scored with the exact test by `docs/paper/verify.mjs`.

### E1. L2 decomposition, seeds 6300001–6300048

| Contrast | Mean | Wins | Exact p | 95% CI | Gate |
|---|---|---|---|---|---|
| META − BIRTH (E1a) | +1.67 | 39/48 | 2.7e-5 | [0.93, 2.39] | > 0: **pass** |
| META − EVO-R | +3.34 | 42/48 | 2.2e-10 | [2.58, 4.08] | ≥ 1.0: **pass** |
| META − SHAM (own stream) | +3.23 | 42/48 | 3.2e-10 | [2.42, 4.06] | ≥ 1.0: **pass** |
| META − FIXED | +4.53 | 47/48 | 1.4e-14 | [3.91, 5.16] | > 0: **pass** |
| META − LEAN | +11.80 | 48/48 | 3.6e-15 | [10.99, 12.58] | > 0: **pass** |
| BIRTH − FIXED (reported) | +2.86 | 45/48 | 1.5e-10 | [2.19, 3.49] | — |
| LEAN − FIXED (reported) | −7.27 | 1/48 | — | [−8.22, −6.31] | — |
| METAOFF − NOREV (reported) | 0.00 | 0/48 | — | identical on every seed | — |
| factorial f (reported) | +4.53 | 47/48 | 1.4e-14 | [3.91, 5.16] | — |

Means: META 44.85, BIRTH 43.18, SHAM 41.62, EVO-R 41.51, FIXED 40.32, LEAN 33.05, METAOFF = NOREV 31.83.
Telemetry: 40–46% of flies experienced at least one price switch before death (META 40%);
mean lifespan 556–678 ticks; mean active features per fly-tick META 21.7, BIRTH 23.0, FIXED 26.2, LEAN 14.0.

**Reading (fixed in the plan):** E1a and E1b pass. Tracking the price during life adds to
assigning the package at birth, but birth assignment alone gives about 60% of META's gain
over FIXED (+2.86 of +4.53). With the package reset before birth, the controller has no
effect without L1 revision (METAOFF = NOREV exactly), so the whole effect runs through the
reviser. Always-lean is much worse than always-full, so the gain is shedding features only
while they are expensive, not shedding as such.

### E2. G7c evidence-selection controls, seeds 6400001–6400096

| Contrast | Mean | Wins | Exact p | 95% CI | Gate |
|---|---|---|---|---|---|
| SELF − SHAM (E2a) | +5.09 | 93/96 | 3.0e-24 | [4.06, 6.61] | ≥ 0.7: **pass** |
| SELF − MOVESHAM (E2b) | +1.28 | 65/96 | 5.9e-5 | [0.66, 1.91] | ≥ 0.7: **pass** |
| SELF − GIFT (E2c) | −0.78 | 43/96 | .99 | [−1.46, −0.10] | > 0: **FAIL** |
| SELF − FIXED (E2d) | +13.54 | 96/96 | 1.3e-29 | [12.96, 14.12] | ≥ 0.7: **pass** |

Means: SELF 57.14, GIFT 57.92, MOVESHAM 55.85, SHAM 52.04, FIXED 43.60.

**Reading (fixed in the plan):** E2c fails. Choosing movement senses from evidence beats
choosing them at random (E2b), but it does not beat giving the fly the two useful senses
from birth; the gift is 0.78 flies better. The G7c movement claim narrows to: evidence-driven
movement revision beats random revision and no revision, and is matched (in fact slightly
beaten) by a designer who supplies the right senses.
