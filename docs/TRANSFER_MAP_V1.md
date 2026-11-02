# TRANSFER MECHANISM MAP V1 (what lifts besides lossy)

Date: 2026-11-02. Zero worlds. Follows SYNTHESIS ADDENDUM V4's
reframe (open question is now transfer-side). Tried mechanisms
with verdicts; predicted-null extensions (predictions, NOT
verdicts — never run, never claimed); what would license new work.

## Tried (measured lifts, closed)

- Surprise-gated gain (live+replay mix): +0.10–0.26, DEPLOYED
  (V1h/V1i). Mechanism: extinction (replays high-error records).
- Lossy transplant α=0.25 (plateau 0.05–0.25): +0.13–0.26,
  DEPLOYED (V1j/V1l/V1m/V1n). Mechanism: unlearning (shrinks
  preserved avoidance). Replicates on fresh banks (C15 exact
  0.31/0.62 vs lossy 0.95/0.91).
- Threat-gated replay (TS): flat (+0.004), NOGO (acquisition-side,
  engaged-but-inert).
- Damage-gated replay (DAMAGE-GATE): flat (+0.015), NOGO.
- Dose curve (V1m/V1n): monotone shrinkage, plateau ~0.95, no peak
  (variance ~0.02 — no interior optimum to exploit).
- Rate dial 2.0 (C12): null (−0.05/+0.02, update-rule family null).
- Sparse mask 0.5 (C14/C15): null on exact (−0.04/−0.02), zero on
  lossy (−0.004/−0.016). Target-selection closed.

## Predicted-null extensions (NOT run, NOT verdicts — predictions)

- Sparse × lossy (mask on working transfer): predicted null by
  C14 (mask null) + C15 (operators add zero to lossy) jointly.
  Filed as prediction so nobody spends a bank testing it without
  a new rationale.
- Per-parameter rates × lossy: same joint logic, predicted null.
- Threat/damage × lossy: acquisition-side mechanisms on a
  transfer already fixed — predicted null (wrong side of the
  wound).

## Addendum 2026-11-02 (R348: input-side locus + TTA taxonomy)

- New LOCUS (Guo/diffusion-TTA): adapt INPUTS (transform target
  toward source) instead of weights. Every mechanism in the map
  above is weight-side (gains/scales/masks/transplants all rewrite
  weights or their updates). Input-side is outside that locus —
  the first such idea on record. UNLICENSED (needs a generative
  model of the train world = substrate work) but it re-partitions
  the hunt: weight-side (mapped, largely closed) vs input-side
  (unmapped, one candidate).
- R363 addendum: input-side family grows 1→5 — Mummadi
  input-transformation (the original TTA), Gao DDA (project to
  source = our transfer restated), Zhang BETA (black-box
  input-space, matches our constraint shape), Lee BECoTTA
  (input-dependent blending, DTR-relevant). ALL unlicensed (each
  needs machinery: transform, generator, steering model,
  experts). Locus stands: unmapped, five candidates, zero lines.
- TTA taxonomy (Liang survey) adopted as the hunt's map: update
  weights/statistics (tried) vs adapt inputs (untried) vs adapt
  prototypes (ProtoTTA — closest analog to niche-model weights;
  needs a prototype-update rule, unlicensed).
- sTTT (Su) names our transfer setting (sequential inference +
  adaptation) but does not change the C14-bar ruling on test-time
  firing (protocol framing; same channel).

## Wound lenses (recorded, not mechanisms — no line follows from a lens alone)

- Extinction failure (CONFIRMED working lens): lossy + surprise-gated
  both work by unlearning preserved avoidance; direction exclusivity
  (HB-only) supports it; adoption-decline tracks it.
- Shortcut failure (R353/Wei: TESTED 2026-11-02, REJECTED in strong
  form): train rows turn 0.866 on harmful vs 0.049 on beneficial
  cues (n=492+492, pooled C2–C15) — behavior tracks labels, not
  cues. Agents learn the rule; the wound is pure failure-to-unlearn
  (see SHORTCUT_AUDIT_V1). Subtler cue-threshold variant untested.
  Extinction lens stands alone.
- Rigidity framing (R357/Gu ERI): the literature's name for the same
  wound — inherited weights biasing reuse toward prior-satisfying
  features (Einstellung), rigidity DISTINCT from forgetting. Our HB
  gap is one instance of the class. Framing only (no measure
  computed here, no mechanism follows).
- Different spaces (R381/Hu VQ-CD): continual RL across DIFFERENT
  observation/action spaces — names our setting (codebook = different
  space). Precedent, not a line (needs diffuser machinery).
- Arbitration failure (R371/Nooralahzadeh: NEW lens, untested):
  encodes the evidence yet answers from the prior. Compatible with
  extinction/rigidity (the prior IS the preserved mapping); adds
  the arbitration question (who wins: prior or evidence). Hafez
  reliability-arbitration banked as a candidate mechanism
  (unlicensed: needs model + reliability estimate).
