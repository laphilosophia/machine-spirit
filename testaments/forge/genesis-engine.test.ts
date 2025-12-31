// Testament - Genesis Engine Tests
// Per Codex: Validate Spirit personality generation

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { GenesisEngine } from '../../forge/engines/genesis-engine'
import type { SpiritGenotype, Temperament } from '../../forge/types'

describe('GenesisEngine', () => {
  describe('generateGenotype', () => {
    it('should generate valid genotype with all required fields', () => {
      const engine = new GenesisEngine()
      const genotype = engine.generateGenotype()

      assert.ok(genotype.temperament, 'has temperament')
      assert.ok(typeof genotype.baseTrust === 'number', 'has baseTrust')
      assert.ok(typeof genotype.baseAnger === 'number', 'has baseAnger')
      assert.ok(typeof genotype.stubbornness === 'number', 'has stubbornness')
      assert.ok(typeof genotype.ritualAffinity === 'number', 'has ritualAffinity')
    })

    it('should generate temperament within valid values', () => {
      const engine = new GenesisEngine()
      const validTemperaments: Temperament[] = ['CHOLERIC', 'MELANCHOLIC', 'PHLEGMATIC', 'SANGUINE']

      // Test multiple generations for coverage
      for (let i = 0; i < 20; i++) {
        const genotype = engine.generateGenotype()
        assert.ok(
          validTemperaments.includes(genotype.temperament),
          `temperament ${genotype.temperament} is valid`
        )
      }
    })

    it('should generate baseTrust within bounds (0.2-0.8)', () => {
      const engine = new GenesisEngine()

      for (let i = 0; i < 20; i++) {
        const genotype = engine.generateGenotype()
        assert.ok(genotype.baseTrust >= 0.2, `baseTrust ${genotype.baseTrust} >= 0.2`)
        assert.ok(genotype.baseTrust <= 0.8, `baseTrust ${genotype.baseTrust} <= 0.8`)
      }
    })

    it('should generate baseAnger within bounds (0.0-0.5)', () => {
      const engine = new GenesisEngine()

      for (let i = 0; i < 20; i++) {
        const genotype = engine.generateGenotype()
        assert.ok(genotype.baseAnger >= 0.0, `baseAnger ${genotype.baseAnger} >= 0.0`)
        assert.ok(genotype.baseAnger <= 0.5, `baseAnger ${genotype.baseAnger} <= 0.5`)
      }
    })

    it('should generate stubbornness within bounds (0.1-1.0)', () => {
      const engine = new GenesisEngine()

      for (let i = 0; i < 20; i++) {
        const genotype = engine.generateGenotype()
        assert.ok(genotype.stubbornness >= 0.1, `stubbornness ${genotype.stubbornness} >= 0.1`)
        assert.ok(genotype.stubbornness <= 1.0, `stubbornness ${genotype.stubbornness} <= 1.0`)
      }
    })

    it('should produce variation between genotypes', () => {
      const engine = new GenesisEngine()
      const genotypes: SpiritGenotype[] = []

      for (let i = 0; i < 10; i++) {
        genotypes.push(engine.generateGenotype())
      }

      // Check that not all values are identical
      const uniqueTemperaments = new Set(genotypes.map((g) => g.temperament))
      const uniqueTrusts = new Set(genotypes.map((g) => g.baseTrust.toFixed(2)))

      // With 10 samples, we should have some variation
      assert.ok(
        uniqueTemperaments.size > 1 || uniqueTrusts.size > 1,
        'generated genotypes have variation'
      )
    })
  })
})
