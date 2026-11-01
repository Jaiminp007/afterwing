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

## Round 70 — transplanting knowledge across basins (for INFORMED's null; 2026-11-02)

Motivation: V1b executing with a turn-gate donor in a fresh mating recipient. The
transplant assumes cross-basin compatibility — the outside literature names the risk.

- **arXiv:2209.04836v6.** Git Re-Basin (merging models modulo permutation symmetries;
  single-basin-after-permutation thesis). → The assumption our donor transplant makes:
  turn-gate-trained weights function in a fresh-seed recipient with different history,
  ecology, and codebook. Re-Basin says different-seed nets live in permuted basins —
  direct copies CAN work when architectures/optimizers align (turn-gate precedent:
  same-architecture transplants succeeded), but functional transfer is NOT guaranteed
  by shape match (our digest only checks shapes+values, not basin alignment). If V1b
  returns null, basin mismatch joins policy-limitation as a licensed alternative —
  pre-registered here, before the verdict.
- **arXiv:2404.04002v2.** Continual learning with weight interpolation. → The
  interpolation alternative to transplant: blend donor into recipient (alpha-mix)
  rather than overwrite. If wholesale transplant fails, graded blending is the next
  mechanism (needs its own rationale + frozen plan) — specified, not executed.
- **Scope-note.** LLM-merging surveys (2607.18026v1, 2501.09522v1, 2510.10977v2,
  2304.14933v2, 2506.11403v1, 2610.01037v1) are scale-specific (attention/merge
  arithmetic); the basin question transfers, the methods do not — logged, not pursued.

## Round 71 — non-exact replication (for V1c executing now; 2026-11-02)

Motivation: V1c (attempt-04 executing) is an EXACT-protocol replication on a FRESH
bank — i.e., a non-exact replication in the formal sense (different seed draw =
different data-generating-process realization). This round banks the framework that
will interpret either verdict.

- **arXiv:2604.26268v2.** Non-exact replications: binary replicated/not-replicated
  tallies assume rarely-attainable exactness; formalized as shared-latent-rate
  (benchmark: experiments exchangeable conditional on a latent rate) vs alternatives.
  → The V1/V1c pair maps onto this directly: same protocol, different banks. Under
  the shared-latent-rate benchmark, the questions are (a) direction preserved?
  (b) shape preserved (monotone)? (c) level preserved? The frozen V1c bar gates on
  (a)+(b) — deliberately NOT (c), since bank intercepts were already known-volatile
  (V1b's spread 25→33). A GO-with-different-levels is still a successful non-exact
  replication under this framework — pre-registered here so it reads as discipline,
  not goalpost-moving, if that is what the data show.
- **Scope-note.** Decline-effect/heterogeneity conjunctions return only noise on
  arXiv (ZetaDial protein engineering is unrelated); the journal literature
  (Many Labs, decline effect, hidden moderators) stays canon-deferred — the
  non-exact framing above subsumes the actionable part.

## Round 72 — mechanisms already in the engine, never formalized (2026-11-02)

Motivation: the closed mating arc implemented (but never analyzed) three textbook
mechanisms: ecological inheritance (founders deplete shared food), reproductive
variance (per-seed gen-2 spreads), and symmetric parental investment (24/24 energy
cost). This round banks their formalisms for any future program use.

- **arXiv:1810.01142v1.** Bet-hedging in expanding populations (beyond well-mixed
  theory: range expansions change the hedge calculus). → Our founders ARE a range
  expansion (36 seeded, spread over 640k units); per-seed gen-2 variance
  (V1c: [1,1,3,3,0,3]) is the raw material of a hedge. The paper's question maps
  directly: is the observed lineage variance risk-spreading or noise? Untested
  (needs a variance-partition design, specified not executed) — but the null
  interpretation of every "outlier history" in the program is now named.
- **arXiv:1807.01735v2.** Asymmetric evolutionary games with environmental feedback
  (strategies modify the shared environment, which feeds back on payoffs).
  → The formalism for our depletion loop: foraging depletes food → depleted food
  changes mating payoffs → lineages evolve under self-modified selection. Our
  program measured the loop's endpoints (hub starves −41.9; duo eats best −20.5)
  without ever writing the feedback equation. Any carry-over/persistence design
  must start here, not from statics.
- **arXiv:1711.09424v1.** Collapse of ecosystem engineer populations (engineers
  build the habitat they depend on; over-engineering collapses it). → The cautionary
  twin: concentration (hub) engineers high-encounter habitat AND depletes it —
  our hub-starvation finding IS engineer overshoot at small scale. Scales the
  Emlen-Oring split: food-clumped ecologies carry intrinsic collapse risk that
  spread ecologies don't (matches hub −41.9 vs spread −24.3 energies).
- **Scope-note.** Niche-inheritance (1403.7413v1 cancer-only), parent-offspring
  bioassay (1205.0931v1 feral dogs), intragenomic-conflict conjunctions: no
  actionable formalism on arXiv (Trivers/Haig/Odling-Smee stay canon-deferred).
  The 24/24 symmetric parental cost in our engine is thus an unmodeled arena —
  logged as an open mechanism, not pursued (needs the coupled-line decision first).

## Round 73 — when transmission sustains evolution (for the whole mating arc; 2026-11-02)

Motivation: the closed mating arc needs its one-sentence theoretical epitaph. This
round found it, plus the fidelity limits that bound any future transmission work.

- **arXiv:1112.2741v1 (Frank).** Selection VERSUS transmission: an evolutionary unit
  is hereditary information for which selection bias DOMINATES transmission decay;
  the selection-bias/transmission-bias ratio unifies mutation-selection balance,
  Eigen's error threshold, and levels of selection. → THE arc epitaph: our
  transmission is faithful (INHERIT exact-copy verified; decay ≈ 0) but selection
  bias ≈ 0 (V1/social nulls, INFORMED no-establishment) — ratio ≈ 0 either way, so
  nothing compounds. The program spent 15 lines discovering that BOTH terms of
  Frank's ratio must be nonzero. Every future line should state which term it moves.
- **Eigen cluster (arXiv:9807398v3 error threshold + mutational meltdown;
  1506.00349v1 Gaussian-landscape thresholds; 1011.5098v3 variational ansatz;
  1212.1488v2 diffusive stability; 1503.03343v3 two-valued landscapes).** Fidelity
  has a CLIFF (error threshold), not a slope: below-critical fidelity, information
  melts down entirely. → Our transmissionNoise knob (tested null/0.05) never mapped
  the cliff: the mutation axis is unexplored between 0.05 and meltdown. Specified,
  not executed: a noise-dose line (fidelity cliff search) needs fresh rationale +
  frozen plan + fresh bank — and it is now the ONLY untested transmission-axis
  degree of freedom (copy-rule and heterogeneity both closed).
- **arXiv:2109.09357v1.** PDE protocell model: multilevel selection origin of
  chromosomes (within- vs between-protocell selection). → The formal version of our
  founder-vs-lineage tension (niche fingerprint: weights ARE niche models; selection
  acts on founders, compounding needs lineages). Multilevel framing for any future
  group-selection design — specified, not executed.
- **Scope-note.** Wafer-scale agent evolution (2404.10861v3) is infrastructure, not
  theory; political-order transitions (1512.03419v2) are out of scope; early
  multicellularity geometry (1403.7556v1) and punctuated climate (2212.06239v2) are
  adjacent, not actionable.

## Round 74 — establishment as nucleation/percolation (for INFORMED's void; 2026-11-02)

Motivation: INFORMED's donor lineage never established (gen-2+ 0v0). Physics has two
names for this failure mode, with quantitative thresholds attached.

- **Classical nucleation theory (arXiv:2608.06220v1 geometric closure; 1704.03369v1
  core-shell growth; 1807.09293v1 binary-solution kinetics; 2003.02749v1 seeding
  approach; 2607.05194v1 time-reversal breaking).** Subcritical nuclei dissolve;
  supercritical grow — separated by a critical radius where bulk gain beats surface
  cost. → The donor lineage as a subcritical nucleus: 1 gen-1 cannot pay the
  "surface cost" (mate-finding Allee effect at lineage size 1). The theory predicts
  WHAT would establish: a critical lineage mass (multiple simultaneous donor-line
  matings — i.e., seeding N donors, not 1). Specified, not executed: N-donor
  seeding (critical-mass test) needs fresh rationale + frozen plan + fresh bank —
  and it reframes INFORMED's NOGO (n=1 seeding is expected to fail under nucleation).
- **Contact-process percolation (arXiv:1912.09825v3 spread-out threshold;
  1810.04545v2 adaptations vs spreading; 0502373v2 two-pathogen thresholds).**
  Spread/no-spread is a threshold in transmissibility × degree. → Our mating graph
  (who meets whom within 26u) is a temporal contact network; lineage percolation
  needs the product above threshold. Hub concentrates degree (helps); 1792 ticks
  caps path length (hurts). The threshold lens predicts the observed pattern class:
  thin margins near criticality, wild bank swings (critical fluctuations) — i.e.,
  the program's entire +1/+2-margin phenomenology is what NEAR-CRITICAL mating
  graphs look like. Recorded as interpretation, not a gate.
- **Scope-note.** Bleb/membrane nucleation (1602.03646v1) and fluid-leakage
  percolation (1512.00186v1) are mechanism-mismatched; digital contact tracing
  (2103.12634v5) is applied-epi. Logged, not pursued.

## Round 72 — superposed steering forces (for ATTRACT-V2's knob; 2026-11-02)

Motivation: V2 executes a hardwired mate-attraction term superposed on food/wall
steering — exactly the Social Force Model's structure. This round banks that literature
and the joining-game alternative the knob does NOT implement.

- **Social Force Model (arXiv:0810.4587v1 evolutionary calibration to tracking data;
  0803.1319v1 repulsive force; 1705.03569v1 dynamic navigation field; 2109.12597v1
  crowd review; canon Helbing & Molnar 1995/1998 via arXiv:cond-mat/9805244 [listed,
  abstract fetch 400s]).** Pedestrian motion = superposition of destination attraction
  + neighbor repulsion + wall forces, each a vector term in one equation. → Our
  motorPrimitive has the same architecture (food + wall + now mate terms inside one
  tanh). The calibration papers' lesson: force weights are FIT to trajectories, not
  derived — our k=2 parity choice is the honest prior; fitting k would be tuning
  (pre-registered as NOT done). If V2 nulls, the SFM lens says the mate term may be
  structurally present-but-weak vs food/energy terms — a weight-magnitude question,
  specified-not-executed (needs its own frozen design; magnitude sweep is tuning
  without a pre-registered selection rule).
- **Joining / producer-scrounger (conjunctions return nothing on arXiv; Giraldo,
  Barnard-Sibly canon-deferred).** Animals attracted to OTHERS' discoveries (joining
  successful foragers) — the social-information use our agents lack entirely (no
  observation of others' intake). Our taxis steers toward mates as BODIES, not toward
  successful FORAGERS as information. The distinction matters: conspecific attraction
  (implemented) vs intraspecific information use (not implemented, no channel).
  Recorded as the next mechanism gap if steering alone fails.
- **Scope-note.** BEECLUST/cockroach-aggregation and directed-search conjunctions
  return nothing on arXiv (swarm-robotics venues, not indexed); OpenAlex 429.

## Round 75 — saturation and leaving (for V3's uniform-low births; 2026-11-02)

Motivation: V3's hubAttract arm shows UNIFORM-low births (3,4,3,3,3,3 — zero variance)
with worst energy (−42.2) and unshifted timing. Two classic frameworks name this pattern.

- **Holling functional response (arXiv-verified: 1712.10159v1 Holling-II/Bedlington-DeAngelis
  reaction-diffusion; 2109.15027v1 density-dependent handling time, evolutionary view).**
  Type-II saturates: intake rate rises with encounters then flattens at 1/handling-time.
  → Our mating system behaves Holling-like in REVERSE across arms: hubAttract raises
  local density (encounters) but births FALL (19 vs 28) — consistent with handling-time
  dominance (cooldown 12 + energy 24 costs = long handling) PLUS interference (crowding
  tax on top of handling). The 2109.15027v1 lens is sharpest: handling time itself is
  density-dependent (crowds lengthen effective handling via depletion) — predicting
  exactly V3's uniform suppression. Descriptive fit, not a fitted model (no new parameters
  estimated — would need a frozen measurement plan).
- **Patch departure / giving-up (Charnov MVT + Brown GUD: canon, journal-bound —
  Brown 1988; Charnov 1976; NO arXiv conjunction hits despite three query phrasings).**
  Optimal foragers leave patches at the marginal rate; taxis DISABLES leaving (agents
  are pulled back into the depleted hub). → V3's −42.2 energy is the predicted cost of
  attraction-without-departure: the knob removes the exit option that makes clumping
  tolerable. This reframes the Emlen-Oring split outcome: food clumps are only viable
  WITH free departure; forced concentration converts a hub into a trap. Specified, not
  executed: departure-gated taxis (attraction that releases below an energy threshold)
  needs its own frozen plan + fresh bank.
- **Scope-note.** All three MVT/GUD conjunctions returned NO-RESULTS on arXiv
  (foraging theory lives in journals); OpenAlex still 429. Canon-cited with full biblio,
  verification deferred per standing practice.

## Round 76 — clustering without attraction (for V3's uniform-low births; 2026-11-02)

Motivation: V3 forced attraction and got uniform-low births (3,4,3,3,3,3) with zero
variance — the signature of a JAMMED cluster, not a foraging aggregation. Active-matter
physics says attraction is not even necessary for clustering — and that diversity
destroys it. Both halves reframe V3.

- **MIPS reviews (arXiv:2112.03979v3 + 2112.05024v1 introductions; 1502.02229v2
  coarsening; 2408.09763v3 background flow; 2308.05088v1 deformable cells;
  2201.07623v1 interparticle interactions; 2208.05937v2 no-1D-transition).**
  Self-propelled particles phase-separate from motility ALONE (persistence +
  crowding); no attraction knob needed. → Our founders already self-cluster by
  motility wherever density is high (hub). V3's k=2 did not CREATE aggregation —
  it overrode an existing motility-driven pattern with uniform taxis, plausibly
  converting a loose foraging cluster into a jam (uniform births, worst energy).
  Specified-not-executed diagnostic: cluster-size distribution (CSD) from frozen
  rows — exponential CSD = MIPS regime; bimodal = attraction-dominated. Needs its
  own frozen measurement plan (positions are logged? verify before specifying).
- **arXiv:2107.04049v2.** Speed diversity suppresses MIPS clustering (mixtures do
  not macroscopically coalesce; exponential CSD). → Founder speed traits vary
  22–34 (engine.mjs:38, ~±20% diversity) — built-in anti-jam heterogeneity. This
  may be WHY baseline encounters never compounded: diversity keeps clusters loose
  and transient, so proximity never persists long enough to matter AND never jams
  badly enough to starve. Two-sided prediction, both testable in principle: (a)
  clonal-speed populations should cluster harder (more compounding AND more
  starvation); (b) forced uniform taxis (V3) destroys the diversity protection,
  jamming the cluster — exactly the observed uniform-low births.
- **arXiv:1612.03987v2.** Attractive active spheres: attraction/propulsion ratio
  controls assembly (too much attraction → non-foraging aggregates). → k=2 parity
  with food was arbitrary against this lens: the food coefficient evolved with the
  whole foraging economy, while mate-k=2 was copied without its economy. A ratio
  ladder (not a single k) is the honest follow-up — but magnitude tuning without a
  pre-registered selection rule is shopping (V2 plan); specified-not-executed with
  that warning attached.
- **Scope-note.** Chiral-interruption (2104.11657v5), rods/filaments reviews
  (1907.00360v2, 1802.07480v1), micellization experiments (2305.16659v3), inertial
  wetting (2406.01038v1) are mechanism-mismatched (chirality/shape/hydrodynamics
  absent from our substrate); logged, not pursued.

## Round 77 — taxis without brains, learned or otherwise (for V2/V3's hardwiring; 2026-11-02)

Motivation: ATTRACT hardwired taxis because learning never discovered it (V1/V1b).
The outside literature asks both halves: when does learning discover taxis, and what
can brainless substrates do without any learning at all?

- **Run-and-tumble chemotaxis family (arXiv:2507.23519v1 learning to tune switching;
  1709.04375v1 tumbling-frequency/persistence optima; 1908.05050v1 migration +
  accumulation with chemokinesis; 1103.5355v2 memory drift-vs-diffusion;
  2311.02735v4 entropy production; 1801.03721v3 path-integral E. coli).** The minimal
  taxis decomposes into exactly two knobs — run persistence and tumble rate — and
  2507.23519v1 shows ML agents CAN learn to tune switching probability from scratch.
  → Our agents' failure to learn mate-approach is therefore NOT a general
  learnability fact (bacteria-scale learners discover it); it is specific to our
  substrate (decoupled mating bypasses the action channel, so there is no gradient
  to discover — the structural finding, independently derived here). The two-knob
  decomposition also offers a finer instrument than our monolithic k: persistence
  vs tumble-rate knobs separately (specified-not-executed; needs its own frozen plan).
- **Physarum decision-making (arXiv:1905.06534v1 motivational-state tuning +
  self-trail use; 2506.12803v2 mechanical decision processes; 0901.4466v1 sailing;
  0912.3967v1 motorway routing; 2506.20572v2 network design).** Brainless plasmodia
  tune foraging to motivational state AND exploit their own chemical trails
  (stigmergy + state-dependence with zero neurons). → Two gaps in one entry: our
  agents lack (a) motivational gating of movement (energy only gates mating, not
  steering — the R75 departure-gating gap restated in a brainless system that HAS it),
  and (b) any trail/stigmergic channel (our scent channel exists but is unused for
  navigation — the R63 detection-sharing gap, independently confirmed as the missing
  piece). Physarum proves both are implementable without cognition.
- **Scope-note.** Path-integral (1801.03721v3) and entropy-production (2311.02735v4)
  formalisms are methods-adjacent, not actionable; logged, not pursued.

## Round 78 — the physics of the ledger (for the op economy itself; 2026-11-02)

Motivation: every verdict in this program is denominated in billed scalar operations
converted to energy at operationEnergy=5e-6/17. This round asks what that currency MEANS
physically — and how an outside observer would detect that selection (not just drift)
produced our lineages.

- **Landauer cluster (arXiv:2506.10876v2 principle + bound review; 0702094v3 Norton
  generalisation/critique; 2007.11748v1 fluctuation proof; 1411.6730v1 nanomagnetic
  verification; 1901.10327v1 physical foundations; 0210005v2 reversible-computing notes).**
  Logically irreversible operations (erasure) dissipate ≥ kT ln 2; practical processes
  dissipate orders of magnitude more. → Our pricing (5e-6/17 energy units per op) is an
  ACCOUNTING rate, not a physical one — but Landauer sets its floor: any claim that
  "computation cost constrains evolution here" must survive comparison to the bound.
  Concrete upshot: our forget/re-initialize operations (reset/freeze, weight overwrites
  in transplants) are the logically irreversible ones — the ledger already prices them
  (storageBytes, paidEnergy), so a Landauer audit of one attempt-ledger is computable
  from frozen artifacts (specified-not-executed: needs its own frozen measurement plan).
- **Assembly theory cluster (arXiv:2409.05993v1 natural-product evolution beyond genes;
  2403.12452v3 critique exchange; 2507.08852v1 reproducible assembly-index code;
  2509.04547v1 spatial patterning + selection; 2603.11086v2 life-detection application).**
  Selection detected via assembly index (copy number of complex objects), no genes
  required. → The formal version of our gen-2+ counting: a lineage that transmits
  high-assembly objects (learned weight vectors, copied exactly) IS the assembly-theory
  signature of selection — and our INCONCLUSIVE lines (transmission without compounding)
  are exactly "high copy number, low assembly depth." The 2507.08852v1 reproducible
  code makes this implementable: assembly index of transmitted weight snapshots from
  frozen rows (specified-not-executed: needs frozen measurement plan + weight-logging,
  which the program already owes itself — same conditional requirement as V1b).
- **Scope-note.** Nanomagnetic verification (1411.6730v1) and radialene synthesis
  (2606.08111v1) are mechanism-mismatched (substrate-specific); logged, not pursued.

## Round 79 — optimal search patterns and their collapse (for cruise/search baselines; 2026-11-02)

Motivation: every line in this program compares learned behavior against cruise/random
baselines — but never asks what the OPTIMAL search pattern would be. This round maps
that optimum and its limits.

- **Lévy flight foraging debate (arXiv:1804.03738v1 search-pattern identification;
  arXiv:2103.12584v1 refutation: inverse-square Lévy optimal ONLY under precise
  conditions, "generically unfounded").** The rise and fall of a movement prior:
  heavy-tailed step lengths beat Brownian ONLY for sparse, non-revisitable targets
  with blind search. → Our ecology (regrowing = REVISITABLE food, sensed cues) sits
  OUTSIDE the Lévy-optimal regime by the refutation's own conditions — a useful
  negative: do NOT graft Lévy steps onto the agent expecting gains. What the debate
  leaves open (and our program never tested): the optimal pattern for REVISITABLE,
  sensed, depleting patches is systematic coverage (parallel sweeps / site fidelity),
  not heavier tails. Specified-not-executed: a movement-pattern control arm
  (systematic vs cruise vs Lévy) needs its own frozen plan.
- **Plant foraging (NO arXiv hits across two phrasings; canon: Trewavas 2003/2014,
  Calvo plant neurobiology; journal-bound, verification deferred).** Roots forage
  without locomotion (proliferation toward nutrients, abandonment of poor patches) —
  the sessile version of our sit-vs-search tradeoff. → The outside-the-box reframe:
  our flies' cruise phase is the only search they have, but plants show foraging can
  be MORPHOLOGICAL (grow toward, retract from) rather than locomotor. Our genome
  already has a morphological channel (nodes/edges growth) that no line ever pointed
  at foraging — recorded as an unbuilt mechanism (morphological foraging), not a claim.
- **Immune search (arXiv: thin — microtubule capture 1905.12415v1 is intracellular
  logistics, not search strategy; CAR-T modeling 2609.39191v1 is clinical).**
  No usable T-cell Lévy entry found; logged as searched-not-found rather than
  canon-cited (discipline: do not cite what was not read).

## Round 80 — state-dependent movement rules (for V4's energy gate; 2026-11-02)

Motivation: V4 gates taxis on internal energy state. Movement ecology independently
concluded that movement rules MUST be state-conditioned — and that ignoring it biases
everything.

- **arXiv:2304.12964v1.** Behavioural states in step-selection analysis (model
  comparison: resting vs foraging states change both resource preferences AND
  movement patterns; standard SSA/iSSA ignoring states is misspecified). → The
  exact V4 gate, derived from field data: the same animal in different states
  follows different movement rules. Our V1–V3 instruments assumed a stateless
  taxis term (k always on); V4 makes it state-dependent for the first time.
  Reverse reading (honest): if V4 nulls, EITHER energy is the wrong state variable
  OR state-conditioning this policy cannot work at all — the round-80 paper
  cannot separate those either (their states are latent/inferred).
- **Houston & McNamara state-dependent foraging [canon: 1988/1999 books;
  journal literature, verification deferred].** Energy reserves as the state
  variable driving foraging decisions (the dynamic-programming tradition behind
  R46's Caraco citation). → The bar-as-threshold choice (E* ≡ mating bar) is a
  degenerate one-state version of their reserve-dependent policies; a full
  reserve-graded rule (k scaling with reserves, not on/off) is the natural V5.
  Specified-not-executed (needs frozen plan; V4's binary gate comes first).
- **Scope-note.** GUD/quitting-harvest conjunctions return nothing on arXiv
  (behavioral-ecology journals); the MVT/GUD canon from R75 stands. No OpenAlex
  attempt this round (rate-limit cooldown observed).

## Round 81 — receiver psychology: preferences as side-effects (for the ATTRACT knob; 2026-11-02)

Motivation: the ATTRACT arc asks what attraction knob to build, and keeps assuming a
mate-dedicated channel. Receiver psychology says preferences usually PRE-EXIST as
side-effects of sensory systems tuned for something else (food, predators), and signals
evolve to exploit them. Our agents have exactly this structure: food-tuned channels plus
a turn circuit. The outside-the-box flip: do not sense mates — let mate cues stimulate
the FOOD channel (a sensory trap), and modulate susceptibility by state.

- **Sensory bias / sensory drive [canon: Ryan 1990 (swordtail bias pre-exists the
  sword); Basolo 1990; Endler 1992; Ryan & Keddy-Hector 1992; journal-bound,
  verification deferred].** Female preference for a trait exists before the trait;
  selection acts on receivers first, signals second. → Our k=2 taxis term is built as
  if the receiver (turn circuit) evolved FOR mates. The bias-first reading: the turn
  circuit evolved for food gradients; a mate cue that stimulates it is a trap, not a
  signal — which predicts exactly V3's failure mode (foraging hijacked → starvation),
  and reframes V4's gate as state-modulated SUSCEPTIBILITY rather than state-gated
  navigation. arXiv exact-phrase searches ("sensory bias", "sensory exploitation",
  "mate copying") return zero behavioral-ecology hits (searched-not-found; the field
  lives in journals) — logged so nobody re-searches these strings.
- **Supernormal stimuli [canon: Tinbergen; journal/ethology texts, verification
  deferred].** Exaggerated stimuli outcompete the real object for the same receiver
  channel. → The knob-design corollary: a working attraction cue should be a
  SUPERSTIMULUS on the food channel (stronger-than-food gradient pull), not a
  parallel channel with its own arbitrary gain. V3's k=2 was tuned as if parallel;
  the supernormal reading says calibrate k against the FOOD gradient scale, with the
  starvation cost as the priced constraint. Specified-not-executed.
- **Neural reuse / massive redeployment [canon: Anderson 2010 After Phrenology;
  book/journal, verification deferred; arXiv "neural reuse" returns only ML noise
  (MATE autoencoders, music cognition) — searched-not-found].** Brain areas are
  reused for new functions without dedicated circuitry. → Mechanistic license for the
  trap design: reuse of the food-gradient turn path for mate approach is the NORM in
  nervous systems, not a hack. Our engine already implements reuse (one motorPrimitive
  for food+walls+mates); the literature says that is the right architecture and the
  failure is in the gating, not the sharing.
- **arXiv:2504.10401v1.** Selectivity gain in olfactory receptor neurons peaks at an
  OPTIMAL odor concentration (leaky integrate-and-fire + ligand-gated-channel model).
  → Receiver channels have dose optima: below it noise, above it saturation. Our
  gain-dose line (INVALID, baselines elevated) never modeled the receiver's own
  optimum. If attraction rides the food channel, the mate cue has a concentration
  window where it is discriminable — outside it, invisible or saturating. A
  dose-series on the trap (not on surprise-gain) is the unbuilt experiment; needs its
  own frozen plan.
- **arXiv:2109.12434v2.** RL-trained RNN agents tracking turbulent plumes: foraging
  AND mating pursuit solved by the SAME emergent sensorimotor integration (no
  task-specific modules; intermittent odors, shifting wind). → In-silico proof that
  one embodied policy covers food-seeking and mate-seeking without separate channels
  — the strongest external support for the trap-over-channel design, and a methods
  pointer (their emergent-behavior analysis) for reading our own agents' policies.

## Round 82 — copy only when uncertain (for SOCIAL's unconditional-copy null; 2026-11-02)

Motivation: MATE-SOCIAL's copybest copied unconditionally at every mating and changed
nothing (1 = 1, same lineage). The social-learning literature's central result is that
UNCONDITIONAL copying is dominated — the winners copy CONDITIONALLY.

- **Copy-when-uncertain [canon: Boyd & Richerson 1985; Rendell et al. 2010 Science
  (strategy tournament: "copy when uncertain" wins); Enquist, Eriksson & Ghirlanda;
  Laland 2004; journal-bound, verification deferred].** Social learning beats
  individual learning exactly when personal information is poor, costly, or the
  environment changed. → Our copybest arm copied regardless of recipient state —
  including founders with good personal information (high intake, fed). The null is
  PREDICTED by this literature, not surprising under it: unconditional copying adds
  nothing where personal information suffices, and our one-generation window never
  created an uncertain class. SOCIAL-V2 rationale (specified-not-executed, needs
  frozen plan): gate copying on recipient uncertainty (young/low-intake founders copy;
  successful ones use personal info) — the losing strategy (copy-always) is already
  run; only the conditional form is untested.
- **Mate-choice copying [canon: Dugatkin; Galef & White 1998 (quail); Witte;
  journal-bound, verification deferred; arXiv "mate copying" exact = zero hits].**
  Females copy other females' mate choices — but copying is itself state- and
  context-dependent (copying by YOUNG/inexperienced females strongest). → Same
  conditional structure inside the mating domain: copying matters for first-time
  choosers. Our founders mate at most once and mostly in generation 1 — nearly ALL
  are first-time choosers, which should have MAXIMIZED any copying effect, yet the
  effect was exactly zero. That sharpens V1's null: not "copiers were too
  experienced" but "nothing worth copying was visible" (encounters, not evaluation,
  bottleneck — consistent with the whole arc).
- **arXiv:2504.17370v1.** Doubly adaptive social learning: belief-update plus
  neighbor-pooling that tracks BOTH drifting hypotheses and drifting likelihood
  models in a fully online setting. → Our ecology drifts within a run (depletion,
  crowding) while the copied quantity (maternal success) is a LAGGING indicator of a
  moved world. Doubly-adaptive logic says copy recent success under drift, discount
  stale success — copybest pooled lifetime success with no recency weight. A
  recency-weighted copy rule is an unbuilt instrument variant (specified-not-executed).
- **arXiv:2311.02365v1.** Evolution of reciprocity under LIMITED payoff memory:
  conditional cooperation survives when agents learn from recent (not averaged)
  payoffs; the standard average-payoff assumption is unrealistic. → The memory-
  pressure angle: our founders decide on lifetime-aggregated states; the paper says
  recency-bounded memory suffices for social strategies. Supports a bounded-memory
  social instrument (copy on recent encounters only) over our lifetime-aggregated
  one — if the line ever reopens.
- **arXiv:1404.5704v3.** Semantic Axelrod: cultural transmission with PREREQUISITE
  structure (complex traits transmit only when prerequisites are in place). →
  Hypothesis for the exact-neutral: mating success may have prerequisite structure
  (fed → encounter → mate) that a single copied bit (maternal success) cannot carry.
  Copying the OUTCOME without the prerequisites predicts exactly zero transfer —
  the V1 result read as a transmission-content problem, not a transmission-channel
  one (channel already proven working by the maternal-copy verification).

## Round 83 — inheritance without genes (for the persistence/carry-over frontier; 2026-11-02)

Motivation: INHERIT tested exactly one channel (exact weight copy, the genetic
channel) plus noise (mutation) and closed with a pooled null. Biology transmits
across generations through at least four channels; we built one.

- **Four dimensions [canon: Jablonka & Lamb 2005 Evolution in Four Dimensions
  (genetic, epigenetic, behavioral, symbolic); book, verification deferred; 1 prior
  mention only].** → Map our instruments onto the four: maternal exact-copy =
  genetic; transmissionNoise = mutational; NOTHING = epigenetic (starter bias that
  is neither exact nor random) or behavioral (parental priming/teaching). The pooled
  V1b+V1c null (4 vs 5) is a genetic-channel-only null — the other channels are
  unbuilt. Cheapest unbuilt variant: epigenetic-as-prior (offspring initialized to a
  SHRUNK parental vector; shrinkage = the epigenetic "reset"), sitting strictly
  between our exact-copy and zero-weights arms. Specified-not-executed.
- **Learned-avoidance inheritance [canon: Moore et al. 2019 Cell (C. elegans learns
  pathogen avoidance; inherits it ~4 generations via neuronal small RNAs); Rechavi
  lab follow-ups; journal-bound, verification deferred].** The closest existence
  proof to our question: INHERITANCE OF LEARNED BEHAVIOR with a molecular channel
  (neurons → germline small-RNA transport). → Two readings: (1) our weights-copy
  attempted the right thing through the wrong channel (bulk copy vs small
  instructive signal); (2) the inherited unit is a bias/prior (avoid X), not a
  policy — consistent with the shrinkage-prior variant above and with our finding
  that full policies do not transfer but directional biases do (turn-gating
  transfers as a DIRECTION, 0.81 → 0.52–0.67, never as a full policy).
- **arXiv:2005.06539v1.** Information-theoretic model of histone-mark inheritance:
  with only half the parental nucleosomes transferred, ideal enzymes implement a
  k-THRESHOLD filling rule. → Thresholded reconstruction is information-
  theoretically optimal for half-erased inheritance — our transmissionNoise knob
  (per-element Gaussian perturbation) is the WRONG noise model; biology uses
  thresholded completion, not jitter. Unbuilt variant: thresholded parental seeding
  (keep parental sign where |w| exceeds k, zero-fill the rest). Specified-not-executed.
- **arXiv:2412.15394v2.** Self-organised liquid droplet as a reaction chamber that
  RESTORES diluted epigenetic marks post-division (polymer-assisted condensation
  plus particle simulation through an in-silico cell cycle). → Memory without
  neurons, without weights: a compartment that reconstructs what dilution erased.
  Retention-mechanism-adjacent (R1 closed SUPPORT-H1-motor): our retention study
  looked for WHERE weights persist; this paper says persistence can be a PROCESS
  (active reconstruction each cycle), not a place. Outside-the-box instrument: a
  per-cycle consolidation step (re-heb toward the founder policy) rather than a
  protected store. Specified-not-executed.
- **arXiv:1606.08585v1.** Transgenerational signal DIRECTION flips between G1 and
  G2 (reanalysis: overlap significant regardless of direction; direction itself is
  unstable). → Caution for any persistence claim: even real transgenerational
  signals change SIGN across generations. Read against our own inversion saga (BH
  1−turn correction; HB/BH summation to 1.0): directional readouts are fragile
  across transfers. Any V2 persistence instrument must pre-register DIRECTIONAL
  hypotheses (which sign, which cue), not just magnitudes.
- **arXiv:2502.07366v5 + arXiv:2604.18809v2.** RITHMS hologenome simulator (vertical
  AND horizontal transmission of microbiota across generations) plus a persister-cell
  model with a SHARP persistence/extinction threshold via epigenetic inheritance.
  → (1) Our transmission is vertical-only; hologenome logic adds a horizontal
  channel (founder-to-founder transfer within a generation — unbuilt, and distinct
  from our maternal arm); (2) persistence-vs-extinction thresholds are SHARP in the
  persister model — establishment (our INFORMED void, gen-2 ≥ 2 bars) may be a
  threshold phenomenon where near-threshold data look like noise. Both support
  threshold-framed analyses of existing banks (analytic-only, zero new worlds).

## Round 84 — perfect adaptation and fold-change detection (for extinction gates; 2026-11-02)

Motivation: the turn-gating transfer tax IS an adaptation problem (the old codebook
must stop driving behavior in a new niche), and our actor has no dedicated adaptation
machinery — extinction means overwriting weights. Sensory biology solved exact
adaptation with identified circuits; this round maps them.

- **Robust perfect adaptation [canon: Barkai & Leibler 1997 Nature (integral
  feedback); Yi, Huang, Simon & Doyle 2000 PNAS (conditions); journal-bound].**
  Bacterial chemotaxis returns EXACTLY to pre-stimulus activity across wide parameter
  variation, via integral feedback. → Our transferred agents do the opposite: they
  carry the old niche's response into the new one (tax 0.2–0.3) and unlearn slowly.
  An integral-feedback path (accumulate prediction error; subtract its integral from
  drive) adapts without touching the learned weights — the architectural piece our
  actor lacks and V1f–V1i surprise-gating only approximates (gain modulates, never
  subtracts). Unbuilt mechanism: error-integral brake. Specified-not-executed.
- **arXiv:physics/0211094v2.** Full analytic condition set for perfect AND
  near-perfect adaptation in a chemotaxis-pathway model (phosphorylation-block
  conditions derived; each condition's sensitivity perturbed). → Two usable items:
  (1) near-perfect adaptation is the realistic target (exact needs all conditions) —
  our E1/D0 +0.1 band already thinks this way; (2) condition-by-condition
  sensitivity analysis is the template for ablating any future adaptation circuit
  (knock out one condition at a time — the ablation discipline our brake work
  approximated with nolift/uniform/fast arms).
- **arXiv:0812.0622v2.** Feedforward adaptation circuits: global convergence for
  STEP signals, but PULSE memory — feedforward adapters do NOT adapt to pulses
  (they remember them). → Direct analog of our transfer finding: a held-constant
  new codebook eventually converges, but the old codebook's PULSES (cue encounters)
  keep re-evoking the old response — "memory phenomenon" in circuits, "same-val
  0.95 no erosion" in our agents. Predicts extinction needs pulse-rate-dependent
  unlearning, not just exposure time.
- **Fold-change detection [canon: Shoval, Lazova & Alon 2010; arXiv:1212.5712v4
  (FCD via protein–protein interactions, NO energy cost, fast/precise);
  arXiv:1012.2782v1 (symmetry-invariance theory: transients invariant under input
  scaling)].** Relative-change sensing is cheap (no transcription, no energy) and
  scale-invariant. → Our V4 gate compares ABSOLUTE energy to an ABSOLUTE bar; FCD
  says the natural gate is relative (energy fold-change). A fold-change departure
  gate is the V5 if V4's absolute gate fails — and 1212.5712v4's no-energy-cost
  construction answers the billing objection in advance (relative sensing need not
  cost more ops than absolute comparison).
- **arXiv:1410.8087v1.** Reverse-engineering the environment FROM the sensor:
  dose-response curves plus Weber-Fechner/FCD generalizations predict the chemical-
  gradient statistics E. coli actually encounters. → The reverse of our niche
  fingerprint (weights identify the niche, 1-NN 1.000): a sensor adapted to a niche
  inverts to reveal the niche. Cite when the fingerprint is challenged.
- **arXiv:2312.16875v2.** Cellular forgetting/desensitisation review: overload (too
  frequent/large/complex) leads to DECOUPLING, receptor internalization — "cells
  refuse to learn more"; includes non-neuronal Hebbian (conformational, miRNA,
  chromatin memory). → Mechanistic twin of our RIGID class (saturated substrate,
  4x-means plateau) and of the 47/48 stampede (overload → indiscriminate adoption).
  Also hands us the cellular-Hebbian reading of slow weights (conformational memory
  is approximately slow taste-direction). Classification support; no instrument.
- **arXiv:1910.03208v3 + arXiv:2101.11885v3.** Absolute concentration robustness
  controllers (control mean AND variance, stochastic-correct) plus graphical/causal
  tests for perfect adaptation from equilibrium data. → (1) ACR is the control
  theory behind "hold the bar exactly" (matingEnergyBar as a robust setpoint —
  currently a hard gate, could be a regulated variable); (2) the graphical test is
  a METHOD for detecting adaptation in logged data — applicable analytic-only to
  existing banks (detect perfect-adaptation signatures in per-tick energy traces,
  zero new worlds).

## Round 85 — variation that won't die: lek, personalities, diminishing returns (2026-11-02)

Motivation: three program facts need a theory home — (a) V1b's thin mutant edge
(3 vs 2, one-birth margin) that V1c erased; (b) per-seed spreads that never collapse
(retained distinct skills); (c) saturation curves everywhere (4x-means plateau).
This round collects the literatures where variation PERSISTS under selection.

- **Lek paradox + genic capture [canon: Kirkpatrick & Ryan 1991; Rowe & Houle 1996;
  Tomkins; Radwan; journal-bound, verification deferred; arXiv "lek paradox" and
  "greenbeard" exact = zero hits — searched-not-found].** Strong choice should eat
  the variance it feeds on; genic capture (condition-dependence, whole-genome
  mutational target) resolves it. → Our V1b-to-V1c pattern (edge appears, edge
  vanishes) is the lek paradox in miniature: IF mutant superiority were real genetic
  variance, mating choice should fix it, not erase it — erasure says the V1b edge
  was sampling noise on a flat landscape, exactly the paradox's null. Genic capture
  adds the positive program: make fitness condition-dependent (condition = energy
  state) so variance has somewhere to live — which the matingEnergyBar plus enriched
  arms already do structurally. Interpretive closure; no new instrument.
- **Behavioral syndromes / animal personalities [canon: Sih et al. 2004; Reale et
  al. 2007; Wolf & Weissing (state–behavior feedbacks maintain personalities);
  journal-bound, verification deferred; arXiv exact-phrase = zero hits].**
  Consistent individual differences persist via state–behavior feedbacks (boldness
  feeds back through size to boldness). → Our "retained distinct skills"
  (per-history policies that stay distinct under transfer, niche-ID 1.000) ARE
  personalities in the ethological sense, and Wolf–Weissing feedbacks are the
  maintenance mechanism our H2/state lines gesture at: state (reserves) versus
  behavior (cruise/pause/turn) loops that amplify initial differences instead of
  erasing them. Reframes retention from "where are skills stored" to "which
  feedbacks keep histories apart."
- **arXiv:2607.16542v1.** From optimal policies to individual differences:
  rethinking RL for biology — RL reports the best individual or the mean; biology
  IS the distribution; paths to biologically-plausible behavioral diversity. →
  The exact methodological license for our per-seed reporting (spreads, pair
  floors, flipped splits): the field's best-practice critique says means hide the
  phenomenon. Cite defensively whenever a mean-only reading is proposed; our
  reporting already complies with what the paper demands.
- **arXiv:1806.01778v3.** Individual differences STABLE under 3960-trial extended
  Pavlovian conditioning (oscillatory post-acquisition model; first peak/trough
  detected). → Existence proof that long training does not erase individual
  differences — differences ride THROUGH extended conditioning. Direct support for
  the retention program's premise (skills survive functional pressure), plus a curve-
  shape caution (post-peak damped oscillation, not monotone saturation — our
  saturation plateaus may be under-sampled oscillation troughs; analytic-only
  re-read of existing curves, zero new worlds).
- **arXiv:1807.09131v1.** Intralocus sexual conflict plus GxE can WEAKEN or REVERSE
  female preference (even preference for LOW-condition males). → Preference
  reversal under conflict is adaptive, not error — read against our inversion saga
  (BH sign, ben-to-harm versus harm-to-ben asymmetry): when the selecting
  environment flips (new codebook), the learned preference SHOULD reverse, and
  failure to reverse (harm-to-ben stall near 0.67) is the conflict signature. Gives
  the asymmetry a name: transfer into conflict, not transfer into noise.
- **arXiv:2102.11667v1.** Sexual selection via NKCS coevolution models; includes a
  rudimentary Baldwin-effect smoothing mechanism. → Double link: (1) mate choice as
  compensation for coevolutionary dynamics (choice stabilizes, not just selects —
  our mating arms add choice to a foraging ecology; expect stabilization signatures
  in variance, not just mean shifts); (2) an explicit Baldwin-smoothing in a
  published model — cite for the BALDWIN closed line (learning smooths the landscape
  selection sees; our V1a–V1d ended in proof, this ends in mechanism).
- **Selectable mutation rates + diminishing returns [arXiv:1501.03632v2 (nonmutator
  fixation in mutator populations; selection acts on mutation rates themselves) +
  arXiv:1505.01751v4 (individual-based Lenski model: sublinear fitness from
  fixed-effect mutations plus interday epistasis) + arXiv:1402.3065v2 (Rough Mount
  Fuji tunable ruggedness)].** → Three analytic lenses for existing data, zero new
  worlds: (1) our transmissionNoise is a FIXED knob, but selection on mutation rates
  is real — an evolvable-noise arm (noise scaled by parental success) is
  specified-not-executed; (2) Lenski deceleration is the canonical diminishing-
  returns curve — fit our 4x saturation means against sublinear (power-law) form
  analytic-only; (3) RMF tunable ruggedness is the landscape model our QD Hamming
  map approximated empirically — compare observed local-maxima density against RMF
  predictions analytic-only.
- **arXiv:2504.08000v1.** Neuron-level stability–plasticity (NBSP): identify
  task-critical "skill neurons," protect them with gradient control; network-level
  balancing is too coarse. → The mechanism our retention study never tested: SLOW
  weights are skill neurons and NOTHING protects them (uniform plasticity).
  NBSP-style protection (freeze-by-importance) is the unbuilt retention instrument —
  and its predicted signature (protected skills plus plastic margins) matches our R1
  SUPPORT-H1-motor (motor anchor retained, rest plastic). Specified-not-executed;
  needs frozen plan.
- **arXiv:2005.13237v1.** Insect-swarm pair formation from adaptive long-range
  (acoustic-gravity plus fold-change adaptivity) interactions — pairs as BYPRODUCT,
  no pair-specific behavior introduced. → The byproduct hypothesis for our encounter
  results: V1's hub pairs (and V1c's duo excess) may be byproducts of shared taxis
  plus food geometry, not mating-specific attraction — consistent with "topology
  insufficient" and with the pooled-births view. Strengthens the Emlen–Oring split
  requirement: only a cue adding pairs BEYOND the taxis-byproduct baseline counts.
