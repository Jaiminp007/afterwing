# L4-J Opus design (ORBIT): designer stopped by the Devin quota; screen completed by the orchestrator

The designer's detached batches A, A2 and B finished after the agent itself failed on the quota. The orchestrator scored them with the designer's own `screen-b.mjs` and a per-arm mean over the 16 tuning seeds, 953001–953016. Seeds 953017–953032 were not run.

| Screen | Result |
|---|---|
| (a) L2 headroom | Met on margin, not on significance. FIXED = LAST_q0.003_R0.5, 86.18; L2 = ROT_b0.005, 89.09; gain +2.91, 12/16, p .017 (not below .01). |
| (b) L3 room | Per-lineage hindsight room 1.46 against 1.45 needed: a hair's margin, before correcting for the selection bias of a max over 8 settings. |
| (c) Oracle L3 vs Class F (tuning) | **Fails.** The flat fixed-share mixture MIX3W_s0.01 reaches **91.25**, above every ORACLE3 (best 89.23, ORACLE3_a0.007_g0.5_s0.007) and every L2 (best 89.31). |

**Verdict:** stopped at screen (c). A flat mixture of three fixed-rate experts matches what an oracle L3 does by choosing among rates. No held-out run.
