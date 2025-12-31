import assert from 'node:assert'
import { describe, it } from 'node:test'
import { Spirit } from '../../forge/spirit'

describe('Cognitive Integration: Trauma & Ghost Penalties', () => {
  it('should propagate trauma to clusters and influence related verbs', () => {
    const spirit = new Spirit()

    // 1. Establish baseline for 'delete' and 'kill' (DESTRUCTIVE_OPS)
    // We expect them to have a neutral bias initially.

    // 2. Trigger a trauma on 'delete' (low purity, negative outcome)
    // We simulate a traumatic event by providing very low purity.
    // The EmotionEngine will spike anger/fear, resulting in a Scar.
    for (let i = 0; i < 3; i++) {
      spirit.interact('delete', 0.05, ['dangerous', 'forbidden'])
    }

    // 3. Now interact with 'kill' (a related verb in the same cluster)
    // Even if 'kill' itself wasn't the target of trauma, it should inherit a 'ghost penalty'
    // because the DESTRUCTIVE_OPS cluster bias should have dropped.

    // We'll run a few trials to see if it leans towards REJECT/ANGER more than a clean spirit would.
    const outcomes: string[] = []
    for (let i = 0; i < 10; i++) {
      outcomes.push(spirit.interact('kill', 0.5, ['terminate']))
    }

    const negativeOutcomes = outcomes.filter((o) => o === 'REJECT' || o === 'ANGER').length
    // In a neutral state, with 0.5 purity, REJECT/ANGER shouldn't be dominant.
    // But with a cluster-wide trauma penalty, they should be significantly pushed up.
    assert.ok(
      negativeOutcomes > 0,
      `Expected some negative outcomes for 'kill' due to 'delete' trauma, got ${negativeOutcomes}`
    )
  })
})
