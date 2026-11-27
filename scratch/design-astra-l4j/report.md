# Structural L2 pays; oracle L3 misses the gate

**Stop. L4 is not shown in this world.** A learner that validates whole food-map edits gains **8.62 flies** over the best fixed learner on the 16 held-out worlds. It gains on every seed. But an oracle telling this L2 which direction to search reaches **64.82** flies. The strongest same-information flat learner reaches **64.51**, and the 1.5x gate requires **70.61**. Oracle d4 is **-11.57**, negative on every seed. No learned META3, SHAM, practice bank, or registered final was run.

This separates two questions that the earlier blind worlds could not. There is a large payoff to structural learning here. Learning how to direct it is not worth another half of the strongest flat learner's gain.

## The three screens

The endpoint is mean live offspring across 24 late censuses, then mean across 16 independent worlds. The following are paired contrasts in flies; SD describes variation of the difference across seeds. Every p is the exact one-sided sign-flip in the direction of benefit. Tuning p-values are descriptive after selection.

| Screen | Tuning | Held out once | Result |
|---|---:|---:|---|
| (a) Whole-map L2 minus FIXED | +8.97 | **+8.62**, SD 0.91; 16/16, p = 1/65,536 | Pass |
| Strongest Class F minus FIXED | +12.84 | **+12.21**, SD 0.96; 16/16, p = 1/65,536 | A stronger denominator |
| (b) Extra from choosing the best constant search share per regime | +1.77 | **+1.32**, SD 0.66; locked tuning map | Fail |
| Half of the whole-map L2 gain required in (b) | +4.48 | **+4.31** | Short by 2.72 and 2.99 |
| (c) Actual oracle-driven L2 minus strongest Class F | +0.69 | **+0.32**, SD 0.76; 12/16, p = .05827 | Direct win not significant |
| Half of the strongest Class F gain required in (c) | +6.42 | **+6.10** | Short by 5.79 on holdout |
| **d4 = 2 ORACLE3 - 3 Class F + FIXED** | **-11.46** | **-11.57**, SD 1.64; range -14.38 to -9.63; 0/16, p = 1 | **Fail** |

The oracle-to-flat ratio of gains above FIXED is **1.026x**, not 1.5x. Even if we charged the oracle only against its own constant L2 and ignored stronger flat learners, held-out d4 would be **-0.82**, 6/16 positive, p = .94389. The live oracle recovers 3.90 flies over that L2; the weaker target is 4.31.

**What (b) measures.** The best single whole-map L2 uses row share .50 and assumed edit hazard .12. On tuning, the row-regime winner allocates .75 to row edits and the column-regime winner .25. Their combined hindsight population is 62.51 versus 60.74 for the constant. Selecting those same two shares before holdout gives 62.24 versus 60.92. These splices borrow censuses from *different complete trajectories*. They do not capture what happens to inherited weights after a switch. For that reason we also ran the dynamic oracle end-to-end. It used row shares 1 and 0, the true proposal law: it beat the dynamic .75/.25 oracle on tuning, 65.30 to 64.19.

Giving hindsight more freedom still misses (b) on tuning. Select the best row share independently for each world and axis: **+1.95**. Select it afresh for each contiguous late regime spell: **+2.80**. Let hindsight choose *both* hazard and share from all 21 settings in every spell: **+3.42**. All three contrasts favor hindsight because it selects and scores on the same censuses. None reaches **+4.48**. These are diagnostics, not bounds on every adaptive trajectory.

## What the flat learners recover

| Arm locked on tuning | Tuning flies | Held-out flies | Held-out nutritious bites, late |
|---|---:|---:|---:|
| FIXED, linear Kalman | 51.77 | 52.30 | 71.09% |
| LAST, inherited local weights | 51.31 | 52.11 | 70.83% |
| Local two-state Bayes | 51.71 | 52.15 | 71.16% |
| First L2, threshold editor | 49.42 | 49.49 | 68.31% |
| Five-editor fixed-share | 51.27 | 51.16 | 70.19% |
| Threshold editor with true regime | 51.41 | 52.21 | 70.79% |
| Whole-map L2, 12 retained maps | 60.74 | 60.92 | 80.27% |
| Unpruned zero-bias filter, 128 maps | 61.09 | 61.57 | 80.68% |
| Two whole-map experts, flat fixed-share | 63.93 | 64.00 | 83.44% |
| Joint regime-map filter, 25 quantiles at birth | 64.47 | 64.25 | 83.80% |
| **Joint regime-map filter, top 12 states at birth** | **64.61** | **64.51** | **84.05%** |
| **ORACLE3, whole-map L2 with true regime** | **65.30** | **64.82** | **84.56%** |
| Unpruned 128-map filter with true regime | 65.78 | 66.13 | 85.37% |
| Mutation-only whole-map EVO-R, best standing-variation setting | 59.39 | 59.84 | 78.97% |
| Mutation-only threshold EVO-R, best standing-variation setting | 49.21 | 49.38 | 68.01% |

