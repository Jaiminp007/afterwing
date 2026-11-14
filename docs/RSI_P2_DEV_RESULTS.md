# RSI P2 dev check: FAILED. All four gates missed. Taste-program RSI line ends.

Plan: [RSI_P2_PLAN.md](RSI_P2_PLAN.md), frozen in `a8f3678` and `fc7cb87`
before the run. Runner: `scripts/rsi-p2-dev.mjs`. Evidence (gitignored):
`evidence/rsi-p2-dev/dev.{json,log}`. Run time: 5.4 h, with no errors.

## Gate

| Gate | Needed | Got | Result |
|---|---|---|---|
| 1. Oracle O − B | ≥ 1.5 | **0.65** | fail |
| 2. Libraries with A_L − B_L > 0 | ≥ 5 of 6 | **3 of 6** | fail |
| 3. Mean A_L − B_L | ≥ 1.0 | **0.39** | fail |
| 4. Libraries needed for power | ≤ 12 | **84** | fail |

The six differences A_L − B_L were −0.46, −0.68, +2.28, −0.22, +0.97 and
+0.45 (sd 1.11).

Mean energy per founder over the 6 dev rules:

| Arm | Energy |
|---|---|
| No-search identity | −46.18 |
| Uniform grammar (B, 36 rows) | −45.62 |
| Trained libraries (A, mean) | −45.23 |
| Oracle (O) | −44.97 |

## What the libraries learned

All 6 libraries ranked a `keepOnly/evid/k` move first (k = 3 or 4), from
independent training banks. So the learning step works: credit assignment
finds the move family that the P1 analysis says is the right one. That move
family did not turn into a test gain.

## Why it failed: headroom, not learning

- **The oracle hardly beats random order.** O − B is 0.65, well under the
  1.5 floor. Even the best fixed move set gains little over uniform order
  within budget 8. A captured about 60% of that small gap (0.39 of 0.65),
  so the learner was not the binding constraint. There was little to
  capture.
- **Search itself rarely changes anything.** About 0.5–1.0 moves were
  accepted per rule (A 0.64, B 0.50, O 1.00). With 8 evaluations and a
  confirm step costing 2, a search gets only 2–3 real chances.
- **Three-quarter-good gate rules have no headroom.** On AND(0,2)−,
  OR(1,3)+ and OR(0,3)+, every arm is within about 0.9 energy of identity.
  When most odors are good, the default code already eats correctly. The
  movement is on single-term rules (s9−, s6+), where O gains 2–4 over
  identity.
- **Survivors are flat:** A 13.5, B 13.4, identity 13.6.

## Decision

Under the pre-committed stopping rule, the taste-program RSI line ends. The
test (step 2) is not run. Nothing is re-tuned on these dev rules.

Lessons that carry forward to other targets:

1. Measure the oracle gap before building a learner. Here it was the
   binding constraint, and it could have been measured cheaply.
2. Count accepted moves per search. If a level-0 search accepts fewer than
   one move, no move-ordering prior can matter much.
3. The P1 energy effect (correct code vs identity, +3 to +4) is real but
   reachable only on some rules. Within budget 8, search reaches only a
   fraction of it.
