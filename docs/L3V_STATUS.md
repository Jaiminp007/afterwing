# L3-V status (working file for the autonomous loop)

Goal: bounded compounding (L3), then L4 (improver-of-improver compounding), under the ladder's rules. The 1.5× bar stays fixed. Each plan is registered before any measurement, SHAM and EVO-R controls are kept, each final runs once on a fresh bank, and every result is logged.

## State (2026-11-26)

- [x] Branch `l3-continue` created from origin/main `277a717`.
- [x] Astra/Sol advice received. Top pick **L3-V-A: learned edit-family prior** (45–60%). Backups: B, founder-pruning threshold (15–25%); C, inheritable proposal program (10–20%).
  - Exploratory headroom (seeds 701–716; standalone foraging assay `scratch/advice-astra/headroom.mjs`, not the microverse ecology): family-only oracle d = +7.99, 16/16, min +4.20; hindsight bound d ≤ +24.17. No META run yet.
  - Caveat: a fly needs only about one useful edit to identify its home family, so META may reduce to "last successful family first". Register that as an explicit comparator.
- [x] Gemini 4 Neon advice. Design 1, learned bit-affinity proposal grammar, 65–75%. Its exploratory runs on 601–616 with inherited alpha: 2.06×, d +4.78, 14/16.
- [x] Advice merged. Chosen design: Gemini's Design 1, which converges with Astra's A, plus Astra's REUSE challenge and a fair EVO-R grid. Gemini's original EVO-R scored below FIXED.
- [x] Implementation: `microverse/l3v.mjs`, `l3v-run.mjs`, `l3v-fixtures.mjs`. All 19 fixtures pass, and the module reproduces Gemini's prototype exactly on 601–602.
- [x] Bank 918001–918048 audited clean (`scripts/bank-audit.mjs`).
- [~] Registration drafted in FLY_RSI_GOALS.md (uncommitted). Astra/Sol adversarial review is running. Next: apply the required changes, commit, then stage A.
- [ ] Practice stages.
- [ ] Final (once, only if practice passes).
- [ ] Log the result.
- [ ] L4.

## Seeds used for exploration (not finals)

- 601–616 (Gemini advice)
- 701–716 (Astra advice)
