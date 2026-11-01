# MATE-RECOMBINE STATUS (V1 FROZEN, design only)

## V1 (biparental uniform crossover; FROZEN 2026-11-02, design only)

- Plan: `docs/MATE_RECOMBINE_PLAN_V1.md` (uniform per-element crossover
  p=0.5 from two parents, per-newborn RNG, fallback chain biparental→
  maternal→as-created, +1 op/element, enum extension TasteExperiment-only;
  hubRecombine vs hub + spread anchor; GO iff hubRecombine gen-2 ≥ 2 AND >
  hub; per-row 'transmission' field (knob varies); bank 441xxx; closes line
  either way).
- Rationale: R86 recombination-less critique + read-only engine audit (no
  recombination/inbreeding code) — first canonical benefit of mating ever
  tested; failure informative both ways (disruption vs indifference).
- Implement: separate turn under the plan (enum + crossover + per-row field
  + 12–13 fixtures incl. disjoint-marker mix proof + triage + fresh-01 bank
  441001–441054); single attempt next. Cumulative unchanged (7941, design
  only, zero worlds).
