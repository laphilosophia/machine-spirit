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

    // 5. Construct Context
    const entropy = Math.random() // Placeholder for system entropy
    const context: WillContext = {
      warm: warmSnapshot,
      cold: coldSnapshot,
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

    this.learningEngine.learn({
      verb,
      time: timestamp,
      semantic,
      outcome,
      emotionBefore: context.emotions,
      emotionAfter: this.emotionEngine.getCurrentState(),
      ...(userId !== undefined && { userId }),
    })

    // 8. Persist new scars to Cold Memory
    const newScars = this.learningEngine.getNewScars()
    for (const scar of newScars) {
      this.coldMemory.saveScar(scar)
    }

    // 9. Persist Interaction
    this.coldMemory.saveInteraction(verb, outcome)

    // 10. Persist Emotion State
    this.coldMemory.saveEmotions(this.emotionEngine.getStateForPersistence())

    // 11. Persist Learning State
    this.coldMemory.saveLearningState(this.learningEngine.serialize() as string)

    return outcome
  }
}
