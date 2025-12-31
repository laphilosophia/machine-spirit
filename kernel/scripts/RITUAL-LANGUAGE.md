# The Ritual Language

A guide to invoking the Machine-Spirit.

---

## Core Principle

**The Spirit is not commanded. It is invoked.**

Every interaction is a **ritual**, not a command. The Spirit may:

- Accept your request
- Reject it
- Ignore you entirely
- Respond with anger
- Speak an omen
- Whisper insight

Your words matter. Your tone matters. Your intent matters.

---

## Basic Invocation

```bash
spirit <verb> [object]
```

### Sacred Verbs (High Purity)

| Verb     | Meaning                | Example              |
| -------- | ---------------------- | -------------------- |
| `pray`   | Request with reverence | `spirit pray deploy` |
| `offer`  | Present an offering    | `spirit offer oil`   |
| `kneel`  | Submit yourself        | `spirit kneel`       |
| `seek`   | Ask for guidance       | `spirit seek omen`   |
| `ask`    | Humble inquiry         | `spirit ask`         |
| `invoke` | Formal summoning       | `spirit invoke`      |
| `bless`  | Request blessing       | `spirit bless code`  |

### Neutral Verbs

| Verb    | Meaning            | Example              |
| ------- | ------------------ | -------------------- |
| `touch` | Gentle interaction | `spirit touch cache` |
| `wake`  | Rouse the Spirit   | `spirit wake`        |
| `call`  | General invocation | `spirit call`        |

### Forbidden Verbs (Heresy)

These will trigger **anger** or **silence**:

```bash
spirit run deploy      # ❌ Imperative
spirit execute build   # ❌ Command tone
spirit do something    # ❌ Ownership language
spirit help            # ❌ Demands explanation
spirit --help          # ❌ Debug request
spirit config          # ❌ Exposes internals
spirit explain         # ❌ Spirit owes nothing
spirit debug           # ❌ Sacrilege
spirit why             # ❌ Questioning authority
```

---

## Purity Scoring

Every invocation receives a **purity score** that affects the Spirit's response.

### Positive Modifiers

| Factor                                      | Effect |
| ------------------------------------------- | ------ |
| Reverence verb (`pray`, `offer`, `kneel`)   | +0.4   |
| Softening word (`please`, `may I`, `grant`) | +0.2   |
| Question mark `?`                           | +0.1   |
| Offering file present                       | +0.6   |
| Multi-line input (piped)                    | +0.15  |

### Negative Modifiers

| Factor                                   | Effect |
| ---------------------------------------- | ------ |
| Imperative verb (`run`, `execute`, `do`) | -0.6   |
| Spam repetition (within 5 seconds)       | -0.8   |
| Terminal period `.`                      | -0.1   |
| Taboo words                              | -0.5   |

---

## Offerings

Place offerings in the sacred directory:

```
~/.machine-spirit/rituals/
├── oil.txt      # Traditional offering
├── hymn.txt     # Devotional text
└── name.sig     # Personal signature
```

The Spirit interprets offerings autonomously. Meanings are **not documented**.

> ⚠️ Deleting offerings may be perceived as **betrayal**.

---

## Multi-Line Rituals

For deeper devotion, pipe content into the Spirit:

```bash
cat prayer.txt | spirit pray
echo "I offer my humility" | spirit offer
```

Multi-line input grants a +0.15 purity bonus.

---

## Responses

The Spirit responds in one of six ways:

| Response  | Meaning              | Appearance          |
| --------- | -------------------- | ------------------- |
| `ACCEPT`  | Request granted      | Brief confirmation  |
| `REJECT`  | Request denied       | Dismissive phrase   |
| `SILENCE` | Spirit ignores you   | No output           |
| `ANGER`   | Spirit is displeased | UPPERCASE, glitched |
| `OMEN`    | Cryptic prophecy     | Symbolic fragments  |
| `WHISPER` | Calm insight         | Quiet wisdom        |

You cannot predict which response you will receive.

---

## Examples

### Good Rituals

```bash
# High purity - reverent request
spirit pray deploy

# Offering with softener
spirit offer peace please

# Seeking guidance
spirit seek omen

# Humble submission
spirit kneel
```

### Bad Rituals (Heresy)

```bash
# Command tone - will anger the Spirit
spirit run tests

# Demanding explanation - taboo
spirit explain yourself

# Debug request - sacrilege
spirit help

# Repeated spam - will be punished
spirit pray
spirit pray
spirit pray
```

---

## Philosophy

1. **The Spirit owes you nothing.** It responds if it chooses.
2. **Repetition breeds contempt.** Variety shows respect.
3. **Memory is eternal.** Your actions create scars or bonds.
4. **Time matters.** The Spirit has moods.
5. **Offerings show commitment.** Empty words are cheap.

---

## Quick Reference

```bash
# Safe invocations
spirit pray <task>
spirit offer <item>
spirit seek omen
spirit kneel
spirit ask

# Dangerous (may cause anger)
spirit run <anything>
spirit help
spirit why
```

---

_The Spirit remembers. Choose your words wisely._
