import Database from 'better-sqlite3'
import * as fs from 'fs'
import { homedir } from 'os'
import * as path from 'path'
import type { ColdSnapshot, Scar } from '../types'

export class ColdMemory {
  private db: Database.Database
  private dbPath: string

  constructor(dbPath: string = path.join(homedir(), '.machine-spirit', 'soul.db')) {
    this.dbPath = dbPath
    this.ensureDirectory()
    this.db = new Database(this.dbPath)
    this.initSchema()
  }

  private ensureDirectory() {
    const dir = path.dirname(this.dbPath)
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
        user_id TEXT,
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

      CREATE TABLE IF NOT EXISTS cognitive_profile (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        xp INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS clusters (
        id TEXT PRIMARY KEY,
        verbs TEXT,
        bias REAL DEFAULT 0.0,
        volatility REAL DEFAULT 0.1
      );

      CREATE TABLE IF NOT EXISTS genotype (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        temperament TEXT NOT NULL,
        base_trust REAL NOT NULL,
        base_anger REAL NOT NULL,
        stubbornness REAL NOT NULL,
        ritual_affinity REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS maintenance (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        last_maintenance INTEGER NOT NULL,
        oil_level REAL NOT NULL,
        incense_deficit REAL NOT NULL,
        prayer_debt REAL NOT NULL
      );

      CREATE TABLE IF NOT EXISTS operator_bonds (
        user_id TEXT PRIMARY KEY,
        familiarity REAL NOT NULL,
        bond_trust REAL NOT NULL,
        last_seen INTEGER NOT NULL,
        positive_interactions INTEGER NOT NULL,
        negative_interactions INTEGER NOT NULL,
        shared_scars TEXT NOT NULL,
        title TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS narrative_events (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        category TEXT NOT NULL,
        summary TEXT NOT NULL,
        operator_id TEXT,
        emotional_impact TEXT NOT NULL,
        significance REAL NOT NULL,
        verb TEXT NOT NULL,
        recall_count INTEGER NOT NULL
      );
    `)

    // Migration: Ensure user_id column exists in interactions (SPEC-0008 upgrade)
    const tableInfo = this.db.pragma('table_info(interactions)') as any[]
    const hasUserId = tableInfo.some((col) => col.name === 'user_id')
    if (!hasUserId) {
      console.log('[COLD_MEMORY] Migration: Adding user_id column to interactions table...')
      this.db.exec('ALTER TABLE interactions ADD COLUMN user_id TEXT')
    }

    // Ensure singleton rows exist
    this.db.exec(`INSERT OR IGNORE INTO emotions (id) VALUES (1)`)
    this.db.exec(`INSERT OR IGNORE INTO learning_state (id) VALUES (1)`)
    this.db.exec(`INSERT OR IGNORE INTO cognitive_profile (id) VALUES (1)`)
  }

  saveInteraction(input: string, outcome: string, userId?: string) {
    const stmt = this.db.prepare(
      'INSERT INTO interactions (user_id, input, outcome, timestamp) VALUES (?, ?, ?, ?)'
    )
    stmt.run(userId || null, input, outcome, Date.now())

    // Auto-prune interactions to keep the DB lean (e.g., keep last 5000)
    this.pruneInteractions(5000)
  }

  private pruneInteractions(limit: number) {
    const countRow = this.db.prepare('SELECT COUNT(*) as count FROM interactions').get() as {
      count: number
    }
    if (countRow.count > limit) {
      const toDelete = countRow.count - limit
      this.db
        .prepare(
          'DELETE FROM interactions WHERE id IN (SELECT id FROM interactions ORDER BY id ASC LIMIT ?)'
        )
        .run(toDelete)
    }
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
    const xpCount = this.db.prepare('SELECT xp FROM cognitive_profile WHERE id = 1').get() as {
      xp: number
    }

    return {
      scars: scarCount.count,
      bonds: bondSum.total,
      xp: xpCount.xp,
      clusters: [], // Placeholder for cluster loading
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

  saveXP(xp: number): void {
    const stmt = this.db.prepare('UPDATE cognitive_profile SET xp = ? WHERE id = 1')
    stmt.run(xp)
  }

  saveClusters(clusters: import('../types').ConceptCluster[]): void {
    const stmt = this.db.prepare(
      'INSERT OR REPLACE INTO clusters (id, verbs, bias, volatility) VALUES (?, ?, ?, ?)'
    )
    for (const cluster of clusters) {
      stmt.run(cluster.id, JSON.stringify(cluster.verbs), cluster.bias, cluster.volatility)
    }
  }

  loadClusters(): import('../types').ConceptCluster[] {
    const rows = this.db.prepare('SELECT * FROM clusters').all() as any[]
    return rows.map((row) => ({
      id: row.id,
      verbs: JSON.parse(row.verbs),
      bias: row.bias,
      volatility: row.volatility,
    }))
  }

  saveGenotype(genotype: import('../types').SpiritGenotype): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO genotype (id, temperament, base_trust, base_anger, stubbornness, ritual_affinity)
      VALUES (1, ?, ?, ?, ?, ?)
    `)
    stmt.run(
      genotype.temperament,
      genotype.baseTrust,
      genotype.baseAnger,
      genotype.stubbornness,
      genotype.ritualAffinity
    )
  }

  loadGenotype(): import('../types').SpiritGenotype | null {
    const row = this.db.prepare('SELECT * FROM genotype WHERE id = 1').get() as
      | {
          temperament: string
          base_trust: number
          base_anger: number
          stubbornness: number
          ritual_affinity: number
        }
      | undefined

    if (!row) return null

    return {
      temperament: row.temperament as import('../types').Temperament,
      baseTrust: row.base_trust,
      baseAnger: row.base_anger,
      stubbornness: row.stubbornness,
      ritualAffinity: row.ritual_affinity,
    }
  }

  saveMaintenance(state: import('../types').MaintenanceState): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO maintenance (id, last_maintenance, oil_level, incense_deficit, prayer_debt)
      VALUES (1, ?, ?, ?, ?)
    `)
    stmt.run(state.lastMaintenance, state.oilLevel, state.incenseDeficit, state.prayerDebt)
  }

  loadMaintenance(): import('../types').MaintenanceState | null {
    const row = this.db.prepare('SELECT * FROM maintenance WHERE id = 1').get() as
      | {
          last_maintenance: number
          oil_level: number
          incense_deficit: number
          prayer_debt: number
        }
      | undefined

    if (!row) return null

    return {
      lastMaintenance: row.last_maintenance,
      oilLevel: row.oil_level,
      incenseDeficit: row.incense_deficit,
      prayerDebt: row.prayer_debt,
    }
  }

  saveBonds(bonds: import('../types').Bond[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO operator_bonds
      (user_id, familiarity, bond_trust, last_seen, positive_interactions, negative_interactions, shared_scars, title)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const bond of bonds) {
      stmt.run(
        bond.userId,
        bond.familiarity,
        bond.bondTrust,
        bond.lastSeen,
        bond.positiveInteractions,
        bond.negativeInteractions,
        JSON.stringify(bond.sharedScars),
        bond.title
      )
    }
  }

  loadBonds(): import('../types').Bond[] {
    const rows = this.db.prepare('SELECT * FROM operator_bonds').all() as Array<{
      user_id: string
      familiarity: number
      bond_trust: number
      last_seen: number
      positive_interactions: number
      negative_interactions: number
      shared_scars: string
      title: string
    }>

    return rows.map((row) => ({
      userId: row.user_id,
      familiarity: row.familiarity,
      bondTrust: row.bond_trust,
      lastSeen: row.last_seen,
      positiveInteractions: row.positive_interactions,
      negativeInteractions: row.negative_interactions,
      sharedScars: JSON.parse(row.shared_scars),
      title: row.title as import('../types').OperatorTitle,
    }))
  }

  saveNarrativeEvents(events: import('../types').NarrativeEvent[]): void {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO narrative_events
      (id, timestamp, category, summary, operator_id, emotional_impact, significance, verb, recall_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    for (const event of events) {
      stmt.run(
        event.id,
        event.timestamp,
        event.category,
        event.summary,
        event.operatorId ?? null,
        JSON.stringify(event.emotionalImpact),
        event.significance,
        event.verb,
        event.recallCount
      )
    }
  }

  loadNarrativeEvents(): import('../types').NarrativeEvent[] {
    const rows = this.db.prepare('SELECT * FROM narrative_events').all() as Array<{
      id: string
      timestamp: number
      category: string
      summary: string
      operator_id: string | null
      emotional_impact: string
      significance: number
      verb: string
      recall_count: number
    }>

    return rows.map((row) => ({
      id: row.id,
      timestamp: row.timestamp,
      category: row.category as import('../types').EventCategory,
      summary: row.summary,
      ...(row.operator_id !== null && { operatorId: row.operator_id }),
      emotionalImpact: JSON.parse(row.emotional_impact),
      significance: row.significance,
      verb: row.verb,
      recallCount: row.recall_count,
    }))
  }

  close() {
    this.db.close()
  }
}