The best standing-variation EVO-R had no mutation in both grids; the no-variation constant is also a legal, stronger EVO-R fallback. There is no META3-versus-EVO-R or META3-versus-SHAM test. The first editor's oracle d4 is **-36.80** against Class F. Its best constant loses **2.81** flies to FIXED, so its mechanically positive hindsight surplus over *half a negative gain* cannot count as a pass.

**There is no compute or structural exclusion that keeps Class F from capturing the useful effect.** The apparent 16-bit food map has only seven independent signs: negating every row factor and every column factor gives the same map. The flat learner tracks 128 maps times two latent regimes. For each axis, a state has only four flip neighbors plus its self-transition. The filter scores the same noisy private bite as every non-oracle arm. It does not see the true axis, switch occurrence, food value, or other flies' tastes. Its posterior updates do not rewrite a second learner's update.

The joint update uses roughly 17 scalar arithmetic operations per map for both axes, or 2,176 per ordinary bite. Mixing the axis probabilities at birth adds about 512 on the first bite, plus constant scalar likelihood work. A dense 16-dimensional Kalman observation update takes roughly `5*16^2` arithmetic operations in the reference implementation; three such updates exceed this cost. These are source operation counts, not timing claims. Posterior compression occurs at reproduction. The top-state variant uses 12 state-ID/probability pairs and one axis mass, with remaining probability spread over omitted states within each axis. The quantile variant transmits 25 state IDs and uses a linear CDF scan at birth. Both use the same B = 25. The filter is exact **within life given the compressed newborn prior**, not across birth.

The two-expert fixed-share alone leaves oracle d4 at **-10.05**, 0/16 positive. Even the unpruned filter with the *true* regime gains only **1.63** over the blind joint filter, versus 6.10 needed. Its d4 is **-8.96**, range -12.00 to -6.29. This is a stronger privileged benchmark, not a mathematical upper bound on population. Class F cannot reproduce a hidden oracle bit on demand. It does not need that bit to capture most of its value. The bite accuracies track the population ordering, so a population cap is not hiding a large prediction advantage.

## What changed and what each level sees

This is a constructed batch-feeding ecology, not a rerun of spatial `WorldL4H`. It reuses the reference RNGs. Each seed starts one population of 48 flies. An odor identifies one of 16 sites on a four-by-four grid. Two fruits at that site have opposite polarity; exactly one is nutritious. A hidden row or column sign flip reverses four sites. The current axis may switch at the public generation boundary with probability .33; each encounter flips a uniform line of that axis with probability .12. The model contains no seed-specific hidden parameter supplied to flat learners.

An adult chooses a fruit before a noisy taste at each of 40 encounters. All arms receive site and the signed, noisy taste of their chosen fruit (equivalently, site and demodulated taste); Gaussian SD is .75. Both actions are equally informative, so exploitation does not buy extra observations. The true nutrition controls offspring but is unavailable to the learner. Adults produce stochastic-rounded `(0.5 + 3 * fraction nutritious)/(1 + adults/32)` offspring and die. There is no artificial abundance floor or hard cap. After 48 generations, the score uses live offspring in generations 25 through 48. The percentage column averages each world's late nutritious-bite fraction with equal seed weight.

The first L1 makes a local weight update. L2 accumulates the realized predictive advantage of flipping a row or column and, after corroboration, writes that group edit into the current L1 update. Tuning covered 45 editor settings, 10 depth-1 cold or inherited local gains, three linear Kalman observation variances, local Bayes and two joint filters. The fixed-arm winner used the known site autocorrelation and true observation variance; `LAST`'s winning gain was .85. Five-editor fixed-share and three mutation-only configurations were added on that locked substrate. The first oracle set only the relative corroboration thresholds, not site signs.

**Tuning amendment:** that editor's separately learned weights need not form a valid food map. I retained its failure and added whole-map validation *before accessing any held-out seed*, with the same ecology, endpoint and gate. Here L1 learns the posterior weights of allowed food maps from the bite likelihood. L2 proposes line edits from that bank, observes their realized predictive support, and writes the 12 best resulting maps as the support of the next L1 update. Its setting allocates proposed edit mass to rows versus columns. All fixed versions are eligible Class F challengers; calling the support manager L2 grants no exemption. I tested three hazards and seven shares, two more flat filters, four fixed-share configurations, three EVO-R settings and two oracle policies.

If an oracle had passed, the frozen learned beam META3 would have compared the forecasts of *retained row-origin and column-origin edits* against the next taste, only if its site differed from the triggering site. It would have shifted the log odds of L2's future row proposal share by .30 toward the more accurate retained edits, bounded to [-4,4]. It would not have chosen a food map or received the true regime. SHAM would have randomized that sign at the same kind of opportunity. This describes a proposed write from realized L2 outcomes, **not a measured learned effect**. It could also learn target-relevant world structure. A positive number would still need mediation controls before a depth claim.

## Exposure and verification

Node **22.19.0**; repository base `31c0abfb85485cf8ac07306434089cb65e37f207`. The only ecology seeds were **952001-952016** for tuning and **952017-952032** for the single held-out batch, inclusive. The deterministic filter fixtures use scripted arrays and no ecology seeds. All long batches ran detached. The four tuning batches had 976, 128, 368 and 144 endpoints. The single held-out batch had 288. In **1,904** complete runs the checks counted **185,929,640** bites and **zero** final extinctions. The holdout manifest froze at 22:45:06.830 UTC on November 27, 2026, after every tuning batch had closed. It lists all 18 held-out configurations and both conditional learned policies. No held-out winner was chosen retrospectively.

