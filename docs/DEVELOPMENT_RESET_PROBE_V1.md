# Development reset-probe verdict V1 (2026-11-03)

## Authorization
Single bounded world run authorized by user (no literature; disk floor 1 GB;
measured 1.5–2 GB free before and after; run output 1.6 MB; evidence gitignored).

## Design (criterion 1: lifetime-learning benefit disappearing under memory reset)
- Instrument: `scripts/taste-development.mjs` (fixtures 32/32 green pre-run).
- Bank: `evidence/taste-development/dev-bank-v1` (fresh-built, zero worlds;
  sha256 `ad56119d…`; excludes all prior seeds).
- Run: `evidence/taste-development/dev-reset-probe-01`, ticks=512, count=2,
  arms=candidate,unlearned,acceptCruise,frozen,reset. Runtime ~12 s wall.

## Results
- sequence (candidate−unlearned): [+0.918, −0.069], mean +0.42, positive 1/2.
- acquiredA probe (current−reset weights): [+0.604, +0.924], mean +0.76, 2/2.
- frozen arm − candidate: [0, 0]. reset arm − candidate: [0, 0].
- developmentSignal: FALSE. extendedDevelopmentSignal: FALSE. qualified: false.

## Verdict: DOES NOT SATISFY criterion 1 — INCONCLUSIVE by construction
The frozen/reset arm contrasts are vacuous at 512 ticks: both arms are
identical to candidate (effects exactly 0,0) because the freeze/reset
manipulation bites at B/C segment boundaries, which only exist at ticks=1792.
The probe-level memory effect is present (acquiredA 2/2 positive), but the
sequence-level reset test — the actual criterion — was not exercised.
No milestone changes. No RSI claim. The reset question needs a 1792-tick run;
that is a future bounded run, not this one.

## Preservation
Attempt, bank, rows, sources digests in
`evidence/taste-development/dev-reset-probe-01/` (untracked raw evidence).
