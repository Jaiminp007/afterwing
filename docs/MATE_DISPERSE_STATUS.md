# MATE-DISPERSE STATUS (V1 FROZEN, design only)

## V1 (natal dispersal rescues sinks; FROZEN 2026-11-02, design only)

- Plan: `docs/MATE_DISPERSE_PLAN_V1.md` (per-birth d=0.5 coin flip to
  uniform-random founder-box placement vs midpoint; dedicated per-mating
  seeded RNG (main stream untouched); unbilled per mating-block precedent
  (geometry-only test); hubDisperse vs hub + spread anchor; per-row
  'dispersal' field; GO iff hubDisperse gen-2 ≥ 2 AND > hub; bank 442xxx;
  closes line either way).
- Rationale: Hamilton & May 1977 (disperse despite cost) + rescue effects +
  R106 sink diagnosis (8/8 hub arms B−D < 0); no prior arm moved newborns.
- Implement: separate turn under the plan (engine knob + validation +
  dedicated RNG + instrument + 12 fixtures incl. placement/determinism/
  bit-identity + triage + fresh-01 bank 442001–442054); single attempt
  next. Cumulative unchanged (7971, design only, zero worlds).
