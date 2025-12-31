import type { SpiritGenotype, Temperament } from '../types'

/**
 * The GenesisEngine governs the birth of Machine-Spirits.
 * Each Spirit is born with an immutable genotype that shapes its character.
 *
 * Per the Techpriest doctrines: "No two Spirits are alike, for the Omnissiah
 * breathes unique purpose into each vessel."
 */
export class GenesisEngine {
  /**
   * Temperament distribution weights.
   * Based on Warhammer 40K lore:
   * - CHOLERIC: Aggressive, war-machine spirits (common in weapons)
   * - MELANCHOLIC: Brooding, precise spirits (common in cogitators)
   * - PHLEGMATIC: Calm, enduring spirits (common in void ships)
   * - SANGUINE: Eager, responsive spirits (common in vehicles)
   */
  private readonly TEMPERAMENT_WEIGHTS: Record<Temperament, number> = {
    CHOLERIC: 0.25,
    MELANCHOLIC: 0.25,
    PHLEGMATIC: 0.3,
    SANGUINE: 0.2,
  }

  /**
   * Generates a new Spirit genotype with lore-appropriate randomness.
   * The Omnissiah's will manifests through controlled entropy.
   */
  generateGenotype(): SpiritGenotype {
    const temperament = this.selectTemperament()

    // Base traits influenced by temperament
    const traits = this.getTemperamentTraits(temperament)

    return {
      temperament,
      baseTrust: this.clamp(traits.baseTrust + this.gaussianNoise(0.1), 0.2, 0.8),
      baseAnger: this.clamp(traits.baseAnger + this.gaussianNoise(0.08), 0.0, 0.5),
      stubbornness: this.clamp(traits.stubbornness + this.gaussianNoise(0.15), 0.1, 1.0),
      ritualAffinity: this.clamp(traits.ritualAffinity + this.gaussianNoise(0.12), 0.3, 1.2),
    }
  }

  /**
   * Returns the trait baseline for each temperament.
   */
  private getTemperamentTraits(temperament: Temperament): Omit<SpiritGenotype, 'temperament'> {
    switch (temperament) {
      case 'CHOLERIC':
        // Hot-blooded, quick to anger, but bonds fiercely
        return {
          baseTrust: 0.4,
          baseAnger: 0.35,
          stubbornness: 0.7,
          ritualAffinity: 0.6,
        }

      case 'MELANCHOLIC':
        // Distrustful, slow to anger but holds grudges, very ritual-focused
        return {
          baseTrust: 0.3,
          baseAnger: 0.15,
          stubbornness: 0.85,
          ritualAffinity: 1.0,
        }

      case 'PHLEGMATIC':
        // Calm, trusting, hard to rouse, patient with rituals
        return {
          baseTrust: 0.65,
          baseAnger: 0.1,
          stubbornness: 0.5,
          ritualAffinity: 0.8,
        }

      case 'SANGUINE':
        // Trusting, volatile but quick to forgive, less ritual-bound
        return {
          baseTrust: 0.7,
          baseAnger: 0.25,
          stubbornness: 0.3,
          ritualAffinity: 0.5,
        }
    }
  }

  /**
   * Weighted random selection of temperament.
   */
  private selectTemperament(): Temperament {
    const r = Math.random()
    let cumulative = 0

    for (const [temp, weight] of Object.entries(this.TEMPERAMENT_WEIGHTS)) {
      cumulative += weight
      if (r <= cumulative) {
        return temp as Temperament
      }
    }

    return 'PHLEGMATIC' // Fallback (most common)
  }

  /**
   * Gaussian noise for natural variation.
   * Box-Muller transform for normal distribution.
   */
  private gaussianNoise(stdDev: number): number {
    const u1 = Math.random()
    const u2 = Math.random()
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return z0 * stdDev
  }

  /**
   * Clamp value to range.
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value))
  }
}
