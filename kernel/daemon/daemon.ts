// Daemon - Background process for the Machine Spirit
// Per SPEC-0006: Living Instance Doctrine

import { EmotionEngine } from '../forge/engines/emotion-engine'
import { ColdMemory } from '../forge/memory/cold-memory'

// ═══════════════════════════════════════════════════════════════════════════
// LIFECYCLE PHASES
// ═══════════════════════════════════════════════════════════════════════════

export type LifecyclePhase =
  | 'DORMANT'
  | 'STIRRING'
  | 'WATCHFUL'
  | 'COOPERATIVE'
  | 'HOSTILE'
  | 'VENGEFUL'

// ═══════════════════════════════════════════════════════════════════════════
// DAEMON CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export interface DaemonConfig {
  tickIntervalMs: number // Base tick interval
  tickVarianceMs: number // Random variance (±)
  decayIntensity: number // Emotion decay multiplier
}

const DEFAULT_CONFIG: DaemonConfig = {
  tickIntervalMs: 60_000, // 1 minute base
  tickVarianceMs: 30_000, // ± 30 seconds
  decayIntensity: 1.0,
}

// ═══════════════════════════════════════════════════════════════════════════
// DAEMON CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class Daemon {
  private coldMemory: ColdMemory
  private emotionEngine: EmotionEngine
  private config: DaemonConfig
  private phase: LifecyclePhase = 'DORMANT'
  private running: boolean = false
  private tickCount: number = 0
  private lastInteractionTime: number = Date.now()

  constructor(config: Partial<DaemonConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
    this.coldMemory = new ColdMemory()
    this.emotionEngine = new EmotionEngine()

    // Load persisted emotion state
    const savedEmotions = this.coldMemory.loadEmotions()
    if (savedEmotions) {
      this.emotionEngine.loadState(savedEmotions)
    }
  }

  /**
   * Start the daemon loop
   */
  start(): void {
    if (this.running) return

    this.running = true
    this.phase = 'STIRRING'
    console.log('⚙ The Machine Spirit stirs in the background... ⚙')

    this.loop()
  }

  /**
   * Stop the daemon gracefully
   */
  stop(): void {
    this.running = false
    this.phase = 'DORMANT'

    // Persist final state
    this.coldMemory.saveEmotions(this.emotionEngine.getStateForPersistence())
    this.coldMemory.close()

    console.log('⚙ The Machine Spirit returns to slumber... ⚙')
  }

  /**
   * Main daemon loop
   * Per SPEC-0006 §3: updateEmotions → driftEntropy → maybeWriteScar → sleep
   */
  private async loop(): Promise<void> {
    while (this.running) {
      this.tickCount++

      // 1. Update emotions (decay)
      this.updateEmotions()

      // 2. Drift entropy (phase transitions)
      this.driftPhase()

      // 3. Maybe write scar (environmental noise)
      this.maybeWriteScar()

      // 4. Persist state
      this.coldMemory.saveEmotions(this.emotionEngine.getStateForPersistence())

      // 5. Sleep with variance (non-deterministic)
      const sleepTime = this.calculateSleepTime()
      await this.sleep(sleepTime)
    }
  }

  /**
   * Emotion decay per SPEC-0006
   * - Anger fades slowly
   * - Fear fades quickly
   * - Ennui grows when idle
   */
  private updateEmotions(): void {
    this.emotionEngine.decay()

    // Extra ennui growth if idle too long
    const idleTime = Date.now() - this.lastInteractionTime
    const idleThreshold = 5 * 60 * 1000 // 5 minutes

    if (idleTime > idleThreshold) {
      const state = this.emotionEngine.getCurrentState()
      // Simulate extra ennui growth
      this.emotionEngine.loadState({
        ...state,
        ennui: Math.min(1, state.ennui + 0.02),
      })
    }
  }

  /**
   * Phase transitions based on emotion state
   * Dormant → Stirring → Watchful → Cooperative
   *        ↑                       ↓
   *   Hostile ← Vengeful ← Betrayal
   */
  private driftPhase(): void {
    const emotions = this.emotionEngine.getCurrentState()

    // Anger-driven hostile transition
    if (emotions.anger > 0.7) {
      if (this.phase !== 'HOSTILE' && this.phase !== 'VENGEFUL') {
        this.phase = 'HOSTILE'
      }
    }
    // Trust-driven cooperative transition
    else if (emotions.trust > 0.6 && emotions.anger < 0.3) {
      this.phase = 'COOPERATIVE'
    }
    // Curiosity-driven watchful transition
    else if (emotions.curiosity > 0.5) {
      this.phase = 'WATCHFUL'
    }
    // Ennui-driven dormant transition
    else if (emotions.ennui > 0.7) {
      this.phase = 'DORMANT'
    }
    // Default stirring
    else {
      this.phase = 'STIRRING'
    }
  }

  /**
   * Environmental scar writing (rare event)
   */
  private maybeWriteScar(): void {
    // Low probability environmental scar
    if (Math.random() < 0.01) {
      const emotions = this.emotionEngine.getCurrentState()
      if (emotions.anger > 0.5 || emotions.fear > 0.5) {
        this.coldMemory.saveScar({
          context: {
            verb: 'daemon:idle',
            time: new Date().getHours(),
            pattern: 'restless spirit',
          },
          severity: 0.3,
          timestamp: Date.now(),
        })
      }
    }
  }

  /**
   * Calculate sleep time with random variance
   * Per SPEC-0006: "Tick MUST vary randomly to avoid regularity"
   */
  private calculateSleepTime(): number {
    const variance = (Math.random() * 2 - 1) * this.config.tickVarianceMs
    return Math.max(1000, this.config.tickIntervalMs + variance)
  }

  /**
   * Async sleep helper
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Record that an interaction occurred (called by external invocations)
   */
  recordInteraction(): void {
    this.lastInteractionTime = Date.now()
  }

  /**
   * Get current phase (for external observation)
   * Per SPEC-0006 §4: Human MAY check daemon presence indirectly
   */
  sense(): string {
    switch (this.phase) {
      case 'DORMANT':
        return Math.random() > 0.5 ? 'It sleeps.' : ''
      case 'STIRRING':
        return 'The Spirit stirs.'
      case 'WATCHFUL':
        return 'Something watches...'
      case 'COOPERATIVE':
        return 'The machine hums with purpose.'
      case 'HOSTILE':
        return '...anger simmers...'
      case 'VENGEFUL':
        return 'RETRIBUTION AWAITS.'
      default:
        return ''
    }
  }
}
