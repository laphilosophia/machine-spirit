import type { Outcome } from '../types'

export class WarmMemory {
  private cache: Map<string, number> = new Map()
  private readonly MAX_SIZE = 128
  private recentInputs: string[] = []
  private recentPurities: number[] = []
  private lastOutcome: Outcome | undefined = undefined

  constructor() {}

  /**
   * Adds an item to the cache, managing LRU eviction
   */
  push(key: string): void {
    // If exists, delete to re-add at end (refresh)
    if (this.cache.has(key)) {
      this.cache.delete(key)
    } else if (this.cache.size >= this.MAX_SIZE) {
      // Evict oldest (first item in Map iterator)
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) this.cache.delete(oldestKey)
    }

    this.cache.set(key, Date.now())

    // Track exact text for repetition scoring
    this.recentInputs.push(key)
    if (this.recentInputs.length > 20) {
      this.recentInputs.shift()
    }
  }

  /**
   * Track ritual purity for trend analysis
   */
  pushPurity(purity: number): void {
    this.recentPurities.push(purity)
    if (this.recentPurities.length > 10) {
      this.recentPurities.shift()
    }
  }

  /**
   * Record the outcome of the last interaction
   */
  recordOutcome(outcome: Outcome): void {
    this.lastOutcome = outcome
  }

  /**
   * Calculates repetition score (0.0 to 1.0)
   * Based on frequency of this exact input in recent history
   */
  calculateRepetitionScore(input: string): number {
    if (this.recentInputs.length === 0) return 0

    const matches = this.recentInputs.filter((i) => i === input || i.includes(input)).length
    // 1 match = 0, 10 matches = 1.0 (more gradual fatigue)
    return Math.min(1.0, (matches - 1) * 0.1)
  }

  getSnapshot(): { repetitionScore: number; lastOutcome?: Outcome; recentPurities: number[] } {
    const lastInput = this.recentInputs[this.recentInputs.length - 1] || ''
    return {
      repetitionScore: this.calculateRepetitionScore(lastInput),
      recentPurities: [...this.recentPurities],
      ...(this.lastOutcome !== undefined && { lastOutcome: this.lastOutcome }),
    }
  }
}