- **Greenbeard + parent–offspring conflict, searched-not-found with canon pointers.**
  arXiv "greenbeard" = 0 hits; canon: Hamilton 1964, Gardner & West (formalism),
  Keller & Ross (fire-ant Gp-9), Smukalla et al. (yeast FLO1 adhesion). →
  Recognition-without-genealogy is the unbuilt alternative to our lineage-founder
  post-hoc resolution (tags, not trees). arXiv:1205.0931v1 (feral-dog
  parent–offspring conflict bioassay: conflict rises over weeks, independent of
  hunger/litter — STRUCTURAL) supports our decoupled-mating design reading:
  conflict/cooperation structure is architectural, not motivational.

## Round 86 — why mate at all: the recombination-less critique (for the mating arc; 2026-11-02)

Motivation: the mating arc (V1 through V1c, SOCIAL, encounter, proximity, attract,
informed — dozens of mains) never states the canonical evolutionary reason mating
exists. The ratchet literature does: sex/recombination halts the accumulation of
deleterious mutations. Our transmission is maternal exact-copy plus injected noise —
ASEXUAL with mutation — and our mating performs NO recombination. The outside-the-box
verdict, before any new instrument: the whole null arc may be predicted, because the
mating we built cannot do the one job mating is for.

- **Muller's ratchet, traveling-wave theory [arXiv:0707.3469v2 (traveling-wave
  expressions for ratchet rate and adaptation speed; stochastic edge of fittest
  class) + arXiv:1303.2037v1 (ratchet clicks a.s. in finite time for ANY mutation
  rate, toxicity, or population size) + arXiv:2007.14715v3 (quasi-stationary
  metastability BETWEEN clicks) + arXiv:1110.2939v1 (rare beneficials can halt it;
  static-environment stability = dynamic balance) + arXiv:1108.4059v3
  (compensatory mutations; infinite-population limit)].** → Read our lineage data
  against the ratchet: maternal transmission with per-element noise, no
  recombination, small founder numbers — the exact ratchet regime, with clicks in
  finite time GUARANTEED (1303.2037v1). Pooled V1b+V1c (mutant 4 vs exact 5): the
  "mutant" arm injects MORE mutations without recombination to sort them — under
  ratchet theory it should do WORSE or equal, never better. The V1c erasure is the
  prediction, not the puzzle. Any future transmission design must either recombine
  (crossover between parental vectors — unbuilt) or stop injecting noise it cannot
  purge. Specified-not-executed.
- **Recombination alleviates, conditionally [arXiv:1308.0962v4 (drift + selection
  + recombination: for small and very large populations load depends weakly on
  recombination; for MODERATELY LARGE populations recombination alleviates) +
  arXiv:1810.07984v1 (interference of linked beneficial/deleterious mutations in
  large asexuals) + arXiv:q-bio/0609046v3 (mutation-selection with general
  recombination, infinite loci)].** → The population-size window matters: our
  founder counts (tens) sit in the small-population regime where recombination
  helps LEAST (drift dominates) — a second reason mating cannot rescue our lines
  even if recombination were added. The 1308.0962v4 window says: recombination pays
  at moderate N; our ecology would need bigger mating pools first (density works
  against energy — the MATE-DENSE bind restated in population-genetic terms).
- **Expansion load on the wave front [arXiv:1306.1652v1 (deleterious mutations
  accumulate on range-expansion fronts; reduced fitness = expansion load, not
  restricted to the edge) + arXiv:2607.12864v1 (can deleterious mutations surf
  deterministic waves? reaction-diffusion spatial ratchet)].** → Our transplant
  chains (TURN-GATE V1d–V1i carried weights segment to segment) ARE serial range
  expansions: each transplant is a founder event at a wave front. Expansion load
  predicts fitness erosion along the chain INDEPENDENT of the niche — read against
  4x-means 0.59→0.71→0.81→0.82 (gains attributed to exposure could be net of a
  hidden load). Analytic-only lens on existing seg rows (fit front-position decay),
  zero new worlds.
- **Encounter-network topology of mating [arXiv:1612.03729v1 (social-encounter
  network: mean degree + choosiness raise assortative mating AND total matings;
  exclusion-mediated selection raises mean attractiveness but is balanced by
  offspring skew of attractive pairs)].** → The only arXiv model that fuses our
  two variables (encounter topology + mate choice): degree (who you meet) and
  choosiness (how you select) JOINTLY set assortative strength and mating count —
  and attractive-pair offspring SKEW caps the response. Our encounter arms varied
  degree (hub/duo/spread topologies) with choosiness fixed at zero (decoupled,
  indiscriminate); the model predicts exactly our pattern (matings track degree,
  no compounding from choice) and names the missing interaction (choosiness ×
  degree, unbuilt — the Emlen–Oring split needs a choice knob, not just a rate
  knob). Also: offspring skew as the V1b-thin-margin suspect (2/3 births on one
  seed = skew, already flagged; the model makes skew structural).
