#!/usr/bin/env node
// Chapel - The CLI gateway to the Machine-Spirit
// "Praise the Omnissiah. Blessed be the Machine."

import { Spirit } from '../forge'
import { parseArgs, readStdin, tokenize } from './parser'
import { calculatePurity } from './purity'
import { render, renderAwaiting, renderAwakening, renderHeresy } from './renderer'

async function main(): Promise<void> {
  // 1. Parse CLI arguments
  const ritual = parseArgs(process.argv)

  // 2. Check for heresy first
  if (ritual.isHeresy) {
    renderHeresy()
    process.exit(0)
  }

  // 3. Check for empty invocation
  if (!ritual.verb) {
    renderAwaiting()
    process.exit(0)
  }

  // 4. Read stdin if piped
  const stdinContent = await readStdin()
  if (stdinContent) {
    ritual.isMultiLine = true
    ritual.semantic = [...ritual.semantic, ...tokenize(stdinContent)]
  }

  // 5. Calculate purity
  const { score: purity } = calculatePurity(ritual, stdinContent)

  // 6. Awaken the Spirit
  renderAwakening()

  // 7. Create Spirit and invoke
  const spirit = new Spirit()
  const outcome = spirit.interact(ritual.verb, purity, ritual.semantic)

  // 8. Render the response
  render(outcome)
}

// Run
main().catch(() => {
  // Spirit does not show errors
  process.exit(1)
})
