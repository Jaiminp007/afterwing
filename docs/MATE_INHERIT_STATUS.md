# MATE-INHERIT status (vertical transmission of learned weights)

Licensed by MATE-ENERGY GO + round-10 major-transition view (replication
must couple with division; verified: newborns currently get zeroed
weights, no vertical transmission anywhere).

- 2026-10-30: `docs/MATE_INHERIT_PLAN_V1.md` FROZEN (maternal exact-copy
  transmission, no mutation yet; 2 arms zeroed/maternal × 6 histories =
  12 mains on fresh bank 405001–405054 verified clean; GO = +6 births gap;
  both-zero → INCOMPLETE-NOBIRTHS (not NOGO); new TasteExperiment flag
  `verticalTransmission`, null-default).
- 2026-10-30: Phase-A EXECUTED → **NOGO (transmission verified working,
  changes nothing)**. Identical per-seed births (16/16, gap 0); mechanism
  confirmed live (unit-tested copy path + audited plumbing), effect absent
  — likely one-generation window (founders do most mating; transmitted
  weights have no gen-2 to compound in). Line closed for exact-copy;
  V1b needs mutation + lineage tracking (UNLICENSED by the NOGO — needs
  a new rationale; feasibility first). Full record:
  MATE_INHERIT_RESULTS_V1.md.
- 2026-10-26: Phase-B FROZEN as `docs/MATE_INHERIT_PLAN_V1B.md` (DESIGN ONLY).
  Mutated maternal transmission (additive N(0,0.05) post-copy, dedicated
  per-newborn RNG stream, 1 op/element billed; null-default exact-copy
  preserved) + lineage compounding: 12 mains (exact vs mutant, BOTH
  enriched nutrient 5.0 — uniform enrichment isolates mutation) on fresh
  bank 416001–416054 (verified clean pre-freeze, 0 hits; re-verify at
  build). Rationale now exists: V1f gen-2 existence + MLS/ratchet
  standing lit (variation is load-bearing). GO iff mutant gen-2 ≥ 2 AND
  mutant > exact (replication-within-line + direction; feasibility-
  grade, power ≈ 1-in-5 under 2x effect, stated); INCOMPLETE-NOMUTANTS
  iff mutant gen-1 == 0 (void, not NOGO); else NOGO with stop-rule
  analogue (no auto-escalation; deleterious direction reported).
  Descriptive maxGeneration/gen-3+/gen-1-lifespan (censored) for V1c
  design. No RSI claim (GO licenses V1c selection, not an advance).
- 2026-10-26: Phase-B IMPLEMENTED (`scripts/mate-inherit-v1b.mjs` +
  `tests/mate-inherit-v1b.test.mjs` 8/8 green; triage clean (engine
  null-default verified behavior-identical); bank
  `evidence/mate-inherit-dev/fresh-02/` built 416001–416054
  post-fixtures). Engine: transmissionNoise plumbing (null default +
  per-newborn seeded RNG + billed ops; V1's exact-copy path untouched).
  Fixtures: scorer GO/NOGO/INCOMPLETE-NOMUTANTS/INVALID incl. totals-
  null; generation summarizer + censored lifespan; V1-parity; options-
  contrast (single knob). Bank test → post-build refusal + read-only
  checks. Next: single authorized attempt.
