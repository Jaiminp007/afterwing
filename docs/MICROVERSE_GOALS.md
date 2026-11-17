# Microverse goal ladder

The goals and thresholds were fixed on 2026-11-17, before any fixing began. They do not move.

The microverse is a small, closed, resource-limited world (`microverse/sim.mjs`). Flies in it live, learn, breed and die continuously. Each brain is a heritable program: taste feature masks, movement feature masks, innate movement instinct, and learning genes. Learned weights are never inherited.

## Workflow

1. **Practice suite.** Run the universal test (`node microverse/suite.mjs dev`) on practice seeds 101–108.
2. **Fix order.** Take the lowest failing goal on the ladder. Fix it with a real design change to the world or the brain. A fix may not hand the flies the answer, for example by building the true rule into a default strain.
3. **Re-run the whole suite after each fix,** so that a fix to one goal cannot silently break another.
4. **Escape hatch.** If 5 attempts in a row make no progress on a goal, stop tweaking. Either redesign the part behind it, or mark the goal **blocked** with the reason.
5. **Final suite.** When every goal passes on practice, run `node microverse/suite.mjs final <base>` on 8 fresh seeds that have never been used. A goal is **closed** only if it passes there. If anything fails, go back to the loop, and use new seeds for the next final run.

The attempt log is in [MICROVERSE_LOG.md](MICROVERSE_LOG.md). Every final run's seeds are recorded there and never reused.

## Common settings

- **Length.** Each world runs 20,000 ticks.
- **Rule schedule.** The hidden food rule cycles every 3000 ticks: pairs → staircase → triples → single.
- **Competition worlds.** Two strains start 30 founders each. A strain's **share** is its fraction of the population, averaged over ticks 15,000–20,000. A seed counts as a win for strain A if its share is > 0.5. A seed where the population goes extinct counts as a loss.

## Goals

| # | Goal | Test (8 seeds) | Pass |
|---|---|---|---|
| G1 | The world is livable | FIXED strain alone | Alive at 20,000 in ≥ 7/8 seeds. In each surviving seed, the mean population over 10,000–20,000 is between 30 and 360 (capacity 400), and there are ≥ 200 births. |
| G2 | Taste matters | ORACLE (born with the current rule's true terms) vs FIXED | ORACLE mean share ≥ 0.65, and ORACLE wins ≥ 7/8 seeds |
| G3 | Movement matters | FIXED vs RANDMOVE (random moves) | FIXED mean share ≥ 0.65, and FIXED wins ≥ 7/8 seeds |
| G4 | Learning in life helps | FIXED vs FROZEN (same innate brain, no learning) | FIXED mean share ≥ 0.60, and FIXED wins ≥ 7/8 seeds |
| G5 | Self-improvement helps | SELF vs FIXED, and SELF vs SHAM (random revision) | Both pairings: SELF mean share ≥ 0.60, and SELF wins ≥ 7/8 seeds |
| G6 | They adapt | SELF alone | For each rule epoch, mean skill in the last quarter minus the first tenth ≥ 0.2 on average, with late skill ≥ 0.5 on average, and the world alive at 20,000 in ≥ 7/8 seeds (validity condition added after the baseline; see the log) |
| G7 | Both systems improve | SELF vs TASTE-ONLY, and SELF vs MOVE-ONLY | Both pairings: SELF mean share ≥ 0.55, and SELF wins ≥ 6/8 seeds |

**Skill** is P(eat | good) − P(eat | bad) over the 16 current odor kinds.

**ORACLE** is a measuring instrument, not a candidate. At birth it gets the true terms of the rule in force.

## Labels

- The microverse is a new, constructed world.
- Every revision operator and gene grammar is hand-written.
- A pass means these flies, in this world, do these things. It does not mean open-ended intelligence.
