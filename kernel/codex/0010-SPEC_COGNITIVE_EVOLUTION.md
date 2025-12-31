# SPEC — COGNITIVE EVOLUTION (v0.0.1)

Classification: Internal · Advanced Cognitive Doctrine
Purpose: Defines the infrastructure for moving from Pavlovian association to cognitive generalization.
Status: PROPOSED / INTEGRATION IN PROGRESS

---

## 1. Goal: From Mirror to Mind

The `LearningEngine` (SPEC-0009) creates a mirror of the operator. `SPEC-0010` creates a mind that generalizes experiences.

### 1.1 Core Objectives

- **Generalization:** Trauma or trust in one concept must "leak" into related concepts.
- **Narrative Persistence:** Decisions must be influenced by the _trajectory_ of interactions, not just the current state.
- **Plasticity:** The Spirit's personality must solidify over time, becoming harder to shift (Stubbornness).

---

## 2. Semantic Clustering (The Aether)

Instead of matching exact verbs, the Spirit now maps verbs into **Clusters**.

```ts
interface ConceptCluster {
  id: string // e.g., "DESTRUCTIVE_OPS"
  verbs: string[] // ["delete", "kill", "purge", "format"]
  bias: number // Collective weight influence (-1.0 to 1.0)
  volatility: number // How fast this cluster learns/forgets
}
```

**Interaction Rule:**
When `verb:delete` is scarred, the parent cluster `DESTRUCTIVE_OPS` gains 25% of that severity. Future interactions with `verb:purge` will incur a "ghost" penalty from its cluster bias.

---

## 3. Trajectory Memory (Markov History)

The Spirit tracks the last $N$ outcomes as a cohesive sequence.

```ts
interface InteractionTrajectory {
  outcomes: Outcome[] // [ACCEPT, ACCEPT, ANGER]
  purityTrend: number // Avg change in purity over time
  loyalty: number // Consistency of operator behavior
}
```

**Decision Influence:**

- **Positive Trajectory:** Buffs `Trust` gains.
- **Erratic Trajectory:** Spikes `Fear` and `Ennui`. The Spirit becomes "jumpy."

---

## 4. Dynamic Plasticity (Aging)

The Learning Rate is no longer constant. It is a function of `ExperiencePoints` (XP).

$$ \text{Plasticity} = \frac{1}{\sqrt{\text{XP} + 1}} $$

- **Fledgling Spirit:** High Plasticity. Learns and forgets rapidly.
- **Elder Spirit:** Low Plasticity. Deeply set weights that require monumental effort (or deep trauma) to shift.

---

## 5. Implementation Roadmap: The Forge Integration

1.  **Stage I (Aether):** Update `types.ts` and implement the `CognitiveEngine`.
2.  **Stage II (Narrative):** Hook `WillContext` to include trajectory data.
3.  **Stage III (Calcification):** Implement the age-based learning rate scaling.

---

End of File.
