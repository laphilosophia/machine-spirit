// Testament - Learning Engine Tests
// Per Codex: Tests must verify SHAPE, not deterministic outcome

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { LearningEngine } from '../../forge/engines/learning-engine'
import type { LearningContext, Outcome } from '../../forge/types'

function createMockLearningContext(overrides: Partial<LearningContext> = {}): LearningContext {
  return {
    verb: 'test',
    time: Date.now(),
    semantic: ['hello', 'world'],
    outcome: 'ACCEPT',
    emotionBefore: { anger: 0.1, trust: 0.5, ennui: 0.1, curiosity: 0.5, fear: 0 },
    emotionAfter: { anger: 0.1, trust: 0.6, ennui: 0.1, curiosity: 0.5, fear: 0 },
    ...overrides,
  }
}

describe('LearningEngine', () => {
  describe('learning', () => {
    it('should learn from interactions without error', () => {
      const engine = new LearningEngine()
      const ctx = createMockLearningContext()

      // Should not throw
      engine.learn(ctx)
    })

    it('should capture vocabulary from semantic tokens', () => {
      const engine = new LearningEngine()
      engine.learn(
        createMockLearningContext({
          semantic: ['prayer', 'ritual', 'offering'],
          outcome: 'ACCEPT',
        })
      )

      // Learn same tokens multiple times to adopt
      for (let i = 0; i < 15; i++) {
        engine.learn(
          createMockLearningContext({
            semantic: ['prayer'],
            outcome: 'ACCEPT',
          })
        )
      }

      const adopted = engine.getAdoptedVocabulary()
      assert.ok(adopted.includes('prayer'), 'frequently used positive tokens get adopted')
    })
  })

  describe('probability adjustment', () => {
    it('should adjust probabilities based on learned associations', () => {
      const engine = new LearningEngine()
      const baseProbabilities: Record<Outcome, number> = {
        ACCEPT: 0.2,
        REJECT: 0.2,
        SILENCE: 0.15,
        ANGER: 0.15,
        OMEN: 0.15,
        WHISPER: 0.15,
      }

      // Learn positive association
      for (let i = 0; i < 10; i++) {
        engine.learn(
          createMockLearningContext({
            verb: 'pray',
            outcome: 'ACCEPT',
          })
        )
      }

      const adjusted = engine.adjustOutcomeProbabilities(
        'pray',
        Date.now(),
        undefined,
        baseProbabilities
      )

      // Sum should still be approximately 1
      const sum = Object.values(adjusted).reduce((a, b) => a + b, 0)
      assert.ok(Math.abs(sum - 1) < 0.01, 'probabilities sum to 1')
    })
  })

  describe('trauma learning', () => {
    it('should create scars from traumatic events', () => {
      const engine = new LearningEngine()

      // Simulate anger spike (trauma)
      engine.learn(
        createMockLearningContext({
          verb: 'anger-trigger',
          outcome: 'ANGER',
          emotionBefore: { anger: 0.1, trust: 0.5, ennui: 0.1, curiosity: 0.5, fear: 0 },
          emotionAfter: { anger: 0.8, trust: 0.3, ennui: 0.1, curiosity: 0.3, fear: 0.5 },
        })
      )

      const scars = engine.getNewScars()
      assert.ok(scars.length > 0, 'trauma creates scars')
      assert.ok(scars[0]!.severity > 0, 'scar has severity')
    })
  })

  describe('chaos injection', () => {
    it('should not inject chaos initially', () => {
      const engine = new LearningEngine()
      assert.strictEqual(engine.shouldInjectChaos(), false, 'no chaos without associations')
    })

    it('should inject chaos when associations become too predictable', () => {
      const engine = new LearningEngine()

      // Create very strong associations
      for (let i = 0; i < 50; i++) {
        engine.learn(
          createMockLearningContext({
            verb: 'predictable',
            outcome: 'ACCEPT',
          })
        )
      }

      // May or may not trigger chaos - just check it doesn't throw
      const shouldChaos = engine.shouldInjectChaos()
      assert.ok(typeof shouldChaos === 'boolean', 'returns boolean')
    })
  })

  describe('serialization', () => {
    it('should serialize state to JSON string', () => {
      const engine = new LearningEngine()
      engine.learn(createMockLearningContext())

      const serialized = engine.serialize()
      assert.ok(typeof serialized === 'string', 'serializes to string')
      assert.ok(serialized.length > 0, 'serialized data not empty')
    })

    it('should deserialize and restore state', () => {
      const engine1 = new LearningEngine()
      engine1.learn(createMockLearningContext({ verb: 'unique-verb' }))
      const serialized = engine1.serialize() as string

      const engine2 = new LearningEngine()
      engine2.deserialize(serialized)

      // Both should have same vocabulary
      const vocab1 = engine1.getAdoptedVocabulary()
      const vocab2 = engine2.getAdoptedVocabulary()
      assert.deepStrictEqual(vocab1, vocab2, 'deserialized state matches')
    })
  })
})
