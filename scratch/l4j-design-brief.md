You are a research designer on the fly-RSI ladder in this repo: a fly-ecology "microverse" in JS, Node 22.

**Goal.** Find a design in which a level-3 learner, META3, measurably improves L2, the learner that adapts how L1 learns. Write only inside `{DIR}/`. No tracked edits, no commits.

**The gate** (it never moves): (META3 − FIXED) ≥ 1.5 × (L2 − FIXED), i.e. d4 = 2·META3 − 3·L2 + FIXED > 0. META3 must also beat SHAM, EVO-R and the strongest Class F learner at p < .01 (exact sign-flip, `docs/paper/stats.mjs`). The confirmation is a fresh registered final, which you will not run.

**Read first:**
- `scratch/judge-fable-l4g/ruling.md` (the definition of Class F);
- `scratch/judge-fable-checkpoint3/ruling.md`;
- `scratch/scope-astra-memory/report.md`;
- the end of `docs/FLY_RSI_LOG.md`;
- the harness `microverse/l4h.mjs`, the library `microverse/l4i-arms.mjs` and `microverse/l4h-classf.mjs`.

**Lessons from 13 failed designs:**
1. In worlds designed with a known structure, a same-information flat learner given the world model, such as Bayes or a block Kalman, matched or beat every hierarchy.
2. In four blind-drawn families, adapting L1's learning *rate* (IDBD, Autostep, adaptive-q Kalman and so on) gained 0–1 fly over a tuned fixed-gain Kalman. Rate optima are flat: changing the rate by e³–e⁵ moved population only 0.3–0.7 flies.
3. Information sources are flat (Class F) and strong. Inheriting the parent's weights gives +2.6–3.8 flies, and a current-rule oracle +13–23. Supplying information is not L3.
4. SPSA-in-time L3 extracted no signal.

**Class F** is the comparator. It allows any within-life algorithm, world model included, and the same inherited-float budget B for every arm, written by any rule. It excludes any component that rewrites another adaptive component's update from that component's realized performance. Per-bite compute is at most 3× an O(D²) learner for every arm. You may design a new world (a module exporting `createWorld(seed, D)` → `{step, value, noiseSd}`, as in `microverse/l4i-world-1.mjs`) and/or new learners. You may also change the harness ecology in a copy of it. Every arm must face the same observation interface.

**Required screen.** Run it on your exploration seeds only, `{SEEDS}`, with the first half for tuning and the second half held out once.
- **(a) L2 headroom.** The best L2 must beat FIXED, the best depth-1 member including a weight-inheriting LAST, by a clear margin.
- **(b) L3 room.** The hindsight best L2 setting per regime or per lineage must beat the single best fixed L2 setting by ≥ 0.5 × (L2 − FIXED), with margin.
- **(c) Oracle L3.** ORACLE3 (L2 driven by an oracle that sets its setting per regime) must give d4 > 0 on the held-out half against the **strongest Class F learner you can build**. That includes a monolithic Bayes or product-state filter if one fits the compute budget, a flat mixture or fixed-share over L2 variants, and LAST.
- If (c) passes, run your learned META3 once on the held-out half.

**Report** to `{DIR}/report.md`. Include every number and every seed used. Explain why Class F cannot replicate the L3 effect: name the compute or structural reason. Give an honest pass probability. A failed screen is a useful result. Run long batches detached.
