# RSI-SELF status (in-agent proposal loop)

First true-RSI substrate line: the loop lives inside the run on the agent's
own state. Phase A = mechanism demo (no improvement claimable).

- 2026-10-30: `docs/RSI_SELF_PLAN_V1.md` FROZEN. Verified read-only: step()
  API, record store, BT base, seed range 396001–396036 clean (evidence hits
  cleared as float substrings).
- 2026-10-30: `docs/RSI_SELF_PLAN_V1A.md` FROZEN — checkpoint correction
  {448,896,1344} → {512,1024,1536} (true A→B/B→C/C→return-A boundaries;
  phases are 512/512/512/256, caught pre-code). V1 preserved.
- Next: implement instrument (engine selfMod flag + `scripts/rsi-self-dev.mjs`
  + 6 fixtures), triage, bank build, single 8-main attempt.
