# BRAKE-LIFT Status

- 2026-10-26: V1 FROZEN (`docs/BRAKE_LIFT_PLAN_V1.md`, design only).
- 2026-10-26: IMPLEMENTED. Engine `taste-energy.mjs`: `assocBrake`/
  `assocC0`/`assocDecay` config (null-default off/2000/0), conditional
  `brakes:{}` + `work.brakeUpdates` (present only when enabled, matching
  surpriseEma/slowTaste precedent — null arms byte-identical), live-update
  brake block with symmetric billing (uniform +=3 on all arms, behavior
  changes only when enabled; verified bit-identical + exact-ops).
  Instrument `scripts/brake-lift-dev.mjs` (train + uniform + nolift/
  slow/fast + unlearned = 18 mains; transplant from train weights +
  per-cue brake init from train contacts; per-cue thirds + firstTick;
  scorer with G1/G0/G2b + manipulation gate (nolift<uniform 0.05) +
  lift gate (fast>uniform +0.1 on >=2/3) + LI-gradient descriptive).
  9/9 fixtures (`tests/brake-lift-dev.test.mjs`: opts identity,
  transplant, collector thirds+firstTick, liPartial unit, all scorer
  branches, bit-identity+exact-billing on synthetic seed 900003,
  bank tmp+refusal → post-bank form). Triage at 6 pre-existing
  baseline failures only (2 archived-evidence ENOENTs + 4 audit/value
  failures identical with/without the engine change — verified via
  stash A/B). Bank `evidence/brake-lift-dev/fresh-01/` built
  423001–423054 (54 unique). Single authorized attempt NEXT.
