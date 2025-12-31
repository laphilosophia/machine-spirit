import Database from 'better-sqlite3'
import { homedir } from 'os'
import * as path from 'path'

const dbPath = path.join(homedir(), '.machine-spirit', 'soul.db')

try {
  const db = new Database(dbPath)

  db.exec(`
    UPDATE emotions
    SET anger = 0.1, trust = 0.5, ennui = 0.1, curiosity = 0.5, fear = 0.0
    WHERE id = 1;
  `)

  console.log('+++ RITE OF PURIFICATION COMPLETE +++')
  console.log('Emotional state has been reset to sacred baseline.')
  console.log('Path: ' + dbPath)

  db.close()
} catch (err) {
  console.error('FAILED TO PURIFY:', (err as Error).message)
}