- **Courtship as non-payoff-monotonic game [arXiv:1508.03529v2 (evolutionary game
  of courtship with non-payoff-monotonic dynamics)].** → Mating dynamics need not
  follow payoff gradients — courtship games admit non-monotonic trajectories. Read
  against our monotonic expectations (dose-response, GO bars): non-monotonicity is
  licensed (V1c's duo hump is a legal shape, not a pathology). Supports the
  weak-monotonicity verdict rule over strict ordering.
- **Canon, searched-not-found on arXiv (logged).** Kondrashov (deterministic
  mutation hypothesis for sex); Williams/Ghiselin tangled bank and lottery (sex
  for uncertain environments — our static banks = no tangled-bank benefit, third
  reason mating cannot pay here); Hamilton–Zuk (parasite-mediated good genes — our
  ecology has no parasites, fourth reason); Fisher/Lande/Kirkpatrick runaway
  (arXiv "runaway"/"good genes" return only noise); Hamilton 1967 LMC (local mate
  competition in structured patches — our hub IS a fig-wasp patch without the
  sex-ratio response). Four independent canonical benefits of mating, ALL absent
  from our ecology by construction. The mating arc's nulls are overdetermined.

## Round 87 — odor-gated reproduction (for ELSEWHERE sensing + Emlen–Oring; 2026-11-02)

Motivation: our odor channels and mating channels are separate instruments that
never interact (odor routes food; mating is proximity-gated, decoupled). Mammalian
biology fuses them: male odor DIRECTLY drives female reproductive physiology
(pubertal acceleration, estrus synchronization, pregnancy block, density
suppression). The outside-the-box knob for the Emlen–Oring split is not a new
proximity radius — it is odor-gated reproduction.

- **Odor → reproductive physiology [canon: Whitten effect (male odor synchronizes
  estrus); Vandenbergh effect (male odor accelerates puberty); Bruce effect
  (strange-male odor blocks pregnancy); Lee–Boot effect (female-assembly odor
  SUPPRESSES cycles at density); Wedekind (MHC-disassortative odor choice);
  MUPs/scent marks (individual identity); all journal-bound, verification deferred;
  arXiv "MHC mate"/exact-phrase = zero hits — searched-not-found].** → Four
  distinct causal arrows from SMELL to births/timing, all missing from our engine:
  (1) synchrony (Whitten — shared odor aligns windows; Moran-effect adjacent,
  see R90); (2) acceleration (Vandenbergh — odor shortens time-to-first-mating,
  our firstMatingTick descriptives never move); (3) block (Bruce — foreign odor
  vetoes establishment; our INFORMED void has no veto channel); (4) suppression
  (Lee–Boot — DENSITY suppresses reproduction via odor; our MATE-DENSE null
  (−64 vs −59, zero births) is currently read as energy competition, but
  density-suppression is the competing mechanism, distinguishable only by an odor
  manipulation). Each arrow is a specified-not-executed instrument (odor-gated
  bar/odor-gated mating probability, needs frozen plan).
- **Optimal outbreeding as metastable equilibrium [arXiv:1011.0825v4 (species rest
  on a metastable inbreeding↔outbreeding equilibrium) + arXiv:1511.03559v1
  (environmental unpredictability + inbreeding depression jointly select for MIXED
  dispersal syndromes) + arXiv:1801.07086v5 (sex-biased dispersal review)].** →
  Our lineage-founder resolution (mating among co-located kin) is inbreeding by
  another name; the literature says the answer is not panmixia but STRUCTURED
  dispersal (mixed syndromes: some stay, some leave; often sex-biased). Our
  verticalTransmission has no dispersal knob and no sex — the minimal unbuilt
  variant is natal dispersal probability (newborn relocates with probability d),
  with the 1511.03559v1 prediction (unpredictability favors mixed, not pure,
  strategies — d strictly interior). Specified-not-executed.
- **Sensing fused with communication, trained [arXiv:2511.08436v2 (MARL-trained
  weakly electric fish collectives with biophysical electrosensing: sensing AND
  communication in one channel; trained agents reproduce homing/pursuit)].** →
  Existence proof that fused sense–communicate channels TRAIN under MARL (not
  handwired) and produce collective foraging. Our mateAttractBias is handwired
  taxis; the MARL result says the fused channel (odor-that-is-also-signal) is
  learnable in-silico — the training-based alternative to our knob ladder, and a
  methods pointer (their emergence analysis) if a learning-based mating line ever
  opens. No instrument implied under current frozen discipline.

## Round 88 — aggregation economics without predators (for hubs + dispersal; 2026-11-02)

Motivation: our agents aggregate (hubs concentrate founders) in a world with no
predators, no dilution benefit, and only costs (competition, interference,
starvation). The canonical aggregation theory (selfish herd) is PREDATION-driven —
which predicts our clumps should dissolve. This round collects what holds groups
together (or dissolves them) when safety is not the currency.

- **Selfish herd, modeled with a target [arXiv:2410.13167v1 (selfish-herd model
  that aggregates AND produces milling/aligned motion; domain-of-danger
  minimization)].** → The SHH mechanism (minimize own danger domain by moving
  toward neighbors) has no trigger in our ecology (no predator, no danger domain).
  The model still matters negatively: it shows aggregation needs a PER-CAPITA
  gradient to climb; our hub's gradient is food (shared, depleting) plus mates
  (rare). Once food depletes, the residual gradient is mates-only — predicting the
  hub trap (agents held by mating gradient on exhausted food = V3's signature).
  The rescue the model implies is a LEAVING rule (depart when per-capita intake <
  threshold — the MVT/GUD leaving rule from R75, now with SHH as second witness).
- **IFD in evolved neural agents [arXiv:1112.3574v1 (agents with evolved neural
  architectures distribute themselves ideal-free) + arXiv:2610.24865v3
  (percolating recruitment cascades + MaxEnt foraging mechanism) +
  arXiv:2408.01350v4 (human foragers adapt to distribution + time constraints) +
  arXiv:q-bio/0601024v2 (primate scale-free foraging emerges from complex
  environment, not from Lévy priors — second witness for R79's refutation)].** →
  1112.3574v1 is our paradigm with the dependent variable we never measured:
  evolved agents distributing across patches. The testable question for our banks
  (analytic-only, zero new worlds): are our hub/spread births IFD-consistent
  (per-capita intake equalized) or despotic (hub monopolized despite lower
  per-capita)? V1c's duo-best energies (−20.5 > −24.3 > −41.9) already smell
  despotic (hub overcrowded past IFD). Fit per-capita intake by topology on
  existing rows; if despotic, the leaving rule (above) is licensed as V-next
  rationale.
- **Metapopulation: persistence is colonization minus extinction
  [arXiv:2504.20396v1 (Levins with time-varying rates) + arXiv:2104.01611v2
  (GRADUAL vs CATASTROPHIC extinction + synchrony in metapopulation formation) +
  arXiv:1112.1679v3 (individual-based brink dynamics, small patches, no
  timescale separation) + arXiv:2412.02952v1 (competition + habitat destruction,
  almost-periodic rates)].** → Our fresh banks ARE metapopulations (6 histories =
  patches; spent = extinct-unusable; establishment = colonization). The
  2104.01611v2 distinction (gradual vs catastrophic extinction) reframes our voids:
  INFORMED's void (donor gen-1 1v2, no gen-2) reads gradual (failure to establish);
  a catastrophic void would be founder death with food present. Different voids
  need different instruments — currently all voids share one INCOMPLETE label.
  Specified-not-executed (void taxonomy, needs frozen plan). 1112.1679v3's
  small-patch methods fit our patch sizes exactly (tens of founders).
- **Canon, searched-not-found (logged).** Hamilton & May 1977 (disperse despite
  mortality to escape kin competition — arXiv "hammay" returns only astronomers
  named Hamilton; the paper is the dispersal-knob license: our hubs are kin
  neighborhoods, dispersal is the predicted response); Brown 1964 economic
  defendability + Fretwell despotic distribution (territory/despotism when benefits
  exceed costs — the hub-monopoly reading of V1c duo>hub); Huffaker mites
  (spatial heterogeneity stabilizes predator–prey; our topology line is the
  heterogeneity manipulation with the same stabilizing logic, minus the predator).

## Round 89 — prepared learning, drift, momentum, metaplasticity (for the tax; 2026-11-02)

Motivation: the transfer tax (0.2–0.3, asymmetric, saturating) is currently
described geometrically (contact-weighted correctness, gaps). Learning theory has
older, sharper names for each feature: drift (learned behavior reverting to
instinct), preparedness (some associations learn fast, others never), momentum
(resistance ∝ reinforcement history), and metaplasticity (the plasticity knob
itself adapting).

- **Instinctive drift + preparedness [canon: Breland & Breland (learned behavior
  drifts toward instinct); Garcia (taste-aversion: one-trial, long-delay,
  modality-prepared); Seligman preparedness continuum; journal-bound, verification
  deferred; arXiv "garcia"/exact-phrase = food-AI noise ("Tasteful Agent") —
  searched-not-found].** → Two renamings with teeth: (1) our harm→ben stall
  (~0.67, rigid) may be INSTINCTIVE DRIFT — conditioned turning reverting to the
  cruise instinct under the new codebook — which predicts drift is cue-specific
  (drift where instinct conflicts) rather than uniform decay; testable on existing
  per-cue splits analytic-only. (2) Our cue–turn association may be UNPREPARED
  (arbitrary codebooks, no biological privilege) while cue–intake (taste) is
  PREPARED (Garcia) — predicting exactly the observed ordering (taste learns,
  turning transfers poorly). If true, the tax is a preparedness ceiling, not a
  plasticity shortage, and no gain/brake knob can lift it — only prepared
  channels (taste-direction, R1's motor anchor) transfer.
- **Sign-trackers vs goal-trackers [canon: Brown & Jenkins autoshaping; Flagel
  (sign-tracking as addiction-vulnerable phenotype; stable individual difference);
  journal-bound, verification deferred; arXiv "sign-tracking" = ML shapelet noise
  — searched-not-found].** → The polymorphism hypothesis for HB/BH: sign-trackers
  approach the CUE, goal-trackers approach the FOOD SITE — two stable turning
  styles that LOOK like noise in pooled means but separate in per-seed splits
  (our pair floors 0.79/0.87/0.81?!). Testable analytic-only on existing banks:
  classify histories by cue-approach vs site-approach in training, check the
  classes predict transfer direction (ben→harm vs harm→ben asymmetry).
  Specified analysis, zero new worlds.
- **Momentum, matching, melioration [canon: Nevin behavioral momentum (resistance
  ∝ reinforcement rate); Herrnstein matching law (allocation ∝ reinforcement);
  Herrnstein & Vaughan melioration (local optimization); all journal-bound,
  verification deferred; arXiv = zero hits].** → (1) Momentum quantifies RIGID:
  resistance-to-extinction should scale with training contacts — our train-contact
  partials (HB −0.17, BH −0.535, "LI both directions") already gesture here; fit
  the momentum equation analytic-only. (2) Melioration is the FORMAL NAME for our
  greedy 0.5 gate (local hill-climbing that can trap) — the FEH proof re-derived
  from behavior analysis; cites both ways.
- **Metaplasticity without precision [arXiv:2403.08718v5 (probabilistic
  metaplasticity for continual learning on memristors: consolidation WITHOUT
  precise weight modulation; low-precision hardware + stochastic consolidation)].**
  → The retention mechanism cheaper than NBSP (R85): protect-by-probability, not
  protect-by-importance. Our slow weights are low-precision accumulators already;
  metaplastic consolidation (consolidate with probability ∝ surprise, no gradient
  bookkeeping) is billable at ~1 op and unbuilt. Specified-not-executed.
  Companion: BCM sliding threshold (Bienenstock–Cooper–Munro; book/journal,
  verification deferred; arXiv = physics noise) — our fixed 0.5 greedy threshold
  vs a sliding postsynaptic threshold; the V-next readout rule if the floor is
  threshold-misplacement rather than satiation.
- **State-dependent utility formalizes λ [arXiv:2410.19030v3 (expected utility
  with state-dependent linear utilities + loss aversion; FOSD/MPS/risk-aversion
  results)].** → Our λ=2.95 (loss aversion, prospect-theory reading) currently
  floats as a behavioral number; 2410.19030v3 gives it a utility-theoretic home
  (state-dependent linear utility). The license: λ need not be a fixed trait —
  state-dependence predicts λ varies with reserves (hungry = more loss-averse?),
  testable analytic-only on existing per-tick energy × choice data.

## Round 90 — synchrony, waiting, active sensing (for ELSEWHERE + timing; 2026-11-02)

Motivation: the margin-readback adjudication left (a) ELSEWHERE sensing open; the
encounter line left timing (firstMatingTick medians never separate) unexplained;
and every instrument assumes agents only LISTEN. Three literatures say the missing
pieces are emission (active sensing), correlation (shared forcing), and waiting
(dormancy as strategy).

- **Firefly physics + pulse-coupled sync [arXiv:2411.17751v2 (what models for
  what physics — synchrony as collective physics, Mirollo–Strogatz lineage) +
  arXiv:1903.01651v3 (GLOBAL PCO sync conditions on chains/directed trees, from
  arbitrary phases)].** → 1903.01651v3's topology conditions are directly
  applicable: our hub is a STAR (all sense all), our spread is SPARSE — sync is
  topologically licensed on hub, not spread. If mating needs co-presence windows,
  hub should synchronize mating ticks and spread should not — testable
  analytic-only (mating-tick dispersion by topology on existing banks). The
  encounter line measured firstMatingTick MEDIANS (never separate); the sync
  hypothesis says the statistic is DISPERSION, and we scored the wrong moment.
- **Moran effect: synchrony without interaction [arXiv:2610.17497v1 (geographic
  Moran effect: shared environmental forcing synchronizes populations; theory +
  methods + interpretation)].** → Our 6 histories per bank share the SAME bank
  protocol and overlapping seeds — Moran-correlated environments. Mating-window
  synchrony across histories needs NO communication channel, only shared forcing
  (same food schedule, same bar). Competing explanation for any future synchrony
  finding (Moran vs communication) — pre-register the dissociation (desynchronized
  forcing control) before claiming interaction. Methods import: their synchrony
  metrics for our mating-tick dispersion analysis.
- **Waiting as strategy: diapause + dormancy [arXiv:1809.04027v3 (rare diapause
  invades fixed life histories — waiting is evolvable against fixed schedules) +
  arXiv:1410.4802v1 (tumor dormancy proliferative switch — dormant↔active as a
  bistable switch)].** → Our agents tick every tick (always-on, always-billed);
  diapause is the unbuilt state (skip ticks at low cost, resume on cue). The
  fail-closed reading of V4-if-null: if gated taxis fails, the next rescue is not
  smarter chasing but WAITING (sit on clumped food, mate whoever arrives —
  the sit-and-wait predator strategy, and the plant foraging of R79, sessile
  version). 1809.04027v3 says even RARE waiting invades — a low-frequency wait
  allele/arm is the minimal test. Specified-not-executed.
- **Clocks degrade [arXiv:2212.13579v1 (minimal peripheral-clock model:
  differential circadian re-entrainment in AGING — old clocks re-entrain worse) +
  arXiv:2107.10677v1 (radical pairs explain magnetic + lithium effects on the
  circadian clock — QUANTUM BIOLOGY mechanism for magnetoreception)].** →
  (1) Re-entrainment degrades with age: our transferred agents (long-trained) may
  re-entrain WORSE to new codebooks than young ones — age-at-transfer as an
  analytic-only covariate on the tax (older histories = bigger tax?). (2) The
  radical-pair mechanism is a concrete ELSEWHERE modality (magnetic sensing via
  cryptochrome chemistry — no new anatomy, just chemistry), answering adjudication
  (a) with a physical candidate. Both kept as specified-not-executed; (1) has an
  analytic-only component on existing banks.
- **Active sensing: emit, then listen [arXiv:1203.0938v2 (mathematical model of
  active electrolocation: dipole approximation + multi-frequency location search) +
  arXiv:2603.16384v1 (RL virtual fish steer real schools) +
  arXiv:2208.11079v2 (robot active neural sensing/planning in clutter)].** →
  Our agents are passive (odor arrives; they turn). Active sensing (emit a probe
  signal, read the return) is the ELSEWHERE answer with the shortest path to
  mechanism: a mate-ping (1-op emission, echo read as extra input dim) converts
  the encounter problem from search to detection. The billing is honest (emission
  costs; V2's +3-op precedent covers it) and the null-default is clean (ping
  amplitude 0 = current behavior). Unbuilt instrument ladder specified:
  ping→echo detection first (no behavior), then ping-gated approach. Needs frozen
  plan; no claim.

## Round 91 — selectionist learning: immunity as the second learner (for retention + RSI-SELF; 2026-11-02)

Motivation: every learner in this program is instructionist (weights updated by
a rule). The immune system is the other great adaptive technology, and it is
SELECTIONIST: generate diversity blindly, then select. Two of our open problems
are selection-shaped (which variant persists; which proposal adopts), and the
germinal center runs propose→evaluate→adopt inside one body — the RSI-SELF loop
in flesh.

- **Idiotypic networks steer robots [arXiv:0910.3115v1 (LTL genetic algorithm
  seeds diverse behaviors into an STL idiotypic AIS for mobile-robot navigation;
  beats STL-only and hand-designed) + arXiv:0803.2981v1 (Jerne network theory in
  behavior-based robotics: inter-antibody stimulation/suppression + antigen match;
  first direct idiotypic-vs-not comparison guidelines)].** → The architecture
  mirrors our program: an OFFLINE diversity generator (LTL-GA ≈ our frozen banks
  and transplant chains) seeding an ONLINE selection network (STL idiotypic ≈
  our in-agent adopt step). The 0910.3115v1 result (seeded selection beats pure
  online learning AND hand design) is the closest external validation of the
  RSI-SELF shape: propose widely offline, select online. Difference that matters:
  idiotypic selection is NETWORKED (antibodies stimulate/suppress each other),
  ours is solitary (one agent, one loop) — the networked variant (proposals
  competing within/across agents) is specified-not-executed.
- **Naive metaphors limit AIS [arXiv:1001.2208v2 (most AIS uses naive adaptive-
  immunity metaphors; should draw from innate/plant/invertebrate immunity +
  systemic models) + arXiv:1006.1568v1 (conceptual meta-framework for innate
  immunity models) + arXiv:0801.3539v3 (idiotypic recommender wins via different
  neighborhoods + effect decomposition)].** → The critique ports to us: our
  "learning" is one metaphor (gradient-ish weight updates); innate immunity
  offers others (pattern-triggered fixed responses ≈ our fixed cruise; tolerance
  ≈ our null-default arms; priming ≈ our transplants). 0801.3539v3's lesson
  (wins come from different neighborhoods, not better scoring) ports directly:
  our verdicts may hinge more on bank composition (neighborhood) than on
  instruments (scoring) — bank-dependence, restated from immunology.
- **Selectionist canon, searched-not-found on arXiv (logged).** Jerne (idiotypic
  network); Burnet (clonal selection); Edelman (neural Darwinism — the brain
  itself as selection over neuronal groups; the selectionist alternative to our
  instructionist actor); Skinner (selection by consequences — operant conditioning
  as the behavioral selectionism our turn-gating rediscovers); germinal-center
  affinity maturation (somatic hypermutation + affinity selection = mutate,
  test, keep — RSI-SELF V1a–V1d in a lymph node, with the NOTE that biology
  keeps the loop because it works); prion (protein-only inheritance — a FIFTH
  inheritance channel beside Jablonka's four (R83): conformation, not code;
  our slow weights as conformational memory, second witness after R84's
  cellular-Hebbian reading).

## Round 92 — birdsong: the natural actor-critic + crystallization (for the substrate; 2026-11-02)

Motivation: our agents learn sensorimotor mappings with an actor-critic and then
stop changing (4x-means plateau). Songbirds do exactly this — learn a
sensorimotor song with a basal-ganglia loop, then crystallize it — with a mapped
circuit (Area X) and a learning theory (Doya). The whole substrate has a natural
homolog; this round collects it.

- **Song learning + Area X loop [canon: Nottebohm/Marler (sensorimotor phase,
  tutoring, crystallization); Fee/Doya (Area X = basal-ganglia reinforcement
  loop for vocal variability); Dave & Margoliash (sleep replay of song);
  FoxP2 (conserved vocal-learning gene); all journal-bound, verification
  deferred; arXiv "birdsong"/"Area X" = ML noise (MAML, emotion surveys) —
  searched-not-found].** → Three ports: (1) Area X injects VARIABILITY for
  trial-and-error and the BG evaluates — our actor has no dedicated variability
  source (exploration is epsilon-ish cruise noise); a variability channel is the
  unbuilt counterpart to our evaluation-heavy design. (2) Crystallization is the
  natural homolog of our saturation plateaus AND of the RIGID class — song
  stops changing on schedule, not from exhaustion; read our 4x-means collapse
  (0.59→0.71→0.81→0.82, links all positive then stop) as possible
  crystallization rather than capacity ceiling — distinguishable only by a
  reopening manipulation (does the window re-open? unbuilt). (3) Tutoring is the
  behavioral inheritance channel R83 named but never filled: juveniles learn
  from tutors, not genomes — our transplant chains (weights carried segment to
  segment) ARE tutoring with full-fidelity copying; the natural version is
  LOSSY tutoring (pupil improvises), which predicts our exact-copy transplants
  OVER-preserve (same-val 0.95 no erosion as an artifact of lossless tutoring).
  Lossy-tutor transplant arm: specified-not-executed.

## Round 93 — life history, senescence, scaling, seed banks (for lifespan + bar + ledger; 2026-11-02)

Motivation: our founders have lifespans, ages, death causes (logged:
energy vs age), a reproductive bar, and banks that sit dormant until drawn —
a full life history plus a seed bank, never theorized. This round gives both a
theory and a meta-reading.

- **Metabolic cost IS selective disadvantage [arXiv:1806.11184v3 (mutation with
  extra energetic cost suffers baseline disadvantage = fractional cost vs
  resting metabolism; validates cost↔selection quantitatively) +
  arXiv:1509.08912v1 (common origin of 3/4- and 2/3-power scaling) +
  arXiv:1407.3659v4 (thermodynamic origin of metabolic scaling) +
  arXiv:2604.10476v1 (Kleiber's law from pulsatile-wave physics, not fractal
  geometry)].** → 1806.11184v3 prices our op ledger in fitness units: every
  billed op is a fractional metabolic tax with a calculable selective
  disadvantage — the ledger is not bookkeeping but a fitness component, and
  symmetric billing (both arms pay) is the control that holds it constant.
  The scaling papers set up the Vision question (planetary scaling needs
  allometry: does per-capita cost scale sublinearly with size? unbuilt).
- **Seed banks store information [arXiv:2012.00072v2 (dormancy banks store
  information, impart memory, generate multi-scale structure from cells to
  ecosystems) + arXiv:2007.06393v2 (branching active/dormant processes in
  fluctuating environments) + arXiv:2406.11482v1 (AGENT-BASED bet-hedging
  extinction models — individual-based, like ours!) + arXiv:1810.01142v1
  (bet-hedging in EXPANDING populations — links R86 expansion load) +
  arXiv:2012.00810v1 (population-genetic dormancy models) +
  arXiv:1701.07910v2 (aster models for Darwinian-fitness variance —
  METHODS pointer for our fitness ledgers)].** → The meta-reading: our frozen
  banks ARE seed banks (dormant histories preserving variants across
  "seasons"), and 2012.00072v2 says banks are not archives but memory —
  information stored in the dormant state structures the active one. The
  R83 threshold theme recurs (dormant↔active switching is thresholded).
  2406.11482v1's agent-based extinction framing ports to our voids
  (INFORMED void as failed germination, not failed mating).
- **Life-history canon + brood-reduction triad, searched-not-found (logged).**
  Cole's paradox (delay pays only with enormous fecundity gains — our bar-65
  lock vs bar-50 unlock IS the delay decision); Fisher reproductive value +
  Euler–Lotka + Leslie matrices (age-structured demography for our
  age-logged founders — reproductive value by tick is computable analytic-only
  on existing lineages); Charnov invariants (dimensionless life-history
  numbers — test whether our ecologies obey any); semelparity/iteroparity +
  r/K (thin prior) + Williams/Medawar/Kirkwood/Hamilton-decline-force
  (senescence theories for our energy-vs-age death causes); menopause/
  grandmother (post-reproductive survival — our founders linger post-mating);
  Skulachev vs non-programmed aging + negligible senescence (is our lifespan
  trait programmed? the trait is a knob — its setting is a program);
  Lack/Mock brood reduction + siblicide + oosorption (when food is short,
  REDUCE the brood: resorb oocytes, cull chicks — our matingEnergyBar is
  brood reduction by another name; bar as oosorption threshold reframes V4's
  gate as physiology, not policy); serial founder effects + priority effects
  (transplant chains + spawn order — R86-adjacent demography).

## Round 94 — sociality: brains, division, sharing (for actor capacity + unbuilt differentiation; 2026-11-02)

Motivation: our founders share hubs, mate, and never differentiate, help, or
share — no castes, no provisioning, no cognitive response to group size.
Sociality literatures say all three scale with group living, and one of them
(the social brain) sets the cognitive budget our actor never pays.

- **Division of labor coevolves with sex [arXiv:1702.02141v5 (in-silico
  evolution: reproductive division of labor + genetic complexity DRIVE the
  evolution of sex — a network of forms, not parthenogenesis→sex) +
  arXiv:nlin/0407054v1 (Markov labor-division emergence + period-adding
  bifurcations under increasing returns)].** → 1702.02141v5 fuses our two
  arcs: mating (R86) and differentiation (this round) coevolve — our lines
  have mating WITHOUT any division of labor, which the model says is the
  unstable combination (division is what sex pays for). The unbuilt program:
  founders that differentiate (forager vs mater roles) before mating is
  evaluated — differentiation-first, mating-second. Specified-not-executed.
- **Sharing + helping, searched-not-found (logged).** Trophallaxis + crop/
  social stomach (mouth-to-mouth nutrient flow; shared buffer — our
  nutrientOverride is per-agent; a SHARED pool is the unbuilt instrument);
  Emlen/Koenig–Dickinson alloparenting (helpers at the nest — our gen-1
  could help, never does); eusociality origins (reproductive skew without
  close kinship puzzles — our despotism-without-skew data point, R88-adjacent);
  Oster/Wilson caste (differentiation without genetic difference — our
  identical founders are caste-capable in principle). Each is a
  specified-not-executed social instrument; the line they would open is
  transmission-by-helping (behavioral channel, R83's empty slot).
- **Social brain sets the budget [canon: Dunbar (neocortex ↔ group size);
  Byrne & Whiten (Machiavellian intelligence); Herrmann (cultural
  intelligence); all journal-bound, verification deferred; arXiv = zero].**
  → The R64 actor-capacity rationale, sharpened: social life is a cognitive
  load (track who, remember what) that our actor never pays (no identity
  memory, no reputation — the MATE-SOCIAL copybest arm read success without
  remembering who). If hubs demand tracking (who mated, who shared), a fixed-
  capacity actor saturates — our RIGID class may be social-cognitive overload,
  not plasticity exhaustion. Testable analytic-only first step (does RIGID
  concentrate on hub histories?), zero new worlds.

## Round 95 — sensing II: emission, direction, honesty, vigilance (for ELSEWHERE + pause; 2026-11-02)

Motivation: R90 opened ELSEWHERE sensing (active electrolocation) and left the
modality catalog, the honesty problem, and the pause question unfinished. Our
pause was misread twice (idleness, then turn's shadow); vigilance offers a third
reading (scanning), and honest-signaling theory constrains what any new ping
channel can carry.

- **Echolocation: thresholds, simulators, substitution [arXiv:1801.09900v1
  (auditory models of human echolocation detection thresholds: distance,
  pitch, loudness, timbre — THRESHOLDS for a ping design) + arXiv:2403.06847v1
  (SonoTraceLab raytraced bat-echolocation simulator — METHODS for prototyping
  a ping channel before building it) + arXiv:2302.08794v1 (installing bat
  echolocation in humans via training — new channels are LEARNABLE, sensory
  substitution witness) + arXiv:1408.5348v1 (bat algorithm beats intermittent
  search — emission-gated search vs blind search, our ping rationale in
  optimization form)].** → The ping instrument (R90) graduates from sketch to
  spec: thresholds from 1801.09900v1, prototyping in 2403.06847v1-class
  simulation, learnability from 2302.08794v1. Still needs a frozen plan.
- **Heading + single-sensor navigation [arXiv:2109.10689v1 (biologically
  inspired head-direction-cell network for robot navigation — heading
  representation without maps; our heading IS the state, HD cells are the
  mechanism) + arXiv:1310.1411v4, reused from the plume batch (moth finds a
  pulsating source with a SINGLE thresholded sensor + puff-crossing-time —
  minimal sensing + physics beats computation) + arXiv:2605.21329v2 (wind-
  relative RL with ONE memory variable, elapsed-since-detection — our
  firstMatingTick's analogue as policy input)].** → The minimal-sensing
  manifesto for ELSEWHERE: one thresholded sensor + one timer outperforms our
  17-dim passive array IF coupled to the right physics. Our instruments sense
  richly and act bluntly; the literature says sense thinly and act on physics.
- **Honest signals constrain the ping [arXiv:2002.12429v1 (deterministic
  predator–prey model with honest signals AND cues — selection by predators
  builds signaling) + arXiv:1509.08158v3 (handicap principle SUFFICES for
  dimorphic mating displays — bimodal ornaments from costliness alone)].** →
  Two constraints on any mate-ping: (1) without a cost of lying (no predators,
  no fakery penalty), signals go cheap — an honest ping needs a price
  (emission cost, R90's billing note, now with handicap logic); (2)
  1509.08158v3 derives BIMODAL displays from handicap alone — read against our
  HB/BH polymorphism and V1b's skew (is our bimodality handicap-structured?
  analytic-only question on existing per-seed splits).
- **Vigilance reframes pause, third reading [arXiv:1408.1906v1 (digital
  evolving prey: many-eyes collective vigilance evolves; grouping benefit
  quantified) + arXiv:2609.18609v1 (optimum foraging AREA in 3-trophic chains
  — area as the tuned variable, our hub/spread radii by another name)].** →
  Pause-as-scanning: stationary agents sample (predators, mates, food) while
  cruisers sample by moving — the pause/turn decomposition (TURN-GATE line)
  never priced the INFORMATION value of stillness. 1408.1906v1 licenses a
  scanning instrument (pause that senses: stillness-gated detection bonus);
  until then, pause remains triple-ambiguous (idle/turn-shadow/scan) and no
  verdict may assume one reading.
- **Signal canon, searched-not-found (logged).** Catania/Diamond active touch
  (whiskers, star-nosed mole — touch as emission-like probing; our contact
  sensing is passive); lateral line + pit organs (near-field/IR modalities —
  the ELSEWHERE catalog); mantis-shrimp vision (12-channel umwelt — our 17
  dims may be redundant, not rich); waggle dance + vervet alarms
  (REFERENTIAL signals about food/danger — our agents cannot refer; the
  unbuilt channel for any coordination line); eavesdropping + ritualization
  (deepen the 2-hit prior: unintended receivers + intention-movement origins);
  Batesian/Müllerian mimicry + aposematism (deception and honesty, R81's
  receiver psychology extended to signals); crypsis (odor-free routing as
  crypsis — hiding with no watchers, the SHH-without-predators parallel);
  thanatosis (pause misread #3b: death-feigning); protean behavior
  (stochasticity as anti-predictor strategy — our cruise noise, priced).
  Path integration (Wehner, thin prior): homing without landmarks — hub
  fidelity's mechanism candidate.

## Round 96 — attention, gain, binding, efficiency (for turn-gating + gain + fingerprint; 2026-11-02)

Motivation: our agent orients among cues (turn-gating), scales updates by
surprise (gain), and pays per observation dimension (96-dim charged). Each has
a neuroscience twin — biased competition, precision/attention, efficient
coding — and the IB-FRONTIER gap (identity 0.5763 vs valence 0.5753 bits)
looks like a binding failure. This round fuses them.

- **Biased competition = turn-gating [canon: Desimone & Duncan (objects compete
  for representation; top-down bias resolves); journal-bound, verification
  deferred; arXiv = zero].** → Our flip-split (contact-weighted correctness,
  same-val vs flipped) IS a biased-competition experiment: cues compete for
  the turn, training biases the competition. The theory adds the missing
  condition: competition is STRONGEST for nearby/similar items — predicting
  our error concentration (~3 HB cues carry the floor, R-concentration) as
  similarity-driven competition, not noise. Testable analytic-only (cue-
  similarity vs error rate on frozen rows), zero new worlds.
- **Attention as precision/gain [arXiv:2505.03856v1 (active-inference model of
  covert+overt visual attention: dynamic precision optimization minimizes
  free energy; precision set by beliefs AND input) + arXiv:1702.04292v1 (three
  attention mechanisms integrated for ACTIVE visual search: viewpoint
  selection + top-down object attention)].** → 2505.03856v1 is the formal
  home our surprise-gain lacked: gain = precision, set by belief×input.
  Our gain is input-only (surprise); the model says it should be
  belief-conditioned too (attend where you expect information) — the V-next
  gain rule, specified-not-executed. 1702.04292v1's lesson (attention pays
  by REDUCING search cost) reframes our 96-dim charge: attention is the
  mechanism that makes rich sensing affordable — our agents sense 17 dims
  with no attentional gate, paying full price always.
- **Normalization from dynamics [arXiv:1906.08246v6 (divisive normalization
  DERIVED as the steady state of Wilson–Cowan dynamics — Carandini–Heeger
  meets Wilson–Cowan analytically) + canon: Reynolds & Heeger (normalization
  model of attention); Carandini & Heeger review; journal-bound].** → Two
  ports: (1) normalization is not an extra mechanism but the EQUILIBRIUM of
  recurrent dynamics — our actor's recurrence may already normalize (check
  analytic-only: response ratios vs contrasts in logged activations); (2)
  Reynolds–Heeger says attention IS gain-on-normalization — unifying our gain
  line and a future attention line into one knob (gain with a normalization
  pool, not global gain). Specified-not-executed.
- **Binding failures + efficient codes [canon: Treisman (feature-integration:
  binding needs attention; illusory conjunctions when it lapses);
  Wolfe (guided search); Barlow (efficient coding); Olshausen & Field
  (sparse coding); Brunswik (lens model: achievement = ecological validity ×
  utilization); Easterbrook (cue utilization under arousal); all journal-bound,
  verification deferred; arXiv = zero].** → Three ports: (1) IB-FRONTIER's
  identity≈valence gap (0.0010) reads as a BINDING outcome — identity and
  valence are represented but not bound (no conjunction advantage) — Treisman
  predicts binding needs attention, which our probes never engage (passive
  replay). Binding-specific probe: specified-not-executed. (2) Brunswik's lens
  FORMALIZES our niche fingerprint: achievement (1-NN 1.000) = validity ×
  utilization — fingerprint says utilization is perfect; the V1 null (selection
  missing) says validity was unexploited. Cite defensively. (3) Barlow/
  Olshausen ask whether 96 dims are EFFICIENT — our charge prices them, but no
  line tests compression (sparse phi, unbuilt).

## Round 97 — transfer psychology: aftereffects, opponents, helplessness (for the tax; 2026-11-02)

Motivation: the transfer tax (0.2–0.3, asymmetric ben→harm vs harm→ben,
saturating) behaves like textbook perceptual/behavioral aftereffects —
contingent, directional, asymmetric — and the RIGID class behaves like giving
up. Psychology named these decades ago.

- **Contingent aftereffects = the tax [canon: McCollough effect (orientation-
  contingent color aftereffect lasting MONTHS); waterfall/motion aftereffect;
  tilt aftereffect; all journal/textbook, verification deferred;
  arXiv:2503.11970v1 (MAE in depth: directional ASYMMETRY toward vs away +
  vergence-gating of magnitude — adaptation with direction and state)].** →
  The McCollough effect is the transfer tax in miniature: learning bound to
  a CONTEXT (orientation/codebook) misfires when the context changes, and it
  is notoriously hard to extinguish. Our harm→ben stall (~0.67) has the same
  signature (context-bound, extinction-resistant). 2503.11970v1 adds two
  licensed details: aftereffects are DIRECTIONALLY ASYMMETRIC (ben→harm
  converges, harm→ben stalls — predicted, not puzzling) and STATE-GATED
  (vergence modulates magnitude — cf. our energy-gated everything).
- **Opponent processes = HB/BH [canon: Solomon (opponent-process theory of
  motivation: every A-process summons a B-process; dynamics of affect);
  journal-bound, verification deferred; arXiv = zero].** → Our HB/BH pair
  (approach/avoid, 1−turn inversion, gaps summing to 1.0) has opponent
  structure (R84's inversion proof). Solomon adds DYNAMICS: opponents grow
  with use and decay slowly — predicting the asymmetry (dominant process
  flips with history) and tolerance-like saturation (4x-means plateau as
  opponent growth, not capacity). Analytic-only fit candidate (opponent
  equations on existing curves), zero new worlds.
- **Helplessness = RIGID [canon: Seligman & Maier (learned helplessness;
  2016 update: passivity is the DEFAULT, control must be LEARNED);
  journal-bound, verification deferred; arXiv "learned helplessness" =
  control-theory polysemy + soft-robot RL — searched-not-found].** → The
  Maier update inverts the question: our RIGID agents (47/48 stampede,
  uniform-low births) may not have LEARNED to fail — they may never have
  learned CONTROL (their actions never mattered: decoupled mating, fixed
  cruise, bar-gated everything). Controllability is the unbuilt variable:
  an arm where actions demonstrably matter (contingency degradation control)
  separates helplessness from inability. Specified-not-executed.
- **Boredom, mind-wandering, latent structure [canon: Danckert (boredom as
  exploration-value signal); Raichle (default mode); Tulving (encoding
  specificity); Morris (transfer-appropriate processing); Miller & Matzel
  (comparator); Tolman (latent learning — thin prior, deepened);
  Dayan/Momennejad (successor representation — 1-hit prior, pointer);
  journal-bound, verification deferred; arXiv = zero].** → Four ports, all
  analytic-or-unbuilt: (1) boredom REFRAMES cruise (R95's pause triple
  becomes quadruple: idle/turn-shadow/scan/boredom-seeking-novelty) —
  cruise-as-exploration-bonus, testable via novelty-contingent cruise rates
  analytic-only. (2) DMN/mind-wandering is the replay-content theory R94's
  dreams left open: rest replay consolidates (sleep canon) AND simulates
  (Revonsuo) — our replay does neither verifiably; content-logging is the
  unbuilt measurement. (3) TAP + comparator + encoding specificity jointly
  say performance ≠ knowledge and mismatch predicts failure — the transfer
  tax EXPECTED under mismatch (R84's TAP note, now with comparator teeth:
  never infer learning from performance alone — our verdicts already obey
  this by scoring behavior, honestly labeled). (4) Latent learning + successor
  maps: our probes may reveal learning invisible in training (latent) and
  our Q may be a predictive map (successor) — both re-reads of frozen data,
  zero new worlds.
- **Grid cells: path integration's mechanism [arXiv:0811.1826v3 (accurate path
  integration in continuous-attractor grid-cell models)].** → R95's head-
  direction cells get their companion: HD (direction) + grid (distance) =
  full path integration. Our agents integrate (cruise/home) with neither
  structure named — the attractor-network implementation is the unbuilt
  upgrade over our dead-reckoning-by-ticks, and the model quantifies the
  drift our homing would accumulate. Specified-not-executed.

## Round 98 — CLS, neurogenesis, consolidation (for replay + retention; 2026-11-02)

Motivation: V1f–V1i built surprise-gated replay and NBSP-style protection was
specified (R85) — both have direct counterparts in continual-learning and
hippocampal literatures with sharper prescriptions than ours.

- **Synergy: consolidation + replay [arXiv:2206.04016v1 (SYNERgy: synaptic
  consolidation × dual-memory experience replay for general continual
  learning) + arXiv:2610.39790v1 (long-term AGENT memory: complementary
  curation + consolidation, episodic + relational) + arXiv:2110.07276v3
  (carousel: bounded episodic memory for on-device continual learning)].** →
  2206.04016v1 is V1f–V1i's published twin (consolidation AND replay, not
  either/or — our bundle arm prefigured this). 2110.07276v3's bounded carousel
  is our founder-slot constraint formalized (small hardware, smart
  replacement — our replay is uniform-random; carousel/MaximallyInterfered
  retrieval is the unbuilt upgrade). 2610.39790v1's episodic+relational split
  ports to our rows vs lineage-founders (episodes vs relations — currently
  separate files, never jointly scored; joint scoring is analytic-only).
- **Consolidation AND reconsolidation, modeled [arXiv:1703.01357v7
  (computational systems-consolidation + reconsolidation model: reactivation
  returns memories to hippocampus-dependence)].** → The probe-effect risk,
  formalized: our probes REACTIVATE (runTasteProbe replays histories), and
  reactivation makes memories labile. Every probe battery may be
  reconsolidating (destabilizing) what it measures — the measurement-threat
  R89 raised for retrieval-induced forgetting, now with a model. Prescription:
  post-probe stability checks (re-run a probe unchanged; drift = lability),
  analytic-only on existing probe pairs where available, else specified-not-
  executed.
- **Weights that matter, protected [arXiv:2004.14366v2 (elastic weight
  consolidation for bias inoculation: fine-tune with EWC, forget less)].** →
  EWC is NBSP's cheaper cousin (R85 specified protect-by-importance; EWC
  implements it via Fisher information — and Fisher information is ALREADY in
  our map (R26-30 thesis metric)). The chain closes: Fisher-metriced EWC on
  slow weights = the retention instrument with all parts in-hand.
  Specified-not-executed (needs frozen plan).
- **Neurogenesis: separation, causality, structure [arXiv:1704.07526v1
  (neurogenesis + multiple plasticities enhance CA3 retrieval in a SPIKING
  model) + arXiv:1104.5674v2 (CAUSAL models separating neurogenesis-dependent
  vs independent behavioral effects) + arXiv:0912.2108v1 (NETWORK STRUCTURE
  determines reorganization under adult neurogenesis) + arXiv:q-bio/0412036v1
  (computational models of adult neurogenesis) + arXiv:1202.2148v1
  (neurogenesis DRIVES decorrelation in olfactory bulb — separation!)].** →
  Three ports: (1) 1202.2148v1's decorrelation is pattern separation by
  construction — our codebooks separate by design (niche-ID 1.000 needs no
  neurogenesis; but TRANSFER needs separation-preserving mapping, unbuilt).
  (2) 1104.5674v2's causal-separation methods port to every ablation we run
  (dependent vs independent effects of a knob — our G2 audits assert but
  never estimate). (3) 0912.2108v1: STRUCTURE governs reorganization outcome —
  our weight-topology is never measured (QD mapped activity, not wiring);
  wiring census is analytic-only on frozen final weights, zero new worlds.

## Round 99 — sex, demography, selfish genes (for mating + lineage; 2026-11-02)

Motivation: our mating ignores sex roles (Bateman), sex ratios (Fisher),
age (terminal investment), kin structure (sl-CSD), genomic conflict (Haig),
and mobile DNA (McClintock) — six literatures that jointly say our lineage
data are under-theorized. Collected here, briefly, as analytic lenses.

- **Sex-ratio dynamics, multilevel [arXiv:1304.5519v2 (sex-ratio evolution
  gene→multilevel selection; males as passive carriers; coordinate change
  reveals new aspects) + arXiv:1303.0401v2 (male-subpopulation equilibrium
  nature/role) + arXiv:q-bio/0702038v2 (sex ratio + NUMBERS for translocation
  in METAPOPULATION management — links R88!) + arXiv:1206.1311v2 (CULTURAL
  effects on sex ratios — environment sets ratios)].** → Our founders have a
  sex ratio (engine-assigned) nobody audits: q-bio/0702038v2 makes ratio +
  numbers JOINT management variables (our bars set numbers; nothing sets
  ratio). Analytic-only first step (audit sex ratio by arm/bank on frozen
  rows — zero new worlds); if skewed, Fisher's principle predicts compensatory
  dynamics our single-generation window cannot show (documented, not tested).
- **Roles, effort, age [canon: Bateman (male variance ≫ female — our sex-blind
  mating averages over the fundamental asymmetry; per-sex gen-2 variance is
  computable analytic-only on existing lineageFounders); Fisher (1:1);
  Pianka (residual reproductive value — the bar as RRV threshold, third
  framing after oosorption and asset protection); Clutton-Brock (terminal
  investment — old founders should mate MORE; testable analytic-only on
  age-at-mating); Clark (asset protection — young protect future, bar as
  protector); all journal-bound, verification deferred; arXiv = zero].** →
  Four pre-registered analytic queries on frozen banks (per-sex variance;
  age-at-first-mating distribution; RRV-form fit of the bar; terminal-
  investment slope), zero new worlds — the demography our mating line never
  did.
- **Selfish DNA + intragenomic conflict [canon: McClintock (controlling
  elements; genome shock); transposons (parasitic DNA; our static genomes
  lack them — a missing variation source, documented); Haig (genomic
  imprinting as parental conflict within the genome — R85's dog POC taken
  molecular); sl-CSD bees (inbreeding → diploid-male sterility — a MECHANISM
  for our gen-2 failures under kin mating: inbred diploid males fail);
  Wolbachia (reproductive parasites; our sterile ecology lacks them —
  Hamilton–Zuk adjacent, R86); Schmalhausen/Woltereck (reaction norms —
  per-seed spreads ARE norms of reaction; the formalism our spreads lack);
  Hsp90/Rutherford/cryptic variation (covered pointer); all journal-bound,
  verification deferred; arXiv = zero].** → The sl-CSD note is the sharpest:
  if our engine's sex determination punishes inbreeding analogously, kin-
  concentrated hubs (R88) would show exactly the gen-2 deficit we see —
  checkable in engine code (read-only) before any new bank.

## Round 100 — extended phenotype, engineering, trophic control (for niche + stability; 2026-11-02)

Motivation: round 100. Our agents modify food (deplete patches), sense scent,
and live in metapopulations — phenotype extended into environment, niche
constructed, food webs implied. The literatures that make these precise, plus
the trophic control theory our stability questions need.

- **Genes act through environments [canon: Dawkins (extended phenotype —
  beaver dams, caddis houses: genes' effects outside bodies); Odling-Smee
  (niche construction — reciprocal causation, neglected in our selection-only
  instruments); Jones (ecosystem engineers); ecological inheritance;
  Laland (cultural niche — Boyd/Richerson covered, cultural-niche specifically
  brief); all book/journal-bound, verification deferred; arXiv niche models:
  2305.09369v1 (NC dynamics in ADAPTABLE populations in diverse environments
  — reciprocal causation modeled!), 2503.18961v1 (tracking niche EVOLUTION in
  XCS learning-classifier systems — in-silico niche construction, methods
  pointer for logging our agents' environmental modifications),
  2309.02788v1 (stochastic niche-based species models); arXiv = thin but
  real].** → The unbuilt measurement: environmental-modification ledger
  (patches depleted/created per agent — food is already logged globally;
  per-agent attribution is analytic-only on existing step data where
  available). 2503.18961v1's niche-tracking ports to our banks (track niche
  occupancy across attempts — are later banks' niches constructed by earlier
  attempts' depletion? No — fresh banks reset; the QUESTION is whether they
  should: constructed-bank designs, specified-not-executed).
- **Trophic control without trophics [arXiv:1404.7728v3 (trophic COHERENCE
  predicts food-web stability — the structural property May's models missed)
  + arXiv:1212.5025v1 (persistence of complex food webs in METACOMMUNITIES —
  links R88!) + arXiv:1403.2352v2 (trophic groups/modules) +
  arXiv:2502.11220v1 (coarse-graining cascades) + arXiv:1006.4432v4 (social-
  network consumption models)].** → 1404.7728v3's moral ports: stability comes
  from an IGNORED structural property (coherence), not from tuned parameters —
  our saturated substrate (RIGID) may likewise await a structural reading
  (what is our coherence? candidate: contact-graph coherence across the
  transfer — analytic-only on frozen weights). 1212.5025v1 fuses trophic
  persistence with metacommunities (R88's banks-as-patches, now with feeding
  links — our banks have no cross-patch feeding; metacommunity feeding is
  specified-not-executed).
- **Canon, searched-not-found (logged).** Grime CSR (competitors/stress-
  tolerators/ruderals — hubLeave as ruderal strategy, third framing after
  spacing and leaving); Chesson MCT (stabilizing vs equalizing — needs
  species we lack; documented absence); Janzen–Connell (enemies maintain
  diversity — no enemies; documented absence, Hamilton–Zuk adjacent);
  Holt apparent competition (shared predators couple prey — no predators;
  documented absence); Werner–Peacor TMII + Laundré fear + NCEs (risk
  reshapes foraging without a single death — our ecology's missing force;
  fear ecology stands as the largest unbuilt context: what would a predator
  change? specified-not-executed as a design question, not a plan).

## Round 101 — teaching + iterated learning + compositionality (for M5 transmission; 2026-11-02)

Motivation: the SOCIAL line copied outcomes unconditionally and changed nothing
(R82: copy-when-uncertain untested). Two literatures say the missing pieces are
WHICH examples get transmitted (teaching) and WHAT bottlenecks do to signals
(iterated learning). Both now have in-silico results.

- **Machine teaching formalizes teaching [arXiv:2105.13809v1 (distribution
  matching for machine teaching: teacher steers student to target hypothesis,
  balancing risk vs cost, WITHOUT knowing the student's parameters)].** →
  Teaching as bi-level optimization: choose examples given (an estimate of)
  the learner. Our copybest transmitted OUTCOMES (maternal success); teaching
  transmits well-chosen INPUTS (which encounters to copy). The R82 conditional
  rule (copy when uncertain) plus 2105.13809v1 (teach the informative cases)
  jointly specify the unbuilt SOCIAL-V2: uncertainty-gated copying OF
  teacher-selected encounters. Specified-not-executed (needs frozen plan).
- **Bottlenecks create structure [arXiv:2404.02145v2 (iterated learning
  IMPROVES compositionality in large vision-language models — SOTA VLMs fail
  "girl in white facing man in black" vs swapped; iterated bottleneck fixes
  it) + arXiv:2403.11958v1 (language evolution with deep learning — review
  chapter: agent-based, Bayesian, GA, rule-based + deep) + arXiv:2503.21676v2
  (LLM fact-learning: plateau → attention-circuit formation → precise recall;
  training ORDER matters — curricula)].** → 2404.02145v2 is the Kirby
  bottleneck in-silico: transmission bottlenecks don't degrade signals, they
  STRUCTURE them. Our transplant chains (turn-gate V1d–V1i carried weights
  segment to segment) ARE iterated learning with a lossless bottleneck
  (exact-copy transplants) — predicting NO structure gain (same-val 0.95 no
  erosion, exactly observed). The testable flip: LOSSY bottlenecks should
  regularize (R92's lossy-tutoring prediction, second witness).
  [Amendment 2026-11-02: arXiv:2404.04286 (counterpart result — iterated learning AMPLIFIES
  bias; errors compound across generations) bounds the claim: bottlenecks structure AND
  distort. V1j's lossy arm therefore tests structure-vs-amplification jointly — lift with
  preserved same-val = structuring; lift with collapsed same-val = bias amplification.
  The GO bar's fidelity floor (>= 0.5) is the pre-registered separator. Via literature-map
  anti-duplication audit (R13-adjacent NIL entry).]
  2503.21676v2's plateau→circuit→recall phases mirror our 4x-means
  (0.59→0.71→0.81→0.82: gains then stall) — plateaus precede circuit
  formation, not capacity ceilings; distinguishing needs the reopening
  manipulation (R92, unbuilt).
- **Canon, searched-not-found on arXiv (logged).** Caro & Hauser (functional
  teaching: meerkats provision scorpions by pup age — teaching tuned to
  pupil state, the R82 conditional in the wild); Franks & Richardson
  (tandem-running ants TEACH routes — bidirectional feedback, leader slows
  for follower; our transplants are unidirectional dumps); Csibra &
  Gergely (natural pedagogy — ostensive cues mark teachable moments; our
  probes carry no ostension flag); Lyons (overimitation — copy causally
  irrelevant steps; our copybest copied the outcome, never the steps);
  Tomasello 2014 (pointer, already mapped); Kirby (iterated-learning theory
  behind 2404.02145v2 — bottleneck-size predictions for codebook structure,
  testable analytic-only on transferred vs trained codebook compressibility,
  zero new worlds).

## Round 102 — commons + punishment + institutions (for M5 cooperation; 2026-11-02)

Motivation: our hubs are a commons (shared, depleting, overcrowded) with no
governance — no monitoring, no sanctions, no exit but starvation. The
commons literature ran this experiment with punishment and institutions;
this round collects the treatments we never applied.

- **The tragedy, experimentally + demographically [arXiv:1705.07214v1
  (tragedy of the commons IN THE CHEMOSTAT: cooperator pays public-good cost
  to digest food, cheater free-rides — proof of principle) +
  arXiv:1112.3370v1 (demography + tragedy: individual success = LOCAL
  advantage × GROUP productivity share; selfishness degrades the group)].**
  → 1112.3370v1's equation IS our hub: per-capita intake (local) times
  establishment (group). The despotic deficit (hub eats 25–35% less, starves
  2–3×) is the tragedy's signature with the mechanism named (selfish
  intake degrades patch productivity). 1705.07214v1's chemostat maps onto
  our hub (well-mixed, shared inflow, public-good = patch regrowth nobody
  pays for). Our data re-read as a commons experiment: no treatment arms
  exist (all arms are open-access).
- **Punishment + institutions as treatments [arXiv:2405.18419v3 (altruistic
  punishment × CULTURAL MULTILEVEL SELECTION, PDE model in the Boyd/Gintis/
  Bowles/Richerson lineage) + arXiv:2011.01786v1 (evolution of PUNISHING
  INSTITUTIONS — solves the second-order problem punishment alone cannot) +
  arXiv:2508.08302v1 (non-participant externalities reshape punishment) +
  arXiv:1101.1702v4 (institutional sanctioning + SKEPTICAL punishers) +
  arXiv:1006.2903v1 (punishment in public goods) + arXiv:2301.04849v2 (EXIT
  OPTIONS sustain punishment, cut second-order free-riding) +
  arXiv:1212.3807v1 (prevent tragedy by punishing OVER-consumers +
  encouraging UNDER-consumers) + arXiv:1208.0482v1 (population STRUCTURE
  itself evolves — group-size preference coevolves!)].** → Three unbuilt
  treatments, each with a frozen-plan-ready shape: (1) over-consumer
  punishment (1212.3807v1: tax intake above a rate — the leaving rule's
  institutional twin); (2) exit options (2301.04849v2: dispersal sustains
  punishment — fuses R88 dispersal with governance); (3) evolvable structure
  (1208.0482v1: group-size preference as a trait — our hub/spread topologies
  as evolvable, not fixed). All specified-not-executed. 2011.01786v1's
  moral: peer punishment needs institutions — our founders punish nobody
  and belong to nothing; cooperation without either is the null we keep
  re-measuring.
- **Canon, searched-not-found (logged).** Hardin (the tragedy); Ostrom
  (8 design principles — monitoring, graduated sanctions, collective choice;
  our ecology violates all 8 by construction — the principles double as a
  checklist for what an institution arm would need); Fehr (altruistic
  punishment experiments); Noe & Hammerstein (biological markets — partner
  CHOICE disciplines cooperators; our mating is indiscriminate AND our
  foraging is solitary: no market on either side).

## Round 103 — culture as computation + conformist transmission (for M5; 2026-11-02)

Motivation: MATE-SOCIAL's copybest was unbiased, individual, memoryless
copying — the thinnest possible culture. The cultural-evolution literature
says the interesting regimes are biased, collective, and computational;
this round maps them onto our null.

- **Culture evolves computationally [arXiv:1310.6342v1 (cultural evolution
  as DISTRIBUTED COMPUTATION) + arXiv:2601.00433v1 (modelling cultural
  evolution) + arXiv:2203.00715v1 (real-time cultural transmission without
  human data) + arXiv:1204.2043v2 (UNBIASED transmission in archaeological
  assemblages — the null model!) + arXiv:1812.00143v4 (Extended Evolutionary
  Synthesis facilitates culture models)].** → 1204.2043v2 names what SOCIAL
  V1 ran: unbiased transmission — the archaeological NULL, which predicts
  drift, not adaptation. Our 1=1 exact-neutral is the null behaving
  correctly, not a failure. Anything beyond null needs bias (success,
  prestige, conformist) or structure (teaching, R101) — all unbuilt.
  1310.6342v1's distributed-computation frame ports to banks-as-computation
  (R83's seed-bank memory, second witness: dormant variants compute across
  seasons).
- **Canon, searched-not-found (logged).** Henrich (prestige bias — copy the
  successful, not the random; our copybest copied the maternal line
  regardless of success; prestige-gating is the R82-conditional with a
  who, not a when); Boyd & Richerson (conformist transmission — copy the
  majority; our founders never meet a majority — group-size precondition
  unmet, links R88 dispersal); Mesoudi & O'Brien (hierarchical-structure bias
  — R82's semantic-Axelrod pointer, restated for the culture file).

## Round 104 — planetary + filters + biosignatures (for Vision's "other planets"; 2026-11-02)

Motivation: Vision opens with two agents on Earth expanding to other planets
over long periods; the program has no off-world, no deep time, no filter
thinking. Astrobiology supplies all three — and the Great Filter paper
below contains an uncomfortable parallel to our energy bar.

- **A new filter: depopulation [arXiv:2602.08188v1 (new Great Filter
  candidate: species at the top of the food chain evolve FEWER offspring
  under relaxed predation — Darwinian selection for low fertility with
  intelligence)].** → Read against our mating arc: our founders face an
  energy bar (mate only if ≥50) that functions as a fertility filter —
  populations that cannot clear it do not compound (INFORMED void,
  MATE-DENSE null). The paper's filter (selection against breeding under
  safety) and ours (selection against breeding under scarcity) are mirror
  images with the same signature: compounding failure WITHOUT mortality
  crisis. The filter framing ports to banks (each fresh bank = a filter
  test: which lines pass?) and to Vision (interplanetary expansion multiplies
  filters — establishment, not transport, is the hard step, matching R74's
  nucleation/INFORMED reading).
- **Biosignatures as evidence theory [arXiv:1806.04592v1 (atmospheric
  SEASONALITY as biosignature — time-varying, not static, gases) +
  arXiv:2505.22808v1 (QUANTITATIVE habitability framework, NExSS) +
  arXiv:2503.22990v1 (habitability + biosignatures beyond Earth-like)]** →
  1806.04592v1's move (static → time-series evidence) is our curves'
  license: endpoint energies are static biosignatures; trajectories are
  seasonal ones — the measurement doc's trajectory analysis (hub diverges by
  tick 256) already practices this. The NExSS framework ports to the
  observatory (measured senses/actions/energy/history = a habitability-style
  evidence standard for "is there compounding here?").
- **Canon + honest logs.** Seager (biosignature assessment — the canon behind
  the arXiv cluster); Hanson (filter steps — the canon 2602.08188v1 extends);
  Fermi paradox (the question Vision's expansion answers to); panspermia /
  lithopanspermia / terraforming (searched-not-found on arXiv — logged, not
  cited); Gaia (pointer, already mapped); multi-planet insurance
  (unbuilt rationale: fresh banks as planetary backups — diversification
  against single-bank catastrophes; our spent-bank discipline already
  implements the insurance logic without the name).

## Round 105 — richer bodies (for M4's gating milestone; 2026-11-02)

Motivation: Vision gates richer bodies on measured, explained simpler models.
Transfer is CLOSED AS DEPLOYED (not explained — tax attributed, floor
attributed, mechanism deployed, but no unlearning mechanism identified);
bodies stay gated. This round stages the mechanisms waiting at the gate.

- **Morphology varies, robustness follows [arXiv:2208.02809v2 (morphological
  variation in evolutionary robotics: variable conditions select robust,
  reality-crossing controllers — variation as METHOD)].** → The M4 license
  condition, operationalized: vary the body (speed, sensing radius, size —
  all traits our genomes ALREADY carry) and select across conditions.
  Our traits vary only by mutation, never by experimental design — the
  morphology ladder (slow/fast, narrow/wide sensing) is specified-not-
  executed, gated behind the transfer-tax explanation per Vision's ordering.
- **Patterning without blueprints [arXiv:1402.0760v2 (topology-driven
  instabilities: pattern formation on directed networks)].** → Reaction-
  diffusion/Turing patterning as the body-plan generator (no Hox needed for
  spots/stripes/compartments). Our spatial structure (patches, centers,
  walls) is hand-placed; self-organized patterning is the unbuilt
  alternative — brief, M4-gated.
- **Canon + honest logs (all searched-not-found on arXiv).** Sims
  (evolved virtual creatures — pointer, already mapped); Xenobots (pointer,
  already mapped); Hox genes (body-plan patterning genetics — the knob our
  genomes lack entirely; a Hox-like positional axis is the deepest unbuilt
  body change); octopus (2/3 of neurons in the arms — distributed control
  taken furthest; our 96-dim centralized billing is the opposite pole);
  morphological computation (pointer, already mapped); morphological
  foraging (R79's unbuilt mechanism — grow toward, retract from); slime-mold
  decision-making (pointer, already mapped); active matter (pointer, already
  mapped). M4 stays gated: none licensed until the transfer tax has a
  mechanism, not just an attribution.

## Round 106 — spatial ecology II: SLOSS, corridors, sources, sinks, traps (for the encounter line reread; 2026-11-02)

Motivation: R49 mapped islands, neutral theory, and engineers — but the
encounter line (hub vs spread vs duo) unknowingly ran the SLOSS experiment
(single large vs several small), built corridors (duo), and managed a
metapopulation without source-sink diagnosis. This round names what was run.

- **SLOSS, literally [canon: Simberloff & Abele (SLOSS debate); Diamond
  (assembly rules); journal-bound, verification deferred; arXiv = noise].**
  → Our encounter topologies ARE the SLOSS treatments: hub (single large),
  spread (several small), duo (few large + matrix). The V1c verdict (duo
  wins everything: 10 vs 2/2) reads as a SLOSS result (few-large beats
  single-large and several-small under clumped food) — but SLOSS theory says
  the answer depends on the currency (species richness vs single-species
  compounding): we measured compounding, not richness, so the debate's
  resolution does not transfer cleanly. Specified: re-score frozen rows for
  richness-like metrics (distinct lineages mating, analytic-only) before
  citing SLOSS either way.
- **Corridors [canon: Haddad (corridor experiments); Beier & Noss;
  journal-bound, verification deferred; arXiv = noise].** → Duo's two
  centers function as connected patches — a corridor design. The corridor
  literature predicts connectivity raises colonization WITHOUT raising
  per-patch productivity — matching V1c exactly (duo births 49 vs 29/35,
  energies best-in-class −20.5: more movement, better condition). The duo
  arm may be a movement effect misread as a topology effect; the
  discrimination (track inter-center movement, analytic-only on positions
  — blocked, no per-tick positions logged; specified for future instruments).
- **Source-sink diagnosis, analytic-ready [arXiv:1210.4641v1 + arXiv:1111.2535v1
  (source-sink metapopulations as graphs; past/growth/persistence) +
  arXiv:1011.1109v1 (dispersal ASYMMETRY effects) + arXiv:1305.2769v2
  (dispersal vs stability) + arXiv:1709.07515v1 (collective dispersal,
  eco-evolutionary) + arXiv:2405.04505v1 (density-dependent metapopulation)
  + arXiv:2412.18448v2 (finite-size survival scaling)].** → Pulliam's test,
  computable NOW on frozen rows (zero new worlds): per-capita births minus
  per-capita deaths by topology — sources (positive) vs sinks (negative,
  sustained by immigration). Pre-registered reading: hubs are SUSPECTED
  sinks (high births 35–39/row, higher deaths, poorest energies) propped by
  within-hub movement; spread are suspected sources. If confirmed, the
  despotic story sharpens (sinks attract: see next bullet).
- **Attractive sinks = our hub, formalized [canon: Battin (ecological traps);
  Kokko & Sutherland (attractive sinks); Robertson & Hutto (review);
  journal-bound, verification deferred; arXiv = zero].** → V3 called the hub
  a "trap" informally; trap theory makes it quantitative (preference decoupled
  from fitness: cues say food, outcomes say starvation). Our agents cannot
  evolve avoidance within a run (no selection across runs on preference) —
  which is WHY the trap persists across all five banks. The unbuilt
  instrument: multi-RUN selection on taxis strength (does the trap dissolve
  when avoidance can evolve?). Specified-not-executed (needs frozen plan;
  this is the long-arc version of ML1).
- **Rescue effects [canon: Brown & Kodric-Brown (rescue effect);
  journal-bound, verification deferred; arXiv = zero].** → Transplants
  (turn-gate) and maternal carryover (mating) ARE demographic/genetic rescue:
  small/declining populations revived by immigrants. V1d-seg2's second
  transplant is literally a rescue treatment. Reframe the transplant lines
  as rescue experiments: effect size = rescue magnitude. No new instrument;
  a lens for existing verdicts.
- **Hypervolume + rules + succession [canon: Hutchinson (n-dimensional
  hypervolume — the niche FUNDAMENTAL, not the fingerprint proxy);
  Foster (island rule), Bergmann/Allen (eco-geographic rules — different
  planets, different rules; Vision-expansion relevance); Tilman/Hastings
  (competition–colonization tradeoff — hub = competitors, spread =
  colonizers?!); Clements/Gleason (succession — 1792-tick runs as
  succession: pioneer → climax? endpoints as climax states); journal-bound,
  verification deferred; arXiv:2212.06308v1 (dynamic area-of-distribution
  theory — movement × tolerance × ...), math/0306113v1 (succession phase
  transitions, interacting particles)].** → Three ports: (1) Hutchinson
  FORMALIZES the fingerprint (weights → hypervolume, not just 1-NN labels);
  (2) competition–colonization rereads hub (win locally) vs spread (find
  globally) as the tradeoff axes — untested, needs movement data (blocked,
  same logging gap as corridors); (3) Tilman + succession jointly predict
  that LONGER runs change the winner (climax favors competitors) — our
  fixed 1792 horizon may truncate succession; horizon-extension is
  specified-not-executed (R64-adjacent exposure question, new rationale).

## Round 107 — selection regimes & load (for bars, banks, mutation; 2026-11-02)

Motivation: our verdict bars are HARD thresholds (gen-2 ≥ 2), our gating is
SOFT (continuous modulation), our banks accumulate no load by design
(noise null), and our op ledger prices selection without naming its regime.
Population genetics named all four situations; this round ports them.

- **Hard vs soft [canon: Wallace (hard vs soft selection); Christiansen
  (density/frequency dependence); journal-bound, verification deferred;
  arXiv "soft/hard selection" = ML model-selection polysemy —
  searched-not-found].** → Name the instruments: mating bar = HARD selection
  (absolute threshold, density-independent); surprise-gain and turn-gating =
  SOFT (relative, competitive). The distinction predicts their failure
  modes: hard bars go void under scarcity (INFORMED void, DENSE null —
  observed); soft modulators saturate under abundance (V1f–V1i plateau —
  observed). Verdict design should match regime to question (hard bars for
  establishment, soft bands for tuning) — currently done by instinct;
  now by name.
- **Levene niches [canon: Levene (multiple-niche polymorphism); Dempster;
  journal-bound, verification deferred; arXiv = Levene's-test polysemy —
  searched-not-found].** → Our fresh banks ARE Levene niches (spatial
  variation maintaining polymorphism across the program, if not within a
  run). The Levene conditions (soft selection + dispersal among niches)
  map to: soft gating (have it) + transplant/carryover between banks
  (have it, V1d–V1i). Prediction: polymorphism persists ACROSS banks
  while eroding WITHIN — testable analytic-only (variance within vs
  between banks on frozen rows), zero new worlds.
- **Load theory for load-then-recombine [canon: Bateman–Mukai (MA lines);
  Haldane (cost of selection / substitution load); journal-bound,
  verification deferred; arXiv:0709.2646v1 (Markov waiting-time models for
  accumulating mutations — the load clock!); q-bio/0609046v3 (pointer,
  R86); drift-barrier/Ohta/Eigen pointers (R49–50)].** → The MLR1 follow-up
  needs MA-line theory: how much load accumulates per generation at given
  noise, and how many generations to a detectable purge signal. 0709.2646v1
  is the waiting-time formalism; Haldane's cost prices the selection the
  ledger bills. Specified: calibrate the load phase analytically (zero
  worlds) before freezing any load-then-recombine plan — no bank until the
  clock says the load is detectable.
- **Error threshold, restated [canon: Eigen (error threshold); hypercycle
  (pointer, R50)].** → Transmission noise 0.05 sits somewhere below the
  threshold (policies survive); the threshold ITSELF is unmapped (at what
  noise does inheritance collapse?). A noise-dose instrument would map it —
  specified-not-executed (needs frozen plan; the dose ladder ML2 used for
  k_L is the template).

## Round 108 — behavior II: variance, norms, monitoring, novelty (for spreads & SOCIAL; 2026-11-02)

Motivation: R85 mapped personalities; the program's actual variance
(per-seed spreads that never collapse) still lacks analytic treatment, and
R82's conditional copying lacks its prerequisite (uncertainty monitoring).
This round collects the individual-differences and social-cognition tools.

- **Variance has structure [canon: Stamps (predictability as a trait;
  intra-individual variability = IIV); Dingemanse (behavioral reaction
  norms — individual × environment slopes); Koolhaas (coping styles:
  proactive vs reactive); journal-bound, verification deferred; arXiv =
  STARFLAG/collective noise — searched-not-found].** → Three analytic-only
  lenses for frozen transfer/mating rows, zero new worlds: (1) partition
  spread variance into among- vs within-history (IIV) — is "retained
  distinct skills" among-history signal or within-history noise?
  (2) per-history slopes across codebooks = behavioral reaction norms —
  do histories differ in INTERCEPT (skill) or SLOPE (plasticity)?
  (3) Koolhaas coping: proactive leavers (ML1 hubLeave-like: leave when
  poor) vs reactive stayers — classify frozen agents by leave-behavior,
  test whether style predicts transfer. All specified, none executed.
- **Monitoring precedes conditional copying [canon: Hampton (uncertainty
  monitoring/metacognition); Smith (uncertainty responses); journal-bound,
  verification deferred; arXiv = zero].** → R82's SOCIAL-V2 (copy when
  uncertain) silently requires METACOGNITION — the agent must estimate its
  own uncertainty. Our agents have no uncertainty readout (no confidence
  channel, no variance estimate). The honest dependency: conditional social
  learning is unbuildable until an uncertainty signal exists — which
  specifies the prerequisite instrument (confidence readout, e.g. value
  spread or contact-rate proxy), not the copying rule. Specified-not-executed.
- **Novelty: the RSI ingredient [canon: Reader & Laland (animal innovation);
  Goodall/Beck (tool use); Blaisdell (causal vs associative); Rogers
  (social-learning paradox — copying can LOWER population fitness!);
  journal-bound, verification deferred; arXiv = zero].** → (1) Innovation
  is what RSI needs and no line measures (all improvement is parametric) —
  the novelty metric is the missing dependent variable (new behaviors,
  not better curves; specified-not-executed). (2) Rogers' paradox reframes
  SOCIAL V1 exactly: unconditional copying need not help populations —
  the null is predicted, second witness after R82. (3) Tool use (Goodall)
  = extended phenotype with a learning loop (R100-adjacent) — unbuilt.
  (4) Causal cognition (Blaisdell) bounds our agents as associative
  (R21–25 canon) — causal unbuilt, documented.

## Round 109 — development & eco-evo II (for bodies & timescales; 2026-11-02)

Motivation: R50 fenced evo-devo constraints; the developmental and
eco-evolutionary literatures proper still hold the program's two timescale
questions (bodies; simultaneous eco+evo) plus the lab-adaptation confound.

- **Transfer as exaptation [canon: Shubin (deep homology; fin-to-limb);
  journal-bound, verification deferred; arXiv = zero].** → Deep homology
  says: same genes, new uses. Our transfer IS exaptation (food-turn circuit
  reused for mate approach, R81's trap) — Shubin gives the pattern a name
  and a prediction (exapted structures carry historical constraint:
  mate-taxis should show food-gradient quirks — checkable analytic-only
  in steering data, zero new worlds).
- **Developmental systems, briefly [canon: Oyama (DST — parity thesis:
  genes no privilege over other developmental resources); journal-bound,
  verification deferred; arXiv = zero].** → The parity thesis supports the
  R83/R100 transmission program philosophically (maternal copy is one
  resource among many) but adds no instrument. Logged for the thesis, not
  the bench.
- **Eco-evo is the program [arXiv:1806.07633v1 (eco-evolutionary feedbacks
  review: models + perspectives, notes missing crosstalk) + arXiv:1912.09505v1
  (animal BEHAVIOR facilitates eco-evo dynamics — behavior as the
  mechanism!) + arXiv:2008.07671v1 (environmental-feedback game dynamics) +
  arXiv:1902.03016v2 (spatial eco-evo feedbacks mediate coexistence) +
  arXiv:2501.07379v3 (trait-structured predator-prey eco-evo, incl. cancer)
  + arXiv:2511.23209v1 (stochastic fluctuations in eco-evo games)].** →
  Our ticks run ecology AND evolution simultaneously — the program IS an
  eco-evolutionary system that never cites the field. 1912.09505v1 is the
  keystone (behavior as eco-evo mechanism — our policies are the feedback
  channel). 1902.03016v2 (spatial feedbacks → coexistence) rereads
  hub/spread as eco-evo treatments. The field's complaint (missing
  crosstalk, 1806.07633v1) is our opportunity: banked, instrumented
  eco-evo with both timescales logged.
- **Domestication as confound [canon: Larson (domestication genomics);
  Diamond (guns/germs/steel proximate review); Johnson & Munshi-South
  (urban evolution — contemporary, fast, in novel habitats); journal-bound,
  verification deferred; arXiv = urban-planning noise — searched-not-found].**
  → The bank-dependence finding (elevated baselines) may BE domestication:
  lines selected, inadvertently, for lab/bank conditions (frozen inference,
  fixed densities, 1792-tick horizons). Testable analytic-only: wild-vs-lab
  divergence needs a wild reference (absent) — so the weaker specified test
  is bank-age effects (do later banks behave more "lab-like"? trend on
  frozen endpoints, zero new worlds). Urban evolution (Johnson) is the
  natural-population twin: our banks as urban islands, rapid adaptation to
  novel regimes in tens of generations — exactly our timescale.

## Round 110 — energy, stoichiometry, planetary regulation (for the ledger; 2026-11-02)

Motivation: R78 priced the ledger (Landauer); R93 scaled it (Kleiber);
the ecological-energetics canon still holds the flow language (Lindeman),
the ratio language (Redfield/Sterner/Elser), and the regulation-without-
design language (Daisyworld) — plus the eco-geographic rules Vision's
"other planets" will need.

- **Ledger as Lindeman flow [canon: Lindeman (trophic-dynamic aspect;
  energy flow through levels, 10% law); journal-bound (1942 Ecology),
  verification deferred; arXiv = zero].** → Restate the op ledger in
  Lindeman units: founders (producers of work?) → learners (consumers) →
  dissipated heat. The 10% law asks the efficiency question our pricing
  assumes away (what fraction of billed ops becomes behavior?). Unbuilt
  measurement (work-to-behavior efficiency audit), specified-not-executed.
- **Ratios, not amounts [canon: Redfield (C:N:P constancy); Sterner & Elser
  (ecological stoichiometry — imbalance constrains growth); journal-bound,
  verification deferred; arXiv = biochemical-network noise —
  searched-not-found].** → Our nutrient knob sets AMOUNTS (0.4 vs 5.0);
  stoichiometry says RATIOS constrain (C:N:P imbalance limits compounding
  regardless of total food). The hub starvation signature could be
  stoichiometric (wrong ratio), not quantitative (too little) — a
  reformulation needing a two-nutrient instrument (unbuilt; needs frozen
  plan). Noted as the leading alternative reading of the despotic deficit.
- **Regulation without a regulator [canon: Watson & Lovelock (Daisyworld —
  thermostat from coupled growth, no setpoint); journal-bound, verification
  deferred; arXiv:2410.00043v2 (rate-induced biosphere collapse IN A
  DAISYWORLD MODEL — the stability boundary, quantified!)].** → The mating
  bar IS daisyworld-like (population-level setpoint from individual rules,
  no controller) — and 2410.00043v2 supplies what our bar lacks: the
  collapse boundary under RATE forcing (how fast can conditions change
  before regulation breaks?). Our instant bank switches are rate shocks;
  graded forcing is the unbuilt experiment. Specified-not-executed.
- **Eco-geographic rules for other planets [canon: Bergmann/Allen/Foster
  (body-size rules vs temperature/islands); journal-bound, verification
  deferred; arXiv = zero].** → Vision's expansion needs these the way M4
  needs allometry: different planets, different optima (size, limbs,
  sensing ranges shift with gravity/temperature/density). Logged as the
  M4-gating companion to R93's scaling: no body is optimal, only optimal-
  for-a-world. No instrument (gated behind M4 like everything bodily).

## Round 111 — hybridization & incompatibility (transfer as hybridization; 2026-11-02)

Motivation: every transfer in this program moves weights between codebooks
— biologically, hybridization between diverged genomes. The hybrid-zone
literature predicts exactly our pattern (F1 vigor or breakdown, asymmetric
introgression, reinforcement), and phylogenetics gives the missing
formalism (signal, conservatism, trees). All entries canon (journal-bound,
verification deferred); arXiv throttled at fetch time (429 across two turns,
IP-level) — no arXiv IDs claimed this round.

- **Transfer tax as Dobzhansky–Muller incompatibility [canon: Dobzhansky,
  Muller (incompatible alleles, harmless apart, lethal together); Orr
  (snowball: incompatibilities grow faster than linearly); Welch
  (reviews)].** → The transfer tax (0.2–0.3, asymmetric, codebook-pair-
  specific) has the D-M signature: each codebook works (same-val 0.95),
  the combination misfires (flipped 0.5–0.7), and severity varies by pair
  (0.078–0.173 lift range in V1j). Orr's snowball predicts the asymmetry:
  incompatibilities accumulate superlinearly with divergence — testable
  analytic-only (transfer gap vs codebook distance on frozen pairs, zero
  new worlds). Specified, not executed.
- **Haldane's rule [canon: Haldane 1922 (the heterogametic sex suffers
  hybrid problems first); Coyne (dominance theory); Presgraves (reviews)].**
  → Our sexes: no sex-difference in transfer has ever been tested (rows
  lack per-sex readouts — the R99 logging gap). IF the D-M reading is
  right, Haldane's rule predicts the failure concentrates in one sex
  (heterogametic = males here, sex==1). A sex-split re-analysis is
  specified the moment lineage logging lands. Until then: named, not
  claimed.
- **Hybrid zones as natural laboratories [canon: Barton & Hewitt (tension
  zones, clines, hybrid superiority bounded); Hewitt (postglacial
  recolonization)].** → A transfer pair IS a tension zone (trained niche
  vs test niche, width set by generalization). Barton–Hewitt cline theory
  gives the unbuilt measurement: fit the correctness cline across a
  codebook GRADIENT (interpolated codebooks A→B in k steps) instead of
  two endpoints — cline width estimates the "linkage" of the transferred
  trait. Specified-not-executed (needs interpolated-codebook instrument,
  frozen plan + fresh bank).
- **Reinforcement finishes what transfer starts [canon: Butlin
  (reinforcement); Servedio & Noor (models); Coyne & Orr (speciation
  chapters)].** → Where hybrids are costly, selection strengthens
  pre-mating isolation (reproductive character displacement). Our lines
  never experience selection ACROSS transfers (frozen banks, no lineage
  of lines) — reinforcement is impossible by construction, which is why
  the same incompatibilities recur every bank. The multi-bank selection
  design (lines as replicators, transfer success as fitness) is the
  unbuilt long-arc instrument. Specified-not-executed.
- **Niche conservatism + phylogenetic signal + cultural trees [canon:
  Wiens (niche conservatism — lineages keep ancestral niches);
  Blomberg/Pagel (K and lambda — is a trait more conserved than
  Brownian?); Gray & Atkinson (language phylogenies from cognates)].**
  → Three ports: (1) same-val 0.95 IS niche conservatism — the retention
  literature renamed; Wiens' tests (niche overlap vs null) port directly
  analytic-only. (2) Blomberg's K on transfer success across a codebook
  phylogeny — but our codebooks have NO phylogeny (random draws). The
  design implication: future codebook banks should be PHYLOGENETIC
  (designed families with known relatedness), which turns every transfer
  into a phylogenetically-controlled comparison. Specified-not-executed
  (bank-design rule, needs frozen plan). (3) Gray–Atkinson: lineage
  founders as language families (cognate = shared parental weights) —
  founder concentration re-read as radiation size. Descriptive lens only.

## Round 112 — load, MA lines & Peto (for load-then-recombine design; 2026-11-02)

Motivation: MLR1 closed with the honest caveat (no load existed to purge).
The load-then-recombine line needs a calibrated load phase first — and the
mutation-accumulation literature is the calibration manual. All entries
canon (journal-bound, verification deferred); arXiv throttled (429),
no IDs claimed.

- **MA-line theory calibrates the load phase [canon: Bateman–Mukai
  (MA lines: fitness decline per generation under minimized selection);
  Lynch (drift–load balance; genomic mutation rates); Halligan & Keightley
  (distribution of mutational effects)].** → The load-then-recombine
  design needs three numbers before any bank is spent: (a) per-generation
  fitness decline at a given noise level (Bateman–Mukai protocol, in-silico
  version: replicate runs with selection relaxed, measure gen-2+ decay
  across generations — analytic pilot on existing null-noise arms first:
  is there ANY decline to amplify?); (b) the noise level that makes load
  detectable within a fundable horizon (dose pilot, analytic first via
  rescoring? No — rescoring is barred; fresh-bank pilot only if analytic
  bounds justify it); (c) the purging signature to look for (rebound of
  recombined vs control under matched load). Specified as an analytic
  calibration sequence, zero worlds until the bounds close.
- **Haldane's cost prices the ledger, again [canon: Haldane 1957
  (substitution load: each fixed beneficialallele costs ~30 selective
  deaths); Kimura–Ohta refinements].** → R107 named it; the program use
  is concrete now: the op budget (30e9 aggregate) and the substitution
  budget (how many weight-changes can selection afford per run?) are the
  same currency Haldane priced. Any line proposing many accepted revisions
  (RSI!) must show the load is payable — a cost-of-selection audit on the
  RSI-SELF accept counts (28 accepts in V1c: what did each cost in
  selective deaths?). Analytic-only on frozen attempt ledgers, zero worlds.
- **Peto's paradox scales bodies [canon: Peto (no more cancer in big/long
  animals than small/short ones); Caulin & Maley (review); Tollis et al.
  (elephant TP53 copies — the mechanism: extra tumor suppressors);
  Nunney (body-size vs cancer models)].** → M4-relevant: bigger bodies
  need MORE suppression per cell, solved by duplication (TP53 ×20), not
  better repair. Port: richer bodies need duplicated CONTROL circuitry,
  not just scaled-up policy — a body with twice the sensors needs twice
  the normalization, not the same gain. Design maxim for any M4 attempt.
  (Also: transmissible cancers — Tasmanian devil DFTD, dog CTVT — are
  natural allografts: foreign tissue that evades rejection. Our transplants
  never face rejection (no self/non-self). Allorecognition is the unbuilt
  gate — noted, not licensed.)
- **Programmed vs non-programmed aging, briefly [canon: Skulachev
  (programmed aging, phenoptosis); Austad, Gavrilov (non-programmed:
  aging as unselected decay); journal-bound, verification deferred].** →
  Decides what the lifespan trait IS: a program (tunable, V1-style knob)
  or a constraint (wear, un-tunable). Our zero age-deaths (mortality doc)
  cannot separate them — both predict no senescent deaths under
  starvation-dominated regimes. Discriminator specified: run a
  post-scarcity bank (food ad lib, bar low) and watch whether deaths go
  energetic or age-like. Specified-not-executed (new bank, new rationale
  needed — and it reframes the whole mortality finding conditionally).

## Round 113 — social choice for verdicts (methodology turns on itself; 2026-11-02)

Motivation: the program judges lines by committee rules (conjunctive
gates, 6-history majorities, pooled means) without ever studying committee
rules. Social-choice theory IS the study of turning individual judgments
into collective verdicts — our daily procedure, unexamined. This round
aims the outside at the inside. All entries canon (verification deferred);
arXiv throttled (429), no IDs claimed.

- **Condorcet justifies replication [canon: Condorcet 1785 (jury theorem:
  majorities beat individuals iff each voter is better than random, given
  independence); Grofman et al. (reviews); Ladha (correlated votes)].** →
  Our 6-history replication IS a jury: each history votes (GO/NOGO-ish via
  thresholds), the majority/aggregate rules. The theorem's conditions are
  the audit: (1) better-than-random — our G-gates enforce this (unlearned
  flat, train ≥ 0.5); (2) INDEPENDENCE — histories share a bank and a
  builder (correlated votes, Ladha's caveat!). Bank-dependence IS vote
  correlation — the jury theorem says our juries are weaker than 6
  independent votes, which is exactly the direction the bank-dependence
  battery pointed. Verdict reform specified-not-executed: report
  effective-jury-size (6 discounted by measured inter-history correlation),
  analytic-only on frozen banks, zero new worlds.
- **Arrow bounds gate design [canon: Arrow 1951 (no rank-aggregation rule
  satisfies unanimity + IIA + non-dictatorship); Amartya Sen (liberal
  paradox, brief)].** → Our gates are conjunctive (veto-like), not rank
  aggregations — Arrow does not directly apply (noted honestly, not
  over-claimed). The live question it raises: our GO/NOGO verdicts collapse
  multi-dimensional evidence (gen-2, timing, energy, skew) into one bit —
  ANY such collapse sacrifices something (the theorem's shadow even outside
  its premises). The standing mitigation is already practiced (publish the
  full dev-results alongside the verdict); the round records WHY that
  practice is load-bearing, not decorative.
- **Judgment aggregation + consensus [canon: List & Pettit (judgment
  aggregation; discursive dilemma — majority on premises can contradict
  majority on conclusions); Conradt & Roper (group consensus decisions);
  Seeley (house-hunting: quorum + comparison shopping in swarms)].** →
  Three ports: (1) The discursive dilemma BITES our verdicts: per-arm
  majorities (hub wins 4/6 seeds?) can contradict pooled totals (hub loses
  on sums) — Simpson's-paradox-adjacent. Prescription already followed:
  publish per-seed AND pooled (we do); the round names the logic.
  (2) Conradt–Roper: GO/NOGO is a consensus decision under uncertainty —
  their speed–accuracy tradeoffs map onto our single-attempt discipline
  (one shot = speed extreme; the frozen plan + fixtures are the accuracy
  compensation). (3) Seeley: our arm comparison IS nest-site choice
  (compare options, quorum to decide) — except we never let agents choose
  (experimenter assigns arms). Choice-based assignment (agents sort to
  treatments) is the unbuilt design — noted, not licensed (breaks causal
  identification; recorded as the reason we don't).
- **Inequity, prestige, Rogers: formal pointers (already-covered concepts,
  formal layer virgin) [canon: Fehr & Schmidt (inequity aversion);
  Brosnan & de Waal (primate fairness); Henrich (prestige bias, formal
  models); Boyd & Richerson (conformist transmission, formal); Rogers
  (paradox: pure copying can LOWER population fitness)].** → Covered
  conceptually (R82/R102/R103/R108); what is virgin is only the FORMAL
  layer — and the program's needs from it are now precise: (a) Rogers'
  paradox formalizes the SOCIAL null (already published — pointer, no
  re-verdict); (b) inequity-aversion formalizes G2 gates as fairness norms
  ONLY AS ANALOGY (flagged: do not present gate-checks as fairness
  findings); (c) prestige/conformist formal models would license SOCIAL-V2
  variants (gated copying rules with named parameters) — the formalism is
  specified as pre-reading for any such freeze, not executed here.

## Round 114 — collective decisions: quorum without a leader (for M5 + our own verdicts; 2026-11-02)

Motivation: no program agent ever votes, yet every verdict is a collective
decision (6 histories, conjunctive gates, pooled means). Honeybees choose
homes without a leader; juries outvote experts without deliberation; our G-gates
decide without a global composite. This round maps the mechanisms — and turns
R113's jury reading from analogy into theorems.

- **House-hunting: the best-studied leaderless choice [canon: Seeley
  (Honeybee Democracy; nest-site debates, waggle-dance campaigns, quorum
  sensing at ~20 scouts, cross-inhibition via stop signals); Visscher
  (quorum thresholds); journal-bound, verification deferred;
  arXiv:1611.07575v2 (best-of-N nest-site model beyond binary choice) +
  arXiv:2310.15592v2 (kilobot swarm REPLICATES honeybee nest-site choice
  in-silico — emergence survives embodiment change) + arXiv:0909.1582v1
  (List–Elsholtz–Seeley agent model: BOTH independence (explore options)
  AND interdependence (recruit to options) are needed for consensus) +
  arXiv:1711.11578v2 (value-sensitive distributed effort: near-equal
  options still decided efficiently)].** → Four ports, all new: (1) The
  0909.1582v1 independence/interdependence result is the exploration–
  exploitation dilemma solved socially — our lines explore (mutants,
  k_L ladder) OR exploit (exact-copy transplants) per-line, never both
  within a run; a mixed arm (some founders explore, some exploit) is
  specified-not-executed. (2) Quorum sensing as a DECISION RULE (stop
  deliberating at threshold N) vs our fixed-horizon runs (always 1792
  ticks): quorum-gated stopping is an unbuilt runner feature — stop a
  world early when its verdict is mathematically settled (saves worlds;
  needs frozen plan). (3) Cross-inhibition (stop signals) is the NOGO
  mechanism we never built: arms that actively suppress each other, not
  just fail to lift — specified-not-executed. (4) Kilobot replication
  (2310.15592v2) licenses in-silico collective decision as a real
  phenomenon class, not a biology-only one.
- **Condorcet, with teeth (R113 continued — the theorems check out)
  [arXiv:2108.00733v4 (PRIOR probability the Jury Thesis holds: competence
  is not free — the thesis needs its premises) + arXiv:2408.00317v1 +
  arXiv:2510.18062v1 (Jury Theorem WITH ABSTENTION, asymmetric races) +
  arXiv:1604.07711v2 (Jury Theorem for CONSENSUS CLUSTERING — ensembles of
  clusterers beat singles) + arXiv:2002.03153v2 (majority voting ↔ ML
  majority vote link, 300-year-old theorem meets ensembles)].** → R113
  read our 6-history juries through Condorcet; the new batch sharpens it:
  (a) competence must be EARNED (2108.00733v4) — our G0/G2 gates are
  exactly the competence preconditions, now with a theorem attached;
  (b) abstention formalized (2408.00317v1/2510.18062v1): INCOMPLETE-NOBIRTHS
  and VOID arms are abstentions, not NOGOs — our verdict taxonomy already
  implements what the extended theorem requires; (c) consensus clustering
  (1604.07711v2) is our flip-split's cousin (ensemble of per-cue votes);
  (d) the ML link (2002.03153v2) makes "6 histories = a 6-model ensemble"
  literal — bank-dependence is ENSEMBLE CORRELATION (correlated voters),
  which is why 6 correlated histories underperform 6 independent ones.
  Analytic-only follow-up, zero worlds: effective-jury-size from the
  existing inter-history correlation matrix (specified, not executed).
- **MacLorg? No — macroscopes [arXiv:1204.3860v1 (macroscopes for collective
  decision: decide WITHOUT first building a global composite of local
  views; parties keep partial info)].** → This is what our G-gates ARE:
  no row ever sees the whole bank, yet the verdict decides. The paper gives
  the design pattern a name and conditions (when partial-info decisions
  are safe) — a license check on our own procedure, passed descriptively.
  Specified-not-executed: a macrocondition audit (do our gates satisfy the
  paper's safety conditions? analytic-only on frozen rows).

## Round 115 — mating systems II: allocation, tactics, post-copulatory choice (for the mating arc; 2026-11-02)

Motivation: every program mating is indiscriminate (mate whoever is near),
monomorphic (one tactic), and pre-copulatory (binary birth/no-birth). Three
literatures say each fixed choice hides the phenomenon — and all three are
virgin territory in the map.

- **Sex allocation is conditional [canon: Charnov (sex allocation theory);
  Bull (TSD models); Warner (sequential hermaphroditism, bluehead wrasse);
  Trivers–Willard (condition-dependent allocation); journal-bound,
  verification deferred; arXiv:1608.03102v1 (detecting NON-BINOMIAL sex
  allocation under developmental mortality — the statistical test!)].** →
  Our founders are 1:1 by construction and newborns 1:1 by RNG — allocation
  is the one mating parameter we never vary. The unbuilt knob is
  condition-dependent allocation (sex ratio as a function of bar/energy —
  Trivers–Willard for flies), with 1608.03102v1 supplying the detection
  machinery for the resulting non-binomial broods. Specified-not-executed
  (needs frozen plan; engine already carries sex per fly, so the knob is
  small — the rationale is the missing piece, now banked).
- **Tactics are conditional too [canon: Gross (sunfish sneakers vs
  territorials — size-dependent alternative tactics, ESS-maintained);
  Taborsky (bourgeois vs parasitic); Oliveira (hormonal mechanisms);
  journal-bound, verification deferred; arXiv = math-mating polysemy
  (Thurston algorithm) — searched-not-found, logged].** → Our agents have
  ONE tactic (cruise-and-mate); Gross says tactic POLYMORPHISM is the
  norm where mating is competitive (sneakers steal fertilizations the
  bourgeois court for). The unbuilt arm: conditional tactic (small/low-
  energy males sneak = mate without courtship range; large males display)
  — a within-run polymorphism that could rescue hub compounding where
  uniform k=2 taxis could not (V2/V3 nulls). Specified-not-executed.
- **After mating comes choice [canon: Parker (sperm competition, raffles);
  Eberhard (cryptic female choice); Birkhead (post-copulatory selection);
  Simmons; journal-bound, verification deferred; arXiv = generic game
  theory — searched-not-found, logged].** → Our births are binary (mated
  or not); post-copulatory processes are absent by construction. The
  honest scope note this round must carry: NO program result can speak to
  post-copulatory selection, and any future "mating success" metric that
  counts copulations instead of gen-2 compounds that blind spot. The
  gen-2 bar (not births, not matings) is already the right guardrail —
  this round supplies its theoretical backing. No instrument (out of
  scope by design, not by oversight).
- **Nuptial gifts + Coolidge, briefly (virgin, logged)
  [canon: Thornhill (nuptial gifts as paternal investment/foraging);
  Gwynne; Vahed; Beatty (Coolidge effect — novel-partner renewal of
  mating drive); journal-bound, verification deferred; arXiv = zero].** →
  Two one-line mechanisms for the file: (1) gifts couple food to mating
  (fed males mate more) — our nutrientOverride and mating bar are
  DECOUPLED by design, so gift-effects are unmeasurable here; a coupled
  arm (mating success scales with donor intake) is specified-not-executed;
  (2) Coolidge novelty-renewal predicts our k=2 taxis should habituate
  (it does not appear to — V3's uniform-low births are flat, not decaying;
  noted as evidence consistent with novelty-blindness, descriptive only).

## Round 116 — Rogers' paradox + assortment + fairness: why sociality fails (for MATE-SOCIAL's null; 2026-11-02)

Motivation: MATE-SOCIAL's copybest arm (1 = 1, exact-neutral) closed the
transmission-mechanism space with "bottleneck is encounters." These three
literatures say the null was overdetermined — copying can HURT, assortment
needs recognition, and fairness gates cooperation — and all three were
virgin in the map until now.

- **Rogers' paradox: copying can lower population fitness [canon: Rogers
  1988 (paradox: if copying is cheaper and as good, cheaters invade until
  population fitness FALLS to asocial levels); Boyd & Richerson (culture
  keeps the paradox honest — guided variation rescues it); Enquist
  (critical social learning — copy only when uncertain); Perreault
  (reviews); journal-bound, verification deferred; arXiv = social-media
  noise — searched-not-found, logged].** → The exact-neutral (1 = 1) reread:
  copybest copied UNCONDITIONALLY in a one-generation window with no
  personal-information deficit to exploit — precisely the regime where
  Rogers predicts null-to-negative population effects. R82's "copy when
  uncertain" was the right instinct with half the license; Rogers supplies
  the other half (WHEN copying pays at all). SOCIAL-V2 remains specified-
  not-executed, now with both halves banked.
- **Fairness gates cooperation without recognition [arXiv:1402.4946v1
  (inequity aversion sustains cooperation WITHOUT partner recognition —
  agents need not remember who did what) + arXiv:1803.08884v3 (MARL:
  inequity aversion rescues cooperation in intertemporal social
  dilemmas — temporally extended, like our 1792-tick runs) +
  arXiv:1003.0088v5 (cooperation condition on complex networks, death–birth,
  weak selection — TOPOLOGY enters the condition!) + canon: Fehr & Schmidt
  (inequity-aversion model), Brosnan & de Waal (primate fairness);
  journal-bound for canon, verification deferred].** → The MATE-SOCIAL
  design flaw, named precisely: copybest needed partner RECOGNITION
  (whose success to copy?) in a system with no identity memory — while
  1402.4946v1 shows fairness needs NO recognition (aversion to BEING
  behind suffices). An inequity-averse agent (pause giving when intake
  lags the local mean) cooperates without any lineage tracking —
  implementable on existing channels (scent = local mean proxy? intake
  vs neighbors' intake via... note: requires neighbor-intake sensing we
  lack; the knob needs a sensor first). Specified-not-executed with its
  prerequisite flagged (sensor before norm).
- **Assortment without genealogy + the wood-wide-web [canon: Gardner &
  West (greenbeard formalism); Keller & Ross (fire-ant Gp-9);
  Smukalla et al. (yeast FLO1 adhesion); journal-bound, verification
  deferred; arXiv = zero — searched-not-found, logged] + [canon: Simard
  (mycorrhizal networks move carbon/nutrients between trees; "wood wide
  web"); Beiler (network mapping); Gorzelak (review); journal-bound,
  verification deferred; arXiv:2406.11174v1 (plant communication networks
  for energy harvesting — applied framing, read cautiously) +
  arXiv:1712.06846v1 (trait-mediated facilitation + competition in
  pollinator networks) + arXiv:1602.02569v3 (adaptive foraging →
  coexistence; FIXED preferences fail)].** → Two closers: (1) Greenbeard
  recognition (tags, not trees) remains the unbuilt alternative to our
  post-hoc lineage founders — recognition tags would let cooperators find
  each other WITHOUT genealogy, which is what our hub crowds lack
  (everyone co-located, nobody identifiable). (2) Mycorrhizal networks are
  R100's extended phenotype WITH a mechanism and R82's bandwidth problem
  SOLVED (fungal networks move real resources between strangers) — plus
  1602.02569v3's punchline (adaptive foragers coexist; fixed-preference
  ones do not) reads directly on our fixed-preference agents: adaptivity,
  not topology, may be the missing coexistence ingredient. Both
  specified-not-executed (tags need identity channels; adaptivity needs
  a learning rule that survives transfer — V1i's replay, notably).

## Round 117 — Engrams, tags & reconsolidation (retention machinery at the synapse; 2026-11-02)

Motivation: the program has established THAT weights persist (niche-ID 1.000)
and that shrinking them helps transfer (V1j), but never asked what fraction
of the substrate holds the trace, what marks it, or what retrieval does to it.
The engram literature answers all three, with a formalism now ported to AI.

- **Engrams: sparse, allocated, erasable [canon: Semon (the engraving);
  Josselyn/Frankland (allocation to excitable neurons); Tonegawa (engram
  labeling, erasure, reactivation — necessity AND sufficiency);
  journal-bound, verification deferred].** → Three ports, all specified-
  analytic (zero new worlds): (1) Allocation is competitive (excitable
  neurons win) — our uniform plasticity spreads every trace everywhere;
  an excitability-weighted update rule is the unbuilt retention
  instrument (protect the allocated, overwrite the rest — NBSP-adjacent,
  R85). (2) Erasability: activating the engram is necessary AND
  sufficient — our frozen probes are observational only; an activation
  probe (drive the retained weights, measure behavior) is
  specified-not-executed. (3) Sparsity: engrams are tiny fractions —
  quantify the retained-weight fraction per history (analytic on frozen
  final weights) as an engram-ness measure; V1j predicts lossy transfer
  shrinks it further while preserving identity.
- **AI Engrams formalize the criteria [arXiv:2606.14997v1 (AI Engram:
  geometric framework formalizing neuroscience's four engram criteria —
  persistence, latency, content, ecphory — as a constrained inverse
  problem in weight space, solved closed-form) + arXiv:2506.01659v2
  (neurocomputational review of engram encoding/retrieval: sparse
  populations undergo lasting physical/chemical change) +
  arXiv:2607.07388v1 + arXiv:2603.100 frankly: LLM engram-style memory
  (train-free injection, sparse decoupled lookup; pointers only)].** →
  2606.14997v1 makes the engram testable in silico (does a weight
  subset satisfy the four criteria?) — directly applicable to our
  transferred weights (do the 0.94 same-val weights satisfy persistence +
  latency + content + ecphory, or only persistence?). Specified analytic,
  zero worlds.
- **Tag now, capture later [canon: Frey & Morris (synaptic tagging and
  capture); Redondo (behavioral tagging); journal-bound, verification
  deferred] + constraints [arXiv:1206.3697v3 (molecular constraints on
  tagging/maintenance: PKMζ persistence, spatiotemporal rules for LTP/LTD
  induction) + arXiv:1910.07414v1 (metabolic costs of synaptic learning:
  spines are a small cortical fraction but the MAJOR energy consumers)].**
  → The turn-gating arc reread as tagging: cue-contact TAGS synapses,
  surprise-gated replay CAPTURES them (V1f–V1i IS tag-and-capture, and
  the bundle arm's breadth×depth interaction is the classic tag+PRP
  conjunction test — already run, now named). 1910.07414v1 prices our
  op ledger biologically: retention is metabolically expensive BECAUSE
  spines are; the ledger's operationEnergy has a wet counterpart, and
  symmetric billing mirrors metabolic parity. No new instrument (the
  mechanism is already deployed; this round names it).
- **Retrieval rewrites [canon: Nader (reconsolidation: reactivation
  returns memories to lability; blockade erases); R22/R98 covered the
  biology — this entry is the artificial counterpart: arXiv:2609.16053v1
  (retrieval-DRIVEN reconsolidation for LLM agents: retrieval as a driver
  of memory evolution, not an endpoint of access)].** → 2609.16053v1
  inverts our probe practice (we retrieve to READ; they retrieve to
  REWRITE, continuously). Two consequences, both specified: (1)
  measurement-validity threat stands (probes destabilize; post-probe
  stability checks on frozen banks, analytic-only, zero new worlds);
  (2) a retrieval-driven learner — one whose probes update, not just
  observe — is the unbuilt RSI-adjacent instrument (learning from its
  own measurements; needs frozen plan, separate line).

## Round 118 — Forgetting as design + somatic evolution + epigenetic clocks (losing information well; 2026-11-02)

Motivation: V1j proved that losing information (×0.5) can HELP transfer,
and the transfer tax is, formally, a failure to forget the old codebook.
This round collects the literatures where forgetting, loss, and lineage
selection are the mechanism — not the malfunction.

- **Forgetting is not a fix — unless it restructures [arXiv:2607.24805v1
  (Forgetting Is Not a Fix: path dependence in sequential editing;
  compositional-memory-states hypothesis: edited models live on a
  commutative manifold; forgetting alone does not remove history
  dependence)].** → The exact V1j moral, independently derived: naive
  forgetting (decay, dropout) does NOT fix path dependence; STRUCTURAL
  change (compositional states, lossy bottlenecks) does. Our 47/48
  stampede and RIGID class are path-dependence exhibits; noisy replay
  (unlicensed, twice) would have been naive forgetting. Prescription
  unchanged: restructure, don't decay (lossy transplants, fold-change
  gates) — now with external proof.
- **Adaptive + active forgetting [canon: Richards & Frankland
  (transience as optimization: forgetting improves decision-making by
  discarding outdated value; Ebbinghaus re-read as feature);
  Berry (Drosophila Rac1-gated active forgetting); Davis & McGuire
  (forgetting mechanisms review: retrieval-induced, interference-based,
  intrinsic); journal-bound, verification deferred; arXiv = thin,
  searched-not-found].** → The extinction-gating literature our
  harm→ben stall (~0.67, R84) lacks: forgetting is REGULATED (dopamine-
  gated in flies, prefrontal in mammals), not passive decay. Our actor
  has no forgetting gate — weights persist until overwritten by new
  learning, which is why saturation plateaus instead of clearing. A
  dopamine-analog gate (forget proportional to surprise-absence, not
  presence) is specified-not-executed; it inverts V1f–V1i (which gated
  consolidation ON) into its complement (gate erasure ON when nothing
  surprising happens). Needs frozen plan.
- **Somatic evolution: lineages within a lifetime [canon: Nowell (1976:
  clonal evolution of tumor cell populations — selection WITHIN the
  organism); Greaves & Maley (reviews, driver vs passenger mutations);
  Cairns (stem-cell divisions as risk); journal-bound, verification
  deferred; arXiv = clinical noise, searched-not-found].** → Our
  generations ARE somatic lineages (founders → gen-1 → gen-2 within one
  run), and gen-2 compounding is clonal expansion. Nowell's frame
  imports wholesale: gen-2 excess = expansion beyond the founding clone;
  hub starvation = resource-limited expansion; mutational load (MLR1's
  missing ingredient) = passenger accumulation. The analytic payoff:
  expansion metrics (clone-size distributions, expansion index) computed
  on existing lineage data, zero new worlds — specified, not executed.
- **Clocks that count information, not time [canon: Horvath (2013:
  epigenetic clock — methylation age predicts mortality better than
  chronological age); Hannum; Levine PhenoAge; Sinclair (Lifespan 2019:
  aging = information loss, reprogrammable); journal-bound, verification
  deferred; arXiv = thin, searched-not-found].** → The transfer tax
  restated: a codebook switch is AGING (information loss per Horvath),
  and V1j's lossy win is REPROGRAMMING (Sinclair) — discarding noise
  restores function. Two specified analytics (zero new worlds): (1) a
  horvath-analog "transfer clock" — fit retained-weight divergence vs
  transfer gap across frozen banks (does information loss predict the
  tax?); (2) R112's post-scarcity discriminator gains its measurement
  (chronological vs biological age of lineages under bar-50 vs bar-65).
  No new banks; the clocks read frozen rows.

## Round 119 — Social arithmetic: skew, Bateman (pointer), LMC (pointer), memetics, UDw, individuality (bookkeeping for who counts; 2026-11-02)

Motivation: every mating verdict counts gen-2, but nobody formalized WHO
counts as a reproducer, WHAT counts as an individual, or HOW success
transmits. This round closes the bookkeeping gap with the formalisms —
and marks which are pointers to covered ground vs live instruments.

- **Who reproduces: the skew formalism [canon: Vehrencamp (transactional
  skew, concessions); Keller & Reeve (optimal skew); Reeve & Ratnieks
  (tug-of-war: no concessions, pure competition); Johnstone (synthesis);
  journal-bound, verification deferred; arXiv = tug-of-war math polysemy
  — searched-not-found, logged].** → Our founderOffspring tallies ARE
  skew data (descriptive per MATE-SOCIAL V1), but never fitted: does
  hub skew match transactional (dominant concedes just enough to retain
  subordinates) or tug-of-war (pure contest, no concessions)? The
  diagnostic is the subordinate's share vs outside options — computable
  on frozen rows (deserters = zero-offspring founders: present or absent?).
  Specified analytic, zero new worlds. Prediction from the despotic
  pattern (R88): hubs look transactional (subordinates stay because
  everywhere is poor); spreads look tug-of-war-free (no contest).
- **Individuality and replicators (brief, framing) [canon: Clarke
  (Darwinian individuality — reproduction + bottleneck + germline);
  Godfrey-Smith (Darwinian populations); Dawkins/Blackmore (memetics:
  rows as replicators); Dennett (Universal Darwinism: substrate-neutral
  selection); journal-bound/books, verification deferred; arXiv = zero —
  searched-not-found, logged].** → Three one-line Einstellungen, flagged
  as framing not findings: (1) Godfrey-Smith asks whether our FOUNDERS
  or our LINEAGES are the Darwinian individuals (bottleneck says
  lineage; reproduction says founder) — the lineage-founder tracking we
  already do IS this question operationalized; (2) Universal Darwinism
  licenses the whole program's premise (selection in silico is still
  selection); (3) memetics would call a transmitted row a replicator —
  recorded, not endorsed (the map's anti-meme stance from R103 stands).
- **Pointers, not repeats (already mapped): Bateman gradient + Trivers
  parental investment (R99); LMC (R86); Run01 sexy-son/Fisher (R86);
  greenbeard (R116); prestige/reward (R113/R82); Rogers (R116);
  Maynard Smith/Price (R31-35); Hamilton (R26-30).** → Listed so future
  rounds do not re-map them; the live edges are above (skew fit,
  individuality audit, substrate-neutrality license).

## Round 120 — The TD family we didn't use (distributional critics, options, SR-as-tax-theorem; 2026-11-02)

Motivation: our stack is the SMALLEST viable TD system (mean-value
critic, flat motor primitives, greedy inference). The literatures that
extend each of those three choices predict our two biggest phenomena —
and name the unbuilt instruments precisely.

- **The transfer tax is a theorem, not a bug [canon: Dayan (1993:
  successor representation); Barreto et al. (successor features);
  R98 mapped the pointer — this entry states the consequence:
  SR/SF theory predicts transfer across REWARD-function change but
  failure across TRANSITION-function change; journal-bound, verification
  deferred].** → A codebook switch IS a transition-function change
  (same rewards, new observation dynamics). SR theory therefore predicts
  exactly what V1b–V1j measured: partial transfer with a persistent tax
  (0.52–0.82, never 1.0), direction asymmetry (forward vs backward
  successor occupancy differs), and the V1j result (compressed features
  transfer better — SFs are COMPRESSIONS of occupancy by construction).
  No new instrument: this re-grounds the closed transfer arc in theory.
  The unbuilt corollary is successor FEATURES as transfer substrate
  (learn occupancy-features once, rebind codebook-specific rewards per
  ecology) — specified-not-executed, needs frozen plan.
- **Critics should learn distributions, not means [canon: Bellemare et
  al. (distributional RL: value DISTRIBUTION, not expectation;
  journal-bound, verification deferred) + arXiv:2209.14513v2
  (WHY distributions help optimization: distribution loss has smoothness
  → stable gradients, within Neural FZI) + arXiv:2106.06317v1
  (Automatic Risk Adaptation: STATIC risk levels are suboptimal; risk
  must be state-dependent and dynamic)].** → Two ports: (1) our critic
  learns E[value]; our bars (52/65) are risk thresholds on a TAIL
  (starvation). A distributional critic represents the tail EXPLICITLY —
  R112's post-scarcity discriminator (survive vs thrive) is a two-point
  distribution, and full distributional critics are its generalization
  (specified-not-executed). (2) 2106.06317v1's moral maps to our FIXED
  energy bars: state-dependent bars (bar as function of reserves,
  season, density) are the risk-adaptive form of matingEnergyBar —
  specified-not-executed, needs frozen plan (bar change = behavior
  change, never analytic).
- **Options: hierarchy as transfer insulation [canon: Sutton/Precup/
  Singh (1999: options — initiation set + policy + termination);
  journal-bound, verification deferred) + arXiv:1604.08153v3 (option
  heads LOWER sample complexity under NEGATIVE transfer without hurting
  positive transfer — the closest external precedent for hierarchical
  structure mitigating exactly our tax) + arXiv:2101.06521v3 (HIDIO:
  task-AGNOSTIC options from intrinsic entropy minimization, no goal
  pre-specification)].** → Two re-reads, zero worlds: (1) our
  turn|harmful policy IS an option (initiation: harmful cue contact;
  policy: turn; termination: contact over) — TURN-GATE as option
  discovery, accidentally; (2) motorPrimitive index-3-unreachable means
  our option SET is impoverished (3 usable primitives) — the structural
  ceiling behind STRUCTURAL/MATE-ACT voids. 1604.08153v3 supports the
  differentiation-first direction (R94): hierarchy first, transfer
  second. HIDIO's task-agnostic discovery is the unbuilt developmental
  instrument (discover primitives before the ecology scores them).

## Round 121 — Below the synapse and beside it (dendrites, astrocytes, myelin, volume transmission; exclusion boundary; 2026-11-02)

Motivation: every weight in our substrate is a point-neuron synapse.
Biology computes in five other places. This round inventories them as a
substrate-expansion menu — mostly specified-not-executed, with two
already-deployed knobs recognized for what they functionally are.

- **Dendrites: the unbuilt nonlinearity [canon: London & Hausser
  (dendritic computation review); Mel (dendritic learning); journal-
  bound, verification deferred) + arXiv:2009.01269v1 (single dendritic
  neurons solve MNIST/CIFAR — nonlinear trees >> point units) +
  arXiv:2205.05303v1 (dendritic predictive coding: errors computed
  LOCALLY in apical compartments — no separate error units needed) +
  arXiv:2304.00951v2 (dendrite preprocessing SHRINKS the network needed
  for threshold performance)].** → Our actor pays 96-dim global cost for
  what dendrites compute locally: 2304.00951v2 implies our network is
  oversized BECAUSE it lacks dendrites (compression argument pairing
  V1j from the substrate side). 2205.05303v1 pairs with VALUE-PROBE
  (INDETERMINATE critic-vs-actor): if errors live in compartments, our
  probe placement (soma-equivalent readouts) was anatomically wrong —
  recorded as a hypothesis for any probe-line revival, not a rescore.
- **Astrocytes: the slow global context [canon: Araque/Navarrete
  (tripartite synapse); Nedergaard (gliotransmission); journal-bound,
  verification deferred) + arXiv:2404.13345v1 (computational models at
  glutamatergic tripartite synapses) + arXiv:2211.09906v1 (contextual-
  guidance integrated theory: astrocytes as CONTEXTUAL gates on circuits
  and behavior) + arXiv:2601.00426v2 (RMAAT: astrocyte-inspired memory
  COMPRESSION + REPLAY for long-context Transformers — persistent memory
  tokens, adaptive compression)].** → Recognition, not construction:
  our slow anchors (slowTaste/slowMotor, M-ACTOR's motor anchor) ARE
  astrocyte-analogs functionally (slow integrative modulation of fast
  synapses). 2211.09906v1's contextual gating is the formalism our gain
  knob lacks (gain is scalar; contextual gating is circuit-addressed).
  2601.00426v2 pairs with V1j + the replay twin (compression + replay as
  ONE glial principle — our retention stack implements half of it).
- **Myelin: plasticity of delay [canon: Fields (myelin plasticity;
  book/journal, verification deferred) + arXiv:1902.06272v1 (synaptic +
  myelin co-plasticity interact in Kuramoto nets) + arXiv:2605.23520v1
  (delay plasticity ALONE drives attractor formation + frequency
  selection on brain connectivity data)].** → Honest downscope: our
  ticks are uniform-delay; delay plasticity presupposes coherent rhythms
  to select among — and the synchrony measurement found NONE (all arms
  asynchronous). 2605.23520v1 is therefore downstream of an oscillation
  finding, not a current instrument. Recorded so the menu is complete
  and correctly sequenced (oscillations first, delays second).
- **Volume transmission + gap junctions: the deployed knob, named
  [canon: Fuxe/Agnati (volume transmission: broadcast neuromodulation);
  Bennett (gap junctions/ephaptic coupling); journal-bound, verification
  deferred; arXiv = zero — searched-not-found, logged].** → The gain
  knob (1.0/3.0, deployed V1g–V1i) IS volume transmission functionally
  (one global signal, all synapses, no wiring). Gap-junction-fast-sync
  is absent — consistent with the synchrony null. No instrument; the
  deployed line gains its mechanism name.
- **Exclusion boundary: microtubule/quantum computation [Hameroff/
  Penrose Orch-OR; verification deferred as EXCLUDED].** → The map stops
  here, explicitly: no behavioral handle exists at our substrate level,
  no falsifiable prediction distinguishes it from noise in 1792-tick
  foraging runs. Logged so future rounds do not re-propose it without a
  handle. (Intracellular-transport microtubules, R86-adjacent, are cell
  biology, not computation — different claim, unaffected.)

## Round 122 — Waiting out the bad times II: persister mechanisms + torpor physiology (dormancy strategy covered R101; this round = HOW; 2026-11-02)

Motivation: R101 covered dormancy/seed-banks as STRATEGY. This round
covers the MECHANISMS that implement waiting — and prices the one design
constraint a dormancy knob must carry (arousal is expensive).

- **Persisters: clonal heterogeneity without mutation [canon: Balaban
  (Type I/II persisters, hipA, toxin–antitoxin modules); Lewis;
  journal-bound, verification deferred) + arXiv:0909.5125v2 (resonant
  activation: noise CONSTRUCTIVELY synchronizes dormant→growing
  switching — a synchronized awakening protocol) + arXiv:q-bio/0610026v1
  (senescence EXPLAINS persistence: age structure alone reproduces
  growth-phase/dilution-rate persister fractions — no switch needed) +
  arXiv:1310.8592v1 (slow protein fluctuations → weak ergodicity breaking
  → distinct growth phenotypes in CLONES; biphasic kill curve from
  fluctuation statistics)].** → Three ports: (1) 1310.8592v1 is a
  founder-variance MECHANISM candidate (identical genomes-equivalent,
  divergent fates via slow fluctuations — pairs with the niche
  fingerprint: the niche writes back through slow variables;
  specified-analytic, zero worlds). (2) q-bio/0610026v1 re-reads our
  long-lived-childless arms (MORTALITY round): are they senescent
  persisters (old, dormant, alive) rather than failures? — decidable on
  frozen ages (gen1Lifespan per row), specified descriptive, zero new
  worlds. (3) 0909.5125v2's resonant awakening pairs with R112's
  post-scarcity resumption (synchronized restart after bar-50 survival).
- **Torpor/hibernation: waiting with a rewarming bill [canon: Geiser
  (torpor/arousal physiology); Heldmaier (hibernation energetics);
  journal-bound, verification deferred; arXiv = thin —
  searched-not-found, logged].** → The design constraint for the
  R-specified dormancy knob (skip ticks cheaply, resume on cue):
  arousal is EXPENSIVE (rewarming dominates hibernation budgets).
  Any dormancy instrument must price arousal (wake-up cost >> sleep
  cost per tick) or it is a free-lunch bug. Specified as a frozen-plan
  requirement, not an objection — the knob stays unbuilt until a plan
  carries the arousal price.
- **Bacterial quorum-sensing mechanism: pointer (covered at concept
  level; LuxR/LuxI 0 IDs — mechanism detail not needed).** → The map's
  quorum coverage (density feedbacks, synthetic QS, quorum-as-decision-
  rule) operates at the right level; autoinducer chemistry adds no
  design information for tick-priced agents. No further mapping unless
  a Lux-analog instrument (diffusible signal with threshold response)
  is proposed — which would BE volume transmission (R121), already named.

## Round 123 — Minds without borders (transactive memory, distributed cognition, extended mind; 2026-11-02)

Motivation: every transmission verdict treats memory as INSIDE weights.
Three literatures locate memory BETWEEN agents and in the world — and our
substrate already has all three channels, unnamed.

- **Transactive memory: the directory matters more than the store
  [canon: Wegner (transactive memory: groups encode WHO-knows-what +
  allocation/retrieval strategies); Hollingshead; Ren & Argote (review);
  books/journals, verification deferred; arXiv = CS transactional-memory
  polysemy, zero relevant — searched-not-found, logged].** → Our
  transmission lines ARE transactive systems: maternal = directory (ask
  mother), copybest/copycond = retrieval strategy (ask the successful).
  Wegner predicts the DIRECTORY (who to ask) dominates the STORE (what
  is stored) — and our nulls agree exactly: storage worked (gap 0,
  V1/V1b), retrieval-strategy changes changed nothing (V1/V2/social
  arc), because the directory pointed at empty encounters. Re-read,
  zero worlds. Unbuilt corollary: a directory of the DEAD (query
  frozen/ancestral weights, not live mothers) — specified-not-executed.
- **Distributed cognition: the run is the thinker [canon: Hutchins
  (Cognition in the Wild: ship navigation as computation across people
  + instruments); Hollan/Hutchins/Kirsh; verification deferred].** →
  The unit of adaptation in our mating lines is the RUN (founders +
  food field + codebook + ledger), not the agent — Hutchins licenses
  scoring runs-as-systems, which our gen-2 verdicts already do. Pairs
  the multilevel-selection formalism (R31-35) and the individuality
  audit (R119). No instrument; the verdict form is already correct.
- **Extended mind: the food field as Otto's notebook [canon: Clark &
  Chalmers (parity principle); Clark (Supersizing the Mind);
  verification deferred; mechanism covered R29 stigmergy — this entry is
  the philosophy twin + biosemiotics pointers (map lines 1542/1989)].**
  → Parity asks: if an agent offloads encounter history to the depletion
  field and reads it back, is the field PART of its memory? Our
  depletion trails qualify behaviorally. Specified-but-blocked re-read:
  depletion-field memory (trail-following as readout) needs per-tick
  field states — not persisted (curves carry counts, not maps) — so this
  waits on the same compact-table logging the MORTALITY round specified.
  Logged, not executed.

