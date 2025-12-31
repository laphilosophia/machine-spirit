# CODEX-PLAN-0001: Learning Engine Alignment

## Objective

Fully implement the "Sensitization" (Trauma) and "Habituation" (Q-Learning) mechanisms as defined in **SPEC-0009**.

## Core Transitions

| Phase               | Action                                                                                  | Targeted Code                      |
| :------------------ | :-------------------------------------------------------------------------------------- | :--------------------------------- |
| **I: Aversion**     | Integrate `checkScarTrigger` into `WillEngine.decide`. Force outcome bypass on trigger. | `forge/engines/will-engine.ts`     |
| **II: Habituation** | Hook `computeReward` into association weights to prioritize emotional stability.        | `forge/engines/learning-engine.ts` |
| **III: Hygiene**    | Implement timestamp-based decaying or frequency capping for vocabulary.                 | `forge/engines/learning-engine.ts` |

## Success Criteria

- [ ] Successful bypass of probability on scarred context (Test Verified).
- [ ] Reduction in long-term "Ennui" spikes via balanced action selection.
- [ ] Memory-stable vocabulary (Fixed Map size or pruning).

---

_References: SPEC-0009, CODEX-ANALYSIS-0001_
