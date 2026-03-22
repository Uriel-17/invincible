// Database module - Handles all SQLite operations
const Database = require('better-sqlite3')
const path = require('path')
const { app } = require('electron')

let db = null

/**
 * Initialize the database
 * Creates the database file and sets up the schema
 */
function initDatabase() {
  // Get the user data directory (platform-specific)
  const userDataPath = app.getPath('userData')
  const dbPath = path.join(userDataPath, 'invincible.db')
  
  console.log('📁 Database path:', dbPath)
  
  // Open database connection
  db = new Database(dbPath)
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON')

  // Create tables
  createTables()

  console.log('✅ Database initialized successfully!')

  return db
}

/**
 * Create database tables
 */
function createTables() {
  // Schema version tracking
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_version (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  
  // User settings (key-value store)
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `)
  
  // Monthly archives metadata
  db.exec(`
    CREATE TABLE IF NOT EXISTS monthly_archives (
      month_key TEXT PRIMARY KEY,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      starting_bankroll REAL NOT NULL,
      ending_bankroll REAL NOT NULL,
      total_bets INTEGER NOT NULL DEFAULT 0,
      total_wins INTEGER NOT NULL DEFAULT 0,
      total_losses INTEGER NOT NULL DEFAULT 0,
      total_pushes INTEGER NOT NULL DEFAULT 0,
      total_cashouts INTEGER NOT NULL DEFAULT 0,
      net_profit REAL NOT NULL DEFAULT 0,
      roi REAL NOT NULL DEFAULT 0,
      archived_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_active INTEGER NOT NULL DEFAULT 1,
      CHECK (is_active IN (0, 1))
    )
  `)
  
  // Bet records
  db.exec(`
    CREATE TABLE IF NOT EXISTS bets (
      id TEXT PRIMARY KEY,
      bet_type TEXT NOT NULL CHECK (bet_type IN ('single', 'parlay')),
      outcome TEXT NOT NULL CHECK (outcome IN ('win', 'loss', 'pending', 'push', 'cashout')),
      placed_at TEXT NOT NULL,
      bet_amount REAL NOT NULL CHECK (bet_amount > 0),
      quota TEXT NOT NULL,
      market TEXT,
      selection TEXT,
      potential_gains REAL NOT NULL,
      cashout_amount REAL CHECK (cashout_amount IS NULL OR cashout_amount >= 0),
      net_gain REAL NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      month_key TEXT NOT NULL,
      is_archived INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (month_key) REFERENCES monthly_archives(month_key),
      CHECK (is_archived IN (0, 1)),
      CHECK ((outcome = 'cashout' AND cashout_amount IS NOT NULL) OR (outcome != 'cashout' AND cashout_amount IS NULL))
    )
  `)
  
  // Parlay legs
  db.exec(`
    CREATE TABLE IF NOT EXISTS parlay_legs (
      id TEXT PRIMARY KEY,
      bet_id TEXT NOT NULL,
      leg_index INTEGER NOT NULL,
      description TEXT NOT NULL,
      market TEXT NOT NULL,
      quota TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (bet_id) REFERENCES bets(id) ON DELETE CASCADE,
      UNIQUE (bet_id, leg_index)
    )
  `)
  
  // Bankroll snapshots
  db.exec(`
    CREATE TABLE IF NOT EXISTS bankroll_snapshots (
      id TEXT PRIMARY KEY,
      month_key TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      amount REAL NOT NULL,
      change_amount REAL NOT NULL,
      change_reason TEXT NOT NULL CHECK (change_reason IN ('initial', 'bet_win', 'bet_loss', 'bet_cashout', 'manual_adjustment', 'month_start')),
      bet_id TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (month_key) REFERENCES monthly_archives(month_key),
      FOREIGN KEY (bet_id) REFERENCES bets(id)
    )
  `)
  
  // Create indexes for performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_bets_month_key ON bets(month_key);
    CREATE INDEX IF NOT EXISTS idx_bets_outcome ON bets(outcome);
    CREATE INDEX IF NOT EXISTS idx_bets_placed_at ON bets(placed_at);
    CREATE INDEX IF NOT EXISTS idx_bets_is_archived ON bets(is_archived);
    CREATE INDEX IF NOT EXISTS idx_parlay_legs_bet_id ON parlay_legs(bet_id);
    CREATE INDEX IF NOT EXISTS idx_bankroll_snapshots_month_key ON bankroll_snapshots(month_key);
    CREATE INDEX IF NOT EXISTS idx_bankroll_snapshots_timestamp ON bankroll_snapshots(timestamp);
  `)
  
  // Insert initial schema version
  db.exec(`INSERT OR IGNORE INTO schema_version (version) VALUES (1)`)

  console.log('✅ Database tables created successfully!')
}

