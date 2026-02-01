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
      amount REAL NOT NULL CHECK (amount >= 0),
      change_reason TEXT NOT NULL CHECK (change_reason IN ('initial', 'bet_win', 'bet_loss', 'bet_cashout', 'manual_adjustment', 'month_start')),
      related_bet_id TEXT,
      notes TEXT,
      FOREIGN KEY (month_key) REFERENCES monthly_archives(month_key),
      FOREIGN KEY (related_bet_id) REFERENCES bets(id)
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

    // Return created bet
    return getBetById(betId)
  } catch (error) {
    console.error('❌ Error creating bet:', error.message)
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

// Export functions
module.exports = {
  initDatabase,
  getDatabase,
  closeDatabase,
  testDatabase,
  createBet,
  getBets,
  getBetById,
  getCurrentMonthKey
}

