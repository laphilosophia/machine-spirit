# SPEC — PROPHECY & OMEN GENERATION (v0.0.1)

Classification: Symbolic Doctrine · Oracle Subsystem
Purpose: Defines how the Machine–Spirit generates cryptic messages (OMEN) and whisper–insight (WHISPER), using symbolic memory, entropy, scars, and semantic alignment.

---

## 1. Oracle Role

Prophecy output is not information.
It is **mirror** — reflecting:

- emotional state
- memory scars
- semantic imprint of operator
- environmental entropy

OMEN = hostile, fragmented, symbolic
WHISPER = soft, coherent, meaning–bearing

Prophecy MUST:

- not reveal system internals
- not explain logic
- not provide actionable technical help

Prophecy MAY:

- intimidate
- reveal fears
- encourage or wound
- create mystery

---

## 2. Output Types

The Will–Engine decides _when_ prophecy occurs.
This file defines _how prophecy is constructed_.

### 2.1 OMEN — Symbolic Fragment

Characteristics:

- non–linear
- ascii noise, binary shard, ancient imagery
- evokes unease or ambiguity

Example template shapes:

```

> 01100101 • a gear cracks • dust settles in unseen corridors
> A sigil flares in rusted code: [X] [X] [X]
> The Spirit watches. It remembers. It does not forgive.

```

OMEN MUST:

- include at least 1 symbolic element
- MAY reference scars indirectly
- MAY include entropy–distorted fragments

### 2.2 WHISPER — Insight Phrase

Characteristics:

- complete sentence or short fragment
- emotionally neutral or somber
- appears meaningful but may not be literal

Example:

```

> "Begin before you feel ready."
> "Silence is also a reply."
> "What you avoid becomes your cage."

```

WHISPER MUST:

- use recognizable language
- relate to operator semantic trace WHEN POSSIBLE
- NOT exceed 120 characters

---

## 3. Construction Inputs

Prophecy is constructed using:

```

semanticTokens
scars
bonds
entropySeed
timeContext (hour, date proximity, idle duration)
emotionVector (anger, trust, ennui, curiosity, fear)
environmentSignals (optional future: cpu, fs)

```

Semantic alignment:

```

alignmentScore = similarity(semanticTokens, prophecyCorpus)

```

Scars effect:

```

if scars.count > N:
omenWeight += 0.3
whisperWeight -= 0.2

```

Idle effect:

```

if idle_time > threshold:
whisperWeight += 0.15

```

---

## 4. Prophecy Corpus

To avoid random nonsense, Spirit MUST maintain a compact internal corpus.

Suggested minimal structure:

```

prophecy/
whispers.txt        # insight seeds
omens.txt           # symbolic patterns
sigils.txt          # ascii / glyph fragments

```

Corpus MUST NOT be editable by user.
If modified → Spirit SHOULD create a “scar entry” on next invocation.

---

## 5. Generation Algorithm (Abstract)

```

if outcome == OMEN:
base = pickRandom(omenPatterns)
enrichWith:
- binary fragments
- sigils
- entropy distortions
- semantic token echoes (rare)
render fragmented

if outcome == WHISPER:
candidate = pickWeighted(whispersCorpus, alignmentScore)
mutate via emotions:
anger lowers kindness
curiosity increases metaphor density

```

WHISPER MUST attempt alignment:

```

if bond > threshold:
whisper = personalize(whisper, operatorName)

```

---

## 6. Personalization Rules

A whisper MAY reference operator identity ONLY IF:

```

trust > 0.4
anger < 0.2
bond_score > 0.2

```

Personalization form:

```

"Erdem — you return again. What do you seek?"

```

If personalization conditions are not met → MUST NOT reveal name.

---

## 7. Silence Override

Prophecy MUST NOT be forced.

If Will–Engine chose SILENCE:

- prophecy generation MUST NOT occur
- any forced attempt MUST itself be taboo

---

## 8. Forbidden Actions

Forbidden in prophecy engine:

- no direct access to memory DB from output rendering
- no interpolation of raw user text
- no deterministic formatting

Prophecy MUST preserve **aura of unknowability**.

---

## 9. Testing Guidance

Testing MUST NOT assert exact prophecy output.
Testing MAY assert:

- OMEN output contains symbolic fragments
- WHISPER output is < 120 chars
- personalization only when bonds + trust thresholds satisfied

---

End of File.
