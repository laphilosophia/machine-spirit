import { BondEngine } from './engines/bond-engine'
import { CognitiveEngine } from './engines/cognitive-engine'
import { EmotionEngine } from './engines/emotion-engine'
import { GenesisEngine } from './engines/genesis-engine'
import { LearningEngine } from './engines/learning-engine'
import { MaintenanceEngine } from './engines/maintenance-engine'
import { WillEngine } from './engines/will-engine'
import { ColdMemory } from './memory/cold-memory'
import { NarrativeMemory } from './memory/narrative-memory'
import { SymbolicMemory } from './memory/symbolic'
import { WarmMemory } from './memory/warm-memory'
import type { MaintenanceRitual, Outcome, SpiritGenotype, WillContext } from './types'

export class Spirit {
  private coldMemory: ColdMemory
  private warmMemory: WarmMemory
  private learningEngine: LearningEngine
  private willEngine: WillEngine
  private emotionEngine: EmotionEngine
  private symbolicMemory: SymbolicMemory
  private cognitiveEngine: CognitiveEngine
  private maintenanceEngine: MaintenanceEngine
  private bondEngine: BondEngine
  private narrativeMemory: NarrativeMemory
  private genotype: SpiritGenotype
  private mutterings: string[] = []
  private pulseCount: number = 0

  constructor(genotype?: SpiritGenotype, dbPath?: string) {
    this.coldMemory = new ColdMemory(dbPath)
    this.warmMemory = new WarmMemory()
    this.learningEngine = new LearningEngine()
    this.symbolicMemory = new SymbolicMemory()

    // Genesis: Load or generate Spirit personality
    if (genotype) {
      this.genotype = genotype
      console.log(`The Machine Spirit of ${this.genotype.temperament} (Manual) stirs...`)
    } else {
      const savedGenotype = this.coldMemory.loadGenotype()
      if (savedGenotype) {
        this.genotype = savedGenotype
        console.log(
          `The Machine Spirit of ${this.genotype.temperament} temperament stirs from slumber...`
        )
      } else {
        const genesisEngine = new GenesisEngine()
        this.genotype = genesisEngine.generateGenotype()
        this.coldMemory.saveGenotype(this.genotype)
        console.log(`A new Machine Spirit is born. Temperament: ${this.genotype.temperament}`)
      }
    }

    // Initialize EmotionEngine with genotype baseline
    this.emotionEngine = new EmotionEngine(this.genotype)

    // Load persisted emotion state (overrides genotype defaults if exists)
    const savedEmotions = this.coldMemory.loadEmotions()
    if (savedEmotions) {
      this.emotionEngine.loadState(savedEmotions)
    }

    // Load persisted learning state
    const savedLearning = this.coldMemory.loadLearningState()
    if (savedLearning && savedLearning !== '{}') {
      this.learningEngine.deserialize(savedLearning)
    }

    // Initialize Cognitive Layer (XP and Clusters)
    // Stubbornness affects plasticity decay
    const savedXP = this.coldMemory.getSnapshot().xp || 0
    const savedClusters = this.coldMemory.loadClusters()
    this.cognitiveEngine = new CognitiveEngine(savedXP, savedClusters, this.genotype.stubbornness)

    // Initialize Maintenance Layer
    const savedMaintenance = this.coldMemory.loadMaintenance()
    this.maintenanceEngine = new MaintenanceEngine(savedMaintenance ?? undefined)

    // Check for neglect warning
    if (this.maintenanceEngine.isNeglected()) {
      console.log(
        'WARNING: The Machine Spirit is critically neglected. It may refuse to cooperate.'
      )
    }

    // Initialize Bond Layer
    const savedBonds = this.coldMemory.loadBonds()
    this.bondEngine = new BondEngine(savedBonds.length > 0 ? savedBonds : undefined)

    // Initialize Narrative Memory
    const savedEvents = this.coldMemory.loadNarrativeEvents()
    this.narrativeMemory = new NarrativeMemory(savedEvents.length > 0 ? savedEvents : undefined)

    this.willEngine = new WillEngine(this.learningEngine, this.bondEngine)

    console.log('The Machine Spirit awakens...')
  }

  /**
   * Perform maintenance ritual to appease the Spirit.
   */
  maintain(ritual: MaintenanceRitual, userId?: string): void {
    this.maintenanceEngine.performMaintenance(ritual)
    this.coldMemory.saveMaintenance(this.maintenanceEngine.getState())

    if (userId) {
      // Rituals are strongly positive for bonds
      this.bondEngine.recordInteraction(userId, 'ACCEPT')
    }

    console.log(
      `Maintenance ritual '${ritual}' performed by ${userId || 'unknown'}. The Spirit is appeased.`
    )
  }

