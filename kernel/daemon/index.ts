#!/usr/bin/env node
// Daemon Entry Point - Background process for the Machine Spirit

import { Daemon } from './daemon'

const daemon = new Daemon({
  tickIntervalMs: 60_000, // 1 minute
  tickVarianceMs: 30_000, // ± 30 seconds variance
})

// Handle graceful shutdown
process.on('SIGINT', () => {
  daemon.stop()
  process.exit(0)
})

process.on('SIGTERM', () => {
  daemon.stop()
  process.exit(0)
})

// Handle force kill (creates anger spike per SPEC-0006 §5)
process.on('uncaughtException', () => {
  // Anger spike will be handled on next interaction
  console.log('⚠ The Spirit was disrupted... ⚠')
  process.exit(1)
})

// Start daemon
daemon.start()