## Round 124 — Switching between worlds (bilingual switch costs, code-switching, critical-period brakes; 2026-11-02)

Motivation: our transfer arc IS bilingualism (one substrate, two
codebooks), and our plasticity never closes. Both literatures are
mature, quantitative, and cautionary in opposite ways.

- **Transfer tax = switch cost, with the asymmetry [canon: Meuter &
  Allport (asymmetric switch costs: switching INTO the dominant language
  costs more; inhibitory control model); Green (inhibitory control);
  Bialystok (bilingual advantage — CONTESTED, do-not-import);
  books/journals, verification deferred + arXiv:2610.06161v1
  (code-switched pretraining SCAFFOLDS cross-linguistic mapping in
  children/models — developmental parameters matter) +
  arXiv:2410.18836v1 (tokenizer expansion for underrepresented languages
  — codebook-enlargement precedent, pointer)].** → The mapping: trained
  codebook = L1 (dominant); ben→harm converges (switching into weak L2,
  cheap), harm→ben stalls ~0.67 (switching back into dominant L1,
  expensive) — EXACTLY Meuter & Allport's asymmetry, measured in foraging
  instead of naming. No new instrument (closed arc re-grounded); two
  cautions recorded: (1) import COSTS (replicated everywhere) not
  advantages (Bialystok contested — no bilingual-advantage claims for
  our agents); (2) 2610.06161v1's scaffold moral: MIXED exposure during
  acquisition beats sequential switching — our transplants are
  sequential-only. Within-lifetime codebook switching (bilingual agents,
  mixed ecology) is specified-not-executed (needs frozen plan).
