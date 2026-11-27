
## L4-I registration: blind worlds with an L2-admissibility condition (registered before the first draw)

**Basis.** L4-H ran the blind-world protocol and failed at stage B, because L2 added nothing in its world family (L2 gain 0.00). Fable's ruling (`scratch/judge-fable-l4i/ruling.md`) accepts L4-I with four amendments and two additions, all adopted below. Fable's odds: about 3%. A family that is admissible but has d₄ ≤ 0 counts as a clean negative.

**Claim (if it passes).** In blind-drawn foraging worlds where adaptive learning dynamics help (pre-declared admissibility below), a third adaptive level that rewrites L2's update from L2's realized performance beats every depth-2 learner in the declared library. It also beats the shams and EVO-R. The claim is conditional on admissibility.

**Code.** Everything is frozen before the first draw:
- harness `microverse/l4h.mjs` (unchanged from L4-H);
- library `microverse/l4i-arms.mjs`, which is the L4-H library plus the changes below;
- Class F extras `microverse/l4h-classf.mjs`;
- runner `microverse/l4h-run.mjs`, with `--lib l4i-arms.mjs --scorer l4i-score.mjs`;
- scorer `microverse/l4i-score.mjs`;
- fixtures `microverse/l4i-fixtures.mjs`, 86 checks.

**Changes from L4-H.**
1. **Static sweep.** The sweep covers ±6 log-rate offsets around L2A's rate, in 13 points. L3 and EVOR centers, and META3's applied (perturbed) rates, are clamped to exactly that range.
2. **Second declared L3 candidate, META3P.** It runs paired shadows at rate·e^{±c} on the same bites, with 3× the base's compute (within the budget of SHAREKF's three experts).
   - Every 16 bites it compares the shadows' EMA (time constant τ) of pre-update squared errors, and steps the acting log-rate by η toward the better shadow.
   - Grid: τ ∈ {50, 200}, c ∈ {.3, .7}, η ∈ {.1, .3}.
   - The SPSA META3 grid from L4-H stays as the other candidate. Stage A3 locks the best of the two, and its matched shams and RESET follow the locked type.
3. **The gate adds a test: L2BEST − FIXED > 0 at p < .01.**

**Draws.**
- At most K = 3. Each is a new third party with an identical brief and no information about earlier draws.
- Order: draw 1 Devin Claude Opus 5.5, draw 2 Devin Gemini 4 Neon, draw 3 Devin GPT-6 Sol.
- Draw k writes `microverse/l4i-world-k.mjs`, which is committed before any run.
- The brief is the L4-H brief, plus the scope "worlds whose rate and character of change vary within a lifetime". It names no learner.
- Every draw is reported.

**Per draw (tuning bank: draw 1 940001–940016, draw 2 941001–941016, draw 3 942001–942016).**
1. **A1.** All depth-1 and depth-2 members. Lock FIXED and L2A.
2. **A2.** The 13-point static sweep of L2A. L2BEST is its best point.
3. **Admissibility** (`l4i-score.mjs admit`; uses depth-1 and depth-2 rows only). The family is admissible if:
   - L2BEST − FIXED ≥ 1 fly on tuning seeds, with a sign-flip p < .01;
   - and the optimum is interior, offset ≠ ±6.
   - If not, log the draw and go to the next one. After 3 inadmissible draws, L4-I ends NOT SHOWN.
4. **Futility screen** (L2-only data). The available room is the mean per-seed best static rate minus L2BEST. If that room is < 0.5 × (L2BEST − FIXED), L4-I stops NOT SHOWN, with no redraw.
5. **A3.** Run the META3 and META3P grids and the EVOR grid around L2BEST, and lock them.
6. **Stage B** (practice seeds 101–116 and 301–332; 48 seeds; reused from L4-H in a different world family, disclosed). Run FIXED, L2BEST, META3, SHAM_NOWRITE, SHAM_RANDSIGN, RESET and EVOR.
   - **Pass requires all of:**
     - L2BEST − FIXED > 0;
     - d₄ = 2·META3 − 3·L2BEST + FIXED > 0;
     - META3 > L2BEST, META3 > SHAM_NOWRITE, META3 > SHAM_RANDSIGN and META3 > EVOR;
     - each at p < .01 (exact sign-flip, integer popSum).
7. **Final (938001–938048), once, only if B passes.**

**Integrity.** These are the same rules as L4-H:
- the runner refuses uncommitted code;
- headers carry hashes;
- the scorer requires the exact seed × arm product and unchanged code since the A3 lock;
- no edits to a world after its commit;
- no arm edits after this freeze.

**Banks.** 940001–940016, 941001–941016 and 942001–942016 are audited clean, with timestamp-only hits.
