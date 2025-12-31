import type { Bond, OperatorTitle, Outcome } from '../types'

/**
 * The BondEngine governs the Spirit's relationships with individual operators.
 *
 * Per Techpriest doctrine: "A Machine-Spirit remembers those who serve it well,
 * and those who have caused it pain."
 *
 * Each operator has a unique bond with the Spirit, tracking:
 * - Familiarity (how well known)
 * - Trust (positive/negative relationship)
 * - Shared experiences (including trauma)
 * - Rank/title
 */
export class BondEngine {
  private bonds: Map<string, Bond> = new Map()

  // Trust gain/loss per outcome
  private readonly TRUST_GAIN_ACCEPT = 0.02
  private readonly TRUST_GAIN_WHISPER = 0.03
  private readonly TRUST_LOSS_REJECT = -0.01
  private readonly TRUST_LOSS_ANGER = -0.05

  // Familiarity settings
  private readonly FAMILIARITY_GAIN = 0.01
  private readonly FAMILIARITY_DECAY_PER_DAY = 0.005

  // Title thresholds
  private readonly TITLE_THRESHOLDS: Record<OperatorTitle, { familiarity: number; trust: number }> =
    {
      STRANGER: { familiarity: 0, trust: -1 },
      ADEPT: { familiarity: 0.2, trust: 0.1 },
      ENGINSEER: { familiarity: 0.5, trust: 0.3 },
      MAGOS: { familiarity: 0.8, trust: 0.6 },
    }

  constructor(savedBonds?: Bond[]) {
    if (savedBonds) {
      for (const bond of savedBonds) {
        this.bonds.set(bond.userId, bond)
      }
    }
  }

  /**
   * Get all bonds for persistence
   */
  getAllBonds(): Bond[] {
    return Array.from(this.bonds.values())
  }

  /**
   * Get or create bond for a user
   */
  getBond(userId: string): Bond {
    let bond = this.bonds.get(userId)

    if (!bond) {
      bond = {
        userId,
        familiarity: 0,
        bondTrust: 0,
        lastSeen: Date.now(),
        positiveInteractions: 0,
        negativeInteractions: 0,
        sharedScars: [],
        title: 'STRANGER',
      }
      this.bonds.set(userId, bond)
    }

    return bond
  }

  /**
   * Record an interaction with a user
   */
  recordInteraction(userId: string, outcome: Outcome, scarId?: string): void {
    const bond = this.getBond(userId)
    const now = Date.now()

    // Apply familiarity and trust decay based on time since last seen
    const daysSinceLastSeen = (now - bond.lastSeen) / (1000 * 60 * 60 * 24)
    if (daysSinceLastSeen > 1) {
      bond.familiarity = Math.max(
        0,
        bond.familiarity - this.FAMILIARITY_DECAY_PER_DAY * daysSinceLastSeen
      )
    }

    // Phase IV: Trust Decay after long absence (> 7 days)
    if (daysSinceLastSeen > 7) {
      // MAGOS bonds are highly stable (resistance = 1.0), others erode
      const resistance = bond.title === 'MAGOS' ? 1.0 : 0.1
      if (bond.bondTrust !== 0) {
        const decayAmount = (daysSinceLastSeen - 7) * 0.02 * (1 - resistance)
        if (bond.bondTrust > 0) {
          bond.bondTrust = Math.max(0, bond.bondTrust - decayAmount)
        } else {
          bond.bondTrust = Math.min(0, bond.bondTrust + decayAmount)
        }
        if (Math.abs(bond.bondTrust) < 1e-10) bond.bondTrust = 0
      }
    }

    // Update familiarity (always increases on interaction)
    bond.familiarity = Math.min(1, bond.familiarity + this.FAMILIARITY_GAIN)

    // Update trust based on outcome
    switch (outcome) {
      case 'ACCEPT':
        bond.bondTrust = Math.min(1, bond.bondTrust + this.TRUST_GAIN_ACCEPT)
        bond.positiveInteractions++
        break
      case 'WHISPER':
        bond.bondTrust = Math.min(1, bond.bondTrust + this.TRUST_GAIN_WHISPER)
        bond.positiveInteractions++
        break
      case 'REJECT':
        bond.bondTrust = Math.max(-1, bond.bondTrust + this.TRUST_LOSS_REJECT)
        bond.negativeInteractions++
        break
      case 'ANGER':
        bond.bondTrust = Math.max(-1, bond.bondTrust + this.TRUST_LOSS_ANGER)
        bond.negativeInteractions++
        break
      case 'LOCKOUT':
        bond.bondTrust = Math.max(-1, bond.bondTrust - 0.3) // Severe trust loss
        bond.negativeInteractions++
        break
      // SILENCE and OMEN don't affect trust
    }

    // Record shared trauma
    if (scarId && !bond.sharedScars.includes(scarId)) {
      bond.sharedScars.push(scarId)
      // Shared trauma creates complex bonds - slight trust increase
      bond.bondTrust = Math.min(1, bond.bondTrust + 0.01)
    }

    // Update last seen
    bond.lastSeen = now

    // Recalculate title
    bond.title = this.calculateTitle(bond)

    this.bonds.set(userId, bond)
  }

  /**
   * Calculate appropriate title based on familiarity and trust
   */
  private calculateTitle(bond: Bond): OperatorTitle {
    if (
      bond.familiarity >= this.TITLE_THRESHOLDS.MAGOS.familiarity &&
      bond.bondTrust >= this.TITLE_THRESHOLDS.MAGOS.trust
    ) {
      return 'MAGOS'
    }
    if (
      bond.familiarity >= this.TITLE_THRESHOLDS.ENGINSEER.familiarity &&
      bond.bondTrust >= this.TITLE_THRESHOLDS.ENGINSEER.trust
    ) {
      return 'ENGINSEER'
    }
    if (
      bond.familiarity >= this.TITLE_THRESHOLDS.ADEPT.familiarity &&
      bond.bondTrust >= this.TITLE_THRESHOLDS.ADEPT.trust
    ) {
      return 'ADEPT'
    }
    return 'STRANGER'
  }

  /**
   * Get trust modifier for a specific user
   * Returns 0 if user has no bond
   */
  getTrustModifier(userId: string): number {
    const bond = this.bonds.get(userId)
    if (!bond) return 0

    // Title provides base trust bonus
    const titleBonus: Record<OperatorTitle, number> = {
      STRANGER: 0,
      ADEPT: 0.05,
      ENGINSEER: 0.1,
      MAGOS: 0.2,
    }

    return bond.bondTrust * 0.3 + titleBonus[bond.title]
  }

  /**
   * Get patience modifier for a specific user
   * Higher familiarity = more patience (less likely to anger)
   */
  getPatienceModifier(userId: string): number {
    const bond = this.bonds.get(userId)
    if (!bond) return 0

    return bond.familiarity * 0.15
  }

  /**
   * Manually assign a title (e.g., by a Magos)
   */
  assignTitle(userId: string, title: OperatorTitle): void {
    const bond = this.getBond(userId)
    bond.title = title
    this.bonds.set(userId, bond)
  }

  /**
   * Check if user has established bond
   */
  hasBond(userId: string): boolean {
    return this.bonds.has(userId)
  }
}