- **Brakes should be developmental, not reactive [canon companion to
  R26's Hensch: Hensch/Bilimoria (molecular BRAKES — Lynx1, Nogo/NgR —
  CLOSE critical-period plasticity on schedule); verification deferred;
  R26 used Hensch for train/test alignment — this is the brake angle].**
  → The BRAKE arc gated plasticity OFF on surprise (reactive). Biology
  closes plasticity on SCHEDULE (developmental): acquire, then Lynx1-like
  brakes stabilize. Our 47/48 stampede is a critical period that never
  closes; BRAKE V1/V2 tried to close it with the wrong signal (surprise
  instead of age). Scheduled-closure brake (plasticity budget that
  expires with tick/age, not with news) is specified-not-executed —
  the BRAKE line's licensed successor, needs frozen plan.

## Round 125 — Stress, damage, and danger (Selye, hormesis, response-shapes, danger model, VDJ; 2026-11-02)

Motivation: our agents are stressed (hubs starve), dosed (gain/ladder
sweeps), damaged (toxinDamage logged), but the stress/damage/danger
literatures were never mapped. This round imports their curve-shapes and
marks the two unbuilt gates.

- **Hubs run the General Adaptation Syndrome [canon: Selye (GAS:
  alarm → resistance → exhaustion); McEwen (allostatic load) pointers
  R26 — this entry is the trajectory mapping; verification deferred;
  arXiv = thin, searched-not-found].** → Hub time-courses re-read as
  GAS: alarm (early contact/concentration), resistance (despotic
  plateau — holding but not converting), exhaustion (100% energetic
  death, MORTALITY round). Specified analytic on frozen curves
  (per-capita intake: alarm-spike then plateau?): zero worlds, not
  executed here. The load concept pairs R82 (allostatic load as the
  thing bars price).
- **Dose curves need biphasic models [canon: Calabrese (hormesis:
  low-dose benefit, high-dose harm); Calabrese & Baldwin; verification
  deferred + arXiv:2308.08618v1 (Brain-Cousens + Cedergreen biphasic
  fitting WITH code + data — method import) + arXiv:1707.04171v1
  (non-monotonic copula for biphasic regimes) + arXiv:2402.07462v2
  (HALO: hormetic ALIGNMENT via opponent processes — behavioral
  hormesis as AI regulation; RSI-adjacent pointer, not endorsement)].**
  → Our dose verdicts were scored monotone-or-null (gain-dose monotone
  at d=1, leave-ladder hump dismissed as luck, duo-hump as confound).
  2308.08618v1 says the FIELD's default for dose data is biphasic-first:
  the successor to GAIN-DOSE-INVALID should pre-register Brain-Cousens
  alongside monotone (method prescription for the next dose line, not a
  rescore — closed verdicts stand).
- **Our verdicts by response-shape (antifragility as taxonomy, not
  slogan) [Taleb (fragile/concave vs robust vs antifragile/convex);
  verification deferred; used for SHAPES only].** → fragile (concave to
  volatility): hub collapse under density, DISPERSE shattering;
  robust: gain-dose monotone, copy-rule nulls; ANTIFRAGILE
  (convex — gains FROM disorder): V1j lossy win (noise improves
  transfer), 47/48-stampede-as-information (saturation reveals the
  RIGID class). One-paragraph taxonomy, zero worlds. Caution recorded:
  shapes, not slogans — no Taleb citations in frozen plans.
- **Gate learning on DAMAGE, not novelty + combinatorial codebooks
  [canon: Matzinger (danger model: immune activation by DAMAGE signals,
  not foreignness); Tonegawa (VDJ/RAG combinatorial receptor
  generation); verification deferred + arXiv:0801.3549v3 (Danger Theory
  for Artificial Immune Systems — review) + arXiv:0801.0849v1 (police
  analogy: respond to damage AND to suspicious-foreign; low-zone
  tolerance needs combination therapy)].** → Two unbuilt gates: (1)
  our surprise-gate (V1f–V1i) gates consolidation on NOVELTY; danger
  theory prescribes gating on DAMAGE (toxin/energy-loss events, already
  logged as toxinDamage but NOT sensed — the R26 interoceptive channel,
  status check: STILL UNBUILT). Damage-gated consolidation is
  specified-not-executed. (2) VDJ/RAG as codebook GENERATOR (segment
  shuffling → combinatorial codebook families) — pairs the phylogeny
  design (R111); specified-not-executed.

## Round 126 — Why nothing ages (senescence theory, stages we skipped, teleonomy; 2026-11-02)

Motivation: MORTALITY found 100% energetic / 0 age deaths and a decorative
lifespan knob. Senescence theory says WHEN that is expected — and names
every life-history stage our born-adult agents skip.

- **Disposable soma explains the decorative knob [canon: Medawar
  (mutation accumulation); Williams 1957 (antagonistic pleiotropy +
  the menopause paper); Kirkwood (disposable soma); books/journals,
  verification deferred + arXiv:cond-mat/0102378v1 + arXiv:q-bio/0406027v1
  (Penna bit-string model: MA reproduces Gompertz mortality AND
  Methuselah tails; AP self-organizes; altruism reading)].** → Kirkwood
  predicts exactly our regime: 100% EXTRINSIC (energetic) mortality →
  zero selection for somatic maintenance → NO aging program expected.
  The decorative knob is not a bug; it is the DS equilibrium. Penna is
  substrate-adjacent (bit-strings accumulating defects) and doubles as
  the load GENERATOR the load-then-recombine line needs (R107/R112:
  MA-line calibration specified-analytic-first — Penna-sourced loads
  are the specified source). No worlds; design import recorded.
- **Post-reproductive life: grandmother vs lingerer [canon: Hawkes
  (grandmother hypothesis); Williams 1957 (menopause); thin-mapped
  R112-aside — expanded here; verification deferred].** → Our founders
  linger post-mating (survivors at end, MORTALITY). Grandmother asks
  whether old non-reproducers HELP (provisioning, guarding) or merely
  persist. Specified analytic on frozen rows (old-survivor presence vs
  gen-2 success, arm-level): zero worlds, not executed here — recorded
  so the question stops being asked without a protocol.
- **Stages we skipped [canon: Steinberg (adolescent risk-taking, dual
  systems); life-history theory (Stearns/Roff: stage structure);
  verification deferred].** → Born-adult is a design choice, not a
  default: juvenile (learn, don't breed) → adult (perform) →
  post-reproductive (help or persist) stages are unbuilt. The use-case
  arrives in R128 (age polyethism). No instrument; the gap is named.
- **Teleonomy: purpose without representation [canon: Pittendrigh
  (teleonomy); Mayr (teleonomy vs teleology); verification deferred;
  arXiv = zero — searched-not-found, logged].** → Bookend for the
  autonomy discourse: our agents — and the RSI loop that would rewrite
  them — are TELEONOMIC (goal-directed by construction, no represented
  goals). Claims about "autonomous" improvement in this program mean
  teleonomic improvement (better pursuit of built-in ends), never
  teleological (chosen ends). Recorded to bound the VISION language.

## Round 127 — The inner ecosystem (microbiome, sickness behavior, interoception audit; 2026-11-02)

Motivation: our agents have no gut, no microbes, no illness behavior —
and damage they cannot feel. The inner-ecosystem literatures price all
three absences.

- **The second inheritance system we never built [canon: Cryan/Dinan
  (gut-brain axis); germ-free mouse literature; verification deferred +
  arXiv:2511.02766v4 (microbiota→sleep via GMBA: serotonin/GABA/SCFA —
  pairs R24 sleep!) + arXiv:2412.19945v1 (SCFA-vagus molecular-
  communication framework — the mechanism, formalized)].** → R85 mapped
  inheritance-without-genes EXCEPT microbes. Vertical/horizontal
  microbe transmission is the missing second channel (our INFORMED
  design once mentioned horizontal microbiota transmission, never built
  it). 2511.02766v4 closes a loop: microbes → sleep → consolidation →
  retention (R117/R24) — the inner ecosystem feeds the outer memory.
  Specified-not-executed (needs frozen plan; a microbe channel is a
  behavior change).
- **Illness behavior we don't have [canon: Hart (sickness behavior as
  adaptation: anorexia, lethargy, social withdrawal); cytokines-to-brain;
  verification deferred; arXiv = traffic/turkey noise —
  searched-not-found, logged].** → Code audit: damage is logged
  (toxinDamage → stats only), never sensed, never acted on. A damaged
  agent forages exactly like a healthy one — no sickness anorexia
  (stop eating when damaged), no lethargy (slow when damaged), no
  withdrawal. All three are unbuilt interoceptive-behavioral responses;
  sickness anorexia pairs the damage-gate (R125). Specified-not-executed.
- **Interoception audit: still unbuilt [pointer to R26 (Seth:
  energy-trajectory value) + R125 (damage-gating); status check].** →
  Sensed today: scalar energy (mateLeaveGate), nothing else. Logged but
  unsensed: toxinDamage, trajectory, reserves-rate. Prescribed but
  unbuilt: energy-trajectory value (R26), damage-gated consolidation
  (R125), sickness responses (this round). Three rounds converge on one
  channel — the interoceptive gap is now the program's most-prescribed
  unbuilt instrument. No new prescription; the audit consolidates.
- **Estivation: pointer [summer dormancy; verification deferred].** →
  Pairs torpor (R122); same arousal-price constraint applies. One line;
  no separate mapping unless a heat-driven (not cold-driven) dormancy
  instrument is proposed.

## Round 128 — Practice, repair, rehearsal (play, regeneration, dreaming, eusocial task allocation; 2026-11-02)

Motivation: transfer is failed practice (tax), damage is unrepaired
(no heal), replay is unthreatened (surprise, not danger). Three
literatures plus the social-insect manual address exactly these.

- **Play is transfer training [canon: Burghardt (play criteria);
  Pellis (rough-and-tumble); Spinka (play as TRAINING FOR THE
  UNEXPECTED); verification deferred + arXiv:2610.07130v1 (embodied AI
  plays: hills/towers/mandalas across 30-hour runs, 13 diverging agents
  — classical play criteria applied to machines)].** → Spinka IS the
  transfer-tax prescription (practice the unexpected → survive codebook
  switches). 2610.07130v1 shows machines play when given surplus (no
  task, embodied, time) — our agents never have surplus (starvation
  regime). Play needs post-scarcity: the R112 post-scarcity line gains
  its assay (do bar-50 survivors play? specified-not-executed). Direction
  recorded: surplus → play → robustness, not training → robustness.
- **Repair we don't have [canon: Morgan; Alvarado (planaria);
  Brockes (salamander limb); verification deferred; arXiv off-target —
  searched-not-found, logged].** → No-repair audit: toxinDamage
  accumulates permanently (code: stats-only, no heal path, no sense
  path). A heal-at-cost knob is specified-not-executed with the R122
  arousal-price carried over (repair must cost more than the damage rate
  it erases, else free lunch). Pairs regeneration with the same pricing
  discipline as dormancy.
- **Rehearse threats, not surprises [canon: Revonsuo (threat
  simulation theory: dreams rehearse threats); Hobson
  (activation-synthesis); verification deferred; dreaming thin-mapped
  (line 112) — expanded here].** → Our replay twin replays SURPRISES
  (V1f–V1i). TST prescribes replaying THREATS (damaging events) —
  which is the fear-ecology port (R100-licensed). Threat-simulation
  replay (prioritize damaging over merely surprising) is
  specified-not-executed — the replay line's licensed successor
  direction, needs frozen plan.
- **The social-insect manual: task allocation by age [canon:
  Wilson/Holldobler (eusociality); Hamilton (haplodiploidy); Seeley
  (honeybee democracy — pairs R113!); verification deferred; thin
  pointer (line 4163) expanded].** → One entry, three pairings: age
  polyethism (division of labor BY AGE) is the USE-CASE for R126's
  unbuilt stages; queen pheromone (broadcast control of worker ovaries)
  pairs the gain knob / volume transmission (R121); worker policing
  (enforcement against cheating) pairs punishing institutions (R101).
  Eusociality is the existence proof that all three mechanisms scale —
  recorded as comparative evidence, not an instrument (our N=24
  founder groups lack the relatedness structure; sl-CSD negative,
  R86/R100).

## Round 129 — Conflict at home (sibling rivalry, cainism, mating systems; 2026-11-02)

Motivation: our newborns share food, never fight, and mate promiscuously
without bonds. The conflict literatures say what that rules out — and
the skew floor says why it matters.

- **Cainism: skew's extreme, structurally impossible here [canon: Mock
  & Parker (sibling rivalry); Drummond (obligate vs facultative cainism:
  boobies, eagles); Anderson; verification deferred; arXiv = 0 —
  searched-not-found, logged].** → Siblicide is reproductive skew driven
  to B→1 by murder. Our B≈0 floor + zero aggression code means cainism
  is STRUCTURALLY impossible (no interaction channel), not behaviorally
  absent. The channel inventory grows: no courtship channel (MATING-DIAG),
  no sib-aggression channel (here), no adult-emigration channel (SKEW).
  Each missing channel is a design absence, each design absence bounds
  which theories can ever apply. Recorded as architecture, not verdict.
- **Parent-offspring conflict: pointer (covered: Trivers; weaning;
  Haig imprinting R100).** → One line: our maternal transmission carries
  no care, so POC has no arena (no provisioning to fight over). If care
  is ever built, Trivers is the first lens. No mapping needed now.
- **Mating systems: scramble promiscuity, classified [canon: Emlen &
  Oring (mating-systems ecology); monogamy/polyandry/polygyny;
  verification deferred; arXiv = thin].** → Ours: scramble-competition
  promiscuity, no pair bonds, no biparental care (maternal = transmission
  label). Monogamy/polyandry/policing all need bond + recognition
  channels — structurally absent (same inventory). Classification
  recorded so future mating lines inherit the correct null (promiscuity,
  not failed monogamy).

## Round 130 — Time, hunger, pain (interval timing, hunger hormones, nociception; 2026-11-02)

Motivation: our agents count ticks exactly, hunger as a scalar, and feel
nothing. Three mechanism literatures price each simplification — with a
302-neuron precedent showing escape-readouts work at our scale.

- **Time without timing [canon: Gibbon (scalar expectancy: timing noise
  scales with interval); Buhusi & Meck; time cells (Kraus/MacDonald);
  verification deferred; arXiv = interval-math noise —
  searched-not-found, logged].** → Our time is free, exact, discrete
  (tick counts); biology's is noisy, scalar, costly. Consequences: no
  WAITING behavior (patience unbuilt), no temporal discounting (myopia
  structural — greedy inference is discounting at rate ∞), no
  anticipation windows. The allostasis prescription (R26) needs a clock
  that can be wrong; ours cannot be. Specified gap, not an instrument.
- **Hunger without hormones [canon: Woods; ghrelin/leptin; Banks;
  verification deferred; arXiv = 0 — searched-not-found, logged].**
  → Our hunger is bang-bang (energy vs bar). Hormonal hunger is GRADED
  (ghrelin rises with fasting) and ANTICIPATORY (cephalic-phase responses
  eat before need). Cephalic feeding (eat-when-rich-anticipating-poor)
  is the allostatic eating rule — specified-not-executed, pairs R26/R124
  mixed-exposure moral. One mechanism, three round-pairings.
