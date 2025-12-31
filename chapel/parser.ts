// Chapel Parser - Parses ritual invocations from CLI arguments

export interface RitualInput {
  verb: string
  object?: string
  semantic: string[]
  isHeresy: boolean
  isMultiLine: boolean
  rawInput: string
}

const FORBIDDEN_VERBS = ['run', 'execute', 'do', 'help', 'config', 'explain', 'debug', 'why']
const FORBIDDEN_FLAGS = ['--help', '-h', '--version', '-v', '--config']

/**
 * Parse CLI arguments into structured ritual data
 */
export function parseArgs(args: string[]): RitualInput {
  // Filter out node and script path
  const cleanArgs = args.slice(2)

  if (cleanArgs.length === 0) {
    return {
      verb: '',
      semantic: [],
      isHeresy: true,
      isMultiLine: false,
      rawInput: '',
    }
  }

  const verb = cleanArgs[0]!.toLowerCase()
  const object = cleanArgs[1]
  const semantic = cleanArgs.slice(1)
  const rawInput = cleanArgs.join(' ')

  // Check for heresy
  const isHeresy =
    FORBIDDEN_VERBS.includes(verb) ||
    FORBIDDEN_FLAGS.some((flag) => cleanArgs.includes(flag)) ||
    verb.startsWith('-')

  return {
    verb,
    ...(object !== undefined && { object }),
    semantic,
    isHeresy,
    isMultiLine: false,
    rawInput,
  }
}

/**
 * Parse a single line of input for REPL
 */
export function parseLine(line: string): RitualInput {
  const tokens = line.trim().split(/\s+/).filter(Boolean)

  if (tokens.length === 0) {
    return {
      verb: '',
      semantic: [],
      isHeresy: false,
      isMultiLine: false,
      rawInput: '',
    }
  }

  const verb = tokens[0]!.toLowerCase()
  const semantic = tokens.slice(1)

  const isHeresy = FORBIDDEN_VERBS.includes(verb) || verb.startsWith('-')

  return {
    verb,
    semantic,
    isHeresy,
    isMultiLine: false,
    rawInput: line,
  }
}

/**
 * Read piped stdin content (if available)
 */
export async function readStdin(): Promise<string | null> {
  // Check if stdin is a TTY (interactive terminal)
  if (process.stdin.isTTY) {
    return null
  }

  return new Promise((resolve) => {
    let data = ''

    process.stdin.setEncoding('utf8')
    process.stdin.on('readable', () => {
      let chunk
      while ((chunk = process.stdin.read()) !== null) {
        data += chunk
      }
    })

    process.stdin.on('end', () => {
      resolve(data.trim() || null)
    })

    // Timeout after 100ms if no data
    setTimeout(() => {
      if (data === '') {
        resolve(null)
      }
    }, 100)
  })
}

/**
 * Tokenize text into semantic tokens
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((token) => token.length >= 3)
}
