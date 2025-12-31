import type { ConceptCluster, InteractionTrajectory, Outcome } from '../types'

export class CognitiveEngine {
  private clusters: ConceptCluster[] = []
  private xp: number = 0
  private stubbornness: number = 0.5

  // Default clusters as per SPEC-0010 proposals
  private readonly DEFAULT_CLUSTERS: ConceptCluster[] = [
    { id: 'TECHNICAL_OPS', verbs: ['deploy', 'run', 'execute', 'build'], bias: 0, volatility: 0.1 },
    {
      id: 'DESTRUCTIVE_OPS',
      verbs: ['delete', 'kill', 'purge', 'format', 'terminate'],
      bias: 0,
      volatility: 0.2,
    },
    { id: 'RITUAL_OPS', verbs: ['pray', 'offer', 'ritual', 'bless'], bias: 0, volatility: 0.05 },
    { id: 'INQUIRY_OPS', verbs: ['analyze', 'check', 'view', 'read'], bias: 0, volatility: 0.08 },
  ]

  constructor(
    initialXP: number = 0,
    initialClusters: ConceptCluster[] = [],
    stubbornness: number = 0.5
  ) {
    this.xp = initialXP
    this.clusters = initialClusters.length > 0 ? initialClusters : [...this.DEFAULT_CLUSTERS]
    this.stubbornness = stubbornness
  }

  /**
   * Returns current XP
   */
  getXP(): number {
    return this.xp
  }

  /**
   * Returns current clusters
   */
  getClusters(): ConceptCluster[] {
    return [...this.clusters]
  }

  /**
   * Calculates Plasticity based on Experience (SPEC-0010 Eq)
   * Modified by stubbornness: higher stubbornness = faster plasticity decay
   */
  getPlasticity(): number {
    // Base formula: 1 / sqrt(XP + 1)
    // Stubbornness amplifies the decay: multiply XP effect by (1 + stubbornness)
    const effectiveXP = this.xp * (1 + this.stubbornness)
    return 1 / Math.sqrt(effectiveXP + 1)
  }

  /**
   * Analyzes trajectory from recent outcomes
   */
  analyzeTrajectory(outcomes: Outcome[], purities: number[]): InteractionTrajectory {
    const loyalty = this.calculateLoyalty(outcomes)
    const purityTrend = this.calculatePurityTrend(purities)

    return {
      outcomes,
      purityTrend,
      loyalty,
    }
  }

  /**
   * Calculates trend of ritual purity (-1.0 to 1.0)
   * Positive means getting more respectful, negative means getting sloppier
   */
  private calculatePurityTrend(purities: number[]): number {
    if (undefined === purities || purities.length < 2) return 0

    let totalDelta = 0
    for (let i = 1; i < purities.length; i++) {
      const current = purities[i]
      const prev = purities[i - 1]
      if (current !== undefined && prev !== undefined) {
        totalDelta += current - prev
      }
    }

    return totalDelta / (purities.length - 1)
  }

  /**
   * Gains XP based on interaction significance
   */
  gainXP(amount: number): void {
    this.xp += amount
  }

  /**
   * Updates cluster biases based on verb outcome and potential trauma
   */
  updateClusters(verb: string, reward: number, traumaIntensity: number = 0): void {
    const plasticity = this.getPlasticity()

    for (const cluster of this.clusters) {
      if (cluster.verbs.includes(verb)) {
        // 1. Reinforce cluster bias based on reward and plasticity
        cluster.bias += reward * cluster.volatility * plasticity

        // 2. SPEC-0010 Section 2: "When verb:delete is scarred, the parent cluster... gains 25% of that severity"
        if (traumaIntensity > 0) {
          cluster.bias -= traumaIntensity * 0.25 * plasticity
        }

        cluster.bias = Math.max(-1, Math.min(1, cluster.bias))
      }
    }
  }

  /**
   * Returns cluster bias for a specific verb
   */
  getVerbBias(verb: string): number {
    const cluster = this.clusters.find((c) => c.verbs.includes(verb))
    return cluster ? cluster.bias : 0
  }

  private calculateLoyalty(outcomes: Outcome[]): number {
    if (outcomes.length === 0) return 0
    const positiveOutcomes = outcomes.filter((o) => o === 'ACCEPT' || o === 'WHISPER').length
    return positiveOutcomes / outcomes.length
  }
}
