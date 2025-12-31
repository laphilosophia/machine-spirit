import assert from 'node:assert'
import { describe, it } from 'node:test'
import { CognitiveEngine } from '../../forge/engines/cognitive-engine'

describe('CognitiveEngine', () => {
  it('should start with default clusters and 0 XP', () => {
    const engine = new CognitiveEngine()
    assert.strictEqual(engine.getXP(), 0)
    assert.ok(engine.getClusters().length > 0)
  })

  it('should calculate plasticity correctly', () => {
    // With stubbornness=0.5 (default), initial plasticity = 1 / sqrt(0 * 1.5 + 1) = 1
    const engine = new CognitiveEngine(0)
    assert.strictEqual(engine.getPlasticity(), 1)

    // With stubbornness=0, XP=3: plasticity = 1 / sqrt(3 * 1.0 + 1) = 0.5
    const engine2 = new CognitiveEngine(3, [], 0)
    assert.strictEqual(engine2.getPlasticity(), 0.5)

    // Higher stubbornness means faster plasticity decay
    const stubborn = new CognitiveEngine(10, [], 1.0) // effectiveXP = 10 * 2 = 20
    const flexible = new CognitiveEngine(10, [], 0) // effectiveXP = 10 * 1 = 10
    assert.ok(
      stubborn.getPlasticity() < flexible.getPlasticity(),
      'stubborn spirits have lower plasticity'
    )
  })

  it('should gain XP', () => {
    const engine = new CognitiveEngine()
    engine.gainXP(10)
    assert.strictEqual(engine.getXP(), 10)
  })

  it('should update cluster bias based on verb and reward', () => {
    const engine = new CognitiveEngine()
    const technicalCluster = engine.getClusters().find((c) => c.id === 'TECHNICAL_OPS')
    const initialBias = technicalCluster?.bias || 0

    // positive reward for a technical verb
    engine.updateClusters('deploy', 1.0)

    const updatedBias = engine.getVerbBias('deploy')
    assert.ok(updatedBias > initialBias, 'bias increases with positive reward')
  })

  it('should cluster bias should bleed to related verbs', () => {
    const engine = new CognitiveEngine()

    // update 'delete' (destructive)
    engine.updateClusters('delete', -1.0)

    const killBias = engine.getVerbBias('kill')
    assert.ok(killBias < 0, 'bias bleed to related verb in same cluster')
  })
})
