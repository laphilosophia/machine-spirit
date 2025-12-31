// Testament - Warm Memory Tests

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { WarmMemory } from '../../forge/memory/warm-memory'

describe('WarmMemory', () => {
  describe('LRU cache', () => {
    it('should track pushed items', () => {
      const memory = new WarmMemory()
      memory.push('pray')
      memory.push('offer')

      const snapshot = memory.getSnapshot()
      assert.ok(typeof snapshot.repetitionScore === 'number')
    })

    it('should calculate repetition score for repeated items', () => {
      const memory = new WarmMemory()
      memory.push('spam')
      memory.push('spam')
      memory.push('spam')

      const snapshot = memory.getSnapshot()
      assert.ok(snapshot.repetitionScore > 0, 'repeated items increase repetition score')
    })

    it('should not have high repetition for unique items', () => {
      const memory = new WarmMemory()
      memory.push('a')
      memory.push('b')
      memory.push('c')

      const snapshot = memory.getSnapshot()
      assert.strictEqual(snapshot.repetitionScore, 0, 'unique items have no repetition')
    })
  })

  describe('outcome tracking', () => {
    it('should record last outcome', () => {
      const memory = new WarmMemory()
      memory.recordOutcome('ACCEPT')

      const snapshot = memory.getSnapshot()
      assert.strictEqual(snapshot.lastOutcome, 'ACCEPT')
    })

    it('should update last outcome on new record', () => {
      const memory = new WarmMemory()
      memory.recordOutcome('ACCEPT')
      memory.recordOutcome('REJECT')

      const snapshot = memory.getSnapshot()
      assert.strictEqual(snapshot.lastOutcome, 'REJECT')
    })
  })
})
