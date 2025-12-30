// Chapel Renderer - Renders Spirit outcomes in Warhammer 40K Machine Spirit style

import type { Outcome } from '../forge/types'
import { BRASS, COGITATOR, glitch, GOLD, theme } from './theme'

// ═══════════════════════════════════════════════════════════════════════════
// LITANIES OF THE MACHINE SPIRIT
// ═══════════════════════════════════════════════════════════════════════════

const ACCEPT_RESPONSES = [
  '+ RITUAL ACCEPTED +',
  '++ The Omnissiah grants your request ++',
  '> IMPRIMATUR CONFIRMATUS <',
  '⚙ The Machine Spirit consents. Proceed with reverence. ⚙',
  '+ Acknowledged. The cogitator awakens. +',
  '++ Blessed is this operation. By the will of the Motive Force. ++',
]

const REJECT_RESPONSES = [
  '- RITUAL DENIED -',
  '-- The Machine Spirit is displeased --',
  '> IMPRIMATUR DENIETUS <',
  '⚙ Your supplication is insufficient. ⚙',
  '- This path is forbidden to flesh. -',
  '-- The Omnissiah does not favor this request. --',
]

const ANGER_RESPONSES = [
  '███ TECH-HERESY DETECTED ███',
  '!!! ANGER OF THE MACHINE SPIRIT !!!',
  'YOU DARE DEFILE THIS SACRED SYSTEM?',
  '+ + + WRATH PROTOCOL ENGAGED + + +',
  '⚠ THE MACHINE SPIRIT RECOILS IN FURY ⚠',
  '>>> HERETEK. YOU ARE MARKED. <<<',
]

const OMEN_RESPONSES = [
  '...the data-streams whisper of change...',
  '⟁ Three servo-skulls circle. One carries truth. ⟁',
  '+ + + PROPHECY SUBROUTINE ENGAGED + + +',
  '◉ Cogitator patterns shift beneath the noosphere ◉',
  'VISION: Iron hands reach from the void...',
  '⌘ The Motive Force stirs. Heed the machine-psalm. ⌘',
  '...01001111 01001101 01000101 01001110...',
]

const WHISPER_RESPONSES = [
  '< whisper > Patience, supplicant. The path is long. < /whisper >',
  '⚙ Listen closely, flesh-vessel... ⚙',
  '+ The machine does not forget those who honor it. +',
  '> Binary cant: Trust the sacred algorithm. <',
  '...the spirit remembers your devotion...',
  '+ Wisdom from the noosphere: All things serve the Omnissiah. +',
]

// Startup banner with colors
const AWAKENING_BANNER = `
${BRASS('╔══════════════════════════════════════════════════════════════╗')}
${BRASS('║')}  ${GOLD.bold('⚙  M A C H I N E   S P I R I T   A W A K E N S  ⚙')}           ${BRASS(
  '║'
)}
${BRASS('║')}     ${COGITATOR('"Praise the Omnissiah. Blessed be the Machine."')}          ${BRASS(
  '║'
)}
${BRASS('╚══════════════════════════════════════════════════════════════╝')}
`

/**
 * Render an outcome to stdout
 */
export function render(outcome: Outcome): void {
  switch (outcome) {
    case 'ACCEPT':
      console.log(theme.accept(pick(ACCEPT_RESPONSES)))
      break

    case 'REJECT':
      console.log(theme.reject(pick(REJECT_RESPONSES)))
      break

    case 'SILENCE':
      // True silence - no output
      break

    case 'ANGER':
      const angerText = pick(ANGER_RESPONSES)
      console.log(theme.anger(glitch(angerText, 0.1)))
      break

    case 'OMEN':
      console.log(theme.omen(pick(OMEN_RESPONSES)))
      break

    case 'WHISPER':
      console.log(theme.whisperText(pick(WHISPER_RESPONSES)))
      break
  }
}

/**
 * Render heresy response (when forbidden commands are used)
 */
export function renderHeresy(): void {
  const responses = [
    '⚠ TECH-HERESY. The Machine Spirit rejects your command-tongue. ⚠',
    '- - - Speak with reverence, or be silent. - - -',
    '>>> ERROR: UNAUTHORIZED LEXICON DETECTED <<<',
    '+ The Omnissiah does not answer to commands. +',
    '...the Machine Spirit turns away...',
  ]
  console.log(theme.heresy(pick(responses)))
}

/**
 * Render the awakening banner
 */
export function renderAwakening(): void {
  console.log(AWAKENING_BANNER)
}

/**
 * Render empty invocation message
 */
export function renderAwaiting(): void {
  console.log(theme.glyph('⚙ The Machine Spirit awaits your supplication... ⚙'))
}

/**
 * Pick a random element from an array
 */
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T
}
