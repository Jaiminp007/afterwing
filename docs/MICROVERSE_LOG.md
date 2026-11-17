# Microverse attempt log

Workflow and thresholds: [MICROVERSE_GOALS.md](MICROVERSE_GOALS.md). Practice seeds: 101–108. Final-run seeds are listed here and never reused.

## Baseline (2026-11-17)

**Passed:** G6, which was spurious. **Failed:** G1–G5 and G7.

- **G1:** every world goes extinct between ticks 570 and 1015, with almost no births. Flies find food, but the total supply is too low, and toxic bites drain them before they reach the birth threshold.
- **G2–G5, G7:** the competition shares are all 0, because every world dies out.
- **G6:** this "passed" on skill read from worlds that were dying out. That is a test bug. Validity fix: G6 now also requires the world to be alive at 20,000 in ≥ 7/8 seeds. The fix was made before any tuning against G6.

## G1 loop
