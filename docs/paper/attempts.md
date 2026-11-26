# Forking-Paths Ledger: Every Microverse Goal, Attempt, Amendment, and Spent Seed Bank

This document records every design loop, amendment, headroom screen, diagnostic check, and fresh-seed final run in the Microverse research line (commits `d459944` through `16b4372`, 2026-11-17 to 2026-11-19). Failed attempts, blocked headroom checks, and superseded code versions remain listed here alongside passes.

## Summary Counts by Goal

| Goal / Rung | Practice Attempts / Screens | Amendments / Re-Tests | Fresh-Seed Finals Run | Fresh Seeds Spent | Reserved Untouched Final Banks | Final Verdict |
|---|---:|---:|---:|---:|---|---|
| G1 (Livability) | 9 practice attempts + baseline + 1 post-G7c practice re-check | 0 (world changed for G7 FR2) | 2 (FR1, FR2) | 16 (shared FR1+FR2) | — | **CLOSED** (FR1 & FR2) |
| G2 (Taste matters) | 2 shared practice attempts (with G4) + validity checks | 0 | 2 (FR1, FR2) | shared FR1+FR2 | — | **CLOSED** (FR1 & FR2) |
| G3 (Movement matters) | 0 dedicated (passed after G1 att 9) + caveat check | 0 | 2 (FR1, FR2) | shared FR1+FR2 | — | **CLOSED** (mostly innate instinct) |
| G4 (Lifetime learning, L0) | 2 shared practice attempts (with G2) + decomposition | 0 | 2 (FR1, FR2) | shared FR1+FR2 | — | **CLOSED** (FR1 & FR2) |
| G5 (Self-revision helps, L1) | 0 dedicated (passed after G1 att 9) + EVO/swap checks | 0 | 2 (FR1, FR2) | shared FR1+FR2 | — | **CLOSED** (FR1 & FR2) |
| G6 (Adaptation / rediscovery, L1) | 1 practice attempt + validity rule fix before tuning | 1 (validity condition added) | 2 (FR1, FR2) | shared FR1+FR2 | — | **CLOSED** (FR1 & FR2) |
| G7 / G7b / G7c (Both systems improve, L1) | 9 named attempts (6 G7 + 1 dropped G7 att 7 + 2 G7c) + 2 headroom checks + 1 diagnostic + 1 dropped bigger-world check | 2 separately named re-tests (`G7b`, `G7c`) | 4 (G7 FR1, G7 FR2, G7b, G7c) | 144 dedicated (`70001–70048`, `94001–94096`) + shared FR1+FR2 | — | G7 **FAILED** (×2), G7b **FAILED**, **G7c PASSED** |
| P11b (External L2 search over L1 reviser) | 1 failed headroom (H1) + 1 headroom (H1′) + 24 climber proposals (3 accepted) | 1 (`A1`: start from `R_P12`) | 1 | 48 (`80001–80048`) | — | **PASSED** (original P11 stays FAILED) |
| P13b (Related line: in-life / in-lineage tuning) | 10 designs/headroom screens (H2–H10, A1–A3), 16 meta-rule attempts (4 A1 + 4 A2 + 3 P13b-2b + 4 P13b-3 + 1 A3) | 3 amendments (`A1`, `A2`, `A3`) + 3 sub-splits (`P13b-1..4`, `P13b-2b`, `P13b-3a/3b`) | 4 (`90001–90048`, `91001–91048`, `92001–92048`, `93001–93048`) | 192 | — | **A1 NOT SHOWN** (P13b-1 & 2b passed; 2, 3, 3a, 3b, 4 failed); **A3 PASSED** (10th design; tunes `acceptAt`, not reviser) |
| Fly-RSI L2 (In-life reviser tuning) | 5 pre-L2 headroom worlds + 1 practice attempt (att 1 selected; 4 more run for L3) | 0 | 1 | 48 (`95001–95048`) | — | **PASSED** |
| Fly-RSI L3 (Compounding ≥ 1.5×) | 8 registered designs/screens (`L3`, `L3b`, `L3c`, `L3-I scr1`, `L3-I scr2`, `L3-II`, `L3-III`, `L3-IV-H0`); 20 practice/stage batches + 2 diagnostics | 7 successor registrations after L3 | **0** | **0** (4 exploratory non-bank seeds `501–504` marked spent for post-hoc diagnosis) | `96001–96048` (L3b), `97001–97048` (L3c), `763001–763048` (L3-I), `852001–852048` (L3-II), `874001–874048` (L3-III) | **NOT SHOWN** (0 finals) |
| **Total Fresh Final Seeds Spent** | — | — | **12 final runs** | **448 unique fresh seeds** | **240 reserved untouched seeds** | — |

