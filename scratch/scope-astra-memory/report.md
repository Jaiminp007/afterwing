# Does memory of past food rules warrant another L4 attempt?

The question is whether a fly can recover the current-rule oracle's advantage by remembering past weights, and whether learning *how to update that memory* buys another half of the best flat learner's gain. The unit below is one live fly at a late census, averaged first within a world and then equally across world seeds. These are exploratory tuning results, not a registration or a new blind draw.

**Stop. L4 remains NOT SHOWN.** Passing only the parent's latest weight vector adds **2.63, 2.79, 3.77, and 3.26 flies** over FIXED, winning on all 16 seeds in every family. The best tested flat retrieval gate adds **0.02, 0.03, -0.10, and -0.25** on top of that if it must be capable of switching. Remembering the parent's current rule helps. Remembering when to fetch an older one contributes little to the best blind learner.

## Where the oracle advantage goes

Mean live population. Each cell uses all 16 of that family's tuning worlds. The `G` and `W` numbers are fixed gate thresholds, not adaptive third levels.

| Arm | H | I draw 1 | I draw 2 | I draw 3 |
|---|---:|---:|---:|---:|
| FIXED, tuned Kalman | 79.65 | 78.34 | 92.56 | 90.10 |
| CEILING, true current weights | 92.84 | 98.12 | 115.38 | 111.95 |
| (a) RAW, reset on every true change | 68.46 | 20.78 | 63.67 | 62.07 |
| JUMP, reset only on abrupt large changes | 79.62 | 78.19 | 92.69 | 90.10 |
| LAG, reset on material accumulated change | 78.17 | 73.45 | 88.49 | 83.33 |
| MEM_LOCAL, oracle label, no inheritance | 78.16 | 74.74 | 88.56 | 84.63 |
| MEM, oracle label, inherited lineage map | 81.36 | 80.71 | 91.93 | 92.96 |
| (b) WORLD_MEM, oracle label, persistent world bank | 81.59 | 81.23 | 92.19 | 93.85 |
| LAST, parent weights, no retrieval | 82.28 | 81.14 | 96.32 | 93.36 |
| (c) LOCAL20, own lifetime FIFO only | 74.33 | 74.23 | 88.04 | 85.00 |
| G0, inherited FIFO, retrieval after evidence | 70.18 | 70.41 | 81.85 | 80.00 |
| G20 | 72.96 | 73.10 | 86.07 | 84.03 |
| G50 | 77.30 | 77.16 | 91.44 | 88.67 |
| G80 | 79.37 | 78.77 | 93.21 | 90.22 |
| W0, inherited FIFO with LAST's warm start | 76.02 | 77.37 | 91.62 | 88.85 |
| W35 | 80.85 | 80.59 | 95.76 | 92.69 |
| W65 | 82.09 | 81.17 | 96.23 | 93.11 |
| W85 | 82.31 | 81.08 | 96.20 | 93.01 |
| TRUE_FIFO, same warm FIFO with true-fit selection | 82.88 | 83.06 | 97.16 | 95.36 |

**Knowing the time is not the same as knowing what to forget.** In draw 1, the true mapping changed on 98.2% of ticks, often by a tiny amount. RAW repeatedly discarded good estimates. Three of its 16 populations were extinct at the end. Resetting only at large instantaneous jumps avoids that failure but changes FIXED by just **-0.03, -0.16, +0.13, and 0.00**. None of draw 3's 16 worlds had such a jump. These results are about hard resets, not an upper bound on optimal use of timing.

Here is one *additive* decomposition of CEILING minus FIXED. Each row changes one intervention in the specified order. The negative first row is a measured cost, not a negative fraction of information.

