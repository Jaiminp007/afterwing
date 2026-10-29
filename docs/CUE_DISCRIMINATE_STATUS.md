# CUE-DISCRIMINATE status (foraging choice, not retention)

Licensed by F-RISK (choice defect 8/8). Question: is avoidance cue-gated,
and is there room/slowness worth intervening on?

- 2026-10-29: `docs/CUE_DISCRIMINATE_PLAN_V1.md` FROZEN (DESIGN ONLY).
  Verified read-only: decision records carry cue+action per tick, physical
  records carry beneficial/harmful intake per tick, observe records carry
  energy — a join collector suffices, NO new emitter needed.
- Next: implement join collector + dev script + smoke, triage, bank
  pre-build (386001–386054), then the single Phase-A attempt (24 mains,
  zero probes) via module import.
