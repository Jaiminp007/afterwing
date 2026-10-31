# MATE-PROXIMITY STATUS (V1 CLOSED AS GO)

- Plan: `docs/MATE_PROXIMITY_PLAN_V1.md` (FROZEN 2026-11-01, design only).
- Implement: matingRangeMultiplier null-default knob (engine execution site + validation +
  TasteExperiment passthrough) + `scripts/mate-proximity-dev.mjs` (3-arm range dose,
  per-arm range map, dose verdict) + scripted range proof (20u/40u boundaries exact) +
  1×≡no-flag bit-identity + 11/11 fixtures + fresh bank 432001–432054.
- Attempt-01 (single, authorized, 2026-11-01): 18 mains / 0 probes / 3.60e9 ops, clean pass.
- Verdict: **MATE-PROXIMITY-GO-V1** (dose-monotone 5 ≤ 9 ≤ 17 on gen-2 AND 32 < 46 < 57 on births; strict ordering, no ties needed; sublinear births scaling 1:1.44:1.78 vs radii 1:2:4).
- Line CLOSED. First clean mating dose-response; mechanism sketch survives on every link.
- Next licensed: Emlen-Oring split at the right level (hub-wide vs spread-wide — same breadth, different food; needs fresh rationale + frozen plan + fresh bank).
- Results: `docs/MATE_PROXIMITY_RESULTS_V1.md`. Cumulative program spend: 7797.
