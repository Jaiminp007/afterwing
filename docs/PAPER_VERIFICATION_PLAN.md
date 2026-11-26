# Verification plan for the Microverse paper

Frozen before any of the runs below. This file is committed first; results go in
`docs/PAPER_VERIFICATION_LOG.md` and are reported whatever they show. Nothing here
changes a result already in the log. If a check fails, the paper says so.

Code for all runs: the commit that adds this file (default-world code is unchanged
from `main` at `90a372a`).

## V1. Every number in the paper is computed from raw data

`docs/paper/verify.mjs` reads `evidence/microverse/*.json`, recomputes every mean,
win count, p-value and bootstrap CI cited in the paper, writes them as LaTeX macros
(`docs/paper/numbers.tex`), and exits non-zero if any value in `docs/paper/claims.md`
disagrees with the recomputed value at its stated rounding. The p-values are
recomputed with an independent sign-flip implementation (exact for n ≤ 20, otherwise
10^6 Monte Carlo flips from a different generator than the runners use).

## V2. Reruns of existing finals on their own seeds

Deterministic reproductions, not new tests. Pass means identical per-seed values (or
identical summary values where only summaries were saved).

| Final | Seeds | Code |
|---|---|---|
| P11b gate | 80001–80048 | this commit (original kept no per-seed data) |
| G7c, both contrasts | 94001–94096 | this commit, and `dd0ea19` if this commit differs |
| Fly-RSI L2 | 95001–95048 | this commit, and `a8e5e6b` if this commit differs |
| G1–G6 suite, both finals | 50001–50008, 60001–60008 | `da995b0` |

## V3. Adversarial audit of the controls

An independent model (GPT-6.2 Astra, fresh thread, read-only) audits information
leaks, SHAM matching, cost parity, RNG coupling, EVO-R fairness, the outcome measure
and the sign-flip code. Each finding marked LOOPHOLE or UNCLEAR becomes a test in
`tests/` or a stated limitation in the paper. The report is saved as
`docs/paper/AUDIT_CONTROLS.md`.

## V4. Independent replication on new seed banks (run once)

New banks, never used by any test (checked against `docs/SPENT_BANKS_RSI.md` and
all Microverse logs on 2026-11-25):

| Replication | Seeds | Arms | Command |
|---|---|---|---|
| R-L2 | 6100001–6100048 | META, SHAM, EVOR, FIXED | `MV_SET=L2 MV_ARMS=META,SHAM,EVOR,FIXED MV_WORLD='{"brainSwitch":{"mul":[1,12],"switch":0.001}}' node microverse/p13parts.mjs 6100001-6100048` |
| R-G7c-T | 6200001–6200096 | SELF, TASTEONLY | `node microverse/solo.mjs SELF TASTEONLY $(seq -s, 6200001 6200096)` |
| R-G7c-M | 6200001–6200096 | SELF, MOVEONLY | `node microverse/solo.mjs SELF MOVEONLY $(seq -s, 6200001 6200096)` |

Gates are the original ones, unchanged (one-sided sign-flip, p < .01):

- R-L2: META − EVOR ≥ 1.0; META − SHAM ≥ 1.0; META − FIXED > 0. All three must pass.
- R-G7c: SELF − TASTEONLY ≥ 0.7 and SELF − MOVEONLY ≥ 0.7. Both must pass.

Rules: each replication runs exactly once, by an agent other than the one that
wrote this plan, using the commands above verbatim. No reruns, no dropped seeds, no
change of arms or measure. A crash before results counts as not run and may be
restarted; any completed output is final. The banks are added to the spent ledger
when the run starts.

## V5. Sensitivity of the world settings (practice seeds 101–116 only, report-only)

These spend no fresh seeds and have no gates. They answer whether the L2 and G7c
effects depend on the exact world values that were chosen.

L2 (`MV_SET=L2 MV_ARMS=META,SHAM,EVOR,FIXED node microverse/p13parts.mjs 101-116`,
world as below):

| Variant | `brainSwitch` |
|---|---|
| base | mul [1, 12], switch .001 |
| low cost | mul [1, 8], switch .001 |
| high cost | mul [1, 16], switch .001 |
| slow switching | mul [1, 12], switch .0005 |
| fast switching | mul [1, 12], switch .002 |

G7c (`node microverse/solo.mjs SELF TASTEONLY 101,...,116` and the same for
MOVEONLY), with the rule schedule changed:

| Variant | `ruleSchedule` epoch length |
|---|---|
| base | 3000 |
| short epochs | 2000 |
| long epochs | 4500 |

Reading, fixed now: the paper reports every variant's mean differences and wins.
A later amendment (A1, below) adds one more practice check. It
calls an effect "robust to these settings" only if the sign of each gated contrast
is positive in every variant; otherwise it names the variants where it is not.

## Amendment A1 (2026-11-25, after the V3 audit and before any V4 or V5 run)

The audit (`docs/paper/AUDIT_CONTROLS.md`) found that the runners' Monte Carlo
sign-flip test is broken for n > 16, and that SHAM's fake cue shares the fly's own
RNG with movement and taste replay. Two changes, made before any V4 or V5 run:

1. **V4 p-values** come from the exact sign-flip test in `docs/paper/verify.mjs`,
   applied to the per-seed values the runners print. The p-value the runners print
   is ignored. Bars, arms, seeds and commands are unchanged.
2. **V5 adds an inert-package check** (practice seeds 101–116, report-only): META
   against SHAM with the lean package set equal to the full package, so the cue
   cannot act through genes. Any difference measures the RNG effect alone.

   ```sh
   MV_SET=L2 MV_ARMS=META,SHAM \
   MV_META='{"leanGenes":{"tasteCap":16,"tastePrune":2,"tasteZ":3,"moveCap":12,"movePrune":0.5,"moveZ":3}}' \
   MV_WORLD='{"brainSwitch":{"mul":[1,12],"switch":0.001}}' \
   node microverse/p13parts.mjs 101-116
   ```

   Reading: if the mean META − SHAM difference here is small next to the +2.87 of
   the L2 final, the RNG difference does not explain the SHAM contrast. The paper
   reports the number either way.
