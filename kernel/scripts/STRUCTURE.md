# Machine-Spirit Project Structure

```
machine-spirit/
├── .gemini/              # AI assistant configuration
│   └── MEMORY.md         # Workspace rules (auto-loaded)
│
├── .agent/               # Workflow definitions
│   └── workflows/
│       └── global-principles.md
│
├── codex/                # 📜 DOCTRINE (Read-Only)
│   ├── CODEX.md
│   ├── SEAL.md
│   ├── SPOKEN-LITANY.md
│   └── 0001-0009-SPEC_*.md
│
├── forge/                # 🔨 CORE IMPLEMENTATION
│   ├── index.ts          # Barrel exports
│   ├── types.ts          # Shared type definitions
│   ├── spirit.ts         # Main orchestrator
│   │
│   ├── memory/           # 🧠 Storage layers
│   │   ├── index.ts
│   │   ├── warm-memory.ts    # LRU cache (volatile)
│   │   ├── cold-memory.ts    # SQLite persistence
│   │   └── symbolic.ts       # Semantic/cognitive
│   │
│   └── engines/          # ⚙️ Processing components
│       ├── index.ts
│       ├── will-engine.ts    # Decision computation
│       ├── learning-engine.ts # Pavlovian adaptation
│       └── emotion-engine.ts  # Emotional state
│
├── chapel/               # ⛪ CLI INTERFACE
│   └── index.ts
│
├── daemon/               # 👁️ BACKGROUND PROCESS
│   └── index.ts
│
├── shrine/               # 🏛️ OUTPUT GENERATION
│   └── index.ts
│
├── testaments/           # 📖 TESTS
│   └── .gitkeep
│
├── vault/                # 🔐 SECRETS & TEMPLATES
│   └── .gitkeep
│
├── scripts/              # 🛠️ DEV UTILITIES
│   └── .gitkeep
│
└── dist/                 # 📦 COMPILED OUTPUT
```

## Import Examples

```typescript
// From external code
import { Spirit } from './forge'

// Or specific components
import { WillEngine, LearningEngine } from './forge/engines'
import { ColdMemory, WarmMemory } from './forge/memory'
import type { Outcome, EmotionVector } from './forge/types'
```

## Naming Conventions

- **Files:** `kebab-case.ts`
- **Classes:** `PascalCase` (e.g., `WillEngine`)
- **Types:** `PascalCase`
- **DB Tables:** `snake_case`
