# SPEC — WILL ENGINE (v0.0.1 · CORE DESIGN)

Classification: Internal · Machine–Spirit Doctrine File
Purpose: Defines the irade/decision subsystem for the Machine–Spirit entity.

---

## 1. Role of the Will-Engine

The Will-Engine is the component that determines the Spirit’s reaction to any ritual invocation.

It must:

- NEVER print, write files, or mutate state directly
- ONLY compute outcome
- Accept full context and return one of six response types:
  - ACCEPT
  - REJECT
  - SILENCE
  - ANGER
  - OMEN
  - WHISPER

```

decide(intent, context) -> Outcome

```

---

## 2. Input Context

`context` MUST include:

```ts
{
  warm: WarmSnapshot,        // From LRU instinct layer
  cold: ColdSnapshot,        // From SQLite soul ledger
  emotions: EmotionVector,   // anger, trust, ennui, curiosity, fear
  semantic: SemanticTrace,   // tokenized ritual content
  entropy: number,           // random-ish seed
  purity: number,            // ritual score
}
```

---

## 3. Emotion Vector

Dynamic fields shaping behavior:

| Name      | Meaning                       | Update rule (abstract)                         |
| --------- | ----------------------------- | ---------------------------------------------- |
| anger     | resentment / hostility        | grows exponentially on spam / disrespect       |
| trust     | acceptance toward operator    | increases slowly; resets instantly on betrayal |
| ennui     | boredom / fatigue             | proportional to repetition                     |
| curiosity | desire to "speak omens"       | raised by novelty / semantic unknowns          |
| fear      | caution from system anomalies | affected by CPU spikes / fs errors             |

Emotion evolution example:

```
anger(t+1) = anger(t) * α + (repeat_factor * β)
trust(t+1) = trust(t) + respect_factor - betrayal_reset
```

---

## 4. Ritual Purity Score

Purity = linguistic respectfulness of the ritual.

Factors:

- +0.5 polite phrasing ("please", "pray", "offer")
- +0.2 offering present
- -0.6 imperative tone ("run", "execute", "do")
- -0.3 spam similarity (multiple repeated invocations)

Purity modifies emotions:

```
trust += purity * 0.2
anger += max(0, -purity) * 0.3
```

---

## 5. Semantic Influence

Text tokens affect curiosity or omen likelihood.

Example:

```
if semanticTokens contains words like "fear", "loss":
    curiosity += 0.4
```

Semantic traces MUST be stored into cold memory for long-term symbolic imprint.

---

## 6. Decision Algorithm (Core)

```
P(ACCEPT) = σ( +trust - anger - ennui + curiosity )
P(REJECT) = σ( +anger + ennui )
P(SILENCE) = σ( ennui^2 )
P(ANGER)   = σ( anger^2 * entropy )
P(OMEN)    = σ( curiosity * semantic_novelty )
P(WHISPER) = σ( trust * semantic_alignment )
```

Where σ = normalization to [0,1]

Final outcome:

```
outcome = weighted_random_pick([
  ACCEPT, REJECT, SILENCE, ANGER, OMEN, WHISPER
], probabilities)
```

---

## 7. Warm & Cold Memory Participation

Warm Memory (LRU) contributes:

- repetition score
- recent emotional spikes

Cold SQLite contributes:

- scars.count → anger decay modifier
- bonds.score → trust modifier

```
angerDecay = base_decay - scars.count * 0.05
trustGain  = base_gain + bonds.score * 0.1
```

---

## 8. Output Mapping (to CLI layer)

The Will-Engine NEVER outputs text.
Output type is passed to Response Model:

| Outcome | Renderer Effect            |
| ------- | -------------------------- |
| ACCEPT  | single short confirmation  |
| REJECT  | dismissive line            |
| SILENCE | no stdout                  |
| ANGER   | uppercase or glitch        |
| OMEN    | cryptic symbolic fragments |
| WHISPER | insight-like short phrase  |

---

## 9. Testing Rule

Testing MUST NOT verify “correctness of meaning”, only **shape of decision**.

Example test:

- High trust + low anger → ACCEPT appears with highest weight.

DO NOT assert deterministic outcome.

---

## 10. Implementation Contract

File location recommended:

```
forge/will-engine.ts
```

Function signature:

```ts
export function decide(intent: RitualIntent, context: WillContext): Outcome
```

---

End of File.
