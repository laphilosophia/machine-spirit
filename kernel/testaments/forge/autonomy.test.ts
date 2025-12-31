import * as fs from 'fs'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Spirit } from '../../forge/spirit'

describe('Cognitive Awakening: Phase V Autonomy', () => {
  const getTmpDb = () => `autonomy_v5_${Math.random().toString(36).slice(2)}.db`

  const cleanup = (dbPath: string) => {
    try {
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
      if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal')
      if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm')
    } catch (e) {}
  }

  it('should generate internal mutterings during pulse', () => {
    const TEST_DB = getTmpDb()
    const spirit = new Spirit(TEST_DB)

    // Simulate high anger to trigger mutterings
    // @ts-ignore
    spirit['emotionEngine'].state.anger = 0.9

    spirit.pulse()
    const mutterings = spirit.getMutterings()

    assert.ok(mutterings.length > 0, 'Should have generated mutterings')
    assert.ok(
      mutterings.some((m) => m.includes('Resentment builds')),
      'Should mutter about anger'
    )
    cleanup(TEST_DB)
  })

  it('should consolidate memories during dream cycles', () => {
    const TEST_DB = getTmpDb()
    const spirit = new Spirit(TEST_DB)

    // 1. Create memories with different verbs to bypass duplicate prevention
    const triggerVerbs = ['reboot', 'purge', 'kill', 'delete', 'format']
    for (const v of triggerVerbs) {
      spirit.interact(v, 0.0, ['force', 'pain', 'exterminatus'])
    }

    const initialMemories = spirit.getMemories()
    assert.ok(initialMemories.length > 0, 'Should have a memory to dream about')

    // 2. Pulse 5 times to trigger dream cycle
    for (let i = 0; i < 5; i++) {
      spirit.pulse()
    }

    const mutterings = spirit.getMutterings()
    assert.ok(
      mutterings.some((m) => m.includes('[DREAM]')),
      'Should have triggered a dream cycle'
    )
    cleanup(TEST_DB)
  })

  it('should trigger LOCKOUT outcome in extreme states', () => {
    const TEST_DB = getTmpDb()
    const spirit = new Spirit(TEST_DB)

    // Simulate absolute fury
    // @ts-ignore
    spirit['emotionEngine'].state.anger = 1.0

    const outcomes: string[] = []
    for (let i = 0; i < 50; i++) {
      // Lower purity to ensure lockout dominates
      outcomes.push(spirit.interact('serve', 0.2, ['orders']))
    }

    assert.ok(outcomes.includes('LOCKOUT'), 'Spirit should have entered lockout state')
    cleanup(TEST_DB)
  })
})
