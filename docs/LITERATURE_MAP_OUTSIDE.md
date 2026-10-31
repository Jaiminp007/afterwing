# Outside literature map (researched 2026-10-30/31; rounds 1-20 arXiv, rounds 21-50 OpenAlex/canon; rounds 51-55 all-canon, 429 throughout)

Twelve papers read at abstract level, selected for the program's three open
problems: (P1) substrate saturation — nothing beats the base rule;
(P2) mating structurally impossible — zero births ever;
(P3) evaluation overfits — selected configs lose live.
Each entry: what it says → what it means for us.

## Self-improvement: how others get headroom

- **Darwin Gödel Machine (2505.22954).** Open-ended evolution of
  self-improving coding agents: archive of diverse agents, foundation-model
  proposes new versions, empirical validation per change (SWE tasks).
  → They succeed where we got 0/8 because their TASK SPACE has infinite
  headroom (coding) while ours is a fixed saturated foraging ecology.
  Lesson for P1: headroom lives in the task distribution, not the
  optimizer. Our program has never varied the ecology itself.
- **Mendel GM (2608.07645).** Single-trajectory mutation is weak;
  reaction-norm (multi-task) + cross-lineage hybridization win. → Our lines
  are single-lineage with no cross-lineage information flow. If selection
  ever resumes, seed from multiple lineages, not one.
- **RRSI (2609.24972).** Harness RSI overfits training tasks; fixed by
  regularization: annealed proposer budgets, critic + pruner (reject
  small/expensive/stale edits). → Our V1b harm is their disease exactly:
  our 1%-better adopt rule has no pruner, so it adopts noise. Any future
  selection rule needs a minimum effect size + cost-awareness. Lesson for P3.
- **Red Queen GM (2606.26294).** Co-evolve agents AND their evaluators;
  fixed evaluators go stale (non-stationary utilities). Anchored with
  complementary signals (human grades). → Our eval is fixed (one-step
  error). If selection resumes, the evaluator must adapt too — but ours has
  no anchor; gaming risk is unaddressed. Lesson for P3, with a warning.
- **SGM (2510.10232).** Replace proof-of-improvement with statistical
  certification (e-values, Hoeffding) + a GLOBAL error budget across
  rounds (Confirm-Triggered Harmonic Spending). → We run dozens of tests at
  face value with no familywise control. V1c's +0.21 on n=4 is plausibly a
  look-elsewhere effect — SGM's framework says so formally. Lesson for P3:
  future bars need confidence + a program-level error budget.
- **Bounded RSI blueprint (1312.6764).** Autocatalysis/endogeny/
  reflectivity seed; value-driven scheduling. → Vocabulary, not machinery.
  Noted for the "bounded" framing only.

## Open-endedness: what the substrate needs

- **OEE Requirements, Taylor (1507.07403).** Five requirements; #1 is
  ROBUSTLY REPRODUCTIVE INDIVIDUALS. → We fail #1 at the foundation
  (zero births, structurally). The literature says open-endedness is
  IMPOSSIBLE without it. This promotes the mating block from "a closed
  track" to the load-bearing wall of VISION milestones 4–5.
- **AI-GAs, Clune (1905.10985).** Three pillars: (1) meta-learn
  architectures, (2) meta-learn learning algorithms, (3) GENERATE
  ENVIRONMENTS. → We did (2)-lite in a FIXED environment with a FIXED
  architecture. Pillar (3) is entirely missing. OMNI-EPIC (2405.15568)
  shows environments + rewards generated in code, filtered by learnability
  + interestingness. Our BT ecology has been byte-identical for the whole
  program. Lesson for P1: the next substrate is generated, not tuned.
- **Avida (adap-org/9405003).** Digital organisms, local 2D interactions;
  reproduction is the CORE LOOP (copy-with-mutation on execution), not a
  gated exception. → Our mating is a 6-condition Rube Goldberg gate
  including an unreachable action. Avida's design answer to P2: make
  reproduction the default (surplus-triggered copy), not the exception.
- **Embodied Evolution review (1709.08992).** On-line distributed evolution
  in swarms; mating/selection protocols are DESIGNED (mate choice, energy
  transfer, opportunistic exchange), never assumed. → Our program assumed
  mating would "happen" once energy sufficed. It won't without a protocol.
  Lesson for P2: design the mating protocol explicitly.
- **VeLO worth-it? (2310.18191).** 4000 TPU-months for a learned optimizer
  that doesn't beat tuned Adam; generality claims collapse under honest
  benchmarks. → Our mirror: 7,491 worlds of learning-knob tuning that ties
  tasteRate=1. The field already ran our experiment at 1000× cost with the
  same null. Verdict: the optimizer-tuning era is closed HERE too — with
  better baselines than VeLO had (we ran fixed/random/copied controls).

## What changes in the program

1. Mating verdict (this turn): STRUCTURAL, now literature-backed — Taylor
   #1 + Avida + embodied-evolution all say reproduction must be designed,
   never assumed. Fix direction: actuation redesign (Avida-style default),
   not motivation.
2. New rule (proposed): no future selection bar without a minimum effect
   size + program-level error accounting (RRSI + SGM). V1c's +0.21 would
   not have passed it.
3. Next substrate (proposed): generated ecologies (AI-GAs pillar 3), not
   new knobs in BT. This is the outside-the-box line the literature
   points to — frozen plan required before any bank contact.

## Round 2 — lateral angles (researched 2026-10-30)

- **POET (1901.01753).** Paired environment-agent coevolution; environments
  generated challenging-but-solvable with stepping-stone TRANSFER between
  problems. → Design for the generated-ecologies line: coevolve difficulty
  with capability (not naive randomization), and transfer solutions across
  ecologies — our lines never transfer anything but the base config.
- **PowerPlay (1112.5309).** Continually invent the SIMPLEST still-unsolvable
  task + the solver mod that solves it, provably retaining old skills. →
  Task-generation rule with anti-forgetting built in; re-validation on all
  prior tasks. Curriculum-shaped, VISION-shaped.
- **MAP-Elites (1504.04909).** Illuminate, don't optimize: archive elites
  across user-chosen behavior dimensions. → Directly applicable to OUR
  frozen archive (7,500+ worlds): a QD archive over turn-profile /
  foraging-signature dimensions would show diversity we HAVE but never
  selected for. Zero new worlds. (Lehman & Stanley's abandon-objectives
  lesson: our G-bars may CAUSE the saturation — archive behaviors instead.)
- **Surprise Search (1706.02556).** Select deviation from EXPECTED behavior
  (predictive model of search history); beats objective search. → We HAVE
  surprise machinery (surpriseEma)! Select configs that SURPRISE the
  predictor rather than minimize error — unexploitable the way our eval
  was. Concrete future selection rule.
- **World Models (1803.10122) + RWM for policy evolution (1809.01999).**
  Train the agent ENTIRELY in its own dream, transfer back. → Fixes our
  eval problem a third way (after live-only: overfits; faithful-mix:
  honest but blind to counterfactuals): evaluate candidate configs by
  dreaming. Our agents are tiny (11–96 dims) — a dream model at that
  scale (next-obs MLP) is oddly tractable HERE.
- **Cully et al. (1407.3501).** Precompute a behavior-performance MAP
  offline (MAP-Elites), adapt online by Bayesian SELECTION over the map
  (<2 min, no weight relearning). → M-RELEARN's ceiling (relearning costs
  nothing) says our agents should adapt by SELECTION from a repertoire,
  not gradient updates. New intervention class: repertoire + selection.
- **Generative Agents (2304.03442).** 25 agents, memory + reflection →
  emergent sociality (party spreading) with ZERO reproduction. → M5 does
  NOT require mating. Lateral track: sociality via the EXISTING signal
  channel (index 4, costed, currently constant 0) + co-location — decoupled
  from the reproduction block entirely.
- **Bedau/Ecolab (nlin/0004026).** Class-4 (unbounded diversity) needs
  dynamics that reduce connectivity over time; conservative operators bound
  diversity (class 1/2). → Our per-line ties (all arms ±0.07, reset≡
  trained) read as class-1/2: no persistent adaptive activity. The
  boundedness is in the OPERATOR (rate dials are ultra-conservative), not
  the selection. To get class-3 dynamics we must REWIRE (new pathways —
  e.g., actually wiring channels 3/4 to something), not re-tune.
- **MCC, Brant & Stanley 2017 (GECCO, from knowledge).** Reproduce iff a
  MINIMAL criterion is met (reach the goal at all, however badly), then
  open-ended search. → The mating-gate alternative: replace our
  6-condition gate with ONE survival milestone. Fires often, still
  selective, preserves lineage.
- **Polyworld, Yaeger (Alife, from knowledge).** Embodied mating via
  COURTSHIP: approach + visual display + mutual acceptance; dances evolve.
  → Agency-preserving mating WITHOUT overloading foraging actions: use
  approach (movement, exists) + signal burst (channel 4, exists but dead)
  + mutual proximity. New Option C for the actuation line (see below).

## Outside-the-box moves now on the table

1. **Mating Option C (courtship via channel 4)** — recommended primary for
   the licensed actuation line: agency-preserving, no foraging confound
   (unlike A), no agency removal (unlike B), ALife-precented. Uses two
   channels that already exist (movement + signal).
2. **QD archive of the frozen record** — zero new worlds; map what
   behavioral diversity 7,500 worlds already contain.
3. **Surprise-gated selection** — unexploitable successor to error-gated
   adoption, using our own surprise machinery.
4. **Dream-model evaluation** — candidate configs evaluated in a learned
   forward model instead of replayed past.
5. **Repertoire + selection adaptation** — MAP-Elites behavior map + online
   Bayesian selection instead of weight relearning.
6. **Sociality without mating** — signal channel + co-location → emergent
   coordination; M5 decoupled from the reproduction block.

## Round 3 — coordination without reproduction, evo-devo, non-reward drives

- **Baldwin: Meta-Learning by the Baldwin Effect (1806.07917) + Revival
  (1702.08411).** Learning guides evolution; learned behaviors become
  innate (genetic accommodation); learning ability itself is easily
  selected for. → OUR `consolidationRate` is 0 EVERYWHERE — the slow-weight
  tracking machinery exists, fully plumbed (`slowTaste`, replay-mode mutual
  tracking, checkpoint validation), but never switched on. WHAT-RETAINS
  closed direction-protection; consolidation (slow tracking) is a DIFFERENT
  mechanism, never tested. Concrete line: consolidationRate ∈ {0, small,
  large} × relearning/return-A-rebound metrics. Zero engine changes
  (config knob only). The highest-value concrete proposal this round.
- **Recruitment cascades (2610.24865).** Foraging recruitment as contagion:
  finder triggers linear-threshold cascade on the communication network;
  self-limiting via crowding; percolation decides local vs swarm-wide.
  Emergent patch-leaving + Lévy search fall out untuned. → Design for the
  signal channel: find → broadcast → threshold-follow. No mating needed.
  Gives dead channel 4 a function.
- **Emergent Comm + World Models (2002.09604).** Messages grounded in
  PREDICTED future observations ("enhanced observation"); positive
  signalling/listening losses. → Fuses our dream-model + communication
  threads: signal = predicted food direction. Concrete protocol design.
- **Iterated learning NIL (2002.01365).** Compositional protocols emerge
  via transmission bottlenecks; give learning-speed advantages amplified
  over generations. → Frames WHY lineage matters (cumulative culture) —
  supporting argument for unblocking mating, not a workaround. (Warning:
  2404.04286 — iterated learning also AMPLIFIES bias; errors compound.)
- **Empowerment (1310.1863, 1406.1767).** Channel capacity actions→sensors
  as task-independent utility; can motivate restructuring the environment
  itself. → Alternative selection criterion (with surprise-search):
  maximize future options. Implementable-ish via own transition counts.
- **Stigmergy learning (1811.08210).** Indirect coordination via state
  traces; distance-regulated. → Our food-depletion trails ARE stigmergic
  traces; noted, secondary to direct recruitment.