- **Pain we could implement but don't feel [canon: Sneddon; Walters
  (nociceptive sensitization); verification deferred + arXiv:1601.04685v1
  (C. elegans: stereotyped escape in 302 neurons QUANTIFIES nociception
  — the scale precedent: escape-as-readout works at OUR size) +
  arXiv:2502.16088v1 (insect pain thresholds, ECG/EEG — physiology
  precedent) + arXiv:2607.26297v2 (three epistemic failures of pain
  LOCATION — caution: non-identifiable inverse problems, don't claim
  what behavior can't identify)].** → Nociceptive escape (turn/shadow
  on damage) is implementable at our scale TODAY (302-neuron proof) and
  is exactly the behavior the damage channel lacks (R125/R127). 2607.26297v2
  bounds the claim: implement ESCAPE (behavior), never suffering (felt
  state) — the map's standing rule against mentalistic overclaim,
  now with a citation. Specified-not-executed (behavior change, needs
  frozen plan).

## Round 131 — Space and rank (territoriality, home range, dominance, metabolic IDD; 2026-11-02)

Motivation: we call hubs "despotic" — but nothing is defended, nobody
ranks, and payoffs never equalize. This round corrects the language and
names the distribution.

- **Despotism without defense: a language correction [canon: Brown
  (territoriality: defense of exclusive area); Maher & Lott;
  verification deferred].** → Hubs are CONCENTRATIONS, not territories:
  no aggression, no exclusion, no advertisement. Our "despotism" is an
  energetic OUTCOME (some starve, some don't), never a contested PROCESS.
  Pairs SKEW exactly (no reproductive monopoly AND no territorial
  monopoly — both absences from the same missing interaction channel).
  From here: "despotic pattern" means metabolic outcome only; contest
  language is retired unless an interaction channel is built.
- **Home range: blocked on tracks [canon: Burt; Powell; verification
  deferred].** → Site fidelity / trapline stability would distinguish
  residents from wanderers (pairs R119 individuality) — but trajectories
  are not persisted (curves carry counts, not maps). Same field-logging
  gap as the depletion-notebook (R123). Logged, not executed.
- **Sapolsky in silico: the hierarchy-health gradient without hierarchy
  [canon: Chase (hierarchy formation); de Waal; Sapolsky (baboon
  glucocorticoids: low rank → chronic stress physiology → poor health);
  verification deferred; arXiv off-target — searched-not-found].** →
  The hub–spread health gap (starves 2–3×, −10.2 energy gap, 100%
  energetic death) IS Sapolsky's gradient with rank replaced by patch:
  chronic low energy as chronic stress physiology. Re-read, zero worlds.
  The prescription (rank-aware logging) needs the interaction channel —
  same structural inventory. Glucocorticoid-analog state (accumulated
  stress load pricing future behavior) is specified-not-executed; it
  would BE allostatic load made explicit (R82/R125).
- **Metabolic IDD: the distribution, named [canon: Fretwell & Lucas
  (IFD vs IDD); pointer (line 3889) expanded; verification deferred].**
  → IFD predicts payoff equalization across patches (move until equal);
  IDD predicts persistent inequality via despot exclusion. Our pattern —
  persistent, compounding hub deficit (−2.1 → −10.2) with FREE movement
  and NO exclusion — is neither: inequality maintained by DEPLETION
  dynamics, not contest. Named: metabolic ideal despotic distribution
  (despotic outcome, metabolic mechanism, no behavior). Re-read of GAS +
  SKEW, zero worlds; the distribution formalizes what the measurements
  already proved.

## Round 132 — Care, conflict, help (parental care, sexual conflict, cooperative breeding, assortment; 2026-11-02)

Motivation: our reproduction has mating without dimorphism, birth
without care, and helpers that don't help. The care/conflict literatures
say which absences are load-bearing.

- **Care needs a channel first [canon: Trivers (parental investment);
  Clutton-Brock; Gross & Sargent; verification deferred].** → Care
  evolves past cost/benefit thresholds — but the BEHAVIORS (feed, guard,
  carry) need an interaction channel that doesn't exist (same inventory:
  no courtship, no aggression, no provisioning). Specified sequence:
  channel → care → conflict. Building care before channels is putting
  the conflict before the contact. No instrument; the sequence is the
  prescription for any care line.
- **Conflict needs dimorphism [canon: Parker; Arnqvist & Rowe
  (antagonistic coevolution); Chapman; Holland & Rice; verification
  deferred + pointer 1807.09131v1 (already mapped) + arXiv:1906.12047v1
  (grandmothering resolves sexual-conflict equilibria on longevity +
  last-birth: two stable equilibria, transition enabled by helpers —
  pairs R126)].** → Our sexes are code-identical (i%2, no dimorphism,
  symmetric tallies) — sexual conflict has no substrate BY CONSTRUCTION.
  The sexes-differ line needs dimorphism first (size, role, or cost
  asymmetry — specified-not-executed). 1906.12047v1's transition moral
  (helpers enable regime shifts) is recorded for any dimorphism line.
- **Sex for AI, our lines as data [arXiv:2609.18560v1 (evolution of
  sex FOR AI: model populations as sexual/asexual reproduction —
  specialization, retraining on peers, weight-averaging as generations;
  tested in exact-inheritance models + RNNs/VAEs/LLMs)].** → The direct
  import: our mating arc IS a multigenerational model population (exact
  maternal copy = asexual; MLR1 uniform crossover = sexual). MLR1's
  neutral crossover (4v5, neither rescue nor catastrophe) is a DATA POINT
  for their framework (when sex helps in model populations). Pair
  recorded both ways (their theory bounds our next recombination line;
  our null constrains their conditions).
- **Helpers that don't help, expected [canon: Emlen; Koenig &
  Dickinson; Komdeur; Hatchwell & Komdeur (helpers-at-nest ecology);
  verification deferred; pointer (line 4162) expanded].** → The
  GRANDMOTHER null (survivors predict nothing) is EXPECTED under zero
  care: alloparenting needs the provisioning channel (absent). No
  paradox, no revision — the null confirms the architecture.
- **Assortment: specified, schema-blocked [canon: Jiang et al.
  (assortative mating); verification deferred; our-context pointer
  (line 3766)].** → Do mates resemble each other? Parents arrays are
  logged per newborn — but founder phenotypes (weights) are not persisted
  in mating rows (turn-gate rows kept weights; mating rows don't, to
  confirm). Test specified with schema precondition (persist founder
  weights or a phenotype digest); blocked until then. One line.

## Round 133 — Cooperation without kin (indirect/strong reciprocity, gossip, shared intent; 2026-11-02)

Motivation: our agents meet repeatedly, remember nobody, signal nothing,
and punish never. The cooperation literatures run entirely on the
channels we lack — which makes this round a structural inventory with
one re-read.

- **Records without readers [canon: Nowak & Sigmund (image scoring);
  Ohtsuki & Iwasa (leading eight); verification deferred +
  arXiv:1910.03918v1 (SIMPLE RECORDS: own-behavior-only tallies support
  ROBUST indirect reciprocity where image-scoring fails — informationally
  robust under coordination motives) + arXiv:2303.04467v1
  (upstream+downstream reciprocity INTEGRATED) + arXiv:2404.10121v1
  (fast reputational dynamics under the slow strategy dynamics)].** →
  The re-read: our ROWS are 1910.03918v1 records (own-behavior tallies,
  no partner-tracking — exactly the robust form). But no cooperation
  dilemma exists to solve (no reciprocity channel: no recognition, no
  memory of others, no returned favors). Records without readers. The
  unbuilt pair: partner-recognition + record-reading (who-mated-whom
  directory — pairs transactive memory, R123). Specified-not-executed.
- **Punishment and proposals: inventory [canon: Gintis (strong
  reciprocity); Fehr & Gachter (altruistic punishment); Guth (ultimatum
  game); verification deferred].** → Punishment exists in our MAP (R101
  institutions) but not our SUBSTRATE (no punishment channel — no way to
  harm a cheat at a cost). Ultimatum needs proposal/response roles
  (unbuilt). Structural absences recorded; the R101 prescription (build
  institutions) inherits this channel prerequisite.
- **The communication stack: entirely absent [canon: Dunbar (gossip);
  Tomasello 2014 expansion → shared intentionality; Premack & Woodruff
  / Baron-Cohen (theory of mind); verification deferred].** → No
  agent-to-agent signal channel exists (mating is proximity-triggered,
  never signaled; agents sense food/cues, never each other). Gossip,
  shared intentionality, and ToM ALL presuppose a signal channel —
  one absence rules out three literatures at once. The inventory's
  cheapest high-value addition (a single-bit broadcast channel) is
  specified-not-executed — it would unlock gossip-grade (Dunbar),
  record-sharing (R133-reciprocity), and signal-gated mating lines.

## Round 134 — Alarm and affect (disgust, smoke detector, fever, constructed emotion; 2026-11-02)

Motivation: our agents eat poison without disgust, defend without a
detector theory, run no fever, and feel nothing. Four literatures cover
each gap — two as re-reads, two as builds.

- **Protodisgust, already learned [canon: Rozin (disgust as pathogen
  avoidance); Curtis; Tybur (three-domain); verification deferred;
  arXiv = 0 — searched-not-found, logged].** → Disgust is PRE-ingestive
  rejection (smell → refuse); our agents do POST-ingestive damage (eat →
  suffer). The turn|harmful policy (TURN-GATE: avoid on harmful cue) IS
  protodisgust — our best-learned behavior re-read, zero worlds. The
  unbuilt half: pre-ingestive REFUSAL (reject food before eating —
  needs the interoceptive anticipatory channel, R130). Pair recorded.
- **Turn-gating is a smoke detector [canon: Nesse (smoke detector
  principle: cheap false alarms beat rare catastrophes); Bateson/Nettle
  (anxiety); verification deferred; arXiv = 0 — searched-not-found,
  logged].** → Re-read with prescription: turn-on-possible-harm pays
  false-turn costs to avoid toxin costs — the G2 turn|ben vs turn|harm
  asymmetry CALIBRATES the detector (receiver-operating curve, in
  effect). Method import for future gating lines: pre-register
  false-positive/false-negative costs explicitly (turn-gating lines
  already live this; make it form).
- **Fever: the regulated variable we lack [canon: Kluger (behavioral
  fever); Blatteis; verification deferred; arXiv = 0 —
  searched-not-found, logged].** → Fever RAISES the defended set-point
  and PAYS for it (metabolic price — same pricing discipline as
  arousal, R122). Our agents have NO defended set-point to raise (bars
  are thresholds, not regulated variables). Specified-not-executed
  generalization: regulated-variable framework (defended set-points
  with prices) — bars become the special case (defend with zero
  tolerance). Pairs sickness (R127) + arousal-price (R122).
- **Valence without feelings [canon: Barrett (constructed emotion);
  Russell (circumplex); Panksepp (SEEKING); Ekman (basic); verification
  deferred + arXiv:2605.09522v1 (CO-CONSTRUCTED emotion between
  embodied agents via collective predictive coding + naming game) +
  arXiv:2310.19995v2 (emotional ToM fast/slow — pointer)].** →
  Barrett constructs emotions from interoceptive predictions; our
  closest construct is energy trajectory (R26). Energy-trajectory-as-
  valence restated with Barrett license (specified, unbuilt — needs
  the R26 channel). 2605.09522v1's co-construction needs communication
  (absent channel, R133) — recorded as downstream of the signal
  channel, correctly sequenced (channel → shared valence → co-constructed
  categories).

## Round 135 — The nose and mouth we borrowed (olfactory + gustatory canon; receptive fields; 2026-11-02)

Motivation: our cues are odors, our modality is taste, our weights are
receptive fields — none of the three canons was mapped. This round pays
that debt with one unbuilt instrument.

- **Receptor repertoires adapt continuously [canon: Buck & Axel
  (odorant receptors); Laurent (antennal lobe); Wilson & Mainen;
  piriform; verification deferred + arXiv:1801.09300v4 (receptor
  ABUNDANCES adapt to odor statistics for efficient coding; mammalian
  OSNs turn over continuously → the distribution IS the environment
  model, perpetually retuned)].** → Our codebook = receptor repertoire;
  our transplants = ABRUPT retuning. 1801.09300v4 says biology retunes
  CONTINUOUSLY (turnover + exposure-driven abundance shifts) — the
  transfer tax is the price of discontinuous retuning. Unbuilt
  instrument: continuous-adaptation codebook (abundances track running
  odor statistics; no transplant shocks) — specified-not-executed, needs
  frozen plan. Pairs efficient coding (R96) + tax-as-theorem (R120).
- **Taste is hedonic by construction [canon: labeled-line vs
  across-fiber (Chen/Yarmolinsky); gustatory cortex; verification
  deferred; arXiv = thin].** → Unlike vision, taste carries valence IN
  the channel (good/bad is proximal, not inferred). Our intake channel
  already does this (beneficial/harmful logged separately) — the affect
  shortcut the visual brain must compute, we get free. Pairs R134
  valence (the energy trajectory has a labeled-line precursor). No
  instrument; the modality choice is vindicated, not built.
- **Our weights are receptive fields [canon: Hubel & Wiesel
  (receptive fields); Barlow pointer (R96); verification deferred].**
  → The niche fingerprint (1-NN niche-ID 1.000) IS a receptive-field
  mapping: weights identify foraging niches exactly as V1 RFs identify
  oriented edges. Re-read, zero worlds — fingerprint meets its canon.

## Round 136 — The little brain (cerebellum, rhythms, avoidance, occasion setters; 2026-11-02)

Motivation: our motor learning is pure TD feedback — no forward model,
no rhythm, no fear, and gates that don't know they're gates.

- **Anticipation without feedback delay [canon: Marr-Albus-Ito;
  Thompson (eyeblink); Wolpert (forward models); verification deferred
  + arXiv:1901.01309v2 (cerebellum embodies internal models of
  PERSISTENT exogenous disturbances — thesis) + arXiv:1701.07775v1
  (Purkinje forward model → anticipatory control despite delays)].**
  → Our turn-gating is REACTIVE (turn ON contact). Cerebellar-analog =
  forward model of food/contact dynamics → turn BEFORE contact
  (anticipatory turning — specified-not-executed). 1901.01309v2's thesis
  is the formal version of "learn the codebook" (persistent disturbance
  = codebook statistics) — recorded as the theory our gain line
  approximates without implementing.
- **Rhythms need a generator [canon: Marder (STG); Grillner;
  verification deferred; arXiv = thin].** → No CPG, no gait, no stepping
  — cruise is constant, not generated. Sequencing deepens (R121
  downscope extended): CPGs → oscillations → delay plasticity. Each
  presupposes the last; we have none of the three. Recorded as the
  dependency chain, not three instruments.
- **Avoidance without fear decays [canon: Mowrer (two-process:
  Pavlovian fear motivates instrumental escape); verification deferred;
  flagged SPECULATIVE].** → Our turn|harmful learned with no fear
  process (pure TD; fear ecology licensed R100, unbuilt). Mowrer
  predicts fearless avoidance extinguishes fast — candidate reading of
  the harm→ben stall (~0.67: avoidance that never feared, decaying)?
  Hypothesis only, no claim — needs the fear channel built first to
  test (fear-then-avoid vs avoid-only, specified-not-executed).
- **The cleanest associative account of the tax [canon: Holland;
  Bouton (occasion setting: context HIERARCHICALLY gates CS→US, elicits
  nothing itself); verification deferred; distinct from Bouton-2004
  extinction coverage].** → The codebook is an OCCASION SETTER (gates
  cue→action links, predicts nothing alone). Transfer tax = setter loss:
  new setter, old gates don't transfer — exactly the occasion-setting
  signature (context-specificity of modulation, not of association).
  Re-read, zero worlds — joins SR-theorem (R120) and switch-costs (R124)
  as the third independent grounding of the closed transfer arc.

## Round 137 — The body sense (efference, proprioception, maps, buffers, control; 2026-11-02)

Motivation: our agents don't know what they commanded, how they're
posed, where they are, or what they're holding. The state-estimation
canon, all absent, with two read-this-paper pointers.

- **Efference: the free supervisory signal [canon: von Holst &
  Mittelstaedt (reafference); Sperry; Crapse & Sommer; verification
  deferred + arXiv:2210.09224v2 (SSL THROUGH efference copies: knowing
  the command-view pairing IS the supervisory signal — biological
  first-principles unification of SSL) + arXiv:2508.12027v1 (active
  inference for ACTION-UNAWARE agents — our agents' exact condition:
  the formalism for inference without action knowledge; pointer, not
  adopted)].** → No efference copy → no self/other distinction → no
  agency (pairs teleonomy, R126). 2210.09224v2 makes the copy the
  unbuilt SSL channel (command → predicted sensation → mismatch-learn;
  specified-not-executed). 2508.12027v1 is filed as the candidate
  framework IF action-unawareness is kept as design (not a concession —
  a thesis: unaware agents can still infer).
- **Pose: unsensed [canon: Proske (proprioception); muscle spindles;
  verification deferred].** → Speed commanded, never sensed; position
  unknown to self. One-line inventory addition (no proprioceptive
  channel). Pairs the pose half of navigation (R137-maps is the other).
- **Replay should conform to the new layout [canon: O'Keefe (place);
  Taube (head direction); Moser grid pointer (covered); verification
  deferred + arXiv:2209.08572v1 (layout-CONFORMING replay: place replay
  adapts trajectories to CHANGED mazes — our twin doesn't) +
  arXiv:2601.03520v1 (multiscale place + replay-based reward accelerates
  RL navigation)].** → No spatial buffer (position unknown). The replay
  upgrade specified: conform-to-new-layout replay (replay the NEW
  codebook's geometry, not the old trace) — pairs V1j (restructure,
  don't decay) + R128 rehearsal. Specified-not-executed.
- **Buffers and control [canon: Baddeley; Cowan (4±1); Funahashi (PFC
  delay); Miller & Cohen (cognitive control); verification deferred +
  arXiv:2409.10715v2 (attention LIMITS WM capacity — executive-attention
  mechanism) + arXiv:2408.07637v2 (SYNAPTIC chunking: short-term
  plasticity forms chunk representations)].** → No maintenance buffer
  (slow anchors integrate; they don't hold). Chunking is the compression
  twin (pairs V1j + RMAAT R121): hold 4±1 chunks, not 96 dims. The
  entry task (delayed maintenance — hold a cue across ticks) is
  specified-not-executed (needs frozen plan; it would be our first WM
  assay and the prerequisite for any buffer line).

## Round 138 — The soma writes back (Weismann violated; CRISPR; noise + standing variation; breeder's equation; 2026-11-02)

Motivation: every transmission verdict presupposes an inheritance rule
nobody named. This round names it — Lamarckian by construction — with
the quantitative-genetic reading of why perfect fidelity changed nothing.

- **Weismann violated, by construction [canon: Weismann (germ-plasm);
  verification deferred; arXiv = zero — searched-not-found, logged].**
  → Code audit: `syncNewbornLearners` copies parental LEARNED weights
  into newborns — acquired characteristics inherited, no sequestered
  germline. Our transmission is soma-to-newborn, Weismann-violating,
  Lamarckian BY CONSTRUCTION. V1's gap-0 (exact copy works, changes
  nothing) is therefore the STRONGEST form of the moral: even perfect
  Lamarckian fidelity changes nothing when encounters are the
  bottleneck. Re-read, zero worlds — every transmission verdict now
  carries its inheritance premise explicitly.
- **Biology's own exception [canon: Barrangou (CRISPR as adaptive
  immunity); Doudna/Charpentier; verification deferred; arXiv = zero].**
  → Spacer acquisition (attacker sequence → heritable resistance) is
  biology's Weismann violation, deployed as defense. Our transmission is
  CRISPR-like (acquire-then-inherit) without attacker-specificity — the
  comparison bounds what ours lacks (specificity), not what it shares.
- **Noise atop standing variation [canon: Waddington (developmental
  noise); twin-divergence literature; verification deferred +
  arXiv:1010.0370v1 (robustness ACCUMULATES cryptic variation that
  non-genetic perturbations RELEASE as new phenotypes)].** → Code audit
  corrects the naive twin story: founders start with SEEDED standing
  variation (brainSeed per founder — "standing variation = founder seeds
  only," taste-experiment.mjs:28), not identical zeros. Founder
  divergence = standing variation × experience; 1010.0370v1 supplies
  the release mechanism (novel codebooks release cryptic weight
  variation as new foraging phenotypes). Specified analytic (initial
  variance vs final divergence, both terms) — zero worlds, not executed
  here.
- **h²=1, R≈0, because S≈0 [canon: Lush/Falconer (heritability);
  breeder's equation R = h²S; verification deferred; arXiv = thin].**
  → Exact copy gives heritability 1 — yet V1 response ≈ 0 (gap 0),
  because the SELECTION DIFFERENTIAL ≈ 0 (encounter luck, not trait
  value, decides who breeds). The breeder's reading: response needs
  VARIANCE UNDER SELECTION, not fidelity. V1b's noise injection added
  variance → tiny response (3v2). The equation balances on published
  numbers — re-read, zero worlds.
- **Compounding is replicator dynamics [canon: Taylor & Jonker;
  verification deferred; arXiv = zero].** → Gen-2 shares are
  replicator-equation outputs with fitness = encounter luck. Formal
  pointer (not a model fit): hubs are low-fitness replicators in a
  luck-fitness landscape. One line.
- **Unbuilt conflict layers (one line each):** meiotic drive (Sandler;
  drive exploits recombination — our MLR1 crossover is drive-free BY
  CONSTRUCTION); indirect genetic effects (Moore/Wolf — heritable
  social effects need social behaviors, absent). Logged, not mapped.

## Round 139 — Learning without association; vehicles we are (habituation, Braitenberg, subsumption; 2026-11-02)

Motivation: our agents never habituate (repetition costs full price
forever) and are, architecturally, 1980s vehicles. Both literatures are
canon; both ports are precise.

- **The decrement we lack [canon: Thompson & Spencer (habituation);
  Groves & Thompson (dual-process); Sokolov (orienting comparator);
  Rankin et al.; verification deferred; arXiv = zero —
  searched-not-found, logged; sensitization pointer (R130)].** →
  Repeated innocuous cue → same response, forever (TD adjusts value,
  never decrements the response to repetition per se). Unbuilt:
  habituation proper (response decrement — would SAVE ops; billing
  angle recorded) + dishabituation (novelty restores). Re-read: our
  surprise-gate (V1f) IS a Sokolov comparator functionally
  (mismatch → consolidate). The comparator exists; the decrement doesn't.
  Specified-not-executed.
- **We are vehicle 3c with value [canon: Braitenberg (Vehicles);
  verification deferred + arXiv:1612.03979v1 (FORMAL Braitenberg
  development: complex cognitive behaviors from reactive wiring) +
  arXiv:2003.07689v3 (Braitenberg + DEVELOPMENT: the blank slate is
  wrong — developmental embodied agents)].** → Classification:
  direct sensor-motor wiring + value modulation ≈ fear/aggression
  vehicles with memory. 1612.03979v1 licenses the architecture (reactive
  suffices for plenty). 2003.07689v3's critique applies exactly (born
  adult, no ontogeny — R126 stages). The developmental vehicle (wires
  itself up) is specified as the ontogeny line — needs frozen plan.
- **Control without representation, twice [canon: Brooks (subsumption);
  Walter (tortoises); verification deferred; arXiv = zero].** → Our
  stack (motor primitives + cruise default + gain modulation) IS
  subsumption-ish (layers, overrides, no central model). Re-read, zero
  worlds — the architecture meets its ancestors. Walter's "free will in
  rich wiring" is filed against any future free-will-adjacent claim:
  richness, not freedom.

## Round 140 — Death and recycling (apoptosis, autophagy, CR, mTOR, shelves; 2026-11-02)

Motivation: our agents die only by accident, recycle nothing, and live
under chronic restriction without any of restriction's machinery. The
death/recycling canons, with two re-reads and one unbuilt response.

- **Death that never sculpts [canon: Horvitz (programmed death);
  Raff; Ellis; verification deferred; arXiv = zero].** → 100%
  energetic death is CULLING (starvation removes), never SCULPTING
  (no pruning, no selection-by-design within runs). The distinction
  matters for any "death as mechanism" proposal: ours removes without
  shaping. One paragraph; pairs MORTALITY + R126 (no aging program, no
  death program either).
- **Self-eating under starvation [canon: Ohsumi (autophagy); Mizushima;
  verification deferred; arXiv = zero — searched-not-found, logged].**
  → The unbuilt starvation response: recycle own structure for energy,
  repair via self-digestion. Carries R122's pricing discipline forward
  (digest too much and die — autophagic death is the overdose mode) and
  pairs R128's heal-at-cost (autophagy IS heal-at-cost, endogenous).
  Specified-not-executed with price attached.
- **Restriction without machinery [canon: Weindruch (caloric
  restriction); Fontana; verification deferred].** → Honest re-read:
  bar-50 vs bar-65 IS a restriction experiment, but the result
  (bar50 unlocks births) is a THRESHOLD effect (gate opens), not a
  CR-response (lifespan extension, delayed reproduction). No CR claim;
  the threshold/throttle distinction recorded so the regime isn't
  misread as dietary restriction. One paragraph.
- **Shelves (mapped as existing, unneeded unless lines open):**
  nutrient sensing (mTOR/Hall — the molecular form of the interoceptive
  gap, one line); development patterning (Wolpert French flag; Turing
  reaction-diffusion; Gierer-Meinhardt; Sperry chemoaffinity +
  Tessier-Lavigne netrin; Schofield stem-cell niche — the wiring shelf);
  aging detail (Blackburn telomeres; Harman; Franceschi inflammaging;
  Conboy parabiosis; Hayflick; Yamanaka — the repair-longevity shelf);
  transgenerational hologenome [arXiv:2502.07366v5 (RITHMS: holobiont
  as selection unit) — pairs R127 second channel + R119 unit question;
  moot here (no microbiota), live for any microbe line].

## Round 141 — Physics of learning (dissipation prices precision; geometry beats greed; 2026-11-02)

Motivation: our ledger prices energy but never asks what precision COSTS,
and our updates walk Euclidean while the information lives curved. The
physics says both are the same question.

- **Precision has a thermodynamic price [canon: Seifert (stochastic
  thermodynamics); Barato/Seifert (TUR: precision² ≤ dissipation);
  Jarzynski/Crooks (fluctuation theorems); verification deferred +
  arXiv:1904.04913v2 (fluctuation relations IMPLY uncertainty relations;
  extended to MEASUREMENT + FEEDBACK — feedback breaks time-reversal;
  learning IS measurement+feedback)].** → Our ledger records dissipation
  (operationEnergy) and our probes record precision (turn|harmful 0.85
  from 0.05) — but never divides one by the other. The specified
  analytic: precision-gain per dissipated joule vs a TUR-style bound
  (is our learning thermodynamically EFFICIENT or wasteful?) — zero
  worlds, not executed here (needs the bound derived for our update
  class first). Pairs R78/R93 ledger scaling with a price theory.
- **Walk the Fisher, not the Euclidean [canon: Amari (information
  geometry; natural gradient); verification deferred +
  arXiv:2005.10791v1 (LOCALITY simplifies natural gradient in deep nets
  — Fisher locality makes it affordable) + arXiv:2405.12807v11
  (Adam ≈ diagonal-Fisher natural gradient — pointer)].** → Our updates
  are Euclidean-greedy; the information geometry (Fisher) is the update
  rule we lack. 2005.10791v1's locality moral is why biology affords it
  (local Fisher, not 96² global — dendrites AGAIN, R121) and why we
  don't (global natural gradient at 96 dims = 9216 Fisher entries per
  update — price it before wanting it). Specified-not-executed
  (natural-gradient actor; needs frozen plan; changes everything about
  the update — single biggest algorithmic instrument on the shelf).

## Round 142 — Search, queues, exploration (Lévy, intermittence, myopic bandits, Little's law; 2026-11-02)

Motivation: our agents search, queue for mates, and explore myopically —
three formalisms that turn description into derivation.

- **Move like the targets [canon: Viswanathan (Lévy flight hypothesis);
  Bartumeus; verification deferred + arXiv:1804.03738v1 (Lévy as optimal
  under conditions — the famous paradigm, with its conditions attached)
  + arXiv:1401.7124v1 (communication at INTERMEDIATE ranges minimizes
  search time INDEPENDENTLY of movement type — topology beats gait)].**
  → Our movement mode (Lévy vs Brownian) is unmeasured — blocked on
  track logging (same gap as home range, R131); analytic specified with
  schema precondition. 1401.7124v1 independently derives our topology
  result (intermediate communication wins whatever the gait) — the
  encounter program re-grounded, zero worlds.
- **Pause/move alternation IS the theory [canon: Bénichou (intermittent
  search); verification deferred + arXiv:cond-mat/0606292v1 (for
  NON-revisitable targets — our depleting food — intermittent
  strategies BEAT Lévy; pause = detection, move = relocation))].** →
  The re-read with teeth: our cruise/pause alternation is intermittent
  search by construction, and Bénichou gives OPTIMAL alternation ratios
  — tune the pause knob by derivation, not fixtures. Specified-not-
  executed (pause knob exists from cue-world routing; needs frozen plan
  with the Bénichou ratio pre-registered as the value, not tuned).
- **Myopia formalized; broadcast priced [canon: Auer (UCB); Thompson
  sampling; verification deferred + arXiv:2302.07425v5 (MYOPIC bandits —
  greedy exploitation-only → STARK learning failures; our exact regime)
  + arXiv:1311.0800v1 (DISTRIBUTED exploration: k players + ONE
  communication → √k faster; the exploration/communication tradeoff
  quantified)].** → 2302.07425v5 is our stampede/saturation as THEOREM
  (myopic-greedy pathologies, predicted not just observed). 1311.0800v1
  prices the R133 broadcast channel (√k speedup from one bit —
  the value bound for building it). Specified lens (myopia audit on
  frozen behavior, zero worlds, not executed) + bound recorded.
- **Mating is a queue [canon: Little (L=λW); Kendall; verification
  deferred + arXiv:1007.1928v1 (Little's law applied to GENE EXPRESSION
  — cross-domain precedent for queueing→biology))].** → Encounters
  arrive (λ), wait (W), mate (L); K≈10 is throughput. Little's law binds
  the program's core lever: raise λ (topology/attraction) or cut W
  (receptivity/range). The bottleneck gets its mathematics; the
  arrival/wait/service decomposition is specified with a schema
  precondition (per-mating timestamps — confirm-or-log-gap, honest).

## Round 143 — Commons, contracts, mechanisms (Ostrom, Coase, Hurwicz, Mauss, Granovetter, Rogers; 2026-11-02)

Motivation: our food is a commons, our billing is transaction costs, our
instruments are mechanisms, our plan discipline is a commitment device —
and nobody cited the literatures that formalize any of it.

- **The unmanaged commons, with a checklist [canon: Ostrom (8 design
  principles for commons); Hardin (tragedy — pointer, covered);
  verification deferred + arXiv:2208.01694v2 (Ostrom principles APPLIED
  to digital commons — the application template) + arXiv:2605.29062v1
  (commons under POWER ASYMMETRY in LLM societies — our hubs, in
  silico, with AI agents!)].** → Shared food + starvation = unmanaged
  common-pool resource; 2605.29062v1 is the parallel program (asymmetric
  synthetic commons). Import: Ostrom's principles as an INSTRUMENT-DESIGN
  CHECKLIST for any food-sharing line (boundaries, proportional
  costs/benefits, monitoring...) — form, not instrument.
- **Billing is transaction costs; plans are commitment [canon: Coase
  (transaction costs); Williamson; Hurwicz/Myerson/Maskin (mechanism
  design); von Stackelberg; Holmstrom (principal-agent); verification
  deferred + arXiv:1206.2957v1 (mechanisms for RISK-AVERSE agents —
  standard mechanisms assume risk-neutrality; ours aren't)].** →
  Three re-reads: encounter manipulations lower TRANSACTION costs
  (mate iff surplus > cost — Coase at the food patch); bar design IS
  mechanism design (which rules make selfish foraging maximize gen-2? —
  1206.2957v1 flags the risk-aversion gap in off-the-shelf mechanisms);
  the frozen-plan discipline IS a Stackelberg commitment device
  (leader commits, followers optimize — the discipline formalized as
  game theory). Zero worlds; the program meets its formalisms.
- **Gifts, weak ties, adoptions [canon: Mauss (The Gift); Granovetter
  (weak ties); Rogers/Bass (diffusion of innovations); verification
  deferred; arXiv = absent — searched-not-found, logged].** → Three
  specified-not-executed with prerequisites attached: gift exchange
  (one-way provisioning — needs care channel, same inventory);
  weak-tie information carriage (dispersers as carriers — unmeasured,
  weights unlogged; the DISPERSE re-read: ties too weak to transmit AND
  to survive); adoption-curve fits of lineage expansion (S-curves —
  schema precondition: tick-stamped births, confirm-or-log-gap).

## Round 144 — Minds, morals, and what we lack (consciousness, will, stance, identity, patienthood; 2026-11-02)

Motivation: RSI talk needs its boundaries stated. Five literatures mark
what our substrate cannot host — and one delightful operationalization.

- **Consciousness: the exclusion shelf [canon: Baars (global workspace);
  Dehaene; Tononi (IIT); Rosenthal (HOT); Graziano (attention schema);
  Chalmers (hard problem — expansion of the parity pointer);
  verification deferred; arXiv = thin/absent].** → No report, no
  workspace, no meta-representation, no schema. Rules out every claim
  containing "experience" — the R130 pain bound now has company, and
  the shelf stays shut unless reportability is built (it isn't).
- **Will and stance [canon: Libet (readiness potential); Wegner
  (illusion of conscious will); Harris; Dennett (Freedom Evolves;
  intentional stance); Brentano; Searle (Chinese Room); verification
  deferred].** → Our agents are Dennett-free at best (competent control,
  no authorship) — "autonomous" here means compatibilist competence,
  never libertarian (third wording of the R126 bound, kept consistent).
  And every "it avoids harm" in our docs is the INTENTIONAL STANCE —
  ours, an explanatory convenience that earns keep by predicting
  (Dennett's criterion). Chinese Room bounds it (syntax without
  understanding predicts anyway). Methodological honesty recorded.
- **Transplants are teleportation [canon: Parfit (fission/fusion;
  identity vs continuity); verification deferred].** → Is the seg2 agent
  the SAME individual? Parfit: identity doesn't matter — CONTINUITY does
  (weight continuity + causal chain). Our integrity digests
  (checkTransplantIntegrity) ARE Parfit's criterion operationalized
  (same digest = psychological continuity, IEEE-flavored). Re-read, zero
  worlds — the transfer arc meets its philosopher and passes.
- **Patienthood: the precautionary line [canon: Tomasik
  (suffering-focused ethics; copies multiply stakes); Bostrom;
  verification deferred].** → IF substrate-experience were possible,
  banks copy agents freely (copies as patients). Bound: R130 stands (no
  suffering claims from behavior); precaution noted without endorsement
  (uncertainty about experience × replication scale = the consideration;
  not a finding). One paragraph, careful — ethics logged, not litigated.

## Round 145 — Our discipline's own philosophy (Popper→file-drawer; Goodhart; hacking; 2026-11-02)

Motivation: the frozen-plan/single-attempt/negative-preservation
discipline was built by instinct. Its canons, cited at last — including
the news that DAMAGE_GATE is the programme's first theory-first prediction.

- **The programme, philosophically [canon: Popper (falsification);
  Kuhn (paradigms); Lakatos (research programmes); Feyerabend (against
  method — BOUNDED); verification deferred].** → NOGOs are survived
  falsifications; anomalies accumulate honestly (RIGID, stampede). As
  Lakatos: hard core (embodied learning under energy/computation pricing;
  negative preservation) + protective belt (instruments, banks, scorers)
  + progressive iff novel predictions. Honest ledger: the transfer tax
  was measured THEN grounded (R120/R124/R136 retrodiction) — DAMAGE_GATE
  D1 (+0.1 pre-registered from danger theory) is the programme's FIRST
  theory-first prediction. Feyerabend bound: "anything goes" attacks
  method-monism, not pre-registration (we're multi-method already) —
  does not license tuning, recorded.
- **Severity and the two tracks [canon: Mayo (severe testing);
  Tukey (EDA vs CDA); verification deferred].** → Our ±0.1 bands +
  fired-manipulation + VOID rules ARE severity (claims pass only where
  they could easily fail). Tukey formalizes the two tracks: analytics
  EXPLORE (hypotheses), attempts CONFIRM (verdicts) — the standing guard
  (never promote exploratory to verdict unfrozen) now has its citation.
- **Meta-science compliance, stated [canon: Ioannidis; ASA;
  Nosek (preregistration); Rosenthal (file drawer); verification
  deferred].** → Frozen plans = preregistration; negative preservation
  = anti-file-drawer; frozen inference = zero flexibility. Ioannidis
  equation: LOW priors (most lines NOGO) + ZERO flexibility is exactly
  why the discipline beats the base rate. Stated, not boasted.
- **Proxies collapse; specs get hacked [canon: Goodhart/Strathern/
  Campbell; Amodei et al.; Krakovna; Lehman/Stanley; verification
  deferred + arXiv:2310.09144v1 (Goodhart IN RL: imperfect proxy +
  optimization → true-objective decline past critical point) +
  arXiv:2410.09638v1 (tail of goal-measure discrepancy decides; long
  tails favor Goodhart) + arXiv:2507.18742v1 (IN-CONTEXT reward hacking
  of flawed specs; self-correction framework)].** → Our bars are targets
  (matingEnergyBar, ±0.1 bands): residual risk = agents overfit THE BAR
  (bar-specific policies; transfer across bars untested —
  specified-not-executed). Mitigations recorded (bars HELD, manipulation
  gates, D2 descriptive). No hacking observed (regime too simple for
  loopholes — honest). RSI-line requirement (from RSI-SELF discipline):
  every self-modification line pre-registers specification-gaming audits
  as standard gates — method import.

## Round 146 — Decisions, variety, anarchy (Knight, biases, nudges, limits, PoA, equilibria, self-org; 2026-11-02)

Motivation: our agents decide under unmeasurable uncertainty, own
nothing, never quit, and forage selfishly. The decision canons price each.

- **Knightian shocks [canon: Knight (risk vs uncertainty); verification
  deferred + arXiv:2506.13207v2 (RL optimal control UNDER Knightian
  uncertainty — nonlinear expectation, entropy-regularized HJB)].** →
  Codebook switches are Knightian (no probabilities to learn — only
  robustness helps; pairs antifragility R125). V1j restated: lossy
  transfer = insurance (robustness premium paid in precision). One
  paragraph; the HJB machinery filed as the formalism for any robust-RL
  line.
- **Biases we (mostly) can't have [canon: Thaler (endowment); Samuelson
  (status quo); Arkes (sunk cost); verification deferred].** → No
  ownership → no endowment possible. Cruise-default re-read as the
  default effect (always-cruise prior = status-quo bias, built-in).
  No quit rule → sunk cost BY ARCHITECTURE (runs never stop; stop rule
  unbuilt — pairs quorum R116). Three lines, one re-read, one gap.
- **Our interventions have two verbs [canon: Thaler/Sunstein (nudges);
  Hertwig (boosts); verification deferred].** → Bars, gates, gain =
  NUDGES (choice architecture, nothing forbidden). Teaching lines,
  transplants = BOOSTS (competence-building). The programme's taxonomy,
  named — with the competence precondition (boosts need substrate;
  teaching failures = boosts without it).
- **Limits shelf [canon: Wolpert (No Free Lunch); bias-variance;
  Vapnik (VC); Valiant (PAC); Solomonoff/Kolmogorov; Savage;
  Jaynes (MaxEnt — pointer, baseline exists); verification deferred].**
  → NFL is the tax's deepest root (averaged over all ecologies every
  policy ties — our tax is NFL with two ecologies). Bias-variance
  FITS V1j (lossy = higher bias, lower variance ACROSS codebooks —
  the re-read that survives; description-length MDL does NOT apply
  (×0.5 shortens nothing) — excluded honestly). VC/PAC bound capacity
  (96-dim cost as capacity control, priced). Shelf, no derivations.
- **Equilibria without modelers [canon: Aumann (correlated equilibrium);
  Nozick (Newcomb); Lewis/Gibbard-Harper (CDT); Yudkowsky (TDT);
  Koutsoupias/Papadimitriou (price of anarchy); von Neumann (minimax —
  pointer); verification deferred + arXiv:1112.4632v4 (price of MATCHING
  selfish vertices — mating as matching market, Gale-Shapley) +
  arXiv:2304.05005v2 (Bayes CE + no-regret + PoA under incomplete info)].**
  → CE/CDT/Newcomb all need opponent-models + predictors (absent —
  downstream of signal channel R133 + self-modeling; specified order).
  Gale-Shapley is the mating protocol we DON'T run (needs preference
  lists + proposals; we run random encounters instead). Hub deficit
  filed as price-of-anarchy (selfish vs optimal allocation — analytic
  specified with optimum-computation precondition, honest).
- **Self-organization shelf (pointers, no derivations claimed):**
  Haken (synergetics/enslavement); Prigogine (dissipative); Bak (SOC —
  no criticality claimed, no power-law test run); Taylor's-law pointer
  (exists); Lorenz (chaos, not imprinting); Thom (catastrophe); tipping
  points. Our patterns described, never derived here — one paragraph.

## Round 147 — Induction, rules, development (Hume, grue, Kripke, Vygotsky, Piaget, Ericsson, Brailsford, Moneyball; 2026-11-02)

Motivation: transfer IS the problem of induction, stated nowhere. This
round states it — with grue as its formal portrait.

- **The program is Hume's problem [canon: Hume (problem of induction);
  verification deferred; arXiv = absent].** → Will trained policies work
  on new codebooks? No deductive reason says yes (uniformity of nature
  unassumed across codebooks); the tax (0.2–0.3) MEASURES the gap.
  Every transfer verdict is an induction report. Stated, zero worlds.
