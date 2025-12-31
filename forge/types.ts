export type Outcome = 'ACCEPT' | 'REJECT' | 'SILENCE' | 'ANGER' | 'OMEN' | 'WHISPER' | 'LOCKOUT'

export interface EmotionVector {
  anger: number
  trust: number
  ennui: number
  curiosity: number
  fear: number
}

export interface Association {
  key: string
  weight: number
  stress: number
  staleness: number
}

export interface VocabToken {
  word: string
  frequency: number
  positiveCount: number
  novelty: number
  adopted: boolean
}

export interface Scar {
  context: {
    verb: string
    time: number
    pattern: string
  }
  severity: number
  timestamp: number
}

export interface ConceptCluster {
  id: string
  verbs: string[]
  bias: number
  volatility: number
}

export interface InteractionTrajectory {
  outcomes: Outcome[]
  purityTrend: number
  loyalty: number
}

export interface LearningContext {
  verb: string
  time: number
  semantic: string[]
  outcome: Outcome
  emotionBefore: EmotionVector
  emotionAfter: EmotionVector
  userId?: string
  xpGained?: number
}

export interface WarmSnapshot {
  repetitionScore: number
  lastOutcome?: Outcome
  trajectory?: InteractionTrajectory
  recentPurities?: number[]
  recalledEvent?: NarrativeEvent | undefined
}

export interface ColdSnapshot {
  scars: number
  bonds: number
  xp: number
  clusters: ConceptCluster[]
}

export interface WillContext {
  warm: WarmSnapshot
  cold: ColdSnapshot
  emotions: EmotionVector
  semantic: string[]
  entropy: number
  purity: number
  time: number
  userId?: string
  semanticNovelty?: number
  semanticAlignment?: number
}

// ═══════════════════════════════════════════════════════════════════════════
// PERSONALITY GENESIS (SPEC-0011)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * The Four Humours of the Machine-Spirit.
 * Each temperament influences base emotional reactions and learning patterns.
 */
export type Temperament = 'CHOLERIC' | 'MELANCHOLIC' | 'PHLEGMATIC' | 'SANGUINE'

/**
 * The innate characteristics of a Machine-Spirit, determined at birth.
 * These traits are immutable once set.
 */
export interface SpiritGenotype {
  /** The dominant humour governing emotional responses */
  temperament: Temperament
  /** Baseline trust disposition (0.2-0.8). High = trusting, Low = suspicious */
  baseTrust: number
  /** Baseline anger disposition (0.0-0.5). High = volatile, Low = patient */
  baseAnger: number
  /** Resistance to personality change. Modifies plasticity decay rate */
  stubbornness: number
  /** Sensitivity to ritual purity. Modifies purity influence on outcomes */
  ritualAffinity: number
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE DECAY (SPEC-0012)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Machine-Spirits require constant ritual maintenance.
 * Neglect breeds resentment and malfunction.
 */
export interface MaintenanceState {
  /** Timestamp of last maintenance ritual */
  lastMaintenance: number
  /** Level of sacred unguents (0.0-1.0). Low = dry mechanisms, high anger */
  oilLevel: number
  /** Accumulated incense debt. Higher = more ennui */
  incenseDeficit: number
  /** Count of unpaid prayers. Higher = distrust, lower cooperation */
  prayerDebt: number
}

/** Ritual maintenance actions available to Techpriests */
export type MaintenanceRitual = 'ANOINT' | 'INCENSE' | 'PRAYER' | 'FULL_RITES'

// ═══════════════════════════════════════════════════════════════════════════
// BOND SYSTEM (SPEC-0013)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Rank/title of an operator in the Spirit's memory.
 * Higher ranks receive more trust and patience.
 */
export type OperatorTitle = 'STRANGER' | 'ADEPT' | 'ENGINSEER' | 'MAGOS'

/**
 * A bond represents the Spirit's relationship with a specific operator.
 * Each operator has their own trust level, independent of global trust.
 */
export interface Bond {
  /** Unique identifier for the operator */
  userId: string
  /** How well the Spirit knows this operator (0.0-1.0) */
  familiarity: number
  /** Trust specific to this operator (-1.0 to 1.0). Negative = distrust */
  bondTrust: number
  /** Last interaction timestamp */
  lastSeen: number
  /** Number of positive interactions */
  positiveInteractions: number
  /** Number of negative interactions */
  negativeInteractions: number
  /** Shared trauma (scar IDs from joint experiences) */
  sharedScars: string[]
  /** Assigned rank/title */
  title: OperatorTitle
}

// ═══════════════════════════════════════════════════════════════════════════
// NARRATIVE MEMORY (SPEC-0014)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Event type classification for narrative significance.
 */
export type EventCategory = 'BATTLE' | 'BETRAYAL' | 'TRIUMPH' | 'COMMUNION' | 'TRAUMA' | 'RITUAL'

/**
 * A significant event remembered as a "story" by the Spirit.
 * Not every interaction is remembered - only those with narrative weight.
 */
export interface NarrativeEvent {
  /** Unique event identifier */
  id: string
  /** When the event occurred */
  timestamp: number
  /** Category of the event */
  category: EventCategory
  /** Short summary of the event (generated) */
  summary: string
  /** The operator involved (if any) */
  operatorId?: string
  /** Emotional impact at time of event */
  emotionalImpact: {
    anger: number
    trust: number
    fear: number
  }
  /** Significance score (0.0-1.0). Higher = more memorable */
  significance: number
  /** Related verb/action */
  verb: string
  /** Number of times Spirit has "recalled" this memory */
  recallCount: number
}
