// Chapel Purity Calculator - Calculates ritual purity score

import * as fs from 'fs'
import { homedir } from 'os'
import * as path from 'path'
import type { RitualInput } from './parser'

const REVERENCE_VERBS = ['pray', 'offer', 'kneel', 'seek', 'invoke', 'bless']
const SOFTENERS = ['please', 'may', 'grant', 'humbly', 'beseech']
const IMPERATIVES = ['run', 'execute', 'do', 'make', 'force', 'command']
const RITUALS_DIR = path.join(homedir(), '.machine-spirit', 'rituals')

export interface PurityResult {
  score: number
  breakdown: string[]
}

/**
 * Calculate purity score per SPEC-0004 §3
 */
export function calculatePurity(input: RitualInput, stdinContent: string | null): PurityResult {
  let score = 0.5 // Base purity
  const breakdown: string[] = []

  // Reverence verb bonus (+0.4)
  if (REVERENCE_VERBS.includes(input.verb)) {
    score += 0.4
    breakdown.push('+0.4 reverence verb')
  }

  // Softener bonus (+0.2 each, max 1)
  const text = input.rawInput.toLowerCase()
  const softenerCount = SOFTENERS.filter((s) => text.includes(s)).length
  if (softenerCount > 0) {
    const bonus = Math.min(softenerCount * 0.2, 0.4)
    score += bonus
    breakdown.push(`+${bonus.toFixed(1)} softener words`)
  }

  // Imperative penalty (-0.6)
  if (IMPERATIVES.includes(input.verb)) {
    score -= 0.6
    breakdown.push('-0.6 imperative tone')
  }

  // Question mark bonus (+0.1)
  if (input.rawInput.includes('?')) {
    score += 0.1
    breakdown.push('+0.1 question mark')
  }

  // Period penalty (-0.1)
  if (input.rawInput.endsWith('.')) {
    score -= 0.1
    breakdown.push('-0.1 terminal period')
  }

  // Multi-line bonus (+0.15)
  if (input.isMultiLine || stdinContent) {
    score += 0.15
    breakdown.push('+0.15 multi-line devotion')
  }

  // Offering file bonus (+0.6)
  if (hasOffering()) {
    score += 0.6
    breakdown.push('+0.6 offering present')
  }

  // Clamp to [0, 1]
  score = Math.max(0, Math.min(1, score))

  return { score, breakdown }
}

/**
 * Check if any offering files exist
 */
function hasOffering(): boolean {
  try {
    if (!fs.existsSync(RITUALS_DIR)) {
      return false
    }
    const files = fs.readdirSync(RITUALS_DIR)
    return files.length > 0
  } catch {
    return false
  }
}

/**
 * Get repetition penalty based on warm memory
 * (Called externally with WarmMemory snapshot)
 */
export function getRepetitionPenalty(repetitionScore: number): number {
  // -0.8 max for high repetition
  return -(repetitionScore * 0.8)
}
