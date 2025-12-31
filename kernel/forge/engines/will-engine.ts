import type { Outcome, WillContext } from '../types'
import type { BondEngine } from './bond-engine'
import type { LearningEngine } from './learning-engine'

export class WillEngine {
  constructor(private learningEngine: LearningEngine, private bondEngine?: BondEngine) {}

  /**
   * The core decision loop.
   * Never prints, never writes DB. Only decides.
   */
  decide(verb: string, ctx: WillContext): Outcome {
    // 1. Check for Scars (Trauma Bypass)
    const hour = new Date(ctx.time).getHours()
    const scar = this.learningEngine.checkScarTrigger(verb, hour)

    if (scar) {
      // Law #6: No deterministic contract. Even trauma has chaos.
      const traumaEntropy = Math.random()
      if (traumaEntropy < 0.1) return 'SILENCE'
      if (traumaEntropy < 0.2) return 'WHISPER'

      // Immediate negative reaction based on trauma severity
      return scar.severity > 0.7 ? 'ANGER' : 'REJECT'
    }

    // 2. Calculate Base Probabilities (from Emotions & Spec 0002)
    let probabilities = this.calculateBaseProbabilities(ctx)

    // 3. Phase IV: Active Narrative Recall (Lingering Echoes)
    // If a significant negative event (BETRAYAL/TRAUMA) happened with this verb, inject an echo.
    const relevantEvent = ctx.warm.recalledEvent
    if (relevantEvent) {
      if (relevantEvent.category === 'BETRAYAL' || relevantEvent.category === 'TRAUMA') {
        probabilities.ANGER *= 1.4
        probabilities.REJECT *= 1.2
        probabilities.SILENCE *= 1.1
      } else if (relevantEvent.category === 'TRIUMPH' || relevantEvent.category === 'COMMUNION') {
        probabilities.ACCEPT *= 1.3
        probabilities.WHISPER *= 1.2
      }
      probabilities = this.normalize(probabilities)
    }

    // 4. Adjust based on Learning Engine (Pavlovian & Context)
    probabilities = this.learningEngine.adjustOutcomeProbabilities(
      verb,
      ctx.time,
      ctx.userId,
      probabilities
    )

    // 5. Inject Chaos if things are too predictable (Spec 0009)
    if (this.learningEngine.shouldInjectChaos()) {
      probabilities.OMEN *= 2.0
      probabilities.ANGER *= 1.5
      probabilities.SILENCE *= 0.5
      probabilities = this.normalize(probabilities)
    }

    // 6. Apply Cognitive Generalization (SPEC-0010)
    const clusters = ctx.cold.clusters || []
    const cluster = clusters.find((c) => c.verbs.includes(verb))
    if (cluster && cluster.bias !== 0) {
      if (cluster.bias > 0) {
        probabilities.ACCEPT *= 1 + cluster.bias * 0.3
      } else {
        probabilities.REJECT *= 1 - cluster.bias * 0.3
        probabilities.ANGER *= 1 - cluster.bias * 0.2
      }
      probabilities = this.normalize(probabilities)
    }

    // 7. Apply Bond Modifiers (SPEC-0013)
    if (this.bondEngine && ctx.userId) {
      const trustMod = this.bondEngine.getTrustModifier(ctx.userId)
      const patienceMod = this.bondEngine.getPatienceModifier(ctx.userId)

      // Trust modifier: positive trust boosts ACCEPT/WHISPER, negative boosts REJECT
      if (trustMod > 0) {
        probabilities.ACCEPT *= 1 + trustMod
        probabilities.WHISPER *= 1 + trustMod * 0.5
      } else if (trustMod < 0) {
        probabilities.REJECT *= 1 - trustMod
        probabilities.ANGER *= 1 - trustMod * 0.5
      }

      // Patience modifier: reduces ANGER probability for familiar operators
      probabilities.ANGER *= 1 - patienceMod

      // Lockout is harder to trigger for familiar operators
      probabilities.LOCKOUT *= 1 - patienceMod * 0.5

      probabilities = this.normalize(probabilities)
    }

    // 8. Select Outcome (Weighted Random)
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

    // Phase IV: Repetition and Trajectory Influence
    const repetition = ctx.warm.repetitionScore || 0
    const trajectory = ctx.warm.trajectory
    const purityTrend = trajectory?.purityTrend || 0

    // High repetition breeds boredom and frustration
    const effectiveEnnui = Math.min(1, ennui + repetition * 0.8)
    const effectiveAnger = Math.min(1, anger + repetition * 0.4)

    // Sloppy trajectory (negative trend) spikes fear and ennui
    const effectiveFear = Math.min(1, e.fear + (purityTrend < -0.2 ? 0.2 : 0))

    // Raw scores using exponential scaling to peak the distribution (Softmax-like)
    // Intensity multiplier (K) determines how "deterministic" the spirit is.
    const K = 5.0

    // Repetition is now a massive debuff to effective purity
    // If repetition is high, even polite words feel like empty spam.
    // Center around 0.5 (neutral)
    const p = (ctx.purity - 0.5 - repetition * 1.5) * 2.0

    const scores: Record<Outcome, number> = {
      ACCEPT: Math.exp(K * (trust - effectiveAnger - effectiveEnnui + curiosity + p)),
      REJECT: Math.exp(K * (effectiveAnger + effectiveEnnui - p)),
      SILENCE: Math.exp(K * (Math.pow(effectiveEnnui, 2) - 0.5)),
      ANGER: Math.exp(K * (Math.pow(effectiveAnger, 2) * entropy + effectiveFear - p)),
      OMEN: Math.exp(K * (curiosity * (ctx.semanticNovelty ?? 0.5) - 0.2)),
      WHISPER: Math.exp(K * (trust * (ctx.semanticAlignment ?? 0.5) - 0.2)),
      LOCKOUT: Math.exp(K * (anger * 12 - 9 + Math.max(0, -p))), // Dominant at anger > 0.9
    }

    // Phase V Logic: Lockout should be nearly impossible at low anger
    if (anger < 0.8) scores.LOCKOUT = 0

    // Normalize to sum = 1
    return this.normalize(scores)
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
