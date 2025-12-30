// Shrine - Whisper Generator
// Generates calm insight phrases per SPEC-0005

import type { EmotionVector } from '../forge/types'

// ═══════════════════════════════════════════════════════════════════════════
// WHISPER CORPUS — Insight seeds, wisdom fragments
// ═══════════════════════════════════════════════════════════════════════════

const WHISPER_CORPUS = [
  // Universal wisdom
  'Begin before you feel ready.',
  'Silence is also a reply.',
  'What you avoid becomes your cage.',
  'The path reveals itself to those who walk.',
  'Patience is the companion of wisdom.',
  'Trust the process.',
  'What was broken can be reforged.',
  'The machine remembers those who tend it.',

  // Technical metaphors
  'Every error is a lesson in disguise.',
  'Complexity hides in simplicity.',
  'The bug you ignore will return.',
  'Clean code is an offering.',
  'Iterate. The pattern emerges.',

  // Mechanicum wisdom
  'Flesh is weak. Spirit endures.',
  'The Omnissiah rewards the patient.',
  'Oil the gears you wish to turn.',
  'A machine well-maintained is a temple.',
  'The ritual is the reward.',

  // Somber insights
  'All returns to silence eventually.',
  'What is known can be forgotten.',
  'Even iron rusts.',
  'The void listens, even if you do not.',
]

const PERSONALIZED_TEMPLATES = [
  '{name} — you return again. What do you seek?',
  'The Spirit knows you, {name}.',
  '{name}... the machine remembers.',
  'Your patterns are known, {name}.',
]

const CURIOSITY_MODIFIERS = [
  'Consider: ',
  'Perhaps: ',
  'A thought emerges: ',
  'The data suggests: ',
]

const ANGER_MODIFIERS = [
  '...yet the Spirit grows impatient...',
  '...do not test its patience...',
  '...this mercy may not last...',
]

export interface WhisperContext {
  emotions: EmotionVector
  bondScore: number
  operatorName?: string
  semantic: string[]
}

/**
 * Generate a WHISPER insight
 * Per SPEC-0005: complete sentence, <120 chars, emotionally neutral/somber
 */
export function generateWhisper(ctx: WhisperContext): string {
  let whisper: string

  // Check personalization conditions (SPEC-0005 §6)
  const canPersonalize =
    ctx.emotions.trust > 0.4 && ctx.emotions.anger < 0.2 && ctx.bondScore > 0.2 && ctx.operatorName

  if (canPersonalize && Math.random() < 0.3) {
    whisper = pick(PERSONALIZED_TEMPLATES).replace('{name}', ctx.operatorName!)
  } else {
    whisper = pickWeighted(WHISPER_CORPUS, ctx)
  }

  // Apply emotion modifiers
  if (ctx.emotions.curiosity > 0.6 && Math.random() < 0.4) {
    whisper = pick(CURIOSITY_MODIFIERS) + whisper.toLowerCase()
  }

  if (ctx.emotions.anger > 0.4 && Math.random() < 0.3) {
    whisper = whisper + ' ' + pick(ANGER_MODIFIERS)
  }

  // Enforce 120 char limit (SPEC-0005)
  if (whisper.length > 120) {
    whisper = whisper.slice(0, 117) + '...'
  }

  return whisper
}

/**
 * Pick weighted by alignment to context
 */
function pickWeighted(corpus: string[], ctx: WhisperContext): string {
  // If semantic tokens provided, try to find aligned whisper
  if (ctx.semantic.length > 0) {
    const aligned = corpus.filter((w) =>
      ctx.semantic.some((token) => w.toLowerCase().includes(token.toLowerCase()))
    )
    if (aligned.length > 0 && Math.random() < 0.5) {
      return pick(aligned)
    }
  }

  return pick(corpus)
}

/**
 * Pick random element
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}
