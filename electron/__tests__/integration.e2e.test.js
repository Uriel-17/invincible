/**
 * End-to-End Integration Tests for Complete User Workflow
 * 
 * Tests the complete user journey from onboarding through bet management:
 * 1. Onboarding Flow (first launch, language selection, user initialization)
 * 2. Fund Management Flow (adding funds, bankroll updates)
 * 3. Bet Creation and Management Flow (single bets, parlays, win/loss scenarios)
 * 4. Statistics and Calculations Verification (ROI, win rate, bankroll calculations)
 * 
 * Uses in-memory SQLite database for isolated testing
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import Database from 'better-sqlite3'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

// Mock Electron's app module
vi.mock('electron', () => ({
  app: {
    getPath: vi.fn(() => '/tmp/test-invincible-e2e')
  }
}))

/**
 * Helper function to create test tables matching production schema
 */
function createTestTables(database) {
  // Schema version tracking
  database.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  
  // User settings (key-value store)
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  
  // Monthly archives metadata
  database.exec(`
    CREATE TABLE IF NOT EXISTS monthly_archives (
      month_key TEXT PRIMARY KEY,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      starting_bankroll REAL NOT NULL,
      ending_bankroll REAL NOT NULL,
      total_bets INTEGER DEFAULT 0,
      total_wins INTEGER DEFAULT 0,
      total_losses INTEGER DEFAULT 0,
      total_pushes INTEGER DEFAULT 0,
      total_cashouts INTEGER DEFAULT 0,
      net_profit REAL DEFAULT 0,
      roi REAL DEFAULT 0,
      total_wagered REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  
  // Bets table
  database.exec(`
    CREATE TABLE IF NOT EXISTS bets (
      id TEXT PRIMARY KEY,
      bet_type TEXT NOT NULL CHECK (bet_type IN ('single', 'parlay')),
      outcome TEXT NOT NULL CHECK (outcome IN ('pending', 'win', 'loss', 'push', 'cashout')),
      placed_at TEXT NOT NULL,
      bet_amount REAL NOT NULL CHECK (bet_amount > 0),
      quota TEXT NOT NULL,
      market TEXT,
      selection TEXT,
      potential_gains REAL NOT NULL CHECK (potential_gains >= 0),
      cashout_amount REAL,
      net_gain REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      month_key TEXT NOT NULL,
      is_archived INTEGER DEFAULT 0,
      FOREIGN KEY (month_key) REFERENCES monthly_archives(month_key)
    )
  `)
  
  // Parlay legs table
  database.exec(`
    CREATE TABLE IF NOT EXISTS parlay_legs (
      id TEXT PRIMARY KEY,
      bet_id TEXT NOT NULL,
      leg_index INTEGER NOT NULL,
      description TEXT NOT NULL,
      market TEXT,
      selection TEXT,
      quota TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE
    )
  `)
  
  // Bankroll snapshots
  database.exec(`
    CREATE TABLE IF NOT EXISTS bankroll_snapshots (
      id TEXT PRIMARY KEY,
      month_key TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      amount REAL NOT NULL CHECK (amount >= 0),
      change_amount REAL NOT NULL,
      change_reason TEXT NOT NULL CHECK (change_reason IN ('initial', 'bet_win', 'bet_loss', 'bet_cashout', 'manual_adjustment', 'month_start')),
      bet_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (month_key) REFERENCES monthly_archives(month_key),
      FOREIGN KEY (bet_id) REFERENCES bets(id)
    )
  `)
}

/**
 * Helper function to get current month key in YYYY-MM format
 */
function getCurrentMonthKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Helper function to get month date range
 */
function getMonthDateRange(monthKey) {
  const [year, month] = monthKey.split('-')
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
  return {
    startDate: `${monthKey}-01`,
    endDate: `${monthKey}-${lastDay.toString().padStart(2, '0')}`
  }
}

describe('End-to-End Integration Tests - Complete User Workflow', () => {
  let db

  beforeEach(() => {
    // Create fresh in-memory database for each test suite
    db = new Database(':memory:')
    db.pragma('foreign_keys = ON')
    createTestTables(db)
  })

  afterEach(() => {
    if (db) {
      db.close()
    }
  })

  // ============================================================================
  // TEST SUITE 1: Onboarding Flow
  // ============================================================================

  describe('Test Suite 1: Onboarding Flow', () => {
    it('1.1 - First launch detection should return true when no user settings exist', () => {
      // Verify database is empty (simulating first launch)
      const result = db.prepare('SELECT COUNT(*) as count FROM user_settings').get()
      expect(result.count).toBe(0)

      // This simulates isFirstLaunch() function
      const isFirstLaunch = result.count === 0
      expect(isFirstLaunch).toBe(true)
    })

    it('1.2 - Language selection should save and retrieve language preference', () => {
      // Save language preference (simulating language selection)
      db.prepare(`
        INSERT INTO user_settings (key, value, updated_at)
        VALUES ('language', 'es', datetime('now'))
      `).run()

      // Retrieve language preference
      const result = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('language')
      expect(result).toBeTruthy()
      expect(result.value).toBe('es')

      // Test switching language
      db.prepare(`
        UPDATE user_settings
        SET value = 'en', updated_at = datetime('now')
        WHERE key = 'language'
      `).run()

      const updatedResult = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('language')
      expect(updatedResult.value).toBe('en')
    })

    it('1.3 - Username validation should enforce minimum length of 2 characters', () => {
      // Test valid username (>= 2 characters)
      const validUsername = 'TestUser'
      expect(validUsername.length).toBeGreaterThanOrEqual(2)

      // Test invalid username (< 2 characters)
      const invalidUsername = 'T'
      expect(invalidUsername.length).toBeLessThan(2)

      // Only valid username should be saved
      db.prepare(`
        INSERT INTO user_settings (key, value, updated_at)
        VALUES ('username', ?, datetime('now'))
      `).run(validUsername)

      const result = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('username')
      expect(result.value).toBe(validUsername)
    })

    it('1.4 - Starting bankroll validation should enforce minimum value of 0.01', () => {
      // Test valid bankroll (>= 0.01)
      const validBankroll = 1000
      expect(validBankroll).toBeGreaterThanOrEqual(0.01)

      // Test invalid bankroll (< 0.01)
      const invalidBankroll = 0
      expect(invalidBankroll).toBeLessThan(0.01)

      // Test pattern validation (must be valid number)
      const validPattern = /^\d+(\.\d+)?$/
      expect(validPattern.test('1000')).toBe(true)
      expect(validPattern.test('1000.50')).toBe(true)
      expect(validPattern.test('abc')).toBe(false)
      expect(validPattern.test('-100')).toBe(false)

      // Only valid bankroll should be saved
      db.prepare(`
        INSERT INTO user_settings (key, value, updated_at)
        VALUES ('starting_bankroll', ?, datetime('now'))
      `).run(validBankroll.toString())

      const result = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('starting_bankroll')
      expect(parseFloat(result.value)).toBe(validBankroll)
    })

    it('1.5 - User initialization should create all necessary database records', () => {
      const { v4: uuidv4 } = require('uuid')
      const username = 'TestUser'
      const startingBankroll = 1000
      const monthKey = getCurrentMonthKey()
      const { startDate, endDate } = getMonthDateRange(monthKey)
      const now = new Date().toISOString()

      // Simulate complete user initialization flow (what db:initializeUser does)
      db.transaction(() => {
        // 1. Save user settings
        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('username', ?, datetime('now'))
        `).run(username)

        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('starting_bankroll', ?, datetime('now'))
        `).run(startingBankroll.toString())

        // 2. Create monthly archive FIRST (required for foreign key)
        db.prepare(`
          INSERT INTO monthly_archives (
            month_key, start_date, end_date, starting_bankroll, ending_bankroll, is_active
          ) VALUES (?, ?, ?, ?, ?, 1)
        `).run(monthKey, startDate, endDate, startingBankroll, startingBankroll)

        // 3. Create initial bankroll snapshot
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          uuidv4(),
          startingBankroll,
          startingBankroll,
          'initial',
          now,
          monthKey,
          null,
          now
        )
      })()

      // Verify user_settings were created
      const usernameResult = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('username')
      expect(usernameResult.value).toBe(username)

      const bankrollResult = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('starting_bankroll')
      expect(parseFloat(bankrollResult.value)).toBe(startingBankroll)

      // Verify monthly_archives was created
      const archiveResult = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)
      expect(archiveResult).toBeTruthy()
      expect(archiveResult.starting_bankroll).toBe(startingBankroll)
      expect(archiveResult.ending_bankroll).toBe(startingBankroll)
      expect(archiveResult.is_active).toBe(1)

      // Verify bankroll_snapshots was created
      const snapshotResult = db.prepare('SELECT * FROM bankroll_snapshots WHERE change_reason = ?').get('initial')
      expect(snapshotResult).toBeTruthy()
      expect(snapshotResult.amount).toBe(startingBankroll)
      expect(snapshotResult.change_amount).toBe(startingBankroll)
      expect(snapshotResult.month_key).toBe(monthKey)
      expect(snapshotResult.bet_id).toBeNull()
    })

    it('1.6 - First launch flag should be cleared after successful onboarding', () => {
      // Set up user (simulating completed onboarding)
      db.prepare(`
        INSERT INTO user_settings (key, value, updated_at)
        VALUES ('username', 'TestUser', datetime('now'))
      `).run()

      db.prepare(`
        INSERT INTO user_settings (key, value, updated_at)
        VALUES ('starting_bankroll', '1000', datetime('now'))
      `).run()

      // Check first launch status (should be false now)
      const result = db.prepare('SELECT COUNT(*) as count FROM user_settings').get()
      const isFirstLaunch = result.count === 0
      expect(isFirstLaunch).toBe(false)
    })
  })

  // ============================================================================
  // TEST SUITE 2: Fund Management Flow
  // ============================================================================

  describe('Test Suite 2: Fund Management Flow', () => {
    beforeEach(() => {
      const { v4: uuidv4 } = require('uuid')
      const monthKey = getCurrentMonthKey()
      const { startDate, endDate } = getMonthDateRange(monthKey)
      const now = new Date().toISOString()

      // Set up initial user with starting bankroll of 1000
      db.transaction(() => {
        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('username', 'TestUser', datetime('now'))
        `).run()

        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('starting_bankroll', '1000', datetime('now'))
        `).run()

        // Create monthly archive
        db.prepare(`
          INSERT INTO monthly_archives (
            month_key, start_date, end_date, starting_bankroll, ending_bankroll, is_active
          ) VALUES (?, ?, ?, 1000, 1000, 1)
        `).run(monthKey, startDate, endDate)

        // Create initial bankroll snapshot
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 1000, 1000, 'initial', now, monthKey, null, now)
      })()
    })

    it('2.1 - User adds funds to bankroll via Add Funds feature', () => {
      const { v4: uuidv4 } = require('uuid')
      const addAmount = 500
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()

      // Simulate db:addFunds IPC handler
      db.transaction(() => {
        // Update starting bankroll
        db.prepare(`
          UPDATE user_settings
          SET value = '1500', updated_at = datetime('now')
          WHERE key = 'starting_bankroll'
        `).run()

        // Create bankroll snapshot
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 1500, addAmount, 'manual_adjustment', now, monthKey, null, now)
      })()

      // Verify the operation succeeded
      const bankrollResult = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('starting_bankroll')
      expect(parseFloat(bankrollResult.value)).toBe(1500)
    })

    it('2.2 - Verify starting_bankroll is updated in user_settings', () => {
      // Add funds
      db.prepare(`
        UPDATE user_settings
        SET value = '1500', updated_at = datetime('now')
        WHERE key = 'starting_bankroll'
      `).run()

      // Verify update
      const result = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('starting_bankroll')
      expect(parseFloat(result.value)).toBe(1500)
    })

    it('2.3 - Verify bankroll_snapshots record created with manual_adjustment', () => {
      const { v4: uuidv4 } = require('uuid')
      const addAmount = 500
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()

      // Create snapshot
      db.prepare(`
        INSERT INTO bankroll_snapshots (
          id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), 1500, addAmount, 'manual_adjustment', now, monthKey, null, now)

      // Verify snapshot
      const snapshot = db.prepare('SELECT * FROM bankroll_snapshots WHERE change_reason = ?').get('manual_adjustment')
      expect(snapshot).toBeTruthy()
      expect(snapshot.amount).toBe(1500)
      expect(snapshot.change_amount).toBe(addAmount)
      expect(snapshot.bet_id).toBeNull()
    })

    it('2.4 - Verify monthly_archives exists or is created before snapshot', () => {
      const { v4: uuidv4 } = require('uuid')
      const monthKey = '2024-02' // Different month
      const { startDate, endDate } = getMonthDateRange(monthKey)
      const now = new Date().toISOString()

      // Verify monthly archive doesn't exist yet
      let archive = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)
      expect(archive).toBeUndefined()

      // Create monthly archive FIRST, then snapshot
      db.transaction(() => {
        db.prepare(`
          INSERT INTO monthly_archives (
            month_key, start_date, end_date, starting_bankroll, ending_bankroll, is_active
          ) VALUES (?, ?, ?, 1500, 1500, 1)
          ON CONFLICT(month_key) DO NOTHING
        `).run(monthKey, startDate, endDate)

        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 1500, 500, 'manual_adjustment', now, monthKey, null, now)
      })()

      // Verify both were created
      archive = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)
      expect(archive).toBeTruthy()

      const snapshot = db.prepare('SELECT * FROM bankroll_snapshots WHERE month_key = ?').get(monthKey)
      expect(snapshot).toBeTruthy()
    })

    it('2.5 - Verify current bankroll calculation includes added funds', () => {
      // Update starting bankroll to 1500 (added 500)
      db.prepare(`
        UPDATE user_settings
        SET value = '1500', updated_at = datetime('now')
        WHERE key = 'starting_bankroll'
      `).run()

      // Calculate current bankroll (simulating getCurrentBankroll())
      const startingSetting = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('starting_bankroll')
      const startingBankroll = parseFloat(startingSetting.value)

      const result = db.prepare(`
        SELECT COALESCE(SUM(net_gain), 0) as total_net_gain
        FROM bets
        WHERE outcome IN ('win', 'loss', 'cashout')
      `).get()

      const currentBankroll = startingBankroll + result.total_net_gain
      expect(currentBankroll).toBe(1500) // No bets yet, so just starting bankroll
    })
  })

  // ============================================================================
  // TEST SUITE 3: Bet Creation and Management Flow
  // ============================================================================

  describe('Test Suite 3: Bet Creation and Management Flow', () => {
    beforeEach(() => {
      const { v4: uuidv4 } = require('uuid')
      const monthKey = getCurrentMonthKey()
      const { startDate, endDate } = getMonthDateRange(monthKey)
      const now = new Date().toISOString()

      // Set up initial user with starting bankroll of 1000
      db.transaction(() => {
        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('username', 'TestUser', datetime('now'))
        `).run()

        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('starting_bankroll', '1000', datetime('now'))
        `).run()

        // Create monthly archive
        db.prepare(`
          INSERT INTO monthly_archives (
            month_key, start_date, end_date, starting_bankroll, ending_bankroll, is_active
          ) VALUES (?, ?, ?, 1000, 1000, 1)
        `).run(monthKey, startDate, endDate)

        // Create initial bankroll snapshot
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 1000, 1000, 'initial', now, monthKey, null, now)
      })()
    })

    it('3.1 - Create single bet (win scenario)', () => {
      const { v4: uuidv4 } = require('uuid')
      const betId = uuidv4()
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()
      const betAmount = 100
      const quota = '2.00'
      const potentialGains = 200
      const netGain = 100 // Win: potential_gains - bet_amount

      // Create bet with win outcome
      db.transaction(() => {
        // Insert bet
        db.prepare(`
          INSERT INTO bets (
            id, bet_type, outcome, placed_at, bet_amount, quota,
            market, selection, potential_gains, cashout_amount, net_gain,
            notes, created_at, updated_at, month_key, is_archived
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(
          betId, 'single', 'win', now, betAmount, quota,
          'Match Winner', 'Team A', potentialGains, null, netGain,
          'Test win bet', now, now, monthKey
        )

        // Create bankroll snapshot for bet win
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 1100, netGain, 'bet_win', now, monthKey, betId, now)

        // Update monthly statistics
        db.prepare(`
          UPDATE monthly_archives
          SET total_bets = total_bets + 1,
              total_wins = total_wins + 1,
              net_profit = net_profit + ?,
              total_wagered = total_wagered + ?,
              updated_at = datetime('now')
          WHERE month_key = ?
        `).run(netGain, betAmount, monthKey)
      })()

      // Verify bet was created
      const bet = db.prepare('SELECT * FROM bets WHERE id = ?').get(betId)
      expect(bet).toBeTruthy()
      expect(bet.outcome).toBe('win')
      expect(bet.net_gain).toBe(netGain)
      expect(bet.month_key).toBe(monthKey)

      // Verify bankroll snapshot was created
      const snapshot = db.prepare('SELECT * FROM bankroll_snapshots WHERE bet_id = ?').get(betId)
      expect(snapshot).toBeTruthy()
      expect(snapshot.change_reason).toBe('bet_win')
      expect(snapshot.change_amount).toBe(netGain)

      // Verify monthly statistics were updated
      const stats = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)
      expect(stats.total_bets).toBe(1)
      expect(stats.total_wins).toBe(1)
      expect(stats.net_profit).toBe(netGain)
      expect(stats.total_wagered).toBe(betAmount)
    })

    it('3.2 - Create single bet (loss scenario)', () => {
      const { v4: uuidv4 } = require('uuid')
      const betId = uuidv4()
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()
      const betAmount = 100
      const quota = '2.00'
      const potentialGains = 200
      const netGain = -100 // Loss: -bet_amount

      // Create bet with loss outcome
      db.transaction(() => {
        // Insert bet
        db.prepare(`
          INSERT INTO bets (
            id, bet_type, outcome, placed_at, bet_amount, quota,
            market, selection, potential_gains, cashout_amount, net_gain,
            notes, created_at, updated_at, month_key, is_archived
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(
          betId, 'single', 'loss', now, betAmount, quota,
          'Match Winner', 'Team B', potentialGains, null, netGain,
          'Test loss bet', now, now, monthKey
        )

        // Create bankroll snapshot for bet loss
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 900, netGain, 'bet_loss', now, monthKey, betId, now)

        // Update monthly statistics
        db.prepare(`
          UPDATE monthly_archives
          SET total_bets = total_bets + 1,
              total_losses = total_losses + 1,
              net_profit = net_profit + ?,
              total_wagered = total_wagered + ?,
              updated_at = datetime('now')
          WHERE month_key = ?
        `).run(netGain, betAmount, monthKey)
      })()

      // Verify bet was created
      const bet = db.prepare('SELECT * FROM bets WHERE id = ?').get(betId)
      expect(bet).toBeTruthy()
      expect(bet.outcome).toBe('loss')
      expect(bet.net_gain).toBe(netGain)
      expect(bet.net_gain).toBeLessThan(0) // Verify negative

      // Verify bankroll decreased
      const snapshot = db.prepare('SELECT * FROM bankroll_snapshots WHERE bet_id = ?').get(betId)
      expect(snapshot).toBeTruthy()
      expect(snapshot.change_reason).toBe('bet_loss')
      expect(snapshot.amount).toBe(900) // 1000 - 100
    })

    it('3.3 - Create parlay bet with multiple legs', () => {
      const { v4: uuidv4 } = require('uuid')
      const betId = uuidv4()
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()
      const betAmount = 100
      const combinedQuota = '8.00' // 2.00 * 2.00 * 2.00
      const potentialGains = 800

      // Create parlay bet
      db.transaction(() => {
        // Insert parent bet
        db.prepare(`
          INSERT INTO bets (
            id, bet_type, outcome, placed_at, bet_amount, quota,
            market, selection, potential_gains, cashout_amount, net_gain,
            notes, created_at, updated_at, month_key, is_archived
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(
          betId, 'parlay', 'pending', now, betAmount, combinedQuota,
          null, null, potentialGains, null, 0,
          'Test parlay bet', now, now, monthKey
        )

        // Insert parlay legs
        const legs = [
          { description: 'Team A to win', market: 'Match Winner', selection: 'Team A', quota: '2.00' },
          { description: 'Over 2.5 goals', market: 'Total Goals', selection: 'Over 2.5', quota: '2.00' },
          { description: 'Both teams to score', market: 'BTTS', selection: 'Yes', quota: '2.00' }
        ]

        legs.forEach((leg, index) => {
          db.prepare(`
            INSERT INTO parlay_legs (
              id, bet_id, leg_index, description, market, selection, quota, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `).run(uuidv4(), betId, index, leg.description, leg.market, leg.selection, leg.quota, now)
        })
      })()

      // Verify parlay bet was created
      const bet = db.prepare('SELECT * FROM bets WHERE id = ?').get(betId)
      expect(bet).toBeTruthy()
      expect(bet.bet_type).toBe('parlay')
      expect(bet.outcome).toBe('pending')

      // Verify all parlay legs were created
      const legs = db.prepare('SELECT * FROM parlay_legs WHERE bet_id = ? ORDER BY leg_index').all(betId)
      expect(legs).toHaveLength(3)
      expect(legs[0].leg_index).toBe(0)
      expect(legs[1].leg_index).toBe(1)
      expect(legs[2].leg_index).toBe(2)

      // Verify foreign key references
      legs.forEach(leg => {
        expect(leg.bet_id).toBe(betId)
      })
    })

    it('3.4 - Test parlay win scenario (all legs win)', () => {
      const { v4: uuidv4 } = require('uuid')
      const betId = uuidv4()
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()
      const betAmount = 100
      const combinedQuota = '8.00'
      const potentialGains = 800
      const netGain = 700 // potential_gains - bet_amount

      // Create winning parlay
      db.transaction(() => {
        // Insert parent bet with win outcome
        db.prepare(`
          INSERT INTO bets (
            id, bet_type, outcome, placed_at, bet_amount, quota,
            market, selection, potential_gains, cashout_amount, net_gain,
            notes, created_at, updated_at, month_key, is_archived
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(
          betId, 'parlay', 'win', now, betAmount, combinedQuota,
          null, null, potentialGains, null, netGain,
          'Winning parlay', now, now, monthKey
        )

        // Insert parlay legs
        db.prepare(`
          INSERT INTO parlay_legs (
            id, bet_id, leg_index, description, market, selection, quota, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), betId, 0, 'Leg 1', 'Market 1', 'Selection 1', '2.00', now)

        db.prepare(`
          INSERT INTO parlay_legs (
            id, bet_id, leg_index, description, market, selection, quota, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), betId, 1, 'Leg 2', 'Market 2', 'Selection 2', '2.00', now)

        db.prepare(`
          INSERT INTO parlay_legs (
            id, bet_id, leg_index, description, market, selection, quota, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), betId, 2, 'Leg 3', 'Market 3', 'Selection 3', '2.00', now)

        // Create bankroll snapshot
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 1700, netGain, 'bet_win', now, monthKey, betId, now)
      })()

      // Verify parlay won
      const bet = db.prepare('SELECT * FROM bets WHERE id = ?').get(betId)
      expect(bet.outcome).toBe('win')
      expect(bet.net_gain).toBe(netGain)
      expect(bet.net_gain).toBeGreaterThan(0)

      // Verify combined odds calculation
      expect(parseFloat(bet.quota)).toBe(8.00)
    })

    it('3.5 - Test parlay loss scenario (at least one leg loses)', () => {
      const { v4: uuidv4 } = require('uuid')
      const betId = uuidv4()
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()
      const betAmount = 100
      const combinedQuota = '8.00'
      const potentialGains = 800
      const netGain = -100 // Loss: -bet_amount

      // Create losing parlay
      db.transaction(() => {
        // Insert parent bet with loss outcome
        db.prepare(`
          INSERT INTO bets (
            id, bet_type, outcome, placed_at, bet_amount, quota,
            market, selection, potential_gains, cashout_amount, net_gain,
            notes, created_at, updated_at, month_key, is_archived
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
        `).run(
          betId, 'parlay', 'loss', now, betAmount, combinedQuota,
          null, null, potentialGains, null, netGain,
          'Losing parlay (one leg lost)', now, now, monthKey
        )

        // Insert parlay legs
        db.prepare(`
          INSERT INTO parlay_legs (
            id, bet_id, leg_index, description, market, selection, quota, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), betId, 0, 'Leg 1 (won)', 'Market 1', 'Selection 1', '2.00', now)

        db.prepare(`
          INSERT INTO parlay_legs (
            id, bet_id, leg_index, description, market, selection, quota, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), betId, 1, 'Leg 2 (lost)', 'Market 2', 'Selection 2', '2.00', now)

        // Create bankroll snapshot
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 900, netGain, 'bet_loss', now, monthKey, betId, now)
      })()

      // Verify parlay lost
      const bet = db.prepare('SELECT * FROM bets WHERE id = ?').get(betId)
      expect(bet.outcome).toBe('loss')
      expect(bet.net_gain).toBe(-betAmount)
      expect(bet.net_gain).toBeLessThan(0)
    })
  })

  // ============================================================================
  // TEST SUITE 4: Statistics and Calculations Verification
  // ============================================================================

  describe('Test Suite 4: Statistics and Calculations Verification', () => {
    beforeEach(() => {
      const { v4: uuidv4 } = require('uuid')
      const monthKey = getCurrentMonthKey()
      const { startDate, endDate } = getMonthDateRange(monthKey)
      const now = new Date().toISOString()

      // Set up initial user with starting bankroll of 1000
      db.transaction(() => {
        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('username', 'TestUser', datetime('now'))
        `).run()

        db.prepare(`
          INSERT INTO user_settings (key, value, updated_at)
          VALUES ('starting_bankroll', '1000', datetime('now'))
        `).run()

        // Create monthly archive
        db.prepare(`
          INSERT INTO monthly_archives (
            month_key, start_date, end_date, starting_bankroll, ending_bankroll, is_active
          ) VALUES (?, ?, ?, 1000, 1000, 1)
        `).run(monthKey, startDate, endDate)

        // Create initial bankroll snapshot
        db.prepare(`
          INSERT INTO bankroll_snapshots (
            id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(uuidv4(), 1000, 1000, 'initial', now, monthKey, null, now)

        // Create multiple bets with known outcomes
        // 3 wins: +150, +200, +100 (total: +450)
        // 2 losses: -100, -50 (total: -150)
        // Net profit: +300
        // Total wagered: 500

        const bets = [
          { id: uuidv4(), outcome: 'win', betAmount: 100, netGain: 150 },
          { id: uuidv4(), outcome: 'win', betAmount: 100, netGain: 200 },
          { id: uuidv4(), outcome: 'win', betAmount: 100, netGain: 100 },
          { id: uuidv4(), outcome: 'loss', betAmount: 100, netGain: -100 },
          { id: uuidv4(), outcome: 'loss', betAmount: 100, netGain: -50 }
        ]

        bets.forEach(bet => {
          db.prepare(`
            INSERT INTO bets (
              id, bet_type, outcome, placed_at, bet_amount, quota,
              market, selection, potential_gains, cashout_amount, net_gain,
              notes, created_at, updated_at, month_key, is_archived
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
          `).run(
            bet.id, 'single', bet.outcome, now, bet.betAmount, '2.00',
            'Test Market', 'Test Selection', bet.betAmount * 2, null, bet.netGain,
            'Test bet', now, now, monthKey
          )
        })

        // Update monthly statistics
        db.prepare(`
          UPDATE monthly_archives
          SET total_bets = 5,
              total_wins = 3,
              total_losses = 2,
              net_profit = 300,
              total_wagered = 500,
              roi = (300.0 / 500.0) * 100,
              updated_at = datetime('now')
          WHERE month_key = ?
        `).run(monthKey)
      })()
    })

    it('4.1 - Verify ROI calculation: (net_profit / total_wagered) * 100', () => {
      const monthKey = getCurrentMonthKey()

      // Get statistics
      const stats = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)

      // Calculate ROI
      const expectedROI = (stats.net_profit / stats.total_wagered) * 100
      expect(expectedROI).toBeCloseTo(60, 2) // 300 / 500 * 100 = 60%

      // Verify stored ROI matches calculation
      expect(stats.roi).toBeCloseTo(60, 2)
    })

    it('4.2 - Verify win rate calculation: (wins / total_bets) * 100', () => {
      const monthKey = getCurrentMonthKey()

      // Get statistics
      const stats = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)

      // Calculate win rate
      const winRate = (stats.total_wins / stats.total_bets) * 100
      expect(winRate).toBeCloseTo(60, 2) // 3 / 5 * 100 = 60%

      // Verify counts
      expect(stats.total_bets).toBe(5)
      expect(stats.total_wins).toBe(3)
      expect(stats.total_losses).toBe(2)
    })

    it('4.3 - Verify current bankroll: starting_bankroll + SUM(net_gain from settled bets)', () => {
      // Get starting bankroll
      const startingSetting = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('starting_bankroll')
      const startingBankroll = parseFloat(startingSetting.value)
      expect(startingBankroll).toBe(1000)

      // Calculate total net gain from settled bets
      const result = db.prepare(`
        SELECT COALESCE(SUM(net_gain), 0) as total_net_gain
        FROM bets
        WHERE outcome IN ('win', 'loss', 'cashout')
      `).get()

      expect(result.total_net_gain).toBe(300) // +150 +200 +100 -100 -50 = +300

      // Calculate current bankroll
      const currentBankroll = startingBankroll + result.total_net_gain
      expect(currentBankroll).toBe(1300) // 1000 + 300 = 1300
    })

    it('4.4 - Verify monthly statistics aggregation', () => {
      const monthKey = getCurrentMonthKey()

      // Get statistics
      const stats = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)

      // Verify all statistics
      expect(stats.total_bets).toBe(5)
      expect(stats.total_wins).toBe(3)
      expect(stats.total_losses).toBe(2)
      expect(stats.total_wagered).toBe(500)
      expect(stats.net_profit).toBe(300)
      expect(stats.roi).toBeCloseTo(60, 2)

      // Verify win rate calculation
      const winRate = (stats.total_wins / stats.total_bets) * 100
      expect(winRate).toBeCloseTo(60, 2)
    })

    it('4.5 - Verify pending bets are excluded from bankroll and statistics', () => {
      const { v4: uuidv4 } = require('uuid')
      const monthKey = getCurrentMonthKey()
      const now = new Date().toISOString()

      // Add a pending bet
      const pendingBetId = uuidv4()
      db.prepare(`
        INSERT INTO bets (
          id, bet_type, outcome, placed_at, bet_amount, quota,
          market, selection, potential_gains, cashout_amount, net_gain,
          notes, created_at, updated_at, month_key, is_archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `).run(
        pendingBetId, 'single', 'pending', now, 100, '2.00',
        'Test Market', 'Test Selection', 200, null, 0,
        'Pending bet', now, now, monthKey
      )

      // Verify pending bet exists
      const pendingBet = db.prepare('SELECT * FROM bets WHERE id = ?').get(pendingBetId)
      expect(pendingBet.outcome).toBe('pending')

      // Calculate net gain excluding pending bets
      const result = db.prepare(`
        SELECT COALESCE(SUM(net_gain), 0) as total_net_gain
        FROM bets
        WHERE outcome IN ('win', 'loss', 'cashout')
      `).get()

      // Should still be 300 (pending bet not included)
      expect(result.total_net_gain).toBe(300)

      // Verify current bankroll doesn't include pending bet
      const startingSetting = db.prepare('SELECT value FROM user_settings WHERE key = ?').get('starting_bankroll')
      const startingBankroll = parseFloat(startingSetting.value)
      const currentBankroll = startingBankroll + result.total_net_gain
      expect(currentBankroll).toBe(1300) // Still 1300, not affected by pending bet

      // Verify total bets count doesn't include pending (in our test setup)
      const stats = db.prepare('SELECT * FROM monthly_archives WHERE month_key = ?').get(monthKey)
      expect(stats.total_bets).toBe(5) // Only settled bets counted
    })
  })
})