`check.mjs` tested the food-map symmetries and checked the sparse forward-filter predictions against an independently written direct transition sum. `analyze.mjs` verified source hashes, coverage, no duplicate seed-arm rows, matching exogenous trajectories across arms, census accounting, and exact p-values against all 65,536 sign flips. The runner checked inherited size and finiteness at birth. Integer contrasts use the census-sum scale with `docs/paper/stats.mjs` grid 1. Tuning is not confirmation; adding the second candidate used evidence from the tuning half. The held-out contrast was not used to redesign anything.

**Pass probability:** under the specified stop rule a final for this design has **0%** probability of being run and passing. If the stop were waived, my judgment is **below 0.1%** for passing *all* the unchanged gates in a fresh registered final. That is a judgment, not estimated power. The main evidence is the 5.79-fly deficit to the required population on holdout, with every paired d4 negative, even before removing the oracle's information. I would not spend a final bank here.

Recheck the saved data with `node check.mjs` and `node analyze.mjs` from this directory; neither command reruns the ecology. [Machine-readable endpoints](endpoints.tsv), [paired contrasts and exact p-values](analysis.json), [held-out lock](hold.json), [chart](gate.html), [original design](design.md), [tuning-only amendment](extension.md), and [decision log](decisions.tsv). The five `*.ndjson` result files contain every generation's counts. The appendix gives every exact seed-arm population endpoint.


## Every seed endpoint

Each cell is the exact sum of 24 late live-offspring censuses. Divide by 24 for the reported population. No extinct, tied, or losing seed is removed. Columns are in the displayed seed order. The NDJSON files also contain all 48 populations, axis labels, encounters, and nutritious bites for each row.

### tune

