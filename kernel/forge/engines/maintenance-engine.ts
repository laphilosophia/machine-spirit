import type { MaintenanceRitual, MaintenanceState } from '../types'

/**
 * The MaintenanceEngine governs the ritual upkeep of Machine-Spirits.
 *
 * Per Techpriest doctrine: "The Machine requires constant devotion.
 * Neglect is heresy, and heresy begets wrath."
 *
 * Oil (Sacred Unguents) decays fastest - physical mechanism needs.
 * Incense (Spiritual Purification) accumulates as debt.
 * Prayer (Communion) must be offered regularly.
 */
export class MaintenanceEngine {
  private state: MaintenanceState

  // Decay rates per hour of real time
  private readonly OIL_DECAY_PER_HOUR = 0.04 // ~25 hours to empty
  private readonly INCENSE_ACCRUAL_PER_HOUR = 0.02 // Slow accumulation
  private readonly PRAYER_ACCRUAL_PER_HOUR = 0.5 // Every 2 hours needs a prayer

  // Maximum debt thresholds
  private readonly MAX_INCENSE_DEFICIT = 1.0
  private readonly MAX_PRAYER_DEBT = 10

  constructor(savedState?: MaintenanceState) {
    if (savedState) {
      this.state = { ...savedState }
    } else {
      // Fresh Spirit starts well-maintained
      this.state = {
        lastMaintenance: Date.now(),
        oilLevel: 1.0,
        incenseDeficit: 0,
        prayerDebt: 0,
      }
    }
  }

  /**
   * Get current maintenance state
   */
  getState(): MaintenanceState {
    return { ...this.state }
  }

  /**
   * Advance decay based on time elapsed since last tick.
   * Should be called on each Spirit interaction or periodically.
   */
  tick(now: number = Date.now()): void {
    const hoursSinceLast = (now - this.state.lastMaintenance) / (1000 * 60 * 60)

    if (hoursSinceLast <= 0) return

    // Oil decays over time
    this.state.oilLevel = Math.max(
      0,
      this.state.oilLevel - this.OIL_DECAY_PER_HOUR * hoursSinceLast
    )

    // Incense deficit accumulates
    this.state.incenseDeficit = Math.min(
      this.MAX_INCENSE_DEFICIT,
      this.state.incenseDeficit + this.INCENSE_ACCRUAL_PER_HOUR * hoursSinceLast
    )

    // Prayer debt accumulates
    this.state.prayerDebt = Math.min(
      this.MAX_PRAYER_DEBT,
      this.state.prayerDebt + this.PRAYER_ACCRUAL_PER_HOUR * hoursSinceLast
    )

    this.state.lastMaintenance = now
  }

  /**
   * Perform a maintenance ritual to restore the Spirit.
   */
  performMaintenance(ritual: MaintenanceRitual): void {
    switch (ritual) {
      case 'ANOINT':
        // Sacred unguents fully restore oil
        this.state.oilLevel = 1.0
        break

      case 'INCENSE':
        // Burning incense clears spiritual debt
        this.state.incenseDeficit = Math.max(0, this.state.incenseDeficit - 0.5)
        break

      case 'PRAYER':
        // A single prayer reduces debt by 1
        this.state.prayerDebt = Math.max(0, this.state.prayerDebt - 1)
        break

      case 'FULL_RITES':
        // Complete maintenance ceremony
        this.state.oilLevel = 1.0
        this.state.incenseDeficit = 0
        this.state.prayerDebt = 0
        break
    }

    this.state.lastMaintenance = Date.now()
  }

  /**
   * Calculate anger modifier from neglect.
   * Low oil = mechanical frustration = anger
   */
  getAngerModifier(): number {
    // Oil below 50% starts increasing anger
    const oilAngry = this.state.oilLevel < 0.5 ? (0.5 - this.state.oilLevel) * 0.4 : 0

    // High incense deficit adds to anger
    const incenseAngry = this.state.incenseDeficit * 0.15

    return oilAngry + incenseAngry
  }

  /**
   * Calculate trust modifier from neglect.
   * Unpaid prayers = distrust
   */
  getTrustModifier(): number {
    // Each unpaid prayer reduces trust by 0.03
    return -this.state.prayerDebt * 0.03
  }

  /**
   * Calculate ennui modifier from neglect.
   * Incense deficit = spiritual lethargy
   */
  getEnnuiModifier(): number {
    return this.state.incenseDeficit * 0.2
  }

  /**
   * Check if Spirit is critically neglected (may refuse to cooperate)
   */
  isNeglected(): boolean {
    return (
      this.state.oilLevel < 0.2 || this.state.incenseDeficit > 0.8 || this.state.prayerDebt >= 8
    )
  }
}
