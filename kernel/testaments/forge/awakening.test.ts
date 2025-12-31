import * as fs from 'fs'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Spirit } from '../../forge/spirit'

describe('Cognitive Awakening: Phase IV Integration', () => {
  const getTmpDb = (name: string) => `awakening_${name}_${Math.random().toString(36).slice(2)}.db`
  const cleanupDb = (dbPath: string) => {
    try {
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
      if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal')
      if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm')
    } catch (e) {}
  }

  it('should influence outcomes via Active Narrative Recall (Echoes)', () => {
    const TEST_DB = getTmpDb('echo')
    try {
      const spirit = new Spirit(TEST_DB)
      const operatorId = 'tech-priest-echo-test'

      // 1. Create a traumatic memory
      for (let i = 0; i < 5; i++) {
        spirit.interact(`purge-${i}`, 0.01, ['heresy', 'fire', 'exterminatus'], operatorId)
      }

      const memories = spirit.getMemories()
      assert.ok(
        memories.some((m) => m.verb.startsWith('purge')),
        'Should have created a memory for "purge"'
      )

      // 2. Interact with the same verb again
      const outcomes: string[] = []
      for (let i = 0; i < 20; i++) {
        // Lower purity to 0.4 to allow the echo penalty to tip the scale
        outcomes.push(spirit.interact('purge-0', 0.4, ['heresy'], operatorId))
      }

      const negative = outcomes.filter(
        (o) => o === 'ANGER' || o === 'REJECT' || o === 'LOCKOUT'
      ).length
      assert.ok(negative > 0, `Expected some friction due to recall echo, got ${negative}`)
    } finally {
      cleanupDb(TEST_DB)
    }
  })

  it('should erode bond trust after long absence', () => {
    const TEST_DB = getTmpDb('decay')
    try {
      const spirit = new Spirit(TEST_DB)
      const operatorId = 'absent-adept-unique'

      // Manually initialize bond to bypass build-up stochasticity
      // @ts-ignore
      const bond = spirit['bondEngine'].getBond(operatorId)
      bond.bondTrust = 0.5
      bond.familiarity = 0.5
      const initialTrust = bond.bondTrust

      // 1. Simulate 10 days of absence
      const tenDaysSum = 10 * 24 * 60 * 60 * 1000
      bond.lastSeen = Date.now() - tenDaysSum

      // 2. Next interaction should trigger trust decay
      spirit.interact('check-status', 0.5, ['maintenance'], operatorId)

      assert.ok(
        bond.bondTrust < initialTrust,
        `Trust should have eroded: ${bond.bondTrust} < ${initialTrust}`
      )
    } finally {
      cleanupDb(TEST_DB)
    }
  })
})
