# MATE-SOCIAL Status

- 2026-10-26: V1 FROZEN (`docs/MATE_SOCIAL_PLAN_V1.md`, design only).
- 2026-10-26: IMPLEMENTED. Engine `learning/taste-experiment.mjs`:
  `verticalTransmission:'copybest'` accepted; per-newborn parental
  offspring counters (`run.founderOffspring`, +1 op/parent, all modes,
  identical billing incl. null) with lazy init (old mock runs keep
  working); `bestFounderLearner()` (max offspring, ties→lowest id,
  skips weightless/missing, null when empty). Instrument
  `scripts/mate-social-dev.mjs` (V1b-identical runner/scorer adapted:
  2 arms×6 histories = 12 mains enriched; GO copybest≥2 AND
  >maternal; INCOMPLETE-NOBIRTHS; founderSpread + per-arm
  founderOffspring aggregation via V1c helpers). 9/9 fixtures
  (`tests/mate-social-dev.test.mjs`: scorer branches, G/F
  summaries, bestFounder selection incl. ties/empties, copybest
  end-to-end (best founder copied, parents counted+billed),
  null-default V1-parity, engine knob acceptance, post-bank guard).
  V1/V1b suites green post-change (lazy-init fix verified via
  stash-adjacent A/B: 13/13 both ways). Triage at 6 pre-existing
  baseline failures. Bank `evidence/mate-social-dev/fresh-01/`
  built 426001–426054 (54 unique; synthetic fixture seeds moved to
  900021+ after a 426xxx collision was caught pre-build).
  Single authorized attempt NEXT (not executed this turn).
