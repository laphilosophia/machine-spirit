// Testament - Maintenance Engine Tests
// Per Codex: Validate sacred rites and decay mechanics

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { MaintenanceEngine } from '../../forge/engines/maintenance-engine'

describe('MaintenanceEngine', () => {
  describe('initialization', () => {
    it('should start with full maintenance state', () => {
      const engine = new MaintenanceEngine()
      const state = engine.getState()

      assert.strictEqual(state.oilLevel, 1.0)
      assert.strictEqual(state.incenseDeficit, 0)
      assert.strictEqual(state.prayerDebt, 0)
    })

    it('should load saved state', () => {
      const savedState = {
        lastMaintenance: Date.now() - 1000,
        oilLevel: 0.5,
        incenseDeficit: 0.3,
        prayerDebt: 4,
      }

      const engine = new MaintenanceEngine(savedState)
      const state = engine.getState()

      assert.strictEqual(state.oilLevel, 0.5)
      assert.strictEqual(state.incenseDeficit, 0.3)
      assert.strictEqual(state.prayerDebt, 4)
    })
  })

  describe('decay mechanics', () => {
    it('should decay oil over time', () => {
      const engine = new MaintenanceEngine()
      const initialOil = engine.getState().oilLevel

      // Simulate 1 hour passing
      const oneHourLater = Date.now() + 1000 * 60 * 60
      engine.tick(oneHourLater)

      assert.ok(engine.getState().oilLevel < initialOil, 'oil should decay')
    })

    it('should accumulate incense deficit over time', () => {
      const engine = new MaintenanceEngine()
      const initialDeficit = engine.getState().incenseDeficit

      // Simulate 1 hour passing
      const oneHourLater = Date.now() + 1000 * 60 * 60
      engine.tick(oneHourLater)

      assert.ok(
        engine.getState().incenseDeficit > initialDeficit,
        'incense deficit should increase'
      )
    })

    it('should accumulate prayer debt over time', () => {
      const engine = new MaintenanceEngine()
      const initialDebt = engine.getState().prayerDebt

      // Simulate 1 hour passing
      const oneHourLater = Date.now() + 1000 * 60 * 60
      engine.tick(oneHourLater)

      assert.ok(engine.getState().prayerDebt > initialDebt, 'prayer debt should increase')
    })
  })

  describe('ritual maintenance', () => {
    it('should restore oil with ANOINT ritual', () => {
      const engine = new MaintenanceEngine({
        lastMaintenance: Date.now(),
        oilLevel: 0.2,
        incenseDeficit: 0.5,
        prayerDebt: 5,
      })

      engine.performMaintenance('ANOINT')

      assert.strictEqual(engine.getState().oilLevel, 1.0)
    })

    it('should reduce incense deficit with INCENSE ritual', () => {
      const engine = new MaintenanceEngine({
        lastMaintenance: Date.now(),
        oilLevel: 1.0,
        incenseDeficit: 0.8,
        prayerDebt: 0,
      })

      engine.performMaintenance('INCENSE')

      // Use approximate comparison for floating point
      assert.ok(
        Math.abs(engine.getState().incenseDeficit - 0.3) < 0.001,
        'incense deficit should be approximately 0.3'
      )
    })

    it('should reduce prayer debt with PRAYER ritual', () => {
      const engine = new MaintenanceEngine({
        lastMaintenance: Date.now(),
        oilLevel: 1.0,
        incenseDeficit: 0,
        prayerDebt: 5,
      })

      engine.performMaintenance('PRAYER')

      assert.strictEqual(engine.getState().prayerDebt, 4)
    })

    it('should fully restore with FULL_RITES', () => {
      const engine = new MaintenanceEngine({
        lastMaintenance: Date.now(),
        oilLevel: 0.1,
        incenseDeficit: 0.9,
        prayerDebt: 8,
      })

      engine.performMaintenance('FULL_RITES')

      const state = engine.getState()
      assert.strictEqual(state.oilLevel, 1.0)
      assert.strictEqual(state.incenseDeficit, 0)
      assert.strictEqual(state.prayerDebt, 0)
    })
  })

  describe('neglect modifiers', () => {
    it('should increase anger modifier when oil is low', () => {
      const engine = new MaintenanceEngine({
        lastMaintenance: Date.now(),
        oilLevel: 0.1,
        incenseDeficit: 0,
        prayerDebt: 0,
      })

      assert.ok(engine.getAngerModifier() > 0, 'low oil causes anger')
    })

    it('should decrease trust modifier when prayer debt is high', () => {
      const engine = new MaintenanceEngine({
        lastMaintenance: Date.now(),
        oilLevel: 1.0,
        incenseDeficit: 0,
        prayerDebt: 5,
      })

      assert.ok(engine.getTrustModifier() < 0, 'prayer debt reduces trust')
    })

    it('should detect critical neglect', () => {
      const neglected = new MaintenanceEngine({
        lastMaintenance: Date.now(),
        oilLevel: 0.1,
        incenseDeficit: 0.9,
        prayerDebt: 9,
      })

      const healthy = new MaintenanceEngine()

      assert.strictEqual(neglected.isNeglected(), true)
      assert.strictEqual(healthy.isNeglected(), false)
    })
  })
})
