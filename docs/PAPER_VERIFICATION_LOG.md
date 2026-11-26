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