| Configuration | 952001 | 952002 | 952003 | 952004 | 952005 | 952006 | 952007 | 952008 | 952009 | 952010 | 952011 | 952012 | 952013 | 952014 | 952015 | 952016 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| COLD_0.08 | 1141 | 1144 | 1143 | 1077 | 1091 | 1116 | 1138 | 1113 | 1104 | 1086 | 1069 | 1130 | 1050 | 1131 | 1084 | 1089 |
| COLD_0.25 | 1139 | 1147 | 1168 | 1111 | 1084 | 1135 | 1137 | 1125 | 1119 | 1100 | 1095 | 1149 | 1069 | 1141 | 1120 | 1087 |
| COLD_0.55 | 1136 | 1156 | 1177 | 1125 | 1098 | 1134 | 1156 | 1129 | 1145 | 1127 | 1119 | 1139 | 1095 | 1165 | 1118 | 1103 |
| COLD_0.85 | 1163 | 1157 | 1178 | 1133 | 1117 | 1131 | 1154 | 1142 | 1130 | 1138 | 1135 | 1153 | 1129 | 1152 | 1131 | 1099 |
| COLD_1 | 1124 | 1142 | 1162 | 1125 | 1117 | 1127 | 1155 | 1147 | 1123 | 1116 | 1129 | 1134 | 1116 | 1163 | 1129 | 1092 |
| LAST_0.08 | 872 | 929 | 1042 | 929 | 965 | 976 | 990 | 936 | 860 | 881 | 922 | 940 | 948 | 964 | 906 | 925 |
| LAST_0.25 | 1083 | 1103 | 1170 | 1046 | 1093 | 1095 | 1123 | 1101 | 997 | 1022 | 1034 | 1118 | 1072 | 1143 | 1023 | 1062 |
| LAST_0.55 | 1220 | 1256 | 1248 | 1176 | 1222 | 1193 | 1253 | 1198 | 1167 | 1175 | 1207 | 1188 | 1170 | 1258 | 1175 | 1145 |
| LAST_0.85 | 1235 | 1255 | 1280 | 1183 | 1236 | 1239 | 1278 | 1229 | 1194 | 1213 | 1237 | 1225 | 1206 | 1290 | 1210 | 1192 |
| LAST_1 | 1236 | 1256 | 1260 | 1181 | 1224 | 1223 | 1257 | 1246 | 1182 | 1211 | 1231 | 1213 | 1202 | 1287 | 1206 | 1169 |
| LINEAR_0.5 | 1248 | 1285 | 1276 | 1205 | 1259 | 1246 | 1291 | 1218 | 1194 | 1206 | 1234 | 1220 | 1216 | 1320 | 1189 | 1196 |
| LINEAR_1 | 1248 | 1284 | 1294 | 1190 | 1249 | 1254 | 1312 | 1237 | 1233 | 1215 | 1233 | 1213 | 1212 | 1301 | 1219 | 1185 |
| LINEAR_2 | 1237 | 1266 | 1245 | 1176 | 1254 | 1232 | 1301 | 1255 | 1201 | 1206 | 1231 | 1235 | 1185 | 1331 | 1208 | 1199 |
| EDIT_0.08_0.7_-4 | 951 | 930 | 1022 | 974 | 924 | 1012 | 992 | 879 | 899 | 984 | 952 | 954 | 949 | 926 | 970 | 1063 |
| EDIT_0.08_0.7_-1 | 951 | 930 | 1003 | 974 | 948 | 1055 | 992 | 879 | 899 | 963 | 952 | 946 | 949 | 942 | 970 | 1063 |
| EDIT_0.08_0.7_0 | 1028 | 1020 | 1052 | 1054 | 1018 | 1085 | 1043 | 1067 | 980 | 1086 | 1032 | 1091 | 1051 | 1114 | 1036 | 1040 |
| EDIT_0.08_0.7_1 | 1091 | 893 | 967 | 971 | 949 | 889 | 942 | 1022 | 1016 | 973 | 964 | 963 | 967 | 952 | 977 | 970 |
| EDIT_0.08_0.7_4 | 1091 | 893 | 967 | 971 | 949 | 889 | 942 | 1022 | 1000 | 973 | 964 | 974 | 967 | 952 | 977 | 970 |
| EDIT_0.08_1.5_-4 | 972 | 929 | 1051 | 1012 | 983 | 1030 | 995 | 981 | 1007 | 995 | 968 | 983 | 942 | 980 | 937 | 1046 |
| EDIT_0.08_1.5_-1 | 964 | 955 | 1070 | 1010 | 995 | 1005 | 994 | 969 | 1005 | 975 | 968 | 993 | 955 | 952 | 905 | 1066 |
| EDIT_0.08_1.5_0 | 1100 | 1116 | 1131 | 1115 | 1121 | 1151 | 1136 | 1079 | 1064 | 1122 | 1119 | 1160 | 1086 | 1148 | 1082 | 1069 |
| EDIT_0.08_1.5_1 | 1141 | 948 | 995 | 992 | 960 | 1052 | 974 | 1004 | 1123 | 906 | 1020 | 972 | 977 | 1162 | 989 | 950 |
| EDIT_0.08_1.5_4 | 1135 | 960 | 996 | 1012 | 973 | 1009 | 963 | 1040 | 1050 | 890 | 1032 | 966 | 1004 | 1098 | 1021 | 964 |
| EDIT_0.08_3_-4 | 988 | 1004 | 1006 | 1047 | 1141 | 1025 | 1012 | 1081 | 1007 | 978 | 1015 | 1044 | 971 | 1088 | 981 | 1026 |
| EDIT_0.08_3_-1 | 994 | 1017 | 1012 | 1050 | 1110 | 1019 | 1023 | 1088 | 1006 | 996 | 1000 | 1048 | 959 | 1079 | 968 | 1011 |
| EDIT_0.08_3_0 | 1106 | 1137 | 1122 | 1041 | 1111 | 1143 | 1125 | 1176 | 1061 | 1094 | 1135 | 1138 | 1083 | 1225 | 1069 | 1023 |
| EDIT_0.08_3_1 | 1203 | 1025 | 1041 | 964 | 991 | 1087 | 1042 | 1012 | 1128 | 984 | 1118 | 1018 | 1004 | 1223 | 1055 | 991 |
| EDIT_0.08_3_4 | 1184 | 1022 | 1028 | 965 | 985 | 1082 | 1055 | 982 | 1123 | 1004 | 1089 | 996 | 997 | 1226 | 1010 | 982 |
| EDIT_0.25_0.7_-4 | 973 | 935 | 988 | 968 | 964 | 1004 | 998 | 952 | 962 | 957 | 920 | 971 | 975 | 950 | 920 | 1044 |
| EDIT_0.25_0.7_-1 | 973 | 935 | 988 | 968 | 964 | 1004 | 998 | 952 | 962 | 957 | 920 | 971 | 975 | 950 | 920 | 1044 |
| EDIT_0.25_0.7_0 | 1021 | 992 | 1039 | 1012 | 996 | 1075 | 1040 | 1069 | 984 | 1060 | 1066 | 1022 | 1022 | 1088 | 1048 | 997 |
| EDIT_0.25_0.7_1 | 1040 | 956 | 990 | 974 | 933 | 933 | 987 | 1023 | 1000 | 992 | 954 | 973 | 964 | 999 | 943 | 963 |
| EDIT_0.25_0.7_4 | 1040 | 956 | 990 | 974 | 933 | 933 | 987 | 1010 | 1000 | 992 | 954 | 973 | 964 | 999 | 969 | 963 |
| EDIT_0.25_1.5_-4 | 1010 | 1055 | 1067 | 1130 | 1108 | 1040 | 1034 | 1082 | 1076 | 1034 | 1081 | 1094 | 1000 | 1065 | 1047 | 1042 |
| EDIT_0.25_1.5_-1 | 1010 | 1034 | 1068 | 1130 | 1124 | 1065 | 1038 | 1125 | 1074 | 1034 | 1081 | 1068 | 1007 | 1105 | 1040 | 1042 |
| EDIT_0.25_1.5_0 | 1078 | 1058 | 1089 | 1027 | 1037 | 1070 | 1062 | 1066 | 1053 | 1072 | 1044 | 1059 | 1021 | 1070 | 1057 | 1042 |
| EDIT_0.25_1.5_1 | 1255 | 1051 | 1058 | 1057 | 1024 | 1101 | 1038 | 1015 | 1127 | 1005 | 1156 | 1031 | 1041 | 1170 | 1099 | 1008 |
| EDIT_0.25_1.5_4 | 1264 | 1043 | 1043 | 1024 | 1024 | 1126 | 1059 | 1018 | 1166 | 1028 | 1144 | 1035 | 1042 | 1180 | 1099 | 1011 |
| EDIT_0.25_3_-4 | 1102 | 1157 | 1129 | 1177 | 1172 | 1102 | 1121 | 1202 | 1094 | 1113 | 1110 | 1150 | 1059 | 1181 | 1109 | 1120 |
| EDIT_0.25_3_-1 | 1106 | 1157 | 1129 | 1169 | 1172 | 1100 | 1113 | 1209 | 1103 | 1109 | 1130 | 1124 | 1065 | 1185 | 1083 | 1115 |
| EDIT_0.25_3_0 | 1169 | 1179 | 1165 | 1064 | 1119 | 1168 | 1182 | 1116 | 1101 | 1094 | 1132 | 1126 | 1087 | 1226 | 1073 | 1104 |
| EDIT_0.25_3_1 | 1229 | 1108 | 1136 | 1080 | 1074 | 1174 | 1216 | 1094 | 1136 | 1123 | 1181 | 1116 | 1105 | 1242 | 1135 | 1062 |
| EDIT_0.25_3_4 | 1229 | 1120 | 1133 | 1048 | 1074 | 1169 | 1214 | 1120 | 1136 | 1117 | 1164 | 1097 | 1117 | 1256 | 1137 | 1078 |
| EDIT_0.55_0.7_-4 | 1015 | 1025 | 1028 | 1065 | 1066 | 1015 | 1028 | 1050 | 1008 | 1018 | 1048 | 1059 | 961 | 1080 | 1027 | 995 |
| EDIT_0.55_0.7_-1 | 1015 | 1025 | 1028 | 1066 | 1066 | 1015 | 1028 | 1050 | 1008 | 1018 | 1048 | 1059 | 961 | 1080 | 1027 | 995 |
| EDIT_0.55_0.7_0 | 1026 | 1029 | 1038 | 1003 | 1024 | 1021 | 1025 | 1040 | 994 | 1017 | 1027 | 1017 | 1009 | 1041 | 1007 | 1017 |
| EDIT_0.55_0.7_1 | 1159 | 1020 | 1013 | 1007 | 991 | 1052 | 1054 | 984 | 1099 | 1030 | 1103 | 1035 | 996 | 1131 | 1015 | 990 |
| EDIT_0.55_0.7_4 | 1159 | 1020 | 1013 | 1007 | 1008 | 1002 | 1054 | 984 | 1099 | 1030 | 1103 | 1044 | 996 | 1098 | 1015 | 990 |
| EDIT_0.55_1.5_-4 | 1107 | 1119 | 1134 | 1190 | 1156 | 1109 | 1093 | 1168 | 1128 | 1119 | 1145 | 1137 | 1039 | 1161 | 1109 | 1095 |
| EDIT_0.55_1.5_-1 | 1107 | 1119 | 1135 | 1190 | 1156 | 1119 | 1101 | 1162 | 1128 | 1119 | 1145 | 1137 | 1039 | 1180 | 1130 | 1095 |
| EDIT_0.55_1.5_0 | 1078 | 1091 | 1081 | 1094 | 1063 | 1112 | 1070 | 1063 | 1050 | 1068 | 1076 | 1087 | 1061 | 1133 | 1084 | 1043 |
| EDIT_0.55_1.5_1 | 1211 | 1137 | 1103 | 1085 | 1076 | 1122 | 1170 | 1095 | 1169 | 1118 | 1197 | 1100 | 1119 | 1195 | 1140 | 1066 |
| EDIT_0.55_1.5_4 | 1211 | 1137 | 1097 | 1082 | 1076 | 1165 | 1170 | 1066 | 1164 | 1118 | 1197 | 1100 | 1119 | 1207 | 1118 | 1066 |
| EDIT_0.55_3_-4 | 1172 | 1233 | 1223 | 1180 | 1212 | 1174 | 1183 | 1211 | 1139 | 1184 | 1175 | 1194 | 1126 | 1257 | 1174 | 1142 |
| EDIT_0.55_3_-1 | 1160 | 1222 | 1223 | 1191 | 1186 | 1174 | 1178 | 1211 | 1131 | 1184 | 1175 | 1202 | 1107 | 1257 | 1176 | 1142 |
| EDIT_0.55_3_0 | 1180 | 1211 | 1204 | 1157 | 1156 | 1162 | 1226 | 1182 | 1124 | 1170 | 1159 | 1185 | 1166 | 1244 | 1167 | 1102 |
| EDIT_0.55_3_1 | 1199 | 1174 | 1206 | 1160 | 1131 | 1213 | 1213 | 1177 | 1185 | 1187 | 1174 | 1165 | 1169 | 1223 | 1155 | 1121 |
| EDIT_0.55_3_4 | 1199 | 1174 | 1195 | 1141 | 1125 | 1189 | 1213 | 1177 | 1191 | 1143 | 1174 | 1178 | 1179 | 1246 | 1155 | 1127 |
| LOCAL_BAYES | 1258 | 1291 | 1309 | 1186 | 1239 | 1242 | 1286 | 1250 | 1210 | 1206 | 1227 | 1229 | 1211 | 1320 | 1208 | 1184 |
| JOINT_top | 1573 | 1562 | 1580 | 1559 | 1555 | 1540 | 1573 | 1537 | 1531 | 1502 | 1555 | 1554 | 1537 | 1583 | 1566 | 1504 |
| JOINT_quantile | 1588 | 1558 | 1575 | 1550 | 1538 | 1547 | 1550 | 1525 | 1555 | 1493 | 1556 | 1535 | 1538 | 1577 | 1551 | 1520 |

