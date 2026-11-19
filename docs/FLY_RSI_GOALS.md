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
