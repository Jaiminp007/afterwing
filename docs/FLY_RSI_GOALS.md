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

## L3-I: factorial amplification (frozen 2026-11-19, before any L3-I practice run)

Designed with GPT-6.2 Astra (advice only, [thread](t3-thread://v2/bad08e28-8c88-40fe-af57-ced9fd1ccf77/mcp:8e44d7f6-3728-4075-bccc-d22ecd4da085)). L3, L3b and L3c keep their recorded results.

**Claim** (ecological amplification): level-1 self-revision pays at least 1.5× more under the level-2 controller than without it, after removing the controller's own direct effect. The claim must hold on average **and** in a typical world.

This is not the narrower claim "the controller makes L1 discover better edits".

**World.** `brainSwitch` mul [1, 20], switch .001.

**Arms** (`microverse/l3i.mjs`, strains `L3I_*`):

| Arm | Program |
|---|---|
| META | brainTrack plus parking, the L3c attempt-3 setting: park added features and singles with \|w\| < 2 |
| SHAM | the identical controller on a fake cost state |
| EVO-R | evolving package; a lean-born fly gets the same parking at birth |
| FIXED | full package, no parking |
| NOREV | no L1 |
| METAOFF | the META controller with L1 structural revision disabled |

**Inheritance law** (all arms, `inheritFull`):
- A child inherits the parent's full repertoire (active plus parked masks), deduplicated, with no weights.
- An in-life controller's temporary package is reset to the stable full package before birth mutation. EVO-R's inherited package is kept.
- The birth audit passed: 431 births, 0 missing masks, 0 children carrying a temporary package.

**Scorer v2.**
- Paired one-sided sign-flip: exact for n ≤ 16; otherwise a Monte Carlo with 200,000 draws, using a `Math.imul` LCG and p = (exceedances + 1) / (draws + 1). Validated against exact enumeration: maximum error .0027.
- Exact binomial sign test, with zeros counted as non-wins.
- A missing arm result aborts the run; it is never treated as an extinction.
- Extinctions are reported by arm and by seed; none are excluded.

**Gates** (all must pass; p < .01; unrounded per-seed values):
1. **L2:** META − EVO-R ≥ 1.0; META − SHAM ≥ 1.0; META − FIXED > 0.
2. **Original L3:** mean d > 0, where d = (META − NOREV) − 1.5 (FIXED − NOREV).
3. **Factorial mean:** mean of f = d − (METAOFF − NOREV) > 0.
4. **Factorial sign:** f > 0 on ≥ 33/48 seeds (exact binomial p = .0066; 32/48 gives .0147).
5. **Ordinary L1 gain:** FIXED − NOREV > 0.

**Protocol.**
- **Screen 1 (parking):** exactly this configuration, no tuning; one practice run on 101–116 and 301–332. If it clears every gate on practice, it gets the one final.
- **Screen 2 (RewriteCost):** only if screen 1 misses. It needs its own registration, with numerical headroom bars and a 5-attempt budget, committed before its first measurement.
- An oracle can never qualify. Selection is never by the smaller p.

**Final bank.** 763001–763048, never used: a repo-wide search found these numbers only as incidental values inside runtime autosave files. It is run once. L3c's reserve, 97001–97048, stays untouched.

**Default world.** The fingerprint stays bdaca307…; every mechanism is opt-in.

### L3-I screen 2: RewriteCost (registration text by GPT-6.2 Astra, committed verbatim before any RewriteCost measurement)

**Trigger and claim.** Run only if Screen 1 misses a frozen practice gate (it did). RewriteCost tests whether a fly improves the return from structural revision by demanding stronger evidence for an expensive edit than for a cheap one. The world, the two prices, the cue and the mapping are hand-written. The cue is noise-free; the evidence that a particular edit is useful must come from the fly's own subsequent tastings. All parent L3-I gates, inheritance rules, practice seeds, scoring rules and the single shared final remain in force.

**1. World.** For Screen 2 only, replace `brainSwitch` with `rewriteCost`. No parking; ordinary feature maintenance stays at .0005 energy per active feature per tick.
- **Prices.** A committed taste swap costs **0.15** energy in the cheap state or **3.00** in the expensive state. That is 0.1 versus 2 full good bites, or 2.5 versus 50 ticks of basal metabolism.
- **No other fees.** Nomination, shadow evaluation and rejection are free. Ordinary L1 edits are unchanged.
- **State.** Each fly starts independently in either state with probability ½, and its state flips with probability **.002 per tick** (mean dwell 500 ticks). The fly feels its *current* rewrite price before the commit decision. It has no read of the future state, the true food valence, or its remaining lifetime.
- **Debit.** The real price is debited once, at commitment, after the triggering feeding update and before reproduction and death accounting. It is never waived for a low-energy fly. SHAM pays the real price too.

**2. Swap operator.** Taste only; ordinary taste and movement revision stay enabled in every L1-on arm.
- **When.** The new opportunity occurs **only where the existing full-cap check would return because no higher-order incumbent is weak enough to prune**. A founder singleton or the bias is never displaced.
- **Nomination.** The incumbent is the higher-order feature with the smallest |w|. The challenger is the absent feature from the existing one-bit-extension menu with the largest |ev|, and it must clear the existing strict `tasteZ * sqrt(s2)` threshold. Ties break by smallest numeric mask. No eligible pair means no trial.
- **Shadow.** One pending trial per fly. Clone the live taste predictor, put the challenger in the incumbent's slot at weight 0, and rebuild that slot's cached replay feature from each stored odor.
- **Scoring window.** Over the **next 16 actual tastings**, score the live and shadow predictors on each observed label **before** training either on it. Use ungated `modelProb`, clipped to [.001, .999], and binary log loss in nats.
- **Isolation.** Both predictors receive the same bites, reservoir choices and replay record indices. The shadow consumes no live RNG draws and never controls behavior. Ordinary live revision continues; if the live taste mask list changes before the verdict, the trial is cancelled. Death or the end of the run leaves an incomplete trial, not a win.
- **Verdict.** score = (Σ live loss − Σ shadow loss) / 16. After training on tasting 16, commit iff score > the current hurdle and the live mask list is unchanged.
- **Commit.** Install the shadow's mask list and fitted weights, rebuild live replay phi from its stored odors, and record the challenger as added. Live evidence, observation counts, replay records and confidence history are kept.
- **Rejection.** Discard the shadow. No pending trial or fitted weight passes to offspring.

**3. Gene and controls.** The only package difference is `swapHurdle`, in **nats per tasting**. Static grid: **{0, .025, .075, .15, NEVER}**, where NEVER never commits.

| Arm | Hurdle rule |
|---|---|
| META | **0 when cheap, .15 when expensive**, reading the cue at the verdict, not at nomination |
| SHAM | the identical rule on an independent private state chain with the same initial distribution, transition probability and tick clock |
| EVO-R | founders start at the stable hurdle .075; at each birth, with probability .1, the inherited hurdle mutates to a different grid member chosen uniformly; no in-life tracking |
| FIXED | the strongest static hurdle selected in stage C |

All L1-on arms get the same operator, evidence, shadow window and real prices. There are no other treatment-specific genes or package changes.

**4. Advancement and budget.**
- Stages A–C use seeds **101–116**, paired by seed. Population means the existing late-population endpoint; all seeds, extinctions included, count.
- These are engineering advance bars, not claims of significance. Stages run in order and stop at the first miss.

| Stage | Frozen comparison | Advance only if |
|---|---|---|
| **A. Hidden challengers** | Switching world, hurdle NEVER; shadows observe but never commit. Per seed, the denominator is **all** otherwise-blocked full-cap checks with no trial already pending. The numerator is the trials started at those checks that complete with score > 0; no nominee, cancellations and deaths count zero. | **At least 10%** on **at least 12/16 seeds**, with **at least 20 denominator checks** on each qualifying seed. Checks, nominations, cancellations, deaths, completions and wins are reported separately. |
| **B. Payoff reversal** | Four cells: constant cheap or constant expensive price × static hurdle 0 or .15. | Mean paired flies: **cheap, hurdle 0 − hurdle .15 ≥ 1.0**, and **expensive, hurdle .15 − hurdle 0 ≥ 1.0**. Both directions must clear independently; a large effect in one cannot cover a miss in the other. |
| **C. Switching payoff** | The actual switching world: the implementable tracker and **all five** static hurdles. The static hurdle with the highest 16-seed mean is selected (exact tie: the higher hurdle, with NEVER highest) and locked as FIXED before stage D. | The tracker beats that best static hurdle by **at least 2.0 mean paired flies** and wins on **at least 12/16 seeds**. |
| **D. Qualification** | The six locked arms on 101–116 and 301–332, one 48-seed practice run. | Every frozen L3-I gate passes, and so does the off-arm identity check below. Only then does RewriteCost get the single shared final. |

- A pre-specified multi-arm batch counts as one attempt, not one per cell.
- **Four attempts are authorized under the five-attempt ceiling; the fifth is deliberately unused.**
- No alternative price, dwell, hurdle, window, denominator or seed batch may be substituted after a miss. No practice rerun to select a smaller p-value.

**5. Off-arm identity and preflight.**
- **Inert hurdle.** The hurdle's **only consumer** is the new L1 swap verdict. With `tasteRevise = moveRevise = null`, neither METAOFF nor NOREV may nominate, allocate a shadow, commit, pay a fee, alter a mask, or change a birth-mutation input through the hurdle. Both still do ordinary L0 learning and ordinary birth mutation.
- **Dedicated RNG streams.** Real and fake state paths use dedicated streams keyed by world seed, fly ID and stream tag. Sensing or updating the hurdle never advances a world, action, learning or mutation RNG.
- **Clean off arms.** The transient hurdle is reset before inheritance. Neither off arm has `brainTrack`, parking or any other package field.
- **Lockstep check.** Before measuring stage A, run an off-arm lockstep on practice seed 101 for 20,000 ticks, and repeat the identity assertion for every stage-D seed. Compare, tick by tick: ecological state, actions, energy, births and deaths, inherited repertoires, live masks, weights and evidence, and behavioral RNG states. Only arm identifiers and inert controller telemetry are excluded.
- **Required result.** **Zero divergent ticks, zero swaps and zero rewrite debit** in both arms; equal final populations alone do not pass. With this invariant, f = d per seed by construction, and any discrepancy is an implementation error, not a result.
- The default-world fingerprint must remain bdaca307….