Note on fresh-seed count: `50001–50008` (8) + `60001–60008` (8) + `70001–70048` (48) + `80001–80048` (48) + `90001–90048` (48) + `91001–91048` (48) + `92001–92048` (48) + `93001–93048` (48) + `94001–94096` (96) + `95001–95048` (48) = **448 unique fresh seeds** across 10 disjoint fresh banks (G1–G7 FR1 shared `50001–50008`; G1–G7 FR2 shared `60001–60008`). Practice work reused seeds `101–108`, `101–116`, and `301–332`, plus 4 exploratory post-hoc seeds `501–504` (`docs/SPENT_BANKS_RSI.md:59`).

---

## Detailed Chronological Table

### 1. Microverse Core Ladder (G1–G7, G7b, G7c)

Primary sources: `docs/MICROVERSE_GOALS.md`, `docs/MICROVERSE_LOG.md`.

| Goal | Attempt / Amendment / Run | Commit(s) | Change / Specification | Outcome | Seeds Spent |
|---|---|---|---|---|---|
| G1–G7 | Baseline | `d459944` | Initial sim, strains, universal suite (`MICROVERSE_GOALS.md` fixed before tuning) | G1–G5, G7 failed (all worlds extinct ticks 570–1015); G6 spurious pass on dying worlds | Practice `101–108` |
| G6 | Validity amendment | `d459944` | Added livability clause to G6 before any tuning: world alive at tick 20,000 in ≥ 7/8 seeds | Rule updated | — |
| G1 | Attempt 1 | `9c34740` | More food (8 patches, regrow 0.08) | 0/8 ok (extinct ticks 600–1900) | Practice `101–108` |
| G1 | Attempt 2 | `9c34740` | Milder toxin (1.5 → 0.6) | 0/8 ok | Practice `101–108` |
| G1 | Attempt 3 | `9c34740` | Movement learning: advantage + eligibility trace replacing TD | 0/8 ok (1 seed reached tick 12,578) | Practice `101–108` |
| G1 | Attempt 4 | `9c34740` | Cheaper reproduction (breed at 60, cost 30) | 0/8 ok | Practice `101–108` |
| G1 | Attempt 5 | `9c34740` | Lower metabolism (0.06, move 0.02) | 2/8 ok (deaths cluster after rule switches) | Practice `101–108` |
| G1 | Attempt 6 | `9c34740` | Bigger world (40×40, 12 patches) | 2/8 ok | Practice `101–108` |
| G1 | Attempt 7 | `9c34740` | Taste-exploration gene (5% taste when predicted bad) | 3/8 ok | Practice `101–108` |
| G1 | Attempt 8 | `9c34740` | Expected-value accept threshold gene (0.4) | 2/8 ok (base-rate swings 4–12 of 16 cause famines) | Practice `101–108` |
| G1 | Attempt 9 | `9c34740` | Balanced chemistry (exact 8 good / 8 bad odor kinds per draw) | **Practice PASS (7/8)**; suite passes G1, G3 (7/8, .88), G5 (8/8, 8/8), G6 (.20/.53); fails G2 (5/8, .63), G4 (0/8), G7 (1/8 vs TASTEONLY) | Practice `101–108` |
| G2 / G4 | Decomposition check | `d3c2e6a` | Taste-learning-only vs FROZEN (0/8); move-learning-only vs FROZEN (4/8) | Isolated taste learning chasing noise | Practice `101–108` |
| G2 / G4 | Attempt 1 | `d3c2e6a` | Confidence gate: trust taste model only while running log-loss < base-rate loss | FIXED vs FROZEN rises 0/8 → 5/8 | Practice `101–108` |
| G2 / G4 | Attempt 2 | `d3c2e6a` | Expected-value smell & food movement features `p − (1−p)·toxin` (counting only accepted food) | **Practice PASS G1–G5 (all 8/8)**; G6 fails (.181/.566), G7 fails (5/8 vs TASTEONLY); null control FIXED vs FIXED = 9/24 (.38, 0 extinct) | Practice `101–108` (plus 24 null pairings) |
| G6 | Attempt 1 | `73ffefe` | Evidence forgetting (`tasteMemory = 200`, decay `1−1/200`) + prune weakest added taste mask with `\|w\| < 2` (matched in SHAM) | **Practice PASS G1–G6** (G6 gain .368, late .757); G7 fails (3/8, .47) | Practice `101–108` |
| G7 | Headroom check 1 | `73ffefe` | Planner measuring instrument vs TASTEONLY | 5/8 wins (share .72) — modest room | Practice `101–108` |
| G7 | Attempt 1 | `73ffefe` | Movement-revision evidence uses decaying trace | 3/8 (.45) — no progress | Practice `101–108` |
| G7 | Attempt 2 | `73ffefe` | Bug fix: disallow duplicate (`bias × x`) and move-invariant movement candidates | 5/8 (.54) | Practice `101–108` |
| G7 | Attempt 3 | `73ffefe` | Prune weakest added movement feature (`\|w\| < 0.5`) when full | **Practice PASS G1–G7** (G7 6/8, .66) | Practice `101–108` |
| **G1–G7** | **Final Run 1** | `73ffefe` (logged `83c94eb`) | Full universal suite frozen before run | **G1–G6 CLOSED** (G2–G5 all 8/8; G6 gain .394, late .775); **G7 FAILED** (SELF vs TASTEONLY 3/8, .33; vs MOVEONLY 8/8) | **Fresh `50001–50008`** (8 seeds, spent) |
| G7 | Attempt 4 (world) | `da995b0` | Faster food relocation (every 50 ticks, 8 patches); planner headroom rises to 8/8 | SELF vs TASTEONLY 2/8 (movement learning helps 6/8 vs instinct-only, revision does not) | Practice `101–108` |
| G7 | Attempt 5 (brain) | `da995b0` | Movement sense menu (optional bits 6–9: near smell r2, far smell r6, toward best food, stay) | 3/8 | Practice `101–108` |
| G7 | Diagnostic | `da995b0` | Set `brainCost = 0` | 6/8 (revealed feature cost 0.002 ate the gain) | Practice `101–108` |
| G7 | Attempt 6 (world) | `da995b0` | Lower `brainCost` to 0.0005 (still nonzero) | **Practice PASS G1–G7** (G7 7/8, .89) | Practice `101–108` |
| **G1–G7** | **Final Run 2** | `da995b0` (logged `83c94eb`) | Full universal suite re-run because world changed | **G1–G6 CLOSED** (all 8/8; G6 gain .362, late .711); **G7 FAILED** (SELF vs TASTEONLY 5/8, .625) | **Fresh `60001–60008`** (8 seeds, spent) |
| G7 | Attempt 7 (dropped) | `83c94eb` | Movement evidence forgetting | 6/8 on `101–108`, 10/16 on `301–316` — dropped, not adopted | Practice `101–108`, `301–316` |
| G7 | World check (dropped) | `83c94eb` | Bigger world (56×56, 16 patches) | 7/16 — confounded (relocation rate halved per patch), dropped | Practice `101–116` (16 seeds) |
| G1–G6 | Validity checks | `83c94eb` | Fable review audit at `da995b0`: order swaps (0/8), SELF vs EVO (8/8), G3 instinct caveat (8/8), FROZEN eating check, G6 rediscovery check, arm parity, label-leak audit | Confirmed G1–G6 validity; Fable verdict on G7 = "not shown" (pooled 18/32 vs null 18/40) | Practice `101–108` |
| **G7b** | **Separately named re-test (frozen)** | `83c94eb` → `beee842` | Paired solo late population (`solo.mjs`) on unchanged code `da995b0`; practice estimate (`101–116`): +1.41 (13/16, p = .033); one-shot bar: ≥ 0.7 flies & p < .01 | **FAILED** on SELF − TASTEONLY: +0.88 (30/48, printed p = .0119; exact p = .0130 after rerun); SELF − MOVEONLY +7.81 (48/48, p < .00001). G7b stays failed. | Practice `101–116`; **Fresh `70001–70048`** (48 seeds, spent) |
| G7c | Re-test frozen + headroom | `9563c68` → `dd0ea19` | Allow redesign of movement reviser (≤ 5 practice attempts on 48 seeds); 96 fresh seeds. Baseline +.86 (31/48, p=.033). Headroom (`101–116`): planner +5.24 (16/16); giving toward+stay at w=1 adds +2.92 (13/16) | Headroom confirmed; diagnosed slow weight ramp from 0 | Practice `101–116`, `301–332` |
| G7c | Attempt 1 | `dd0ea19` | Evidence-signed start weight `moveAddInit = 1` for added movement senses (random sign in SHAM) | +2.39 vs TASTEONLY (36/48, p < .00001) | Practice `101–116`, `301–332` |
| G7c | Attempt 2 (adopted) | `dd0ea19` | `moveAddInit = 2` (applied to SELF, SHAM, MOVEONLY; fingerprint changes to `bdaca307…`) | **+2.47 vs TASTEONLY** (42/48, p < .00001); +9.46 vs MOVEONLY (48/48); universal suite practice `101–108` (`suite-dev-1795046397911.json`) passes G1–G7 (all 8/8, G6 gain .422) | Practice `101–116`, `301–332` |
| **G7c** | **Final Run** | `95a3f21` | Paired solo on 96 fresh seeds (bar ≥ 0.7 & p < .01 both contrasts) | **PASSED**: SELF − TASTEONLY +2.14 (66/96, p < .00001), SELF − MOVEONLY +9.40 (96/96, p < .00001). Pooled G7b+G7c = +1.72 (mixes code versions). | **Fresh `94001–94096`** (96 seeds, spent) |

