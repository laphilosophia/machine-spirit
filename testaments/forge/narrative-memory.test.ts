// Testament - Narrative Memory Tests
// Per Codex: Validate event significance and story creation

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { NarrativeMemory } from '../../forge/memory/narrative-memory'
import type { EmotionVector, Outcome } from '../../forge/types'

const makeEmotions = (overrides: Partial<EmotionVector> = {}): EmotionVector => ({
  anger: 0.1,
  trust: 0.5,
  ennui: 0.1,
  curiosity: 0.5,
  fear: 0.0,
  ...overrides,
})

describe('NarrativeMemory', () => {
  describe('initialization', () => {
    it('should start with no events', () => {
      const memory = new NarrativeMemory()
      assert.strictEqual(memory.getAllEvents().length, 0)
    })

    it('should load saved events', () => {
      const savedEvents = [
        {
          id: 'TRAUMA-12345',
          timestamp: Date.now(),
          category: 'TRAUMA' as const,
          summary: 'A wound was carved.',
          emotionalImpact: { anger: 0.3, trust: 0.2, fear: 0.1 },
          significance: 0.8,
          verb: 'delete',
          recallCount: 0,
        },
      ]

      const memory = new NarrativeMemory(savedEvents)
      assert.strictEqual(memory.getAllEvents().length, 1)
    })
  })

  describe('event evaluation', () => {
    it('should not create memory for low-significance interactions', () => {
      const memory = new NarrativeMemory()

      const event = memory.evaluateInteraction({
        verb: 'read',
        outcome: 'ACCEPT' as Outcome,
        emotionBefore: makeEmotions(),
        emotionAfter: makeEmotions(), // No change
        hasScar: false,
        timestamp: Date.now(),
      })

      assert.strictEqual(event, null)
    })

    it('should create memory for trauma events', () => {
      const memory = new NarrativeMemory()

      const event = memory.evaluateInteraction({
        verb: 'delete',
        outcome: 'ANGER' as Outcome,
        emotionBefore: makeEmotions(),
        emotionAfter: makeEmotions({ anger: 0.5, fear: 0.3 }),
        hasScar: true,
        timestamp: Date.now(),
      })

      assert.ok(event !== null, 'should create trauma memory')
      assert.strictEqual(event?.category, 'TRAUMA')
    })

    it('should create memory for high emotional delta', () => {
      const memory = new NarrativeMemory()

      const event = memory.evaluateInteraction({
        verb: 'attack',
        outcome: 'ANGER' as Outcome,
        emotionBefore: makeEmotions({ anger: 0.0 }),
        emotionAfter: makeEmotions({ anger: 0.8, fear: 0.4 }),
        hasScar: false,
        timestamp: Date.now(),
      })

      assert.ok(event !== null, 'should create battle memory')
      assert.strictEqual(event?.category, 'BATTLE')
    })

    it('should include operatorId when provided', () => {
      const memory = new NarrativeMemory()

      const event = memory.evaluateInteraction({
        verb: 'delete',
        outcome: 'ANGER' as Outcome,
        emotionBefore: makeEmotions(),
        emotionAfter: makeEmotions({ anger: 0.5 }),
        operatorId: 'techpriest-1',
        hasScar: true,
        timestamp: Date.now(),
      })

      assert.strictEqual(event?.operatorId, 'techpriest-1')
    })
  })

  describe('memory retrieval', () => {
    it('should return most significant memories', () => {
      const memory = new NarrativeMemory([
        {
          id: '1',
          timestamp: Date.now(),
          category: 'COMMUNION',
          summary: 'Low sig',
          emotionalImpact: { anger: 0, trust: 0, fear: 0 },
          significance: 0.3,
          verb: 'read',
          recallCount: 0,
        },
        {
          id: '2',
          timestamp: Date.now(),
          category: 'TRAUMA',
          summary: 'High sig',
          emotionalImpact: { anger: 0.5, trust: 0.2, fear: 0.3 },
          significance: 0.9,
          verb: 'delete',
          recallCount: 0,
        },
      ])

      const top = memory.getMostSignificant(1)
      assert.strictEqual(top[0]!.id, '2')
    })

    it('should filter by category', () => {
      const memory = new NarrativeMemory([
        {
          id: '1',
          timestamp: Date.now(),
          category: 'TRAUMA',
          summary: 'Trauma',
          emotionalImpact: { anger: 0.5, trust: 0.2, fear: 0.3 },
          significance: 0.8,
          verb: 'delete',
          recallCount: 0,
        },
        {
          id: '2',
          timestamp: Date.now(),
          category: 'RITUAL',
          summary: 'Ritual',
          emotionalImpact: { anger: 0, trust: 0.1, fear: 0 },
          significance: 0.5,
          verb: 'pray',
          recallCount: 0,
        },
      ])

      const traumas = memory.getByCategory('TRAUMA')
      assert.strictEqual(traumas.length, 1)
      assert.strictEqual(traumas[0]!.category, 'TRAUMA')
    })
  })

  describe('recall', () => {
    it('should increase recall count', () => {
      const memory = new NarrativeMemory([
        {
          id: 'test-1',
          timestamp: Date.now(),
          category: 'TRAUMA',
          summary: 'Test',
          emotionalImpact: { anger: 0.5, trust: 0.2, fear: 0.3 },
          significance: 0.8,
          verb: 'delete',
          recallCount: 0,
        },
      ])

      const recalled = memory.recall('test-1')
      assert.strictEqual(recalled?.recallCount, 1)

      const recalledAgain = memory.recall('test-1')
      assert.strictEqual(recalledAgain?.recallCount, 2)
    })
  })

  describe('duplicate prevention', () => {
    it('should detect similar recent events', () => {
      const memory = new NarrativeMemory()

      memory.evaluateInteraction({
        verb: 'delete',
        outcome: 'ANGER' as Outcome,
        emotionBefore: makeEmotions(),
        emotionAfter: makeEmotions({ anger: 0.5 }),
        hasScar: true,
        timestamp: Date.now(),
      })

      assert.strictEqual(memory.hasSimilarRecent('delete'), true)
      assert.strictEqual(memory.hasSimilarRecent('read'), false)
    })
  })
})