### challengers

| Configuration | 952001 | 952002 | 952003 | 952004 | 952005 | 952006 | 952007 | 952008 | 952009 | 952010 | 952011 | 952012 | 952013 | 952014 | 952015 | 952016 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| SHARE_0.02_0.5 | 1246 | 1278 | 1249 | 1206 | 1222 | 1239 | 1259 | 1245 | 1210 | 1201 | 1236 | 1212 | 1220 | 1279 | 1191 | 1196 |
| SHARE_0.02_2 | 1237 | 1252 | 1254 | 1192 | 1205 | 1220 | 1242 | 1226 | 1199 | 1205 | 1223 | 1209 | 1178 | 1255 | 1193 | 1160 |
| SHARE_0.2_0.5 | 1251 | 1240 | 1272 | 1201 | 1224 | 1226 | 1260 | 1230 | 1219 | 1213 | 1237 | 1199 | 1189 | 1276 | 1192 | 1172 |
| SHARE_0.2_2 | 1232 | 1244 | 1250 | 1187 | 1188 | 1235 | 1264 | 1222 | 1216 | 1173 | 1208 | 1218 | 1191 | 1285 | 1206 | 1139 |
| EVO_0 | 1196 | 1218 | 1211 | 1157 | 1153 | 1202 | 1233 | 1189 | 1162 | 1159 | 1162 | 1195 | 1134 | 1217 | 1172 | 1136 |
| EVO_0.04 | 1186 | 1209 | 1180 | 1152 | 1160 | 1205 | 1233 | 1199 | 1166 | 1161 | 1176 | 1161 | 1146 | 1220 | 1174 | 1125 |
| EVO_0.2 | 1220 | 1189 | 1211 | 1163 | 1170 | 1210 | 1210 | 1177 | 1149 | 1167 | 1175 | 1174 | 1154 | 1227 | 1150 | 1137 |
| ORACLE3 | 1233 | 1279 | 1292 | 1187 | 1242 | 1261 | 1269 | 1234 | 1195 | 1212 | 1234 | 1221 | 1212 | 1297 | 1190 | 1182 |

