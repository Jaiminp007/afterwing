# GAIN-DOSE Results V1 — INVALID (replication gate fails; monotonic trend unlicensed)

Date: 2026-10-26. Plan: `docs/GAIN_DOSE_PLAN_V1.md` (no amendments).
Bank: `evidence/gain-dose-dev/fresh-01/` (6 histories, 422001–422054).
Evidence: `evidence/gain-dose-dev/attempt-01/`. Single attempt, 21/21
mains, `redone: []`, ledger exact (21/0/37632/903168/3.40e9).

## Verdict: INVALID (G-replication fails 1/3; no license issued)

- **G1 integrity ✓** — 21/21 complete, join ≥ 0.99, ledger exact.
- **G0 train-learned ✓** — train gaps 0.820/0.810/0.813 (V1 reference
  reproduced again).
- **G2b unlearned flat ✓**; null-hygiene clean (all dose arms fired,
  all null arms zero).
- **G-replication FAILS** — d=1 minus d=0 per pair: P1 +0.00, P2 +0.05,
  P3 +0.11 → repWins 1/3 < 2 → INVALID per the frozen gate. The
  deployed effect (+0.104 in V1g) did not reproduce at d=1 here
  (+0.053 pooled).

## Autopsy: the gate met bank-dependence

Uniform (d=0) HB per pair: 0.46 / 0.36 / 0.38 — pair 1's baseline
already sits at deployed-gain levels, compressing the d=1 contrast to
zero there. Historic uniform baselines (~0.33) made +0.1 clearable;
this bank's elevated baselines don't. Same lesson as VALUE-PROBE (BH
0.83 vs 0.20): transfer outcomes are substantially bank-determined,
and now bank-variance has eaten a calibration gate. The gate worked
as designed — it refused to calibrate a curve on a failed anchor —
but the failure mode is ecological (baseline luck), not instrumental
(all other gates pass, manipulation fired, ledger exact).

## Descriptive (reported, explicitly UNLICENSED)

Pooled HB means: d=0: 0.40, d=0.5: 0.44, d=1: 0.45, d=2: 0.49,
d=4: 0.55 — monotonic rise (quadratic peak 5.9, outside range). This
SUGGESTS escalation, and the plan withholds the license anyway: no
anchor, no extrapolation. That restraint is the finding's price, and
the discipline working as specified. A retest would need a rationale
addressing bank-baseline variance (e.g., adaptive per-pair
normalization — a new frozen plan, not this one; no V2 licensed).

## Timing secondary (piggybacked, inconclusive)

First-contact ticks logged all arms (passive, as planned). Pair-dose
pooled test (n=15): r(first-contact tick, BH correctness) = −0.26
(earlier encounters → slightly better avoidance, right-signed) —
but first contacts cluster tightly (~769, low variance), so the test
is underpowered by construction. The encounter-timing hypothesis is
neither confirmed nor killed; the instrumentation now exists in this
line's rows for any future meta-analysis. Unlicensed, as planned.

Cumulative 7647 + 21 = 7668 (+21 ledgered; per-line authoritative).
No RSI claim.
