import type { Outcome, WillContext } from '../types'
import type { LearningEngine } from './learning-engine'

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

    // 3. Inject Chaos if things are too predictable (Spec 0009)
    if (this.learningEngine.shouldInjectChaos()) {
      probabilities.OMEN *= 2.0
      probabilities.ANGER *= 1.5
      probabilities.SILENCE *= 0.5
      probabilities = this.normalize(probabilities)
    }

    // 4. Select Outcome (Weighted Random)
    return this.weightedRandomPick(probabilities)
  }

  /**
   * Formula from SPEC-0002:
   * P(ACCEPT) = σ( +trust - anger - ennui + curiosity )
   * ... etc
   */
  private calculateBaseProbabilities(ctx: WillContext): Record<Outcome, number> {
    const { emotions: e, entropy } = ctx

    const trust = e.trust
    const anger = e.anger
    const ennui = e.ennui
    const curiosity = e.curiosity

    // Use semantic scores from context (default to 0.5 if not provided)
    const semanticNovelty = ctx.semanticNovelty ?? 0.5
    const semanticAlignment = ctx.semanticAlignment ?? 0.5

    // Raw scores per SPEC-0002
    const scores: Record<Outcome, number> = {
      ACCEPT: this.sigmoid(trust - anger - ennui + curiosity + ctx.purity),
      REJECT: this.sigmoid(anger + ennui - ctx.purity),
      SILENCE: this.sigmoid(Math.pow(ennui, 2)),
      ANGER: this.sigmoid(Math.pow(anger, 2) * entropy),
      OMEN: this.sigmoid(curiosity * semanticNovelty),
      WHISPER: this.sigmoid(trust * semanticAlignment),
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