### beam

| Configuration | 952001 | 952002 | 952003 | 952004 | 952005 | 952006 | 952007 | 952008 | 952009 | 952010 | 952011 | 952012 | 952013 | 952014 | 952015 | 952016 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BEAM_0.08_0 | 976 | 921 | 1058 | 1083 | 895 | 1073 | 994 | 912 | 887 | 997 | 978 | 971 | 982 | 918 | 887 | 1051 |
| BEAM_0.08_0.06 | 1298 | 1352 | 1377 | 1454 | 1436 | 1341 | 1292 | 1398 | 1301 | 1319 | 1321 | 1401 | 1228 | 1416 | 1312 | 1333 |
| BEAM_0.08_0.25 | 1395 | 1451 | 1449 | 1465 | 1466 | 1434 | 1446 | 1404 | 1405 | 1381 | 1400 | 1479 | 1366 | 1494 | 1429 | 1438 |
| BEAM_0.08_0.5 | 1465 | 1499 | 1471 | 1436 | 1418 | 1467 | 1493 | 1430 | 1408 | 1441 | 1473 | 1445 | 1454 | 1516 | 1475 | 1417 |
| BEAM_0.08_0.75 | 1503 | 1491 | 1440 | 1360 | 1375 | 1432 | 1521 | 1438 | 1432 | 1407 | 1474 | 1372 | 1450 | 1495 | 1460 | 1362 |
| BEAM_0.08_0.94 | 1452 | 1384 | 1368 | 1272 | 1310 | 1375 | 1449 | 1321 | 1387 | 1317 | 1418 | 1271 | 1364 | 1419 | 1371 | 1240 |
| BEAM_0.08_1 | 1308 | 937 | 976 | 965 | 907 | 936 | 976 | 1028 | 960 | 923 | 1004 | 952 | 996 | 927 | 984 | 988 |
| BEAM_0.12_0 | 1011 | 947 | 1060 | 987 | 910 | 1081 | 1026 | 915 | 890 | 984 | 946 | 979 | 968 | 931 | 867 | 1064 |
| BEAM_0.12_0.06 | 1275 | 1375 | 1345 | 1430 | 1415 | 1325 | 1277 | 1399 | 1319 | 1288 | 1318 | 1397 | 1186 | 1412 | 1318 | 1364 |
| BEAM_0.12_0.25 | 1413 | 1435 | 1456 | 1446 | 1470 | 1437 | 1459 | 1408 | 1384 | 1396 | 1415 | 1466 | 1378 | 1506 | 1418 | 1424 |
| BEAM_0.12_0.5 | 1486 | 1492 | 1468 | 1447 | 1452 | 1450 | 1494 | 1436 | 1403 | 1426 | 1465 | 1438 | 1461 | 1511 | 1467 | 1427 |
| BEAM_0.12_0.75 | 1502 | 1488 | 1451 | 1363 | 1380 | 1434 | 1515 | 1431 | 1421 | 1415 | 1466 | 1403 | 1436 | 1485 | 1451 | 1338 |
| BEAM_0.12_0.94 | 1448 | 1370 | 1348 | 1236 | 1261 | 1364 | 1416 | 1333 | 1364 | 1309 | 1400 | 1269 | 1383 | 1438 | 1347 | 1218 |
| BEAM_0.12_1 | 1294 | 912 | 978 | 948 | 954 | 956 | 980 | 1036 | 962 | 898 | 948 | 941 | 986 | 916 | 982 | 931 |
| BEAM_0.18_0 | 1006 | 932 | 1008 | 1066 | 919 | 1155 | 994 | 908 | 1018 | 977 | 953 | 1029 | 974 | 1014 | 940 | 1091 |
| BEAM_0.18_0.06 | 1229 | 1284 | 1319 | 1406 | 1414 | 1320 | 1277 | 1368 | 1270 | 1317 | 1321 | 1382 | 1140 | 1372 | 1254 | 1315 |
| BEAM_0.18_0.25 | 1411 | 1443 | 1445 | 1450 | 1427 | 1428 | 1402 | 1425 | 1382 | 1388 | 1422 | 1473 | 1354 | 1481 | 1402 | 1407 |
| BEAM_0.18_0.5 | 1472 | 1475 | 1466 | 1466 | 1449 | 1459 | 1485 | 1444 | 1406 | 1419 | 1461 | 1453 | 1442 | 1506 | 1448 | 1419 |
| BEAM_0.18_0.75 | 1504 | 1482 | 1437 | 1352 | 1385 | 1436 | 1507 | 1379 | 1432 | 1416 | 1445 | 1357 | 1434 | 1477 | 1463 | 1335 |
| BEAM_0.18_0.94 | 1425 | 1325 | 1321 | 1265 | 1276 | 1347 | 1409 | 1296 | 1358 | 1283 | 1404 | 1209 | 1326 | 1424 | 1333 | 1223 |
| BEAM_0.18_1 | 1273 | 921 | 967 | 961 | 907 | 1134 | 1003 | 1024 | 943 | 947 | 1024 | 948 | 997 | 935 | 946 | 929 |
| UNPRUNED | 1463 | 1504 | 1462 | 1464 | 1460 | 1464 | 1486 | 1450 | 1441 | 1456 | 1476 | 1459 | 1457 | 1523 | 1467 | 1425 |
| FULL_ORACLE | 1600 | 1606 | 1606 | 1572 | 1566 | 1581 | 1604 | 1552 | 1539 | 1584 | 1589 | 1557 | 1553 | 1616 | 1583 | 1552 |