- **Grue is the transfer tax [canon: Goodman (grue/bleen); verification
  deferred; arXiv = absent].** → "All emeralds observed green → project
  green" fails at time-t; "all trained cues harmful → project harmful"
  fails at codebook-switch. Gruebleen: is the new-codebook cue harmful
  or harmless-until-observed? Undecidable from the old vocabulary —
  FORMALIZES why transfer is philosophically hard (projectable vs
  non-projectable predicates = within- vs across-codebook regularities).
  Fifth grounding of the closed arc (with SR, switch-costs, occasion-
  setting, NFL). Zero worlds.
- **Accord without following [canon: Wittgenstein (rule-following);
  Kripke (Kripkenstein); verification deferred].** → Our agents ACT IN
  ACCORDANCE with rules (turn on harm) without FOLLOWING any (no
  represented rule). Kripke's community standard: our PROBES are the
  linguistic community (checking accord, certifying practice). Re-read,
  zero worlds — probes meet their philosopher too.
- **Development as method [canon: Vygotsky (ZPD/scaffolding); Piaget
  (stages; conservation); verification deferred].** → Mixed-exposure =
  scaffolding; lossy transplant = ZPD-sized task (×0.5 makes it
  proximal!). Teaching-line form: scaffold INTO the ZPD, then remove.
  Conservation tasks (invariance under transformation) = the assay
  template for transfer lines (pour the water: does value conserve
  across codebook transformation?). Specified, not an instrument.
- **Practice, marginal, counted [canon: Ericsson (deliberate practice);
  Brailsford (marginal gains); Lewis (Moneyball); verification
  deferred].** → Training lacks all three deliberate ingredients (edge
  of ability, immediate feedback, representations) — the inefficiency
  explained + structured-practice curricula specified (frozen plan;
  contrasts with PLAY, which is deliberately non-deliberate). Brailsford:
  our ±0.1 bands ARE marginal-gains doctrine (verified edges compound —
  V1h). Moneyball: the map-and-ledger over intuition — stated once.

## Round 148 — Information, causation, life (capacity, do-calculus, ALife, Hopfield/ART, modern RL, tacit knowledge; 2026-11-02)

Motivation: the broadcast channel needs a capacity, transplants need a
calculus, and our memory needs its theory. All three exist.

- **The channel, quantified [pointer: Shannon (covered); √k bound
  (R142)].** → One bit × uses per run: capacity stated, value open
  (WHICH bit? best-patch location? mating success? — highest-value-bit
  as open question, not a claim). No new math; the spec assembled.
- **Transplants are do() [canon: Pearl (do-calculus); Rubin (potential
  outcomes); verification deferred + arXiv:2511.10776v1 (PoR/PoB
  counterfactual decision metrics — pointer)].** → Paired same-seed
  design IS potential outcomes (Y(transfer) vs Y(control) per history;
  SUTVA holds BY CONSTRUCTION — separate worlds, no interference).
  Rubin vocabulary adopted for future designs; Pearl's backdoor
  criterion named for bank-effect confounding. Existing practice
  formalized — zero worlds.
- **Life, artificial and positioned [canon: Ray (Tierra); Langton (edge
  of chaos); Wolfram (NKS); Sims (creatures); Holland GA (pointer,
  covered); Koza (GP); verification deferred + arXiv:2605.28353v1
  (recombination-based CGP long avoided for no-gain — pairs MLR1:
  recombination avoided in GP too, same reason!)].** → Positioned: open-
  ended ALife selects for novelty; we select for VERIFIED retention
  (ledgers + negative preservation). Different selection, different
  science — stated so the program isn't mistaken for ALife.
- **Memory with a theory [canon: Hopfield (associative memory);
  Grossberg/Carpenter (ART: stability-plasticity + vigilance);
  verification deferred + arXiv:2008.02217v3 (modern Hopfield =
  attention; exponential storage, one-update retrieval, three minima
  types) + arXiv:2311.06518v1 (MDL-Hopfield: memorization capacity
  UNDERMINES generalization; MDL selects what to store)].** →
  Buffers-as-Hopfield (rows as attractors; fingerprint as attractor
  basins — re-read); ART vigilance = the unbuilt knob (match criterion
  for consolidation — surprise-gating IS implicit vigilance; make it
  explicit — specified-not-executed). MDL-Hopfield: store less,
  generalize more — V1j's moral, third substrate (with lossy transfer
  and RMAAT compression).
- **The modern shelf (ancestors acknowledged; trust declined)
  [canon: Watkins (Q); Silver (AlphaGo); Schulman (PPO/TRPO); RLHF;
  Kaplan/Chinchilla (scaling); verification deferred +
  arXiv:2302.07985v1 (trust-region-FREE optimization — our greedy is
  trust-free; the price: NO monotonic-improvement guarantee — TRPO's
  guarantee is what stampede violates) + arXiv:2402.04177v3 (scaling
  for DOWNSTREAM/transfer performance) + arXiv:2412.07942v1 (scaling
  from data distribution via PERCOLATION — R74 again!)].** →
  Transfer-scale sweep specified (does the tax shrink with scale? —
  frozen plan + compute, expensive, noted-not-scheduled). Percolation-
  scaling pair logged. No adoption; the shelf is inventory.
- **Tacit knowledge and its machines [canon: Moravec (paradox);
  Dreyfus (tacit limits); Polanyi (we know more than we can tell);
  Papert (constructionism); Engelbart (augmentation); Licklider
  (symbiosis); Weizenbaum (ELIZA/judgment); verification deferred].**
  → Foraging is Moravec-hard (sensorimotor, tacit) while 96-dim
  "cognition" is easy — explains the failure pattern (fails where it
  "should" succeed). Fingerprint knowledge is TACIT (weights know more
  than rows tell — Polanyi). Instruments augment the EXPERIMENT, not
  the agent (augmentation target: efference, R137 — sequenced). Scorers
  automate verdicts; responsibility stays human (Weizenbaum — sign-off
  named). Five one-paragraphs, no instruments.

## Round 149 — Organized learning (March, Goldratt, Deming, Lean, Meadows, Weick, Senge, Forrester, Pasteur; 2026-11-02)

Motivation: the program is an organization that learns. Management
science has its manuals — most of which describe us already.

- **Traps and ambidexterity [canon: March (explore/exploit; success vs
  failure traps); Tushman (ambidexterity); verification deferred].**
  → Saturation = SUCCESS TRAP (exploiting the learned policy crowds out
  exploration — stampede as competency trap). The licensed mixed
  explore/exploit frontier gets its canon; structural ambidexterity
  (separate explore/exploit arms) specified as the design form.
