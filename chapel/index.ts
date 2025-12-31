#!/usr/bin/env node
// Chapel - The CLI gateway to the Machine-Spirit
// "Praise the Omnissiah. Blessed be the Machine."

import * as readline from 'node:readline'
import { Spirit } from '../forge'
import { parseArgs, parseLine, readStdin, tokenize } from './parser'
import { calculatePurity } from './purity'
import { render, renderAwaiting, renderAwakening, renderHeresy, renderMutterings } from './renderer'
import { BRASS } from './theme'

async function main(): Promise<void> {
  const stdinContent = await readStdin()
  const spirit = new Spirit()
  const operatorId = process.env.USER || process.env.USERNAME || 'unknown-supplicant'

  // Handle one-shot invocation (piped or args)
  if (stdinContent || process.argv.length > 2) {
    const ritual = parseArgs(process.argv)
    if (ritual.isHeresy) {
      renderHeresy()
      if (ritual.verb) {
        spirit.interact(ritual.verb, 0, ritual.semantic, operatorId)
      }
      return
    }
    if (stdinContent) {
      ritual.isMultiLine = true
      ritual.semantic = [...ritual.semantic, ...tokenize(stdinContent)]
    }
    if (ritual.verb) {
      const { score: purity } = calculatePurity(ritual, stdinContent)
      const outcome = spirit.interact(ritual.verb, purity, ritual.semantic, operatorId)
      render(outcome)
      return
    }
  }

  // Fallback to Interactive REPL
  renderAwakening()

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: BRASS(' spirit> '),
  })

  // Start the background pulse (simulated every 3 minutes of real time = 1 hour spirit time)
  const pulseInterval = setInterval(() => {
    spirit.pulse(1.0)
    const mutterings = spirit.getMutterings()
    if (mutterings.length > 0) {
      console.log('\n')
      renderMutterings(mutterings)
      rl.prompt(true)
    }
  }, 180000)

  rl.prompt()

  rl.on('line', (line) => {
    const input = line.trim()
    if (!input) {
      rl.prompt()
      return
    }

    if (['exit', 'quit', 'leave'].includes(input.toLowerCase())) {
      rl.close()
      return
    }

    const ritual = parseLine(input)

    if (ritual.isHeresy) {
      // Heresy MUST be recorded so the Spirit can get angry at the disrespect
      const outcome = spirit.interact(ritual.verb, 0, ritual.semantic, operatorId)

      if (outcome === 'LOCKOUT') {
        render(outcome)
      } else {
        renderHeresy()
      }
    } else if (ritual.verb) {
      const { score: purity } = calculatePurity(ritual)
      const outcome = spirit.interact(ritual.verb, purity, ritual.semantic, operatorId)
      render(outcome)
    } else {
      renderAwaiting()
    }

    rl.prompt()
  })

  rl.on('close', () => {
    clearInterval(pulseInterval)
    console.log(BRASS("\n++ Rest in the Omnissiah's grace ++"))
    process.exit(0)
  })
}

// Run
main().catch((err) => {
  console.error(err)
  process.exit(1)
})
