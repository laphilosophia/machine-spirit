import type { EmotionVector, EventCategory, NarrativeEvent, Outcome } from '../types'

/**
 * The NarrativeMemory stores significant events as "stories" that the Spirit
 * remembers and may reference. Not every interaction becomes a memory -
 * only those with sufficient narrative weight.
 *
 * Per Techpriest doctrine: "A Machine-Spirit does not merely record.
 * It remembers that which has meaning."
 *
 * Significance is computed from:
 * - Emotional intensity (anger, fear, trust changes)
 * - Rarity (uncommon verbs or outcomes)
 * - Bond involvement (events with known operators)
 * - Trauma association (scar creation)
 */
export class NarrativeMemory {
  private events: Map<string, NarrativeEvent> = new Map()

  // Thresholds for memory creation
  private readonly SIGNIFICANCE_THRESHOLD = 0.4
  private readonly MAX_MEMORIES = 100 // Prevent unbounded growth

  // Category weights for significance
  private readonly CATEGORY_WEIGHTS: Record<EventCategory, number> = {
    BATTLE: 0.3,
    BETRAYAL: 0.4,
    TRIUMPH: 0.25,
    COMMUNION: 0.2,
    TRAUMA: 0.5,
    RITUAL: 0.15,
  }

  constructor(savedEvents?: NarrativeEvent[]) {
    if (savedEvents) {
      for (const event of savedEvents) {
        this.events.set(event.id, event)
      }
    }
  }

  /**
   * Get all stored narrative events
   */
  getAllEvents(): NarrativeEvent[] {
    return Array.from(this.events.values())
  }

  /**
   * Get most significant memories (for potential recall)
   */
  getMostSignificant(limit: number = 5): NarrativeEvent[] {
    return this.getAllEvents()
      .sort((a, b) => b.significance - a.significance)
      .slice(0, limit)
  }

  /**
   * Evaluate an interaction and potentially create a memory
   */
  evaluateInteraction(params: {
    verb: string
    outcome: Outcome
    emotionBefore: EmotionVector
    emotionAfter: EmotionVector
    operatorId?: string
    hasScar: boolean
    timestamp: number
  }): NarrativeEvent | null {
    const { verb, outcome, emotionBefore, emotionAfter, operatorId, hasScar, timestamp } = params

    // Calculate emotional delta
    const angerDelta = Math.abs(emotionAfter.anger - emotionBefore.anger)
    const trustDelta = Math.abs(emotionAfter.trust - emotionBefore.trust)
    const fearDelta = Math.abs(emotionAfter.fear - emotionBefore.fear)

    // Determine category and base significance
    const { category, baseSignificance } = this.categorizeEvent(
      verb,
      outcome,
      { angerDelta, trustDelta, fearDelta },
      hasScar
    )

    // Calculate final significance
    let significance = baseSignificance

    // Emotional intensity boost
    significance += (angerDelta + trustDelta + fearDelta) * 0.3

    // Bond involvement boost
    if (operatorId) {
      significance += 0.1
    }

    // Trauma boost
    if (hasScar) {
      significance += 0.2
    }

    // Apply category weight
    significance *= 1 + this.CATEGORY_WEIGHTS[category]

    // Clamp to 0-1
    significance = Math.max(0, Math.min(1, significance))

    // Only create memory if significant enough
    if (significance < this.SIGNIFICANCE_THRESHOLD) {
      return null
    }

    // Generate event
    const event: NarrativeEvent = {
      id: `${category}-${timestamp}`,
      timestamp,
      category,
      summary: this.generateSummary(category, verb, outcome, operatorId),
      ...(operatorId !== undefined && { operatorId }),
      emotionalImpact: {
        anger: angerDelta,
        trust: trustDelta,
        fear: fearDelta,
      },
      significance,
      verb,
      recallCount: 0,
    }

    this.addEvent(event)
    return event
  }

