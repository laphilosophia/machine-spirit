import type {
  Association,
  EmotionVector,
  LearningContext,
  Outcome,
  Scar,
  VocabToken,
} from './types'

export class LearningEngine {
  private associations: Map<string, Association> = new Map()
  private vocabulary: Map<string, VocabToken> = new Map()
  private scars: Scar[] = []

  private readonly ACCEPT_WEIGHT_GAIN = 0.05
  private readonly REJECT_WEIGHT_LOSS = -0.1
  private readonly STRESS_INCREASE = 0.2
  private readonly STRESS_RELIEF = -0.15
  private readonly STALENESS_INCREASE = 0.1
  private readonly STALENESS_DECAY = -0.05
  private readonly VOCAB_ADOPTION_THRESHOLD = 10

  /**
   * Core learning update after each interaction
   */
  learn(context: LearningContext): void {
    this.updateAssociations(context)
    this.captureVocabulary(context)
    this.evaluateTrauma(context)
  }

  /**
   * Multi-dimensional association keys
   * Creates combinations: verb, verb+time, verb+user
   */
  private updateAssociations(ctx: LearningContext): void {
    const hour = new Date(ctx.time).getHours()
    const timeOfDay = this.categorizeTime(hour)

    // Generate multiple association keys
    const keys: string[] = [`verb:${ctx.verb}`, `verb:${ctx.verb}:time:${timeOfDay}`]

    if (ctx.userId) {
      keys.push(`verb:${ctx.verb}:user:${ctx.userId}`)
    }

    // Update all relevant associations
    keys.forEach((key) => {
      const assoc = this.getOrCreateAssociation(key)

      switch (ctx.outcome) {
        case 'ACCEPT':
          assoc.weight = Math.min(1.0, assoc.weight + this.ACCEPT_WEIGHT_GAIN)
          if (assoc.stress > 0) {
            assoc.stress = Math.max(0, assoc.stress + this.STRESS_RELIEF)
          }
          if (assoc.staleness > 0) {
            assoc.staleness = Math.max(0, assoc.staleness + this.STALENESS_DECAY)
          }
          break

        case 'REJECT':
        case 'ANGER':
          assoc.weight = Math.max(-1.0, assoc.weight + this.REJECT_WEIGHT_LOSS)
          assoc.stress = Math.min(1.0, assoc.stress + this.STRESS_INCREASE)
          break

        case 'SILENCE':
          assoc.staleness = assoc.staleness + this.STALENESS_INCREASE
          break
      }

      this.associations.set(key, assoc)
    })
  }

  /**
   * Helper to categorize time into periods
   */
  private categorizeTime(hour: number): string {
    if (hour >= 6 && hour < 12) return 'morning'
    if (hour >= 12 && hour < 18) return 'afternoon'
    if (hour >= 18 && hour < 22) return 'evening'
    return 'night'
  }

  /**
   * Vocabulary osmosis - capture and adopt operator language
   */
  private captureVocabulary(ctx: LearningContext): void {
    const isPositive = ctx.outcome === 'ACCEPT' || ctx.outcome === 'WHISPER'

    for (const token of ctx.semantic) {
      if (token.length < 3) continue

      const vocab = this.vocabulary.get(token) || {
        word: token,
        frequency: 0,
        positiveCount: 0,
        novelty: 1.0,
        adopted: false,
      }

      vocab.frequency++
      if (isPositive) vocab.positiveCount++
      vocab.novelty *= 0.95

      if (!vocab.adopted && vocab.positiveCount >= this.VOCAB_ADOPTION_THRESHOLD) {
        vocab.adopted = true
      }

      this.vocabulary.set(token, vocab)
    }
  }

  /**
   * Trauma learning - create permanent scars from pain events
   */
  private evaluateTrauma(ctx: LearningContext): void {
    const emotionDelta = {
      anger: ctx.emotionAfter.anger - ctx.emotionBefore.anger,
      fear: ctx.emotionAfter.fear - ctx.emotionBefore.fear,
      ennui: ctx.emotionAfter.ennui - ctx.emotionBefore.ennui,
    }

    const traumaThreshold = 0.5
    if (emotionDelta.anger > traumaThreshold || emotionDelta.fear > traumaThreshold) {
      this.scars.push({
        context: {
          verb: ctx.verb,
          time: new Date(ctx.time).getHours(),
          pattern: ctx.semantic.slice(0, 3).join(' '),
        },
        severity: Math.max(emotionDelta.anger, emotionDelta.fear),
        timestamp: ctx.time,
      })
    }
  }

