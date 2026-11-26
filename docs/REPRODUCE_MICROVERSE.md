# Reproducing the Microverse finals

Every number in the Microverse paper (`docs/paper/`) comes from one of the finals
below. The simulation is deterministic: the same commit and seeds give the same
numbers. Each final was run once on fresh seeds; rerunning it on the same seeds
reproduces it and is not a new test. Do not run any new seed bank without a plan
committed first (see `docs/SPENT_BANKS_RSI.md`).

Requirements: Node 20 or later. No other dependencies. Runners use one worker per
CPU core minus one.

| Result | Seeds | Code commit | Command | Raw data |
|---|---|---|---|---|
| G1–G6 final 1 | 50001–50008 | `da995b0` | `node microverse/suite.mjs final 50000` | `evidence/microverse/suite-final-50000-1794893331557.json` |
| G1–G6 final 2 | 60001–60008 | `da995b0` | `node microverse/suite.mjs final 60000` | `evidence/microverse/suite-final-60000-1794893845135.json` |
| G7c vs TASTEONLY | 94001–94096 | `dd0ea19` | `node microverse/solo.mjs SELF TASTEONLY $(seq -s, 94001 94096)` | `evidence/microverse/g7c-final-94001-94096-vs-TASTEONLY.json` |
| G7c vs MOVEONLY | 94001–94096 | `dd0ea19` | `node microverse/solo.mjs SELF MOVEONLY $(seq -s, 94001 94096)` | `evidence/microverse/g7c-final-94001-94096-vs-MOVEONLY.json` |
| P11b search | 101–116 (practice) | `ec3047c` | `node microverse/l2search.mjs` | `evidence/microverse/p11b-search.json` |
| P11b gate | 80001–80048 | `07b54e7` (copy `microverse/p11b-gate.mjs` in) | `node microverse/p11b-gate.mjs` | `evidence/microverse/p11b-final-80001-80048.json` |
| Fly-RSI L2 | 95001–95048 | `a8e5e6b` | see below | `evidence/microverse/fly-rsi-l2-final-95001-95048.json` |
| L3-IV-H0 screen | see `docs/FLY_RSI_LOG.md` | `bcc991d` | `node microverse/l3iv-h0.mjs` | `evidence/microverse/fly-rsi-l3iv-h0.json` |

Fly-RSI L2 final (bash):

```sh
MV_SET=L2 MV_ARMS=META,SHAM,EVOR,FIXED \
MV_WORLD='{"brainSwitch":{"mul":[1,12],"switch":0.001}}' \
node microverse/p13parts.mjs 95001-95048
```

The logs do not record the exact command lines for G7c and L2. The commands above
are reconstructed from the runners and from the arms and fields in the raw data
(the L2 final left out the NOREV arm, hence `MV_ARMS`).

Notes:

- G1–G6 were closed with the code at `da995b0`. Later code (G7c onward) passes the
  same suite on practice seeds only, so check out `da995b0` to reproduce those finals.
- The original P11b gate kept only summary numbers. `microverse/p11b-gate.mjs`
  reruns it and saves per-seed data. Run it at `07b54e7`: there it reproduces the
  log exactly. With current code it does not, because G7c later changed the default
  `SELF` strain (see `docs/PAPER_VERIFICATION_LOG.md`).
- The practice and screen files for L3 (`fly-rsi-l3*.json`) are committed next to
  the finals.
- P5–P14b (the compact-fly, many-odor line) are not covered here. Their raw outputs
  are local only and are not part of the Microverse paper.
