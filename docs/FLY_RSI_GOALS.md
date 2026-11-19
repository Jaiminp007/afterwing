# Bounded fly-RSI (frozen 2026-11-18, before any L2 or L3 tuning)

**Bounded RSI for our flies, not general RSI.** Each level must be:
- done by the flies themselves, inside the world;
- driven by their own experience;
- shown on fresh seeds.

It is bounded because the menus, the meta-rules and the world are hand-written, and there are only two levels.

| Level | Claim | Evidence |
|---|---|---|
| L0 | Flies learn during life, and it helps | G4 (closed) |
| L1 | Flies improve their own learning program | G5 and G7c (closed) |
| **L2** | Flies improve **their own improver**: they retune the genes that control L1 revision (taste and movement cap, prune, z) from their own experience, beating evolution, a matched sham and no tuning | this document |
| **L3** | **Bounded compounding:** improving the improver makes L1 self-improvement pay at least 50% more | this document |

## World (opt-in `brainSwitch` {mul: [1, 12], switch: .001})

The energy cost of each brain feature switches during a fly's life between ×1 and ×12 of the base cost, with a mean dwell of 1000 ticks. The state is not inherited, and genes cannot know it. The fly feels it as its own brain's energy drain.

## Headroom H-L2 (practice seeds 101–116, Δ flies vs SELF)

Arms:
- **Lean package:** taste cap 9, prune 8, z 100; move cap 6, prune 8, z 100.
- **Full package:** the defaults.

| Arm | Δ flies |
|---|---|
| Always lean, mul [1, 12], switch .004 | −6.84 |
| Oracle (lean only in the costly state), [1, 12], .004 | +3.69 (16/16) |
| Same oracle fed a fake state, [1, 12], .004 | +1.78 |
| Oracle, [1, 20], .002 | +2.98 (fake state +.44) |
| **Oracle, [1, 12], .001** | **+3.05 (15/16); fake state −.83** (the chosen world) |

## Arms (`MV_SET=L2`; base SELF with the G7c movement reviser)

- **META** (`metaB: 'brainTrack'`): each tick the fly switches its reviser genes to the lean package when its felt brain cost is high, and to the full package otherwise. It is hand-written; its form may be tuned on practice.
- **SHAM:** the same rule fed an independent fake state with the same switching dynamics.
- **EVO-R:** at birth, with probability .1, the inherited package flips between lean and full. There is no in-life rule.
- **FIXED:** the full package always.
- **NOREV** (L3 reference): no L1 self-revision at all.

## Protocol

- Practice on the 48 seeds 101–116 and 301–332, with at most 5 attempts.
- A final is run only if practice clears every margin.
- The final runs once, on fresh seeds 95001–95048.

## Gates (one-sided sign-flip, p < .01)

**L2:**
- META − EVO-R ≥ 1.0;
- META − SHAM ≥ 1.0;
- META − FIXED > 0.

**L3:** per seed, d = (META − NOREV) − 1.5 × (FIXED − NOREV); require mean d > 0. In words, the L1 self-improvement gain with L2 must be at least 1.5× the L1 gain without L2.

## Labels

- The tuned genes are the L1 reviser's own settings (cap, pruning and evidence threshold for taste and movement). This is level 2 in the sense of this ladder.
- The meta-rule is hand-written, and the two packages come from the headroom oracle.
- The world was built so that the best reviser setting changes during life.
- The felt signal is noise-free.
- Not open-ended.

## L3b (frozen 2026-11-18, after L3 failed practice and before any L3b tuning)

L3 **stays NOT SHOWN** (best practice ratio 1.44 < 1.5, no final). L3b is a new, separately named test of the same claim.

**Allowed changes (practice only, at most 5 attempts):**
- the costly-state multiplier `brainSwitch.mul[1]`, chosen from {20, 30, 50}, with switch .001;
- the META rule's form.

The arms' definitions (META, SHAM, EVO-R, FIXED, NOREV) and both packages are as in L2.

**Selection.** The final runs only if a practice attempt clears the L3 gate and every L2 margin. It goes to the best L3 attempt.

**Final.** Fresh seeds 96001–96048, run once, all five arms.

**Gates** (one-sided sign-flip, p < .01):
- **L3b:** mean of d = (META − NOREV) − 1.5 × (FIXED − NOREV) > 0.
- **The L2 gates in the same world:** META − EVO-R ≥ 1.0, META − SHAM ≥ 1.0, META − FIXED > 0. All must pass, so compounding counts only where level 2 itself holds.

**Label.** The world's cost multiplier was chosen on practice to make level-1 self-revision costly without level 2. That choice is part of the constructed world.

## L3c (frozen 2026-11-18, after L3b failed practice with steady progress)

L3b **stays FAILED** (best practice ratio 1.444). Under the agreed workflow, a step back is required after 5 attempts *without progress*; L3b's attempts were still progressing, so the line continues as a new, separately named test.

- **World:** fixed at `brainSwitch` mul [1, 20], switch .001.
- **Allowed changes:** only the META rule's form (in-life reviser control), with at most 5 practice attempts. SHAM always runs the identical rule on a fake state. EVO-R gets the same gene packages. FIXED and NOREV are as in L2.
- **First new mechanism (attempt 1):** dormant features. When its brain becomes costly, the fly parks its added taste and movement features, with their weights, in cost-free storage. When the cost falls, it restores them.
- **Final:** fresh seeds 97001–97048, run once, all five arms. It runs only if practice clears every gate.
- **Gates:** as for L3b (the L3 ratio test plus the L2 gates, all at p < .01).