  /**
   * Check if current context triggers a scar
   */
  checkScarTrigger(verb: string, hour: number): Scar | null {
    return (
      this.scars.find((scar) => scar.context.verb === verb && scar.context.time === hour) || null
    )
  }

  /**
   * Q-Learning variant: compute reward signal
   */
  computeReward(emotionBefore: EmotionVector, emotionAfter: EmotionVector): number {
    const angerReduction = emotionBefore.anger - emotionAfter.anger
    const trustIncrease = emotionAfter.trust - emotionBefore.trust
    const ennuiPenalty = emotionAfter.ennui - emotionBefore.ennui

    return angerReduction * 0.5 + trustIncrease * 0.8 - ennuiPenalty * 0.3
  }

  /**
   * Context-aware probability adjustment
   * Checks multiple association layers
   */
  adjustOutcomeProbabilities(
    verb: string,
    time: number,
    userId: string | undefined,
    baseProbabilities: Record<Outcome, number>
  ): Record<Outcome, number> {
    const hour = new Date(time).getHours()
    const timeOfDay = this.categorizeTime(hour)

    // Fetch all relevant associations, prioritize specific over general
    const assocKeys = [
      userId ? `verb:${verb}:user:${userId}` : null,
      `verb:${verb}:time:${timeOfDay}`,
      `verb:${verb}`,
    ].filter(Boolean) as string[]

    const adjusted = { ...baseProbabilities }

    // Apply adjustments from most specific to least specific
    for (const key of assocKeys) {
      const assoc = this.associations.get(key)
      if (!assoc) continue

      // Weight influence
      if (assoc.weight > 0) {
        adjusted.ACCEPT *= 1 + assoc.weight * 0.5
        adjusted.REJECT *= 1 - assoc.weight * 0.3
      }

      if (assoc.weight < 0) {
        adjusted.REJECT *= 1 - assoc.weight * 0.5
        adjusted.ANGER *= 1 - assoc.weight * 0.3
        adjusted.ACCEPT *= 1 + assoc.weight * 0.5
      }

      // Stress influence
      if (assoc.stress > 0.5) {
        adjusted.ANGER *= 1 + assoc.stress
      }

      // Staleness influence
      if (assoc.staleness > 0.3) {
        adjusted.SILENCE *= 1 + assoc.staleness
      }
    }

    // Normalize
    const sum = Object.values(adjusted).reduce((a, b) => a + b, 0)
    Object.keys(adjusted).forEach((k) => {
      adjusted[k as Outcome] /= sum
    })

    return adjusted
  }

  /**
   * Get adopted vocabulary for omen/whisper generation
   */
  getAdoptedVocabulary(): string[] {
    return Array.from(this.vocabulary.values())
      .filter((v) => v.adopted)
      .map((v) => v.word)
  }

  /**
   * Chaos injection - prevent over-predictability
   */
  shouldInjectChaos(): boolean {
    const weights = Array.from(this.associations.values()).map((a) => Math.abs(a.weight))

    if (weights.length === 0) return false

    const avgWeight = weights.reduce((a, b) => a + b, 0) / weights.length
    return avgWeight > 0.8
  }

  private getOrCreateAssociation(key: string): Association {
    return (
      this.associations.get(key) || {
        key,
        weight: 0,
        stress: 0,
        staleness: 0,
      }
    )
  }

  /**
   * Binary serialization option for scale
   */
  serialize(compress: boolean = false): string | Buffer {
    const data = {
      associations: Array.from(this.associations.entries()),
      vocabulary: Array.from(this.vocabulary.entries()),
      scars: this.scars,
    }

    if (!compress) {
      return JSON.stringify(data)
    }

    // For production: use msgpack or similar
    // return msgpack.encode(data);
    return JSON.stringify(data)
  }

  deserialize(data: string | Buffer, compressed: boolean = false): void {
    const parsed = compressed ? JSON.parse(data.toString()) : JSON.parse(data as string)

    this.associations = new Map(parsed.associations)
    this.vocabulary = new Map(parsed.vocabulary)
    this.scars = parsed.scars
  }
}
