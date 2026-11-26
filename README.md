# Afterwing

An artificial-life research project. The question: can a creature improve *how* it learns, not just
what it knows, and pass that ability to its offspring?

The main experiment is the **Microverse**, a closed 40 × 40 world where simulated flies forage,
breed and die. Food smells are 8-bit codes, and a hidden formula decides which are nutritious. The
formula changes every 3,000 ticks, so nothing a fly memorised stays true for long. Offspring inherit
their parent's learning program, never its learned weights.

## What has been shown

Each goal was written down before it was tested, tuned on practice seeds, then run once on fresh
seeds against controls.

| Level | Claim | Result |
|---|---|---|
| L0 | Flies get better at telling food from poison during their own life | shown (G4) |
| L1 | Lineages revise which features their learning uses, from their own evidence | shown (G5, G7c: +2.14 flies vs taste-only, 66/96 seeds) |
| L2 | Flies retune the settings of their own reviser from the brain cost they feel | shown (+3.64 flies vs evolution, 44/48 seeds) |
| L3 | Compounding: each level makes the next pay off at least 1.5× more | not shown (best practice ratio 1.44 across four designs) |

This is bounded self-improvement in a hand-built world. It is not open-ended intelligence, and the
flies are not models of real insects. Full records: [docs/MICROVERSE_LOG.md](docs/MICROVERSE_LOG.md)
and [docs/FLY_RSI_LOG.md](docs/FLY_RSI_LOG.md).

## Run it

Requires Node.js 22 or newer. No dependencies to install.

```sh
node server.mjs
```

Open <http://127.0.0.1:8765/microverse> to watch the world live in your browser.

To re-run the registered experiments and check the numbers yourself, follow
**[REPRODUCE.md](REPRODUCE.md)**.

## Repository

| Path | Contents |
|---|---|
| `microverse/` | The Microverse simulator (`sim.mjs`), lineages (`strains.mjs`) and experiment runners |
| `dist/` | The browser front end |
| `tests/` | Test suite (`node --test tests/microverse.test.mjs` for the Microverse) |
| `docs/` | Goals, logs, plans and results for every experiment |
| `evidence/` | Raw output of the recorded runs |
| `scripts/` | Runners for the other research tracks |
| `handoff/` | Checksummed archives of large run data ([restore steps](REPRODUCE.md#other-tracks)) |
| `connectome/`, `vendor/` | The separate MaleCNS whole-connectome arena |
| `platform/`, `learning/`, `engine.mjs` | Earlier compact-brain platform and learning experiments |

## Other tracks

- **Offline search, P5–P14:** recursive search over the fly's learning program in an opt-in
  many-odor world. See [docs/VISION.md](docs/VISION.md) for status and scope.
- **MaleCNS arena:** flies running the 166,700-neuron MaleCNS v1.0 graph. Needs Python and a C++17
  compiler; see [docs/MALECNS.md](docs/MALECNS.md). Its results are separate from the Microverse.

## License

MIT. Third-party code and data notices are in [THIRD_PARTY.md](THIRD_PARTY.md).
