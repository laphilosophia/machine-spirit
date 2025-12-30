export class WarmMemory {
  private cache: Map<string, number> = new Map()
  private readonly MAX_SIZE = 128
  private recentInputs: string[] = []

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
   * Calculates repetition score (0.0 to 1.0)
   * Based on frequency of this exact input in recent history
   */
  calculateRepetitionScore(input: string): number {
    if (this.recentInputs.length === 0) return 0

    const matches = this.recentInputs.filter((i) => i === input).length
    // 1 match = 0 (it's this one), 2 matches = 0.2, 5 matches = 1.0
    return Math.min(1.0, (matches - 1) * 0.2)
  }

  getSnapshot(): { repetitionScore: number } {
    // This is a simplified snapshot based on the *last* item pushed
    // In reality, the Spirit asks about the *current* input.
    // So this might need the input as arg, or assume the last pushed IS the current.
    // Spec says: "checks redundancy against Warm Memory"
    const lastInput = this.recentInputs[this.recentInputs.length - 1] || ''
    return {
      repetitionScore: this.calculateRepetitionScore(lastInput),
    }
  }
}
