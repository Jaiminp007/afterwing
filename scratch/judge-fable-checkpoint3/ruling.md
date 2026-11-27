# Ruling at the 3-failure checkpoint (Fable 5.2, conceptual judge, 2026-11-27)

**Verdict: stop the L4 line and report NOT SHOWN. The reason is principled, and it is scoped to this learner class in this microverse. It is not a theorem about hierarchies.** I ran no experiments. The new numbers are re-aggregated from `results/l4h/*.ndjson` and `results/l4i/*.ndjson`.

## 1. Viability: no

Thirteen designs have failed in two opposite ways, and the two ways form one dilemma.

- **Constructed worlds, 10 designs.** The builder puts structure at each level, and that structure is a world model. A flat learner with the same information matched or beat every hierarchy.
- **Blind worlds, 4 families.** Nobody holds the world model, so the flat learner loses that edge. The structure goes with it. The best adaptive depth-2 learner, out of 61 configs plus a 13-point rate sweep, lands −0.07 to +0.97 flies from a tuned Kalman.

A pass needs depth-3 structure that nobody wrote for the purpose. This microverse is too small to hold it.

- **Data.** A fly starts at w = 0 with 3 inherited floats, lives about 1,400 ticks and takes about 700 bites. The rate of change, which L2 tracks, shifts a few times per life. The right way for L2 to adapt is close to one constant per world, and the static sweep and EVOR find constants.
- **Gate.** d₄ > 0 means META3 − L2BEST ≥ ½ (L2BEST − FIXED). The third level must add half of what the second added, with nothing that varies within a life to learn from.
- **Plateaus.** Around its optimum, L2's rate can move by a factor of e³ to e⁵ and shift the population by only 0.3–0.7 flies. A clairvoyant static rate per world is worth 0.23–0.78 flies, selection noise included. In draw 1, the best family, L3 would have needed about 0.7 flies over L2BEST to pass at n = 48.

L4-H and draws 1 and 2 include worlds built on volatility regimes, calm and turbulent spans inside one life. That is the standard case for adaptive rates, and the gain stayed under 1 fly.

## 2. The endpoint is not the bottleneck

Skill is the harness's discrimination score. It is the share of good odors a fly would accept minus the share of bad ones, and a perfect score is 1.

| Family (tuning seeds) | FIXED skill | L2BEST − FIXED, flies | L2BEST − FIXED, skill |
|---|---|---|---|
| L4-H | 0.53 | −0.07 | −0.010 |
| L4-I draw 1 | 0.55 | +0.97 | +0.016 |
| L4-I draw 2 | 0.69 | +0.20 | +0.001 |
| L4-I draw 3 | 0.66 | +0.36 | +0.007 |

The Kalman does not saturate prediction, and population follows skill. Among arms within 3 flies of the best, 0.01 of skill is worth 0.4–0.6 flies (r .57–.87). L2's gain is missing in skill too, so no change of readout recovers it.

A harness change is a legitimate world change under a fresh registration, because it is common to every arm and would be chosen from depth-1 and depth-2 rows only. Freeze it before any new draw, and use the four exposed families for tuning only. Restate admissibility as about 1.25% of FIXED's population, which is what 1 fly was. A larger carrying capacity clears "1 fly" by arithmetic.

It would not help. Scarcer food or stronger toxins scale g, the noise and L3's margin together, so d₄ keeps its sign. Value-proportional energy weights errors by |value|, and high-|value| foods are the easy ones. That last point is argument, not measurement.

## 3. Redirect: none I would back

If the user insists, the least-bad L4 design is **recurrence memory**, blind, with B raised for every arm.

- **Headroom at L2.** Recurring rules appear unprompted in all four families (seasons, prototypes, blooms). No library arm stores a past rule for recall. Every L2 tested adapts how fast one rule is tracked, and B = 3 cannot carry a rule across birth.
- **Levels.** L2 is an inherited bank of rules with a learned gate. L3 rewrites the gate's update from the bank's realized recall error.
- **What it does not escape.** A multiple-model filter with a learned transition matrix is a general-purpose flat algorithm, and a blind adversary will add it. L3's object is again a few thresholds, which a sweep finds.
- **Odds.** Some draw is admissible, 40%. Stage B then passes, 4%. The final passes, 70%. **About 1%.**

Measure the ceiling first, on the exposed tuning seeds, which spends no bank. Give a Kalman the true noise, the true change times and the true returning rule. In L3-V, META captured 30% of the oracle's headroom (8.5 of 28 flies), and a pass here needs META3 − FIXED ≥ 1.5 flies. An oracle under 5 flies above FIXED in every family closes the class by measurement.

## 4. What may be claimed

- L2 shown. L3 shown in the constructed L3-V world at 2.01×, with its caveats. L3 in the default microverse not shown.
- **L4 NOT SHOWN.** 13 designs, 2 registered. L4-H failed stage B, and L4-I ended with 3 of 3 draws inadmissible. No final bank was run. The 1.5× bar and the integrity rules did not move.
- Two descriptive negatives, from exploration and tuning seeds. In constructed worlds, a same-information flat learner matched or beat every hierarchy. In four blind families, adaptive gains add under 1 fly (about 1%) to a tuned Kalman. The one registered number is from L4-H stage B, where the L2 gain was 0.00 on 48 seeds and META3 − L2BEST was +0.03.
- Not claimable: "L4 shown", "RSI completed", "hierarchies cannot help", or "L2 never matters in blind worlds". No structural L2 and no B above 3 was tested, and no L3 arm ran on any L4-I draw.

**Tell the user.** The instruction was to continue until L4 passes with the bar fixed. I put each further design at 1–3%. A loop that runs until something passes ends in a chance pass or in a world with the result built in, and a pass on attempt 14 has to be reported as 1 pass in 14. The honest deliverable is the ladder as it stands, plus the reason L4 fails here. Continuing is the user's call, made with these odds in view.
