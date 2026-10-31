# VALUE-PROBE Status

- 2026-10-26: V1 FROZEN (`VALUE_PROBE_PLAN_V1.md`, design only).
- 2026-10-26: IMPLEMENTED. Engine `probeCueValues` (exact, context-free
  phi, math-wrapper billing only — no surcharge after fidelity check
  caught double-billing); instrument `scripts/value-probe-dev.mjs`
  (V1 triple x 3 pairs = 9 mains, end-of-seg probes all rows, per-cue
  per-third behavior, SDT d'/c, BH gap gate); 9/9 fixtures
  (`tests/value-probe-dev.test.mjs`: fidelity/purity/null-default/
  transplant/collector-thirds/dPrime/scorer-branches/bank-tmp+refusal);
  triage clean (6 known baseline only); bank
  `evidence/value-probe-dev/fresh-01/` built 421001–421054 (54 unique,
  2 self-excluded literals = V1i-identical harmless pattern).
  Single authorized attempt NEXT (not this turn).
