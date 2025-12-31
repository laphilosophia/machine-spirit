// Testament - Bond Engine Tests
// Per Codex: Validate operator-Spirit relationships

import assert from 'node:assert'
import { describe, it } from 'node:test'
import { BondEngine } from '../../forge/engines/bond-engine'

describe('BondEngine', () => {
  describe('initialization', () => {
    it('should start with no bonds', () => {
      const engine = new BondEngine()
      assert.strictEqual(engine.getAllBonds().length, 0)
    })

    it('should load saved bonds', () => {
      const savedBonds = [
        {
          userId: 'techpriest-1',
          familiarity: 0.5,
          bondTrust: 0.3,
          lastSeen: Date.now(),
          positiveInteractions: 10,
          negativeInteractions: 2,
          sharedScars: [],
          title: 'ENGINSEER' as const,
        },
      ]

      const engine = new BondEngine(savedBonds)
      assert.strictEqual(engine.getAllBonds().length, 1)
      assert.strictEqual(engine.getBond('techpriest-1').title, 'ENGINSEER')
    })
  })

  describe('bond creation', () => {
    it('should create new bond for unknown user', () => {
      const engine = new BondEngine()
      const bond = engine.getBond('new-user')

      assert.strictEqual(bond.userId, 'new-user')
      assert.strictEqual(bond.familiarity, 0)
      assert.strictEqual(bond.bondTrust, 0)
      assert.strictEqual(bond.title, 'STRANGER')
    })

    it('should return existing bond for known user', () => {
      const engine = new BondEngine()
      engine.getBond('user-1')
      engine.recordInteraction('user-1', 'ACCEPT')

      const bond = engine.getBond('user-1')
      assert.ok(bond.familiarity > 0, 'familiarity increased')
    })
  })

  describe('interaction recording', () => {
    it('should increase familiarity on interaction', () => {
      const engine = new BondEngine()
      engine.recordInteraction('user-1', 'ACCEPT')

      const bond = engine.getBond('user-1')
      assert.ok(bond.familiarity > 0, 'familiarity increased')
    })

    it('should increase trust on positive outcomes', () => {
      const engine = new BondEngine()
      engine.recordInteraction('user-1', 'ACCEPT')
      engine.recordInteraction('user-1', 'WHISPER')

      const bond = engine.getBond('user-1')
      assert.ok(bond.bondTrust > 0, 'trust increased')
      assert.strictEqual(bond.positiveInteractions, 2)
    })

    it('should decrease trust on negative outcomes', () => {
      const engine = new BondEngine()
      engine.recordInteraction('user-1', 'ANGER')

      const bond = engine.getBond('user-1')
      assert.ok(bond.bondTrust < 0, 'trust decreased')
      assert.strictEqual(bond.negativeInteractions, 1)
    })

    it('should track shared scars', () => {
      const engine = new BondEngine()
      engine.recordInteraction('user-1', 'ANGER', 'delete-12345')

      const bond = engine.getBond('user-1')
      assert.ok(bond.sharedScars.includes('delete-12345'), 'scar recorded')
    })
  })

  describe('title assignment', () => {
    it('should promote to ADEPT with enough familiarity and trust', () => {
      const engine = new BondEngine()

      // Simulate many positive interactions
      for (let i = 0; i < 30; i++) {
        engine.recordInteraction('user-1', 'ACCEPT')
      }

      const bond = engine.getBond('user-1')
      assert.ok(bond.title !== 'STRANGER', 'promoted from STRANGER')
    })

    it('should allow manual title assignment', () => {
      const engine = new BondEngine()
      engine.assignTitle('new-user', 'MAGOS')

      const bond = engine.getBond('new-user')
      assert.strictEqual(bond.title, 'MAGOS')
    })
  })

  describe('modifiers', () => {
    it('should return trust modifier based on bond', () => {
      const engine = new BondEngine()

      // Build positive relationship
      for (let i = 0; i < 10; i++) {
        engine.recordInteraction('user-1', 'ACCEPT')
      }

      const trustMod = engine.getTrustModifier('user-1')
      assert.ok(trustMod > 0, 'positive trust modifier')
    })

    it('should return patience modifier based on familiarity', () => {
      const engine = new BondEngine()

      for (let i = 0; i < 20; i++) {
        engine.recordInteraction('user-1', 'ACCEPT')
      }

      const patienceMod = engine.getPatienceModifier('user-1')
      assert.ok(patienceMod > 0, 'positive patience modifier')
    })

    it('should return 0 modifier for unknown user', () => {
      const engine = new BondEngine()

      assert.strictEqual(engine.getTrustModifier('unknown'), 0)
      assert.strictEqual(engine.getPatienceModifier('unknown'), 0)
    })
  })
})