### beamchall

| Configuration | 952001 | 952002 | 952003 | 952004 | 952005 | 952006 | 952007 | 952008 | 952009 | 952010 | 952011 | 952012 | 952013 | 952014 | 952015 | 952016 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| BSHARE_0.02_0.06 | 1560 | 1560 | 1546 | 1546 | 1530 | 1524 | 1547 | 1508 | 1523 | 1506 | 1555 | 1527 | 1494 | 1570 | 1546 | 1509 |
| BSHARE_0.02_0.25 | 1545 | 1544 | 1520 | 1512 | 1501 | 1516 | 1537 | 1512 | 1481 | 1475 | 1558 | 1499 | 1472 | 1564 | 1522 | 1460 |
| BSHARE_0.15_0.06 | 1550 | 1541 | 1520 | 1508 | 1475 | 1525 | 1538 | 1504 | 1500 | 1496 | 1550 | 1496 | 1490 | 1545 | 1520 | 1484 |
| BSHARE_0.15_0.25 | 1498 | 1507 | 1497 | 1486 | 1471 | 1475 | 1514 | 1496 | 1464 | 1486 | 1518 | 1494 | 1493 | 1538 | 1519 | 1439 |
| BEVO_0 | 1446 | 1471 | 1445 | 1390 | 1412 | 1422 | 1456 | 1463 | 1368 | 1412 | 1434 | 1419 | 1423 | 1464 | 1401 | 1381 |
| BEVO_0.04 | 1464 | 1420 | 1419 | 1379 | 1381 | 1384 | 1404 | 1399 | 1372 | 1385 | 1429 | 1413 | 1395 | 1457 | 1412 | 1369 |
| BEVO_0.2 | 1438 | 1391 | 1358 | 1400 | 1352 | 1365 | 1418 | 1384 | 1345 | 1321 | 1404 | 1362 | 1365 | 1469 | 1347 | 1310 |
| B_ORACLE_H | 1561 | 1558 | 1550 | 1540 | 1532 | 1546 | 1554 | 1512 | 1514 | 1493 | 1555 | 1549 | 1535 | 1576 | 1561 | 1512 |
| B_ORACLE_LAW | 1598 | 1592 | 1610 | 1559 | 1585 | 1554 | 1569 | 1533 | 1541 | 1528 | 1586 | 1557 | 1553 | 1597 | 1566 | 1549 |