---

### 2. Microverse Level-2 External Search (P11b) and Related In-Lineage Tuning Line (P13b)

Primary sources: `docs/MICROVERSE_L2_GOALS.md`, `docs/MICROVERSE_L2_LOG.md`. Note: Original P11 and P13 from the earlier compact-fly line stay **FAILED**.

| Goal | Attempt / Amendment / Run | Commit(s) | Change / Specification | Outcome | Seeds Spent |
|---|---|---|---|---|---|
| P11b | Initial headroom H1 (from `R0`) | `d60c3ea` → `e36cdca` | Single-knob grid perturbations around hand-tuned `R0` (bar ≥ 1.5 flies) | **BLOCKED (H1 failed)**: best change `z = 1.5` gave +1.05 < 1.5; `R0` already hand-tuned in G6 | Practice `101–116` |
| P11b | Amendment A1 + headroom H1′ | `e36cdca` | Reset start point to pre-tuning `R_P12` (`tasteMemory = 1e12`, `tastePrune = 0`); H1′ check `R0 − R_P12` | H1′ passed: +6.4 flies (16/16, p = .00002) | Practice `101–116` |
| P11b | Climber search | `9688222` → `ec3047c` | Hand-written 1-step climber (`l2search.mjs`, seed 4242, 24 proposals, accept ≥ +0.5) | Accepted 3 steps (`tastePrune 0→.5` +2.15; `tasteEvery 8→4` +.85; `tasteMemory 1e12→800` +3.13); 21 rejected → `R*` (train 55.91 vs `R0` 56.17) | Practice `101–116` |
| **P11b** | **Final Run** | `07b54e7` | Gate `R* − R_P12 ≥ 1.0`, p < .01; reported `R* − R0` | **PASSED**: `R* − R_P12` = +5.73 (48/48, p < .00001); `R* − R0` = −0.54 (21/48, p = .89, n.s.) | **Fresh `80001–80048`** (48 seeds, spent) |
| P13b | Design 1: H2 (from `R0`) | `d60c3ea` → `e36cdca` | Per-family oracle schedule over `R` in normal world (bar ≥ 1.5) | **BLOCKED (H2 failed)**: oracle < 1 fly over best fixed | Practice `101–116` |
| P13b | Design 1 (A1): 4 practice attempts + H3 | `e36cdca` → `4fefc6b` | Start at `R_P12`: Att 1 direction rules (vs EVO-R +.13, SHAM −.51); Att 2 drop lengthen (−.56, +.44); Att 3 trial-and-revert running loss (+1.49, +.26, +6.36 vs FIXED); Att 4 window means (+.85, −.38); H3 switch-timed oracle (+.03/−.65/−.57) | **BLOCKED**: no rule beats SHAM by ≥ 1.0; H3 shows no headroom in normal world | Practice `101–116` |
| P13b | Design 2: H3 fast switching | `4fefc6b` | Rule switches every 600 ticks; oracle (50/800) vs fixed memory 200 | **BLOCKED**: oracle +2.47 vs fixed +1.81 → oracle − best fixed ≈ +0.66 < 1.0 | Practice `101–116` |
| P13b | Designs 3–4: H4 volatility world | `051b771` | Calm 4,000t / burst 2,000t (every 150t); Variant A (noise .05), Variant B (noise .15) | **BLOCKED**: Var A oracle − best fixed ≈ +1.1 (< 1.5 headroom bar); Var B ≈ 0 | Practice `101–116` |
| P13b | Design 5: H5 long lives | `02b3026` | Volatility Variant A with `maxAge = 6000` | **BLOCKED**: oracle +1.79 vs fixed +1.40 → gap ≈ +0.39 < 1.5 | Practice `101–116` |
| P13b | Design 6: H6 individual sensor noise | `f90d8b5` | Non-heritable per-fly `noiseNiche` [.02, .3]; learning-rate oracle | **BLOCKED**: best per-fly oracle − best fixed step = −0.33 | Practice `101–116` |
| P13b | Design 7: H7 habitats | `957d446` | Left half calm, right half volatile (every 150t); habitat oracle | **BLOCKED**: best habitat oracle − `R*` = −0.47 | Practice `101–116` |
| P13b | Design 8: Amendment A2 (`acceptAt`, H8 + 4 attempts + diag) | `6f6b2a9` → `b300032` | Non-heritable `toxinNiche` [.2, 3]; extended R = `acceptAt` (decision threshold, not reviser). H8 oracle +8.36 (16/16). 4 practice attempts (trial, EV, 2× risk-averse EV, prior+EV) + 32-seed diag | **BLOCKED**: best vs SHAM +.37 (att 2); diag (`301–332`) showed ORACLE +2.21 vs SHAM is pre-evidence protection only; post-evidence META +.02 vs SHAM | Practice `101–116`, `301–332` |
| P13b | Design 9: H9 dual food | `26efe96` | `dualFood`: fruit stable vs leaf switching every 150t; diet oracle | **BLOCKED**: best diet oracle − best fixed (∞) = −0.35 | Practice `101–116` |
| **P13b-1..4** | **Split parts Final (A1 att 3)** | `e7d9619` → `6521edb` | Single final scoring P13b-1 (vs FIXED), -2 (vs EVO-R), -3 (vs SHAM), -4 (full P13b) | **P13b-1 PASSED** (+5.96, 46/48, p < .00001); **P13b-2 FAILED** (+.53, 29/48, p = .131); **P13b-3 FAILED** (−.02, 26/48, p = .516); **P13b-4 FAILED** | **Fresh `90001–90048`** (48 seeds, spent) |
| **P13b-2b** | **Re-test trials vs mutation** | `fbe4087` → `228d500` | 3 practice attempts on 48 seeds (`metaK` ∈ {3, 12, 2}; `metaK=3` selected at +1.73 vs ref `metaK=6` +1.90) → fresh final | **PASSED**: META′ − EVO-R = +1.24 (34/48, exact p = .0024); reported vs SHAM +.25 (p = .28, n.s.), vs FIXED +5.80 (47/48) | Practice `101–116`, `301–332`; **Fresh `91001–91048`** (48 seeds, spent) |
| P13b-3 | Headroom check (perfect keep) | `9888c49` | `trialoracle` (keeps iff step moves toward `R*`) vs coin-flip SHAM (`metaK=3`, 48 seeds) | **BLOCKED**: ORACLE − SHAM = −0.42 (21/48, p = .83) | Practice `101–116`, `301–332` |
| **P13b-3a/3b** | **Shadow-trial split Final** | `e455fc1` → `7de7117` → `e75f8d2` | 4 shadow-trial practice attempts (`metaK` ∈ {6 [sham bug], 24, 48, 16}; `metaK=16` selected at 3a .5076 p=.0048, 3b +.37 p=.026) → fresh final | **P13b-3a FAILED** (.5044, 27/48, printed p = .0191, exact p = .033 > .01); **P13b-3b FAILED** (SHAM−META dist +.06, p = .408) | Practice `101–116`, `301–332`; **Fresh `92001–92048`** (48 seeds, spent) |
| **P13b (A3)** | **Design 10: Amendment A3 (`acceptAt`)** | `ab573b7` → `aff0f0a` → `d75ad75` | In-life switching toxin sensitivity (`toxinSwitch = .005`); H10 oracle +10.71 vs fake +.27; Att 1 tracks felt damage to `.2/.75` (practice +9.29 vs EVO-R, +10.15 vs SHAM, 48/48) → fresh final | **PASSED under A3**: +9.48 vs EVO-R, +8.86 vs SHAM, +9.12 vs FIXED (all 48/48, p < .00001). Labelled: tunes decision threshold `acceptAt`, not reviser; 10th design. | Practice `101–116`, `301–332`; **Fresh `93001–93048`** (48 seeds, spent) |

