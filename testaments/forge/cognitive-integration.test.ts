import * as fs from 'fs'
import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Spirit } from '../../forge/spirit'
import type { Outcome } from '../../forge/types'

describe('Cognitive Integration: Trauma & Ghost Penalties', () => {
  const getTmpDb = () => `cog_int_${Math.random().toString(36).slice(2)}.db`
  const cleanup = (dbPath: string) => {
    try {
      if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath)
      if (fs.existsSync(dbPath + '-wal')) fs.unlinkSync(dbPath + '-wal')
      if (fs.existsSync(dbPath + '-shm')) fs.unlinkSync(dbPath + '-shm')
    } catch (e) {}
  }

  it('should propagate trauma to clusters and influence related verbs', () => {
    const TEST_DB = getTmpDb()
    const spirit = new Spirit(TEST_DB)

    // 1. Create trauma for 'delete'
    // This should create a cluster including 'kill' and 'remove' (implied by default clusters)
    for (let i = 0; i < 5; i++) {
      spirit.interact('delete', 0.0, ['destroy', 'end', 'stop'])
    }

    // 2. Test 'kill' - should be influenced by 'delete' trauma even if not directly interacted with
    const outcomes: Outcome[] = []
    for (let i = 0; i < 20; i++) {
      outcomes.push(spirit.interact('kill', 0.6, ['heresy']))
    }

    const negative = outcomes.filter(
      (o) => o === 'ANGER' || o === 'REJECT' || o === 'LOCKOUT'
    ).length
    assert.ok(
      negative > 0,
      `Expected some negative outcomes for 'kill' due to 'delete' trauma, got ${negative}`
    )

    cleanup(TEST_DB)
  })
})
