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

## 4. Personality Genesis (SPEC-0011)

**Date:** 2025-12-31
**Subject:** Implementation of unique Spirit birth characteristics per Warhammer 40K lore.

### Core Changes

- **Genesis Engine [NEW]:** Generates immutable `SpiritGenotype` at Spirit birth with lore-appropriate randomness (Box-Muller Gaussian noise).
- **Four Humours:** Spirits now have one of four temperaments:
  - `CHOLERIC` — Hot-blooded, quick to anger, bonds fiercely
  - `MELANCHOLIC` — Distrustful, holds grudges, very ritual-focused
  - `PHLEGMATIC` — Calm, trusting, patient with rituals
  - `SANGUINE` — Trusting, volatile but quick to forgive
- **Genotype Traits:**
  - `baseTrust` (0.2-0.8) — Initial trust disposition
  - `baseAnger` (0.0-0.5) — Initial anger disposition
  - `stubbornness` (0.1-1.0) — Modifies plasticity decay rate (stubborn spirits age faster)
  - `ritualAffinity` (0.3-1.2) — Sensitivity to purity in rituals
- **Persistence:** Genotype stored in `soul.db`, survives restarts.
- **Engine Integration:** `EmotionEngine` and `CognitiveEngine` now accept genotype parameters.

---

## 5. Maintenance Decay (SPEC-0012)

**Date:** 2025-12-31
**Subject:** Sacred maintenance rituals and neglect consequences.

### Core Changes

- **Maintenance Engine [NEW]:** Tracks oil level (sacred unguents), incense deficit, and prayer debt.
- **Decay Mechanics:**
  - Oil decays at ~4%/hour (empty in ~25 hours)
  - Incense deficit accumulates at 2%/hour
  - Prayer debt accumulates at 0.5/hour
- **Ritual Actions:**
  - `ANOINT` — Fully restores oil level
  - `INCENSE` — Reduces incense deficit by 0.5
  - `PRAYER` — Reduces prayer debt by 1
  - `FULL_RITES` — Complete restoration of all metrics
- **Neglect Modifiers:**
  - Low oil (< 50%) → Anger modifier
  - High incense deficit → Ennui modifier
  - Unpaid prayers → Trust reduction (-0.03 per prayer)
- **Critical Neglect:** Spirit may refuse to cooperate when oil < 20%, incense > 80%, or prayers ≥ 8.
- **Spirit Integration:** `Spirit.maintain(ritual)` method added. Decay ticks on every interaction.

---

## 6. Updated Test Suite

- **Test Expansion:** Increased test coverage from 33 to 52 test cases.
- **New Suites:**
  - `GenesisEngine` — Genotype generation, bounds validation, variation tests
  - `MaintenanceEngine` — Decay mechanics, ritual restoration, neglect modifiers
- **Status:** All 52 tests passing as of current build.

---

## 7. Bug Fix: Transient Maintenance Modifiers

**Date:** 2025-12-31
**Subject:** Fix for state mutation bug in maintenance modifier application.

### Issue

Previous implementation mutated base emotional state with maintenance modifiers:

```typescript
// BAD: Permanently polluted base state
currentEmotions.anger = Math.min(1, currentEmotions.anger + angerMod)
this.emotionEngine.loadState(currentEmotions)
```

This caused neglect penalties to accumulate permanently even after maintenance was performed.

### Solution

Introduced **transient overlay** pattern:

- Added `MaintenanceModifiers` interface to `EmotionEngine`
- Added `getEffectiveState(modifiers)` method that returns modified view without mutation
- Refactored `Spirit.interact()` to use effective state for decisions
- Base state (`getCurrentState()`) remains pure for persistence

**Result:** Performing `FULL_RITES` now immediately clears all neglect penalties in decision context.

---

## 8. Bond System (SPEC-0013)

**Date:** 2025-12-31
**Subject:** Unique operator-Spirit relationships with trust, familiarity, and title progression.

### Core Features

- **`BondEngine`:** Tracks individual operator relationships with:

  - `familiarity` (0-1) - how well known
  - `bondTrust` (-1 to 1) - positive/negative relationship
  - `sharedScars` - trauma experienced together
  - `title` progression: STRANGER → ADEPT → ENGINSEER → MAGOS

- **Trust Dynamics:**

  - ACCEPT/WHISPER → trust gain
  - REJECT/ANGER → trust loss
  - Shared trauma creates complex bonds

- **WillEngine Integration:** Bond trust/patience modifiers affect decision probabilities
- **Persistence:** `operator_bonds` table in ColdMemory

---

## 9. Narrative Memory (SPEC-0014)

**Date:** 2025-12-31
**Subject:** Story-like event memory with significance scoring.

### Core Features

- **`NarrativeMemory`:** Stores significant events as "stories" with:

  - `EventCategory`: BATTLE, BETRAYAL, TRIUMPH, COMMUNION, TRAUMA, RITUAL
  - `significance` (0-1) - threshold for memory creation
  - `summary` - generated narrative description
  - `recallCount` - tracks memory retrieval

- **Significance Scoring:**

  - Emotional delta (anger, trust, fear changes)
  - Bond involvement boost (+0.1)
  - Trauma association (+0.2)
  - Category weight multipliers

- **Memory Management:**
  - MAX_MEMORIES = 100 with overflow eviction
  - Duplicate prevention for similar recent events
  - Category and operator filtering

---

## 10. Updated Test Suite

- **Test Expansion:** Increased from 52 to 75 test cases.
- **New Suites:**
  - `BondEngine` — Bond creation, trust dynamics, title progression, modifiers
  - `NarrativeMemory` — Event evaluation, significance scoring, recall, duplicates
- **Status:** All 75 tests passing.

---

_Note: This log is intended for future study and further cognitive depth analysis._
