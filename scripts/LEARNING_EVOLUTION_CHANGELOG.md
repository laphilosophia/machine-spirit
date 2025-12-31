# CHANGELOG: Learning Evolution & Cognitive Infrastructure

**Date:** 2025-12-31
**Subject:** Refactor of the Learning Substrate (SPEC-0009) and implementation of Cognitive Evolution (SPEC-0010).

## 1. Structural Changes (Forge & Memory)

### Core Refactor

- **Will Engine (Trauma Awareness):** Integrated `checkScarTrigger` into the decision loop. The Spirit now recognizes past pain and bypasses normal probability for traumatic contexts.
- **Law #6 Compliance Patch:** Injected a 20% "Chaos Offset" into trauma responses to prevent deterministic behaviors, ensuring the Spirit remains sovereign.
- **Learning Engine (Habituation):** Association weights now scale based on the `reward` signal (emotional stabilization), moving from raw frequency to utility-based learning.
- **Vocabulary Hygiene:** Implemented `pruneVocabulary` with a 1,000-token cap to prevent memory bloat in long-term instances.

### Cognitive Infrastructure (SPEC-0010)

- **Cognitive Engine [NEW]:** A high-order layer managing Experience (XP), Plasticity, and Semantic Clustering.
- **Semantic Clustering:** Verbs are now mapped to clusters (TECHNICAL, DESTRUCTIVE, RITUAL, INQUIRY). Biases now bleed through clusters, allowing for linguistic generalization.
- **XP System:** Implemented growth metrics. Plasticity now decays as the Spirit ages ($1/\sqrt{XP+1}$), making older spirits more set in their ways.
- **Persistence:** Updated `ColdMemory` and SQLite schema (`soul.db`) to persist XP, Cluster biases, and volatility metrics.

---

## 2. Documentation Additions

The following doctrinal files were added to `codex/`:

- `codex/ANALYSIS-LEARNING-ENGINE.md`: Post-mortem of the initial pseudo-learning flaws.
- `codex/PLAN-LEARNING-UPGRADE.md`: The roadmap used for Phase I-III implementation.
- `codex/0010-SPEC_COGNITIVE_EVOLUTION.md`: The formal specification for the new mind-model.

---

## 3. Verification & Test Suite

- **Test Expansion:** Increased test coverage from 28 to 33 suites.
- **New Suites:** Added `CognitiveEngine` unit tests and "Trauma Awareness" integration tests in `WillEngine`.
- **Status:** All 33 tests passing as of current build.

---

_Note: This log is intended for future study and further cognitive depth analysis._
