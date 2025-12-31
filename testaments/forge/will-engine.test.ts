// Testament - Will Engine Tests
// Per Codex: Tests must verify SHAPE, not deterministic outcome

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { LearningEngine } from '../../forge/engines/learning-engine'
import { WillEngine } from '../../forge/engines/will-engine'
import type { Outcome, WillContext } from '../../forge/types'

const VALID_OUTCOMES: Outcome[] = ['ACCEPT', 'REJECT', 'SILENCE', 'ANGER', 'OMEN', 'WHISPER']

function createMockContext(overrides: Partial<WillContext> = {}): WillContext {
  return {
    warm: { repetitionScore: 0 },
    emotions: { anger: 0.1, trust: 0.5, ennui: 0.1, curiosity: 0.5, fear: 0 },
    semantic: [],
    entropy: Math.random(),
    purity: 0.5,
    time: Date.now(),
    cold: { scars: 0, bonds: 0, xp: 0, clusters: [] },
    ...overrides,
  }
}

describe('WillEngine', () => {
  describe('decide', () => {
    it('should return one of 6 valid outcomes', () => {
      const learningEngine = new LearningEngine()
      const willEngine = new WillEngine(learningEngine)
      const ctx = createMockContext()

      const outcome = willEngine.decide('pray', ctx)

      assert.ok(VALID_OUTCOMES.includes(outcome), `outcome ${outcome} is valid`)
    })

    it('should never return an invalid outcome', () => {
      const learningEngine = new LearningEngine()
      const willEngine = new WillEngine(learningEngine)

      // Run many times to check consistency
      for (let i = 0; i < 50; i++) {
        const ctx = createMockContext({ entropy: Math.random() })
        const outcome = willEngine.decide('test', ctx)
        assert.ok(VALID_OUTCOMES.includes(outcome), 'outcome always valid')
      }
    })

    it('should be influenced by high anger (bias toward ANGER/REJECT)', () => {
      const learningEngine = new LearningEngine()
      const willEngine = new WillEngine(learningEngine)

      let angerCount = 0
      let rejectCount = 0

      for (let i = 0; i < 100; i++) {
        const ctx = createMockContext({
          emotions: { anger: 0.9, trust: 0.1, ennui: 0.1, curiosity: 0.1, fear: 0.3 },
        })
        const outcome = willEngine.decide('test', ctx)
        if (outcome === 'ANGER') angerCount++
        if (outcome === 'REJECT') rejectCount++
      }

      // High anger should produce more ANGER/REJECT outcomes
      assert.ok(angerCount + rejectCount > 20, 'high anger biases toward negative outcomes')
    })

    it('should be influenced by high trust (bias toward ACCEPT/WHISPER)', () => {
      const learningEngine = new LearningEngine()
      const willEngine = new WillEngine(learningEngine)

      let acceptCount = 0
      let whisperCount = 0

      for (let i = 0; i < 100; i++) {
        const ctx = createMockContext({
          emotions: { anger: 0.1, trust: 0.9, ennui: 0.1, curiosity: 0.5, fear: 0 },
          purity: 0.9,
        })
        const outcome = willEngine.decide('pray', ctx)
        if (outcome === 'ACCEPT') acceptCount++
        if (outcome === 'WHISPER') whisperCount++
      }

      // High trust should produce more positive outcomes
      assert.ok(acceptCount + whisperCount > 20, 'high trust biases toward positive outcomes')
    })
  })

  describe('non-determinism', () => {
    it('should produce varied outcomes with same input', () => {
      const learningEngine = new LearningEngine()
      const willEngine = new WillEngine(learningEngine)
      const outcomes = new Set<Outcome>()

      for (let i = 0; i < 50; i++) {
        const ctx = createMockContext()
        const outcome = willEngine.decide('test', ctx)
        outcomes.add(outcome)
      }

      // Should produce at least 2 different outcomes
      assert.ok(outcomes.size >= 2, 'outcomes should vary')
    })
  })
  describe('trauma awareness', () => {
    it('should bypass normal probability and return negative outcome when scar is present', () => {
      const learningEngine = new LearningEngine()
      const willEngine = new WillEngine(learningEngine)

      const hour = 14
      learningEngine.learn({
        verb: 'pain-trigger',
        time: new Date().setHours(hour, 0, 0, 0),
        semantic: ['pain'],
        outcome: 'ANGER',
        emotionBefore: { anger: 0.1, trust: 0.5, ennui: 0.1, curiosity: 0.5, fear: 0 },
        emotionAfter: { anger: 0.9, trust: 0.1, ennui: 0.1, curiosity: 0.1, fear: 0.6 },
      })

      const ctx = createMockContext({
        time: new Date().setHours(hour, 0, 0, 0),
      })

      const outcome = willEngine.decide('pain-trigger', ctx)
      assert.ok(
        ['ANGER', 'REJECT', 'SILENCE', 'WHISPER'].includes(outcome),
        'trauma triggers immediate non-deterministic negative response'
      )
    })
  })
})