/**
 * Get the database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.')
  }
  return db
}

/**
 * Close the database connection
 */
function closeDatabase() {
  if (db) {
    db.close()
    console.log('✅ Database connection closed')
  }
}

/**
 * Test database with a simple query
 */
function testDatabase() {
  try {
    // Test query: Get schema version
    const version = db.prepare('SELECT version FROM schema_version ORDER BY version DESC LIMIT 1').get()
    console.log('📊 Database schema version:', version?.version || 'unknown')

    // Test query: Count tables
    const tables = db.prepare(`
      SELECT COUNT(*) as count
      FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).get()
    console.log('📊 Number of tables:', tables.count)

    // List all tables
    const tableList = db.prepare(`
      SELECT name
      FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all()
    console.log('📊 Tables:', tableList.map(t => t.name).join(', '))

    return true
  } catch (error) {
    console.error('❌ Database test failed:', error.message)
    return false
  }
}

/**
 * Create a new bet record
 * @param {Object} betData - Bet data from the form
 * @returns {Object} Created bet record with ID
 */
function createBet(betData) {
  const { v4: uuidv4 } = require('uuid')

  try {
    const betId = uuidv4()
    const now = new Date().toISOString()
    const monthKey = betData.placedAt.substring(0, 7) // "YYYY-MM"

    // Ensure month archive exists
    ensureMonthArchive(monthKey, betData.placedAt)

    // Start transaction
    const transaction = db.transaction(() => {
      // Insert bet
      const insertBet = db.prepare(`
        INSERT INTO bets (
          id, bet_type, outcome, placed_at, bet_amount, quota,
          market, selection, potential_gains, cashout_amount, net_gain,
          notes, created_at, updated_at, month_key, is_archived
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
      `)

      insertBet.run(
        betId,
        betData.betType,
        betData.outcome,
        betData.placedAt,
        parseFloat(betData.betAmount),
        betData.quota,
        betData.market || null,
        betData.selection || null,
        parseFloat(betData.potentialGains),
        betData.cashout ? parseFloat(betData.cashout) : null,
        parseFloat(betData.netGain),
        betData.notes || null,
        now,
        now,
        monthKey
      )

      // Insert parlay legs if applicable
      if (betData.betType === 'parlay' && betData.legs && betData.legs.length > 0) {
        const insertLeg = db.prepare(`
          INSERT INTO parlay_legs (
            id, bet_id, leg_index, description, market, quota, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `)

        betData.legs.forEach((leg, index) => {
          insertLeg.run(
            uuidv4(),
            betId,
            index,
            leg.description,
            leg.market,
            leg.quota,
            now
          )
        })
      }

      console.log(`✅ Bet created: ${betId}`)
    })

    transaction()

    // Update monthly statistics after bet creation
    updateMonthlyStatistics(monthKey)

    // Create bankroll snapshot if bet has a settled outcome
    if (['win', 'loss', 'cashout'].includes(betData.outcome)) {
      const currentBankroll = getCurrentBankroll()
      const changeReasonMap = {
        'win': 'bet_win',
        'loss': 'bet_loss',
        'cashout': 'bet_cashout'
      }

      createBankrollSnapshot({
        amount: currentBankroll,
        changeAmount: parseFloat(betData.netGain),
        changeReason: changeReasonMap[betData.outcome],
        monthKey: monthKey,
        betId: betId,
        timestamp: betData.placedAt
      })
    }

    // Return created bet
    return getBetById(betId)
  } catch (error) {
    console.error('❌ Error creating bet:', error.message)
    throw error
  }
}

/**
 * Update an existing bet's outcome, net gain, and cashout amount
 * @param {string} betId - Bet ID to update
 * @param {Object} updates - { outcome, netGain, cashout? }
 * @returns {Object} Updated bet record
 */
function updateBet(betId, updates) {
  try {
    const existing = db.prepare('SELECT * FROM bets WHERE id = ?').get(betId)
    if (!existing) throw new Error(`Bet not found: ${betId}`)

    const newOutcome = updates.outcome
    const newNetGain = parseFloat(updates.netGain)
    const newCashout = newOutcome === 'cashout' && updates.cashout ? parseFloat(updates.cashout) : null

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE bets
        SET outcome = ?, net_gain = ?, cashout_amount = ?,
            market = ?, selection = ?, bet_amount = ?, quota = ?, notes = ?,
            updated_at = datetime('now')
        WHERE id = ?
      `).run(
        newOutcome, newNetGain, newCashout,
        updates.market ?? existing.market,
        updates.selection ?? existing.selection,
        updates.betAmount != null ? parseFloat(updates.betAmount) : existing.bet_amount,
        updates.quota ?? existing.quota,
        updates.notes !== undefined ? (updates.notes || null) : existing.notes,
        betId
      )
    })

    transaction()

    // Upsert bankroll snapshot: remove old, create fresh if settled
    db.prepare('DELETE FROM bankroll_snapshots WHERE bet_id = ?').run(betId)

    if (['win', 'loss', 'cashout'].includes(newOutcome)) {
      const currentBankroll = getCurrentBankroll()
      const changeReasonMap = { win: 'bet_win', loss: 'bet_loss', cashout: 'bet_cashout' }
      createBankrollSnapshot({
        amount: currentBankroll,
        changeAmount: newNetGain,
        changeReason: changeReasonMap[newOutcome],
        monthKey: existing.month_key,
        betId: betId,
        timestamp: existing.placed_at
      })
    }

    updateMonthlyStatistics(existing.month_key)

    console.log(`✅ Bet updated: ${betId} → ${newOutcome}`)
    return getBetById(betId)
  } catch (error) {
    console.error('❌ Error updating bet:', error.message)
    throw error
  }
}

/**
 * Ensure month archive exists for the given month
 */
function ensureMonthArchive(monthKey, startDate) {
  const existing = db.prepare('SELECT month_key FROM monthly_archives WHERE month_key = ?').get(monthKey)

  if (!existing) {
    const [year, month] = monthKey.split('-')
    const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate()
    const endDate = `${monthKey}-${lastDay.toString().padStart(2, '0')}`

    db.prepare(`
      INSERT INTO monthly_archives (
        month_key, start_date, end_date, starting_bankroll, ending_bankroll, is_active
      ) VALUES (?, ?, ?, 0, 0, 1)
    `).run(monthKey, startDate, endDate)

    console.log(`✅ Created month archive: ${monthKey}`)
  }
}

/**
 * Update monthly statistics for a given month
 * Recalculates all statistics from the bets table
 * @param {string} monthKey - Month key in format "YYYY-MM"
 */
function updateMonthlyStatistics(monthKey) {
  try {
    // Calculate statistics from bets table
    const stats = db.prepare(`
      SELECT
        COUNT(*) as total_bets,
        COUNT(CASE WHEN outcome = 'win' THEN 1 END) as total_wins,
        COUNT(CASE WHEN outcome = 'loss' THEN 1 END) as total_losses,
        COUNT(CASE WHEN outcome = 'push' THEN 1 END) as total_pushes,
        COUNT(CASE WHEN outcome = 'cashout' THEN 1 END) as total_cashouts,
        COALESCE(SUM(net_gain), 0) as net_profit,
        COALESCE(SUM(bet_amount), 0) as total_wagered
      FROM bets
      WHERE month_key = ? AND is_archived = 0
    `).get(monthKey)

    // Calculate ROI: (net_profit / total_wagered) * 100
    const roi = stats.total_wagered > 0
      ? (stats.net_profit / stats.total_wagered) * 100
      : 0

    // Get starting bankroll from previous month's ending bankroll
    const startingBankroll = getStartingBankrollForMonth(monthKey)
    const endingBankroll = startingBankroll + stats.net_profit

    // Update monthly_archives table
    db.prepare(`
      UPDATE monthly_archives
      SET
        total_bets = ?,
        total_wins = ?,
        total_losses = ?,
        total_pushes = ?,
        total_cashouts = ?,
        net_profit = ?,
        roi = ?,
        starting_bankroll = ?,
        ending_bankroll = ?
      WHERE month_key = ?
    `).run(
      stats.total_bets,
      stats.total_wins,
      stats.total_losses,
      stats.total_pushes,
      stats.total_cashouts,
      stats.net_profit,
      roi,
      startingBankroll,
      endingBankroll,
      monthKey
    )

    console.log(`✅ Updated monthly statistics for ${monthKey}:`, {
      total_bets: stats.total_bets,
      net_profit: stats.net_profit,
      roi: roi.toFixed(2) + '%'
    })

    return {
      monthKey,
      ...stats,
      roi,
      startingBankroll,
      endingBankroll
    }
  } catch (error) {
    console.error(`❌ Error updating monthly statistics for ${monthKey}:`, error.message)
    throw error
  }
}

/**
 * Get starting bankroll for a given month
 * Uses the ending bankroll from the previous month, or user's initial bankroll
 * @param {string} monthKey - Month key in format "YYYY-MM"
 * @returns {number} Starting bankroll amount
 */
function getStartingBankrollForMonth(monthKey) {
  // Try to get ending bankroll from previous month
  const [year, month] = monthKey.split('-').map(Number)
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year
  const prevMonthKey = `${prevYear}-${prevMonth.toString().padStart(2, '0')}`

  const prevMonthData = db.prepare(`
    SELECT ending_bankroll
    FROM monthly_archives
    WHERE month_key = ?
  `).get(prevMonthKey)

  if (prevMonthData && prevMonthData.ending_bankroll !== null) {
    return prevMonthData.ending_bankroll
  }

  // Fall back to user's starting bankroll from settings
  const userSetting = db.prepare(`
    SELECT value
    FROM user_settings
    WHERE key = 'starting_bankroll'
  `).get()

  return userSetting ? parseFloat(userSetting.value) : 0
}

/**
 * Get current bankroll amount
 * Calculates from starting bankroll + all net gains
 * @returns {number} Current bankroll amount
 */
function getCurrentBankroll() {
  try {
    // Get starting bankroll from user settings
    const startingSetting = db.prepare(`
      SELECT value
      FROM user_settings
      WHERE key = 'starting_bankroll'
    `).get()

    const startingBankroll = startingSetting ? parseFloat(startingSetting.value) : 0

    // Get total net gains from all settled bets
    const result = db.prepare(`
      SELECT COALESCE(SUM(net_gain), 0) as total_net_gain
      FROM bets
      WHERE outcome IN ('win', 'loss', 'cashout')
    `).get()

    return startingBankroll + result.total_net_gain
  } catch (error) {
    console.error('❌ Error getting current bankroll:', error.message)
    return 0
  }
}

/**
 * Create a bankroll snapshot record
 * @param {Object} snapshotData - Snapshot data
 * @param {number} snapshotData.amount - New bankroll amount
 * @param {number} snapshotData.changeAmount - Amount of change (positive or negative)
 * @param {string} snapshotData.changeReason - Reason for change ('bet_win', 'bet_loss', 'bet_cashout', 'deposit', 'withdrawal', 'initial')
 * @param {string} snapshotData.monthKey - Month key in format "YYYY-MM"
 * @param {string} snapshotData.betId - Optional bet ID if related to a bet
 * @returns {Object} Created snapshot record
 */
function createBankrollSnapshot(snapshotData) {
  const { v4: uuidv4 } = require('uuid')

  try {
    const snapshotId = uuidv4()
    const now = new Date().toISOString()

    db.prepare(`
      INSERT INTO bankroll_snapshots (
        id, amount, change_amount, change_reason, timestamp, month_key, bet_id, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      snapshotId,
      snapshotData.amount,
      snapshotData.changeAmount,
      snapshotData.changeReason,
      snapshotData.timestamp || now,
      snapshotData.monthKey,
      snapshotData.betId || null,
      now
    )

    console.log(`✅ Created bankroll snapshot: ${snapshotId} (${snapshotData.changeReason})`)

    return {
      id: snapshotId,
      ...snapshotData,
      timestamp: snapshotData.timestamp || now,
      created_at: now
    }
  } catch (error) {
    console.error('❌ Error creating bankroll snapshot:', error.message)
    throw error
  }
}

/**
 * Get bet by ID
 */
function getBetById(betId) {
  const bet = db.prepare('SELECT * FROM bets WHERE id = ?').get(betId)

  if (bet && bet.bet_type === 'parlay') {
    const legs = db.prepare(`
      SELECT * FROM parlay_legs
      WHERE bet_id = ?
      ORDER BY leg_index
    `).all(betId)

    bet.legs = legs
  }

  return bet
}

/**
 * Get all bets with optional filters
 */
function getBets(filters = {}) {
  let query = 'SELECT * FROM bets WHERE 1=1'
  const params = []

  if (filters.monthKey) {
    query += ' AND month_key = ?'
    params.push(filters.monthKey)
  }

  if (filters.isArchived !== undefined) {
    query += ' AND is_archived = ?'
    params.push(filters.isArchived ? 1 : 0)
  }

  if (filters.outcome) {
    query += ' AND outcome = ?'
    params.push(filters.outcome)
  }

  query += ' ORDER BY placed_at DESC, created_at DESC'

  const bets = db.prepare(query).all(...params)

  // Load parlay legs for each parlay bet
  bets.forEach(bet => {
    if (bet.bet_type === 'parlay') {
      bet.legs = db.prepare(`
        SELECT * FROM parlay_legs
        WHERE bet_id = ?
        ORDER BY leg_index
      `).all(bet.id)
    }
  })

  return bets
}

/**
 * Get current month key (YYYY-MM)
 */
function getCurrentMonthKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Get a user setting by key
 * @param {string} key - Setting key
 * @returns {string|null} Setting value or null if not found
 */
function getUserSetting(key) {
  try {
    const result = db.prepare(`
      SELECT value
      FROM user_settings
      WHERE key = ?
    `).get(key)

    return result ? result.value : null
  } catch (error) {
    console.error(`❌ Error getting user setting '${key}':`, error.message)
    return null
  }
}

/**
 * Set a user setting
 * @param {string} key - Setting key
 * @param {string} value - Setting value
 * @returns {Object} { needsRecalculation: boolean } - Flag indicating if statistics need recalculation
 */
function setUserSetting(key, value) {
  try {
    db.prepare(`
      INSERT INTO user_settings (key, value, updated_at)
      VALUES (?, ?, datetime('now'))
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = datetime('now')
    `).run(key, value)

    console.log(`✅ User setting saved: ${key}`)

    // Check if this setting change requires statistics recalculation
    const needsRecalculation = key === 'starting_bankroll'

    if (needsRecalculation) {
      console.log('⚠️  Starting bankroll changed - statistics recalculation recommended')
    }

    return { needsRecalculation }
  } catch (error) {
    console.error(`❌ Error setting user setting '${key}':`, error.message)
    throw error
  }
}

/**
 * Recalculate all monthly statistics
 * Useful when starting bankroll or other settings change
 */
function recalculateAllStatistics() {
  try {
    console.log('🔄 Recalculating all monthly statistics...')

    // Get all distinct month keys from monthly_archives
    const months = db.prepare('SELECT DISTINCT month_key FROM monthly_archives ORDER BY month_key').all()

    if (months.length === 0) {
      console.log('ℹ️  No months to recalculate')
      return { monthsRecalculated: 0 }
    }

    // Recalculate statistics for each month
    months.forEach(({ month_key }) => {
      console.log(`  📊 Recalculating ${month_key}...`)
      updateMonthlyStatistics(month_key)
    })

    console.log(`✅ Recalculated statistics for ${months.length} month(s)`)
    return { monthsRecalculated: months.length }
  } catch (error) {
    console.error('❌ Error recalculating statistics:', error.message)
    throw error
  }
}

/**
 * Check if this is the first launch (no user settings exist)
 * @returns {boolean} True if first launch
 */
function isFirstLaunch() {
  try {
    const result = db.prepare(`
      SELECT COUNT(*) as count
      FROM user_settings
    `).get()

    return result.count === 0
  } catch (error) {
    console.error('❌ Error checking first launch:', error.message)
    return false
  }
}

/**
 * Get bankroll history from snapshots
 * @returns {Array} Array of bankroll snapshot records ordered by timestamp
 */
function getBankrollHistory() {
  try {
    const snapshots = db.prepare(`
      SELECT
        id,
        month_key,
        timestamp,
        amount,
        change_amount,
        change_reason,
        bet_id,
        notes,
        created_at
      FROM bankroll_snapshots
      ORDER BY timestamp ASC
    `).all()

    console.log(`✅ Retrieved ${snapshots.length} bankroll snapshots`)
    return snapshots
  } catch (error) {
    console.error('❌ Error getting bankroll history:', error.message)
    throw error
  }
}

/**
 * Clear all betting data (bets, parlay legs, bankroll snapshots, monthly archives)
 * Keeps user_settings table intact
 * @returns {Object} { success: boolean, deletedRecords: number }
 */
function clearAllData() {
  try {
    console.log('🗑️ Clearing all betting data...')

    const transaction = db.transaction(() => {
      // Delete all parlay legs first (foreign key constraint)
      const deletedLegs = db.prepare('DELETE FROM parlay_legs').run()

      // Delete all bets
      const deletedBets = db.prepare('DELETE FROM bets').run()

      // Delete all bankroll snapshots
      const deletedSnapshots = db.prepare('DELETE FROM bankroll_snapshots').run()

      // Delete all monthly archives
      const deletedArchives = db.prepare('DELETE FROM monthly_archives').run()

      const totalDeleted =
        deletedLegs.changes +
        deletedBets.changes +
        deletedSnapshots.changes +
        deletedArchives.changes

      console.log(`✅ Deleted ${totalDeleted} records:`)
      console.log(`   - Parlay legs: ${deletedLegs.changes}`)
      console.log(`   - Bets: ${deletedBets.changes}`)
      console.log(`   - Bankroll snapshots: ${deletedSnapshots.changes}`)
      console.log(`   - Monthly archives: ${deletedArchives.changes}`)

      return totalDeleted
    })

    const deletedRecords = transaction()

    return {
      success: true,
      deletedRecords
    }
  } catch (error) {
    console.error('❌ Error clearing all data:', error.message)
    return {
      success: false,
      error: error.message
    }
  }
}

// Export functions
module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  testDatabase,
  createBet,
  updateBet,
  getBets,
  getBetById,
  getCurrentMonthKey,
  updateMonthlyStatistics,
  recalculateAllStatistics,
  createBankrollSnapshot,
  getCurrentBankroll,
  getBankrollHistory,
  getUserSetting,
  setUserSetting,
  isFirstLaunch,
  clearAllData
}

