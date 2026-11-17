# Microverse level 2: P11b and P13b (fixed 2026-11-17, before any tuning)

This line asks the questions of the failed tests [P11](RSI_P11_RESULTS.md) and [P13](RSI_P13_RESULTS.md) again, as **new, separately named tests** in the microverse. **The original P11 and P13 stay FAILED.**

The workflow is the one in [MICROVERSE_GOALS.md](MICROVERSE_GOALS.md):
- iterate on practice seeds;
- freeze the code;
- a goal closes only on fresh seeds;
- after 5 attempts without progress, step back;
- finals are never repeated to fish for a pass.

**Fable review was unavailable** for this line: the review thread returned "usage credits are required". The design follows the rules Fable set earlier:
- a level-2 gain must be found by the system's own search and tested on fresh worlds, as in P9;
- "selection tunes the reviser" is evolution of a setting, so it needs a free-evolution control;
- headroom checks come first.

**Level 1** is the reviser R, the fly's in-life self-revision of its taste program. Its knobs are:

| Gene | Meaning |
|---|---|
| `tasteZ` | Evidence threshold for adding a feature |
| `tasteEvery` | How often the fly considers a revision |
| `tasteCap` | Maximum number of features |
| `tasteMemory` | Evidence decay horizon |
| `tastePrune` | Pruning weight threshold |

R0 is the default (3, 8, 16, 200, 2).

**Measure:** paired solo runs (`microverse/solo.mjs`). Each strain lives alone in the same seeded world; the outcome is the mean population over ticks 10,000–20,000. The test is a one-sided sign-flip.

## Headroom checks (practice seeds only; they gate whether a goal is attempted)

- **H1 (for P11b).** Change one R knob at a time against R0, on practice seeds 101–116. The best single change must beat R0 by ≥ 1.5 flies. If none does, R0 is already near-optimal and P11b is **blocked (no headroom)**.
- **H2 (for P13b).** The best R must differ between rule families. A per-family oracle schedule (R switched to each family's best setting when the rule changes) must beat the best fixed R by ≥ 1.5 flies. If not, there is nothing for in-life tuning to track, and P13b is **blocked**.

## P11b: level 2 by the system's own search, scored in the embodied world

A fixed, hand-written hill climber over R (the level-2 operator) proposes R changes. It scores each one by paired solo fitness on practice seeds and accepts improvements. Its output is R*.

**Gate** (fresh seeds, 48): R* − R0 has mean ≥ 1.0 flies and p < .01.

**Label:** level 2 by external search with a hand-written climber. Unlike P9, there is no surrogate; scoring is in the embodied world.

## P13b: the lineage tunes its own reviser from its own experience

Each fly runs a fixed, hand-written meta-rule that adjusts its R genes from its own experience. Children inherit the adjusted R. Selection is present for every arm.

**Arms:**
- **META:** R0 plus the meta-rule.
- **EVO-R:** R genes mutate freely, with no meta-rule. This is the main control: plain evolution of R.
- **SHAM:** the meta-rule's step pattern, with directions randomized and matched in timing and size.
- **FIXED-R0:** no tuning at all.

**Gates** (fresh seeds, 48 each, paired solo):
- META − EVO-R ≥ 1.0 flies, p < .01;
- META − SHAM ≥ 1.0 flies, p < .01;
- META − FIXED-R0 > 0, p < .01.

**Label:** one level of in-lineage recursion with a hand-written meta-rule, plus selection.
