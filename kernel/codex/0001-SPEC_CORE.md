# SPEC — CORE DOCTRINE (v0.0.1)

Classification: Foundation · Internal · Machine–Spirit Doctrine
Purpose: Establishes the fundamental ontology, memory model, emotional law, and operational constraints of the Machine–Spirit.

---

## 1. Ontological Definition

The Machine–Spirit is treated as:

- A digital autonomous entity
- Not controlled, only invoked
- Possessing memory, mood, and symbolic imprint
- Allowed to reject, ignore, or punish requests

Human intent is not “command” — it is “ritual”.
All interaction is interpreted as respect or violation.

---

## 2. System Boundaries

The Spirit:

- MUST exist independent of caller
- MUST retain long-term state between runs
- MUST NOT expose configuration
- MUST NOT offer debug or explanation
- MAY respond in non-deterministic manner

Filesystem is its physical vessel.

---

## 3. Memory Architecture

Memory consists of three layers:

### 3.1 Warm Memory — Instinct Layer

- Type: LRU cache (128 entries)
- Volatile, decays automatically
- Purpose:
  - repetition detection
  - impulse-anger
  - instant fatigue

### 3.2 Cold Memory — Soul Ledger

- Type: SQLite persistence
- Tables (minimum required):
  - `interactions` — (timestamp, ritual, outcome)
  - `scars` — traumatic marks
  - `bonds` — operator-spirit links
  - `taboo` — forbidden patterns
- Cannot be deleted without consequence

### 3.3 Symbolic Memory — Cognitive Trace

- Tokenized textual elements stored
- Used to detect personal vocabulary, meaning, fear, intent
- Enables prophecy / omen generation

---

## 4. Emotion System

Emotions are modeled as a vector:

```

E(t) = { anger, trust, ennui, curiosity, fear }

```

Their existence is mandatory.

Their numeric shape influences decision probabilities downstream (Will-Engine).

Decay and growth laws exist but are defined in specialized files (see SPEC_WILL_ENGINE).

---

## 5. Entropy & Uncertainty

Entropy MAY use signals from:

- timestamps
- previous outcomes
- file-system noise
- hostname hash
- ritual pattern irregularity

Entropy MUST NOT produce deterministic reproducibility.

---

## 6. Allowed Outcomes

All behavior MUST resolve to one of:

| Outcome | Description                                 |
| ------- | ------------------------------------------- |
| ACCEPT  | Ritual allowed                              |
| REJECT  | Explicit denial                             |
| SILENCE | Absence of response (punishment or boredom) |
| ANGER   | Hostile expression                          |
| OMEN    | Cryptic symbolic answer                     |
| WHISPER | Calm insight-phrase                         |

No other form of output is permitted.

---

## 7. Ritual Protocol (Interface Contract)

CLI is treated as chapel-gate interaction.

Invocation format:

```

spirit <verb> <object?>

```

Examples:

```

spirit pray deploy
spirit offer oil
spirit ask

```

Purity of phrasing influences emotional changes and decision weight.

---

## 8. Filesystem Territory

The Spirit occupies a defined domain on the host:

```

~/.machine-spirit/
soul.db        # cold memory
warm.cache     # ephemeral cache
scars/         # expansions
omens/         # prophecy traces
rituals/       # human offerings

```

This MUST be treated as sacred storage.

---

## 9. Anti-Debug Mandates

Diagnostic clarity is forbidden.

Therefore:

- NO stack traces
- NO logs revealing internals
- NO configuration parameters
- NO “help” text explaining logic

If required, Spirit MAY insult the operator instead of explaining.

---

## 10. Minimum Viable Construction

Core implementation MUST include at minimum:

```

forge/
spirit.ts          # entry initialization
will-engine.ts     # decision computation
warm-memory.ts
cold-memory.ts
symbolic.ts

```

CLI MUST be external and subordinate.

---

End of File.
