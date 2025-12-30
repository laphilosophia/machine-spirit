import Database from 'better-sqlite3'
import * as fs from 'fs'
import { homedir } from 'os'
import * as path from 'path'
import type { ColdSnapshot, Scar } from '../types'

export class ColdMemory {
  private db: Database.Database
  private readonly DB_PATH = path.join(homedir(), '.machine-spirit', 'soul.db')

  constructor() {
    this.ensureDirectory()
    this.db = new Database(this.DB_PATH)
    this.initSchema()
  }

  private ensureDirectory() {
    const dir = path.dirname(this.DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  private initSchema() {
    // Enable WAL mode for better concurrency/safety
    this.db.pragma('journal_mode = WAL')

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS interactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        input TEXT,
        outcome TEXT,
        timestamp INTEGER
      );

      CREATE TABLE IF NOT EXISTS scars (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verb TEXT,
        time_hour INTEGER,
        pattern TEXT,
        severity REAL,
        timestamp INTEGER
      );

      CREATE TABLE IF NOT EXISTS vocabulary (
        word TEXT PRIMARY KEY,
        frequency INTEGER,
        positive_count INTEGER,
        adopted INTEGER
      );

      CREATE TABLE IF NOT EXISTS bonds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT UNIQUE,
        score REAL DEFAULT 0.0
      );

      CREATE TABLE IF NOT EXISTS taboo (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern TEXT UNIQUE
      );

      CREATE TABLE IF NOT EXISTS emotions (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        anger REAL DEFAULT 0.1,
        trust REAL DEFAULT 0.5,
        ennui REAL DEFAULT 0.1,
        curiosity REAL DEFAULT 0.5,
        fear REAL DEFAULT 0.0
      );

      CREATE TABLE IF NOT EXISTS learning_state (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        data TEXT DEFAULT '{}'
      );
    `)

    // Ensure singleton rows exist
    this.db.exec(`INSERT OR IGNORE INTO emotions (id) VALUES (1)`)
    this.db.exec(`INSERT OR IGNORE INTO learning_state (id) VALUES (1)`)
  }

  saveInteraction(input: string, outcome: string) {
    const stmt = this.db.prepare(
      'INSERT INTO interactions (input, outcome, timestamp) VALUES (?, ?, ?)'
    )
    stmt.run(input, outcome, Date.now())
  }

  saveScar(scar: Scar) {
    const stmt = this.db.prepare(`
      INSERT INTO scars (verb, time_hour, pattern, severity, timestamp)
      VALUES (?, ?, ?, ?, ?)
    `)
    stmt.run(
      scar.context.verb,
      scar.context.time,
      scar.context.pattern,
      scar.severity,
      scar.timestamp
    )
  }

  getRecentScars(limit = 10): Scar[] {
    const stmt = this.db.prepare('SELECT * FROM scars ORDER BY timestamp DESC LIMIT ?')
    const rows = stmt.all(limit) as any[]

    return rows.map((row) => ({
      context: {
        verb: row.verb,
        time: row.time_hour,
        pattern: row.pattern,
      },
      severity: row.severity,
      timestamp: row.timestamp,
    }))
  }

  getSnapshot(): ColdSnapshot {
    const scarCount = this.db.prepare('SELECT COUNT(*) as count FROM scars').get() as {
      count: number
    }
    const bondSum = this.db.prepare('SELECT COALESCE(SUM(score), 0) as total FROM bonds').get() as {
      total: number
    }

    return {
      scars: scarCount.count,
      bonds: bondSum.total,
    }
  }

  saveEmotions(emotions: {
    anger: number
    trust: number
    ennui: number
    curiosity: number
    fear: number
  }): void {
    const stmt = this.db.prepare(`
      UPDATE emotions SET anger = ?, trust = ?, ennui = ?, curiosity = ?, fear = ?
      WHERE id = 1
    `)
    stmt.run(emotions.anger, emotions.trust, emotions.ennui, emotions.curiosity, emotions.fear)
  }

  loadEmotions(): {
    anger: number
    trust: number
    ennui: number
    curiosity: number
    fear: number
  } | null {
    const row = this.db
      .prepare('SELECT anger, trust, ennui, curiosity, fear FROM emotions WHERE id = 1')
      .get() as
      | {
          anger: number
          trust: number
          ennui: number
          curiosity: number
          fear: number
        }
      | undefined

    return row ?? null
  }

  saveLearningState(data: string): void {
    const stmt = this.db.prepare('UPDATE learning_state SET data = ? WHERE id = 1')
    stmt.run(data)
  }

  loadLearningState(): string | null {
    const row = this.db.prepare('SELECT data FROM learning_state WHERE id = 1').get() as
      | { data: string }
      | undefined

    return row?.data ?? null
  }

  close() {
    this.db.close()
  }
}
