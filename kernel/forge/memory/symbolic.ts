interface TokenWeight {
  token: string
  frequency: number
  lastSeen: number
  emotionalCharge: number // -1 to 1
}

export class SymbolicMemory {
  private tokens: Map<string, TokenWeight> = new Map()
  private emotionalKeywords: Record<string, number> = {
    fear: 0.4,
    death: 0.5,
    loss: 0.3,
    pain: 0.4,
    love: -0.3,
    hope: -0.2,
    peace: -0.3,
    destroy: 0.5,
    kill: 0.6,
    help: -0.2,
  }

  constructor() {}

  /**
   * Extract and track tokens from semantic input
   */
  ingest(semantic: string[]): void {
    const now = Date.now()

    for (const raw of semantic) {
      const token = this.normalize(raw)
      if (token.length < 3) continue

      const existing = this.tokens.get(token)
      if (existing) {
        existing.frequency++
        existing.lastSeen = now
      } else {
        this.tokens.set(token, {
          token,
          frequency: 1,
          lastSeen: now,
          emotionalCharge: this.emotionalKeywords[token] ?? 0,
        })
      }
    }
  }

  /**
   * Calculate semantic novelty score (0 to 1)
   * High novelty = many unseen or rare tokens
   */
  calculateNovelty(semantic: string[]): number {
    if (semantic.length === 0) return 0.5

    let noveltySum = 0
    for (const raw of semantic) {
      const token = this.normalize(raw)
      const existing = this.tokens.get(token)

      if (!existing) {
        noveltySum += 1.0 // Completely new = max novelty
      } else {
        // Lower frequency = higher novelty
        noveltySum += Math.max(0, 1 - existing.frequency / 20)
      }
    }

    return Math.min(1.0, noveltySum / semantic.length)
  }

  /**
   * Calculate semantic alignment score (0 to 1)
   * High alignment = tokens match Spirit's adopted vocabulary
   */
  calculateAlignment(semantic: string[], adoptedVocab: string[]): number {
    if (semantic.length === 0 || adoptedVocab.length === 0) return 0.5

    const adoptedSet = new Set(adoptedVocab.map((w) => this.normalize(w)))
    let matches = 0

    for (const raw of semantic) {
      const token = this.normalize(raw)
      if (adoptedSet.has(token)) {
        matches++
      }
    }

    return matches / semantic.length
  }

  /**
   * Check if semantic input contains taboo patterns
   * Returns severity (0 = none, 1 = critical)
   */
  checkTaboo(semantic: string[], tabooPatterns: string[]): number {
    const input = semantic.map((s) => this.normalize(s)).join(' ')
    let maxSeverity = 0

    for (const pattern of tabooPatterns) {
      if (input.includes(pattern.toLowerCase())) {
        maxSeverity = Math.max(maxSeverity, 0.8)
      }
    }

    return maxSeverity
  }

  /**
   * Get cumulative emotional charge from tokens
   */
  getEmotionalCharge(semantic: string[]): number {
    let charge = 0
    for (const raw of semantic) {
      const token = this.normalize(raw)
      const existing = this.tokens.get(token)
      if (existing) {
        charge += existing.emotionalCharge
      } else {
        charge += this.emotionalKeywords[token] ?? 0
      }
    }
    return Math.max(-1, Math.min(1, charge))
  }

  /**
   * Normalize token (lowercase, trim)
   */
  private normalize(token: string): string {
    return token
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
  }

  /**
   * Decay old tokens (called periodically)
   */
  decay(maxAge: number = 24 * 60 * 60 * 1000): void {
    const now = Date.now()
    for (const [, weight] of this.tokens.entries()) {
      if (now - weight.lastSeen > maxAge) {
        weight.frequency = Math.max(1, Math.floor(weight.frequency * 0.9))
      }
    }
  }
}
