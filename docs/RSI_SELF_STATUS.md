# RSI-SELF status (in-agent proposal loop)

First true-RSI substrate line: the loop lives inside the run on the agent's
own state. Phase A = mechanism demo (no improvement claimable).

- 2026-10-30: `docs/RSI_SELF_PLAN_V1.md` FROZEN. Verified read-only: step()
  API, record store, BT base, seed range 396001–396036 clean (evidence hits
  cleared as float substrings).
- 2026-10-30: `docs/RSI_SELF_PLAN_V1A.md` FROZEN — checkpoint correction
  {448,896,1344} → {512,1024,1536} (true A→B/B→C/C→return-A boundaries;
  phases are 512/512/512/256, caught pre-code). V1 preserved.
- 2026-10-30: Phase-B EXECUTED → **NOGO [selection harmful]**. G1/G2/G4/G5 pass (17 persistent adopts, rate+gain, margin correctly avoided); G3 fails (gap −0.46): evaluated selection underperforms fixed AND random. Diagnosis: eval-window overfitting (fit-32/test-8 anti-predictive live). V1c must fix evaluation first. Standing rule set: bank fixtures convert to rebuild-guards post-spend. Full record: RSI_SELF_RESULTS_V1B.md.
- 2026-10-30: Phase-B FROZEN as `docs/RSI_SELF_PLAN_V1B.md` (adjudication: level gaps +5 prove learning matters but reset saturates the base rule → rate-dials exhausted; V1b = 3-item algorithmic menu + random-selection control, 6 checkpoints for testable persistence, 3 arms x 4 = 12 mains on fresh bank 397001-397036 verified clean; G1-G5 gate + G6 selection label + G7 fixtures). Next: implement, then single attempt.
- 2026-10-30: Phase-A EXECUTED → **GO**. G1 exact (8/0/14336/344064/1.35e9); G2 100% rule-match; G3 gap +0.054 (descriptive, unclaimed); G4 8 adopt-CPs + 12 keep-CPs, 0 skips. Texture: tick-512 keeps unanimous (conservative default), adopts at 1024/1536. No crash, no resume. Licensed follow-up PROPOSED (not started): V1b with accepts + copied-improvement control (fresh plan + fresh goal). Full record: RSI_SELF_RESULTS_V1.md.
