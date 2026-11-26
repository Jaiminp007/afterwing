# Reproducing the results

Every Microverse result on the site and in [docs/MICROVERSE_LOG.md](docs/MICROVERSE_LOG.md) and
[docs/FLY_RSI_LOG.md](docs/FLY_RSI_LOG.md) can be re-run from a fresh clone. The simulator is
deterministic: the same seed and code give the same numbers on any machine.

## 1. Set up

You need Node.js 22 or newer. Nothing else is required for the Microverse.

```sh
git clone https://github.com/Jaiminp007/fly-ecosystem.git
cd fly-ecosystem
node --version        # v22 or newer
```

There are no npm dependencies to install for the Microverse.

## 2. Check the simulator

```sh
node --test tests/microverse.test.mjs
```

Six tests, about 10 seconds. They pin the world's fingerprint, so if they pass you are running the
same world the results were measured in.

## 3. Watch it

```sh
node server.mjs
```

Open <http://127.0.0.1:8765/microverse>. The simulation runs in your browser from
`microverse/sim.mjs`; the server only serves files.

To run one world headless and print the population every 500 ticks:

```sh
node microverse/run.mjs 101 6000 SELF,FIXED
#                       seed ticks strains
```

## 4. Re-run the registered finals

Each final was run once on fresh seeds and its raw output is committed under
`evidence/microverse/`. Re-running prints the same numbers, p-values included (the sign-flip test
uses a fixed random seed).

Runs use one worker per CPU core. Each seed takes about 20 seconds per core.

### G7c: taste + movement revision (seeds 94001–94096)

```sh
SEEDS=$(seq -s, 94001 94096)
node microverse/solo.mjs SELF TASTEONLY $SEEDS   # expect +2.14 flies, 66/96 positive
node microverse/solo.mjs SELF MOVEONLY  $SEEDS   # expect +9.40 flies, 96/96 positive
```

Compare with `evidence/microverse/g7c-final-94001-94096-vs-TASTEONLY.json` and `-vs-MOVEONLY.json`.

### Fly-RSI L2: the flies tune their own reviser (seeds 95001–95048)

The L2 world turns on a brain-cost switch, set with `MV_WORLD`:

```sh
SEEDS=$(seq -s, 95001 95048)
export MV_WORLD='{"brainSwitch":{"mul":[1,12],"switch":0.001}}'
node microverse/solo.mjs L2_META L2_EVOR  $SEEDS   # expect +3.64 flies, 44/48
node microverse/solo.mjs L2_META L2_SHAM  $SEEDS   # expect +2.87 flies, 39/48
node microverse/solo.mjs L2_META L2_FIXED $SEEDS   # expect +3.16 flies, 43/48
```

Compare with the per-seed means in `evidence/microverse/fly-rsi-l2-final-95001-95048.json`
(seed 95001: META 41.90, EVO-R 37.32).

### G1–G6: the goal ladder

```sh
node microverse/suite.mjs dev            # practice seeds 101–108
node microverse/suite.mjs final 60000    # fresh seeds 60001–60008 (final run 2)
```

G1–G6 were closed at commit `da995b0`. Later goals changed some strains, so for the exact
recorded numbers check out that commit first:

```sh
git checkout da995b0
node microverse/suite.mjs final 60000
git checkout main
```

The thresholds each goal must meet are fixed in [docs/MICROVERSE_GOALS.md](docs/MICROVERSE_GOALS.md).

## 5. How the numbers are made

- **Paired solo runs.** Each lineage lives alone in the same seeded world. The score is the mean
  population over ticks 10,000–20,000, with 0 after extinction. A contrast is the per-seed
  difference between two lineages.
- **Fresh seeds.** Designs are tuned on practice seeds 101–116 only. A final uses seeds that have
  never been run, once, and the result stands whichever way it goes.
- **p-values.** One-sided sign-flip test on the per-seed differences: exact for 16 seeds or fewer,
  200,000 random flips above that. The random-flip generators in the runners are defective (they
  repeat after a few thousand sign patterns), so treat printed values near 0.01 with care. No
  recorded pass or fail changes when the test is done exactly: `node docs/paper/verify.mjs`
  recomputes every p-value exactly from the committed data. Per-final commands, commits and the
  later controls are in [docs/REPRODUCE_MICROVERSE.md](docs/REPRODUCE_MICROVERSE.md) and the
  [verification log](docs/PAPER_VERIFICATION_LOG.md).

## Other tracks

These are separate from the Microverse and have their own setup:

- **P5–P14 (offline search and the many-odor world):** runners are in `scripts/rsi-p*.mjs` and
  `scripts/p14*-survival.mjs`, with results in `docs/RSI_P*_RESULTS.md`. These have not yet been
  re-checked from a fresh clone the way the Microverse finals above have.
- **MaleCNS connectome arena:** needs Python, a C++17 compiler and about 1.1 GB of data.
  See [docs/MALECNS.md](docs/MALECNS.md).
- **Archived run data:** large evidence bundles are stored as checksummed chunks under `handoff/`.
  Restore them with `python3 scripts/research-evidence.py restore` (`verify` checks the checksums).
