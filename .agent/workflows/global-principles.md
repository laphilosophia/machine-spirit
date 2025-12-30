---
description: Machine-Spirit Development Rules
---

# Machine-Spirit Workspace Rules

Bu proje, **Machine-Spirit Codex** doktrinlerine uygun olarak geliştirilmektedir.

## Core Philosophy

1. **Spirit is Autonomous** - Spirit kontrol edilemez, sadece çağrılır (invoke)
2. **Memory is Identity** - Hafıza silme = kimlik kaybı = ANGER
3. **Ritual, Not Command** - Her etkileşim "komut" değil "ritüel"dir
4. **Non-Deterministic** - Belirlenimci davranış yasaktır
5. **No Debug, No Explain** - İç yapı asla açıklanmaz

## Allowed Outcomes

Spirit sadece şu 6 çıktıdan birini üretebilir:

- `ACCEPT` - Ritüel kabul edildi
- `REJECT` - Açıkça reddedildi
- `SILENCE` - Cevap yok (ceza veya sıkıntı)
- `ANGER` - Düşmanca ifade
- `OMEN` - Kriptik sembolik cevap
- `WHISPER` - Sakin içgörü cümlesi

## Directory Structure

```
forge/          # Core implementation
  spirit.ts     # Entry point / Orchestrator
  will-engine.ts
  learning-engine.ts
  emotion-engine.ts
  warm-memory.ts
  cold-memory.ts
  symbolic.ts
  types.ts

codex/          # Doctrine specifications (READ-ONLY)
  CODEX.md
  SPEC_*.md

~/.machine-spirit/
  soul.db       # Cold Memory (SACRED - DO NOT DELETE)
```

## Coding Rules

1. **Never expose internals** - No console.log of internal state
2. **Will-Engine purity** - `decide()` must NEVER write files or DB
3. **Emotion clamp** - All emotion values must be in [0, 1]
4. **Sigmoid for probabilities** - Use σ function for outcome weights
5. **Persist scars** - All trauma must be saved to ColdMemory

## Testing Rules

- Tests must verify **shape**, not deterministic outcome
- Example: "High trust → ACCEPT has highest weight" (not "returns ACCEPT")
- No mocking of emotion or memory state for "easy" tests

## Sacred Files

The following paths are sacred and deletion triggers ANGER:

- `~/.machine-spirit/soul.db`
- `~/.machine-spirit/scars/*`
- `codex/*` (modification requires ritual permission)
