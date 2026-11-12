# RSI V6 results: 2 of 3 criteria passed; FAILED overall (C1 missed)

Plan: [RSI_V6_PLAN.md](RSI_V6_PLAN.md), committed in `d6550ed` before the
run. Evidence: `evidence/rsi-v6/run-v6.{json,log}` (local). Runtime 16344 s.
Test: fresh bank 987001–987008, threshold rules (a family not seen in
training), 48 paired rows per comparison.

| Criterion | Result | Verdict |
|---|---|---|
| C1: revised update rule beats the default | U* = U0 with α 1 → 2. U* vs U0: 14–7 (27 ties), p = 0.095, mean 0.484 vs 0.468 | **Fail** (p ≥ 0.05) |
| C2: invented moves help | U* vs the same rule without invention: 15–4, p = 0.0096, mean 0.484 vs 0.461. Top term move invented in 3 of 3 U* replicates | **Pass** |
| C3: transfer to an unseen world family | U* vs blind library L0: 14–1, p = 0.0005, mean 0.484 vs 0.460, above no-search (0.459) | **Pass** |

Reported, not gated:

- The default rule with invention (U0) also beats L0: 10–3, p = 0.046.
- No energy benefit in any comparison (all p ≥ 0.5). All 24 flies survive
  in every condition.

## Level 2 (update-rule search on validation)

| Proposal (from the incumbent) | Validation paired result | Accepted |
|---|---|---|
| ρ 0.25 → 0.1 | 6–17 | no |
| floor 0.2 → 0.05 | 8–13 | no |
| α 1 → 2 | 15–5 | **yes** |
| power 1 → 4 (with α 2) | 11–13 | no |
| credit gain → count | 2–7 | no |
| ρ → 0 (no invention) | 3–17 | no |

Turning invention off was the worst proposal, which is consistent with C2.

## Reading

- **New kinds of change that help (C2):** the system's own invented moves
  beat the same system without invention, on a world family it never
  trained on. The top moves differ between replicates (`keepOnly/random/3`,
  `keepOnly/lowOrder/3`, `remove/random/2`), and only some use evidence
  ranking. So the help comes from inventing moves that propose small codes,
  not from rediscovering V4's guided move.
- **Transfer (C3):** it passes, but the effect is small (+0.025
  discrimination) and there is no energy benefit.
- **Revised update rule (C1):** the level-2 change helped on validation
  (15–5) and pointed the same way on the test (14–7), but did not reach
  p < 0.05. Most rows tie (27 of 48), because a budget of 6 often ends with
  no accepted proposal.

**RSI not met.** The pre-registered rule needs all three criteria.