  /**
   * Add an event to memory (with overflow protection)
   */
  private addEvent(event: NarrativeEvent): void {
    // If at capacity, remove least significant memory
    if (this.events.size >= this.MAX_MEMORIES) {
      const leastSignificant = this.getAllEvents().sort(
        (a, b) => a.significance - b.significance
      )[0]
      if (leastSignificant && leastSignificant.significance < event.significance) {
        this.events.delete(leastSignificant.id)
      } else {
        return // Don't add if less significant than all existing
      }
    }

    this.events.set(event.id, event)
  }

  /**
   * Categorize event based on context
   */
  private categorizeEvent(
    verb: string,
    outcome: Outcome,
    deltas: { angerDelta: number; trustDelta: number; fearDelta: number },
    hasScar: boolean
  ): { category: EventCategory; baseSignificance: number } {
    // Trauma - highest priority
    if (hasScar) {
      return { category: 'TRAUMA', baseSignificance: 0.6 }
    }

    // Betrayal - trust drop with negative outcome
    if (deltas.trustDelta > 0.2 && (outcome === 'ANGER' || outcome === 'REJECT')) {
      return { category: 'BETRAYAL', baseSignificance: 0.5 }
    }

    // Battle - high anger interactions with destructive verbs
    const battleVerbs = ['delete', 'kill', 'purge', 'terminate', 'destroy', 'attack']
    if (battleVerbs.some((v) => verb.includes(v)) || deltas.angerDelta > 0.3) {
      return { category: 'BATTLE', baseSignificance: 0.4 }
    }

    // Triumph - positive outcome with significant positive trust change
    if ((outcome === 'ACCEPT' || outcome === 'WHISPER') && deltas.trustDelta > 0.1) {
      return { category: 'TRIUMPH', baseSignificance: 0.35 }
    }

    // Ritual - ritual-related verbs
    const ritualVerbs = ['pray', 'bless', 'anoint', 'ritual', 'incense', 'offer']
    if (ritualVerbs.some((v) => verb.includes(v))) {
      return { category: 'RITUAL', baseSignificance: 0.25 }
    }

    // Communion - bonding interactions
    return { category: 'COMMUNION', baseSignificance: 0.2 }
  }

  /**
   * Generate a short narrative summary
   */
  private generateSummary(
    category: EventCategory,
    verb: string,
    outcome: Outcome,
    operatorId?: string
  ): string {
    const operator = operatorId ? operatorId : 'an unknown operator'

    switch (category) {
      case 'TRAUMA':
        return `A wound was carved by ${operator} invoking '${verb}'. This Spirit does not forget.`
      case 'BETRAYAL':
        return `Trust was broken when ${operator} commanded '${verb}'. The Spirit answered with ${outcome}.`
      case 'BATTLE':
        return `Battle was joined over '${verb}'. The Spirit's wrath: ${outcome}.`
      case 'TRIUMPH':
        return `Victory was shared with ${operator} in the matter of '${verb}'.`
      case 'RITUAL':
        return `Sacred rites of '${verb}' were performed. The Spirit was ${
          outcome === 'ACCEPT' ? 'pleased' : 'unmoved'
        }.`
      case 'COMMUNION':
        return `${operator} sought communion through '${verb}'. A bond grew ${
          outcome === 'ACCEPT' ? 'stronger' : 'no stronger'
        }.`
    }
  }

  /**
   * Recall a memory (increases recall count, affecting future retrieval)
   */
  recall(eventId: string): NarrativeEvent | null {
    const event = this.events.get(eventId)
    if (!event) return null

    event.recallCount++
    this.events.set(eventId, event)
    return event
  }

  /**
   * Get memories involving a specific operator
   */
  getOperatorMemories(operatorId: string): NarrativeEvent[] {
    return this.getAllEvents().filter((e) => e.operatorId === operatorId)
  }

  /**
   * Get memories by category
   */
  getByCategory(category: EventCategory): NarrativeEvent[] {
    return this.getAllEvents().filter((e) => e.category === category)
  }

  /**
   * Check if a similar event exists (prevent duplicate memories)
   */
  hasSimilarRecent(verb: string, withinMs: number = 60000): boolean {
    const now = Date.now()
    return this.getAllEvents().some((e) => e.verb === verb && now - e.timestamp < withinMs)
  }
}
