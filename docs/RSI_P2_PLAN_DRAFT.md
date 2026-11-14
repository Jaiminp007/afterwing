# RSI P2 plan: DRAFT, not approved, nothing run

Date: 2026-11-14. This follows the independent review's step P2
([fable-review/FABLE_REVIEW.md](fable-review/FABLE_REVIEW.md)). It uses the
world that P1 qualified ([P1_SKILL_MATTERS_RESULTS.md](P1_SKILL_MATTERS_RESULTS.md)).
It needs the user's approval before any of steps 1–3 below.

## World and objective

- **World:** long default phases (512/512/512/256), 24 flies,
  `tasteDecisionMode: 'threshold'`, toxin 1, nutrient 1.
- **Objective (search and test):** energy per founder.
- Survivors and discrimination are reported, not used as objectives.
- **Rules:** balanced only (single Walsh terms; 2-bit AND/OR).

## Levels

| Level | What | Learned or hand-written |
|---|---|---|
| 0 | Taste program `{masks, step, replays}`, starting from identity | Learned by search |
| 1 | Weights over the full 90-move grammar plus 4 hyper moves, all present from the start | Weights learned; grammar hand-written, and the docs will say so |
| 2 | None | Dropped until level 1 shows a clear first-order effect |

There is no "invention" claim. Sampling from a grammar I wrote is
selection.

## Update rule (fixed before the test)

- Every tried move is credited with its dev gain, not only the accepted
  ones.
- Moves are chosen by Thompson sampling from a per-move normal posterior
  over mean gain.

## Steps

1. **Dev check (bank 994xxx, no test bank spent).**
   - Train 6 independent libraries, each with its own training seed and its
     own 8-rule training bank.
   - Pass if `keepOnly/evid/k` (any k) ranks first in at least 5 of 6.
   - Also measure the between-library spread of the A − B difference. Use
     it to check that 12 libraries give enough power at α = 0.01.
   - **If either check fails, stop.** No test is run.
2. **Freeze the final plan:** exact banks, N and criteria, committed before
   the test.
3. **Test** (if step 1 passes).
   - **Arms:**
     - (A) trained weights;
     - (B) the same grammar with uniform weights;
     - (C) generation 2, trained starting from A's weights on a second
       fresh training bank.
   - **Libraries:** 12 per arm, independent by construction. Each training
     seed has its own training bank, and the runner refuses to start if any
     library hash repeats.
   - **Test rules:** 12 unseen balanced rules, budget 12, 1 search seed.
   - **Final score:** energy per founder on 8 held-out long-world
     histories.
   - **Unit of analysis:** the library, as the mean over its 12 rules.
     Arms are compared with an exact one-sided sign-flip test on the 12
     paired library differences.
   - **Criteria** (each at α = 0.01; no reruns):
     - R1: A beats B;
     - R2: C beats A;
     - R3: A's mean energy beats the no-search identity code. Survivors
       A − B is reported.

     Review deviation: the review gated survivors. P1 showed the correct
     code adds about 0 survivors over identity, so a survivor gate would
     have almost no power. I propose reporting survivors, not gating them.

## Stopping rule for the whole taste-program RSI line

Any of these ends the line, with no V8:

- the dev check fails;
- R1 fails.

If R2 fails while R1 passes, that is reported as "learning helps but does
not compound", and the line stops there.

## Compute

Long worlds run about 3–8 s each per worker.

| Step | Approximate cost |
|---|---|
| Dev check: 6 libraries × 8 rules × budget 16 × 6 histories, long worlds | 3–4 h on 4 workers |
| Test (the review estimated about 9 h with short-world search) | about 20 h with long-world search; can be reduced to 8 test rules and budget 8 |

Checkpointing is required throughout.