| Increment in mean population | H | I1 | I2 | I3 |
|---|---:|---:|---:|---:|
| FIXED to material hard reset (LAG) | -1.48 | -4.90 | -4.07 | -6.77 |
| Add within-life recall with true labels (MEM_LOCAL minus LAG) | -0.01 | +1.29 | +0.07 | +1.31 |
| Let those learned weights cross birth (MEM minus MEM_LOCAL) | +3.20 | +5.98 | +3.37 | +8.32 |
| Remaining advantage of supplying current weights (CEILING minus MEM) | +11.48 | +17.41 | +23.45 | +18.99 |
| **Original CEILING minus FIXED** | **+13.19** | **+19.78** | **+22.82** | **+21.85** |

Even the persistent world bank's gains of **3.42, 7.79, 3.70, and 10.52** over LAG buy back much of the damage done by forced resets. Against FIXED, the same bank gains **1.94, 2.89, -0.37, and 3.75**. Recurrence is real but uneven. In draw 1, the world bank beat LAST by 2.72 flies on the 11 worlds with at least one labeled return; it *lost* 5.69 on the five without one. In draw 2, the corresponding differences were -3.71 (seven worlds) and -4.47 (nine). These are subgroup descriptions, not independent tests.

The matched FIFO gives a second decomposition without destructive resets. Start with LAST's 2.63 to 3.77 flies. Add fixed-gate retrieval or choose never to switch: the extra is **0.02, 0.03, 0.00, 0.00**. Replace that decision by true-fit selection: another **0.57, 1.89, 0.83, 2.00**. The remaining gap to CEILING is **9.96, 15.06, 18.22, 16.59**. Thus even truth-scored retrieval of actual snapshots closes only **24%, 24%, 20%, 24%** of the original gap. The rest is not an identified "lag" term. It includes not having a sufficiently accurate candidate, especially on first or changing rules, finite bite data, and selection only every 16 bites. Population also depends on which odors a policy causes a fly to sample. These contrasts do not isolate those residual causes or establish a ceiling for every possible bank.

## Class F and the case for L3

**The fixed-gate FIFO is Class F at depth 2.** Its gate uses realized L1 prediction errors to replace the active readout. No component rewrites the gate's own update. LOCAL20 needs no inherited floats. The inherited W bank carries at most 128 weight floats, plus occupancy and a latest-prior flag in this implementation. It is not legal at the old `B = 3`. A new registration would have to give *every* arm the same raised cap, including any scalar inherited by L3. Allow LAST, inherited priors, and an adversary's multiple-model filter on the flat side. Neither true labels nor a world-shared map belongs in Class F.

Does the flat bank capture (b)? **It can match much of (b)'s population without matching its recall mechanism.** The best warm flat policy minus WORLD_MEM is **+0.72, -0.06, +4.14, -0.48**. Paired standard errors are **0.69, 1.60, 0.79, 1.30**; these are not equivalence tests. LAST accounts for essentially the whole flat gain. Conservative W85 in H averaged only 0.31 switches per entire 20,000-tick population run. Conversely, the positive TRUE_FIFO contrast shows that the blind gate still misses useful opportunities, particularly in draws 1 and 3. A bank of stale weights and a reliable way to select one are different resources.

A genuine L3 candidate would change the *threshold update* from the consequences of L2's recalls. For example, keep two shadow copies of the **whole** memory learner at neighboring thresholds. After each one takes or declines a recall, measure its subsequent pre-update prediction loss over the next block on the same incoming bites. Move the acting threshold toward the shadow with lower subsequent loss. L3 never chooses a vector or writes L1 weights itself. Merely selecting the snapshot with the smallest taste error, or using a fixed age-dependent rule at birth, remains flat. A bank-write threshold or a retrieval temperature could also be changed from delayed recall outcomes, but neither is measured here.

**How much fixed-gate variation is there to learn?** L2 is the best *family-wide* W gate, including never switching (LAST, behaviorally the off endpoint). "Per world" picks the best fixed gate separately for each of the same 16 worlds, in hindsight. "Per half" makes even that choice separately in each 5,000-tick late half. "Forward" picks each world's winner on the first half and scores it on the second, relative to the one family-wide winner selected on that same first half. Population is not available as a learner input.

