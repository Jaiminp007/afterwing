# ODOR DEV ROUND 2 SCOPING V1 — interleaved A-rehearsal (NOT FROZEN)

Date: 2026-11-02. Zero worlds. Status: SCOPED. No license, no bank,
no code, no execution. A frozen dev plan is required before anything
runs. Bank protection holds throughout: same 8 reused histories,
never the closed reserves, no fresh bank.

## Baseline (round 1, outcome-informed, dev only)

- Transfer: +0.42 vs reset (5/8, need 6/8); +0.36 vs cheap
  native-full (5/8); −0.55 vs guarded (0/8, descriptive).
- Retention: A 22.48% (need 95%), B 179.07%.
- Survivors: learned 20/192, frozen-A 60/192, reset 30/192.
- Motor-freeze: +7.43 vs continuous (8/8) but +0.30 vs frozen-A
  (3/8) — survival via stopped exploration, not proven skill.

## Mechanism hypothesis (outside-box, theory-first)

The retention asymmetry (A 22% vs B 179%) is a recency gradient:
sequential A→B→C→odor overwrites early tasks (classic catastrophic
forgetting — the mirror of the transfer wound: there the old
response won't extinguish; here the old skill won't persist).
Freezing preserves without learning (60 survivors, no skill gain).
The principled lever is REHEARSAL: interleaved A-exposure during
B/C (complementary-learning-systems theory — hippocampal replay
protects neocortical priors). Round 1's fixed 512/512/512/256
curriculum never re-exposes A. Round 2 tests whether redistribution
of the SAME acquisition tick budget with A-rehearsal slots lifts
A-retention and (via better-preserved A steering) transfer.

## Design (dev-legal)

- Histories: the same 8 reused (round-1 rows reused read-only as
  the fixed-curriculum baseline — no re-spend).
- Arms (new): learned-interleaved only, plus identical frozen-A/B
  probes and identical D-state transfer probes (reset, cheap
  native-full comparators rebuilt from the same D bodies per the
  round-1 protocol).
- Curriculum: FIXED total acquisition ticks (same budget as round 1),
  redistributed with A-rehearsal slots (exact schedule at freeze;
  e.g. A-B-A-C-A-odor with equal phase masses — the freeze fixes
  one schedule, no tuning).
- Gates (unchanged): transfer 6/8 vs reset AND cheap native-full
  with nonnegative survivor diffs; A-retention 95% (saved-over-reset
  with support). Descriptive GO/NO-GO (dev, not qual).
- Guarded diagnostic (zero worlds, pre-freeze): read the guarded
  steering policy (`odor-routed-experiment.mjs` steeringMode) and
  record WHAT it does that learned doesn't — informs whether the
  −0.55 gap is reachable or structural. Filed, not gated.

## Open items before a frozen dev plan

1. Exact rehearsal schedule (phase masses, slot positions) under
   the fixed-tick budget.
2. Instrument change list (`odor-routed-development.mjs` curriculum
   builder; new code path needs fixtures — dev-fixture standard?).
3. Tick/op caps for the new arm + probes (8 histories × setup).
4. Guarded-policy diagnostic read + filed note.
5. Verdict mapping (what round-2 outcome triggers qual-freeze
   consideration vs what closes the rehearsal hypothesis).

## What this is not

Not qualification (reused histories, outcome-informed). Not a
promise that rehearsal works (B 179% warns that more exposure can
hyper-retain — rehearsal could push A past 95% while distorting B;
both retentions gate). Not licensed to execute.
