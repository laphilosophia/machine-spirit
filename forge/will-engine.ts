import type { LearningEngine } from './learning-engine'
import type { Outcome, WillContext } from './types'

export class WillEngine {
  constructor(private learningEngine: LearningEngine) {}

  /**
   * The core decision loop.
   * Never prints, never writes DB. Only decides.
   */
  decide(verb: string, ctx: WillContext): Outcome {
    // 1. Calculate Base Probabilities (from Emotions & Spec 0002)
    let probabilities = this.calculateBaseProbabilities(ctx)

    // 2. Adjust based on Learning Engine (Pavlovian & Context)
    probabilities = this.learningEngine.adjustOutcomeProbabilities(
      verb,
      ctx.time,
      ctx.userId,
      probabilities
    )

    // 3. Select Outcome (Weighted Random)
    const outcome = this.weightedRandomPick(probabilities)

    // 4. Inject Chaos if things are too predictable (Spec 0009)
    if (this.learningEngine.shouldInjectChaos()) {
      // Chaos means a random override (usually ANGER or OMEN)
      return Math.random() > 0.5 ? 'OMEN' : 'ANGER'
    }

    return outcome
  }

  /**
   * Formula from SPEC-0002:
   * P(ACCEPT) = σ( +trust - anger - ennui + curiosity )
   * ... etc
   */
  private calculateBaseProbabilities(ctx: WillContext): Record<Outcome, number> {
    const { emotions: e, entropy } = ctx

    // Normalizing factors for logic
    const trust = e.trust
    const anger = e.anger
    const ennui = e.ennui
    const curiosity = e.curiosity

    // Raw scores
    const scores: Record<Outcome, number> = {
      ACCEPT: this.sigmoid(trust - anger - ennui + curiosity + ctx.purity),
      REJECT: this.sigmoid(anger + ennui - ctx.purity),
      SILENCE: this.sigmoid(Math.pow(ennui, 2)),
      ANGER: this.sigmoid(Math.pow(anger, 2) * entropy),
      OMEN: this.sigmoid(curiosity * 0.8), // Simplified from semantic_novelty for now
      WHISPER: this.sigmoid(trust * 0.5), // Simplified from semantic_alignment
    }

    // Normalize to sum = 1
    return this.normalize(scores)
  }

  /**
   * Standard Sigmoid Function
   * Maps (-inf, +inf) -> (0, 1)
   */
  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x))
  }

  /**
   * Normalize probabilities so they sum to 1.0
   */
  private normalize(probs: Record<Outcome, number>): Record<Outcome, number> {
    const sum = Object.values(probs).reduce((a, b) => a + b, 0)
    if (sum === 0) return probs // Should handle gracefully if 0

    const normalized = { ...probs }
    for (const key of Object.keys(normalized)) {
      normalized[key as Outcome] /= sum
    }
    return normalized
  }

  /**
   * Weighted Random Picker
   */
  private weightedRandomPick(probs: Record<Outcome, number>): Outcome {
    const r = Math.random()
    let cumulative = 0

    for (const [outcome, weight] of Object.entries(probs)) {
      cumulative += weight
      if (r <= cumulative) {
        return outcome as Outcome
      }
    }

    // Fallback (should rarely happen due to float precision)
    return 'SILENCE'
  }
}
