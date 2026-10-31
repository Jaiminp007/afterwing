# GAIN-DOSE Status

- 2026-10-26: V1 FROZEN (`docs/GAIN_DOSE_PLAN_V1.md`, design only).
- 2026-10-26: IMPLEMENTED. Instrument `scripts/gain-dose-dev.mjs`
  (coupled dose d in {0,.5,1,2,4} x 3 pairs + train + unlearned = 21
  mains; V1i transplant/collector/ledger machinery; per-cue per-third +
  first-contact ticks; scorer with G1/G0/G2b + d=1 replication gate +
  OLS quadratic + OPTIMAL/ESCALATE/DE-ESCALATE/OVERDOSE/FLAT/
  INDETERMINATE). Engine untouched (no new export needed — dose is pure
  options). 9/9 fixtures (`tests/gain-dose-dev.test.mjs`: coupled-dose
  identity, transplant, collector+firstTick, quadFit, all scorer
  branches incl. heterogeneous-pair DE-ESCALATE + tip-over
  INDETERMINATE, d=4 finiteness short run on synthetic seed 900001,
  bank tmp+refusal). Implement fixes: missing `=>` on runOne (syntax);
  m4>=m2 guard on peak-right ESCALATE (flat-noise protection).
  Triage clean (6 known baseline only). Bank
  `evidence/gain-dose-dev/fresh-01/` built 422001–422054 (54 unique,
  2 self-excluded literals = established harmless pattern).
  Single authorized attempt NEXT (not this turn).
