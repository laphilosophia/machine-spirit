export type Outcome = 'ACCEPT' | 'REJECT' | 'SILENCE' | 'ANGER' | 'OMEN' | 'WHISPER'

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
