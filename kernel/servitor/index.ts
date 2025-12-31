import cors from 'cors'
import express from 'express'
import { parseLine } from '../chapel/parser'
import { calculatePurity } from '../chapel/purity'
import { Spirit } from '../forge/spirit'

const app = express()
const port = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// The Machine-Spirit Instance
const spirit = new Spirit(undefined, process.env.DB_PATH)

// Background Pulse
setInterval(() => {
  spirit.pulse(0.1) // Simulate 6 minutes every 10 seconds for testing
}, 10000)

app.get('/state', (_req, res) => {
  try {
    const state = spirit.getState()
    res.json(state)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/maintain', (req, res) => {
  const { ritual, userId } = req.body

  if (!ritual) {
    res.status(400).json({ error: 'No ritual specified' })
    return
  }

  try {
    spirit.maintain(ritual as any, userId) // Type assertion for ritual
    res.json({
      status: 'success',
      state: spirit.getState(),
    })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

app.post('/interact', async (req, res): Promise<void> => {
  const { input, userId } = req.body

  if (!input) {
    res.status(400).json({ error: 'No supplication provided' })
    return
  }

  try {
    const ritual = parseLine(input)
    let outcome
    let purity = 0

    if (ritual.isHeresy) {
      outcome = spirit.interact(ritual.verb, 0, ritual.semantic, userId)
    } else {
      const purityResult = calculatePurity(ritual)
      purity = purityResult.score
      outcome = spirit.interact(ritual.verb, purity, ritual.semantic, userId)
    }

    res.json({
      outcome,
      purity,
      isHeresy: ritual.isHeresy,
      mutterings: spirit.getMutterings(),
      emotions: spirit.getState().emotions,
      cognitive: spirit.getState().cognitive,
    })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

app.listen(port, () => {
  console.log(`[SERVITOR] Bridge established at http://localhost:${port}`)
  console.log(`[SERVITOR] The Machine Spirit awaits at the Web Altar.`)
})