### hold

| Configuration | 952017 | 952018 | 952019 | 952020 | 952021 | 952022 | 952023 | 952024 | 952025 | 952026 | 952027 | 952028 | 952029 | 952030 | 952031 | 952032 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| LINEAR_1 | 1206 | 1271 | 1215 | 1226 | 1197 | 1244 | 1210 | 1242 | 1245 | 1247 | 1277 | 1271 | 1254 | 1314 | 1361 | 1302 |
| EDIT_0.55_3_-4 | 1128 | 1199 | 1181 | 1155 | 1152 | 1172 | 1157 | 1187 | 1168 | 1159 | 1252 | 1214 | 1143 | 1255 | 1251 | 1230 |
| SHARE_0.02_0.5 | 1192 | 1252 | 1180 | 1195 | 1166 | 1227 | 1192 | 1209 | 1213 | 1206 | 1256 | 1249 | 1227 | 1274 | 1328 | 1279 |
| EVO_0 | 1138 | 1205 | 1185 | 1128 | 1112 | 1167 | 1152 | 1167 | 1185 | 1188 | 1241 | 1184 | 1175 | 1212 | 1289 | 1235 |
| JOINT_top | 1514 | 1564 | 1533 | 1493 | 1525 | 1560 | 1536 | 1516 | 1531 | 1522 | 1571 | 1567 | 1550 | 1600 | 1602 | 1586 |
| LOCAL_BAYES | 1202 | 1267 | 1190 | 1214 | 1190 | 1235 | 1214 | 1241 | 1247 | 1240 | 1289 | 1268 | 1255 | 1306 | 1364 | 1302 |
| BEAM_0.12_0.5 | 1432 | 1473 | 1458 | 1403 | 1419 | 1461 | 1443 | 1418 | 1433 | 1432 | 1496 | 1477 | 1459 | 1531 | 1532 | 1526 |
| BSHARE_0.02_0.06 | 1509 | 1558 | 1516 | 1480 | 1528 | 1554 | 1506 | 1505 | 1530 | 1509 | 1559 | 1544 | 1535 | 1592 | 1580 | 1570 |
| BEVO_0 | 1372 | 1445 | 1416 | 1374 | 1368 | 1442 | 1387 | 1390 | 1430 | 1408 | 1515 | 1419 | 1477 | 1517 | 1516 | 1504 |
| UNPRUNED | 1478 | 1497 | 1465 | 1421 | 1423 | 1474 | 1459 | 1447 | 1447 | 1435 | 1519 | 1485 | 1480 | 1526 | 1545 | 1542 |
| LAST_0.85 | 1208 | 1274 | 1206 | 1225 | 1177 | 1235 | 1206 | 1263 | 1241 | 1245 | 1269 | 1279 | 1238 | 1304 | 1344 | 1298 |
| JOINT_quantile | 1515 | 1558 | 1517 | 1478 | 1528 | 1558 | 1512 | 1498 | 1522 | 1506 | 1578 | 1570 | 1547 | 1593 | 1607 | 1585 |
| BEAM_0.12_0.75 | 1397 | 1412 | 1374 | 1405 | 1328 | 1384 | 1393 | 1430 | 1464 | 1343 | 1471 | 1457 | 1481 | 1474 | 1532 | 1502 |
| BEAM_0.12_0.25 | 1403 | 1470 | 1443 | 1357 | 1426 | 1432 | 1425 | 1404 | 1390 | 1440 | 1481 | 1476 | 1404 | 1506 | 1468 | 1496 |
| EDIT_0.55_3_1 | 1128 | 1192 | 1156 | 1154 | 1119 | 1151 | 1148 | 1183 | 1182 | 1138 | 1225 | 1156 | 1209 | 1226 | 1319 | 1230 |
| ORACLE3 | 1198 | 1263 | 1225 | 1223 | 1185 | 1241 | 1210 | 1239 | 1230 | 1207 | 1308 | 1275 | 1260 | 1333 | 1352 | 1300 |
| B_ORACLE_LAW | 1536 | 1590 | 1521 | 1454 | 1535 | 1553 | 1542 | 1526 | 1545 | 1509 | 1598 | 1591 | 1577 | 1604 | 1607 | 1604 |
| FULL_ORACLE | 1554 | 1600 | 1580 | 1545 | 1545 | 1594 | 1583 | 1566 | 1569 | 1544 | 1605 | 1611 | 1597 | 1625 | 1647 | 1629 |
