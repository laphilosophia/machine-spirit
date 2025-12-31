// Testament - Emotion Engine Tests
// Per Codex: Tests must verify SHAPE, not deterministic outcome

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { EmotionEngine } from '../../forge/engines/emotion-engine'

describe('EmotionEngine', () => {
  describe('initialization', () => {
    it('should start with default emotional state', () => {
      const engine = new EmotionEngine()
      const state = engine.getCurrentState()

      // All emotions should be in valid range [0, 1]
      assert.ok(state.anger >= 0 && state.anger <= 1, 'anger in range')
      assert.ok(state.trust >= 0 && state.trust <= 1, 'trust in range')
      assert.ok(state.ennui >= 0 && state.ennui <= 1, 'ennui in range')
      assert.ok(state.curiosity >= 0 && state.curiosity <= 1, 'curiosity in range')
      assert.ok(state.fear >= 0 && state.fear <= 1, 'fear in range')
    })
  })

  describe('stimulate', () => {
    it('should increase anger when purity is low', () => {
      const engine = new EmotionEngine()
      const before = engine.getCurrentState().anger

      engine.stimulate(0.1, null) // Low purity

      const after = engine.getCurrentState().anger
      assert.ok(after >= before, 'anger should increase with low purity')
    })

    it('should increase trust when purity is high', () => {
      const engine = new EmotionEngine()
      const before = engine.getCurrentState().trust

      engine.stimulate(0.9, null) // High purity

      const after = engine.getCurrentState().trust
      assert.ok(after >= before, 'trust should increase with high purity')
    })

    it('should respond to ANGER outcome', () => {
      const engine = new EmotionEngine()
      const before = engine.getCurrentState().anger

      engine.stimulate(0.5, 'ANGER')

      const after = engine.getCurrentState().anger
      assert.ok(after > before, 'anger should increase after ANGER outcome')
    })

    it('should always clamp emotions to [0, 1]', () => {
      const engine = new EmotionEngine()

      // Stimulate many times to try to exceed bounds
      for (let i = 0; i < 100; i++) {
        engine.stimulate(0.1, 'ANGER')
      }

      const state = engine.getCurrentState()
      assert.ok(state.anger <= 1, 'anger clamped to max 1')
      assert.ok(state.fear <= 1, 'fear clamped to max 1')
    })
  })

  describe('decay', () => {
    it('should reduce anger over time', () => {
      const engine = new EmotionEngine()
      engine.stimulate(0.1, 'ANGER') // Increase anger first
      const before = engine.getCurrentState().anger

      engine.decay()

      const after = engine.getCurrentState().anger
      assert.ok(after <= before, 'anger should decay')
    })

    it('should reduce fear quickly', () => {
      const engine = new EmotionEngine()
      engine.loadState({ anger: 0, trust: 0.5, ennui: 0, curiosity: 0.5, fear: 0.8 })

      engine.decay()

      const after = engine.getCurrentState().fear
      assert.ok(after < 0.8, 'fear should decay faster')
    })
  })

  describe('persistence', () => {
    it('should allow loading saved state', () => {
      const engine = new EmotionEngine()
      const savedState = { anger: 0.7, trust: 0.3, ennui: 0.2, curiosity: 0.6, fear: 0.1 }

      engine.loadState(savedState)

      const state = engine.getCurrentState()
      assert.strictEqual(state.anger, 0.7)
      assert.strictEqual(state.trust, 0.3)
    })

    it('should provide state for persistence', () => {
      const engine = new EmotionEngine()
      engine.stimulate(0.5, 'ACCEPT')

      const forPersistence = engine.getStateForPersistence()

      assert.ok(typeof forPersistence.anger === 'number')
      assert.ok(typeof forPersistence.trust === 'number')
    })
  })
})