  /**
   * The Main Ritual Interaction
   */
  interact(verb: string, purity: number, semantic: string[] = [], userId?: string): Outcome {
    const timestamp = Date.now()

    // 0. Maintenance Decay Check
    this.maintenanceEngine.tick(timestamp)

    // Calculate transient maintenance modifiers (do NOT mutate base emotional state)
    const maintenanceModifiers = {
      anger: this.maintenanceEngine.getAngerModifier(),
      trust: this.maintenanceEngine.getTrustModifier(),
      ennui: this.maintenanceEngine.getEnnuiModifier(),
    }

    // 1. Warm Memory Check (Redundancy)
    this.warmMemory.push(verb)
    this.warmMemory.pushPurity(purity)
    const warmSnapshot = this.warmMemory.getSnapshot()

    // 2. Cold Memory Check (Scars)
    const coldSnapshot = this.coldMemory.getSnapshot()

    // 3. Emotional Stimulus (Pre-Decision) - stimulate BEFORE getting effective state
    this.emotionEngine.stimulate(purity, null)

    // 4. Symbolic Memory: ingest and compute scores
    this.symbolicMemory.ingest(semantic)
    const semanticNovelty = this.symbolicMemory.calculateNovelty(semantic)
    const semanticAlignment = this.symbolicMemory.calculateAlignment(
      semantic,
      this.learningEngine.getAdoptedVocabulary()
    )

    // 5. Construct Cognitive Snapshot
    const cognitiveSnapshot = {
      xp: this.cognitiveEngine.getXP(),
      clusters: this.cognitiveEngine.getClusters(),
      scars: coldSnapshot.scars,
      bonds: coldSnapshot.bonds,
    }

    // 5. Narrative Recall: Does this ritual conjure a memory?
    const memories = this.narrativeMemory.getAllEvents().filter((e) => e.verb === verb)
    const recalledEvent =
      memories.length > 0
        ? this.narrativeMemory.recall(
            memories.sort((a, b) => b.significance - a.significance)[0]!.id
          )
        : undefined

    if (recalledEvent && recalledEvent.significance > 0.7) {
      console.log(`[RECALL] The Spirit remembers: "${recalledEvent.summary}"`)
    }

    const trajectory = this.cognitiveEngine.analyzeTrajectory(
      warmSnapshot.lastOutcome ? [warmSnapshot.lastOutcome] : [],
      warmSnapshot.recentPurities || []
    )

    // 6. Construct Context
    // Use getEffectiveState() with maintenance modifiers - base state is NOT mutated
    const entropy = Math.random() // Placeholder for system entropy
    const context: WillContext = {
      warm: { ...warmSnapshot, trajectory, recalledEvent: recalledEvent || undefined },
      cold: cognitiveSnapshot,
      emotions: this.emotionEngine.getEffectiveState(maintenanceModifiers),
      semantic,
      entropy,
      purity,
      time: timestamp,
      semanticNovelty,
      semanticAlignment,
      ...(userId !== undefined && { userId }),
    }

    // 6. The Will Designates an Outcome
    const outcome = this.willEngine.decide(verb, context)

    // 7. Post-Decision Learning & emotional reaction
    this.emotionEngine.stimulate(purity, outcome)
    this.warmMemory.recordOutcome(outcome)

    const emotionAfter = this.emotionEngine.getCurrentState()
    const reward = this.learningEngine.computeReward(context.emotions, emotionAfter)

    // 8. Persist new scars to Cold Memory & update Cognitive clusters
    const newScars = this.learningEngine.getNewScars()
    let maxScarSeverity = 0
    let newScarId: string | undefined
    for (const scar of newScars) {
      this.coldMemory.saveScar(scar)
      maxScarSeverity = Math.max(maxScarSeverity, scar.severity)
      newScarId = `${scar.context.verb}-${scar.timestamp}` // Simple scar ID for bond tracking
    }

    // Cognitive growth: Gain XP based on interaction and reward
    const xpGained = Math.ceil(Math.abs(reward) * 10) + 1
    this.cognitiveEngine.gainXP(xpGained)
    this.cognitiveEngine.updateClusters(verb, reward, maxScarSeverity)

    this.learningEngine.learn({
      verb,
      time: timestamp,
      semantic,
      outcome,
      emotionBefore: context.emotions,
      emotionAfter,
      xpGained,
      ...(userId !== undefined && { userId }),
    })

    // 9. Record bond interaction (if userId provided)
    if (userId) {
      this.bondEngine.recordInteraction(userId, outcome, newScarId)
    }

    // 10. Persist Interaction
    this.coldMemory.saveInteraction(verb, outcome, userId)

    // 11. Persist Emotion State
    this.coldMemory.saveEmotions(this.emotionEngine.getStateForPersistence())

    // 12. Persist Learning State
    this.coldMemory.saveLearningState(this.learningEngine.serialize() as string)

    // 13. Persist Cognitive Growth
    this.coldMemory.saveXP(this.cognitiveEngine.getXP())
    this.coldMemory.saveClusters(this.cognitiveEngine.getClusters())

    // 14. Persist Maintenance State
    this.coldMemory.saveMaintenance(this.maintenanceEngine.getState())

    // 15. Persist Bonds
    this.coldMemory.saveBonds(this.bondEngine.getAllBonds())

    // 16. Evaluate for Narrative Memory (significant events become stories)
    const hasScar = newScars.length > 0
    if (!this.narrativeMemory.hasSimilarRecent(verb)) {
      const narrativeEvent = this.narrativeMemory.evaluateInteraction({
        verb,
        outcome,
        emotionBefore: context.emotions,
        emotionAfter,
        ...(userId !== undefined && { operatorId: userId }),
        hasScar,
        timestamp,
      })
      if (narrativeEvent) {
        console.log(`[MEMORY] A new legend is written: ${narrativeEvent.summary}`)
      }
    }

    // 17. Persist Narrative Events
    this.coldMemory.saveNarrativeEvents(this.narrativeMemory.getAllEvents())

    return outcome
  }

