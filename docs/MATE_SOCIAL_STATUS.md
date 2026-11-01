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
- 2026-10-26: Phase-A EXECUTED → **MATE-SOCIAL-NOGO-V1** (go:false).
  G1/G2 pass; copybest gen-2 = 1, maternal gen-2 = 1 (same history
  426001, same founder lineage [7] both arms). Selection has nothing
  to select on: gen-2 happens in 1/6 histories regardless of what's
  transmitted → bottleneck is ENCOUNTERS, not transmission content.
  V1 exact-copy neutral + V1b mutated-copy unconfirmed + V1c NOGO +
  V1d not licensed + MATE-SOCIAL NOGO = transmission-mechanism space
  CLOSED. Future mating needs a new bottleneck (encounter rate:
  quorum/aggregation/attraction/clumped-food), not a new copy rule.
  No V2. Cumulative 7695 (+12).

## V2 (conditional + recency-weighted copying; FROZEN 2026-11-02, design only)

- Plan: `docs/MATE_SOCIAL_PLAN_V2.md` (new `copyconditional` mode: maiden-line
  gate mOff ≤ 1 incl. current birth + most-recent-success donor (more-successful
  parent, lower-id tiebreak) + frozen fallback chain; per-tick billing unchanged
  (zero new billed ops); checkpoint round-trip required; copycond vs copyalways
  (V1-exact) vs maternal; GO iff copycond gen-2 ≥ 2 AND > maternal; bank 443xxx
  fresh-02; closes line either way).
- Rationale: Rogers (unconditional copying neutral-to-harmful) + R82 copy-when-
  uncertain + R82/R116 recency (lifetime success is a lagging indicator) —
  mechanism fix for V1's identified failure mode, not a retest.
- Implement: separate turn under the plan (enum + gate + donor rule + per-row
  transmission field + 12 fixtures incl. gate/recency/fallback/determinism/
  billing + triage + bank 443001–443054); single attempt next.
- Cumulative unchanged (7959, design only, zero worlds).
