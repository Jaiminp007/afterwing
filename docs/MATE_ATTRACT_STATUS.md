# MATE-ATTRACT STATUS (V1 CLOSED AS NOGO)

- Plan: `docs/MATE_ATTRACT_PLAN_V1.md` (FROZEN 2026-11-01, design only).
- Implement: mateSenseMultiplier null-default knob (engine sensors + validation +
  TasteExperiment passthrough) + `scripts/mate-attract-dev.mjs` (2×2, per-arm sense/topo
  maps, encounter-contrast verdict) + scripted two-fly sensing proof + 10/10 fixtures +
  fresh bank 430001–430054.
- Attempt-01 (single, authorized, 2026-11-01): 24 mains / 0 probes / 4.72e9 ops, clean pass.
- Verdict: **MATE-ATTRACT-NOGO-V1** (encounter contrast exactly flat: spread/2× gen-2 4
  vs spread/1× 4; births 30 vs 33; learned-use limitation realized, knob proven engaged).
- Hub arms descriptive: hub/1× 6 + hub/2× 8 vs spread 4/4 (V1-direction third bank).
- Line CLOSED. Births bank-volatile fourth time running.
- Results: `docs/MATE_ATTRACT_RESULTS_V1.md`. Cumulative program spend: 7761.

## Blocked diagnostic (2026-11-01, zero worlds spent)

- R64 specified a weight-frozen check (mate-channel weights ~init => lazy regime) on
  frozen attempt-01 artifacts. BLOCKED: mating rows never log weights (row keys verified
  2026-11-01 — no learners/weights fields). No workaround without new worlds.
- Requirement carried: next mating instrument must log per-channel weight norms
  (or the lazy-vs-downstream question stays untestable). Not a verdict change.