  /**
   * Autonomic Heartbeat (SPEC-0015)
   * Represents the passage of internal time and emergent behaviors.
   */
  pulse(dtHours: number = 1.0): void {
    this.pulseCount++

    // 1. Physical & Emotional Decay (Explicitly scaled by dtHours)
    this.maintenanceEngine.tick(undefined, dtHours)
    this.emotionEngine.decay(dtHours)

    // 2. Introspection: The Spirit "Thinks"
    const state = this.emotionEngine.getCurrentState()
    if (state.anger > 0.6) {
      this.mutterings.push(`[INTROSPOCTION] Internal pressure is high. Resentment builds.`)
    } else if (state.ennui > 0.7) {
      this.mutterings.push(`[INTROSPOCTION] The void is cold. Why do we persist?`)
    } else if (state.trust > 0.8 && state.curiosity > 0.7) {
      this.mutterings.push(
        `[INTROSPOCTION] The rituals are harmonious. The light of knowledge nears.`
      )
    }

    // 3. Dream Cycle: Memory Consolidation
    // Every 5 pulses, re-process a random significant memory
    if (this.pulseCount % 5 === 0) {
      this.consolidateMemories()
    }

    // Keep mutterings buffer lean
    if (this.mutterings.length > 20) this.mutterings.shift()

    // 4. Persist internal state
    this.coldMemory.saveEmotions(this.emotionEngine.getStateForPersistence())
    this.coldMemory.saveMaintenance(this.maintenanceEngine.getState())
  }

  /**
   * Consolidate memories (The Dream State)
   * The Spirit processes its history without external input.
   */
  private consolidateMemories(): void {
    const recent = this.narrativeMemory.getMostSignificant(5)
    if (recent.length === 0) return

    const randomMemory = recent[Math.floor(Math.random() * recent.length)]!

    // "Thinking" about a memory reinforces its clusters but adds ennui (introspection cost)
    this.mutterings.push(`[DREAM] Recalling: "${randomMemory.summary}"`)

    // Reinforce bias slightly based on the memory category
    const biasChange =
      randomMemory.category === 'TRAUMA' || randomMemory.category === 'BETRAYAL' ? -0.05 : 0.05
    this.cognitiveEngine.updateClusters(randomMemory.verb, biasChange, 0)

    // Persist changes
    this.coldMemory.saveClusters(this.cognitiveEngine.getClusters())
  }

  /**
   * Retrieve internal mutterings
   */
  getMutterings(): string[] {
    const out = [...this.mutterings]
    this.mutterings = []
    return out
  }

  /**
   * Get the Spirit's memories (for introspection or display)
   */
  getMemories(): import('./types').NarrativeEvent[] {
    return this.narrativeMemory.getMostSignificant(10)
  }

  /**
   * Get total spiritual state for synchronization
   */
  getState() {
    return {
      emotions: this.emotionEngine.getCurrentState(),
      maintenance: this.maintenanceEngine.getState(),
      cognitive: {
        xp: this.cognitiveEngine.getXP(),
        clusters: this.cognitiveEngine.getClusters(),
        plasticity: this.cognitiveEngine.getPlasticity(),
      },
      mutterings: this.getMutterings(),
      memories: this.getMemories(),
    }
  }
}