| Family | Best fixed L2 | L2 - FIXED (paired SE) | L3 needs half | Per-world best population | Per-world extra | Per-half extra | Forward extra (SE) |
|---|---|---:|---:|---:|---:|---:|---:|
| H | W85 | 2.66 (0.32) | 1.33 | 82.55 | 0.25 | 0.43 | +0.04 (0.22) |
| I1 | W65 | 2.83 (0.29) | 1.41 | 81.81 | 0.64 | 0.84 | +0.24 (0.38) |
| I2 | off | 3.77 (0.23) | 1.88 | 96.60 | 0.27 | 0.38 | -0.03 (0.16) |
| I3 | off | 3.26 (0.24) | 1.63 | 93.77 | 0.41 | 0.51 | 0.00 (0.29) |

Per-world room is below the required increment in all four families, even **before** discounting the upward bias of selecting on the same ecological outcomes. Forcing L2 to use an enabled gate does not change that conclusion: per-world room versus need is **0.24/1.33, 0.59/1.41, 0.26/1.83, 0.57/1.51**. The per-half comparison is optimistic too: it splices population outcomes from different trajectories without paying a switching cost. Neither hindsight exercise bounds a policy that adapts within shorter regimes.

The most favorable counterargument is in I1 and I3. TRUE_FIFO's 1.89 and 2.00 flies over L2 clear the raw 1.41 and 1.63 targets. But a blind controller would need about **75% and 82%** of that measured privilege, respectively. Even with true selection, the tuning-seed one-sided exact sign-flip p for `2*TRUE_FIFO - 3*L2 + FIXED` is **.239 and .272** (8/16 and 7/16 positive). H and I2 miss the raw margin even with true selection. These p-values describe the matched contrasts, not registered tests; the gate was selected on these worlds.

**Verdict.** I put a *fresh*, adversary-tested recurrence-memory proposal at **about 0.5%** to pass the full gate, including practice and final. That is a judgment, not a probability fitted to four families or a claim of impossibility. The fixed-gate data fall below the L4-I-style futility threshold in every exposed family. A better write policy or state-dependent retrieval rule is conceivable, but a fixed version of it also belongs to the flat adversary. There is no measured third-level improvement, no sham or EVOR win, and no reason here to spend a new bank.

## What each arm knows

All live runs use `WorldL4H` unchanged, its 16 odor bits, its births and deaths, 20,000 ticks, and the 100 censuses from tick 10,100 through 20,000. Flies act on one linear readout and update it only from their own noisy bites unless an oracle is explicitly named. Every child starts with a zero readout. A parent prior, when allowed, is first applied during a bite update, not before the child's first action.

