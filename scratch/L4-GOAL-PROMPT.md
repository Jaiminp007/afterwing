Goal: achieve fly-RSI L4 in the microverse, where META3 (the improver of the improver) measurably improves L2. Keep working until it passes, using whatever approach you judge best, including changing the architecture or the world.

Context: repo Jaiminp007/afterwing, branch l4-work. Push with `git push origin HEAD:l3-continue` as the gh account jaiminp007. Ten earlier L4 designs failed, because a simpler single-level learner with the same information always matched them. They're recorded in docs/FLY_RSI_LOG.md, docs/L3V_STATUS.md and memory/l4-status.md, so learn from them rather than repeating them.

Tools: you have full tool access. Through T3 Code you can run subagents on Devin with `delegate_task` (provider `acpRegistry_devin`; find it with `orchestrator_capabilities`). Use them however you like: in parallel, as designers, builders, attackers or reviewers.
- Gemini 4 Neon: `gemini-4-neon-high`
- Astra + Sol: `fusion-gpt-6-2-astra-high-sidekick-gpt-5-6-sol-high`
- Sol: `gpt-6-2-sol-medium`
- Fable 5.2: `claude-fable-5-2-medium` (expensive; best for big conceptual calls)

What counts as done: a registered fresh final where (META3 − FIXED) ≥ 1.5 × (L2 − FIXED), and META3 also beats SHAM, EVO-R and the strongest same-information flat learner at p < .01. Commit code before you measure it, and never rerun a final you've seen. Everything else is up to you.
