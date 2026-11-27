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
- [x] Registration committed at `675fc81`, with all six of the Astra/Sol review's required changes applied.
- [x] Stage A (919001–919016) locked FIXED = FIXED_DECK (56.38) and EVO-R = J50 (57.50); committed at `367b1fb`.
- [x] Stage B (48 practice seeds): **all gates pass**, committed at `bb376b5`.
  - Ratio 2.11×; d +5.26, 44/48, p 3.6e-12.
  - L2 margins: +8.8 over EVO-R, +10.0 over SHAM, +9.6 over FIXED, each 48/48.
  - META − META_RESET +7.0 (48/48); META − REUSE +5.6 (47/48).
  - The first batch was killed by the 30-minute tool limit before it wrote any output. It was restarted unchanged.
- [x] **Final 918001–918048, run once: ALL GATES PASS. Ratio 2.01×, d +4.28 (46/48, p 3.7e-12). L3 SHOWN in the L3-V world.**
- [x] Logged in FLY_RSI_LOG.md.
- [ ] **NEXT: L4**, compounding of the improver-of-the-improver: design with the Devin advisors, register, run the same way. Handoff to DESKTOP-ESS5J5U.

## Seeds used for exploration (not finals)

- 601–616 (Gemini advice)
- 701–716 (Astra advice)
- 801–808 (Astra review checks)
- 901 (fixtures)
- Spent or reserved for L3-V: 919001–919016 (stage A), 918001–918048 (final, spent)

## L4 handoff notes (for the next loop, on DESKTOP-ESS5J5U)

- **Goal.** L4 = compounding of the improver of the improver. A level-3 controller improves L2 (the alpha learner) from the fly's own experience, e.g. it adapts alphaBoost, alphaDecay or valThresh to how often L2's predictions pay off. Gate, by analogy: L2's gain with L3 must be ≥ 1.5× L2's gain without it, i.e. (META3 − FIXED) ≥ 1.5 (META − FIXED), plus SHAM, EVO-R and factorial controls at p < .01, then one fresh final.
- **Base world.** Start from the L3-V world, `microverse/l3v.mjs`. Make L2 the bottleneck by adding a regime where the best L2 settings change (e.g. the S redraw period alternates between fast and slow), so that a fixed L2 is sub-optimal.
- **Process.** Get advice from both Devin advisors (delegate_task provider `acpRegistry_devin`, models `gemini-4-neon-high` and `fusion-gpt-6-2-astra-high-sidekick-gpt-5-6-sol-high`). Run exploration on new seeds only; then registration, adversarial review, fixtures, a stage A lock, stage B on 48 practice seeds, and one final.
- **Seeds and banks.** Use new 6-digit banks, audited with `scripts/bank-audit.mjs`. Do not reuse anything listed above. Practice seeds 101–116 and 301–332 are fine to reuse in a new world, but disclose that.
- **Running long jobs.** Run them detached (nohup) with a waiter. Tool calls time out at 30 minutes, and server restarts kill attached jobs.
- **GitHub.** Push as `jaiminp007` to the branch `l3-continue` (not `main`).
