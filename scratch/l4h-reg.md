
## L4-H registration: blind-world depth test (registered before any world family exists)

**Why this form.** Ten L4 designs failed because a same-information flat learner matched the hierarchy. Fable's ruling (`scratch/judge-fable-l4g/ruling.md`) rejected the inherited-task-prior route as an L3-type claim. It accepted one satisfiable form: blind worlds. Every arm, META3 included, is frozen as general-purpose code before a third party draws the world family, and Class F is a declared library at equal inherited budget. Fable's odds for that form: about 5%. The adversary's blind forecast: 3%.

**Claim (if it passes).** The scope is foraging worlds whose food rules change over time, in ways that differ between worlds and within a world. There, a third adaptive level (L3, which rewrites L2's update from L2's realized performance) beats the best depth-2 learner from a declared, adversary-built library. The world family is written blind to the arms, and every member has the same observation interface and inherited budget. The claim does not cover worlds outside the family, or learners outside the declared library.

**Depth classes** (Fable's Class F; see the `microverse/l4h-arms.mjs` header):
- **Depth 1 (the FIXED class):** LMS and fixed-q Kalman.
- **Depth 2 (Class F, L2):** IDBD, Autostep, adaptive-q Kalman, switching Kalman, and the adversary's 21 configs (`microverse/l4h-classf.mjs`, copied verbatim). The rules:
  - any within-life algorithm;
  - inherited state of at most **B = 3 floats**, one cap for every arm, asserted at birth, written from the fly's observations, errors and weights;
  - excluded: any component that rewrites another adaptive component's update from that component's realized performance.
- **SHAREADQ** is marked borderline by the adversary. It is **declared eligible** before any world exists; this makes the flat class stronger.
- **META3** is an L3 wrapper around the locked L2BEST:
  - It tunes L2BEST's declared rate (log scale) by SPSA in time. Each pair runs n updates at rate·e^{+c} and n at rate·e^{−c}, in an order drawn at random per pair on the learner's private RNG.
  - Each realized squared taste-prediction error (pre-update) is attributed to the update that produced that prediction.
  - Updates are sign steps of size η, clamped to ±3 around the locked rate. The center is inherited, as 1 float.

**Controls,** all wrapped around L2BEST:
- **SHAM_NOWRITE:** the same perturbation schedule, no update.
- **SHAM_RANDSIGN:** the same schedule and write opportunities, with the update sign a coin flip. Beating a sham that is itself materially harmed cannot by itself support a mechanism claim; the sham-versus-L2BEST contrasts are reported.
- **EVOR:** the log-rate as a gene; no in-life change, selection by the ecology. Its grid:
  - a point mass at the locked rate with no mutation (reproduces L2BEST bit for bit);
  - a point mass with mutation pm ∈ {.1, .3} × sm ∈ {.25, .5};
  - narrow (±.75) or full (±3.3) standing variation × pm ∈ {0, .1, .3}.
  - Its range ±3.3 matches META3's applied support.
- **RESET:** META3 without inheritance (descriptive).
- **Static-rate sweep:** L2A at log offsets −3…+3, covering META3's whole reachable range. L2BEST is its best point, so a better fixed rate cannot masquerade as L3.
- **Factorial:** with L2 off, L3 has no object, so P01 = P00 by construction and f₄ reduces to d₄. This is disclosed, not double-counted.

**Endpoint.** Mean live population over censuses every 100 ticks, for ticks 10,000–20,000. The integer unit is popSum.

**Protocol.**
1. **Freeze.** Commit the harness, the library, the adversary's members, the runner, the scorer and the fixtures (83 checks).
2. **World family.** A third party (Devin GPT-6.2 Sol) writes `microverse/l4h-worlds.mjs`, exporting `createWorld(seed, D)`. It is told only the interface and the declared scope, and is instructed not to read the arm files. The file is committed before any run.
3. **Stage A1 (tuning seeds 939001–939016).** Run every depth-1 and depth-2 member. Lock FIXED (the best depth-1 member) and L2A (the best depth-2 member).
4. **Stage A2 (same seeds).** Run the static-rate sweep of L2A. L2BEST is its best point.
5. **Stage A3 (same seeds).** Run the L3 grid (n ∈ {8, 16} × c ∈ {.15, .3} × η ∈ {.05, .15}) and the EVOR grid around L2BEST, and lock both. Every lock takes the best mean popSum, with ties broken by name.
6. **Stage B (practice seeds 101–116 and 301–332; 48 seeds; new world).** Run FIXED, L2BEST, META3, both SHAMs, RESET and EVOR.
   - **Pass requires all of:**
     - L2BEST − FIXED > 0;
     - d₄ = 2·META3 − 3·L2BEST + FIXED > 0 (equivalently, a ratio ≥ 1.5×);
     - META3 > L2BEST, META3 > SHAM_NOWRITE, META3 > SHAM_RANDSIGN and META3 > EVOR;
     - each test at p < .01, exact one-sided sign-flip (`docs/paper/stats.mjs`) on integer popSum.
   - **Otherwise:** L4-H fails, with no final.
7. **Final (bank 938001–938048, once).** Run only if stage B passes. Same arms, same test.

**Integrity.**
- The runner refuses uncommitted or untracked code. Batch headers carry the hashes of the harness, arms, runner, scorer, stats, world and spec.
- The scorer requires:
  - the exact seed × arm product, once each;
  - finite integer popSum and a common, runner-supplied nLate;
  - arm configs matching the lock;
  - unchanged code hashes since the stage-A3 lock;
  - the registered seed spec.
- No world-family edits after step 2. No arm edits after step 1.

**Adversary fixes applied before the freeze** (`scratch/adversary-astra-l4h/report.md`):
1. Randomized and correctly attributed SPSA pairs. A null-rate fixture shows no expected drift.
2. One B cap; no vector-state inheritance; the static sweep; a private RNG for base learners.
3. Sham reporting.
4. The EVOR grid.
5. A fixed-length odor catalogue, with unbalanced redraws counted.
6. Centered Kalman scale statistics, 1/√2 − exp(−e²/2S). Astra's dense kalSW reference matches to 4.4e−16.
7. Strict scorer checks.

**Exploration exposure.**
- The throwaway smoke world `scratch/explore-claude-l4h/toyworld.mjs` (seeds 7 and 6001–6008), used for code checks only; nothing was tuned on it.
- The abstract screen `scratch/explore-claude-l4g/` (seeds 5001–5006), which motivated abandoning L4-G.

**Banks.** 938001–938048 (final) and 939001–939016 (stage A) are audited clean. The only hits are timestamped filenames, as in earlier audits.