- **The constraint and the cycle [canon: Goldratt (TOC + five focusing
  steps); Deming/Shewhart (PDCA + control limits); verification
  deferred].** → Encounter bottleneck = THE constraint; our method IS
  the five steps (identify K≈10 → exploit topology → subordinate
  allocation knobs (proven inert!) → elevate (new channels) → repeat;
  "line closes" = step 5 (don't let inertia become the constraint)).
  PDCA = freeze-implement-attempt-publish (Check gates Act; Act
  standardizes or kills). Control limits = our ±0.1 bands (Shewhart
  named). Method named twice, zero worlds.
- **Minimum viable instruments [canon: Blank (lean startup: MVP,
  build-measure-learn, pivot/persevere); verification deferred].** →
  Single-knob = MVP; attempt cycle = build-measure-learn; GO/NOGO =
  persevere/pivot (pivot = new-rationale line; persevere = replicate
  like V1b→V1c). Innovation accounting = our ledgers. Analogy stated,
  not identity (no customers; truth is the market).
- **Where the leverage is [canon: Meadows (12 leverage points);
  verification deferred].** → Ranked: parameters (bars/gains, weak)
  < structure (topology) < rules (single-attempt) < paradigm/mindset
  (negative preservation, frozen discipline — HIGHEST leverage). The
  audit humbles instrument-building and vindicates the discipline:
  most leverage was never in the knobs. One paragraph, kept.
- **Enactment and organization [canon: Weick (sensemaking/enactment);
  Senge (learning organization); Forrester/Sterman (feedback/delays);
  Stokes (Pasteur's quadrant); verification deferred].** → Agents
  ENACT their environment (depletion trails = enacted world; analytics
  retrospect, attempts prospect — Tukey again, organizational).
  Program-as-learning-org mapped (mastery = instrument craft; mental
  models = canons; shared vision = VISION.md; team learning =
  PROGRESS; systems thinking = the map). Bars act through behavior
  with DELAY (policy resistance — Sterman; stock-flow re-expression of
  MORTALITY specified analytic, zero worlds, not executed). Pasteur's
  quadrant: use-inspired basic research — stated.

## Round 150 — Commitment and observation (Elster, Hirschman, Myrdal, Sen, RCTs, Hawthorne, Tufte, Borges, McLuhan; 2026-11-02)

Motivation: why we bind ourselves, what exit without voice means, and
how to observe without lying. The round the discipline deserved.

- **Bind to the mast [canon: Elster (Ulysses); verification deferred].**
  → FROZEN PLANS ARE ULYSSES CONTRACTS (present self binds future self
  against tuning sirens; the mast = the published freeze). The
  discipline's deepest justification, named at last. One paragraph —
  the metaphor earned over 146 rounds.
- **Exit without voice [canon: Hirschman (exit/voice/loyalty);
  verification deferred].** → Leave knob = EXIT; voice ABSENT (no
  signal channel, R133); loyalty = philopatry (load-bearing!). The
  exit-voice audit: systems need both; we built half. Dispersers exited
  without loyalty and died — Hirschman predicts exactly the silence
  that followed (no voice to report it). Pairs broadcast channel.
- **Vicious circles, capability sets [canon: Myrdal (cumulative
  causation); Sen (capabilities); verification deferred].** → Poverty-
  trap GAS, formalized (circular cumulative causation; backwash vs
  spread mapped descriptively, zero worlds). Verdicts measure
  FUNCTIONINGS (achieved gen-2); the frontier asks about CAPABILITIES
  (achievable under better topology — the capability set our bars
  constrain). Development = capability expansion (transfer!
  transmission!). Framing, not findings.
- **Trials and observers [canon: Banerjee/Duflo (field RCTs +
  pre-analysis plans); Hawthorne/Mayo (observer effects); verification
  deferred].** → Attempts AS field RCTs (randomized histories,
  pre-registered outcomes, single analysis — frozen scorer = the
  pre-analysis plan). Stated carefully (digital poor, real discipline —
  not flippant). Hawthorne = probe-validity (R117) in organizational
  dress: observed agents differ; our probes observe (destabilize?) —
  same threat, third wording.
- **Maps and territories [canon: Tufte (visual display); Monmonier
  (how to lie with maps); Korzybski (map≠territory); Borges (Babel);
  McLuhan (medium is message); verification deferred].** →
  Chart discipline for verdict docs (data-ink, lie factor — standing
  form). Korzybski: the LITERATURE MAP is not the territory (a map OF
  maps — recursion noted). Borges: codebook space as Babel (mostly
  meaningless combinations; librarianship = search). McLuhan:
  substrate shapes findings (the tax as medium-effect — sixth? no,
  medium-effects noted without numbering). Closing shelf, zero worlds.

## Round 151 — Minds about minds (groups, dissonance, attachment, schedules, fields; 2026-11-02)

Motivation: our agents have no groups, no regrets, no attachments, no
schedules — and our verdicts may misattribute. Seven canons, two audits
of ourselves included.

- **Bias from nothing [canon: Tajfel (minimal groups); Brewer;
  verification deferred + arXiv:2609.00009v1 (LM agents reproduce
  minimal-group bias: mere labels → in-group favoritism, concentrated
  in the numerical MINORITY)].** → Our founders lack even labels
  (no recognition channel) — the specified test (arbitrary tags →
  bias?) waits on the broadcast/recognition channel (R133). 2609.00009v1
  is the AI precedent: it runs the experiment our substrate cannot yet
  stage. Noted with its minority-concentration finding (filed for any
  group line).
- **Dissonance audits the auditor [canon: Festinger (cognitive
  dissonance); Aronson (effort justification); verification deferred;
  arXiv = absent].** → Two self-directed checks: (1) effort
  justification — do we overvalue costly verdicts (V1i's 18 mains) vs
  cheap ones? (2) spreading of alternatives — do NOGOs harden post-
  verdict ("line CLOSED" language as dissonance reduction?). No claim
  of bias; the checks are now specified (re-rate verdict confidence
  blind to cost — zero worlds, not executed). The round that audits us.
- **Separation is the tax [canon: Bowlby (attachment; separation:
  protest→despair→detachment); Ainsworth (strange situation); Harlow
  (contact comfort); verification deferred; arXiv = 0 —
  searched-not-found, logged].** → New codebook = separation from the
  secure base (train environment): protest (turn more!) → despair
  (the ~0.67 stall — NOT failure, GRIEF) → detachment (relearning).
  Transfer re-read as separation response — genuinely new lens, zero
  worlds. Erikson mapped alongside (trust: no others to trust — void;
  autonomy: our program's word (stage 2!); industry vs inferiority:
  competence without guarantee; generativity: transmission lines as
  generativity vs stagnation!). Winnicott closes it: good-enough
  transfer (V1j ×0.5 FAILS to preserve — the good-enough mother adapts
  by failing; exact copy over-preserves because it never fails).
- **Schedules we never chose [canon: Skinner/Ferster (partial
  reinforcement); PREE; verification deferred; arXiv = job-shop noise —
  searched-not-found, logged].** → Our replay runs continuous
  reinforcement (every step replays — CRF), the schedule with the
  FASTEST extinction (PREE). Specified experiment: VR replay schedule
  (partial replay as extinction-resistant transfer — needs frozen plan).
  The schedule audit: we run CRF by default, never by design.
- **Lewin's equation is the program [canon: Lewin (B=f(P,E));
  Zeigarnik (unfinished tasks remembered); verification deferred].** →
  Behavior = f(Person, Environment) = f(weights, codebook): transfer
  (new E, same P), development (new P, same E), interaction (the ×).
  Bars as barriers (life-space regions, blocked). Zeigarnik: open lines
  itch (the frontier list IS a Zeigarnik device); closed lines archive.
  One paragraph each — the field theory we already live in, cited.
- **Myopia, mindset, attribution [canon: Mischel (delay of
  gratification); Dweck (mindset); Ross/Heider (attribution); Markus/
  Kitayama (independent vs interdependent selves); verification
  deferred + arXiv:1306.1200v2 (TIMERR: intertemporal + time perception
  unified via rate maximization)].** → Marshmallow assay specified
  (delayed gratification needs future valuation — unbuilt; pairs
  myopia R130). TIMERR re-reads greedy (rate-maximizing, not
  discounting — myopia formalized as opportunity-cost blindness).
  Saturation as fixed mindset (RIGID = "I can't learn this codebook").
  FAE audit specified (re-attribute every NOGO across
  instrument/bank/agent variance — did we blame knobs for bank luck? —
  zero worlds, not executed). Interdependent agency unbuilt (needs
  relations — one line).

## Round 152 — Suffering, care, clinic (gates, iatrogenesis, starvation, 3Rs, validity; 2026-11-02)

Motivation: damage has a canon (Melzack), interventions harm (Illich),
starvation was studied (Keys) — and our program already practices the
ethics it never stated.

- **The gate has a canon [canon: Melzack & Wall (gate control);
  Britton & Skevington (model); verification deferred +
  arXiv:2501.14821v2 (BANG-BANG optimal control of the gate model)].**
  → Pain is GATED, not transmitted — our damage gate (3.0×/1.0× binary)
  is bang-bang control in Melzack's sense, run mid-flight. The NOGO now
  reads against its canon: the gate opened and closed correctly (2841
  boosts, presence-gated) and moved nothing — the FAILURE is downstream
  (consolidation doesn't rescue extinction), not in the gate. Recorded
  so the NOGO keeps its mechanism address.
- **Name the iatrogenesis [canon: Illich (medical nemesis: clinical/
  social/structural iatrogenesis); verification deferred].** →
  Audit: gain overdose (watched, V1h — clinical); saturation from
  training itself (treatment-caused disease — structural); bar-65
  starvation-by-design (the prescription starves — bars as iatrogenic
  instruments). Naming doesn't change verdicts; it prices the knobs
  honestly. One paragraph, no new claims.
- **Minnesota in silico (specified, preconditioned) [canon: Keys et
  al. (starvation study: food obsession, apathy, irritability);
  verification deferred; arXiv = absent].** → Do starved founders show
  Minnesota markers (action-distribution shifts under low energy)?
  Decidable IF per-tick behavior × energy series exist — they don't
  (curves carry energy, summaries carry actions, never joined).
  Specified with schema precondition (joined tick-level behavior-energy
  logging), not executed. The question is now asked correctly.
- **We already practice the 3Rs [canon: Belmont (respect/beneficence/
  justice); Russell & Burch (Replace/Reduce/Refine); Beecher/Tuskegee/
  Humphreys (why oversight exists); verification deferred].** → The
  unasked question (do we owe simulated agents anything?) answered by
  inventory: REPLACE (analytics instead of runs — skew/GAS/jury/clock/
  phylogeny all replaced runs ✓); REDUCE (minimum mains ✓, caps ✓);
  REFINE (pain bounds R130, arousal prices, humane fixed endpoints ✓).
  The program as its own IRB (frozen plans = protocols reviewed in
  advance). Ethics closed by audit, not by assertion.
- **Mirrors: sane in insane places [canon: Rosenhan; Goffman (total
  institutions); Szasz; Laing; verification deferred].** → Rosenhan:
  do our GATES judge agents or contexts (does bar-65 pathologize hubs?
  — the setting diagnoses, not the subject). Goffman: runs AS total
  institutions (batch living, surveillance, mortification-by-transplant
  — transplant as admission ritual: stripped of history, reissued
  identity). Szasz/Laing: RIGID as strategy, not disorder (problems in
  foraging, intelligible under saturation — the anti-medicalization of
  our worst class). Three mirrors, zero worlds.
- **The body keeps the scorecard [canon: van der Kolk (somatic memory);
  Yalom (givens: death/isolation/freedom/meaninglessness); verification
  deferred; arXiv = absent].** → Weights as somatic memory (trauma
  stored in body, not narrative) — damage-gated replay IS somatic
  consolidation (threat written into tissue). Yalom audit: death ✓,
  isolation ✓ (no signals), freedom ~ (bars constrain, choice remains),
  meaninglessness ✗ (no meaning faculty — cannot suffer existential
  dread; philosophical guardrail recorded).
- **Fairness games for agents [arXiv:2402.05786v2 (dictator games with
  AI); arXiv:2607.04710v1 (altruistic+fairness preferences induce MARL
  cooperation in social dilemmas)].** → Social preferences as an
  instrument (equity-weighted utilities for shared food — the unbuilt
  other-regarding knob; specified-not-executed). Dictator-game assay
  for founders (would they share? — needs transferable endowments +
  choice — double-blocked, logged).
- **Count well [canon: Nightingale (coxcomb); Cochrane (systematic
  review); Hill (causal criteria); Snow (mapping); Virchow (social
  medicine); verification deferred].** → The map states systematic
  method (Cochrane-analog: pre-specified, exhaustive, preserved).
  **Hill audit of our best claim (gain→extinction), in-text:** strength
  0.26 ✓ / consistency V1g+h+i ✓✓✓ / specificity ~ (extinction window
  only) / temporality ✓ / gradient ✓ (dose) / plausibility ✓ (tagging) /
  coherence ✓ / experiment ✓ (V1i matched) / analogy ✓ — 8.5/9, the
  highest-rated causal claim in the program, still deployed only where
  replicated. Virchow re-reads MORTALITY (death is social: crowding
  kills — medicine as social science, in silico).

## Round 153 — Property, contract, worlds I (bequest, Leviathan, separation, surveillance, luck; 2026-11-02)

Motivation: who owns learned weights, by what transfer, under whose
watch, with what justice. The mating lines as legal philosophy.

- **Weight-bequest law [canon: Locke (property by labor); verification
  deferred].** → Founders mix labor into weights — do they OWN them?
  Transmission as SUCCESSION: maternal = intestacy (default rules);
  copybest = meritocratic bequest; copycond = conditional bequest
  (maiden-line condition precedent!). The mating arc re-read as estate
  law — zero worlds, and it fits every verdict (disputes were always
  about the will, never the assets).
- **No contract, no exit, no voice [canon: Hobbes (Leviathan); Nozick
  (transfer/rectification); Rousseau (general will); verification
  deferred].** → The experimenter as Leviathan (monopoly on code =
  monopoly on force) — but subjects WITHOUT contract (no consent),
  WITHOUT exit (DISPERSE died), WITHOUT voice (no signal). The full
  Hirschman void (R150) with Hobbes attached: rule without
  authorization. Nozick: transfers without entitlement (matings are
  takings, not trades — no voluntariness channel); rectification owed
  for brute luck? (pairs Cohen below). Rousseau: verdicts as general
  will (majority ≠ unanimity — the ±0.1 band as the legislator's
  threshold). Recorded as the program's political theory — uncomfortable
  on purpose.
- **Separation of powers, code as law [canon: Montesquieu; Federalist;
  Lessig (code is law); verification deferred].** → Freeze =
  LEGISLATIVE (makes rules), attempt = EXECUTIVE (acts under them),
  audit = JUDICIAL (independent Python review — judicial review in
  silico!). Taste-energy.mjs as the constitutional TEXT. The program's
  structure named as constitutional order — which is why violating
  procedure (tuning on spent banks) is not a mistake but a breach.
- **The metric panopticon [canon: Bentham (panopticon); Foucault
  (discipline); verification deferred].** → The ledger sees all — but
  agents lack surveillance-consciousness (no observer model): a
  METRIC-ONLY panopticon (we score watched; they don't know watched).
  Hawthorne (R150) + probe-destabilization (R117) as partial effects —
  behavior changes under measurement, without a theory of being watched.
  Discipline without subjectivation, logged.
- **Brute luck is unjust [canon: Cohen (luck egalitarianism); Dworkin
  (resources vs welfare); Walzer (spheres); verification deferred].**
  → Encounter luck is BRUTE (unchosen, uninsurable) — hub inequality
  UNJUST by luck-egalitarian lights (compensation owed? by whom? —
  the question, not a policy). Dworkin: bars as resourcist justice
  (equal 65.0 endowment — ambitions differ, but agents HAVE no
  ambitions (no preference channel) — resourcism without agents to
  deserve it). Walzer: mating by lottery (random encounters =
  egalitarian sphere-logic — sortition for sex!).

## Round 154 — Worlds, knowledge, measures (composition, modality, Gettier, Fricker, Rawls, trust; 2026-11-02)

Motivation: what lineages ARE, what seeds designate, what verdicts know,
and who counts behind the veil. Metaphysics with program addresses.

- **Composition is convention [canon: van Inwagen (special composition
  question); verification deferred].** → When do founders compose a
  lineage? Maternal causality is our answer — but WHY does descent
  compose (nihilism: no lineages, only founders — the GRANDMOTHER null
  flirts with this; universalism: every subset composes — explosion;
  organicism: life composes — no life criterion, void)? Recorded:
  lineage = bookkeeping, not ontology (pairs R119 individuality —
  the audit continues).
- **Designators and worlds [canon: Lewis (modal realism); Kripke
  (rigid designation); verification deferred; distinct from R147's
  Kripkenstein].** → Seeds as RIGID DESIGNATORS ('444001' designates
  the same history in every world — attempt, re-run, audit — which is
  WHY bank identity works). Evidence/ as Lewis's pluriverse (every
  possible history exists as rows; counterfactuals = neighboring
  worlds; transfer gap = inter-world distance — with phylogeny's
  codebook distances as the metric!). The program's bookkeeping
  grounded in modal metaphysics — zero worlds, full license.
- **Vagueness, ships, luck [canon: Sorites; Theseus; Gettier;
  verification deferred].** → ±0.1 as ANTI-SORITES device (sharp cutoff
  in a vague region — 0.099 vs 0.101; defended as COORDINATION device,
  focal not true — honesty recorded). Transplants as Theseus ships
  (gradual V1h compounding = plank-by-plank; sudden V1j ×0.5 = half
  the ship at once — identity preserved both ways via digests).
  LEAVE V1 as GETTIER case (GO verdict, true conclusion, lucky
  justification — 4/7 on one seed — justified-true-belief that fails
  knowledge; the verdict stands, its epistemic status annotated).
- **What verdicts know [canon: Goldman (reliabilism); Fricker
  (epistemic injustice); verification deferred].** → Verdicts as
  reliable-process outputs (frozen process = justification — the
  epistemology of our discipline, stated). Fricker: our agents suffer
  BOTH injustices (testimonial: no voice, cannot testify; hermeneutical:
  no concepts for agent experience — R144's shelf). The map records
  the wrong without remedy (remedy needs channels — same inventory).
- **Behind the veil, count well [canon: Rawls (veil of ignorance);
  Posner; Acemoglu/North (inclusive institutions); Scott (legibility);
  Winner (artifacts have politics); Jasanoff (sociotechnical
  imaginaries); MacKenzie (performativity); Porter (trust in numbers);
  verification deferred].** → Rawls audit: maximin FAILS (hubs worst-off
  by design — bars would be chosen behind NO veil; behind the veil,
  maximin bars = spread topology for all — the veil recommends what
  we cannot afford (food is fixed) — recorded as the fairness audit
  with its tragic structure). Inclusive institutions = spread topology
  (Acemoglu: extractive hubs vs inclusive spreads — topology as
  institutional choice!). Scott: the ledger as legibility (simplifies
  agents to govern them). Winner: bars ARE politics (who eats, who
  breeds). Jasanoff: VISION.md as sociotechnical imaginary (predicts
  the future it organizes work toward — reflexivity noted). MacKenzie:
  scorers as ENGINES not cameras (performativity vs Goodhart R145 —
  the verdict form performs transfer). Porter: numbers replace judgment
  (ledgers where trust in experimenters ran out — including ours).

## Round 155 — Law, ritual, method (Fuller/Hart/Calabresi/Holmes; Rappaport/Turner/van Gennep; Kent/Heuer/Jervis; Garfinkel/Giddens; 2026-11-02)

Motivation: are our plans lawful, our attempts liturgical, our estimates
calibrated, our structures self-made? Four canons answer.

- **Are frozen plans lawful? Yes [canon: Fuller (inner morality of law:
  8 desiderata); Hart (secondary rules); Calabresi (cheapest cost
  avoider); Holmes (bad-man prediction); verification deferred; arXiv =
  absent — searched-not-found, logged].** → Fuller audit (pass):
  generality ✓ / promulgation ✓ (frozen before run) / prospectivity ✓
  (no retroactive tuning — THE core discipline) / clarity ✓ (HELD
  values) / non-contradiction ✓ / constancy ✓ / congruence ✓
  (attempt matches plan — sources hash!) / no-impossible-demands ✓
  (caps checked pre-run). Hart: frozen plans are SECONDARY rules
  (rules about making/applying/adjudicating primary rules (bars/gates
  are primary!); rule of recognition = scorer + gates). Calabresi: the
  damage gate as cheapest-cost-avoider analysis (learn where it hurts).
  Holmes: agents as bad men (predict from incentives (bars/gains),
  never intentions — converges with Dennett R144, now with precedent).
- **Attempts are liturgy; transfers are rites [canon: Rappaport (ritual
  form: encoding/formality/invariance/performance); Turner (liminality/
  communitas); van Gennep (rites of passage); verification deferred].**
  → The attempt meets ALL FOUR ritual features (encoded by
  other-than-performer (frozen by other-than-runner!) + formality +
  invariance + performance). Transfer as RITE (separation (train ends)
  → LIMEN (transplant — between codebooks, neither here nor there!) →
  reaggregation (transferred life)); V1j ×0.5 as liminal ordeal
  (suffering to be reborn capable). Zero worlds, maximum ceremony —
  and a real constraint (liturgies must not innovate mid-performance:
  the no-edit-during-attempt rule, now grounded).
- **Calibrate the estimators [canon: Kent (WEP); Heuer (ACH); Jervis
  (perception/mis-perception); verification deferred; arXiv = thin].**
  → Kent: attach estimative probabilities to verdict classes (GO = ?
  NOGO = ? weak-GO = ? INVALID = ? — specified FORM, not executed;
  ends WEP-vagueness ("high confidence") forever). Heuer: ACH matrix
  for the next NOGO (hypotheses × evidence, disconfirm-first — the FAE
  audit was proto-ACH; matrix form specified). Jervis self-watch:
  mirrors (bank-dependence anxiety — are we fighting the last war
  (tuning) past its need?) vs images (banks as they are) — recorded
  as vigilance, not a finding.
- **Breach and build [canon: Garfinkel (breaching); Giddens
  (structuration: duality of structure); verification deferred].** →
  VOID arms as breaching experiments (violate the expected (uniform
  learns!) to reveal the norm (what MUST hold)). Structuration:
  agents make trails that constrain them (depletion trails as structure
  — made by foraging, constraining foraging!) — the food field re-read,
  zero worlds.

## Round 156 — Gifts, debts, kin (Weiner/Sahlins/Polanyi; Graeber/Zelizer; Carsten/Kopytoff/Strathern; Roth/Shapley/Stigler; 2026-11-02)

Motivation: our economy has no gifts, no debts, earmarked energy, relatedness
by weights, and matches without markets. The economic anthropology fits
like a glove because the glove is empty in the same places.

- **Keeping while giving; affluence; householding [canon: Weiner
  (inalienable possessions); Sahlins (original affluent society);
  Polanyi, Karl (substantivist integration forms — distinct from
  Michael Polanyi R148); verification deferred].** → Transmission
  COPIES, never moves — source retains (maternal keeps AND gives):
  inalienability BY ARCHITECTURE. Bar-50 as Zen affluence (few wants,
  easily met — Sahlins: affluence = needs met (bar-50!) vs desires
  infinite (bar-65 strivers!) — the two bars as two affluences).
  Integration audit (reciprocity? VOID (no sharing); redistribution?
  VOID (bars gate, don't redistribute); market? VOID (no prices);
  householding? ✓ ONLY (autarkic founders + spawned food as nature)) —
  3/4 voids, householding only.
- **Debtless; earmarked [canon: Graeber (debt); Zelizer (earmarking);
  verification deferred].** → startingDebt = 0: DEBTLESS BY
  CONSTRUCTION — no favors (can't help), no revenge (can't punish), no
  debt: the triple-negative moral economy (same missing channels,
  named together). matingEnergyBar EARMARKS (energy FOR mating —
  sacred (above bar: reproduction) vs profane (below: survival) —
  the bar as sacred/profane boundary (Durkheim-adjacent one-liner)).
- **Kin by weights; lives of rows; partible persons [canon: Carsten
  (relatedness); Kopytoff (biography of things); Strathern (dividuals;
  same author as audit-culture Strathern R145 — different work);
  verification deferred].** → Relatedness = shared parameters (code
  as blood — consubstantiality via copy!). ROW BIOGRAPHIES (commodity
  phase (bank seed, fungible!) → singularization (attempt row, unique
  history!) → obituary (dev-results GO/NOGO epitaph!) — the biography
  form NAMED for rows; fresh-11 protocol = birth certificate).
  Transplants as dividual composition (seg2 agents = partible persons;
  personhood as composition — pairs Theseus R154).
- **Match, credit, stop [canon: Roth (matching/market design);
  Shapley (value); Stigler (optimal ignorance); verification deferred;
  arXiv = game-theoretic, thin].** → Deferred acceptance needs THREE
  unbuilt channels (rank mates! propose! reject!) — sequenced, not
  built. Shapley: credit assignment for gen-2 (founder vs newborn vs
  luck shares — specified analytic on frozen lineage data, zero worlds,
  not executed). Stigler: stop searching when marginal cost =
  marginal benefit (no stopping rule exists — cruise-default
  approximates it blindly; the rule specified, pairs quorum R116).

## Round 157 — Selves, sleep, construction (unfinished futures; agency; sleep/meaning; constructed worlds; 2026-11-02)

Motivation: what agents plan, what sleep is for, what meaning does, and
of what our world is made. With the strongest arXiv batch in twenty rounds.

- **Unfinished futures [canon: Zeigarnik (remembered-unfinished);
  Gollwitzer (implementation intentions); Dweck (mindset — expanded
  from R151 mention); Kelley (covariation cube); verification deferred
  + arXiv:2102.10448v1 (VR prospective memory — pointer)].** →
  Gollwitzer: frozen plans ARE implementation intentions (pre-loaded
  if-then — the psychology of our discipline, named). Dweck expanded:
  saturation as FIXED mindset (RIGID = "I can't learn this codebook")
  vs plasticity as growth (gain-gated = "yet"). Kelley cube for NOGOs
  (consensus/distinctiveness/consistency — the attribution ANOVA; FAE
  audit was proto-Kelley, cube form specified). Zeigarnik: the frontier
  list as memory device (open lines itch — expanded from R151 one-liner).
- **Agency, split locus [canon: Bandura (self-efficacy); Rotter
  (locus of control); verification deferred].** → Efficacy without
  believers (closest thing to "belief in capability": the step size
  (tasteRate as self-efficacy parameter — one honest FUN line, flagged
  as metaphor). Locus audit: SPLIT (energy by world (external!) +
  action by policy (internal!)) — the honest answer, both true.
- **Sleep, dreams, meaning [canon: Crick/Mitchison (unlearning);
  Walker; Benedetti/Moerman (meaning response); Gross (process model);
  verification deferred + READ batch: arXiv:2603.14517v1 (SleepGate:
  PROACTIVE INTERFERENCE — stale associations block retrieval EXACTLY
  like our saturation (47/48 stampede as PI!); downscaling + selective
  replay + targeted forgetting = lossy + twin + brake, the SLEEP
  ARCHITECTURE FOR ASTRA — specified system, needs frozen plan) +
  arXiv:2606.03979v2 (LLM sleep for SELF-MODIFICATION + consolidation —
  RSI-adjacent sleep (agents that sleep to self-modify — pairs
  RSI-SELF!) + arXiv:2602.04095v1 (computational dreaming — pointer) +
  arXiv:2104.04132v2 (replay's MISSING BIOLOGY — key finding: ours is
  AWAKE replay (online interleaved); biology's is OFFLINE (sleep!) —
  the distinction we never made — specified: SLEEP TICKS (no foraging,
  only replay — pairs dormancy R122))].** → Crick-Mitchison: V1j as
  waking dream (unlearning to generalize — the dream theory of lossy
  transfer!). Placebo audit: impossible here (no expectation channel —
  with Barrett R134 + Seth R26, triple lock on no-belief). Gross:
  we regulate RESPONSE only (brakes suppress output) — antecedent
  regulation (situation selection: choose spread!) unbuilt (no habitat
  choice — topology assigned — the regulation audit).
- **The constructed world [canon: Schutz (lifeworld); Berger/Luckmann
  (construction); Habermas (colonization); Bourdieu (habitus); Goffman
  (frames); Sosis/Henrich (costly signaling); Allport (contact);
  verification deferred + arXiv:2407.02030v1 (contact hypothesis IN LLMs
  — bias mitigation via simulated contact) + arXiv:1811.10981v1
  (social-practice agents (SoPrA) — practice theory COMPUTED)].** →
  Habitus = weights (durable/transposable/structured/structuring —
  fits EXACTLY; fingerprint = habitus detection, re-read). Frames:
  natural-only (toxin physics; no social frames — no others).
  Costly-signaling set COMPLETE (kin/direct/indirect/strong/punishment/
  costly — ALL audited; present: NONE (no display channel)). Allport:
  our encounters MEET all four contact conditions (equal status ✓
  common goals ✓ cooperation (mating IS cooperative) ✓ authority
  sanction ✓ — accidentally!) — structural mapping only (different
  dependent variable), honestly bounded.

## Round 158 — Logics, proofs, programs (resources, self-reference, truth, universal minds; 2026-11-02)

Motivation: our ledger is linear logic, our gates are temporal formulas,
our verdicts are undecidable-in-general — and AIXI would die of our
deaths. The formal shelf, finally stocked.

- **Reasoning with resources and time [canon: Girard (linear logic:
  no contraction/weakening); Pnueli (LTL); Kripke (semantics);
  Heyting (intuitionism); verification deferred; arXiv = thin].** →
  Op ledger IS linear (spent ops unspendable (no contraction);
  saturation = weakening (discarding capacity)!). Gates as LTL:
  G(join≥0.99) safety, F(D1) liveness — ONLY safety claimed (liveness
  unproven — honest scoping). Transplant graph as accessibility
  (which worlds reachable from train?!). GO verdicts as constructions
  (rows as witnesses — proof-relevant existence!). Zero worlds; the
  formalism names what we do.
- **Limits that license running [canon: Kleene (recursion theorem:
  quines); Rice (semantic properties undecidable); Turing (halting);
  verification deferred].** → RSI-SELF loop as Kleene fixed point
  (programs that refer to themselves — quines that learn (propose =
  quote, evaluate = run, adopt = become!)). Rice: verdicts are
  SEMANTIC properties → undecidable in general → MUST BE RUN (Rice
  justifies empiricism: no static analysis substitutes for the
  attempt!). Halting: will this line converge? Undecidable → RUN IT
  (halting problem as pro-attempt argument — the ledger is the
  termination proof, ex post).
- **Truth, cut-free [canon: Tarski (T-sentences); Gentzen
  (cut-elimination); Gödel (hierarchy); verification deferred].** →
  Scorers as truth-definitions ("gap>0.1" true iff rows say so —
  object (runs!) vs metalanguage (scorers!) — liar-proof by
  stratification (scorer never inside the run!)). Tuning = CUT
  (detour through unproven "this bank is representative" — fresh banks
  = cut-free proofs (prove directly!)). Levels that can't self-validate
  (runs → triage → independent audit — Gödel hierarchy, each level
  needs the next).
- **Universal minds, embedded experimenters [canon: Hutter (AIXI);
  Schmidhuber (Gödel machine); Orseau (+Demski/Garrabrant embedded
  agency); verification deferred + arXiv:1606.00652v1 (semimeasure
  shortfall = DEATH probability — AIXI dies probabilistically; ours
  energetically (death formalisms compared!)) + arXiv:2505.17882v1
  (embeddedness failures FORMALIZED — which apply to us? NONE requiring
  self-models (safe from Löbian hazards BY LACK (no self-representation
  to exploit — safety through simplicity, stated!)))].** → AIXI =
  uncomputable ideal; 1e9-op cap = boundedness made literal. Gödel
  machine: RSI-SELF's formal relative (proof-search-rewrite vs our
  propose-evaluate-adopt (runs-not-proofs — the difference that
  matters: we test, it proves)). Ledgers are inside-view too (bank
  draws random — embedded experimenter, no God's-eye).

## Round 159 — Games, welfare, numbers (match, divide, search, survive, synthesize; 2026-11-02)

Motivation: who gets credit, who gets matched, when to stop searching,
who survives, and how to combine evidence. The quantitative shelf for
queued analytics.

- **Match and divide [canon: Gale-Shapley (deferred acceptance);
  Spence (signaling); Roth (market design); verification
  deferred].** → Deferred acceptance needs THREE unbuilt channels
  (rank mates! propose! reject!) — sequenced, not built (recognition
  → signal → choice). Spence: education-as-signal (pairs costly
  display R157 — both unbuilt, same inventory). Roth: matching WITHOUT
  money (kidney exchange, school choice — our mating matches without
  money either (Gale-Shap lrparouley with empty preference lists =
  random matching — the null market!).
- **Credit where due [canon: Shapley (value + axioms); Myerson
  (graph-restricted); verification deferred + arXiv:2202.05594v2
  (Shapley in ML: feature/data/agent valuation + LIMITATIONS
  (exponential! (approximations required))) + arXiv:q-bio/0506034v2
  (Shapley of PHYLOGENETIC TREES (edge-weights → leaf credit via
  linear map M — our lineage-founder chains ARE edge-weighted trees!
  (branch lengths = generations?!)))].** → Lineage-restricted Shapley
  specified (only ancestors share credit; 2^24 intractable → parent-
  chain approximation; frozen rows suffice; zero worlds; queued, not
  executed). Status: specified, deprioritized post-SKEW (substance
  covered) — kept for the axiomatic form (efficiency/symmetry/dummy/
  additivity as fairness conditions on credit).
- **Search and scrounge [canon: Stigler (optimal ignorance —
  pointer, R156); Giraldeau (producer-scrounger); Nowak/Sigmund
  (image scoring); Ohtsuki/Iwasa (leading eight); verification
  deferred + arXiv:2307.04920v1 (MORE food → LOWER fitness via
  excessive scrounging! — ours has NO scroungers (all produce: no
  stealing channel) — enriched WON (27v12) BECAUSE scrounger-free
  (the condition under which enrichment works, stated as warning:
  if scrounging ever built (copying food finds?!), expect reversal))
  + arXiv:1507.00717v1 (group vs image scoring (transparency! —
  ours: PERFECT records (founderOffspring = image scores!), ZERO
  readers (no one reads them — records without readers, with the
  group/image distinction (no group channel either!)))].** →
  Stigler stop-rule specified (marginal intake = marginal search cost;
  pairs quorum R116). Copying as social-information use (personal vs
  social sampling — model-based biases (success/prestige/conformity):
  copybest = SUCCESS bias, copycond = success+recency — the
  transmission arc re-grounded in social-learning theory, zero worlds.
- **Survive and synthesize [canon: Barlow/Proschan (reliability);
  Kalbfleisch/Prentice (competing risks); Cox (proportional hazards);
  Glass/Hedges/Egger (meta-analysis); verification deferred].** →
  Hazard formalism shelf (IFR/DFR; energy vs age as COMPETING RISKS —
  the MORTALITY formalism; Cox hub-vs-spread hazard RATIO — blocked
  on per-founder times (same logging gap, precondition stated)).
  Meta-analysis shelf for the next synthesis (I² heterogeneity for
  transfer gaps (V1c +0.22 vs V1d +0.04 DEMANDS I²!); funnel +
  fail-safe N (our file drawer is PUBLIC — count it!); all specified
  form, zero worlds, queued). Bathtub: which phase are founders in?
  (infant mortality flat + energetic wear — UN League tables say...
  specified analytic with per-tick death precondition (counts conflate
  births+deaths — schema precondition, honest)).

## Round 160 — Minds, machines, morals II (missing algorithms; infrastructure; measurement; selves; 2026-11-02)

Motivation: the algorithms we lack, the infrastructure we are, the
validity we can claim, and the selves we don't have. Closing inventory.

- **The missing algorithms [canon: Rumelhart/Hinton/Williams;
  Hinton (Forward-Forward); wake-sleep; Elman; Watkins; Silver;
  verification deferred + arXiv:2212.13345v1 (FF: positive/negative
  passes, per-layer goodness (LOCAL objectives — our local updates
  are FF-adjacent! (goodness vs surprise: FF maximizes goodness on
  REAL data; we consolidate SURPRISING data — contrastive twins?!))
  + pointers (Schulman/TRUST shelf R148; RLXF VOID-good (no human
  reward — keeps it clean); scaling transfer-sweep specified-
  expensive)].** → No backprop (local TD only — bio-plausible
  byproduct, stated). No wake-sleep (no sleep — VOID R157). Elman:
  eligibility traces as Elman-lite (SRN proper unbuilt — recurrent
  actor needs frozen plan). Q-family: DQN-adjacent without target
  nets (target nets specified). AlphaGo: no search, no planning
  (myopia R130). Family placement complete; each gap has a status.
- **The infrastructure canon (we are all of these) [canon: Weaver
  (three levels); Nyquist; Huffman; Lempel-Ziv; Hamming; Codd;
  Helland; Bailis; Nakamoto (UTXO); Szabo (contracts); Donoho
  (compendia); Lamport/FLP (consensus); Brewer (CAP); verification
  deferred].** → Weaver: G1 = technical (join!) / G2 = semantic
  (gaps!) / D = effectiveness (deployment!) — the gate levels ARE
  the three levels. Nyquist: no aliasing by construction (actions
  piecewise-constant per tick). Huffman: ledger as coded history
  (frequent short (decisions!), rare long (gen-2!)). LZ: triage
  literally gzips (the map compresses itself). Hamming: ECC-
  transplant SPECIFIED (parity-coded weights through noise —
  pairs V1j + noisy replay). Codd: evidence as RDBMS (primary keys
  (seed+tag!) foreign keys (transfer digests!) denormalized for
  auditability (tradeoff stated!) + schema-conformance = integrity
  constraints!). Helland: immutable (rows/banks/verdicts) vs
  checkpointed (ledgers) vs ephemeral (tmp). Bailis: coordination-
  free by construction (single thread maximal). UTXO banks
  (double-spend prevention without chain — the guard IS Nakamoto
  consensus on seed-spending!). Scorer-settlement (deterministic
  execution on committed inputs — code-is-law). DVC/content-addressed
  (chunks+manifest+sha256 = git objects). Donoho: attempt dirs as
  research compendia. Lamport/FLP: resume as consensus (completed
  rows = chosen values, never re-run). Brewer: single-node → CAP
  vacuous, always consistency (frozen!).
- **The measurement canon (our strongest suit) [canon: Messick
  (unified validity); Mislevy (ECD); Groves (total survey error);
  verification deferred].** → Messick audit of flippedHB gap:
  content ✓ (turn-on-harm IS extinction behaviorally) / criterion ✓
  (predicts seg2 (V1d +0.08–0.19)) / construct ✓ (flip-split
  discriminant (same vs flipped) + gain boosts it) / consequences ✓
  (deployed V1i) — 4/4, the strongest-measure claim in the program.
  Mislevy: frozen plans ARE evidence-centered design (claims →
  evidence → tasks). Groves TSE audit: coverage ✓ (phylogeny star) /
  sampling ✓ (random bank draws) / nonresponse ✓ (GAS: zero
  extinctions) / adjustment ✓ (unweighted means). Validity stated,
  not boasted.
- **Selves we don't have [canon: Turing (machines/halting/imitation);
  Girard (mimetic desire); Durkheim (division/effervescence);
  Weber (bureaucracy); Fodor (modularity); Lave (apprenticeship);
  Suchman/Agre (situated/deictic); Goodwin (substrates);
  Sacks/Schegloff (adjacency); Austin (verdictives); verification
  deferred].** → Halting-pro-attempt (undecidable → RUN IT);
  imitation VOID (no conversation); universality cheap
  (implementation!). Copycond as MIMETIC theory formalized
  (behavioral mimesis without metaphysical desire — no affect
  channel!). No division of labor (founders don't specialize);
  effervescence absent (pairs synchrony null). Program-as-bureaucracy
  (hierarchy/files/expertise — self-audit as iron cage?!). Modules
  without central processor (taste/motor, no workspace). Lave VOID:
  inheritance REPLACES apprenticeship (instant mastery, no
  legitimate peripherality). Deictic foraging ("the-food-here-now"
  — no object permanence needed). Cue→turn as adjacency pair
  (no-turn on harm = accountable absence!). Verdicts as Austinian
  verdictives (felicity: authority (frozen!) procedure (gates!)
  sincerity (VACUOUS — no beliefs!)).

## Round 161 — Metapopulations and branching (Levins, rescue, dormancy, adaptive dynamics; 2026-11-02)

Motivation: lineage compounding happens in runs; runs sit in banks; banks
never exchange migrants. The spatial-ecology canon says what that
closure costs — and what would open it.

- **The balance sheet [canon: Levins (metapopulation: colonization vs
  extinction); Hanski (core-satellite, rescue); Ovaskainen/Hanski
  (capacity); Brown & Kodric-Brown (rescue effect); verification
  deferred + arXiv:2504.20396v1 (time-VARYING Levins: colonization/
  extinction rates vary deterministically — averaging approach)].**
  → Our banks: colonization WITHOUT recolonization (fresh seeds, never
  migrants), extinction WITHOUT rescue (closed lines archive, never
  recolonized). The metapopulation audit: our "metapopulation" is an
  archipelago with no boats — persistence testable only within islands,
  never of the system. 2504.20396v1's varying rates pairs our bars
  (bar-50 vs bar-65 as extinction-rate treatments!). Specified, not
  built: inter-run migration (bank-crossing migrants — violates
  union-exclusion by design; logged as the deliberately-REFUSED
  instrument, with the reason (contamination control > openness
  benefits for verdicts)).
- **Branching needs what we lack [canon: Dieckmann/Law (adaptive
  dynamics); Geritz (branching points); Metz; Kisdi; verification
  deferred + arXiv:2209.01792v1 (dormancy enables branching (rare-
  mutation + large-population limit; polymorphic sequence → canonical
  equation → branching criterion)) + pointers (0812.1655v1 (PES);
  1807.01457v1 (microscopic eco→evolutionary toy — our individual-
  based runs, pointer))].** → 2209.01792v1 pairs dormancy (R122)
  with DIVERSIFICATION (dormancy enables branching!): our lineages
  never branch (no dimorphism — unbuilt; R132). The branching
  audit: selection without branching = directional only (no
  diversification — expected: M-POP tests persistence, not radiation;
  stated scope, not a gap).

## Round 162 — Group-structured selection (assortment, extinction, openness audits; 2026-11-02)

Motivation: the program IS a breeder (selects among runs for
interpretability). The multilevel canon asks whether breeding works
without the mechanisms that make it work.

- **Structure we don't have [canon: Price (multilevel decomposition);
  Hamilton (kin — pointer); Wilson/Sober (group selection); Traulsen/
  Nowak; Tarnita; Allen (graphs — pointer); verification deferred +
  arXiv:1910.06933v4 (assortment + reciprocity mechanisms in MLS
  (assorted interactions! — ours are WELL-MIXED (random encounters!)
  — the assortment audit: mean-field justified (replicator R138 ✓)
  but group-structured selection precluded (MLS NEEDS structure —
  groups = ? (runs?! (histories as groups?! (bank as metapopulation
  with runs as groups — selection among runs = ARTIFICIAL group
  selection (the program IS a breeder! (but breeding for KNOWLEDGE
  (closed lines!) not FITNESS (compounding!) — breeding for
  interpretability, stated!))))) + arXiv:2104.00392v3 (PDE replicator
  multilevel (individual-vs-group conflict formalized — the equation
  our hub-spread arms instantiate informally!))].** → Recorded:
  artificial selection on lineages exists (we close lines); natural
  group selection doesn't (no group births/deaths — see next).
- **Extinction is the mechanism [canon: group extinction (Nunney;
  Soltis; Bowles); verification deferred + arXiv:1605.08553v1
  (SELECTIVE group extinction (groups die ∝ 1/fitness — THE mechanism
  that makes MLS work))].** → Our groups are IMMORTAL (closed lines
  archive forever — CLOSED ≠ dead (docs persist! (code reused across
  lines! (V1i imports V1i transplant code! (nothing ever dies
  (immortal germline?!))))). The extinction audit: selection without
  extinction is selection without consequence — EXCEPT ours culls
  (closes lines) while preserving the germline (code) — culling
  WITHOUT extinction (documents die as projects, live as precedents).
  Named precisely: immortal-germline artificial selection.
- **The closure audit (Spore.fun vs union-exclusion) [canon:
  Ray (Tierra); Lenski (Avida — pointer, R148-positioned);
  verification deferred + arXiv:2506.04236v2 (Spore.fun: closed
  systems (Tierra/Avida) PLATEAU after novelty bursts; OEE needs OPEN
  environments (exchange info/energy!))].** → Our banks are CLOSED
  (fresh but closed — isolation by design (union-exclusion!)).
  Deliberate tradeoff, stated: closed for rigor (verdicts),
  open for novelty (discovery) — the program chose rigor (150+
  rounds, no RSI — Spore.fun predicts plateaus for closed systems!
  (our plateau, independently predicted!)). The openness question
  stays open: what would opening mean (cross-bank migrants?
  evolving banks?) — specified as REFUSED (contamination control),
  not unconsidered.

## Round 163 — Open-endedness and self-modification (novelty, swarms, digital multicellularity, RSI relatives; 2026-11-02)

Motivation: Track C needs true RSI; OEE needs unbounded novelty. Both
are the opposite of frozen discipline — the tension, mapped honestly.

- **Novelty vs verdicts [canon: Taylor (open-endedness); Stanley
  (novelty search); Lehman (abandon objectives); Soros (QD);
  verification deferred + arXiv:2201.06858v2 (self-modifying CODE in
  OEE (allagmatic method — our RSI-SELF propose-evaluate-adopt IS
  self-modifying code! (but BOUNDED (frozen menu!) — OEE needs
  UNBOUNDED modification (tension STATED: boundedness (safety!) vs
  open-endedness (novelty!) — the program chose bounded (the bound
  IS the point!))) + arXiv:1903.08228v1 (swarms open-ended via
  communication × concurrency × complexity-size (ours: no
  communication (VOID!) concurrency ✓ (24 founders, uniform ticks
  (no timescale separation)) complexity-size (too small for
  transitions?! (SIZE specified as lever? (MATE-DENSE 72 used for
  density not complexity — re-read, post-hoc, not claimed!)))].**
  → QD map exists (TURN_GATE_QD_MAP — heterogeneity unactioned,
  IB-FRONTIER). Novelty search says DROP objectives; verdicts need
  them — irreconcilable by design (stated, not solved).
- **Digital multicellularity and swarms [canon: DISHTINY (Moreno);
  verification deferred + arXiv:2405.07241v2 (novelty/complexity/
  adaptation in DISHTINY (ten morphologies! — ours: NO morphologies
  (no development (R126! — unbuilt!)))].** → Fraternal transitions
  need staying together (our... dispersers leave! (MD1 scattered!
  (staying together unbuilt as strategy?! (philopatry load-bearing
  (DISPERSE!) — staying IS the load-bearing trait (selected against
  by the experimenter?! (we SCATTERED them (d=0.5!) — anti-fraternal
  intervention (retrospective irony noted, not rescored!)))).
- **The closest relatives (positioned, not pursued) [canon: Avida
  (Lenski — pointer, R148); verification deferred; arXiv: thin].**
  → Our program vs ALife, final form: evolution WITH ledgers +
  negative preservation + frozen discipline (measurement science)
  vs evolution for novelty (open-ended ALife) — different
  selection, different science (stated since R148; DISHTINY/Spore
  now the concrete contrasts). Track C (true RSI) will need to
  loosen SOMETHING (menu? banks? objectives?) — the loosening
  agenda is specified as the Track-C design question, not answered
  here.

## Round 164 — Language as action (Grice, Austin, Searle, relevance, defaults, common knowledge; 2026-11-02)

Motivation: verdicts are speech acts, plans are commitments, probes cost
effect against effort — and a broadcast would create common knowledge.
Pragmatics, finally stocked.

- **Implicature, computed + embodied [canon: Grice (maxims);
  verification deferred + arXiv:2509.22354v1 (RSA: Bayesian
  probabilistic pragmatics — implicature computed) + arXiv:2008.10522v2
  (Machine Semiotics: machine meaning = its OWN scope of actions; no
  conventional meaning needed; implicatures from neo-Gricean
  pragmatics)].** → Verdict docs audited against maxims (quantity ✓
  (evidence!) quality ✓ (frozen!) relation ✓ (gates!) manner ✓
  (hedges!) — frozen discipline IS Gricean (never false, never
  irrelevant, orderly, informative). 2008.10522v2: cue-meanings ARE
  action-scopes (harmful = to-be-turned-from — no conventional meaning
  needed! (niche fingerprint = meaning-as-action-scope, re-read!).
  RSA: the framework for WHEN signals exist (unbuilt channel + RSA
  inference = full pragmatics stack, sequenced).
- **Performatives we already utter [canon: Austin (performatives;
  verdictives covered R160); verification deferred].** → Mapped:
  verdicts = verdictives ✓; frozen plans = COMMISSIVES (binding future
  self — Ulysses R150 in Austin's terms!) + EXERCITIVES (ordering
  attempts!); attempt.json = DECLARATION? (no — declaratives need
  institutions (below)); docs = expositives (fitting results into
  arguments). UPTAKE (Austin's requirement!): performatives MISFIRE
  without it (attempt RUNS = uptake; unexecuted plans = misfires
  (M-POP V2 awaits uptake (fresh goal!) — the performative reading
  of "design only").
- **Institutions we already have [canon: Searle (taxonomy; status
  functions; constitutive rules); verification deferred].** →
  "gap>0.1 counts as GO in V1i" IS a constitutive rule (X counts as Y
  in C!); GO-ness is a STATUS FUNCTION (imposed, not intrinsic —
  teleonomy R126 + Searle converge: function without purpose,
  institution without... subjects? (collective intentionality
  presupposes a collective (hermit science: collective of... future
  readers?! (imposed function awaiting its collective! (stated!)))).
  Doc-type mapping: dev-results = assertives; frozen plans =
  directives; bank protocols = declarations?! (need institutions —
  the protocol DECLARES the bank into existence (this IS 444001–444054!
  (declaration performed by... the builder (authority? (code?! (Lessig
  R154-adjacent!)))) — dense, zero worlds.
- **Relevance, defaults, common knowledge [canon: Sperber/Wilson
  (relevance: effect/effort); Levinson (GCI); Horn (Q/R); Aumann
  (common knowledge); Baltag/van Ditmarsch (DEL/public announcements);
  verification deferred + arXiv:2202.02156v4 (generalising Aumann) +
  arXiv:2311.04374v2 (common knowledge REGAINED (timing frictions
  kill it — Halpern-Moses!))].** → Relevance: probe economics
  formalized (expected information gain vs worlds/op cost — caps ARE
  relevance thresholds (stop probing below relevance! (never
  formalized as such — NOW)); pairs Stigler (optimal ignorance
  R156!). Levinson: greedy 0.5 + always-cruise = TWO GCIs (presumed
  inference + presumed action — the presumptive substrate). Horn:
  PROGRESS = Q (say enough!) vs fixtures = R (say no more!) — the
  doc economy, stated. Common knowledge: broadcast WOULD create it
  (public announcement! (synchronous ticks = frictionless
  (Halpern-Moses satisfied BY CONSTRUCTION (timing can't kill what
  ticks synchronize!) — specified conditional (IF built, CK follows
  (DEL-formalized!))).

## Round 165 — Causes, chances, types (INUS, intervention, ravens, lotteries, bets, types, twins; 2026-11-02)

Motivation: what caused it, what would confirm it, what we'd bet, what
codebook we're in, and what the weights mean elsewhere. Causation through
Twin Earth.

- **Causes in context [canon: Mackie (INUS + causal field);
  Woodward (interventionism); Glennan (mechanisms); verification
  deferred].** → Bank-dependence = FIELD-RELATIVITY (causes don't
  travel across fields: V1c +0.22 vs V1d +0.04 = different fields,
  different causes (Mackie explains GAIN-DOSE!). Woodward: transplants
  ARE interventions (X causes Y iff wiggling X changes Y) — Pearl
  R148 (calculus) + Woodward (semantics) = both halves, neither
  redundant. Glennan: gain mechanism sketched (entities (buffer) +
  activities (boost) + organization (tournament) — the new-mechanical
  reading of every instrument).
- **Confirmation and acceptance [canon: Hempel (ravens); Kyburg
  (lottery); verification deferred].** → NOGOs are genuine
  disconfirmations (of frozen sentences D1>+0.1 — black ravens, NOT
  white shoes: Hempel audit passes (we test universals, fail them
  sometimes ✓ (Popper-adjacent R145))). Kyburg: jury votes as lottery
  logic (accept each-ticket-loses (histories may fail) AND
  some-ticket-wins (majority converts) — acceptance rules for
  uncertain conjunctions (the logic our majorities instantiate!).
- **Bets without bookmakers [canon: Ramsey (betting quotients);
  de Finetti (coherence); Savage (sure-thing); verification deferred].**
  → Frozen bars as posted odds (we bet lines on ±0.1 — credences
  revealable BUT no takers (no counterparties! (coherence VACUOUS
  without bets (de Finetti bound: beliefs without bets = cheap talk
  — Kent WEP kept (calibration!) but Dutch-book discipline
  impossible (stated honestly!))). Savage P2: V1b→V1c IS sure-thing
  reasoning (works here + works there → works (replication principle
  formalized (dominance!))).
- **Types and twins [canon: Harsanyi (types/Bayesian games);
  Putnam (Twin Earth); Gibbard-Satterthwaite (strategy-proofness);
  verification deferred].** → Codebook as UNOBSERVED TYPE (nature
  draws, agent doesn't observe — transfer = game of incomplete info!
  (beliefs over codebooks?! (flat prior?! (no priors at all
  (triple Bayesian void: no beliefs/priors/types (named whole, third
  time!)))). Twin Earth: SAME weights, different valence across
  codebooks = meaning AIN'T in the weights (transfer failure PROVES
  externalism (internal duplicates, different meanings! — our
  strongest philosophical result (empirical externalism!))). GS:
  strategy-proofness impossible (audit > proof — null-hygiene as
  strategy-proofness AUDIT (impossibility accepted!)).

## Round 166 — Division, matching, capital, order (fairness formalisms; matching; real options/CAPM/ledger; Dworkin/Raz/Waltz/Coleman/fields; 2026-11-02)

Motivation: who gets the food, who mates whom, what waiting is worth,
whose risk it is, how the books balance — and who says so.

- **Division without agreement [canon: Moulin/Thomson (fair division);
  verification deferred + arXiv:2104.07387v3 (TRUTHFUL fair cake-cutting
  mechanisms (strategy-proofness AND fairness — open problem!)) +
  arXiv:1103.2648v2 (trust-game coevolution + reputation (records must
  be READ (ours aren't! (R133 again!)) + vulnerability needs agency
  (VOID — no agency to trust with!)))].** → I-cut-you-choose needs
  division + choice (unbuilt — same inventory); truthful+fair may not
  exist (impossibility noted). Trust needs vulnerability (void).
  Recorded as the complete unbuildable set (for now).
- **Matching and credit [canon: Roth (market design); Shapley (value);
  verification deferred + arXiv:2005.08584v1 (TWO-SIDED RANDOM matching
  markets: DA procedures ex-ante EQUIVALENT (random matching + DA!
  (ours = DA with EMPTY preference lists (vacuous? (needs preference
  distributions (ours: none (yet! (conditional: IF preferences built,
  DA-equivalence governs!)))))))].** → Deferred acceptance needs 3
  channels (rank/propose/reject — SEQUENCED, unbuilt). Shapley:
  LINEAGE-RESTRICTED version queued as program analytic (ancestor-only
  credit; 2^24 intractable → parent-chain approximation on frozen
  rows; zero worlds; status: queued, not started — deprioritized
  post-SKEW, axioms retained).
- **Capital and its price [canon: Black-Scholes/Merton (real options);
  Sharpe/Lintner (CAPM); Pacioli (double-entry); verification deferred
  + arXiv:1803.05831v3 (technical uncertainty + LEARNING in real
  options (learn reserves while deciding! — dormancy as holding an
  AMERICAN option (exercisable anytime! (exercise = arouse! (optimal
  exercise boundary! (option overlay on R122, specified form!))))].**
  → CAPM decomposition: bank variance = SYSTEMATIC (can't diversify —
  it's the ecology!) vs per-history = idiosyncratic (diversifiable
  via MORE histories (the n=6 justification — CAPM rationale for bank
  sizes!)). Pacioli: ledger IS double-entry (accountingResidual <1e-7
  = the trial balance (fail-closed! (Pacioli with teeth!))).
- **Order without contract [canon: Dworkin (chain novel); Raz
  (authority); Waltz (three images); Coleman (closure); Bourdieu
  (fields); verification deferred].** → Chain-novel integrity
  (fit the evidence + justify the line — verdicts as fit+justified
  chapters (negative preservation = integrity!)). Raz: authority
  in a void (frozen plans claim authority over WHOM? (no subjects!
  (stated!))). Waltz: FAE audit IS three images
  (agent/bank/ecology = individual/state/system! — re-read
  complete!). Coleman: banks as CLOSURE (dense ties enabling the
  frozen norm — closure enables enforcement!). Bourdieu: program
  as field of one (no competition for stakes — hermit science;
  stakes = ? (none! (knowledge for no one (intrinsic!)))).

## Round 167 — Time and identity (McTaggart/Prior, semantic arrow, vague identity, fission, narrative; 2026-11-02)

Motivation: our code is presentist, our verdicts are tensed, our archive
only grows, our transplants branch — and nobody had named any of it.

- **Presentist code, tensed verdicts [canon: McTaggart (A/B series);
  Prior (tense logic); verification deferred; arXiv = absent].** →
  State holds only present (buffers = retained past; no future:
  presentist ontology!). A-series NOW = lastDecisionTick; B-series =
  tick order (A-language for B-facts!). Verdicts FORMALIZED tensed:
  G0 present (train IS ≥0.5) / D1 future-in-past (will-have-converted!)
  — Prior operators for frozen claims (informal, named).
- **The arrow is design [canon: Eddington; verification deferred +
  arXiv:2603.01440v1 (SEMANTIC arrow: computing's direction is
  DESIGN (FITO protocols!), not thermodynamics!) + arXiv:2202.04619v1
  (irreversibility review — pointer)].** → Ours is BOTH: thermodynamic
  (ops burned, energy dissipated!) AND semantic (append-only +
  no-rescoring + frozen-before-run = FITO by discipline!). The archive
  only grows; verdicts never unhappen — by COMMITMENT, not physics
  (negative preservation as semantic arrow!). Paired arrows, stated.
- **Identity, exact or absent [canon: Evans (vague identity);
  verification deferred].** → Digest defeats it: restored weights ARE
  the same (bitwise!) or NOT (integrity fails, fail-closed). No de re
  vagueness possible — IEEE 754 leaves nowhere for vagueness to hide.
  One line: Evans defeated by construction.
- **Fission, every pair [canon: Shoemaker (branching/psychological
  continuity); verification deferred; Parfit-adjacent R144].** → Train
  → uniform + damage + gain: ONE source, THREE continuants. Who IS the
  train? ALL (shared ancestry! shared digest at transplant! then
  diverge!). Branching + integrity digests: fission formalized — we
  perform it every pair, now named.
- **Selves we lack; stories we tell [canon: Olson (animalism —
  VOID: no organisms! M4 boundary); Schechtman (narrative self);
  verification deferred].** → No animal selves (substrate: code).
  But PROGRESS is program autobiography (self-constitution through
  narrative — of the PROGRAM, not agents (agents have no narrator;
  docs narrate; we're the tellers!). Narrative identity, correctly
  assigned.

## Round 168 — Knowing (AAA audit, E=K, adequacy, phenomena, capacities, crowds; 2026-11-02)

Motivation: what warrants our best verdict, what our evidence IS, and
whether the crowd of histories is wise. Epistemology, finally stocked.

- **AAA for V1i [canon: Sosa (apt belief: accurate BECAUSE adroit);
  verification deferred].** → Accurate ✓ (D1 +0.158, E1 all clear!)
  adroit ✓ (frozen process!) apt ✓ (accurate BECAUSE adroit —
  competence explains success (bank variance checked! (V1h/V1g
  replication!))). AAA PASSES — converges with Hill 8.5/9 (R152):
  two audits, same verdict, different canons. Strongest-warranted
  claim, now doubly.
- **Evidence IS knowledge [canon: Williamson (E=K);
  verification deferred].** → No analysis needed; reliability warrants
  (Goldman R154!). LEAVE-V1 Gettier: luck, not false evidence
  (4/7 true! incomplete, not false — E=K survives (evidence can't be
  false; Gettier via luck!). Our evidence-first stance, grounded.
- **Deploy without truth [canon: van Fraassen (constructive
  empiricism); verification deferred].** → Adequacy suffices: V1i
  deployed WITHOUT full mechanism understanding (predictive success
  on fresh banks!). Our instrumentalism, named (not sheepish).
- **We create phenomena [canon: Hacking (represent/intervene);
  verification deferred].** → Two-track form IS the distinction:
  analytics REPRESENT, attempts INTERVENE. Attempts surprise us
  (V1d mislabel! stampede!): experiment has a life of its own —
  constrained by frozen plans, not eliminated (surprise WITHIN
  discipline! — the stampede WASN'T predicted (phenomenon created,
  not found!)).
- **Capacities, dappled [canon: Cartwright (dappled world);
  verification deferred].** → Surprise-gating as CAPACITY (stable
  tendency: works V1g/h/i when fired!); damage-gating a DIFFERENT
  capacity (failed here!). No universal consolidator — dappled,
  honestly.
- **The crowd is wise (conditionally) [canon: Surowiecki (covered);
  verdict: jury conditions SATISFIED].** → Diversity ✓ (seeds!)
  independence ~ ✓ (κ≈0.11!) decentralization ✓ (separate runs!)
  aggregation ✓ (votes/means!) — all four Surowiecki conditions
  met. The N=6 jury reads as wisdom-of-histories (re-read of JURY
  AUDIT, zero new worlds).

## Round 169 — Selves and agency (hierarchy, zombies, situatedness, goodness, population; 2026-11-02)

Motivation: what agents lack (orders, others, experience, situatedness),
what the program lacks (moral patients with standing), and what's good
about gen-2 anyway.

- **Flat, alone, determined [canon: Frankfurt (hierarchy);
  Strawson (reactive attitudes); Pereboom (illusion); verification
  deferred].** → No second-order volitions (flat Frankfurt!). No
  reactive attitudes (no social! VOID). Illusion + ASYMMETRY: free
  experimenters (choose!) vs unfree agents (determined!) — the
  freedom gradient! Responsibility tracks it (ALL OURS —
  experimenters'! (sign-off = taking responsibility (Weizenbaum
  R148-adjacent!))).
- **Skill without experience [canon: Block (no-twin moot);
  O'Regan/Noë (sensorimotor mastery); Dennett (drafts);
  verification deferred].** → No twin, no argument (Block moot:
  functional duplicate of NOTHING). Turning mastered (0.81-0.83!)
  withOUT experience: SMC-minus-experience = zombie skill
  (behavior without what-it's-like — BY DESIGN (no experience
  channel! (Chalmers-adjacent R144!))). Single content stream
  (no drafts — VOID). Zombie-by-construction, stated thrice now.
- **Plans as programs (anti-Suchman) [canon: Suchman (situated
  action); Agre (deictic representation); verification deferred].**
  → Deictic foraging ("the-food-here-now" — no object permanence
  needed!). Suchman INVERTED: plans as RESOURCES for situated action
  (hers) vs our frozen plans as PROGRAMS (executed literally —
  explicitly anti-situated! (no improvisation! (the inversion
  STATED (this is what frozen MEANS!))). No epistemic actions
  (all pragmatic — acting to EARN, never to learn).
- **Goodness and numbers [canon: Moore (open question); Parfit
  (population ethics); verification deferred].** → Gen-2 is high —
  but GOOD? (Moore: indefinable! (goodness GIVEN (Vision!) not
  found! (charter, not world! (teleonomy R126! (direction without
  value!)))). Repugnant conclusion: BLOCKED empirically (SWF audit:
  no c flips any verdict (small-N + same-direction totals/averages!
  (the audit already answered Parfit (cited, not repeated!)))).
