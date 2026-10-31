# MATE-FOOD status (gen-2 feasibility via nutrient enrichment)

Line opens here: MATE-INHERIT V1 closed exact-copy transmission (gap 0,
16/16 identical per-seed) with ZERO gen-2 births in 12 mains — a V1b
with mutation is UNLICENSED until gen-2 exists at all. This line is the
feasibility gate (existence claim only; explicitly not promotion-worthy).

- 2026-10-26: Phase-A FROZEN as `docs/MATE_FOOD_PLAN_V1.md` +
  `docs/MATE_FOOD_PLAN_V1A.md` (DESIGN ONLY; A1 corrects the control
  value AND the plumbing: control = null = legacy phase table
  0.4/0.4/0.2/0.4 (V1 ran .4, never 3); enriched = forced constant 5.0;
  constructor-passed nutrient would be dead on arrival — phases rule).
  12 mains (control = V1 replication + enriched test) on fresh bank
  415001–415054 (verified clean pre-freeze, 0 hits; re-verify at build).
  Adjudicated read-only: maturity low (18–28, not the wall), cooldown 12
  non-binding (ruled out), mortality heavy (energy testable), arena
  resize rejected (hardcoded + validated in ≥4 engine sites, too
  invasive), density increase already tried (MATE-DENSE backfires).
  Boundary-test rationale (ceiling or room-is-wrong). GO = ≥1 enriched
  gen-2 (existence only, lineage-verified); INCOMPLETE if enriched
  gen-1 = 0; else NOGO with pre-registered survival/energy reading
  (energy-ruled-out vs dose-wrong). Null-default nutrientOverride
  plumbing (probe paths untouched) + lineage generation summary frozen.
- 2026-10-26: Phase-A IMPLEMENTED (`scripts/mate-food-dev.mjs` +
  `tests/mate-food-dev.test.mjs` 6/6 green; triage at 6-pristine
  baseline (engine change verified behavior-identical); bank
  `evidence/mate-food-dev/fresh-01/` built 415001–415054 post-fixtures.
  summarizeGenerations unit-tested (founders excluded, null-safe);
  scorer branches incl. totals-uncomputable INVALID + INCOMPLETE on
  enriched-gen-1==0; null-hygiene via V1-parity + override-survives-C-dip
  tests (1100-tick both arms). Bank test → post-build refusal +
  read-only checks. Next: single authorized attempt.