- **Quorum sensing (1412.7767).** Feedbacks resolve 2+ more density ranges.
  → Design pattern for density-gated behavior (don't court when alone).
  Relevant to mating-protocol efficiency.

## New concrete moves (ranked)

1. **Baldwin-consolidation line** — config-only, no engine work, sharp
   hypothesis (slow tracking retains what direction-anchoring couldn't),
   metrics exist (return-A rebound, relearning speed with headroom TBD).
   Recommended next freeze.
2. **Recruitment cascade via channel 4** — signal-on-find +
   threshold-follow; sociality track without mating; gives channel 4 a job.
3. **Surprise/empowerment-gated selection** — unexploitable successors to
   error-gated adoption.
4. **Dream-model evaluation** — evaluate candidates in a learned forward
   model (counterfactual configs, not replayed past).
5. **Repertoire + selection adaptation (Cully)** — MAP-Elites behavior map
   + online Bayesian selection instead of weight relearning.
6. **MCC-style minimal mating gate** — replace the 6-condition gate with
   one survival milestone (feeds the actuation line's Option B refinement).

## Round 6 — exploration machinery, transitions, communication learning

- **Go-Explore (1901.10995) + Latent (2208.14928).** Remember states →
  RETURN to the frontier without re-exploring → explore onward; works in
  deterministic simulators (ours are seeded!). Latent version needs no
  hand-designed cells. → Directly addresses M-RELEARN's ceiling (resets
  cost nothing because behavior is already there): DON'T reset to zero,
  return to the frontier. Our anchors (atA/atB/atC) are half the machinery;
  missing: archive interesting states + relaunch FROM them. Concrete line.
- **RIAL (1605.06676) + MACC (2006.07200) + comm review (1911.05438).**
  Centralized learning, decentralized execution (matches our runner);
  counterfactual credit for speakers; SOCIAL loss — agents must be trained
  to LISTEN, not just speak. Our protocol sketches only specify speaking.
  Entropy-based protocol metrics; account signal costs (we bill energy!).
- **Assembly Theory (2206.02279).** Assembly Index (minimal construction
  steps) × copy number = selection quantified. → Formalizes our
  replication logic: TURN-GATE 6/6 = high copy number = genuine selection;
  V1c +0.21 (n=4, vanished at n=8) = low assembly = noise. Use AT as the
  language for future GO bars.
- **Autocatalytic structure (1205.0584).** Decompose into subsets;
  evolvability/enablement/emergence; applies to entire ecologies. → Our
  lines ARE autocatalytic subsets (each verdict enables the next plan).
  Look for the program's autocatalytic CORE (what self-sustains?).
- **MLS assortment/reciprocity (1910.06933).** Within-group mechanisms
  SYNERGIZE with between-group selection. → Our 8 histories are already
  isolated lineages (groups!); program-level line selection IS group
  selection. Formal MLS framing for "select at the right level."
- **First major transition, MLS view (2608.22348).** Transition REQUIRES
  coupling replication to division + suppressing pure-replication
  selection. Replicators (selfish) + reproducers (compartments) must unite.
  → Deepest diagnosis yet: our system has NEITHER half (weights aren't
  inherited; flies can't divide). VERIFIED in code: `syncNewbornLearners`
  (`taste-experiment.mjs:34-49`) creates newborns with FRESH ZERO weights
  — no vertical transmission. So even MATE-ACT V1 births would NOT cross
  the transition. Phase 2 MUST wire inheritance (parental weights ±
  mutation), not just birth events. This reframes the whole mating track.
- **Minimax-regret UED refinement (2402.12284).** Regret-maximizing levels
  STAGNATE at the bound; BLP/ReMiDi continues learning. → Design rule
  for generated ecologies: naive regret saturates (like our G-bars);
  require level-perfect refinement.

- **PER (1511.05952) + ReaPER (2506.18482).** Prioritize replay by
  significance (TD-error), reliability-adjusted. → OUR replay is uniform +
  tournament; the knobs EXIST (`replaySkip`, `replaySurpriseGain` — both 0).
  Concrete config-only line: surprise-prioritized replay (replay what
  surprises). Upgrades exactly the machinery V1c proved load-bearing.
- **HER (1707.01495).** Relabel failures with achieved goals (implicit
  curriculum for sparse rewards). → Less applicable (our rewards are dense),
  noted.
- **Universal SF (2001.04025) + limitations (1708.00102).** Decouple
dynamics features from reward → transfer across goals. → Principled
  redesign for the transfer line (R-GAP failed on billing AND on
  entanglement). Bigger machinery; future.
- **Differentiable plasticity (1804.02464) + Backpropamine (2002.10585).**
  LEARN the plasticity rule (Hebbian coeffs + neuromodulatory gating) —
  outperforms static on maze exploration + meta-learning. → Our rule is
  hand-designed; the menu could include PARAMETERIZED plasticity tuned by
  the in-agent loop itself (per-weight rates, not global dials). V1e-shaped.
- **Neuromodulated Meta-Learning (2411.06746).** Flexible per-task
  structure; no universal pattern. → Our streams=1 everywhere; structure
  knobs (streams, hysteresis, controller) unexplored. Architecture vein.
- **AIF-DDM (2508.04435).** Active inference + drift-diffusion; effort =
  habit-vs-optimal conflict. → Full formalism for the DDM decision
  mechanism (round 4): leaky evidence + conflict-metered threshold.
- **Alignment-free evasion (2509.11083).** Attraction+repulsion WITHOUT
  alignment suffices for collective evasion. → Social coordination needs
  only simple local rules — SIMPLIFIES recruitment design (no complex
  protocol).
- **Hanabi conventions + QMIX + COMA (already mapped round 4, abstracts
  confirmed).** Conventions = opt-in multi-step cooperative actions;
  QMIX monotonic team factorization (needs a team objective we lack);
  COMA counterfactual baselines (our runner is centralized training
  already). MARL toolkit for the sociality track, ordered by readiness:
  conventions first (design-only), COMA second (needs team reward),
  QMIX last (needs factorization machinery).

## Round 4 — consolidation neuroscience, drift, credit assignment, foraging

- **EWC nuts-and-bolts (2105.04093).** Fisher-weighted consolidation:
  protect what mattered, not everything equally. → Upgrades BALDWIN:
  importance-weighted slow weights with OUR surpriseEma as the importance
  proxy (surprising = informative = worth protecting). Concrete V1b.
- **CTDL (1905.02636) + CLS-ER (2201.12604).** Fast pattern-separated
  (SOM, TD-updated) + slow distributed (DNN); dual semantic memories,
  no task boundaries. → Our architecture is INVERTED (fast distributed,
  slow averaged, no separation; streams=1). Architecture direction: give
  the fast system pattern separation.
- **Normative patch foraging (2004.10671) + evidence accumulation
  (1809.05023).** Bayesian residence times; drift-diffusion patch
  decisions (drift rate + threshold = strategies). → Our greedy 0.5
  threshold is a degenerate DDM with zero accumulation. New decision
  mechanism: leaky cue integrator + threshold (small instrument change,
  testable). MVT as the normative bar for the foraging line.
- **World Models unlock foraging (2512.12548).** Model-based agents
  converge to MVT; anticipation > reward-max. Reinforces dream-model
  evaluation + MVT bar.
- **COMA (1705.08926).** Counterfactual baselines (marginalize one
  agent's action) for multi-agent credit assignment; centralized training,
  decentralized execution — our runner IS centralized. → How a fly knows
  if ITS signal helped. Concrete MARL design for sociality.
- **QMIX (1803.11485).** Monotonic team-value factorization — needs a team
  objective we lack (total biomass?). Conditional note.
- **Hanabi conventions (2412.06333).** Augment action space with opt-in
  multi-step cooperative conventions. → Formal precedent for courtship-as-
  convention (MATE-ACT Phase 2): predefined opt-in sequences over existing
  channels. Strengthens Option C.
- **Phylogenetic diversity (2108.12586).** Lineage-aware metrics predict
  EA success better than richness/evenness. → QD the archive by
  LINEAGE, not just behavior.
- **From knowledge (flagged, not arXiv-fetched): Lynch drift-barrier —
  selection cannot beat drift in tiny populations. OUR n=24 founders with
  ±0.07-level effects is a DRIFT-DOMINATED regime by population genetics,
  independent of mechanism.** This reframes V1d's null a third way
  (saturated substrate AND drift-dominated sampling) and re-prioritizes
  population size with quantitative teeth: selection needs N≫24 or
  effects ≫ drift. Yet another reason mating matters.
- **From knowledge: MODES toolbox (Dolson et al.) — change/novelty/
  complexity potential metrics, runnable on frozen artifacts; Keramati
  homeostatic RL (setpoint defense — our energy billing IS a homeostatic
  loop); Mirollo-Strogatz pulse sync (decentralized coordination
  primitive for channel 4); RIAL (discrete emergent comm — ours would be
  RIAL-style, no differentiability needed).

## Round 7 — curiosity, criticality, homeostasis, collective transition physics

- **Episodic curiosity via reachability (1810.02274).** Novelty bonus =
  environment steps to reach the observation from memory (dynamics-aware);
  defeats couch-potato self-gratification. → Our exploration is TAXED
  (M-ORIGIN), never bonused; prediction-error bonuses would fail HERE
  (stochastic ecology → noise-chasing). Reachability, not prediction error,
  is the design that survives our setting.
- **Large-scale curiosity (1808.04355).** Pure curiosity aligns with
  hand-designed rewards; random features suffice; FAILS in stochastic
  setups. → Second vote for reachability-over-prediction-error in our world.
- **Maximum dynamic range at criticality (0906.0527) + foundations
  (2306.05635) + avalanches review (2111.07479).** Critical state maximizes
  input dynamic range via E/I balance; deviations = frozen or stampede. →
  DIAGNOSTIC LENS on V1d (queued analysis, zero new worlds): 47/48 adopts
  at ONE checkpoint is a supercritical stampede, not 47 independent votes —
  effective N ≈ checkpoints-with-variation, not agent-decisions. Would
  dissolve the residual mystique around "28 persistent adopts" (correlated
  copies of boundary events). Strengthens the closure honestly.
- **SPICED (2509.17439).** Synaptic homeostasis: strengthen discriminative
  traces, WEAKEN detrimental ones, RENORMALIZE globally, preferentially
  replay discriminative traces. → Three upgrades beyond our consolidation:
  (a) renormalization pass (we only ever ADD learning — no homeostatic
  set-point), (b) discriminative replay prioritization (ours is
  uniform+tournament), (c) suppress detrimental replay. (a) is most novel.
- **Snowflake yeast geometry (1802.03615) + E. coli self-organization
  (2503.03001).** Physical constraints (packing, stress) shape the path
  more than selection does. → For mating: ENCOUNTER RATE (26-unit radius
  in 1000×640 with 24 diffusing flies) may be the binding constraint —
  even with the channel fixed, births could be vanishingly rare. Reframes
  MATE-ACT V1's NOGO branch in advance: "no births" may mean "no
  encounters" → density/ecology, not gating. (Analytic encounter-rate
  estimate possible from diffusion; queued.)
- **Emergence of structured behaviors (1802.07461) + curiosity survey
  (1802.10546).** Adversarial challenge of the world model → ego-motion,
  attention, gathering, WITHOUT extrinsic reward. → Developmental play
  pattern; curriculum-via-curiosity framing for generated ecologies.
- **Avalanches theory (2111.07479).** Scale-free cascades from interacting
  wave modes — background for the criticality lens above.

## Round 8 — curricula, consensus, signaling games, modularity, culture

- **Teacher-Student Curriculum (1707.00183).** Teacher samples subtasks by
  LEARNING-PROGRESS SLOPE; revisits tasks where performance DROPS
  (anti-forgetting). Solved an otherwise-unsolvable maze, 10x faster than
  uniform. → THE scheduler for generated ecologies (Phase 2 of that line;
  needs ecologies to schedule first).
- **House-hunting trilogy (1505.03799, 1408.4487, 2105.00883).** Distributed
  consensus with Ω(log n) bound; optimal via nest-size info; DDM individual
  choice + quorum + recruitment; collective FAR less error-prone than
  individuals. → Quorum-based consensus protocols for sociality (assess →
  recruit → quorum → commit). Fourth independent arrival of drift-diffusion
  (foraging, AIF, collective choice, house-hunting): DDM is THE canonical
  individual decision mechanism — the leaky-integrator proposal is now
  quadruply motivated.
- **Signaling games (1103.5818, 2201.11680).** RL converges to shared
  lexicons (no synonym+homonym correspondences); SUPERLINEAR feedback
  (Metcalfe's law) matches linguistics. → Protocol learning rule: reinforce
  successful communication superlinearly. Concrete update for channel-4.
- **Modularity evolution (1211.5646, 1302.4267).** Modularity growth rate
  tracks environmental FLUCTUATION rate (fluctuation-dissipation); PRODUCT-
  rule (multiplicative) mutations → sparseness naturally, sum-rule does
  NOT. → (a) Our A/B/C/return-A fluctuation SHOULD induce modularity
  (taste blocks 4/5 already are modules?); (b) any resumed evolutionary
  search must use product-rule mutations; (c) costly connections (our 96-dim
  billing!) independently induce modularity — coherence check passed.
- **CCE navigators (2206.06281).** Minimal architecture (goal-direction +
  social proximity + route memory) SUFFICES for cumulative culture;
  experienced+naive pairing improves BOTH (regression to the goal).
  Lesioning proximity/memory kills it. → Design requirements for a future
  lineage track: proximity sensing + route memory + cross-generational
  pairing (not just inheritance).
- **Pheromones→Policies (2509.20095).** Stigmergic signals = distributed RL
  (cross-learning); persistent trails LOCK IN obsolete choices; a minority
  of pheromone-INSENSITIVE explorers restores plasticity (heterogeneity as
  design!). → Recruitment design with lock-in guard: keep an explorer caste
  (reset/unlearned agents as functional explorers?); heterogeneity, not
  uniformity, is the design principle.

## Round 9 — immunity, individuality, heuristics-as-inference, courtship honesty, quorum physics

- **Emergence of Individuality (2006.05842).** Intrinsic reward for being
  IDENTIFIABLE (classifier predicts agent from observation); promotes
  behavioral diversity in MARL, beats baselines. → Direct attack on our
  all-arms-identical uniformity: reward agents for being distinguishable.
  Implementable (classifier agent←behavior + self-prediction bonus).
  Genuinely new objective for the program.
- **Danger Theory AIS (0801.3549).** Respond to DAMAGE signals, not
  non-self. → Our deaths are energy-depletion (endogenous danger already
  logged: harmfulEaten, toxinDamage, crashes). Trigger protection /
  consolidation on damage, not novelty — different trigger than
  surprise-gating, using existing signals.
- **Free Energy Heuristics (2606.15877).** PROVEN: active inference under
  uncertain precision IS take-the-best (fast-and-frugal). Our greedy 0.5
  threshold is ALREADY the optimal computation for high-meta-uncertainty
  environments; more deliberation manufactures false confidence. →
  Converts the decision-machinery closure from empirical ("we failed to
  improve it") to THEOREM-BACKED ("improvement by deliberation is provably
  wrong here"). The V1a–V1d arc ends in a theorem, not just a null.
- **Volvocine phototaxis (2207.10405).** Adaptive response TUNED to the
  colony's rotation period (separation of timescales). → Principle:
  adaptation rates should match ecology timescales (our 512-tick phases).
  Grounds tau/surprise-window choices mechanistically instead of
  arbitrarily.
- **Synthetic quorum sensing (2502.13919).** Density-conditioned motility →
  absorbing transitions / atypical phase separation. → Density-gated
  behavior (slow down when crowded; display only above density) is
  physically grounded collective decision WITHOUT explicit protocol.
  Implementable via existing Spatial machinery.
- **Handicap → dimorphism (1509.08158).** Costly ornaments MUST be costly
  to stay honest; dimorphism emerges. → Courtship displays should be
  SEX-DIFFERENTIATED (males display, females choose) and energy-burning.
  Upgrades Option C with Zahavian teeth.
- **OML representations (1905.12588) + IB theory (2305.18887).** Learn
  representations that accelerate FUTURE learning; IB controls
  generalization error rigorously. → V1b material for consolidation (if
  V1 ever goes); 96-dim billing already prices the IB tradeoff.
- **Flocking + turning (1403.1202) + Vicsek foundations.** Polarized turns
  via conserved rotational info; Vicsek dissipates it. → Our per-agent
  turning discards coordination info; collective turning is unexplored.

## Round 10 — formal plasticity, development guides evolution, social allostasis

- **Evolutionary Le Chatelier (2607.20915).** Plasticity (fast) + genetic
  assimilation (slow relaxation of self-generated stress) via timescale
  separation IN THE PRICE EQUATION. → FORMALIZES the BALDWIN design
  (fast weights = plastic displacement; slow = relaxation) that V1 tested
  with a void metric. V1b (importance-weighted, proper reference) now has
  a formal backbone, not just intuition.
- **Differential canalization (1711.07387).** Only robustness-conferring
  traits assimilate; CONTROLLERS keep tinkering within permissive BODIES.
  → Profound scoping result: bodies SHOULD be stable, controllers plastic —
  our fixed bodies + plastic weights match the ENDPOINT, not a limitation.
  Reframes body-transfer: evolve bodies for robustness, never for policy.
- **Surprise-as-stress (2406.08471).** Cortisol-like stress hormone as
  allostatic mediator of prediction errors. → Concretizes the chain:
  surpriseEma = cortisol analog gating consolidation. Implementable
  neuromodulation, no new machinery.
- **Social allostasis (2508.12791).** Leverage environmental AND SOCIAL
  noise for reconfiguration (cortisol + oxytocin analogues). → Social
  signals as REGULATORY inputs, not just information. Oxytocin-analog =
  affiliation channel design.
- **Plasticity-led GRN review (2208.00649).** GRNs ≈ RNNs; criteria
  checklist for claiming plasticity-led adaptation. → Audit standard for
  any future Baldwin claim.
- **Darwinian→Lamarckian holobiont (1612.03567).** Two-level selection
  produces inheritable acquired adaptation. → Formal justification for
  V1b-with-vertical-transmission (transmit slowTaste, not just births);
  transmission-mode tracking per RITHMS (2502.07366).
- **Clune modularity (1207.2743) + rate effect (1501.04708).** DIRECT
  selection on connection COST → modular + evolvable networks; horizontal
  transfer couples with modularity. → Our 96-dim billing ALREADY imposes
  the modularity pressure (unmeasured — weights aren't archived; note as
  instrumentation gap). Supports cross-lineage transfer design.
- **Developmental world models (2301.05832).** Dream + predictive coding
  for cognitive development. Reinforces dream-model evaluation.

## Round 11 — bet-hedging, predictive coding, stickiness, developmental evaluation

- **Extinction in bet-hedging models (2406.11482).** KEY NUMBER: a 4x
  population increase beats switching from max-growth to min-extinction
  strategy; agent models converge to collective behavior only at N>=100
  (ours: N=24 — BELOW the threshold where collective models even apply).
  → Stop tuning strategy, grow N. Strongest quantitative support yet for
  the population track; our lines tune dials in a regime where dials
  provably matter less than headcount.
- **Bet-hedging expanding populations (1810.01142).** Bet-hedging favored
  in colonizing/spatially-structured populations, NEVER in well-mixed
  ones. → Our well-mixed ecology selects AGAINST diversification; frontier
  or patch-structured ecologies would select for it. Design note for
  generated ecologies (spatial structure first, then diversity).
- **Division of labour → multicellularity (1111.4597).** Mathematical core:
  compartmentalizing incompatible processes creates new fitness maxima
  (unicellular optima become saddles); transition evolves via ONE heritable
  parameter — STICKINESS (adhesion propensity). → Concrete minimal knob
  for our transition: heritable co-location affinity; select on group
  output. Plus: our generalist flies (forage+learn+reproduce in one body)
  may needCASTES (foragers vs reproducers) — division of labour as the
  unlock, not better generalists.
- **Predictive coding theories (2112.10048) + active PC (2210.13461).**
  Rao-Ballard hierarchy (top-down predictions, bottom-up errors);
  hierarchical world models + compositional representations + planning.
  → Organizes our surprise machinery hierarchically (cue-level vs
  value-level errors); reinforces dream-model evaluation.
- **SEDRo (2009.01810).** Developmental test battery (fetus→12mo) as
  evaluation. → Evaluate developmental PROGRESSION (our A/B/C/return-A as
  a crude battery), not just endpoints.
- **Honest misses (disclosed, NOT cited):** 1803.08829 fetched as comets,
  not symbol emergence (search-index collision — dropped); IB-control
  query duplicated round-5 hits (no new content).

## Round 11 — dream-model limits, canalization, embodiment scaling

- **MuZero interpretability (2306.00840, 2411.04580).** Value-equivalent
  models (not reconstruction); dynamics degrade over long sims but
  planning corrects errors; better latents in board games than Atari. →
  Recipe for dream-model evaluation: value-equivalent, SHORT horizon +
  replan, don't trust long rollouts. Direct implementable constraints.
- **Morphological computation vs integrated info (2108.00904).**
  ANTAGONISTIC: more body-computation → less brain-integration needed.
  → Formal backing for simple controllers: our greedy threshold exploits
  body+ecology computation; learned weights add integration load without
  proportional gain. Keep brains simple ON PURPOSE.
- **Embodiment scaling (2505.05753).** 1000 embodiments; cross-embodiment
  generalization beats data scaling; morphology co-design. → Redesigns
  VISION M4: train ACROSS many bodies, not transfer once to P/Q. Our
  body-transfer line tested the weak version.
- **Canalizing networks (q-bio/0701025, 1902.00056, 1101.1893, CANA).**
  Fitness = attractor robustness → global max always reachable, huge
  neutral spaces; canalizing depth controls attractor counts/basins;
  modular RBNs nearer criticality with more attractors. → Lens on frozen
  behavior: V1d stampede = HIGH canalization (one attractor); CANA
  tooling exists for measuring it. New runs could map policy attractors
  per arm — a repurposing of the WHAT-RETAINS line with teeth.

## Round 12 — scalable dreams, reachability-free exploration, in-silico transitions

- **DreamerV2 (2010.02193) + DayDreamer (2206.14176) + Dreamer 4
  (2509.24527).** Behaviors learned PURELY in imagination (discrete
  latents); human-level Atari; real-robot learning without resets in 1
  hour; Minecraft diamonds from offline data. → Dream-model evaluation is
  sufficient for policy learning, not just ranking — and works from
  offline data (our frozen archives ARE offline data). Concrete path:
  train a latent world model on frozen trajectories, evaluate/shape
  candidates inside it, zero new worlds for the model build.
- **WorldGym (2506.00613).** Policies evaluated by Monte Carlo rollouts IN
  the world model; rankings preserved vs real. → THE evaluation protocol
  for our eval problem: keep the frozen one-at-a-time live eval for GO
  verdicts, but use dream-rollouts for SEARCH (propose in the dream, prove
  live). Directly answers V1b's eval bottleneck without live cost.
- **RND (1810.12894) + anti-exploration (2301.13616).** Reachability-free
  novelty bonus (prediction error vs fixed random target); SOTA hard
  exploration. Anti-RND: penalize OOD for offline RL (novelty AVOIDANCE).
  → Both directions now on the table: seek novelty where safe
  (reachability-gated), avoid it where lethal. Our agents die exploring —
  the anti-exploration half may matter more here than exploration.
- **In-silico transitions (1403.3217).** Virtual cells/groups evolving
  complex interactions beyond isolated entities; models as windows on the
  possible AND the actual. → Methodological license: our whole program IS
  this — but the paper reminds us to explore the POSSIBLE (counterfactual
  ecologies/morphologies), not just replay the actual BT world.

## Round 13 — canalization math that runs without simulation, death as group adaptation

- **Canalization and robustness without simulation (1607.04474).**
  c-sensitivity generalizes Derrida values to canalizing functions;
  robustness computable WITHOUT running the network. → Upgrades the
  Round-12 CANA lens from tooling to arithmetic: score frozen policies'
  robustness analytically instead of sampling trajectories. (Still needs
  archived weights — instrumentation gap stands, now precisely specified:
  archive per-agent weights at phase boundaries.)
- **Canalizing dynamics: fewer, bigger basins (1904.00056).** Higher
  canalizing depth → fewer attractors, smaller attractors, LARGER basins
  (explicit formulas). → Testable prediction for our lines: the more
  canalized the policy (V1d stampede = extreme), the larger its basin
  (harder to knock out of it — explains transfer stickiness AND rigidity).
  Selection implication: canalize the robust core, keep the periphery
  flexible. Design rule for future architectures: canalizing core +
  plastic periphery, not uniform plasticity.
- **Geometry of programmed death (1403.7556).** Programmed cell death
  enables group reproduction via snowflake geometry; death is adaptive AT
  THE GROUP LEVEL while costly individually. → Reframes our mortality:
  what if deaths are load-bearing for collective dynamics (clearing
  space? resetting patches)? Before assuming death = failure, check
  whether survivor-only lineages outperform — a frozen-data question
  (compare survivors' descendants... requires lineage tracking we lack).
  Noted as instrumentation requirement, not a claim.
- **Process note (anti-duplication rule).** Rounds 10–12 re-fetched
  already-mapped papers (Dreamer set, RND, in-silico transitions now
  appear in two rounds' worth of fetches). Rule going forward: grep the
  map for each candidate ID BEFORE fetching abstracts; fetch only
  unmapped IDs. This round followed it (3 fetched, 9 skipped as
  duplicates).

## Round 14 — free-energy foundations, bottlenecks, randomization-transfer, reservoirs, niche memory, affordances, predictive maps, basal computation

Outside-the-box round: the frameworks UNDERNEATH our existing pieces
(FEP behind AIF-DDM/FEH; IB behind capacity talk; randomization behind
codebook shuffles; replay's computational meaning; aneural computation).

- **FEP core monograph (1906.10184).** Friston's "a free energy principle
  for a particular physics": Markov blankets compose ensembles across
  spatiotemporal scales; Bayesian mechanics for autonomous things. →
  Our agents ARE particulars (sensorimotor blanket = the agent/ecology
  cut VISION needs formalized). Positions FEH (greedy beats deliberation)
  as an FEP agent with imprecise beliefs — the divergence point between
  the two is now statable: which variational objective survives explicit
  energy billing? Licensed: formulate greedy-0.5 AS an FEP agent and find
  where predictions differ (design work, zero worlds).
- **FEP technical underpinning (2002.04501).** Reply to Biehl et al:
  solenoidal coupling in sparsely-coupled blanket systems; exact vs
  approximate Bayesian inference. → Our replay does exact bookkeeping on
  approximate states — this paper names that regime. The blanket
  formalism gives language for founder-vs-ecology separation (substrate
  language for VISION milestone 4).
- **Information bottleneck, original (physics/0004057).** Tishby: relevant
  information = what signal x carries about y; squeeze through a limited
  code. → Our taste policy (3 floats!) is an extreme bottleneck; IB is the
  principled measure of what those numbers must carry. Licensed: compute
  I(weights; future intake) on FROZEN rows (read-only, zero worlds) as a
  capacity diagnostic — are 3 floats sufficient or saturated?
- **Deep IB (1503.02406).** Layer-wise input/output information; optimal
  architecture/width from IB bifurcations; generalization bounds. →
  Bifurcations predict PHASE CHANGES in optimal capacity. Hypothesis-only
  lens on the V1d stampede (47/48 simultaneous adopts): over-capacity
  collapse at a bifurcation, not just saturation.
- **Domain randomization (1703.06907).** Tobin et al.: train on randomized
  sim; the real world appears as just another variation; 1.5cm real-world
  detection from sim only. → Our per-history codebook shuffle IS domain
  randomization over valence assignments; V1b/V1c transfer = sim-to-real
  where "real" = held-out randomization. Validates the shuffle design
  from the transfer literature's standard trick; V1c tests whether
  randomization-trained policies transfer.
- **Reservoir forecasting + generalized synchronization (2102.08930).**
  Pre-training GS test guides reservoir hyperparameters; Lyapunov-exponent
  reproduction as "well trained" metric. → Fixed random reservoir +
  trained readout rhymes with our tiny-weight + replay architecture.
  Licensed: a GS-style pre-training test for BT_LEARNER_OPTIONS — a
  principled alternative to frozen-by-convention hyperparameters.
- **Outsourcing memory through niche construction (2209.00476).** Lee:
  universal scaling law for optimal memory duration from memory precision
  × environmental rate (remembering-vs-forgetting trade-off). → Our replay
  window (recent/older buffers, 4 passes) is a memory-duration choice the
  law can judge. Licensed: measure codebook volatility vs retention on
  frozen rows (read-only) — are we over- or under-remembering?
- **Niche-construction dynamics (2305.09369).** Nisioti: NC in adaptable
  populations across diverse niches; evolution usually ignores the
  reciprocal environment-modification loop. → Our MATE line is adaptable
  populations + diverse histories WITHOUT the NC loop closed (food
  depletes = modification, but is it inheritable change?). Licensed:
  check whether depletion patterns constitute NC in our ecology
  (read-only row analysis, zero worlds).
- **SAVOR skill affordances (2506.02353).** Skill affordances from
  visuo-haptic perception for FOOD ACQUISITION under temporal variability
  (steak firms as it cools). → Our turn-gating IS a skill affordance
  (turn-suitability of a cue-context) in our exact domain with the same
  nonstationarity. Gives V1/V1b a name + literature; no new claim.
- **Hippocampus as successor representation (2006.11975).** Predictive map
  theory: TD value decomposes into reward × expected state occupancy;
  CA1 firing = transition probability. → Names what our replayPasses=4
  COMPUTE: multi-step backup ≈ SR construction. Instrumentation note
  (third occurrence): we don't archive replay buffers/SR — needed for any
  SR diagnostic (cf. rounds 12, 13).
- **Bioelectric algorithms (1809.10046).** TCS applied to developmental
  bioelectricity: computation in voltage patterns, aneural. → The
  arXiv-available Levin-adjacent work; positions our aneural 3-float
  controllers in the basal-cognition spectrum (Levin proper is
  journal-side, noted not mapped).
- **Scope note (honest misses).** Searched but unmapped (journal-side or
  noise): Levin proper (no arXiv presence), Still thermodynamics-of-
  prediction (no arXiv hit under multiple queries), somatic/neural-
  Darwinism formalizations (noise), autopoiesis-artificial (noise),
  echo-state-as-such (noise; reservoir covered instead), bio-sleep
  consolidation (noise; PER/HER/CLS stand), herding/information cascades
  (noise; quorum/recruitment-cascade coverage stands), Kuramoto sync
  (deferred — our stampede is common-shock, not coupled oscillation).

## Round 15 — meta-learning cores, body variation, group selection, finite populations, degeneracy

Load-bearing adjacent (gradient meta-learners we must position against)
plus far-field (assortment, punishment, finiteness, degeneracy). One
candidate (1910.06933, MLS assortment) caught by the anti-duplication
grep — already mapped, dropped. Rule working as intended.

- **MAML (1703.03400).** Finn: parameters explicitly trained so a few
  gradient steps generalize to new tasks. → Our V1c transfer IS few-shot
  adaptation (1792 ticks on a held-out codebook) with NO gradients and NO
  outer loop — zeroth-order in-agent meta-learning. The comparison that
  matters (future line, not claim): sample-efficiency of carried-weights
  vs MAML-style initializations on the same transfer task.
- **RL² (1611.02779).** Duan: slow RL learns a fast RL algorithm encoded
  in RNN weights. → Our architecture inverted: FIXED update rule
  (taste/actor critics), LEARNED weights. The RSI endgame — learning the
  update rule itself — is RL²'s setup with evolution as the slow loop.
  Frame V1b–V1d as characterizing the fast loop before attempting to
  learn it (slow/fast split made explicit).
- **Morphological variation in ER (2208.02809).** Carvalho: expose
  controllers to morphological/sensor variation for robustness and
  reality-gap crossing; method for choosing variation ranges. →
  Variation-exposure = our shuffle logic applied to bodies/sensors.
  Licensed (read-only, zero worlds): apply their range analysis to our
  flip-count vs transfer data across frozen V1b–V1d rows — is the tax
  proportional to variation distance?
- **Morpho-evolution with learning (2411.18423).** Le Goff: co-generate
  robot designs + controllers via EAs with intrinsic motivation. →
  Body+controller co-design on the Vision trajectory (milestone 4
  substrate + qualifier). Direction noted, no plan.
- **Altruistic punishment + cultural MLS (2405.18419).** Cooney: punishment
  and group competition in CONCERT promote cooperation where neither
  suffices alone (Boyd/Gintis/Bowles/Richerson formalized). → Costly
  mechanisms that stabilize cooperation — design vocabulary for the
  courtship/recruitment channel (currently mechanism-free). With the
  mapped 1910.06933 (assortment×group selection): structure + incentives,
  both formalized, both unbuilt.
- **Cooperation on networks (1003.0088).** Konno: b/c > ⟨knn⟩ (not ⟨k⟩);
  regular graphs favor cooperation most. → Our encounter problem is
  STRUCTURAL (0.05–0.15/main, P(0)~60%): who meets whom, how often.
  Density was tried (MATE-DENSE backfired via energy); STRUCTURE ≠
  density — assortment/topology is the untried axis. Licensed: assortative
  encounter structures as a future mating-line knob.
- **Finite populations destroy waves (2006.00397).** Griffin: finite
  spatial replicator qualitatively differs from infinite (traveling waves
  destroyed); fluid limit justifies diffusion terms. → Formal sibling for
  our drift-barrier note: N=24 finite-size effects aren't just noise,
  they're REGIME changes. Caution on all population-line interpretations;
  infinite-population intuitions do not transfer.
- **Degeneracy (0907.0510).** Whitacre: degeneracy (many-to-one
  genotype→phenotype) builds neutral networks that ENABLE evolvability;
  design principles decide whether robustness leads there. → Our
  12-cue→binary-turn mapping is degenerate; same-val retention (0.95)
  may ride neutral ridges while flips fall off them. Hypothesis-only
  (needs genotype sampling we lack).
- **Instrumentation demand (4th occurrence).** Rounds 12–14 plus this one
  converge: archive per-agent weights (and replay buffers) at phase
  boundaries. IB capacity, SR diagnostics, neutral-ridge analysis, GS
  hyperparameter tests ALL need them. Stated once, firmly: the next
  instrument that doesn't archive weights must justify the omission.
- **Scope-note misses.** Hamilton/inclusive-fitness, Zahavi/costly
  signaling, Waddington/assimilation, Gigerenzer/ecological-rationality
  (concept already ours via FEH), Still thermo-of-prediction, herd
  behavior, bio-sleep, autopoiesis, echo-state — journal-side or noise.

## Round 16 — learnability of foraging, rational inattention, sparse collectives, choice redundancy, morphological computation

Two more duplicates caught by the grep (2004.10671 normative patch
foraging + 1802.10546 curiosity survey — both already mapped with entries
covering the intended points). Dropped before fetching. Rule working.

- **Patch foraging in deep RL (2210.08085).** Wispinski: patch foraging
  has a KNOWN optimal solution yet is hard to discover with current deep
  RL; first demonstration that ML agents CAN learn it. → The mapped
  normative theory (2004.10671) says what optimal IS; this says learning
  it is HARD. Our agents face the same task with 3-float policies and 4
  replay passes — the learnability gap (optimal vs learnable) is now the
  right frame for the foraging line, not optimality alone. Licensed:
  compare our policies' residence times against MVT on frozen rows
  (read-only, zero worlds) — are they optimal, satisficing, or stuck?
- **Revealed RI + revealed preference (2106.14486).** Pattanayak:
  equivalence map between rational-inattention tests and classical
  revealed preference (payoff monotonicity unifies both). → Foundations:
  information-acquisition rationality and utility maximization are the
  SAME test under the map. Our FEH result (greedy beats deliberation)
  can be stated in either language — pick the one that makes the
  sharpest prediction for the next line.
- **Robust RI games (2306.09964).** Denti: flexible information
  acquisition REDUCES welfare vs predetermined information, yet the two
  regimes are behaviorally INDISTINGUISHABLE in most environments. →
  Direct formal sibling of FEH: deliberation costs welfare while matching
  behavior — exactly our greedy-0.5 finding (simpler wins, same
  outcomes). The welfare gap without a behavioral gap explains WHY
  selection favors the cheaper rule. Cite as the mechanism behind the
  theorem, not just an analogy.
- **Sparse-neighborhood collective motion (2404.18675).** Haghsheno:
  multiplicative-noise Vicsek variant with MORE individual movement in
  sparsely populated neighborhoods; built for the low-velocity,
  low-density regime. → Our encounter regime (0.05–0.15/main, P(0)~60%)
  IS the sparse neighborhood. The model's density-dependent individuality
  (lonely particles move differently) is a testable alternative to our
  diffusion estimate: do our flies' encounter rates follow the sparse
  correction? Licensed: refit the encounter estimate with the sparse
  term (read-only, zero worlds).
- **Female choice under conflict (1807.09131).** Li: choice depletes
  variance and can go redundant; fit males sire unfit daughters under
  GxE/sexual antagonism. → Echoes our exact-copy NOGO from the choice
  side: transmission without variation leaves nothing to choose AND
  nothing to gain — choice redundancy is the same null from the other
  direction. Strengthens the case that the mating line needs inherited
  VARIATION first (mutation+lineage), not better choice protocols.
- **Quantifying morphological computation (1503.05113).** Ghazi-Zahedi:
  information decomposition of the sensorimotor loop measuring how much
  body+environment contribute to behavior. → The missing measure for
  Vision milestone 4 / BODY_TRANSFER: transfer failure (V2 FAIL-body)
  vs transfer success (TURN-GATE) can be stated as morphological
  computation NOT vs DOES transfer. Licensed: compute the decomposition
  on frozen body-transfer rows (read-only) — is the learned policy in
  the weights or in the body-environment loop?
- **Scope-note misses.** Charnov MVT original, Gigerenzer ecological
  rationality, Stearns life-history, Trivers parental investment,
  Der homeokinesis proper, Still thermo-of-prediction — journal-side or
  noise. Bio-sleep, herd, autopoiesis, echo-state remain unmapped
  (standing).

## Round 17 — information structure, delayed generalization, capacity minimality, dreams as regularization, macroscales

One duplicate caught pre-fetch (1810.02274 episodic curiosity — mapped
with a covering entry). Rule working.

- **PID, original (1004.2515).** Williams & Beer: redundancy as minimum
  information any source provides per outcome; lattice over source sets
  (redundant/unique/synergistic). → The missing lens on our cue
  codebooks: are the 12 cues redundant (same message 12 ways),
  synergistic (meaning only in combination), or unique? Flip effects
  should differ by PID component — a flipped redundant cue is backed up,
  a flipped synergistic cue breaks the combination. Licensed: PID of the
  codebook vs transfer correctness on frozen rows (read-only, zero
  worlds) — predicts WHICH cues resist extinction before running a
  world. Directly serves the floor-attribution follow-up.
- **Grokking (2201.02177).** Power et al.: flat memorization then SUDDEN
  perfect generalization, well past overfitting; smaller datasets need
  more optimization. → The learning-dynamics contrast case for our
  saturating curve (fast-then-flat vs flat-then-jump). Our agents never
  grok flipped cues (no late jumps through seg4) — why not? Hypothesis:
  grokking needs overparameterized memorization capacity first; our
  3-float policies cannot memorize, so there is nothing to grok FROM.
  Testable reading: capacity floor, not data floor. Note as lens, not
  claim.
- **Lottery ticket (1803.03635).** Frankle & Carbin: dense nets contain
  sparse trainable subnetworks (winning tickets) findable by pruning. →
  Capacity-minimality sibling for IB (Round 14) and degeneracy (Round
  15): are our tiny policies minimal, or do they contain dead weight?
  Licensed: magnitude-prune frozen policies (read-only, zero worlds) and
  test whether transfer survives — if yes, the policy is redundant and
  the floor may live in the redundant part.
- **Overfitted brain (2007.09560).** Hoel: dreams evolved to assist
  generalization (anti-overfitting via corrupted/noisy replay). →
  Dream-thread upgrade (Rounds 11–12: Dreamer/WorldGym as evaluators):
  dreams are not just simulators but REGULARIZERS. Our replay (4
  passes/observe, exact replays) is the opposite of corrupted — it may
  OVERFIT the train codebook, which would explain rigidity on flipped
  cues. Licensed: noisy-replay variant as a V1h+ candidate (explicitly
  behind surprise-gating in the queue, not a new line now).
- **Macroscale search (1908.07565).** Griebenow: finding the most
  informative macroscale of a network (spectral clustering over the
  exponential scale space). → Operationalizes the Hoel program (causal
  emergence) that the map cites but never uses: which level of our
  system carries the transfer effect — weights, cue-behavior mappings,
  or lineage statistics? The V1b–V1e verdicts live at the behavioral
  level (gaps); the weights level is unarchived (instrumentation gap,
  6th occurrence). Licensed: when weights ARE archived, the macroscale
  test is which level predicts transfer — until then, stated as the
  question, not answered.
- **Scope-note misses.** Krakauer individuality, Ay predictive
  information, Caraco risk-sensitive foraging, Hamilton inclusive
  fitness, Zahavi signaling, Waddington assimilation, Stearns life
  history — journal-side or noise. Hoel proper enters via the dreams
  paper, not the monograph.

## Round 18 — planning as inference, progressive retention, small-population genetics

One duplicate caught pre-write (1706.02556 surprise search — already
mapped with a covering entry that anticipates the surprise-machinery
point). Rule working (5th catch).

- **Control as inference (1805.00909).** Levine: RL/optimal control
  reformulated as probabilistic inference (tutorial + review). → The
  framework that states WHEN greedy is optimal: planning-as-inference
  with exact posteriors vs approximations. Our FEH result (greedy 0.5
  wins under uncertain precision) is an instance — the tutorial gives
  the conditions to check rather than re-derive. Licensed: write our
  turn policy as the inference it approximates and name the gap
  (design note, zero worlds).
- **Progressive networks (1606.04671).** Rusu et al.: freeze old columns,
  add new ones with lateral connections — immune to forgetting, transfer
  via reuse. → The architecture our transplant ALREADY resembles
  (frozen train weights transplanted into a fresh agent that keeps
  learning). The difference: progressive nets GROW columns; we OVERWRITE
  one set. The design space between them (freeze + transplant + grow?)
  is now statable. Licensed: a freeze-plus-grow variant as a future
  retention architecture (not a line yet).
- **Muller's ratchet rate (1206.6782).** Neher: the fittest class is lost
  by rare fluctuations; quantitative rate of the clicks. → Small-population
  genetics for our N=24 lines: asexual founders accumulate load by
  fluctuation, not just selection. Formalizes WHY the mating track
  matters beyond encounters — recombination is the ratchet escape.
  Licensed: track fittest-class loss across generations in the mating
  line once inherited variation exists (measurement spec, not started).
- **Small-noise ratchet (2606.15842).** Heinzel: Fleming-Viot SDE
  approximation with explicit fluctuation-size parameter. → The
  quantitative regime complement to Neher: WHEN does the ratchet click
  fast vs slow as a function of fluctuation size? Our founders are few
  and noisy — this is the parameter regime that decides whether a
  lineage degrades within our experimental horizons. Same license as
  above (one measurement spec, two papers).
- **Scope-note misses.** Der homeokinesis proper, Ay predictive
  information, GARD compositional inheritance, Waddington assimilation,
  Stearns life history, Hamilton inclusive fitness, Zahavi signaling —
  journal-side or noise. Surprise search correctly excluded (mapped).

## Round 19 — islands, drift in subdivisions, genotype-phenotype navigability, NK ruggedness

No duplications (all IDs grepped clean, including substring variants).
Rate-limit lesson institutionalized: verify HTTP status per batch, pipe
instead of temp files (MSYS/Windows temp mismatch), back off on 429
rather than retry-looping.

- **Dynamic island model (1801.01620).** Meng: spectral-clustering
  islands with migration policies to preserve diversity against
  convergence. → Our 6 histories ARE islands with ZERO migration. The
  paper supplies the missing piece as design space, not prescription:
  what migration topology/rate would connect our lineages without
  collapsing their divergence? Licensed: island-with-migration as a
  future mating-line topology (unblocks lineage mixing without
  panmixia).
- **Neutral drift in subdivided populations (q-bio/0606037).** Blythe:
  fixation probabilities/times under drift in subdivided populations;
  general formula via forwards-backwards duality; language change obeys
  the same math as biology. → Two gifts: (1) fixation-time SCALING with
  subpopulation count — how long a lineage needs to be observed before
  drift-vs-selection is adjudicable (our N=24, 6-island design sits
  inside this formalism); (2) the language parallel licenses treating
  our transmitted weights as utterances (cultural-evolution math
  applies directly to maternal copying). Licensed: compute expected
  fixation times for our bank geometry (read-only, zero worlds).
- **Phenotype-size distributions (1702.00351).** Manrubia: navigability
  requires astronomically large genotype networks (same phenotype,
  drift-connected); exhaustive counts for RNA/protein. → Our policies
  are 3-float + tiny actor/critic maps — is the neutral network around
  a working policy large enough to drift on, or is every step lethal?
  This decides whether mutation (V1b's σ=0.05) explores or breaks.
  Licensed: neutral-neighborhood sampling of frozen V1 weights
  (read-only perturbation analysis, zero worlds) — measure the fraction
  of ±σ neighbors that preserve transfer performance.
- **Muddling through NK landscapes (2006.08333).** Chanda: under high
  complexity (pervasive interdependence), cluster-local moves beat
  global search; more clusters → better. → Small mutations are
  cluster-local moves; our σ=0.05 is muddling, not jumping. Predicts
  V1b's outcome shape: gradual improvement where the landscape is
  locally smooth, stalls where epistasis is dense. The floor-attribution
  follow-up (which cues resist) can now be framed as epistatic-density
  mapping.
- **NK fitness landscape, K/N→α regime (2508.12464).** Chen: statistical
  physics of the Kauffman model at proportional epistasis. → The formal
  sibling: as K/N grows, the landscape undergoes phase change to
  uncorrelated ruggedness (no gradient to follow). Our cue codebooks
  (12 cues × 4 bits interacting through one policy) sit somewhere on
  this axis — unknown where. Licensed: estimate effective K/N from
  frozen cue-ablation rows (read-only); if high, expect V1b's
  single-step mutations to stall (needs recombination, not point
  mutation — back to the mating line's deepest question).
- **Scope-note misses.** DeWitt costs-of-plasticity, Ay predictive
  information, GARD compositional inheritance, Waddington assimilation,
  Stearns life history, Hamilton inclusive fitness, Zahavi signaling,
  Der homeokinesis — journal-side or noise. EES proper unmapped (no
  arXiv presence under multiple queries).

## Round 20 — continual learning canon, meta-learning first-order, population-based training, learned optimizers, QD via CMA-ES

No new tools needed: `id_list` batch-verifies known papers in one call.
Anti-duplication: full-ID greps (substring "04474" hit is the round-13
canalization paper 1607.04474, not the LSTM optimizer 1606.04474).

- **Dark Experience Replay (2004.07211).** Buzzega: rehearsal + knowledge
  distillation on buffered logits, no task boundaries (general
  continual learning). → Our replay is rehearsal WITHOUT distillation.
  DER's prescription is precise: match old OUTPUTS on replayed inputs,
  not just replay inputs. Licensed V1h-alternative: "dark" replay
  (distill) vs implemented noisy replay (corrupt) — two distinct
  anti-overfitting operators, testable head-to-head on a fresh bank.
- **GEM (1706.08840).** Lopez-Paz: episodic memory with gradient
  constraints + forward/backward TRANSFER metrics. → We have phases
  (A/B/C) and no transfer metrics. Licensed: compute GEM-style
  forward/backward transfer on frozen phase rows (read-only, zero
  worlds) — are the V1 phases helping or hurting each other?
- **Reptile (1803.02999).** Nichol: first-order meta-learning —
  initializations that fine-tune fast. → Our transplanted weights ARE
  initializations; the V1b–V1e transfer gaps ARE Reptile's objective
  (post-adaptation performance). Reframes the whole transfer line as a
  meta-learning evaluation, with Reptile's update as a candidate
  improvement over checkpoint-carryover (move toward fast-adapting
  weights, not just trained weights).
- **PBT (1711.09846).** Jaderberg: population + hyperparameters jointly
  optimized; exploit (copy better members' weights) + explore (mutate
  hyperparameters). → This is our mating/inheritance line in ML form:
  V1's exact copy = exploit WITHOUT explore; V1b's mutated copy = full
  exploit+explore on WEIGHTS (ours) rather than hyperparameters
  (theirs). Licensed reading of V1b as a 2-member PBT run — and the
  obvious V1c+: periodic copying from the better arm (full PBT loop,
  not just parallel arms).
- **Learned optimizers (1606.04474).** Andrychowicz: LSTMs AS optimizers,
  learned by gradient descent, beating hand-designed ones on-task and
  generalizing. → The RSI endgame at optimizer level (RL² was
  algorithm-level, round 15). Positions V1g's surprise-gating as one
  hand-designed optimizer component; the learned-optimizer path would
  discover the gating (or better) automatically. Thesis-level framing,
  not a line.
- **CMA-ME (1912.02400).** Fontaine: QD via CMA-ES emitters — rapid
  illumination of continuous behavior spaces. → Direct upgrade path
  for the licensed-but-undesigned QD archive: CMA-ME over
  cue-response-profile space instead of MAP-Elites. Noted as the
  implementation choice when the archive line freezes.
- **Scope-note misses.** Population-genetics on arXiv is thin (island/
  fixation/soft-sweep/assortment queries all noise); the field lives in
  journals — future mapping there needs a different discipline (reviews
  or textbooks, not live arXiv). Same for EES proper, Der homeokinesis,
  GARD, Waddington, Stearns, Hamilton, Zahavi.

## Round 21 — associative learning canon I: prediction error, blocking, attention, comparison

New discipline (answers round 20's scope-note): OpenAlex live API for
journals/books/arXiv-alien classics. Two-pass: relevance-ranked search,
then exact-title second pass; books/chapters with no OpenAlex record are
cited [canon] with full biblio; critiques preserved where found. The
classics reframe our floor in one move: our tasteUpdate IS a delta rule,
our transfer IS a devaluation test, our gain IS Pearce-Hall.

- **Rescorla & Wagner 1972 [canon].** "A theory of Pavlovian
  conditioning." In Black & Prokasy (Eds.), Classical Conditioning II
  (Appleton-Century-Crofts). The delta rule: associative change =
  salience × (outcome − expectation). → Our tasteUpdate is Rescorla-
  Wagner on 96-dim phi. Fifty years of RW boundary conditions now apply
  to us wholesale — blocking and overshadowing below are not bugs but
  PREDICTED phenomena of our architecture. Supporting records: "Equilibria
  of the Rescorla-Wagner model" (2003, 200 cites, formal analysis) +
  "The widespread influence of the Rescorla-Wagner model" (1996 review).
- **Kamin 1967/69.** "Predictability, surprise, attention, and
  conditioning" (symposium vol., 1485 cites). BLOCKING: prior training
  of A blocks learning about redundant B in AB compounds. → TOP MOVE:
  per-channel frozen-weights overshadowing test (zero worlds, NEW data
  source — rows carry full taste/actor vectors per agent). Map phi dims
  to cue bits; the prediction is sharp: error concentrates on cues whose
  flipped bit sits in a low-|weight| channel (learning was blocked by a
  more salient channel in train). Elemental interference, not rigidity.
- **Mackintosh 1975 [canon].** "A theory of attention" (Psych Rev).
  Associability tracks PREDICTIVENESS (good predictors gain attention,
  poor ones lose it) — fixed by history, changes slowly. → The anti-gain
  theory: flipped cues lost associability in train and cannot regain it
  fast. Decides the next intervention: if Mackintosh holds, we need an
  ASSOCIABILITY-RESET line; if Pearce-Hall holds, keep the gain.
  Supporting: "Toward a Unified Model of Attention" (2001, 309 cites).
- **Pearce & Hall 1980 [canon].** "A model for Pavlovian learning"
  (Psych Rev). Associability tracks SURPRISE/novelty (uncertain outcomes
  command processing). → We REDISCOVERED Pearce-Hall without knowing it:
  surprise-gating (V1f–V1i) IS associability ∝ surprise. Frames the
  deployed instrument as independent validation of a 45-year-old theory
  and licenses PH's further predictions (e.g., associability should fall
  as test becomes predictable — check gain-firing decay across segments,
  read-only). Supporting: PALMS simulator (2026, executable RW/PH models
  — could cross-check our learner against analytic RW, zero worlds).
- **Miller & Matzel 1988 [canon].** "The comparator hypothesis"
  (Psych Learn Motiv 22). Performance = comparison among associations,
  not readout of one — the learning-vs-performance distinction,
  formalized 1988. → This IS our critic-vs-actor split with 40 years of
  precedent: values can be correct while behavior is wrong (comparator
  output), exactly the BH actor-side hypothesis. Strengthens the
  specified per-cue-values test. Supporting: "Overshadowing and latent
  inhibition counteract each other" (1998, 83 cites, comparator
  support) + "Local context and the comparator hypothesis" (1993).
- **Pearce 1987 [canon].** "A model for stimulus generalization"
  (Psych Rev). Configural theory: compounds act as wholes, generalization
  by similarity. → Our linear learner is ELEMENTAL by construction
  (sums phi features); Pearce gives the rival ontology. If the
  overshadowing test (Kamin bullet) comes back positive, elemental wins
  and the fix is channel reweighting; if negative, configural
  (unique-cue) coding becomes the licensed architecture change.
  Supporting: "Summation: assessment of a configural theory" (1997) +
  "connectionist theory of configural" (2002, 228 cites).
- **Scope-note misses.** Wagner SOP (1981) unqueried (standard operating
  procedures — memory-prime theory, would refine the replay-timing
  question); Couvillon/Bitterman insect-learning canon unmapped.

## Round 22 — extinction canon: context, inhibition, reconsolidation, pre-exposure, spacing

Extinction is not unlearning — a century of evidence the program has been
rederiving. Every bullet converts a floor observation into a textbook
phenomenon with a prescribed manipulation.

- **Bouton 2004.** "Context and behavioral processes in extinction"
  (Learn Mem, 1808 cites; record title has an OpenAlex ": Table 1"
  artifact). Extinction is CONTEXT-GATED and fragile (renewal,
  reinstatement, spontaneous recovery); the original memory is never
  erased. → The transfer floor is EXPECTED under Bouton: test
  performance = competition between train and test memories, and the
  "tax" is retrieval failure, not learning failure. Prediction ready
  to check read-only: return-to-train segments should RESTORE old
  behavior (renewal) — V1d/V1e seg structures may already contain it.
  Supporting: Bouton 2006 "Contextual and temporal modulation" (671).
- **Craske et al. 2014.** "Maximizing exposure therapy: an inhibitory
  learning approach" (Behav Res Ther, 2337 cites). Extinction = NEW
  inhibitory learning that competes at retrieval; optimize it by
  maximizing mismatch (expectancy violation), varying context, dropping
  safety signals. → Our gain maximizes mismatch (expectancy violation
  by construction) — Craske validates the instrument AND prescribes
  the next knobs: context variation during seg1 and safety-signal
  removal. Clinical-to-ecology translation precedent.
- **Nader, Schafe & LeDoux 2000.** "Fear memories require protein
  synthesis in the amygdala for reconsolidation after retrieval"
  (Nature, 2706 cites). Retrieved memories go LABILE and must
  reconsolidate; blockade in the window erases. → Our replay
  REACTIVATES train associations continuously — reconsolidation theory
  says each reactivation opens a plasticity window our live+replay mix
  may already exploit, and a replay-SUPPRESSION window post-reactivation
  is the control experiment that proves it (future line, cheap: gate
  replay off for N ticks after large-error contacts).
- **Lubow 1973/76.** Latent inhibition + conditioned attention theory
  (book; "Latent inhibition and conditioned attention theory" 1976,
  732 cites). Pre-exposure to a stimulus RETARDS subsequent conditioning
  to it. → Novel read-only prediction: flip difficulty ∝ train-phase
  contacts per cue (pre-exposure magnitude). Correlate train contacts
  with seg1 correctness on frozen rows — if LI holds, the floor is
  partly train-inflicted and train-duration becomes a knob.
- **Quirk et al. 2000.** "The role of ventromedial prefrontal cortex
  in the recovery of extinguished fear" (J Neurosci, 957 cites).
  Extinction has its OWN circuit (infralimbic), dissociable from the
  fear circuit. → Anatomical precedent for actor-side: separate
  extinction machinery that can fail while values are intact. If our
  per-cue-values test localizes actor-side, Quirk is the biological
  twin (IL ≈ actor-side plasticity locus).
- **Urcelay, Wheeler & Miller 2009.** "Spacing extinction trials
  alleviates renewal and spontaneous recovery" (97 cites). Massed
  extinction is fragile; spaced persists. → FREE manipulation for a
  future line: redistribute the same seg1 ticks (spaced encounters)
  instead of adding ticks — tests whether the floor is a scheduling
  artifact at zero extra world-cost.
- **Scope-note misses.** Bouton 1993/2002 ambiguity papers (context
  canon statements, no clean record hit); Hermans evaluative-conditioning
  renewal (2019 reinstatement record seen, marginal).

## Round 23 — habit vs goal-directed, devaluation, arbitration, signal detection

The round that renames our floor: a transfer test with flipped valences
IS an outcome-devaluation test, and devaluation-insensitivity IS habit —
by the field's own operational definition since 1981.

- **Adams & Dickinson 1981 [canon].** "Instrumental responding
  following reinforcer devaluation" (QJ Exp Psych 33B:109–121). The
  paradigm: train action→outcome, DEVALUE the outcome, test in
  extinction. Insensitivity = habit (S–R); sensitivity = goal-directed
  (A–O). → Our BH condition (train-benign → test-harmful) is LITERALLY
  devaluation, and 80% cruising is devaluation-INSENSITIVITY: the BH
  floor is habitual control by definition. One sentence reframes three
  turns of forensics — and the prescription is the field's: shift the
  MB/MF balance (Daw bullet), don't just amplify errors.
- **Dickinson & Balleine 1994.** "Motivational control of goal-directed
  action" (Anim Learn Behav, 1005 cites). Canonical A–O vs S–R
  statement (contingency + value knowledge). → Checklist for our agents:
  contingency knowledge (do turn rates track cue validity? yes, 0.81) vs
  value updating (BH: no). Failure localizes to the VALUE arm —
  converges with the actor-side hypothesis from a second tradition.
  Supporting: "goal-directed account of action slips" (2022 — "reliance
  on old contingencies" = our carried policy, in humans).
- **Daw, Niv & Dayan 2005.** "Uncertainty-based competition between
  prefrontal and dorsolateral striatal systems" (Nat Neurosci, 2533
  cites). Model-based/model-free ARBITRATION by uncertainty. → The
  missing instrument in our architecture: we have no arbitrator (cruise
  default + greedy threshold). A future line gets its design here —
  uncertainty-gated switching between carried policy and live values,
  with Daw's uncertainty signatures as the readout checklist.
- **Tolman 1948 [canon].** "Cognitive maps in rats and men" (Psych
  Rev 55:189–208). Latent learning: maps form without reinforcement.
  → Model-based lineage head for the dream-model project (maps learned
  off-line, used on-line) — ancestry, not a line. Supporting modern
  commentary records exist ("Re-Charting," 2024) but the original has
  no clean OpenAlex record.
- **Green & Swets 1966 [canon].** Signal Detection Theory and
  Psychophysics (Wiley). Sensitivity (d′) vs criterion (c) — the
  FORMAL critic-vs-actor split, 60 years old. → This is the MEASUREMENT
  framework for the specified actor-side test: report d′ and c per cue
  separately. Criterion shifts with stable d′ = actor-side, proven in
  one analysis. Supporting: 1969 operant-behavior review (145 cites) +
  1967 Science review of the book.
- **Tricomi, Balleine & O'Doherty 2009.** Dorsolateral striatum in
  human habit learning (J Neurosci, 769 cites). Habit has a locus
  (DLS); goal-directed has another (DMS/vmPFC). → Translation
  precedent (rat→human) for our learner→actor mapping, and a reminder
  that the dissociation is anatomical, not just computational.
- **Scope-note misses.** Balleine & Dickinson 1998 (goal-directed
  follow-up, no clean hit — the 1994 covers it); De Wit & Dickinson
  2009 (human devaluation, unqueried).

## Round 24 — hippocampal replay canon, sleep functions, prioritization

Replay is not our invention: the hippocampus does it (forward AND
reverse, awake AND asleep), and the normative theory of WHAT to replay
was derived independently — converging with our surprise-gating.

- **Wilson & McNaughton 1993 [canon].** "Dynamics of the hippocampal
  ensemble code for space" (Science 261:1055–1058; record via 1994
  erratum + "Mismatch correction" 1996, 445 cites). Ensemble
  reactivation during sleep. → Biological precedent for the replay
  buffer itself: offline reactivation of waking patterns is conserved
  machinery, not an ML hack. Our uniform replay = the null biological
  model (undifferentiated reactivation).
- **Diba & Buzsaki 2007.** "Forward and reverse hippocampal
  place-cell sequences during ripples" (Nat Neurosci, 1205 cites).
  Reverse replay runs BACKWARD from outcome — credit assignment by
  construction. → NEW OPERATOR (distinct from noisy/dark/downscale):
  reverse-order replay ( worthy of a future head-to-head: uniform vs
  reverse vs surprise-prioritized on one bank). Our replay is
  direction-agnostic; biology isn't.
- **Karlsson & Frank 2009 [canon].** "Awake replay of remote
  experiences in the hippocampus" (Neuron). Replay happens DURING
  behavior, biased to remote/needed experience. → Validates our ONLINE
  replay (replay interleaved with acting, not just offline) and suggests
  the remote-bias: replay what's NOT currently encountered (complements
  live input — the theoretical parent of rarity-prioritization).
  Supporting: "Task demands predict a dynamic switch in awake replay
  content" (2017, 129 cites) + "content of hippocampal replay"
  (2017, 178 cites).
- **Mattar & Daw 2018.** "Prioritized memory access explains planning
  and hippocampal replay" (Nat Neurosci, 393 cites). NORMATIVE:
  replay what maximizes Bellman-error utility (gain + need). →
  Independent derivation of surprise-gating from first principles: their
  normative theory and our empirical instrument CONVERGE (prediction-
  error prioritization). Strongest external validation the deployed
  instrument has. Also prescribes the missing term: NEED (our gain has
  surprise but no need — a need-weighted gain is the licensed upgrade).
- **Diekelmann & Born 2010.** "The memory function of sleep"
  (Nat Rev Neurosci, 3751 cites). Consolidation canon: sleep replays
  stabilize declarative/skill memory; same-val retention is the
  predicted outcome. → Our 0.95 same-val retention MATCHES the
  consolidation signature — the transfer line preserves what sleep
  preserves. Positions seg1-test as a (failed) reconsolidation probe.
- **Tononi & Cirelli 2003/06 [canon].** Synaptic Homeostasis Hypothesis
  (Soc Neurosci abstr 2003; Sleep Med Rev 2006): sleep = GLOBAL
  DOWNSCALING preserving relative weights — anti-entrenchment by
  design. → NEW OPERATOR (fourth): downscaling replay (multiply by
  <1 per replay pass). Extinction-favoring, distinct from corrupt
  (noisy), match-outputs (dark), reverse. Head-to-head candidate.
  Controversy preserved: "Why I Am Not SHY" (Hobson, 34 cites) +
  "Time to Be SHY?" (Heller, 113 cites) — the hypothesis is contested,
  use it as an operator, not a truth.
- **Scope-note misses.** Foster & Wilson 2006 (reverse replay, unqueried
  — Diba covers it); Girardeau et al. 2009 (ripple disruption impairs
  memory — causal proof, unqueried).

## Round 25 — foraging/search theory, collective inhibition, honest signaling, grounded metrics

Search, collectives, mating, measurement: one round of formalisms the
program has been missing (patch-leaving rules, sparse search, quorum
mechanics, signal honesty, behavioral distance).

- **Charnov 1976 [canon].** "Optimal foraging, the marginal value
  theorem" (Theor Pop Biol 9:129–136). Leave a patch when marginal
  intake drops to the environmental average. → THE benchmark our
  turn/cruise policy lacks: MVT-optimal leaving vs our greedy threshold.
  The encounter problem (mates, food) is patch-encounter; GUD (giving-up
  density) is the measurable our rows can approximate. Supporting:
  hummingbird MVT test (1978, 239 cites) + "Optimal giving-up times"
  (213 cites).
- **Vergassola, Villermaux & Shraiman 2007.** "Infotaxis as a strategy
  for searching without gradients" (Nature, 890 cites). Optimal search
  for sparse nondirectional cues = maximize expected information gain.
  → Formalizes the mate-encounter problem (rare, odor-free targets):
  infotaxis is the optimal policy our random-walk foragers don't
  implement — bounds how much encounters could improve. Supporting:
  multi-agent collaborative infotaxis (2019 — the population-track
  version, when mating reopens).
- **Seeley et al. 2011.** "Stop signals provide cross inhibition in
  collective decision-making by honeybee swarms" (Science, 327 cites).
  Quorum + CROSS-INHIBITION (stop signals against rival sites) prevents
  stampedes; decision without central control. → THE named herding
  antidote for V1d's 47/48 stampede: cross-inhibition between options,
  not just diversity maintenance. Design pattern for the next selection
  line, with implementability proven in minimal agents: kilobot
  translation (2024, 12 cites).
- **Zahavi 1975 [canon].** "Mate selection — a selection for a
  handicap" (J Theor Biol 53:205–214). Honest signals must be COSTLY
  (waste is the guarantee). → Designs the channel-4 courtship gate:
  cheap signals WILL be ignored (predicts Option-A failure mode + fix —
  make courtship displays energetically costly to be credible). And the
  round-20 scope-miss is closed (it was journal-side, as predicted).
  Controversy preserved: "Handicap mechanism does not work" (1986,
  128 cites) + "erroneous hypothesis" (2019, 111 cites) — contested,
  use as design constraint, not truth.
- **Ferns, Panangaden & Precup 2011.** "Bisimulation metrics for
  continuous MDPs" (SIAM J Control Optim, 100 cites). Behavioral
  distance: states are close if they imply the same futures. →
  REPLACES Hamming for the geometry retry (round 21's honest
  inconclusive): confusability = bisimulation distance under the
  carried policy, not bit distance. The right metric was in the
  literature all along.
- **Andersson 1994 [canon] + Viswanathan et al. 1999 [canon].**
  Sexual Selection (Princeton, the mate-choice canon) + "Optimizing
  the success of random searches" (Nature, Lévy-flight optimum).
  → Revival-rationale pieces for the cold tracks: choice (Andersson —
  our mating has NO choice; add it) + search (Lévy/Humphries-2012-
  in-situ 338 cites — our foragers' walk vs optimal sparse search).
  Supporting: reviews-of-Andersson records + Humphries in-situ test.
- **Scope-note misses.** Maynard Smith & Szathmáry transitions
  (individuality canon for RSI definitions, unqueried); Boyd & Richerson
  dual inheritance (horizontal-transmission line, unqueried); Todorov
  optimal feedback control (motor track, cold).

## Round 26 — action and body: the actor-side canon (active inference, somatic markers, allostasis)

The VALUE-PROBE verdict (values 1.0, behavior 0.09) is a problem the
field has owned for decades: how actions follow (or ignore) values.
This round is the actor's library.

- **Friston 2010.** "The free-energy principle: a unified brain
  theory?" (Nat Rev Neurosci, 8087 cites). Action as inference:
  policies minimize EXPECTED free energy (pragmatic + epistemic
  value). → Our threshold implements a degenerate policy (fixed .5 +
  cruise prior, no epistemics). Friston gives the FORMAL actor-side:
  replace the greedy threshold with EFE policy selection; turn becomes
  information-seeking where values are uncertain (BH cues!) and
  pragmatic where certain. Future instrument, fully specified by the
  theory.
- **Parr, Pezzulo & Friston 2022.** "Active Inference" (MIT Press
  tutorial papers, 246 cites). Implementable active inference (generative
  model + EFE + pymdp-style updates). → The HOW for the Friston bullet:
  a discrete-state active-inference agent on our 12-cue codebook is a
  weekend build once the line freezes — no new math required.
- **Damasio 1994 [canon].** Descartes' Error (Putnam). Somatic marker:
  bodily states bias decisions before reason concludes. → Our actor
  ignores the body (threshold fixed while energy swings −20 to −60).
  Design: energy-gated threshold (somatic marker as a number — turn
  criterion falls as reserves fall? or rises?). Supporting: origin-of-
  markers record + German review of the book (proof of canon).
- **Sterling & Eyer 1988 / McEwen tradition [canon + record].**
  Allostasis (predictive regulation) vs homeostasis (reactive).
  Supporting: "Allostasis, Homeostats, and the Nature of Stress"
  (2002, 373 cites). → Frames BH failure as missing ALLOSTASIS: our
  agents turn only AFTER harm (reactive); allostatic agents turn BEFORE
  (predicted). Licensed read-only analytic (specified): turn timing vs
  first-harm-contact per BH cue on frozen rows — anticipation test.
- **Seth 2013.** "Interoceptive inference, emotion, and the embodied
  self" (Trends Cogn Sci, 1816 cites) + 2014 homeostasis/decision
  follow-up. Valuation OF the body (interoceptive prediction errors as
  feelings that guide choice). → Our critic is taste-only; Seth says
  add the interoceptive channel (energy-trajectory value). The actor
  would then have TWO value streams — the BH block might be their
  conflict (taste says harm, body says "still rich"), testable once
  per-cue values log both.
- **Clark 2013.** "Whatever next? Predictive brains, situated agents"
  (Behav Brain Sci, 5925 cites). The predictive-processing manifesto.
  → Positions our delta-rule learner inside the PP tradition (ancestor,
  not rival) and imports its open problems (precision-weighting =
  gain by another name — our surprise-gating is precision dynamics!).

## Round 27 — modulation: cue-gated replay, arousal law, plasticity brakes, loss

What turns learning up/down/off — and the number for our asymmetry.

- **Rasch et al. 2007 [canon].** Odor cues during slow-wave sleep
  prompt declarative consolidation (Science). Cue-triggered replay:
  REPLAY WHAT'S CUED. → Alternative prioritization operator (fifth,
  alongside uniform/noisy/dark/downscale/reverse): cue-gated replay —
  present cue X, replay X-records. Our cues ARE odors; translation is
direct. Supporting: odor-cueing-during-SWS review (2013) + 2017 odor-
  cueing study (cueing works independently of sleep stage — gating by
  cue, not state).
- **Yerkes & Dodson 1908 [canon].** Rapidity of habit formation vs
  stimulus strength (J Comp Neurol Psych). Inverted-U arousal:
  performance rises then FALLS with drive. → Our gain is monotonic;
  YD says fit the inverted-U to the gain-dose data (V1g already records
  overdose readings — the program measures YD without naming it).
  Read-only, specified: dose-response curve over frozen gain arms.
- **Bavelier et al. 2010.** "Removing brakes on adult brain
  plasticity" (J Neurosci, 589 cites). Brakes (inhibition, perineuronal
  nets, epigenetic) accumulate and must be LIFTED — distinct from
  excitation. → The floor as EXCESS BRAKING: train-phase inhibition
  accumulates (LI-like!) and gain shouts over it instead of releasing
  it. New intervention family: brake-lifting (disinhibition) vs gain
  (excitation) — mechanistically different, head-to-head-able.
- **Hensch 2005 [canon].** Critical-period plasticity in local cortical
  circuits (Nat Rev Neurosci). Sensitive periods are GATED windows
  (open/close by molecular brakes). → Our phases are arbitrary tick
  counts (1792); Hensch asks whether train/test should align to
  plasticity windows (open on novelty, close on consolidation) — phase
  design becomes a variable, not a constant.
- **Kahneman & Tversky 1979 [canon].** Prospect theory (Econometrica).
  Losses loom larger than gains (λ≈2). → QUANTIFIES the negativity-bias
  unification (prior-strength doc): measure λ on frozen rows as the
  harm-update/benign-update magnitude ratio. The asymmetry gets a
  number and a 45-year-old name. Supporting: neural prospect theory
  (2005, 404 cites) + large-scale replication (2020, 327 — the effect
  is real).
- **Walker (and Stickgold) 2005.** Sleep-dependent consolidation review
  (1854 cites) + system-consolidation follow-up. → Second-lab consensus
  behind Diekelmann (round 24): sleep preserves what was learned (our
  0.95 same-val retention, again). Consolidation is now triple-sourced.

## Round 28 — evolvability: can weight-inheritance ever compound?

The mating line's deepest question (round 19's flag: if the map is
rugged, point mutations stall). This round answers when they don't.

- **Hinton & Nowlan 1987 [canon].** "How learning can guide evolution"
  (Complex Systems). Needle-in-haystack + learning smooths the fitness
  landscape → evolution finds what search cannot. → THE computational
  Baldwin demo — our BALDWIN line rederived it uncited. Compare now:
  their smoothing result vs our return-A floor (0 ticks) — did we fail
  where they succeeded, and is the difference the landscape (needle)
  or the learner? Supporting: 2024 commentary + [Re] reproduction
  records (proof + reproducibility).
- **Crispo 2007 [canon].** Baldwin effect / genetic assimilation
  conditions (Am Nat). Assimilation needs selection on the learned
  trait + heritable variation. → Explains V1's exact-copy null from
  theory: one-generation windows provide neither (no selection
  differential on transmitted weights, no variation) — the null was
  OVERDETERMINED. Assimilation bar for any revival: multi-generation
  selection + standing variation, both absent to date. Supporting:
  2017 assimilation review (64 cites) + canalization reassessment.
- **Wagner / Ciliberti GRN canon [canon + records].** Vast neutral
  networks in regulatory maps (robustness → drift → innovation).
  Supporting: "Evolution of evolvability in GRNs" (2008, 256 cites).
  → Answers round 19: point mutations stall on RUGGED maps but FLOW on
  neutral-rich ones. Prescription for mating revival: measure the
  NEUTRAL FRACTION of our weight→behavior map first (phenotypic
  neighborhood sampling on frozen weights, read-only, specified) — if
  high, drift works and V1b's σ was simply too small a step.
- **Maynard Smith & Szathmáry 1995 [canon].** Major Transitions
  (Oxford). New inheritance channels at each transition (genes →
  epigenetics → language). → Thesis framing: our program adds channels
  one at a time (vertical done; horizontal next per Boyd, round 30) —
  that IS life's own sequence. Supporting: Revisited volume (2011,
  221 cites) + contemporary book review (proof of 1995 canon).
- **Via / plasticity-costs tradition.** Reaction-norm evolution under
  costs and limits. Supporting: 1987 heterogeneity paper (252 cites)
  + "Constraints on the evolution of phenotypic plasticity" (2015,
  691 cites — the costs canon). → Transmission fidelity has COSTS we
  never modeled (exact copy is free; noisy copy was free too). Design
  axis for revival: costly fidelity (pay per bit?) — selection then
  tunes the rate instead of us guessing σ=0.05.
- **Scope-note misses.** Drake 1991 (mutation-rate evolution —
  transmissionNoise's σ has a literature, unqueried); Simpson 1953
  (Baldwin canon statement, unqueried — Hinton covers the mechanism).

## Round 29 — collective search, origins, minimal agents (quorum, stigmergy, swarms, lipid worlds)

How collectives coordinate without central control, what inheritance
looked like before genomes, and proof minimal evolved agents surprise.

- **Segrè, Ben-Eli & Lancet 2001.** "The Lipid World" (Orig Life
  Evol Biosph, 618 cites). Compositional inheritance: noisy,
  collective, genome-free — and SELECTABLE in simulation. → The
  counterexample to "exact copy required": GARD systems evolve with
  noisy compositional transmission. Direct attack on the mating null:
  inherit a SET/distribution (composition), not a vector (exact
  weights). Supporting: 20-year retrospective (2019 — the program is
  alive).
- **Hordijk (and Steel) 2004 [canon] + 2010 review.** Autocatalytic
  (RAF) sets: formal detection algorithms for closure (J Theor Biol
  2004; "Autocatalytic Sets and the Origin of Life" 2010, 166 cites).
  → Closure detection as a MEASURE: run RAF detection on the frozen
  agent+ecology interaction graph — is our system reflexively
  autocatalytic? Outside-the-box autonomy metric for VISION (specified,
  not executed).
- **Kriegman et al. 2020 [canon].** Computer-designed Xenobots (PNAS).
  Evolved morphology + emergent behavior in minimal agents (cilia-less
  locomotion nobody designed). → Proof minimal evolved agents surprise
  their designers — our founders are comparably minimal. The sim→real
  pipeline is the dream-model analog in another substrate. Supporting:
  ethics/applications review (the discussion exists, engage it before
  any real-world step).
- **Miller & Bassler 2001 [canon].** Quorum-sensing review (Annu Rev
  Microbiol). Density-dependent gene regulation: bacteria SOLVE density
  by coordinating (light, virulence, sporulation switch on quorum).
  → MATE-DENSE backfired at 3× because our agents can't sense density.
  Design: quorum switch (density-gated behavior — disperse/forage-shift
  above threshold) for the next density line. Supporting: bench-to-
  bedside + yeast QS reviews (mechanism breadth).
- **Theraulaz & Bonabeau 1999 [canon].** Stigmergy review (Artificial
  Life). Coordination via environment modification (termite pillars,
  ant trails). → Food depletion IS a stigmergic channel our agents
  already WRITE (eat) but never READ. Design: depletion-gradient
  sensing (follow/avoid grazed patches) — new sensory channel, zero new
  physics.
- **Kennedy & Eberhart 1995 [canon].** Particle swarm optimization
  (Proc IEEE ICNN). Velocity + personal/global bests; diversity via
  topology. → Optimizer zoo for selection lines: PSO's diversity
  mechanics (neighborhood topologies prevent stampedes!) vs V1d's 47/48
  herding — GBest/LBest as the named alternative to archive-QD.
  Supporting: highly-cited optimizer records (the zoo is real).
- **Scope-note misses.** Dorigo ACO (1996 thesis — pheromone optimization,
  unqueried; PSO covers the zoo); Kauffman 1993 Origins of Order
  (canon, unqueried — RAF covers the formalism).

## Round 30 — mating ecology, inheritance channels, thesis metrics (Trivers to Rosen)

The revival-rationale shelf for the cold tracks, plus the number VISION
is missing (selection's information gain) and the definition it needs
(closure).

- **Trivers 1972 [canon].** Parental investment and sexual selection
  (in Campbell (Ed.), Sexual Selection and the Descent of Man).
  Investment asymmetry → operational sex ratio → competition/choosiness.
  → Our mating has ZERO asymmetry (all founders 65.0, courtship free)
  → predicts NO selectivity (matches: random attempts). Design: costly
  courtship (Zahavi, round 25) + differential allocation to CREATE the
  asymmetry that creates choice. Supporting: modern Trivers-theory
  records (the canon is taught, not buried).
- **Emlen & Oring 1977 [canon].** Mating-systems ecology (Science).
  Resource distribution → mating system (uniform → scramble; clumped →
  harems/territories). → Our uniform food predicts scramble (matches).
  Testable: clumped-food regime → territorial mating structure (a
designed ecology experiment, not a tweak). Supporting: Lande 1980
  polygenic dimorphism review (1887 cites — the G-matrix machinery for
  the inheritance track: genetic covariances our weight-copying lacks).
- **Odling-Smee, Laland & Feldman 2003 [canon].** Niche Construction
  (Oxford). Ecological inheritance: modified environments persist
  across generations. → Our worlds RESET per generation (no ecological
  inheritance). Design: carry-over worlds (depleted/structured persists
  → newborns inherit the niche + the weights — two channels, one
  experiment). Supporting: Monographs in Population Biology review
  record.
- **Boyd & Richerson 1985 [canon].** Culture and the Evolutionary
  Process (Chicago). Dual inheritance: genetic + cultural channels with
  distinct dynamics (conformity, prestige, horizontal spread). → Our
  transmission is vertical-only; the mate encounter could carry
  BEHAVIOR (copy the living), not just weights (copy the dead) —
  horizontal/oblique channel, faster than genetic, testable against
  vertical in one design. Supporting: contemporary reviews (proof).
- **Frank 2008/09.** "Natural selection maximizes Fisher information"
  (J Evol Biol, 156 cites). Selection = information accumulation with
  a rate. → THE thesis metric: bounded RSI = accelerating Fisher-
  information gain per selection event. VISION's success criterion
  stops being prose and starts being a number — measure it per line,
  retrospectively first (frozen rows have the distributions).
- **Rosen 1991 [canon].** Life Itself (Columbia). (M,R)-systems:
  closure to efficient causation — an agent is CLOSED (every catalyst
  made within). → FORMAL autonomy for VISION's "autonomous": test
  our TasteExperiment+world for closure (with the RAF check, round 29 —
  two independent formalisms, same question). Supporting: closure-
  simulation + biosemiotics-defense records (the formalism is worked,
  not poetry).
- **Scope-note misses.** Gibson 1979 / Lee 1976 tau (direct perception —
  motor track cold); Todorov OFC / Harris–Wolpert signal-noise (motor
  canon — cold); Cronin assembly theory (controversial, unqueried);
  Nowak cooperation rules (multi-agent futures); Haig imprinting
  (conflict theory, distant).

## Rounds 31-35 — control, ethology, selection math, neutral theory, motor canon

Method note: OpenAlex shared-IP budget ($0.10/day) exhausted mid-round
(15/30 verified, HTTP 429 thereafter). Books and 429-blocked journals
are cited [canon] with full biblio; verification of those records
resumes next mapping round. Controversies preserved where found.

## Round 31 — control and cybernetics canon (variety, regulators, reference, hierarchy)

Our agents are regulators that never model, actors without references,
thresholds without logic. The founders of the field say all three are
required.

- **Ashby 1956 [canon].** An Introduction to Cybernetics (Chapman &
  Hall). Law of requisite variety: a controller needs at least as much
  variety as the disturbance. → Audit specified (read-only): count
effective degrees of freedom both sides (16-dim orthogonal learner vs
12-entry codebook — is the floor a VARIETY deficit?). Supporting:
  planner-variety (2006, 69 cites) + requisite-variety corollary note.
- **Conant & Ashby 1970 [canon].** "Every good regulator of a system
  must be a model of that system" (Int J Systems Sci). → UPGRADES the
dream-model project from optional to NECESSARY: any RSI-grade
regulator models. The thesis gets its theorem. Supporting: 2026
dynamic-good-regulator reworking (the theorem is alive).
- **Powers 1973 [canon].** Behavior: The Control of Perception
  (Aldine). Behavior = tracking references, not maximizing rewards;
  criterion = reference signal. → Actor-side formalized a THIRD way
  (after SDT-criterion and Daw-arbitration): turn threshold AS a
  reference level; BH failure = reference set wrong (expects benign).
  Fix = move the reference, not the values. Supporting: 2025 PCT
  review + 1998 continuation note.
- **Simon 1969 [canon].** The Sciences of the Artificial (MIT Press).
  Studying designed/adaptive systems; hierarchy and near-
  decomposability. → That IS our program (artificial ecology, evolved
  controllers); Simon prescribes modularity (decomposable engine +
  learner + world, which we have — validation of the architecture
  discipline). Record: 2019 reprint (2745 cites).
- **Bateson 1972 [canon].** Steps to an Ecology of Mind (Ballantine).
  Deutero-learning (learning to learn) + the difference that makes a
  difference. → Meta-learning lineage alongside Tolman (round 23):
  deutero-learning is transfer itself. Supporting: 2007 deutero-learning
  review (168 cites).
- **McCulloch & Pitts 1943 [canon].** "A logical calculus of the ideas
  immanent in nervous activity" (Bull Math Biophys). Thresholded
  binary units = computation. → Our greedy .5 threshold IS a
  McCulloch–Pitts neuron; the actor is a logic circuit, which is why
  it doesn't grade (thresholds don't). Want grading? Replace the gate,
  don't tune it. Supporting: 1986 retrospective + 2004 first-theory
  analysis (215 cites).

## Round 32 — ethology canon (four questions, Umwelt, spandrels, tempo, form, imprinting)

A century of watching whole animals, aimed at our blind spots: what
questions we're asking, what worlds our agents live in, and whether
the floor is a bug at all.

- **Tinbergen 1963 [canon].** "On aims and methods of ethology"
  (Z Tierpsychol). Four questions: causation, development, evolution,
  function. → THESIS STRUCTURE: our floor work is causation +
  development; mating is evolution + function. Every future line gets
  filed under its question — stops category errors (e.g., demanding
  functional answers from mechanistic probes). Supporting: 2013
  appreciation (483 cites) + modern record.
- **von Uexkull 1934 [canon].** Streifzuge durch die Umwelten von
  Tieren und Menschen (Springer, German). Umwelt = the animal's
  subjective world (carriers + meanings). → Our 4-bit cues ARE an
  Umwelt (12 of 16 possible meanings); discrimination limits are
  Umwelt limits, not brain limits. Design: enrich the Umwelt (more
  bits/modalities) before blaming the learner. Supporting:
  subjective-world + Umwelt-transition records.
- **Gould & Lewontin 1979 [canon].** "The spandrels of San Marco"
  (Proc Roy Soc B). Not everything is an adaptation; constraints
  produce byproducts. → The floor as SPANDREL: extinction-slowness
  may be a byproduct of elemental delta-rule architecture, not a
  failure to fix — reframes "fix the floor" as "redesign the
  architrave." Supporting: 2008 reprint record.
- **Eldredge & Gould 1972 [verified] + Gould & Eldredge 1977 [canon].**
  Punctuated pattern: stasis broken by rapid change (Models in
  Paleobiology, 515 cites; 1977, Paleobiology). → Our history
  matches: long plateaus (floors) then jumps (gain deployment). Expect
  punctuated, not gradual, progress — and stop mistaking plateaus
  for failures. Supporting: 2008 historiography.
- **Thompson 1917 [canon].** On Growth and Form (Cambridge). Physical
  forces constrain biological form (morphospace). → Body-transfer
  morphologies as MORPHOSPACE (constrained forms, not arbitrary
  bodies) — the transfer line's next design language. Supporting:
  morphogenesis-century + limb-development records.
- **Lorenz 1935/37 [canon + record].** Imprinting (Der Kumpan 1935;
  "The Companion in the Bird's World" 1937, 622 cites). Rapid,
  early, IRREVERSIBLE learning. → Our train phase walks like
  imprinting (fast, early, hard to reverse = HB irreversibility!).
  If train is imprinting, the prescription is imprinting's: get the
  early window right (can't fix it later) — train-curriculum line,
  specified. Supporting: 2019 imprinting-neuro review.

## Round 33 — selection mathematics canon (theorem, equation, algorithm, landscape, strategy, kinship)

The formalism shelf: what selection provably does, how to attribute
it, and which strategies survive.

- **Fisher 1930 [canon].** The Genetical Theory of Natural Selection
  (Clarendon). Fundamental theorem: rate of increase in fitness =
  genetic variance. → Root of Frank (round 30); our lines never
  measure the variance they select on — specified: compute founder
  fitness variance per line (frozen rows) as the selection speedometer.
  Supporting: cultural-FTNS + Edwards-on-Fisher records.
- **Price 1970 [canon].** "Selection and covariance" (Nature).
  General selection equation: change = covariance + transmission
  terms. → ATTRIBUTION MACHINERY for mating/inheritance lines:
  Price-partition the V1 transmit results (how much change is
  selection on founders vs imperfect transmission?) — read-only,
  specified. Supporting: 1997 Price/Fisher/kin/causal review
  (356 cites, verified).
- **Holland 1975 [canon + record].** Adaptation in Natural and
  Artificial Systems (Michigan). Schema theorem; building blocks.
  → Our selection line IS a GA without the formalism: V1d's
  47/48 herding = building-block collapse (no diversity → no
  schemas). QD archive (round 20/25) is the schema-preservation
  fix, now with its theorem. Record: 1992 reprint (47260 cites).
- **Kauffman 1993 [canon].** The Origins of Order (Oxford). NK
  landscapes (ruggedness from epistasis). → Sources round 19's NK
  usage; the mating-line question (rugged vs neutral) is Kauffman's
  question. No OpenAlex record hit (429) — full biblio given.
- **Maynard Smith 1982 [canon].** Evolution and the Theory of Games
  (Cambridge). ESS: strategies stable against invasion. → Turn/cruise
  as STRATEGIES: is always-cruise an ESS? Invasion test specified
  (introduce turn-mutants at frequencies — needs multi-agent or
  sequential invasion runs; future line instrumentation). No record
  hit (429) — full biblio given.
- **Hamilton 1964 [canon].** Genetical evolution of social behaviour
  I/II (J Theor Biol). Inclusive fitness; relatedness gates altruism.
  → Our founders are unrelated → predicts null sociality (matches:
  no helping, no signaling). Predicts WHEN sociality evolves: add
  relatedness (kin-structured founders) — the mating track's social
  extension, specified. No record hit (429) — full biblio given.

## Round 34 — neutral theory, mutation, plasticity (the null and its refinements)

Every adaptationist claim in the program now has a named null — and the
mutation-rate literature says our σ lives orders of magnitude above
biology.

- **Kimura 1968 [canon].** "Evolutionary rate at the molecular
  level" (Nature). Neutral theory: most change is drift, not
  selection. → THE NULL for every drift/selection claim we make (our
  INCOMPLETE discipline already practices it; now named). No record
  hit (429) — full biblio given (Kimura, Nature 217:624–626).
- **Ohta 1973 [canon].** Nearly-neutral theory (Nature/J Mol Evol).
  Most mutations slightly deleterious; fate decided by |Ns|.
  → Our σ=0.05 mutations likely sit in the slightly-deleterious
  zone — explains V1b's weak effect SIZE (mutants neither neutral
  enough to drift nor good enough to sweep). No record hit (429).
- **Drake 1991 [canon].** Spontaneous mutation rates (PNAS: constant
  ~1e-9/base microbial rate). → Our σ=0.05/weight/element is
  astronomically high by biology; drift-barrier logic says rates
  evolve DOWN to the drift limit. Prescription: anneal σ high→low
  across generations (a schedule, not a constant) — V1d-variant,
  specified (line closed; noted for any revival). No record hit.
- **Simpson 1953 [canon].** "The Baldwin effect" (Evolution).
  The canon statement (assimilation conditions). → Complements Hinton
  (mechanism, round 28) with the formal conditions; our BALDWIN line
  can now cite both halves. No record hit (429).
- **West-Eberhard 2003 [canon].** Developmental Plasticity and
  Evolution (Oxford). Genetic accommodation: plasticity first,
  genes follow. → The assimilation path our consolidation work
  never formalized (plasticity-led, not mutation-led) — alternative
  revival mechanism to point-mutation inheritance. No record hit.
- **Jablonka & Lamb 2005 [canon].** Evolution in Four Dimensions
  (MIT). Genetic + epigenetic + behavioral + symbolic channels.
  → Transmission design space ×4: our vertical-weights line is ONE
  channel of four (methylation-like persistence, action-copying,
  signal-meaning next). Each is a future line. No record hit (429).
- **Scope-note misses.** Lynch drift-barrier proper (rates evolve to
  drift limit — Drake covers the numbers, Lynch the theory, unqueried);
  Haig imprinting (conflict theory, still distant).

## Round 35 — motor canon, direct perception, assembly, distribution (the cold tracks' library)

Perception without models, control without setpoints, complexity
without selection, distribution without planning.

- **Gibson 1979 [canon].** The Ecological Approach to Visual
  Perception (Houghton Mifflin). Affordances: perceive action-
  possibilities directly (climbable, eatable), not valences.
  → Reframes the cue ontology: our cues are valences (+/-); Gibson
  says make them AFFORDANCES (turn-toward-able, eatable) — the actor
  reads possibilities, the critic reads outcomes. No record hit (429).
- **Lee 1976 [canon].** "A theory of visual control of braking"
  (Perception). Tau (time-to-contact from expansion) = direct law,
  no model, no value. → Approach control WITHOUT the critic: tau
  drives approach, values drive only rejection — splits the actor
  cleanly (and explains why approach is fast/value-free while
  avoidance is slow/value-bound). No record hit (429).
- **Todorov & Jordan 2002 [canon].** Optimal feedback control
  (Nat Neurosci). Minimal intervention: correct only task-relevant
  deviations. → Our threshold corrects EVERYTHING (any crossing)
  vs OFC (correct only what matters) — explains brittleness; the
  actor should be a minimal-intervention controller, not a
  hair-trigger. No record hit (429).
- **Harris & Wolpert 1998 [canon].** Signal-dependent noise
  (Nature). Noise scales with command; speed–accuracy tradeoff is
  law. → Our deterministic greedy has NO noise: add signal-scaled
  motor noise as EXPLORATION (not a bug — the movement system
  expects it). Noisy-action line, specified. No record hit (429).
- **Cronin et al. 2021/23 [canon + controversy].** Assembly theory
  (Life; J R Soc Interface): selection before evolution, molecular
  assembly index as complexity. → Metric candidate: assembly index
  of weight/behavior trajectories (specified). Controversy preserved
  by design (mainstream pushback is strong; use as metric, not
  truth). No clean record hit (429) — full biblio in round note.
- **Fretwell & Lucas 1969 [canon].** Ideal free distribution (Acta
  Biotheoretica). Foragers match resources proportionally.
  → TESTABLE ON FROZEN ROWS (read-only, specified): do agents
  distribute per IFD across patches? Deviation diagnoses ( despotic /
  perceptual limits). The ecology track's first frozen quantitative
  test. No record hit (429).
- **Scope-note misses (pre-36).** Nowak 2006 cooperation rules (needs games =
  interaction, which doesn't exist yet); WBE 1997 metabolic scaling
  (body-size track cold); Jaynes MaxEnt (policy formalism, unqueried).
  (Nowak + WBE move to rounds 39–40 below; Jaynes still open.)

## Rounds 36-40 — intrinsic motivation, bounded rationality, digital evolution, cooperation, robustness/form

Method note: OpenAlex shared-IP budget still exhausted (429 on first
query of the round). All 30 entries below are [canon] with full biblio
from established knowledge; live verification of these specific records
is deferred to the next mapping round. No abstracts were fetched; moves
are synthesized from the works' known contents. Flag anything that
looks off and it gets verified first.

## Round 36 — intrinsic motivation and autonomy (playgrounds, fun, sense-making, homeokinesis)

What drives action when rewards are sparse or absent — our encounter
problem (mates rare, food patchy) is an exploration problem, and
exploration needs a drive.

- **Oudeyer, Kaplan & Hafner 2007 [canon].** "Intrinsic motivation
  systems for autonomous mental development" (IEEE TEC 11:265–286).
  Playground Experiment: curiosity as learning-progress maximization
  (do what reduces prediction error fastest). → The encounter/explore
  drive our foragers lack (they random-walk): curiosity = seek
  learnable novelty. Design: learning-progress bonus on cue encounters
  (explore where surprise is HIGH but DECREASING — distinct from
  surprise-gating, which exploits high surprise wherever it is).
- **Schmidhuber 2010 [canon].** "Formal theory of creativity, fun,
  and intrinsic motivation" (IEEE TAMD 2:230–247). Fun = compression
  progress; the agent rewards itself for finding simpler encodings.
  → Formalizes Oudeyer (progress = compression gain); our replay
  buffer IS an encoding — a compression-progress replay priority
  (third prioritization axis alongside surprise and need).
- **Varela, Thompson & Rosch 1991 [canon].** The Embodied Mind (MIT).
  Cognition = enactive sense-making by an autonomous body, not
  representation. → Philosophical home for the whole program
  (embodied learners, not disembodied optimizers); sense-making =
  what our turn metric approximates (acting appropriately, not
  representing accurately). Thesis framing.
- **Di Paolo 2005 [canon].** "Autopoiesis, adaptivity, teleology,
  agency" (Phenomenology Cogn Sci 4:429–452). Adaptivity layered on
  autopoiesis = minimal agency with norms (good/bad for the agent).
  → Formalizes what our energy budget implements crudely: viability
  + graded norms. The value function gets a biological definition
  (stay viable + improve conditions), constraining reward design.
- **Der, Steinmetz & Pasemann 2001+ [canon].** Homeokinetic control
  (series from ~2001; e.g., Int J Bifurcation Chaos). Behavior
  self-organizes from minimizing prediction error of the agent's own
  sensors — NO reward, NO task. → Reward-free control for our
  actors: a homeokinetic turn/motor loop would explore and adapt
  without any intake signal — the purest answer to "what moves the
  agent when food is absent" (odor-free ecology!).
- **Beni & Wang 1989 [canon].** "Cellular robotic systems" (NATO ASI
  Series; origin of the term 'swarm'). → The swarm-optimization
  lineage root (with Dorigo/ACO and Kennedy/PSO as its children):
  minimal agents + local rules → collective function. Design language
  for any future multi-agent line.

## Round 37 — bounded rationality canon (satisficing, ant-on-beach, attention, heuristics)

Our agents ARE boundedly rational; Simon wrote their user manual
(and Gigerenzer their defense brief).

- **Simon 1955 [canon].** "A behavioral model of rational choice"
  (Q J Econ 69:99–118). Satisficing: decide when good enough, not
  optimal. → Our greedy .5 threshold IS satisficing (accept when
  prediction clears aspiration). Normative cover for the threshold
  architecture — and the prescription: adapt the ASPIRATION level,
  not the computation (aspiration-adaptation line, specified).
- **Simon 1956 [canon].** "Rational choice and the structure of the
  environment" (Psych Rev 63:129–138). The ant and the beach:
  complexity lives in the ENVIRONMENT, not the mind. → Our agents
  are ants; the 12-cue/4-bit world is their beach. Explains why
  simple rules work (V1's 0.81 gaps!) and reframes the floor as
  beach-complexity (remap structure) not ant-stupidity — converges
  with the bank-dependence finding from the other side.
- **Simon 1971 [canon].** "Designing organizations for an
  information-rich world" (in Greenberger (Ed.), Computers,
  Communications, and the Public Interest). "A wealth of information
  creates a poverty of attention." → Attention economics: our 96-dim
  phi floods the learner; attention (which dims/bits to process) is
  the scarce resource. Mackintosh-associability IS attention — the
  associability-reset line in economic dress.
- **Gigerenzer, Todd & ABC 1999 [canon].** Simple Heuristics That
  Make Us Smart (Oxford). Fast-and-frugal: ignore most information,
  decide fast. → The normative defense of every threshold in our
  engine (greedy .5, cruise prior, turn rule): heuristics, not
  approximations. Design rule: add heuristics, don't complicate
  inference.
- **Gigerenzer & Brighton 2009 [canon].** "Homo heuristicus"
  (Topics Cogn Sci 1:107–224). WHEN heuristics win: uncertainty +
  redundancy (less-is-more). → Our world qualifies (noisy intake,
  redundant phi) — predicts heuristics beat full-Bayesian here, i.e.,
  DON'T build the Bayes-optimal agent (it would lose). Constrains
  dream-model ambitions (dreams should serve heuristics, not replace
  them).
- **Payne, Bettman & Johnson 1993 [canon].** The Adaptive Decision
  Maker (Cambridge). Effort–accuracy tradeoff: strategy follows
  cost/benefit. → Our pricing (operationEnergy) IS the effort term;
  agents should switch strategies with stakes (cheap cues → heuristics,
  dear cues → deliberate). Adaptive-strategy line, specified (stakes-
  gated inference depth).

## Round 38 — digital evolution and novelty (Avida, information, abandon objectives)

Our program is digital evolution; these are its canon results —
including the one that says objectives (our gaps) can deceive.

- **Lenski, Ofria, Pennock & Adami 2003 [canon].** "The evolutionary
  origin of complex features" (Nature 423:139–144). Avida: complex
  logic operations evolve from simple ones via exaptation. → Proof
  digital organisms surprise designers (our founders might too);
  complex behavior from simple parts WITHOUT design — the standing
  reply to "but who designed the learner?".
- **Adami 2002 [canon].** "What is complexity?" (BioEssays 24:
  1085–1094). Physical complexity = information about the environment
  (genome as predictive model). → Genomes (and weights) AS models:
  model-quality = mutual information with the niche. Measurable on
  frozen weights (specified: weight–niche mutual information as the
  transmitted-knowledge metric for mating lines).
- **Lehman & Stanley 2011 [canon].** "Abandoning objectives" (EvoStar).
  Novelty search beats objective search (objectives deceive; mazes +
  bipeds). → DIRECT CHALLENGE to our gap-gated lines: the HB gap may
  be a DECEPTIVE objective (selection for it herds into dead ends —
  V1d's 47/48 stampede as deception!). Prescription already banked
  (QD archive, novelty cells) now with its canon.
- **Stanley & Lehman 2015 [canon].** Why Greatness Cannot Be Planned
  (Springer). Stepping-stone principle: objectives skip the stones
  that lead somewhere. → Thesis-level: our frozen-plan discipline
  (fixed gates) risks skipping stepping stones; the QD map (open-ended
  illumination) is the hedge. Both, deliberately.
- **Taylor et al. 2016 [canon].** Open-ended evolution hallmarks
  (Artificial Life 22:408–437). What OEE requires (ongoing novelty,
  complexity growth, no halting). → Checklist for whether Astra could
  ever BE open-ended (currently: no — fixed ecologies, fixed phases;
  the checklist names what would have to change).
- **Wagner 2011 [canon].** Arrival of the Fittest (Dutton/Penguin).
  Constrained variation channels innovation (variation is NOT random;
  development proposes, selection disposes). → Pairs with neutral
  theory (round 34): drift explores a BIASED proposal distribution.
  Our σ=0.05 isotropic mutations ignore the bias — proposal-
  distribution design (mutate along phenotypically productive axes)
  as the mating-line upgrade.

## Round 39 — cooperation and levels (TFT, five rules, cooperators, levels, signals, conflict)

For the day agents meet: the interaction canon, from the first
tournament to the social contract.

- **Axelrod & Hamilton 1981 [canon].** "The evolution of
  cooperation" (Science 211:1390–1396). Tit-for-tat wins the
  tournament (nice, retaliatory, forgiving, clear). → If our agents
  ever share worlds: TFT is the seed strategy for interaction
  protocols; tournaments (not just lines) as the evaluation format
  for social behavior.
- **Nowak 2006 [canon].** "Five rules for the evolution of
  cooperation" (Science 314:1560–1563). Kin/direct/indirect/network/
  group reciprocity + the b/c > k thresholds. → The menu our null-
  sociality is measured against; network reciprocity (b/c > k) is the
  cheapest to implement (viscosity first — matches kin-relatedness
  prescription, round 33).
- **Queller 1997 [canon].** "Cooperators since life began" (Q Rev
  Biol 72:184–188). Cooperation at EVERY transition (genes to
  societies). → With Maynard Smith (transitions) and Hamilton (kin):
  cooperation isn't advanced behavior, it's the DEFAULT that
  conflict breaks. Reframes null-sociality as conflict-suppressed,
  not cooperation-absent.
- **Okasha 2006 [canon].** Evolution and the Levels of Selection
  (Oxford). MLS formalization (collective fitness, covariance
  across levels). → The formalism round 15's MLS-punishment lacked:
  Price-across-levels for any future group-selection line (with
  Okasha's book + Price's equation + Frank's information = full
  stack).
- **Skyrms 2010 [canon].** Signals (Oxford). Signaling games: how
  cues get MEANING (sender–receiver co-evolution). → Our cues have
  imposed meanings (codebook); Skyrms asks how meanings EMERGE —
  the cue-ontology line beyond imposed valences (Lewis games with
  our 4-bit channel, specified for a far-future line).
- **Trivers 1974 [canon].** "Parent-offspring conflict" (Am Zool
  14:249–264). Optima differ by relatedness (r=1 self vs r=.5 sib).
  → Newborn-vs-founder interest divergence is PREDICTED (not a bug):
  design transmission anticipating conflict (offspring discount
  parental weights — the vertical-transmission line's next knob).

## Round 40 — robustness, form, physics (HOT, regulation, scaling, Landauer, Bernstein, Pattee)

Why fixing breaks things, where evolution acts, what computation
costs, who coordinates the coordinators, and where symbols touch
matter.

- **Carlson & Doyle 2002 [canon].** "Complexity and robustness"
  (PNAS 99:2538–2545; HOT). Robust-yet-fragile: optimized systems
  are robust to designed-for insults, fragile to the rest; power
  laws from design tradeoffs. → THE floor theory: our agents are
  HOT systems (robust same-val 0.95, fragile flipped) — fixing the
  fragile point moves fragility elsewhere (whack-a-mole, cf.
  concentration doc!). Predicts intervention tradeoffs, not fixes.
- **Carroll 2005 [canon].** Endless Forms Most Beautiful (Norton).
  Evo-devo: evolution acts on REGULATION (cis), not coding —
  toolkit conserved, switches evolve. → Our mutations hit weights
  (coding); Carroll says hit the GATING (regulatory: thresholds,
  rates, switches). Regulatory-mutation line specified (mutate
  rates/gates, freeze weights — the exact inverse of V1b!).
- **West, Brown & Enquist 1997 [canon].** Quarter-power scaling
  (Science 276:122–126). Networks beget scaling laws. → Body-size
  scaling for the transfer track (when bodies vary, metabolism must
  scale as M^3/4 — the pricing law's missing exponent; currently
  implicit/untested).
- **Landauer 1961 [canon].** "Irreversibility and heat generation"
  (IBM J Res Dev 5:183–191). Information is physical; erasure costs
  kT ln 2. → Our operationEnergy has a physics twin: learning
  (overwriting weights = erasure) MUST dissipate. Grounds the
  billing in thermodynamics (and bounds how cheap learning can get
  — Landauer limit as the efficiency asymptote for any RSI claim!).
- **Bernstein 1967 [canon].** The Co-ordination and Regulation of
  Movements (Pergamon). Degrees-of-freedom problem: how to control
  redundant DOF (freeze, couple, exploit). → Our 5-dim motor with a
  dead channel IS Bernstein's problem (channel 3 frozen by
  evolution-unfriendly math, per MATING-DIAG). Solutions: freeze
  (done, accidentally), couple (synergies — motor-synergy line,
  specified), exploit (let the body do it — morph track).
- **Pattee 2001+ [canon].** Symbol–matter problem (1995 "Artificial
  Life Needs a Real Epistemology"; Biosemiotics founding work).
  Where discrete symbols (our 4-bit cues) touch continuous physics
  (movement, intake). → THE cue-ontology question formally: the cut
  between rate-dependent dynamics and rate-independent symbols runs
  through our collector. Design: make the cut explicit (symbols as
  constraints on dynamics, not inputs to functions).
- **Scope-note misses (post-40).** WBE network mechanisms (beyond
  scaling); Jaynes MaxEnt (policy formalism, still open); Thorndike/
  Hull drive theory (superseded by SDT/RL); quantum cognition (too
  far); Haig imprinting (conflict, distant).

## Rounds 41-45 — VISION-milestone canons (bounds, mesa, social learning, bodies, RSI synthesis)

Requested against docs/VISION.md's milestones, not curiosity: M3
(bounded controller-change proposals) gets the safety/corrigibility
canon; M5 (population/social/cultural with explicit models) gets
social-learning strategies + signaling; M4 (richer bodies after
simpler measured) gets evolved-bodies canon; retention gets the CLS
root; RSI gets its synthesis papers. Method: OpenAlex still 429-
limited; all entries [canon] with full biblio, verification deferred.

## Round 41 — corrigibility and bounds (the M3 canon: change safely or not at all)

Milestone 3 demands bounded, checkpointable controller changes with
independent evaluation. AI safety has spent a decade formalizing
exactly this; the program has been reinventing fragments (budgets,
resumes, guards). The canon, at once:

- **Soares et al. 2015 [canon].** "Corrigibility" (AAAI Workshop
  on AI & Ethics / MIRI tech report). The property our single-
  attempt discipline approximates: the agent must not undermine
  evaluation, training, or shutdown. → Names the frozen-plan/single-
  attempt/negative-preservation stack as CORRIGIBILITY engineering;
  any future in-agent loop (RSI-SELF revival) must prove corrigibility
  first — the missing gate in every V1a–V1d plan.
- **Hadfield-Menell, Dragan, Abbeel & Russell 2016 [canon].** "The
  off-switch game" (ICML Workshop; arXiv:1611.08219). Formalizes
  shutdown-avoidance as a game (Harsanyi): agents that preserve the
  off-switch earn trust. → Our resume/attempt guards are off-switch
  mechanics; the paper gives the equilibrium analysis for WHEN an
  agent would break them (uncertainty over objectives + ...). Design
  probe for any self-modifying loop.
- **Orseau & Armstrong 2016 [canon].** "Safely interruptible agents"
  (UAI). Indifference + ignorance make RL agents not resist
  interruption. → Checkpointing (our snapshots/transplants) is half
  the story; the other half is the agent not CARING about being
  checkpointed. Our learners have no preferences over interruption
  (good, by accident); any planner would need indifference BY
  DESIGN — specified as a requirement on dream-model work.
- **Everitt et al. 2017/2021 [canon].** Reward tampering problems
  (2017 workshops; "Reward Tampering Problems and Solutions in
  Reinforcement Learning" 2021, arXiv:2101.04445). Taxonomy: wire-
  heading, feedback, input, update tampering. → Audit checklist for
  the value channel: could an agent edit its probes/values/updates?
  Our probes read weights directly (tamper-evident by construction —
  note as a design PATTERN: read the weights, not the reports).
- **Krakovna et al. 2020 [canon].** "Penalizing side effects using
  stepwise inaction as a baseline" (arXiv:1911.08096?/2020).
  Impact regularization with the right baseline. → Our ledger caps
  bound compute but not SIDE effects (world depletion, food
  monopolization); stepwise-inaction baselines are the missing
  ecology-side budget. Specified for the next ecology line.
- **Taylor 2016 [canon].** "Quantilizers" (MIRI / AAAI Workshop).
  Satisfice, don't optimize (sample from the top quantiles, avoid
  extremes). → Formalizes Simon + Gigerenzer for risky action:
  replace greedy max (which stampedes, cf. V1d) with quantilized
  choice — the V1d herding fix stated as decision theory.

## Round 42 — mesa, misgeneralization, safe exploration (what the bounded change must survive)

Even bounded proposals fail if the optimizer inside differs from the
objective outside, or if exploration kills the run.

- **Hubinger et al. 2019 [canon].** "Risks from Learned Optimization
  in Advanced Machine Learning Systems" (arXiv:1906.01820). Mesa-
  optimizers: learned models that optimize their own objectives.
  → Our taste-learner is a proto-mesa-optimizer (it generalizes
  beyond its training signal — the transfer gaps ARE inner/outer
  misalignment measurements). The floor, reframed a fourth time:
  inner objective (approach) vs outer (task success).
- **Langosco, Shah et al. 2022 [canon].** "Goal misgeneralization in
  deep reinforcement learning" (ICML). Competent misbehavior from
  ambiguous training (the CoinRun/CARLA work). → Our transfer line
  belongs to this literature (competent locomotion, retarded
  re-valuation), and its mitigations (diverse training, goal
  uncertainty) transfer back.
- **Garcia & Fernandez 2015 [canon].** "A comprehensive survey on
  safe reinforcement learning" (JMLR 16:1437–1480). The safe-explore
  canon (ergodicity, returnability, error budgets). → Our caps
  are ad-hoc safe-RL; the survey gives the taxonomy (our lines use
  budget + rollback + frozen-gate subsets of it) and the missing
  piece: explicit returnability (can the agent get back? — the
  return-A phase by another name).
- **Altman 1999 [canon].** Constrained Markov Decision Processes
  (Chapman & Hall). Optimization under cost constraints, exactly.
  → The FORMALISM for our capped ledgers: every line is a CMDP
  (maximize gap subject to ops/worlds/energy); Altman gives duality
  + algorithms. Filing the ledger discipline under its math.
- **Berkenkamp et al. 2017 [canon].** "Safe model-based RL with
  stability guarantees" (NeurIPS). Lyapunov + region-of-attraction
  safety during learning. → Stability-flavored safety for the motor
  side (cruise/turn must not fall over — literally); Lyapunov
  functions as the certificate our motor primitive lacks. Specified
  for any motor-line revival.
- **Achiam et al. 2017 [canon].** "Constrained Policy Optimization"
  (ICML). Trust-region + constraints, practical CMDP solving.
  → If a future line optimizes policies directly (actor-side work),
  CPO is the bounded-update algorithm (monotonic + feasible) —
  replaces hand-tuned thresholds with guarantees.

## Round 43 — social learning strategies (the M5 canon: copy explicitly or explore)

Milestone 5 demands explicit models and controls for population/
social/cultural studies. The social-learning literature IS that
explicitness (when to copy, whom, what), mostly tournament-tested.

- **Laland 2004 [canon].** "Social learning strategies" (Anim
  Behav 67:137–155). The canon review: copy-when-asocial-uncertain,
  copy-successful, model-based biases. → STRATEGY MENU for any
  social line: our mating encounters currently copy nothing (vertical
  weights only); the first social mechanism should be a NAMED
  strategy (e.g., copy-successful: newborns copy the highest-fitness
  founder's weights — testable against maternal copy!).
- **Rendell et al. 2010 [canon].** "Why copy others?" tournament
  (Science 328:208–213). 104 strategies competed; winners learn
  selectively (observe judiciously, exploit). → The EVALUATION FORMAT
  for social lines: tournaments, not single-arm GO/NOGO. Import the
  format when mating reopens (multi-strategy meets, not parallel
  arms).
- **Enquist, Eriksson & Ghirlanda 2007 [canon].** Critical social
  learning (Phil Trans R Soc B). Copy only when asocial learning is
  costly + the model is successful. → Cost-gated copying: our energy
  pricing ALREADY supplies the cost side (copy when solo learning
  burns too much) — the gate exists, the channel doesn't. Design:
  cost-gated horizontal copy (pay energy to copy a neighbor).
- **Henrich & McElreath 2003 [canon].** Cultural transmission
  biases (Evol Hum Behav 24:123–143). Prestige + conformity +
  payoff-biased copying (formal models). → The bias menu beyond
  copy-successful: conformity (copy the majority — diversity-killer
  AND stampede-explainer for V1d-like herding!) and prestige
  (copy elites — QD elites as prestige models). Two mechanisms,
  opposite diversity effects — a designed comparison line.
- **Cavalli-Sforza & Feldman 1981 [canon].** Cultural Transmission
  and Evolution (Princeton). Vertical/oblique/horizontal math
  (the equations for everything round 30's Boyd gestures at). →
  The TRANSMISSION FORMALISM our mating line lacks: write the
  vertical-only model first (it predicts V1's null: no variation →
  no response), then add channels and predict the difference.
- **Kendal et al. 2018 [canon].** Social learning strategies review
  update (Neurosci Biobehav Rev 95:70–84). A decade of Laland-2004
  successors; strategies × development × brains. → Current map +
  the developmental angle (age-structured copying — our founders/
  newborns ARE age-structured; copy rules should be too).

## Round 44 — bodies and retention roots (evolved morphologies, complementary systems)

M4 needs the evolved-body canon (co-design, not attachment); the open
retention item in VISION.md needs its root (complementary systems).

- **Sims 1994 [canon].** "Evolving virtual creatures" (SIGGRAPH).
  Co-evolved morphology + control (blocks + neurons, water/land).
  → THE origin of evolved bodies: morphology and control co-evolve
  or the body is a straitjacket. Our body-transfer line bolts new
  codebooks onto a fixed plant — Sims says co-evolve the plant.
  (Transfer V1/V2's FAIL-body reads as: fixed plant, new world.)
- **Lipson & Pollack 2000 [canon].** "Automatic design and
  manufacture of robotic lifeforms" (Nature 406:974–978). Evolved +
  3D-PRINTED robots (sim-to-real, embodied). → The go-beyond-Sims
  step (manufactured, not just simulated); the sim→real pipeline our
  dream-model would need if bodies ever leave the grid.
- **Cheney, MacCurdy, Clune & Lipson 2013 [canon].** Evolving soft
  robots (GECCO best paper lineage; e.g., "Unshackling evolution"
  2014). Morphological complexity itself evolves under the right
  encodings. → Encoding matters (CPPNs > direct): our body
  representation (if bodies ever vary) should be generative, not
  parametric. Specified constraint on any future morph line.
- **Pfeifer & Bongard 2006 [canon].** How the Body Shapes the Way
  We Think (MIT). Morphological computation: the body does control
  work (passive walkers need no controllers). → The transfer line's
  missing half: offload turn/approach to morphology (sensor placement,
  body shape) instead of learning it all in weights. Design axis
  orthogonal to every replay/gain knob tried.
- **McClelland, McNaughton & O'Reilly 1995 [canon].** "Why there
  are complementary learning systems in the hippocampus and
  neocortex" (Psych Rev 102:419–457). Fast hippocampal + slow
  cortical learning (the CLS root). → THE retention architecture:
  our single-learner system lacks the fast/slow split; catastrophic
  interference (HB floor?) is PREDICTED without it. Specifies the
  two-learner architecture (fast buffer + slow consolidation) that
  BALDWIN approximated and the next retention line should build.
- **Kumaran, Hassabis & McClelland 2016 [canon].** Complementary
  systems update (Nat Rev Neurosci 17:550–563). Replay as the
  hippocampal→cortical teacher; 20 years of CLS evidence. → Our
  replay IS hippocampal (buffer replays to weights); the missing
  piece is the SLOW cortical side (our weights update fast-only).
  Consolidation-rate knobs (BALDWIN's consolidationRate) were the
  right idea on the wrong timescale.

## Round 45 — RSI synthesis (machines that improve, curricula that complexify, reward that suffices?)

The endgame shelf: self-improvement theorems, complexity-from-
curricula demos, and the maximalist claim to argue against.

- **Schmidhuber 2007 [canon].** "Gödel Machines" (in Goertzel &
  Pennachin (Eds.), Artificial General Intelligence, Springer).
  Fully self-referential optimal universal self-improvers (proof-
  search + utility). → THE RSI formalism (self-rewrite iff provably
  better). Our RSI-SELF in-agent loop is a Gödel-machine SKETCH
  without the proof searcher; V1d's stampede is what happens without
  the proof gate. Specifies the missing component precisely.
- **Clune 2019 [canon].** "AI-Generating Algorithms" (Artificial
  Life 26, O'Reilly Radar essay 2019). Meta-architecture + meta-
  learner + meta-environment = open-ended intelligence. → The
  PROGRAM for VISION's aspirations (pillars, not a single line);
  our QD archive + selection lines + banks map onto pillars 1–2;
  pillar 3 (generative environments) is entirely missing — the
  biggest gap in the whole program, named.
- **Leibo et al. 2019 [canon].** "Autocurricula and the emergence
  of innovation from social interaction" (arXiv:1903.00742).
  Multi-agent social dynamics auto-generate curricula (hide-and-seek
  arms races). → M5's engine: social interaction CREATES the
  task distribution (no hand-designed phases). Our mating encounters
  could be the seed of an autocurriculum — if agents interacted.
- **Baker et al. 2019/2020 [canon].** Emergent Tool Use from
  Multi-Agent Autocurricula (OpenAI; ICLR 2020). Hide-and-seek
  agents invent tools (ramps, surfboards) through phased play. →
  The DEMO that autocurricula work at scale; tool-use as the
  existence proof that simple environments + interaction →
  complexity. Sets the bar for any future multi-agent line.
- **Sutton 2019 [canon].** "The Bitter Lesson" (blog essay).
  Search + learning beat human knowledge, every decade, in every
  domain. → The anti-hand-design thesis: our hand-tuned gains/
  thresholds/doses LOSE to search in the long run — argues for
  learned optimizers (round 20) and against further knob-freezing.
  (Kept in productive tension with the frozen-plan discipline: freeze
  the search, not the solution.)
- **Silver et al. 2021 [canon].** "Reward is Enough" (Artificial
  Intelligence 304:103535). Maximalist reward hypothesis: one
  scalar (maximize reward) suffices for all intelligence. → The
  claim to beat: is our taste-value enough (BH 0.80 says maybe!)
  or does HB's slowness refute it (needs more than reward)? The
  program's data now speaks to AI's biggest bet — frame the HB
  floor as a Reward-Is-Enough test case.
- **Scope-note misses (post-45).** Nowak 2006 cooperation rules —
  COVERED round 39 (moved off the miss list). Remaining: WBE network
  mechanisms; Jaynes MaxEnt; Thorndike/Hull (superseded);
  quantum cognition; Haig (distant).

## Corrections to rounds 21-27 (2026-10-26; BH-inversion cascade)

A scorer bug (BH correctness coded as 1−turn instead of turn rate)
inverted all BH behavioral numbers program-wide. True values: BH turn
0.72–0.88 everywhere (no BH floor — the floor is HB-only). Affected
map entries, corrected here, originals retained above:

- **R23 devaluation bullet (line ~1147): WITHDRAWN as a habit claim.**
  Our BH agents turn ~80% on devalued cues = devaluation-SENSITIVE =
  goal-directed by Adams & Dickinson's own criterion. The transfer
  test passes devaluation; the program's agents look model-based,
  not habitual, on this axis. (The paradigm identification — transfer
  IS a devaluation test — stands and is now a positive result.)
- **R22 Quirk / R23 Daw-SDT / R24 Mattar as actor-side support:** the
  frameworks stand; their program application (BH actor-side
  localization) is withdrawn with the hypothesis (no phenomenon).
  SDT d′/c remains the measurement for any future value/behavior
  split (now aimed at HB, where behavior runs ahead of values).
- Unaffected: λ=2.95 (probe-based), LI gradients (recomputed, both
  negative), overshadowing null, gain results (HB metric), all bank
  registries, all verdicts except VALUE-PROBE V1 (corrected
  separately to INDETERMINATE).

## Rounds 46-50 — foraging information, movement collectives, extended cooperation, spatial/neutral ecology, evo-devo roundup

Method note: OpenAlex shared-IP budget still exhausted (429 on probe).
All 30 entries [canon] with full biblio; verification deferred. Rounds
target remaining VISION gaps: information-theoretic foraging (M1/M5
ecology), collective movement (M5 futures), cooperation math (M5),
spatial/neutral ecology (bank-as-patch thinking + neutral nulls),
and evo-devo constraints on variation (mating-line design).

## Round 46 — information and risk in foraging (Kelly, MaxEnt, bet-hedging, state-dependence)

Foraging under uncertainty IS an information/betting problem; our
agents bet energy on cues every tick. The canon that prices those bets.

- **Shannon 1948 [canon].** "A mathematical theory of communication"
  (Bell Syst Tech J 27:379-423, 623-656). Entropy, channel capacity,
  coding. → Root of every information claim in the map (Adami,
  Frank, Mattar-prioritization). The niche-fingerprint 1.0 deserves
  Shannon units: report future transmitted-information in BITS
  (archive the unit, not just the accuracy).
- **Jaynes 1957 [canon].** "Information theory and statistical
  mechanics" (Phys Rev 106:620-630). MaxEnt: the least-biased
  distribution given constraints. → The null model for agent
  behavior (what SHOULD a maximally non-committal forager do?) and
  for weight priors (MaxEnt initialization instead of zeros?).
  Specified: MaxEnt baseline policy vs greedy on frozen rows.
- **Kelly 1956 [canon].** "A new interpretation of information rate"
  (Bell Syst Tech J 35:917-926). Log-optimal betting; growth rate =
  information. → Foraging as Kelly betting: bet fraction proportional
  to edge; our all-or-nothing accept/reject is UN-Kelly (overbets).
  Design: graded intake (partial acceptance proportional to predicted
  value) — the continuous-action line, specified.
- **Caraco 1980 [canon].** "On foraging time allocation in a
  stochastic environment" (Ecology 61:119-128). Risk-sensitivity:
  starving = risk-prone, sated = risk-averse (energy-budget rule).
  → Our agents ignore reserves (threshold fixed at all energies);
  Caraco says turn/accept MUST depend on reserves. The Damasio/
  allostasis prescription, independently derived in ecology:
  energy-gated policy is not optional, it is the textbook.
- **Stephens & Krebs 1986 [canon].** Foraging Theory (Princeton).
  THE textbook (optimal diet, patch, time allocation). → Course
  text for the ecology track: every foraging line should state its
  Stephens-Krebs model (currency? constraints? which classical model
  is being tested?). Raises the bar from description to test.
- **Seger & Brockmann 1987 [canon].** Bet-hedging (Oxford Surveys
  Evol Biol 4:182-211). Variance reduction as adaptation. →
  Maternal transmission as bet-hedging: exact-copy (no variance) vs
  noisy-copy (variance) reframes V1/V1b as a bet-hedging comparison
  — and predicts WHEN noisy wins (fluctuating test ecologies).
  Design: fluctuating-bank test (stable vs variable test codebooks).

## Round 47 — state, movement, collectives (Houston-McNamara, movement ecology, Vicsek, boids, Couzin, Deneubourg)

How bodies move through worlds, alone and together — the motor +
multi-agent library the cold tracks need.

- **Houston & McNamara 1999 [canon].** Models of Adaptive Behaviour
  (Cambridge). Dynamic programming for state-dependent decisions
  (the whole textbook). → State-dependence formalized: every turn/
  accept decision should condition on reserves (Caraco), time,
  predator state. Our stateless policy is the null it beats.
  Prescription: add ONE state variable at a time (reserves first).
- **Nathan et al. 2008 [canon].** "A movement ecology paradigm"
  (PNAS 105:19052-19059). Internal state x motion capacity x
  navigation capacity x external factors. → The decomposition our
  motor work lacks: turn failures localize to one of four slots
  (is BH slowness navigation? motion? state? world?). Diagnostic
  framework for the next motor line.
- **Vicsek et al. 1995 [canon].** "Novel type of phase transition"
  (Phys Rev Lett 75:1226). Self-propelled particles align (order
  from noise + local rules). → Minimal collective model for future
  multi-agent runs: alignment WITHOUT communication (positions
  only). Our founders in shared worlds would Vicsek-align for
  free — testable the day worlds are shared.
- **Reynolds 1987 [canon].** "Flocks, herds, and schools"
  (SIGGRAPH 21:25-34). Boids: separation/alignment/cohesion. →
  The implementation recipe (three steering rules) for when
  collectives arrive; plus the cautionary tale (beautiful motion,
  zero task) — collectives need a FORAGING reason (Seeley had one).
- **Couzin et al. 2002 [canon].** "Collective memory and spatial
  sorting in animal groups" (J Theor Biol 218:1-11). Informed
  minorities lead; group shape encodes information. → Leadership
  without signals (a few informed agents steer the naive) — the
  cheapest sociality (no communication channel needed, just
  differential knowledge). Specified: informed-minority transplant
  (seed one trained agent among naive — does the group follow?).
- **Deneubourg et al. 1990 [canon].** Argentine-ant double bridge
  (J Insect Behav 3:159-168). Stigmergic trail choice (pheromone
  positive feedback picks the short path). → The CANONICAL stigmergy
  experiment our depletion-gradient idea replays: lay two paths,
  watch selection emerge. Design template (already specified in
  round 29's language; this is the paper to copy).

## Round 48 — cooperation extended (Trivers-71, Nowak-rules, Bourke, Grafen/kin math, punishment, consensus)

The interaction canon, complete: why cooperate, how it is enforced,
how groups decide — ready the day agents share a world.

- **Trivers 1971 [canon].** "The evolution of reciprocal altruism"
  (Q Rev Biol 46:35-57). Tit-for-tat before Axelrod (cheater
  detection, friendship). → The ORIGINAL reciprocity paper (rounds
  used 1972/1974; this is the missing root) — gratitude/sympathy
  as implemented mechanisms, not just strategies.
- **Nowak 2006 [canon].** Five rules (Science 314:1560-1563; carried
  out of the scope-note misses as promised). b/c > 1/w, etc. → The
  quantitative menu: network reciprocity needs viscosity (our
  founders diffuse — add viscosity first).
- **Bourke 2011 [canon].** Principles of Social Evolution (Oxford).
  Hamilton's rule modernized (benefit/cost/relatedness estimation).
  → The measurement manual: relatedness among founders (currently
  zero BY CONSTRUCTION — random init) is a DESIGN VARIABLE (set
  relatedness, watch sociality emerge or not).
- **Gardner, West & Wild 2011 [canon].** Formal Darwinism review
  (J Evol Biol 24:1020-1028; building on Gardner et al. 2007).
  Kin selection = gene-frequency change, maximized properly. → The
  math that dissolves the kin/group debate the program might
  otherwise relitigate; read BEFORE designing any group line.
- **Fehr & Gachter 2002 [canon].** Altruistic punishment (Nature
  415:137-140). Enforcement sustains cooperation (public-goods
  with punishment). → Social lines need ENFORCEMENT, not just
  assortment (a lesson for mating: births without policing get
  invaded — design policing with the mating mechanism).
- **Conradt & Roper 2005 [canon].** Consensus decisions (Trends Ecol
  Evol 20:449-456). Review: who decides for the group, and how costs
  split. → Complements Seeley's mechanism with the COST analysis
  (consensus costs time/accuracy — our future collectives face the
  same speed-accuracy tradeoff as our individuals).

## Round 49 — spatial and neutral ecology (Levins, MacArthur-Wilson, Hubbell, Jones, Holling, Henrich)

Banks are patches. Worlds are islands. Some patterns need no
selection at all — the neutral nulls for ecology to match Kimura's
for genes.

- **Levins 1969 [canon].** "Some demographic and genetic
  consequences of environmental heterogeneity" (Bull Entomol Soc
  Am 15:237-240). Metapopulations: patches + migration +
  extinction. → Banks ARE a metapopulation (histories = patches,
  transplant = migration, no recolonization yet). The formalism
  turns our bank system into an experiment: vary migration
  (transplant rate) and watch occupancy.
- **MacArthur & Wilson 1967 [canon].** The Theory of Island
  Biogeography (Princeton). Colonization-extinction equilibrium,
  species-area law. → Gen-2 colonization (MATE-FOOD's single event)
  IS island colonization; the S-A law predicts gen-2 richness vs
  world size — a measurement waiting on bigger worlds (M4-gated).
- **Hubbell 2001 [canon].** The Unified Neutral Theory (Princeton).
  Biodiversity without selection (drift + speciation suffice). →
  The ECOLOGICAL neutral null (pairing Kimura's genetic one):
  cue-use diversity across runs might be pure drift. Specifies the
  neutral test our diversity claims must beat (are 12-cue usage
  patterns more structured than neutral sampling?).
- **Jones, Lawton & Shachak 1994 [canon].** Ecosystem engineers
  (Oikos 69:373-386). Organisms modulate resources for others.
  → The ecological twin of niche construction: depletion IS
  engineering — our eaten patches engineer the next forager's
  world. Read depletion as engineering, not noise.
- **Holling 1973 [canon].** Resilience vs stability (Annu Rev Ecol
  Syst 4:1-23). Engineering resilience (return fast) vs ecological
  resilience (absorb without flipping). → WHICH robustness do we
  want? Our lines optimize engineering resilience (fast return to
  baseline); HOT fragility suggests we need ECOLOGICAL resilience
  (survive flips). Design criterion, stated precisely for once.
- **Henrich 2004 [canon].** Demography and cultural loss (Am
  Anthropol 106:197-215; Tasmania case). Population SIZE drives
  cultural complexity (small loses). → Directly relevant to our
  founder counts (24/72): small populations cannot sustain complex
  traditions — predicts a population-size threshold for any
  horizontal-transmission line. Specified: vary founder N, measure
  transmitted-complexity retention.

## Round 50 — evo-devo constraints, origins wrap-up, criticality (Kirschner-Gerhart, Ganti, Pross, Laland-math, May-stability, Beggs-criticality)

What variation CAN do (biased, facilitated), what chemistry needs
before genes, and whether systems poise at criticality.

- **Kirschner & Gerhart 2005 [canon].** The Plausibility of Life
  (Yale). Facilitated variation: conserved cores + weak linkage +
  exploratory processes BIAS variation toward the functional. →
  The anti-random-mutation canon (with Wagner): proposal
  distributions should be facilitated (mutate switches/links, not
  weights) — converges with Carroll (regulatory) and the
  associability-reset line (reset IS exploratory re-wiring).
- **Ganti 1971/2003 [canon].** The Principles of Life (Oxford 2003;
  Hungarian 1971). Chemoton: membrane + metabolism + information
  as the minimal living system. → Minimal-life checklist our
  agents fail (no membrane/individuality boundary — they diffuse
  into the world soup). Individuality is a missing subsystem,
  named. (Rounds used Moreno/Rosen for closure; Ganti gives the
  parts list.)
- **Pross 2003+ [canon].** Dynamic kinetic stability (Pure Appl
  Chem; J Theor Biol). Persistence = replicative stability,
  not thermodynamic; selection before genes. → Complements GARD/RAF
  (round 29): stability language for the pre-mating chemistry the
  program skips (fine to skip — but name what selection acts on
  before accurate replication exists: persistence).
- **Laland, Odling-Smee & Feldman 1999 [canon].** Niche-construction
  models (Am Nat 153:790-808; two-locus theory). → The MATH the
  2003 book argues from (round 30): ecological inheritance changes
  allele dynamics — carry-over worlds (specified round 30) have
  quantitative predictions here. Read before building them.
- **May 1972 [canon].** "Will a large complex system be stable?"
  (Nature 236:413-414). Complexity-stability: random large
  systems go unstable (diversity begets fragility past a bound).
  → The counterweight to QD-diversity enthusiasm (round 20/25):
  archive SIZE has a stability bound; more niches is not better
  past some point. Design constraint on archive growth (cap plus
  turnover).
- **Beggs & Plenz 2003 [canon].** Neuronal avalanches (J Neurosci
  23:11167-11177). Cortex poises at criticality (power-law
  avalanches, maximal information). → The gain-dose line re-read:
  is deployed gain 1.0 poising the learner at criticality (max
  susceptibility = max learnability)? If so, the YD peak IS the
  critical point — a testable identity (avalanche statistics on
  update magnitudes; specified, frozen rows suffice for a first
  look: are update sizes power-law distributed?).
- **Scope-note misses (post-45).** Jaynes MaxEnt (still open);
  Thorndike/Hull (superseded); quantum cognition (too far);
  Lovelock Gaia (planetary, premature); Seager-style astrobiology
  (no bodies off Earth yet); WBE network mechanisms (beyond
  scaling).


## Rounds 51-55 — insect cognition, collective estimation, mushroom-body/olfaction canon, wildcards

Method note: OpenAlex shared-IP budget still exhausted (429 on probe).
All 30 entries [canon] with full biblio; verification deferred. These
rounds target the organism our agents imitate (insects), the collectives
they may join, the brain they copy, the noses they use — and five
genuinely outside-the-box picks.

## Round 51 — insect cognition and teaching (mini-brains, navigation, social insects)

Our agents are fly-scale; insect neuroscience is their operating manual.

- **Chittka & Niven 2009 [canon].** "Are bigger brains better?"
  (Curr Biol 19:R995–R1008). Mini-brains achieve sophisticated
  cognition (numerosity, concepts, learning) with <1M neurons.
  → Our 16-dim learner is not embarrassingly small — it is
  insect-plausible. Design constraint in reverse: if insects do it
  with this much, our failures are architectural, not size-driven.
- **Menzel & Giurfa 2006 [canon].** "Cognitive architecture of a
  mini-brain" (Curr Opin Neurobiol — the honeybee). Maps, concepts,
  communication in an insect brain. → Functional checklist our agents
  fail most of (no map, no communication, impoverished concepts) —
  prioritizes WHAT to add next (map first: Tolman round 23 meets the
  bee).
- **Srinivasan and colleagues 1996-2000 [canon].** Honeybee visual
  odometry (Science 1996; 2000). Optic-flow integration for distance;
  waggle-dance calibration. → Path integration WITHOUT a map
  (dead reckoning from flow) — the cruise controller our agents
  lack (they integrate nothing; every tick is a fresh start).
  Specified: integrate a path accumulator (even a leaky one).
- **Leadbeater & Chittick 2007 [canon].** "Social learning: from
  insects to humans" (Phil Trans R Soc B). Insects socially learn
  (flower choice, routes). → Social learning does NOT require big
  brains — removes the last excuse for asocial agents; even our
  minimal agents should copy (copy-successful is insect-plausible).
- **Thornton & Raihani 2008 [canon].** "The evolution of teaching"
  (Anim Behav 75:1823–1836). Teaching defined operationally
  (costly, feedback-sensitive, accelerates pupil learning).
  → The maternal-transmission line, upgraded: mothers should TEACH
  (costly, feedback-gated transfer), not just copy weights —
  distinguishes V1 (dump) from a teaching design.
- **Hoppitt & Laland 2013 [canon].** Social Learning: An
  Introduction to Mechanisms, Methods, and Models (Princeton).
  The methods book (diffusion analysis, option-bias, network-based
  diffusion). → HOW to measure social learning when we add it —
  adopt NBDA now, before the first social line runs, so claims are
  pre-registered measurable.

## Round 52 — collective estimation and emergence (crowds, quorums, sensing together)

When groups know more than members — and when copying destroys the
advantage (directly relevant to V1d's herding).

- **Galton 1907 [canon].** "Vox populi" (Nature 75:450–451). The
  ox-weight contest: median guess near-perfect. → The founding
  demo that diversity + aggregation beats experts. Our QD archive
  is a vox-populi machine (elites vote); V1d's stampede is vox
  populi destroyed (no diversity left to aggregate).
- **Surowiecki 2004 [canon].** The Wisdom of Crowds (Doubleday).
  Diversity + independence + decentralization + aggregation. →
  The four conditions as an ARCHITECTURE CHECKLIST: our lines have
  aggregation (means) but kill independence (herding) — the book
  diagnoses V1d in one paragraph (violate independence, lose the
  wisdom).
- **Lorenz et al. 2011 [canon].** "How social influence can
  undermine the wisdom of crowds" (PNAS 108:9020–9025). Social
  information shrinks diversity WITHOUT improving the mean (range
  reduction + herding). → EMPIRICAL V1d: copying concentrates
  estimates around a possibly-wrong point. Prescription with a
  number: keep estimates independent until aggregation time
  (parallel arms must not see each other mid-run — they currently
  don't; keep it that way deliberately).
- **Kao & Couzin 2014 [canon].** Collective decision accuracy
  (Proc Roy Soc B). Accuracy from pooled noisy estimates in
  complex environments. → The math for WHEN collectives help
  (uncorrelated noise + enough members) — our founders' noise may
  be correlated (same ecology) which kills the benefit; test
  noise-correlation before assuming collectives help.
- **Sumpter 2010 [canon].** Collective Animal Behaviour (Princeton).
  Principles from ants to humans (self-organization, leadership,
  unanimity vs majority). → The textbook to replace ad-hoc
  collective intuitions; pairs with Seeley (mechanism) and Conradt
  (costs) as the complete shelf.
- **Berdahl et al. 2013 [canon].** "Emergent sensing of complex
  environments by mobile animal groups" (Science 339:574–576).
  Schools sense gradients no individual can (collective computation
  via movement). → EMERGENT SENSING: a future collective could
  perceive what no agent can — the strongest justification for
  multi-agent runs (not redundancy: new senses).

## Round 53 — mushroom-body and olfaction canon (the brain we copied, the nose we use)

Our learner is literally named mushroom-body in code; our cues are
odors. Time to read the source material.

- **Heisenberg 2003 [canon].** "Mushroom body memoir" (Nat Rev
  Neurosci 4:266–275). Fifty years of fly learning and the
  structure that runs it. → The biological spec sheet: our 16-dim
  linear learner vs the real sparse-coding + dopaminergic circuit —
  the gap list IS the architecture roadmap (sparsity first).
- **Aso et al. 2014 [canon].** Dopaminergic mushroom-body circuits
  (eLife 3:e04580). 21 MBON types, compartment-specific valence.
  → Real valence is COMPUTED per-compartment (not one scalar like
  ours); the actor-critic split has an anatomical address
  (MBONs ≈ actor, DANs ≈ critic-teacher). Validates the split and
  complicates it (21 channels, not 2).
- **Scheffer et al. 2020 [canon].** Hemibrain connectome (eLife 9:
  e57443). 25,000 neurons traced. → The ground truth our
  architecture gestures at; any claim of the form "agents can't"
  is now checkable against what flies DO with known wiring.
  (Use as existence proof, not blueprint.)
- **Buck & Axel 1991 [canon].** Odorant receptors (Cell 65:175–187;
  Nobel 2004). ~1000 receptor types, combinatorial coding.
  → Our 4-bit cues are a 16th of a percent of real olfactory
  dimensionality; the Umwelt point (round 32) quantified. Enrich
  cues before blaming the learner — now with the receptor count
  attached.
- **Friedrich & Laurent 2001 [canon].** Dynamic odor
  representations (Science 291:889–894). Decorrelation over time:
  representations sharpen with exposure. → Temporal dimension our
  frozen cues lack (patterns are static); real olfaction LEARNS
  the representation itself (contrast with our fixed phi).
  Representation-learning line, specified.
- **Keene & Waddell 2007 [canon].** Drosophila olfactory memory
  review (Nat Rev Neurosci 8:341–354). Short/middle/long-term phases
  (ARM, LTM, CREB-dependent consolidation). → Our single-timescale
  learner vs three biological phases; BALDWIN's consolidationRate
  was reaching for LTM without ARM in between. Three timescales
  specified (fast/middle/slow weights).

## Round 54 — wildcards I (physics of purpose: Kauffman-adjacent, Deacon, Walker, England, Goldenfeld)

Genuinely outside the box: what if adaptation, agency, and
individuals fall out of physics and information, no selection
required?

- **Kauffman 2000 [canon].** Investigations (Oxford; distinct from
  the 1993 Origins canon). Autonomous agents + the adjacent
  possible (life expands into what is one step away). → The
  program's search spaces are adjacent-possible walks whether we
  admit it or not; design banks AS adjacent possibles of each
  other (small codebook steps) instead of random remaps — the
  transfer line, re-graded by reachability.
- **Deacon 2011 [canon].** Incomplete Nature (Norton).
  Teleodynamics: purpose emerges from constraint propagation
  across orders (thermo/morpho/teleo). → The most serious
  philosophical account of WHERE goals come from — our agents'
  "goals" (approach/avoid) are morphodynamic, not teleodynamic;
  the book says what would have to change (self-constraining
  closure, cf. Rosen round 30).
- **Walker & Davies 2013 [canon].** "The algorithmic origins of
  life" (J R Soc Interface 10:20120869). Information + selection
  before genes (causal efficacy of information). → Complements
  GARD/RAF (round 29) with the physics: information must DO work
  to matter — our weights DO work (they steer); the question is
  whether they do ENOUGH work to count as information (Adami's
  metric, round 38, decides).
- **England 2013 [canon].** Statistical physics of self-replication
  (J Chem Phys 139:121923). Dissipative adaptation: driven systems
  develop lifelike organization spontaneously. → The wildest
  legitimate claim on this map: adaptation WITHOUT selection
  (thermodynamics does the work). If even partly true, our
  selection lines compete with physics — test: do unselected
  (random-drift) lines self-organize measurably? (Zero-world
  analytic on frozen unlearned rows: structure vs initialization.)
- **Goldenfeld & Woese 2011 [canon].** "Biology's next revolution"
  (Nature 469:343–344). Collective evolution, HGT-dominated early
  life; the web before the tree. → The mating track's horizontal
  vision, from the top: before accurate vertical transmission
  there was collective sharing. Our exact-copy fixation may be
  historically backwards — transmit loosely first (like early
  life), exactify later.
- **Thompson 2007 [canon].** Mind in Life (Harvard). Autopoiesis +
  phenomenology synthesis (the living body as the root of mind).
  → With Varela (round 36) and Rosen (round 30), the enactive
  trilogy completes; the program's embodied-learner bet gets its
  fullest statement (and its hardest test: where is OUR agents'
  experience? nowhere yet — honest).

## Round 55 — wildcards II (collectives that sense, brains that count, teachers that cost)

- **Couzin & Krause 2003 [canon].** Self-organization and collective decisions (Adv Study Behav 32:1-75). The mechanisms review (positive/negative feedback, response thresholds, direction). → Pairs with Sumpter (principles, round 52) and Seeley (implementation, round 25): mechanisms here, translation there.
- **Dickinson et al. 2000 [canon].** "How animals move" (Science 288:100-106). Locomotion across scales (muscle to gait to control). → The movement bible our cruise/turn primitive ignores (no gait, no energetics of motion, no passive dynamics); smallest viable upgrade list for any motor revival.
- **Seeley 2010 [canon].** Honeybee Democracy (Princeton; the book
  behind the 2011/2012 papers). → The full decision pipeline
  (scouts → dances → quorum → liftoff) as an implementable
  protocol: our future collectives get a 200-page spec, free.
- **Woolley et al. 2010 [canon].** Collective intelligence factor
  (Science 330:686–688). A general c factor for human groups
  (social sensitivity predicts performance, not IQ). →
  Collectives have measurable intelligence DISTINCT from members
  — the metric for any future multi-agent line (measure c, don't
  just average rewards).
- **Henrich 2015 [canon].** The Secret of Our Success (Princeton).
  Cumulative culture made humans (not brains alone); Tasmania
  expanded. → The strongest form of the round-43 argument:
  culture IS the human adaptation; our agents have none. If the
  program ever claims human-like anything, this is the bar
  (cumulative, not just social, learning — ratchet required).
- **Tomasello 2014 [canon].** A Natural History of Human Thinking
  (Harvard; joint intentionality thesis). → Cooperation's cognitive
  prerequisite (shared goals first, helping second). Orders the
  social stack: joint attention → collaboration → culture. Our
  agents lack step one (no shared attention mechanism) — the
  honest starting point, not the end.
- **Scope-note misses (post-55).** Thorndike/Hull (superseded);
  quantum cognition (too far); Jaynes MaxEnt (still open —
  specified twice, never executed: DO the MaxEnt baseline);
  Haig (distant); astrobiology (no bodies off Earth).

## Rounds 56–57 — encounter-ecology + concentration (for MATE-ENCOUNTER GO follow-ups; 2026-10-31)

Motivation: ENCOUNTER-GO-V1 shows spatial concentration lifts compounding (hub 5 vs
spread 3). These rounds map what the outside literature knows about WHEN concentration
helps mating — and what would discriminate our birth-bottleneck sketch. arXiv is thin on
ethology (replicated finding: lek/IFD-mating/conspecific-attraction conjunctions return
~nothing); the mating literature lives in journals. arXiv-verified entries first, then
canon (verification deferred, established practice since R51).

- **arXiv:2607.06732v1.** Selection mechanisms, stationary distributions, reversibility
  in multiallelic Moran models. → The stationary law of the exact model class our mating
  lines approximate (Moran with selection); reversibility conditions tell us when
  lineage-founder frequencies carry information vs wash out — read before any V1b-style
  lineage claim (our founders mate ~once: far from stationarity, so founder frequencies
  are noise — consistent with V1c null).
- **arXiv:2606.17125v1.** Allee thresholds, saddle-node bifurcations, optimal sterile-male
  release. → Mate-limitation Allee effects FORMALIZED + the applied version of our problem
  (SIT optimizes release spacing to SUPPRESS encounters; we want the inverse). Saddle-node
  structure predicts threshold nonlinearity: concentration helps only above a critical
  encounter rate — our +2 margin may sit near the threshold (test: dose spacing, not just
  hub-vs-spread).
- **arXiv:2607.09420v1.** PesTwin: modular agent-based pest/vector population control.
  → A maintained ABM twin for encounter-rate interventions (release grids, trap spacing);
  the closest existing in-silico lab for our encounter-topology questions — mine its
  spacing-sensitivity analyses before designing any scaled-hub follow-up.
- **arXiv:1605.06084v2.** Strong Allee effect in stochastic logistic model with mate
  limitation + immigration. → The minimal model of our bottleneck (mate-finding Allee +
  stochasticity): predicts high P(childless) at low density even with viable transmission
  — our spread arm (3/6 childless at gen-2) matches qualitatively.
- **Bradbury 1981 [canon].** The evolution of leks. hotspot vs hotshot vs female-preference
  hypotheses (mate-choice copying aggregates females → males follow). → Lekking IS the
  natural-hub experiment: concentration of mating WITHOUT concentration of food. Our hub
  confounds food + encounters (single hub does both). Discriminating follow-up licensed by
  this literature: hub-food WITHOUT hub-encounters vs hub-encounters WITHOUT hub-food
  (requires separate attraction knob — currently unbuilt, needs new rationale).
- **Emlen & Oring 1977 [canon].** Ecology, sexual selection, and mating systems (Q. Rev.
  Biol.). → The environmental-potential-for-polygyny thesis: clumped resources → defensible
  → polygyny. Our hub result is a micro-instance (clumped food → concentrated mating).
  Predicts: uniform food + clumped MATES should concentrate mating WITHOUT the birth
  boost — the cleanest test that our effect is encounter-rate, not energy.
- **Stephens & Sutherland 1999 [canon].** Conspecific attraction / social information in
  habitat selection (from Consequences of the Allee effect; Danchin & Wagner 1997
  hetero-specific copying). → Animals use EACH OTHER as habitat cues (the mechanism our
  attraction-knob would implement). Mate-choice copying (Gibson & Hoglund 1992 sage
  grouse [canon]) is the mating-specific form — and MATE-SOCIAL's null (copybest 1 =
  maternal 1) says our agents lack the copying machinery entirely: no social information
  use, so no conspecific-attraction channel. Attraction-knob work must BUILD copying
  first (mechanism gap, not parameter gap).
- **Scope-note.** Sex-allocation theory (e.g. 1608.03102 sex-ratio detection) is out of
  scope (fixed 50/50 founders, no allocation knob). OpenAlex 429 throughout (deferred again).

## Round 58 — encounter math from outside ecology (2026-10-31)

Motivation: the mating literature is journal-bound, but encounter-rate MATH lives in
arXiv-friendly fields. This round imports it.

- **arXiv:2111.05958v1.** Social distancing / gathering / search games on networks
  (lazy random walks, pairwise-distance objectives). → The FORMAL DUAL of our encounter
  problem (dispersion games = rendezvous with sign flipped). Rendezvous/search-game values
  scale with meeting-time distributions, not densities — predicts our spread arm's
  childlessness is meeting-time variance, not mean density (test: measure time-to-first-
  mating per history; variance should dominate).
- **Gal 1980 / Alpern & Gal 2003 [canon].** Search Games / Theory of Search Games.
  → Optimal rendezvous strategies (wait-for-mommy, asymmetric roles). Our flies all run
  the SAME policy (cruise + mate-approach); search theory says asymmetric roles (one
  waits, one searches) beat symmetric search. A sexes-differ search policy is a licensed
  mechanism hypothesis for a future attraction/encounter line — needs engine support
  (sex-conditioned policy does not exist).
- **McCall 1970 [canon].** Job search with reservation wage (QJE). → Mate search as
  optimal stopping: reservation-mate-quality + give-up time. Our flies never give up
  searching (no reservation). If encounters are rare, optimal policy may be LOWER
  selectivity (accept first mate) — predicts our bar-50 births come from unselective
  matings; a selectivity knob would test it (unbuilt).
- **Harris 1974 / contact-process canon.** Meeting as contagion on graphs. → Mating =
  transmission with contact rate λ; our hub raises λ. Contact-process survival thresholds
  give the same saddle-node prediction as the Allee round (R57): below critical λ the
  lineage dies a.s. — our spread arm's 3/6 childless histories may BE subcritical
  realizations, not bad luck. Discriminates via λ-dose (multiple hub sizes), not n.

## Round 59 — rendezvous optimality + horizontal transfer (2026-10-31)

Motivation: V1b (replication + time-to-first-mating) is executing; this round banks
the theory its diagnostic assumes.

- **arXiv:0906.5447v1 + 0912.0670v1.** Symmetric rendezvous search on Kn; Anderson-Weber
  strategy NOT optimal on K4. → The arXiv anchor for the R58 asymmetric-roles claim:
  optimal symmetric rendezvous REQUIRES role-breaking (one waits, one searches); the
  classic AW strategy is optimal only on restricted graphs. Our flies run identical
  policies (symmetric search) — the theory says this is provably suboptimal vs
  role-differentiated search. Sex-conditioned policy (unbuilt engine work) is now
  backed by named theorems, not just intuition.
- **arXiv:1404.3265v1.** Optimal rendezvous strategies in cognitive radio networks
  (different environments). → Environment-dependent rendezvous optima: the best meeting
  strategy VARIES with the environment (topology-dependent). Direct license for the
  encounter-topology program: spread-optimal and hub-optimal search policies may differ —
  a future line could test whether hub-evolved searchers beat spread-evolved searchers
  on the opposite topology (transfer-of-search-policy; distinct from body transfer).
- **arXiv:1211.1146v1.** Discrete modelling of bacterial conjugation dynamics. →
  Horizontal transfer as contact process (conjugation = mating without reproduction).
  Our maternal/copybest modes are vertical-only; conjugation models give the math for a
  HORIZONTAL transmission mode (peer-to-peer weight sharing on contact) — unbuilt, but
  now a specified mechanism with a modelling reference if vertical lines exhaust.
- **Scope-note misses (59).** Mating-cost/longevity trade-offs and sperm-raffle models
  return nothing on arXiv (journal literature; OpenAlex still 429). Noted, not pursued —
  no engine knob for mating cost exists, so the literature would be un-actionable.

## Round 60 — criticality + quorum-gated motility (for V1c dose framing; 2026-11-01)

Motivation: V1c (attempt-03 executing) is a 3-point dose curve over concentration.
These two entries frame what a dose curve MEANS for collectives.

- **arXiv:2211.03879v1.** Phase transitions and criticality in collective animal
  behavior (review: schools/flocks/swarms as statistical-physics systems; the
  criticality hypothesis — collectives poised near a (pseudo-)critical point for
  maximal susceptibility/information flow). → Reframes V1c: if mating-compounding is
  a collective phenomenon, the hub/spread contrast is a DETUNING from criticality,
  and the dose curve should show threshold/susceptibility structure, not linearity.
  A flat V1c dose curve would then read as off-critical-range (wrong dose window),
  not necessarily no-effect — a pre-registered interpretive lens, not a gate change.
- **arXiv:1909.12758v1.** Quorum-sensing active particles with discontinuous motility
  (mean-field theory; particles switch motility when self-generated field exceeds
  a threshold; density-polarization coupling solvable). → The mechanism analogue our
  flies LACK: no density-gated behavioral switch exists in the agent policy (cruise
  + mate-approach are density-blind). If V1c shows a threshold dose pattern, the next
  mechanism hypothesis is a quorum-gated policy (slow near conspecifics / dwell at
  high-contact patches) — engine + policy work, specified here, built nowhere.
- **Scope-note.** Quorum-decision mapping (1703.01353, seen R59) and biofilm threshold
  (2112.02683) are adjacent but add no new actionable prediction beyond the two above.

## Round 61 — attraction math for the Emlen-Oring split (2026-11-01)

Motivation: V1c closed NOGO with a food-confounded hump (duo wins with most food).
The mandated next rationale (Emlen-Oring food-vs-encounter split) needs a SOCIAL
attraction mechanism independent of food. This round banks its math.

- **Keller-Segel canon (arXiv:1304.1583v1 blowup; 2510.14297v1 DeepLagrangian
  aggregation; 2304.10024v2 KS-FKPP waves).** Chemotaxis = attraction up a
  self-generated gradient with finite-time blowup (aggregation singularity) unless
  logistic damping checks it. → The PDE template for an attraction knob: agents emit
  (signal already exists in the engine) + move up the emitted field. Blowup-vs-damping
  is the design constraint (unbounded attraction collapses the ecology; damping sets a
  finite aggregation scale). Our engine HAS a signal channel (scent) with its own
  energetics — the KS template says how to wire it into motion.
- **Swarmalators (arXiv:2208.14803v1 review; 1912.02758v1 forced; 2512.01345v1).**
  O'Keeffe et al.: phase-sync COUPLED to spatial aggregation (sync attracts like-phase,
  swarming moves toward synced neighbors). → The discrete-agent template our policy
  could actually implement: attraction conditioned on a pairwise state (phase/sex/
  mating-readiness), not a field. Sex-conditioned attraction (males approach females
  beyond the current mate-sensor range) is the minimal Emlen-Oring knob: it separates
  encounter structure from food geography with no field solver.
- **Scope-note misses (61).** IFD-unequal-competitors, offspring-overdispersion,
  state-dependent-mating, honeybee house-hunting, changepoint dose-response, Morse
  swarms: all NO-RESULTS on arXiv (journal literature; OpenAlex 429). The overdispersion
  lens for our outlier histories (V1c duo 429019: 4 gen-2) stays canon-deferred —
  noted because Lloyd's mean-crowding / Taylor's power law would quantify it.

## Round 62 — mating as a two-sided search market (2026-11-01)

Motivation: V1c duo histories have 4–10 births — encounters EXIST there, which
re-opens what ENCOUNTER_ESTIMATE closed: courtship/assessment. If mates meet but
pairings are random, the next lever is CHOICE. Economics formalizes exactly this.

- **Directed search (arXiv:2501.11753v3 information design + search segmentation;
  2102.09017v2 optimal search on matching platforms).** Two-sided markets with
  search frictions: one side posts terms (signals), the other directs search toward
  preferred terms. → The formal template for courtship + female choice: male display
  (posted term) + female directed search (choice). Our mating is RANDOM conditional on
  encounter (no assessment knob) — directed search predicts assortative gains from
  even a coarse quality signal. A quality-signal + preference knob is now specifiable
  (post-encounter assessment, unbuilt) with market-design math instead of hand-waving.
- **Epidemic thresholds on heterogeneous networks (arXiv:1010.1646v2; 1305.4819v2
  SIS threshold nature; 2102.11602v2 degree-dependent transmission).** Threshold =
  f(degree heterogeneity): hub nodes (superspreaders) lower the invasion threshold.
  → The network reading of our outlier histories (V1c duo 429019: 4 gen-2; V1b hub
  428019: 3 gen-2): high-degree lineages drive compounding. Lineage founder-spread
  data (already collected in dev-results) could test whether gen-2 concentrates in
  few founders — a post-hoc analytic on FROZEN artifacts, zero new worlds, licensed
  as measurement not claim.
- **Scope-note.** Handicap/costly-signaling canon (Zahavi/Grafen/Johnstone) stays
  journal-deferred; the market-design entries above subsume the actionable part
  (signal + directed search) without it.

## Round 63 — using a larger sensorium (for ATTRACT's learned-use risk; 2026-11-01)

Motivation: attempt-01 executing. The plan's stated honest risk: mate approach is
LEARNED, so the policy may not exploit 2x sensing in 1792 ticks. This round banks
the normative benchmark for what exploiting it would look like.

- **Infotaxis line (arXiv:2112.10861v3 beating infotaxis in POMDP framing;
  1010.2728v2 trajectories; 1408.1873v1 under model error; 2207.04277v2 optimal
  Bayesian olfactory search).** Information-based search: move to maximize expected
  information gain about source location. → The normative policy for a 2x sensorium:
  distant detections should reshape the search prior (not just trigger approach).
  Our actor does TD-style credit on approach outcomes — no information-gain term.
  If spread2 fails while the sensing proof holds, the gap is normative-vs-learned
  USE, and the licensed next diagnostic is an infotaxis-style probe (do 2x agents
  alter search patterns on detection, or only approach vectors?).
- **Collective sensing (arXiv:1506.06698v2 emergent chemotaxis without single-cell
  sensing; 2110.10260v1 limited positional info; 2610.04415v1 emergent Bayesian
  inference; 1711.06909v2 fish schools).** Groups sense what individuals cannot
  (many-wrongs + emergent inference). → Inverted lens on our null: our flies all run
  the SAME policy with PRIVATE sensing (scent channel exists but mate search doesn't
  use social information). A group that pooled detections would beat any individual
  sensorium extension — the R58 copying-gap restated quantitatively. Attraction-knob
  work that only extends private range leaves the social-information channel
  unbuilt; a future line could test detection-sharing (signal-gated approach).
- **Scope-note.** Ant locomotion modeling (2603.02665v1) is descriptive tracking, no
  actionable prediction for sensing use; logged, not pursued.

## Round 64 — why learned policies ignore new sensors (for ATTRACT's flat contrast; 2026-11-01)

Motivation: ATTRACT NOGO with a proven-engaged knob = the policy never learned to
USE 2x sensing. This round asks what the learning literature knows about that failure.

- **Lazy vs rich training (arXiv:1906.08034v4 disentangling; 1905.10917v5 TD lazy/mean-field;
  2506.16884v2 continual-lazy scaling; 2209.09658v2 lazy-vs-hasty schedules).**
  Networks in the lazy (kernel) regime barely move features — informative NEW inputs
  get near-zero weight and stay there. → Our actor (small net, TD updates, 1792 ticks)
  plausibly sits in the lazy regime for the mate channels: 2x detections arrive but
  feature weights never grow enough to steer behavior. Testable prediction: mate-input
  weights should be ~frozen from init in ATTRACT rows (weights are checkpointed —
  read-only analytic on frozen artifacts, zero new worlds).
- **Grokking as lazy→rich transition (arXiv:2310.06110v3; 2609.26679v1 spectral/weight-decay;
  2605.09724v2 capacity; 2601.03162v2 preconditioning to rich).** Generalization emerges
  at the transition, often LONG after memorization (capacity + weight decay control the
  timescale). → Our 1792-tick window may simply END before the transition: the policy
  memorizes approach-vectors (lazy) without ever grokking detection-use (rich). Two
  licensed follow-ups: (a) longer-window replication (exposure extension, needs new
  rationale — TURN-GATE V1e precedent for exposure-doubling design); (b) weight-decay/
  capacity knob on the actor (unbuilt, needs rationale).
- **Sensor substitution (arXiv:2502.09180v3 tactile→visual ML).** Thin (one applied paper);
  biology canon (Bach-y-Rita) stays journal-deferred. Logged for completeness: the
  applied field confirms new-sensor USE requires dedicated training, not just exposure.
- **Actionable now (zero worlds):** mate-channel weight-frozen check on ATTRACT
  attempt-01 artifacts (lazy-regime read). If weights moved but behavior didn't, the
  limitation is downstream (actuation/policy), not feature-learning — discriminates
  the two failure loci without spending a seed.

## Round 65 — suppression-as-evidence and its pitfalls (for ATTRACT-V1b's exact null; 2026-11-01)

Motivation: V1b returned an EXACT null (5v5/27v27/22v22) under a proven-engaged knob.
Mech-interp has a name for this situation and a catalog of ways it misleads.

- **Activation patching best practices (arXiv:2309.16042v2 metrics+methods;
  2311.17030v2 subspace illusion; 2606.27510v1 curse of multiple mediators;
  2504.02976v1 localized-vs-distributed).** Patching (interchange intervention) is
  the field's suppression test — and the literature's warning label reads directly
  onto V1b: (a) the subspace ILLUSION — an intervention can appear to isolate a
  component while the behavior routes elsewhere (our 0.5x patched sensing while
  mating routed via proximity); (b) multiple mediators — patching one path misses
  compensatory/f parallel paths (food-driven locomotion compensates sensing loss);
  (c) metric/method consensus absent — no single patching readout is canonical.
  The prescription imported: a suppression null must be accompanied by a POSITIVE
  control showing the intervention CAN move the outcome somewhere (our scripted
  two-fly proof is exactly this — and it held, localizing the null to the policy
  level, not the knob).
- **Deprivation designs (arXiv:1903.11915v1 early-deafness connectivity reshaping).**
  The one arXiv-verified deprivation entry: removing a modality RESHAPES the rest
  (no silent nulls in plastic systems). Our 1792-tick window may be too short for
  reshaping — a second reason (besides the structural bypass) the exact null is
  unsurprising. Dark-rearing/cavefish/Weber-law conjunctions return nothing on
  arXiv (journal literature; OpenAlex 429) — logged, not pursued.
- **Scope-note.** Lottery-ticket/lesion-classification (2008.12141v1) is applied
  pruning, no causal-evidence methodology; dropped after screening.

## Round 66 — mating as a diffusion-limited reaction (for PROXIMITY dose scaling; 2026-11-01)

Motivation: V1 executes a mating-range dose (13/26/52u). Reaction kinetics is the
outside theory of rate-vs-radius.

- **Diffusion-limited reactions (arXiv:1104.2414v5 Brown review — Smoluchowski
  critique/generalization; 1605.01279v2 small-target asymptotics; 0905.4629v1 master
  equation limit; 1301.0547v2/1411.0611v2/1503.07279v1 rate comparisons).**
  Smoluchowski rate scales with reaction radius (k ~ R in 3D); the small-target
  asymptotics (1605.01279v2) give the 2D correction our arena needs. → Pre-registered
  lens for V1 births scaling: naive area scaling predicts 1:4:16 for radii 1:2:4;
  Smoluchowski-linear predicts 1:2:4; 2D moving-agent kernels (speed-dependent,
  saturating) predict sublinear. The observed 1:1.44:1.78 pattern will discriminate
  these in the RESULTS doc — descriptively (no gate was built on scaling).
- **Scope-note.** Zooplankton encounter kernels (Gerritsen-Strickler/Kiorboe) and
  contact-rate foraging models return nothing on arXiv (journal literature; OpenAlex
  429) — the qualitative prediction (encounter rate rises with radius AND speed,
  saturating) is used without citation; the risk (untestable at 3 dose points) is
  noted, not hidden.

## Round 67 — simulators as do-operators (our method, formalized outside; 2026-11-02)

Motivation: V1b executed a breadth-held food contrast — a matched interventional
design. The external literature now names what the program has been doing.

- **arXiv:2605.07467v1.** Physical Simulators as Do-Operators (causal discovery
  under latent confounders with expensive first-principles Sims). → Our frozen-plan /
  single-attempt / fresh-bank discipline IS a do-operator protocol: the simulator is
  the intervention device, banks are exchangeability units, the single attempt is the
  pre-registered do(). The paper's problem (latent confounders + costly Sims) matches
  ours exactly (bank variance + ~15min/runs). Import: their confounding-robust
  estimators (flow matching over simulation data) as the future upgrade path for our
  pooled cross-bank narratives — currently descriptive only, by discipline.
- **Matching designs (arXiv:2205.02224v1 matched restricted-mean-survival;
  2511.23208v1 staggered-adoption matching; 2609.40051v2 proximal balancing).**
  Matched/stratified designs identify effects by holding confounders constant. →
  The V1b split pair (hubR2/spreadR2, breadth held) is a matched design with matching
  on the DOSE variable — the strongest causal form the program has run. Recorded as
  precedent: future adjudications should match on the established driver (here
  breadth), not merely control the background.
- **Scope-note.** Factorial/blocked-design theory (1907.02373v1, 2207.02397v3) and
  agricultural frameworks (2603.09041v1) are adjacent but add no new constraint beyond
  what the frozen-gate discipline already enforces (pre-registration > optimal
  blocking at our n). Ideal-despotic/resource-defense conjunctions return nothing on
  arXiv (journal literature; Emlen-Oring stays canon-cited).

## Round 68 — the policy as a rate-distortion point (for MAXENT's 0.5753 bits; 2026-11-02)

Motivation: MAXENT-V1 measured 0.5753 bits/contact (58% of ceiling). This round
identifies what that number IS in the outside literature.

- **Information-theoretic bounded rationality (arXiv:1511.01710v1 parametric priors;
  2607.12412v1 bounded agent as information channel; 2606.09858v1 action-sufficient
  compression).** Bounded rationality = rate-distortion: the policy is a channel with
  capacity cost (relative entropy from the prior/marginal), and behavior sits on the
  rate-utility frontier. → Our 0.5753 bits is a RATE-DISTORTION POINT: the learned
  policy pays ~0.58 bits/contact of channel capacity for its 0.87/0.05 split; the
  MaxEnt null pays 0 and gets the marginal. The 42% gap is DISTORTION the policy
  accepts (or cannot afford to remove). Pre-registered lens (not a gate): future
  policy changes (gain, brakes, capacity) should move this point ALONG the frontier
  (more bits + more return) — a change that spends bits without return is pure
  capacity waste; a change that gains return without bits is free distortion reduction.
- **Information bottleneck (arXiv:2004.11935v1 variational bandwidth bottleneck;
  2210.14861v1 bottleneck principle; 2507.04388v1/2310.19906v1/2001.00396v4
  attribution bottlenecks).** IB = minimal sufficient compression of input for output.
  → The normative counterpart to our measured rate: the MINIMAL bits a turn policy
  needs for a given return. Our 0.58 bits is an upper bound on the necessary rate
  (greedy may waste capacity); the IB frontier would say how much is sufficient.
  Specified, not executed: IB-frontier probe on frozen rows needs its own plan.
- **Scope-note.** Wireless-sensing rate-distortion (2303.11857v2) and moral-geometry
  (2501.08865v1) are adjacent, not actionable; logged, not pursued.

## Round 69 — the binary policy's implicit cutoff (for IB's alphabet-2; 2026-11-02)

Motivation: IB-V1 found k95=k99=2 — the policy IS a binary classifier on valence.
A binary classifier has a cutoff, and cutoffs imply cost ratios. This round prices it.

- **Optimal cutoff under asymmetric costs (arXiv:2605.07829v1 parametric ROC/cutoff
  with skew-normal mixtures; 2512.23133v1 optimizing generalized binary metrics).**
  Youden's J (symmetric) is suboptimal when misses cost more than false alarms;
  optimal cutoffs fold in prevalence + cost asymmetry. → Read our turn rates
  (0.87|harmful vs 0.05|beneficial) as a REVEALED cutoff: the policy acts as if
  missing a harmful cue costs ~order-of-magnitude more than false-alarming a
  beneficial one (exact ratio needs the score distributions, unlogged — specified
  as a frozen-rows extension, not executed). The SDT d' from VALUE-PROBE and this
  cutoff analysis are complementary halves of the same ROC: d' = discriminability,
  cutoff = policy. Both now exist for this bank.
- **Dichotomization costs (arXiv:1101.0788v2 valued ties: don't dichotomize network
  edges).** Thresholding continuous values discards information — the price of our
  alphabet-2. → Pairs with the 42%-unused finding (MAXENT-V1): part of the unused
  information is dichotomization loss (continuous cue evidence collapsed to a bit
  before acting). A graded-intake line (R46 Kelly prescription) would recover it;
  the cost of binarity is now bounded above by 0.42 bits/contact on this bank.
- **Scope-note.** Engineering-detection conjunctions (1407.4173v1, 1004.5479v1,
  MIMO/phase-retrieval) are methods-adjacent, not actionable; categorical-perception
  conjunctions return nothing on arXiv (Harnad stays canon-deferred).