- Arbitration mechanisms (R373): Fard classic STATES the wound
  (habit = automated previously-rewarded actions, inflexible when
  environments change — filed as the canonical description);
  Jang ensemble-arbitration, Shan Pavlovian-hybrid (contextual CS),
  Lin source-reasoning (+correlation bias) all banked UNLICENSED
  (need ensemble/arbitrator, hybrid machinery, source model).
- Convergent precedent + tension (R361): MedEinst's control+trap
  with flipped evidence ≅ our train/flip-split + HB gap (kin, not
  a line); but context-change OVERCOMES mental set in code
  (Sergeyuk) while our codebook-change does NOT overcome our wound
  — filed as tension, modality/scale difference, not a mechanism.

## What would license transfer-side work

A mechanism aimed at HB-extinction with a rationale NEITHER gain-
modulation NOR target-selection NOR transplant-scaling — i.e., a
third unlearning mechanism (surprise and lossy are two; threat was
the third candidate and failed). The bar: direction-first (targets
HB specifically), falsifiable both ways, fresh bank, PLUS the R359/Shi caution (any
unlearning-based line must check the Nth unlearning still works —
continual unlearning can collapse forget-ability itself). None known —
the map stays open, not empty.
- R366 addendum: FIRST CANDIDATE RATIONALE (not a line): latent-cause
  inference-gating (Song/Lu) — infer the new codebook as a new cause,
  gate avoidance by cause. Genuinely new family (not gain, not
  selection, not scaling). Needs a frozen plan + fresh bank to run;
  direction-first and falsifiable-both-ways must be IN the freeze.
- V1O addendum (2026-11-02): family #2's simplest form ran INCOMPLETE-
  UNTRAINED (multi-train G0: 0.667/0.365/0.508; mid-training codebook
  switches act as interference, not enrichment, within 1792 ticks).
  Question UNANSWERED (not NOGO): future multi-codebook lines must
  solve multi-train learning first. Descriptive lift +0.0404 (3/3
  non-degraded, misses +0.10) recorded, ungated.
- C16 addendum (2026-11-02): family #1's simplest form ran NOGO —
  the vote never fired (L +4402..+10646 vs K=8; same-val confirming
  drowns flipped surprise 8:1). CLOSED with reason (vote dilution);
  a flipped-conditional vote would be a NEW variation needing its
  own freeze. Lossy HB 0.91–0.95 replicates the working baseline.
- R385 addendum: C16-successor design filed (Mouchon: frozen-
  encoder + surprise-gate + consolidation — flipped-conditional
  vote + write + consolidate; closest working architecture,
  unlicensed). DISRC (surprise-scaled updates) + dynamic-gain
  neuromodulation (stability gap = seg tax, gain thread made
  dynamic) banked as unlicensed variants.
- R387 addendum: Schillaci congruency (keep-what-fits via
  generative prediction error; embodied transfer shown) joins
  as the consolidation-side twin of the surprise-gate;
  CraniMem (gated-bounded) + 3-level Hebbian controller banked
  unlicensed.
- R389 addendum: Le surprise-NOVELTY (count novel surprise, discount
  familiar confirming — memory retrieval errors) joins as the
  dilution antidote for the successor vote; NEMORI (retention by
  predictability) + hypothesis-cascade (errors compound) banked
  unlicensed.
- R391 addendum: Wan max-discrepancy (not pooled sums) filed as THE
  dilution fix for the successor vote; drift-prototypes + Meta-ADD
  (learned drift typing) + HHT (type-then-adapt) banked unlicensed.
- R393 addendum: Halstead fingerprinting (stationary-concept
  representations + recurring-concept alarm = flip-back detector)
  filed; unified drift+forgetting survey Joins the map's reading
  list; Ayers GoF + Sharma cross-domain prototypes banked unlicensed.
- R395 addendum: MICE recall-or-relearn (cut-at-change + merge-or-store
  by error, training-free) filed as the transfer-chain operator;
  Halstead relevance-gating + evolution-pool (no replay) + reuse-selection
  bottleneck banked unlicensed.
- R399 addendum: AFEC (active-forgetting of NEGATIVE transfer) filed
  as family #1's normative statement (erase the conflicting mapping,
  keep the rule; conflict-detection is the missing piece);
  TASER (atomic-skill expansion+routing for HETEROGENEOUS tasks)
  filed with DTR's distinct-tasks setting; ADEPT (decoupled
  general-vs-domain tuning) banked unlicensed.
- R397 addendum: Lee DPM (neural Dirichlet-process mixture, task-free
  infinite causes) filed as the nonparametric cause-inference;
  DRIFT (continuous-shift benchmark) + PST (single-net segments)
  banked unlicensed; Korte three-levels (data/partition/learner)
  adopted as method for describing banks vs learners.
- R367 addendum: SECOND CANDIDATE FAMILY (training-side) —
  multi-codebook training (train A + pseudo-codebooks synthesized
  from A per Enomoto/PMDG, transfer B; Gan valence-as-attribute,
  Lee canonical-projection, Wang domain-vs-content as unlicensed
  variants). Changes the train protocol — G2b baseline implications
  must be IN any freeze. Candidates, not lines.
