You are an independent third party writing a **world family** for a fly-ecology simulation in this repo (JS, Node 22). You must stay blind to the learners being tested and to any earlier world families.

**Do NOT open or read:**
- any file in `microverse/` except `microverse/l4h.mjs`;
- anything under `scratch/` or `results/`;
- the L4 sections of `docs/FLY_RSI_GOALS.md`, `docs/L3V_STATUS.md` and `docs/FLY_RSI_LOG.md`.

Do not search the git history either. You may read `microverse/l4h.mjs`, the ecology harness, to understand how your world is used.

**Write exactly one file:** `microverse/l4i-world-{K}.mjs`. Do not commit or edit anything else. It must export `createWorld(seed, D)`, where seed is a 32-bit integer and D = 16. It returns an object with:
- `step(tick)`: called once per tick for tick = 1…20000. It may advance hidden world state, and returns true if food values changed.
- `value(bits)`: bits is an Int8Array of length D with entries −1 or +1. Returns the current real-valued food quality of that odor code: > 0 means nutritious, ≤ 0 means toxic. It must be **pure**: no state change, and the same answer between steps.
- `noiseSd()`: the current standard deviation of the Gaussian taste noise a fly gets when it eats. It must be pure too.

All randomness must come from a seeded generator derived from `seed` (deterministic). No globals, no Math.random, no I/O.

**Ecology facts.** Flies forage on a 40×40 grid among 32 odor kinds, whose codes are redrawn every 30 ticks. On each bite a fly tastes the food value plus noise and learns to predict food quality from odor bits. Flies live up to 2400 ticks; children are born from well-fed parents and inherit a little state. The scored outcome is the late population (ticks 10,000–20,000).

**Declared scope of the family:** foraging worlds whose food rules change over time, in ways that differ between worlds and over time within a world, and **whose rate and character of change vary within a lifetime**. Use your own judgment of what is ecologically plausible and varied. Draw the world type and its parameters per seed from your family.

Keep values on a scale where good and bad foods are both common: roughly |value| of order 1–3, with noise SD around 0.3–2. Avoid worlds where nearly all odors share one sign.

You may write a small standalone check, which you keep and do not commit, that imports only your module. Use it to verify determinism, purity and sign balance over seeds 9001–9010. Do not run the harness with any learner.

At the top of the file, write a comment documenting the family: each world type, its parameter ranges, and how a seed selects them. Finish by replying with a short summary of the family.
