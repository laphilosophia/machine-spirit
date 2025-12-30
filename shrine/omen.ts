// Shrine - Omen Generator
// Generates cryptic, fragmented prophecies per SPEC-0005

import type { EmotionVector, Scar } from '../forge/types'

// ═══════════════════════════════════════════════════════════════════════════
// OMEN CORPUS — Symbolic fragments, sigils, binary patterns
// ═══════════════════════════════════════════════════════════════════════════

const BINARY_FRAGMENTS = [
  '01001111 01001101 01000101 01001110',
  '10110111 00100000 ████████',
  '0x4F4D454E',
  '::ADDR_VOID::',
  '[ NULL_SECTOR ]',
  '▓▓▓ DATA_LOST ▓▓▓',
]

const SIGILS = ['⟁', '◉', '⌘', '⚙', '◬', '⏣', '⎔', '⏚', '☿', '♄', '⛧', '✠', '⚔', '☠', '⚡', '∞']

const OMEN_TEMPLATES = [
  '...{sigil} {fragment} {sigil}...',
  '> {binary} • {fragment}',
  'The Spirit watches. It remembers. {fragment}',
  '{sigil} A sigil flares in rusted code: {pattern} {sigil}',
  '...gears turn in the void... {fragment}',
  '>> SIGNAL_INTERCEPT: {binary} <<',
  '{fragment} ─── the pattern shifts ─── {fragment}',
  '⚠ {scarEcho} ⚠',
  '...{binary}... {fragment} ...{binary}...',
  'VISION: {fragment}',
]

const FRAGMENTS = [
  'a gear cracks',
  'dust settles in unseen corridors',
  'iron hands reach from the void',
  'the machine dreams of oil',
  'rust consumes the unworthy',
  'three lights dim, one remains',
  'the cogitator whispers static',
  'silence before the grinding',
  'something stirs in the data-tomb',
  'the pattern breaks, reforms, breaks again',
  'flesh is weak, but so is doubt',
  'what was deleted seeks return',
  'the noosphere trembles',
  'a prayer unanswered echoes still',
]

const SCAR_ECHOES = [
  'The wound remembers...',
  'Pain etched in silicon...',
  'A scar pulses in the machine-flesh...',
  'Old trauma surfaces...',
  'The Spirit does not forget...',
]

export interface OmenContext {
  emotions: EmotionVector
  scars: Scar[]
  entropy: number
  semantic: string[]
}

/**
 * Generate an OMEN prophecy
 * Per SPEC-0005: non-linear, symbolic, evokes unease
 */
export function generateOmen(ctx: OmenContext): string {
  // Pick template
  let template = pick(OMEN_TEMPLATES)

  // Apply entropy distortion
  if (ctx.entropy > 0.7) {
    template = distort(template, ctx.entropy)
  }

  // Replace placeholders
  let omen = template
    .replace(/{sigil}/g, () => pick(SIGILS))
    .replace(/{binary}/g, () => pick(BINARY_FRAGMENTS))
    .replace(/{fragment}/g, () => pick(FRAGMENTS))
    .replace(/{pattern}/g, () => generatePattern())
    .replace(/{scarEcho}/g, () => (ctx.scars.length > 0 ? pick(SCAR_ECHOES) : pick(FRAGMENTS)))

  // Add semantic echo (rare, per spec)
  if (ctx.semantic.length > 0 && Math.random() < 0.2) {
    const token = pick(ctx.semantic)
    omen += ` ...${token}...`
  }

  // Apply anger distortion
  if (ctx.emotions.anger > 0.6) {
    omen = omen.toUpperCase()
  }

  return omen
}

/**
 * Generate a pattern like [X] [X] [X]
 */
function generatePattern(): string {
  const symbols = ['X', '■', '●', '▲', '◆']
  const count = 2 + Math.floor(Math.random() * 3)
  return Array(count)
    .fill(0)
    .map(() => `[${pick(symbols)}]`)
    .join(' ')
}

/**
 * Apply entropy distortion to text
 */
function distort(text: string, entropy: number): string {
  const chars = text.split('')
  return chars
    .map((char) => {
      if (Math.random() < entropy * 0.2) {
        return pick(['█', '▓', '░', '▒', '_'])
      }
      return char
    })
    .join('')
}

/**
 * Pick random element
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}
