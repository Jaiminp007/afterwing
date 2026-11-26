# Verification log for the Microverse paper

Plan: [PAPER_VERIFICATION_PLAN.md](PAPER_VERIFICATION_PLAN.md), frozen at `83e5f24`
before any run below.

## V2. Reruns of existing finals

### P11b gate (seeds 80001–80048)

**Rerun with current code: does not match the log.** Raw data:
`evidence/microverse/p11b-rerun-currentcode-80001-80048.json`.

| Contrast | Log (`07b54e7`) | Current code |
|---|---|---|
| R\* − R_P12 | +5.73, 48/48 | +7.50, 48/48 |
| R\* − R0 | −0.54, 21/48 | −1.52, 12/48 |

The plan assumed the default world was unchanged since P11b. That was wrong for
this strain: later commits changed the default `SELF` strain (the G7c movement
reviser, `dd0ea19`), so `SELF` with R\* genes is not the same fly as at P11b. The
gate contrast still passes with current code, and by more. The tie with the
designer's R0 does not hold with current code: R0 is 1.52 flies better.

Rerun at the original commit `07b54e7`: pending.