- **FIXED and CEILING** reuse the archived per-seed locked Kalman and true-current-weight rows. FIXED uses `q = .001`, `R = 2` in H and `.5` in I. CEILING fits true values on 512 odors, updates at most every five ticks, and installs the weights for every fly. It is a high-information benchmark, not a proven optimum for population. We did not rerun it or use its auxiliary odor-sampling RNG.
- **RAW, JUMP and LAG** get timing, never weights. RAW clears weights and restores `P = I` on every `rule.step(t) === true`. JUMP does this only on a single-tick change exceeding 50% of the initial food-value RMS. LAG does it when displacement from the last boundary reaches 50%. JUMP and LAG use different deterministic 128-odor panels. Neither threshold is tuned.
- **MEM_LOCAL, MEM and WORLD_MEM** use LAG's boundaries. At each boundary, the oracle assigns the closest previous true profile on the panel if its RMS distance is within 35% of the initial rule RMS. Otherwise it creates a new label. Only the label is supplied; nothing hands out true coefficients. The learner stores the outgoing segment's *learned* weights if it took at least eight bites. On a hit it starts from the stored vector with `P = .05 I`; on a miss it learns from zero with `P = I`. The cache thus saves an estimate, not a perfect record. A "return" means a revisit under this distance criterion, not an assertion that continuous rules repeat exactly.
- **MEM_LOCAL** forgets its map at death. **MEM** gives each child a private copy of the lineage map, including the active estimate if mature. **WORLD_MEM** keeps one representative per distinct label for the whole world. At segment end, the live fly with the most bites in that segment supplies it (first in fly order on ties). There is no averaging of other flies' tastes. A child can use a mature same-segment parent prior, otherwise the world cache. This is deliberately privileged, not a possible Class F arm.
- **LAST** is the non-oracle control that matters for inheritance. It passes only the parent's most recent weights after eight or more lifetime bites, starts that prior at the first bite with `P = .05 I`, and never consults a historical rule. It can exploit parent and child living under the same rule even if no rule ever returns.
- **LOCAL20 and G0/G20/G50/G80** store up to eight immutable end-of-block vectors, one per 64 lifetime bites. Every eight bites they compare each candidate's cumulative squared error on those bites to the incumbent's *pre-update* errors. They switch after the last bite only if the relative improvement exceeds the fixed percentage in the name, then use `P = .05 I`. LOCAL20 has no inheritance. G arms inherit the FIFO plus the latest mature estimate as its newest slot (eight slots total), but must wait for evidence before using any slot. No true boundary, type, tick, reward label, or true value is available to the learner.
- **W0/W35/W65/W85** give the flat challenger a fairer start. They use LAST's first-bite warm start, the same eight-slot FIFO, 16-bite score blocks, and preserve the current covariance on within-life switches. They still learn the ongoing rule on every bite. **TRUE_FIFO** has the exact same warm start, capacity, write/retrieval cadence and covariance policy, but gets the index of the closest stored estimate if it beats the current readout. Its distance is squared prediction error on the *current* true rule, using a fixed 128-odor orthogonal panel. Orthogonality makes coefficient distance to the panel projection equivalent to excess squared prediction error; the projection itself is never installed. This isolates the ability to recognize a useful snapshot from the ability to acquire one. Different acting policies still induce different bite streams.

The original bank and the warm-start follow-up are separate designs. The latter was added after seeing the first seed in each family; neither is a confirmatory measurement. The timing oracle's material-event plan can be precomputed because the food world is exogenous. Each event and label depends only on the rule trajectory up to that tick. The live oracle acts after the rule step and before any movement or bite that tick.

## Reproduction

Node **22.19.0**, repository revision `35d70710d9cbf1a22347ccb7bf67727f378662ac`. The only ecology seeds used, endpoints inclusive, were **939001-939016** (H), **940001-940016** (I draw 1), **941001-941016** (draw 2), and **942001-942016** (draw 3). No practice, held-out, or final bank was used. The odor panels are deterministic index patterns, not additional random trials.

From this directory, `node batch.mjs 9` and `node matched.mjs 8` produce `rows.ndjson` and `matched.ndjson`. Each skips completed rows in its own file. Do not start two writers for the same file. Both original batches ran as detached Windows processes. Run `node analyze.mjs` for the coverage and replay checks, paired statistics, `analysis.json`, and `per-seed.tsv`. `node chart.mjs` renders a local chart from the frozen analysis. The seed table includes every arm population and the selected gates; the JSON includes dispersions, action counts and all gate contrasts. `decisions.tsv` records the exploratory follow-up.

Checks passed on **1,092** complete ecology runs (17 new arms x 64 seeds, plus four FIXED replays). Each had 100 late censuses and balanced births, deaths, and final population. All four replays matched archived `popSum`, bites, and births exactly. All 34 no-jump JUMP rows matched FIXED in population and bites; all 29 no-hit MEM_LOCAL rows matched LAG. No incomplete or extinct row was dropped. `node check-report.mjs` checks all 76 population cells against the data and reproduces the oracle margin, finite-gate sensitivity and recurrence subgroup contrasts.
