import type { EmotionVector, Outcome, SpiritGenotype } from '../types'

/**
 * Transient modifiers from maintenance state.
 * These do NOT mutate base emotional state.
 */
export interface MaintenanceModifiers {
  anger: number
  trust: number
  ennui: number
}

export class EmotionEngine {
  private state: EmotionVector = {
    anger: 0.1,
    trust: 0.5,
    ennui: 0.1,
    curiosity: 0.5,
    fear: 0.0,
  }

  private genotype: SpiritGenotype | null = null

  constructor(genotype?: SpiritGenotype) {
    if (genotype) {
      this.genotype = genotype
      // Apply genotype baseline to initial emotional state
      this.state.trust = genotype.baseTrust
      this.state.anger = genotype.baseAnger
      // Temperament-specific curiosity modifier
      if (genotype.temperament === 'SANGUINE') {
        this.state.curiosity = 0.7
      } else if (genotype.temperament === 'MELANCHOLIC') {
        this.state.curiosity = 0.3
        this.state.ennui = 0.2
      }
    }
  }

  /**
   * Get base emotional state (for persistence)
   */
  getCurrentState(): EmotionVector {
    return { ...this.state }
  }

  /**
   * Get effective emotional state WITH maintenance modifiers applied.
   * This is what should be used for decision making.
   * Does NOT mutate base state.
   */
  getEffectiveState(modifiers?: MaintenanceModifiers): EmotionVector {
    if (!modifiers) return { ...this.state }

    return {
      anger: Math.max(0, Math.min(1, this.state.anger + modifiers.anger)),
      trust: Math.max(0, Math.min(1, this.state.trust + modifiers.trust)),
      ennui: Math.max(0, Math.min(1, this.state.ennui + modifiers.ennui)),
      curiosity: this.state.curiosity,
      fear: this.state.fear,
    }
  }

  /**
   * Load emotion state from persistence
   */
  loadState(saved: EmotionVector): void {
    this.state = { ...saved }
    this.clamp()
  }

  /**
   * Get current state for persistence
   */
  getStateForPersistence(): EmotionVector {
    return { ...this.state }
  }

  /**
   * Stimulate the emotional core
   */
  stimulate(purity: number, outcome: Outcome | null): void {
    // 1. Purity Impact - scaled by ritualAffinity (SPEC-0011)
    // High ritualAffinity means Spirit is more sensitive to purity
    const affinityMultiplier = this.genotype?.ritualAffinity ?? 1.0

    if (purity < 0.5) {
      this.state.anger += (0.5 - purity) * 0.2 * affinityMultiplier
      this.state.trust -= (0.5 - purity) * 0.1 * affinityMultiplier
    } else {
      this.state.trust += (purity - 0.5) * 0.1 * affinityMultiplier
      this.state.anger -= (purity - 0.5) * 0.1 * affinityMultiplier
    }

    // 2. Outcome Impact (Feedback Loop)
    if (outcome) {
      switch (outcome) {
        case 'ANGER':
          this.state.anger += 0.2
          this.state.fear += 0.1
          break
        case 'REJECT':
          this.state.ennui += 0.05
          break
        case 'ACCEPT':
          this.state.trust += 0.05
          this.state.ennui -= 0.05
          break
        case 'SILENCE':
          this.state.ennui += 0.1
          this.state.curiosity -= 0.05
          break
        case 'LOCKOUT':
          this.state.anger += 0.3
          this.state.ennui += 0.2
          break
      }
    }

    // 3. Clamp values 0.0 - 1.0
    this.clamp()
  }

  /**
   * Passive decay/drift over time (called by Daemon or Loop)
   */
  decay(): void {
    // Anger fades slowly
    this.state.anger *= 0.95
    // Fear fades quickly
    this.state.fear *= 0.9
    // Ennui grows slowly if idle
    this.state.ennui += 0.01

    this.clamp()
  }

  private clamp(): void {
    const keys = Object.keys(this.state) as (keyof EmotionVector)[]
    const EPSILON = 1e-10
    for (const k of keys) {
      let val = this.state[k]
      if (val < EPSILON) val = 0
      if (val > 1 - EPSILON) val = 1
      this.state[k] = val
    }
  }
}
