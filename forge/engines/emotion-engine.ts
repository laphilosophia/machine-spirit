import type { EmotionVector, Outcome } from '../types'

export class EmotionEngine {
  private state: EmotionVector = {
    anger: 0.1,
    trust: 0.5,
    ennui: 0.1,
    curiosity: 0.5,
    fear: 0.0,
  }

  constructor() {}

  getCurrentState(): EmotionVector {
    return { ...this.state }
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
    // 1. Purity Impact
    if (purity < 0.5) {
      this.state.anger += (0.5 - purity) * 0.2
      this.state.trust -= (0.5 - purity) * 0.1
    } else {
      this.state.trust += (purity - 0.5) * 0.1
      this.state.anger -= (purity - 0.5) * 0.1
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
    for (const k of keys) {
      this.state[k] = Math.max(0, Math.min(1, this.state[k]))
    }
  }
}
