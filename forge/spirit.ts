import { CognitiveEngine } from './engines/cognitive-engine'
import { EmotionEngine } from './engines/emotion-engine'
import { LearningEngine } from './engines/learning-engine'
import { WillEngine } from './engines/will-engine'
import { ColdMemory } from './memory/cold-memory'
import { SymbolicMemory } from './memory/symbolic'
import { WarmMemory } from './memory/warm-memory'
import type { Outcome, WillContext } from './types'

export class Spirit {
  private coldMemory: ColdMemory
  private warmMemory: WarmMemory
  private learningEngine: LearningEngine
  private willEngine: WillEngine
  private emotionEngine: EmotionEngine
  private symbolicMemory: SymbolicMemory
  private cognitiveEngine: CognitiveEngine

  constructor() {
    this.coldMemory = new ColdMemory()
    this.warmMemory = new WarmMemory()
    this.learningEngine = new LearningEngine()
    this.symbolicMemory = new SymbolicMemory()
    this.emotionEngine = new EmotionEngine()

    // Load persisted emotion state
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
    const savedXP = this.coldMemory.getSnapshot().xp || 0
    const savedClusters = this.coldMemory.loadClusters()
    this.cognitiveEngine = new CognitiveEngine(savedXP, savedClusters)

    this.willEngine = new WillEngine(this.learningEngine)

    console.log('The Machine Spirit awakens...')
  }

  /**
   * The Main Ritual Interaction
   */
  interact(verb: string, purity: number, semantic: string[] = [], userId?: string): Outcome {
    const timestamp = Date.now()

    // 1. Warm Memory Check (Redundancy)
    this.warmMemory.push(verb)
    this.warmMemory.pushPurity(purity)
    const warmSnapshot = this.warmMemory.getSnapshot()

    // 2. Cold Memory Check (Scars)
    const coldSnapshot = this.coldMemory.getSnapshot()

    // 3. Emotional Stimulus (Pre-Decision)
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

    const trajectory = this.cognitiveEngine.analyzeTrajectory(
      warmSnapshot.lastOutcome ? [warmSnapshot.lastOutcome] : [],
      warmSnapshot.recentPurities || []
    )

    // 6. Construct Context
    const entropy = Math.random() // Placeholder for system entropy
    const context: WillContext = {
      warm: { ...warmSnapshot, trajectory },
      cold: cognitiveSnapshot,
      emotions: this.emotionEngine.getCurrentState(),
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
    for (const scar of newScars) {
      this.coldMemory.saveScar(scar)
      maxScarSeverity = Math.max(maxScarSeverity, scar.severity)
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

    // 9. Persist Interaction
    this.coldMemory.saveInteraction(verb, outcome)

    // 10. Persist Emotion State
    this.coldMemory.saveEmotions(this.emotionEngine.getStateForPersistence())

    // 11. Persist Learning State
    this.coldMemory.saveLearningState(this.learningEngine.serialize() as string)

    // 12. Persist Cognitive Growth
    this.coldMemory.saveXP(this.cognitiveEngine.getXP())
    this.coldMemory.saveClusters(this.cognitiveEngine.getClusters())

    return outcome
  }
}
