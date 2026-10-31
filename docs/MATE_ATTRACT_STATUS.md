# MATE-ATTRACT STATUS (V1 CLOSED AS NOGO, V1b CLOSED AS NOGO)

## V1 (encounter contrast, NOGO 2026-11-01)

- Plan: `docs/MATE_ATTRACT_PLAN_V1.md` (FROZEN 2026-11-01, design only).
- Implement: mateSenseMultiplier null-default knob (engine sensors + validation +
  TasteExperiment passthrough) + `scripts/mate-attract-dev.mjs` (2x2, per-arm sense/topo
  maps, encounter-contrast verdict) + scripted two-fly sensing proof + 10/10 fixtures +
  fresh bank 430001-430054.
- Attempt-01 (single, authorized, 2026-11-01): 24 mains / 0 probes / 4.72e9 ops, clean pass.
- Verdict: **MATE-ATTRACT-NOGO-V1** (encounter contrast exactly flat: spread/2x gen-2 4
  vs spread/1x 4; births 30 vs 33; learned-use limitation realized, knob proven engaged).
- Hub arms descriptive: hub/1x 6 + hub/2x 8 vs spread 4/4 (V1-direction third bank).
- Line CLOSED (as V1). Births bank-volatile fourth time running.
- Weight-frozen diagnostic BLOCKED (rows lack weights); requirement carried (now conditional — see V1b).
- Results: `docs/MATE_ATTRACT_RESULTS_V1.md`.

## V1b (suppression, NOGO 2026-11-01)

- Plan: `docs/MATE_ATTRACT_PLAN_V1B.md` (hub suppression 0.5× vs 1×, food held; spread anchor; GO iff suppression works with hub≥2).
- Implement: per-arm sense/topology maps + scripted 0.5× sensing proof (detects 0.4r, blind 0.75r) + 1×≡no-flag bit-identity + 10/10 fixtures + fresh bank 431001–431054.
- Attempt-02 (single, authorized, 2026-11-01): 18 mains / 0 probes / 3.45e9 ops, clean pass.
- Verdict: **MATE-ATTRACT-NOGO-V1B** (suppression fails exactly: 5v5/27v27/22v22; V1-direction reverses fourth bank: spread 6 > hub 5).
- Structural finding: decoupled mating is proximity-gated (engine.mjs:175-178 — mate-action channel bypassed); sensing acts only via locomotion; [0.5,2]× range-invariant. Sharpens V1's learned-use reading; R65 patching-illusion cross-link recorded.
- Consequence: mating arc tested proximity-mediated mating throughout; Emlen-Oring needs proximity-rate manipulation (not sensing); weight-logging requirement now conditional on coupled designs.
- Line CLOSED. Results: `docs/MATE_ATTRACT_RESULTS_V1B.md`. Cumulative program spend: 7779.