---

### 3. Bounded Fly-RSI Ladder: L2 and L3 (All 8 L3 Designs / Screens)

Primary sources: `docs/FLY_RSI_GOALS.md`, `docs/FLY_RSI_LOG.md`.

| Level / Design | Attempt / Stage / Run | Commit(s) | Change / Specification | Outcome | Seeds Spent |
|---|---|---|---|---|---|
| Pre-L2 | 5 headroom worlds | `5272589` | (1) `senseDrift` sign flips (oracle +.77); (2) `senseDrift` permutation (−.54); (3) `brainSwitch` ×1/×12 sw .004 (oracle +3.69, fake +1.78); (4) ×1/×20 sw .002 (+2.98, fake +.44); (5) ×1/×12 sw .001 (**+3.05, 15/16; fake −.83**) | World (5) chosen and frozen (prior perception bug in sense-drift caught by fingerprint and discarded) | Practice `101–116` |
| **L2** | Practice Att 1 → **Final Run** | `5272589` → `a8e5e6b` → `1ef4381` | `brainTrack` switches L1 taste/move reviser genes between lean & full packages from a perfect, noise-free reading of the current brain-cost multiplier. Practice Att 1: +3.12 vs EVO-R, +3.55 vs SHAM, +3.64 vs FIXED (all ≥ 41/48). Final run once (NOREV omitted because L3 failed practice). | **L2 PASSED**: META 44.83, SHAM 41.96, EVO-R 41.19, FIXED 41.67; META − EVO-R +3.64 (44/48), META − SHAM +2.87 (39/48), META − FIXED +3.16 (43/48); exact p ≤ 1.5e-7; replicated on new seeds 6100001–6100048. | Practice `101–116`, `301–332`; **Fresh `95001–95048`** (48 seeds, spent) |
| **L3 (Design 1)** | Practice Attempts 1–5 | `5272589` → `a8e5e6b` | `brainSwitch` ×1/×12 sw .001; bar L1 ratio ≥ 1.5×. Att 1 lean while costly (1.44×); Att 2 lean taste only (1.18×); Att 3 lean move only (1.18×); Att 4 +300t fast regrowth (1.38×); Att 5 keep strong prune 2/1 (1.39×) | **FAILED practice** (best 1.44 < 1.5); **no final run** | Practice `101–116`, `301–332` |
| **L3b (Design 2)** | Practice Attempts 1–5 | `2c898e9` → `0fd4ab1` | `brainSwitch` hi ∈ {20, 30, 50} + rule form; reserved bank `96001–96048`. Att 1 hi 20 (1.372×); Att 2 hi 50 (1.026×); Att 3 hi 30 (1.106×); Att 4 hi 20 + lean fast shed (1.395×); Att 5 +300t fast regrowth (1.444×) | **FAILED practice** (best 1.444 < 1.5); **no final run**; bank `96001–96048` untouched | Practice `101–116`, `301–332` |
| **L3c (Design 3)** | Practice Attempts 1–3 + META-OFF diagnostic | `0fd4ab1` → `e1fe9c5` → `3450a39` | Fixed hi 20 + dormant feature parking (`park`/`unpark`); reserved bank `97001–97048`. Att 1 park added (1.453×, 20/48, p=.59); Att 2 +park singles \|w\|<1 (1.746×, 30/48, p=.041; seed 113 heavy tail); Att 3 +park singles \|w\|<2 (1.778×, 34/48, p=.017) | **STOPPED after Att 3** (slots 4–5 unused; bank `97001–97048` untouched). Descriptive META-OFF diag (`fly-rsi-l3c-metaoff-practice.json`): META-OFF 21.75 vs NOREV 26.90 (−5.15, 4 extinctions) revealed inheritance-loss confound; Astra also flagged float-LCG scorer bug | Practice `101–116`, `301–332` |
| **L3-I Scr 1 (Design 4)** | Parking + Inheritance Law | `e43bda8` → `a373341` | L3c Att 3 + `inheritFull` (repertoire deduplicated, controller package reset before birth) + Scorer v2 + factorial mean/sign gates (≥ 33/48); reserved bank `763001–763048` | **MISSED** (`fly-rsi-l3i-screen1-practice.json`): direct METAOFF−NOREV = +3.36 (exact p = .0057); L1 gain 14.81 vs 10.17 (1.456×); original d = +2.92 (exact p = .012); factorial f = −0.45 (exact p = .58, 19/48 vs bar 33/48) | Practice `101–116`, `301–332` |
| **L3-I Scr 2 (Design 5)** | RewriteCost Stage A | `a373341` → `4ea16c8` → `0369464` | Replace `brainSwitch` with `rewriteCost` (0.15 / 3.00, sw .002) + 16-tasting shadow swap trial (`swapHurdle`). Locksteps passed (0 divergent ticks/20,000). Stage A bar: ≥ 12/16 seeds with ≥ 20 checks & ≥ 10% win rate | **MISSED at Stage A** (`fly-rsi-l3i-screen2-stageA.json`): **0/16 qualify** (5–36 blocked checks/seed; 230 checks, 102 nominations, 80 cancellations, 13 pending-at-death, 9 completions, 2 wins total on seed 114). Bank `763001–763048` untouched | Practice `101–116` |
| **L3-II (Design 6)** | Attention-limited structural revision Stage A | `50e0a25` → `ada5b25` → `1493dc6` → `34f84b4` | Two 4-bit odor banks (`bankPairs`), 1 routed bank/tasting, unreliable bank bit-flip q=.5, private receptor sw .004, .90 cue; reserved bank `852001–852048`. Integrity passed. Stage A bar: ORACLE beats all 5 statics & BLIND by ≥ .01 nats & ≥ 2.0 flies, ≥ 12/16 wins vs FIXED & BLIND | **MISSED at Stage A** (`fly-rsi-l3ii-stageA.json`): ORACLE (58.29, .5654) beat all statics (+2.28..+7.56 flies, −.1058..−.1128 nats, 12/16 vs locked S50 56.00), but missed vs BLIND (56.91, .6338): +1.37 flies (bar 2.0), 10/16 wins (bar 12). Bank `852001–852048` untouched | Practice `101–116` |
| **L3-III (Design 7)** | Evidence-routed attention Stages A & B | `8af02b7` → `69971d1` → `3a0aa03` → `1e91a4f` | `L3II_WORLD`; META = former BLIND writing `attentionA` (no bodily cue); SHAM = independent sensory twin; reserved bank `874001–874048`. Integrity passed. Stage A (`301–316`) re-locked FIXED = S75 (55.88). Stage B (`317–332`) bar: mean g > 0, mean d > 0, ≥ 9/16 d > 0 | **MISSED at Stage B** (`fly-rsi-l3iii-stageB.json`): g = +13.39, META − S75 = +0.88, d = −5.81, **1/16** seeds d > 0 (bar 9). Telemetry: META match rate .530 vs S75 .500; route run 4.68 vs 2.65. Bank `874001–874048` untouched | Practice `301–316` (St A), `317–332` (St B) |
| **L3-IV-H0 (Design 8)** | Four-bank routing headroom screen | `12b8e7f` → `bcc991d` → `d67b3d4` | 16-bit odor, 4 banks (`quadBankPairs`), tasteCap 24, 39 static allocations, ORACLE/BLIND/TRUE_ORACLE at toxins .60 & .85; reserves no final bank. Integrity passed. Bars: mean g ≥ 3, dO ≥ 4 (≥ 13/16), ORACLE−BLIND ≥ 4 (≥ 12/16) | **MISSED at both toxins** (`fly-rsi-l3iv-h0.json`): toxin .60 → g = +5.87, dO = +0.49 (8/16), ORACLE−BLIND = +2.54 (13/16), α = .28; toxin .85 → g = +10.48, dO = −1.91 (4/16), ORACLE−BLIND = +2.62 (13/16), α = .44. L3-IV stops before any controller | Practice `101–116` |
| L3-IV-H0 (post-hoc) | Exploratory diagnosis (unregistered) | `16b4372` | Gemini 4 Neon read-only ablations on 4 new seeds (TRUE_21 vs TRUE_5, cap=40, mutation off, stronger pruning, higher Z, taste-only vs +move L1, zero-singleton `[0]`) | Identified 9.4-fly tax from 16 unprunable founder singletons (~4.2 energy + ~5.3 L0 overfit), concave saturation, and population-level mask search; recommended closing L3 with no 9th screen | Exploratory non-bank `501–504` (marked spent in `SPENT_BANKS_RSI.md:59`) |

---

## Reserved Untouched Final Seed Banks

All five L3 final banks reserved in `docs/FLY_RSI_GOALS.md` were **never executed**:
- `96001–96048` (L3b)
- `97001–97048` (L3c)
- `763001–763048` (L3-I)
- `852001–852048` (L3-II)
- `874001–874048` (L3-III)
