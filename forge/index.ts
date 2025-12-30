// Forge Module - Core Machine-Spirit Implementation
// Barrel exports for clean importing

// Main orchestrator
export { Spirit } from './spirit'

// Engines (re-export from submodule)
export { EmotionEngine, LearningEngine, WillEngine } from './engines'

// Memory layers (re-export from submodule)
export { ColdMemory, SymbolicMemory, WarmMemory } from './memory'

// Types
export type {
  Association,
  ColdSnapshot,
  EmotionVector,
  LearningContext,
  Outcome,
  Scar,
  VocabToken,
  WarmSnapshot,
  WillContext,
} from './types'
