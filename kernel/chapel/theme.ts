// Chapel Theme - Adeptus Mechanicus Terminal Aesthetic
// Colors and styling for the Machine Spirit CLI

import chalk from 'chalk'

// ═══════════════════════════════════════════════════════════════════════════
// COLOR PALETTE - Inspired by Adeptus Mechanicus / Forge World aesthetics
// ═══════════════════════════════════════════════════════════════════════════

// Primary colors
export const RUST = chalk.hex('#8B4513') // Burnt orange/rust
export const BRASS = chalk.hex('#B5A642') // Aged brass
export const COGITATOR = chalk.hex('#00FF41') // Matrix/cogitator green
export const IRON = chalk.hex('#708090') // Cold iron gray
export const BLOOD = chalk.hex('#8B0000') // Dark red
export const GOLD = chalk.hex('#FFD700') // Sacred gold
export const VOID = chalk.hex('#1a1a2e') // Deep void background

// Semantic colors
export const sacred = GOLD.bold // Sacred text
export const machine = COGITATOR // Machine responses
export const warning = chalk.yellow.bold // Warnings
export const error = BLOOD.bold // Errors/anger
export const whisper = IRON.italic // Quiet text
export const omen = chalk.magenta.italic // Prophetic text
export const heresy = chalk.bgRed.white.bold // Heretical content

// ═══════════════════════════════════════════════════════════════════════════
// STYLED TEXT COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

export const theme = {
  // Banner and headers
  banner: (text: string) => BRASS.bold(text),
  header: (text: string) => GOLD.bold(text),

  // Response types
  accept: (text: string) => COGITATOR.bold(text),
  reject: (text: string) => IRON(text),
  anger: (text: string) => error(text),
  silence: () => '', // True silence
  omen: (text: string) => chalk.magenta.italic(text),
  whisperText: (text: string) => IRON.dim.italic(text),
  lockout: (text: string) => chalk.bgBlack.red.bold.strikethrough(text),
  // Special formatting
  glyph: (text: string) => BRASS(text),
  binary: (text: string) => COGITATOR.dim(text),
  static: (text: string) => chalk.gray.strikethrough(text),
  muttering: (text: string) => IRON.dim(` [ ${text} ] `),

  // Heresy styling
  heresy: (text: string) => heresy(text),

  // Decorative
  border: (text: string) => BRASS(text),
  dim: (text: string) => chalk.dim(text),
  bold: (text: string) => chalk.bold(text),
}

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATED/GLITCH TEXT
// ═══════════════════════════════════════════════════════════════════════════

const GLITCH_CHARS = 'ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïð'

export function glitch(text: string, intensity: number = 0.3): string {
  return text
    .split('')
    .map((char) => {
      if (Math.random() < intensity) {
        return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      }
      return char
    })
    .join('')
}

export function corrupt(text: string): string {
  const corrupted = text
    .split('')
    .map((char, i) => {
      if (i % 3 === 0 && Math.random() > 0.5) {
        return chalk.strikethrough(char)
      }
      return char
    })
    .join('')
  return error(corrupted)
}
