# ODOR DEV ROUND 3 SCOPING V1 — guard-feature augmentation (NOT FROZEN)

Date: 2026-11-02. Zero worlds. Status: SCOPED-embryonic (candidate +
outside legs recorded; open items listed; no license, no bank, no
code, no execution). Promoted by round-2 NO-GO per the frozen
mapping (rehearsal closed as a transfer fix).

## Candidate mechanism

Feed the learned steering policy two new input channels: the
`overlapGuard` viability boolean + requiredEnergy scalar (both
already computed every decision; the learned features carry
normalized energy but neither channel). New input, not tuning:
falsified if the guarded gap persists with the feature present
(policy-expressiveness, not information).

## Outside legs (R745 shielding file, filed unlicensed)

- Canonical shielding (Alshiekh): reward-max ≠ safety; reactive
  shield synthesized from a spec, introduced two ways. Round-3
  analogue: the viability gate as a synthesized shield over learned
  steering (not a learned weight).
- Easy shielding (Pranger): domain-knowledge model decides safety;
  limited adoption is the warning — the feature must be cheap
  (one boolean + one scalar) or it won't be used.
- Verification-guided (Corsi): external online component + verify.
  Round-3 analogue: the frozen scorer gates already play verifier;
  the feature is the shield.
- Robust probabilistic (Galesloot): safe-improvement baseline +
  restricted action space on fixed data. Round-3 analogue: frozen-A
  is the baseline; the gate restricts, never enlarges.

## Open items before a frozen dev plan

1. Exact feature encoding (boolean + scalar normalized how?).
2. Instrument change list (learner input dims + billing).
3. Arms/probes (same 8 reused histories; which arms? learned-guard
   only + full probes?).
4. Caps (round-1/2 actuals × margin).
5. Verdict mapping (transfer gate + retentions + guarded-gap bar?).
   Pre-registered guarded-gap closure bar TBD at freeze (e.g. gap
   halves vs round 2, or clears 6/8 positive vs guarded? — freeze
   decides; must be direction-first and pre-registered).

## What this is not

Not authorized. Not a bugfix re-run (different treatment: new
inputs). Round-2 NO-GO stands independently.
