// Electron main process - This is the "backend"
// This file runs in Node.js and can access the file system, SQLite, etc.

const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const {
  initDatabase,
  closeDatabase,
  testDatabase,
  createBet,
  getBets,
  getBetById,
  getCurrentMonthKey,
  getUserSetting,
  setUserSetting,
  isFirstLaunch,
  createBankrollSnapshot,
  updateMonthlyStatistics,
  recalculateAllStatistics,
  getCurrentBankroll,
  clearAllData
} = require('./database.cjs')

// Keep a global reference of the window object
let mainWindow

/**
 * Register IPC handlers for database operations
 */
function registerIPCHandlers() {
  // Create a new bet
  ipcMain.handle('db:createBet', async (event, betData) => {
    try {
      console.log('📝 IPC: Creating bet...', betData)
      const result = createBet(betData)
      console.log('✅ IPC: Bet created successfully')
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error creating bet:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Get bets with optional filters
  ipcMain.handle('db:getBets', async (event, filters) => {
    try {
      console.log('📋 IPC: Getting bets...', filters)
      const result = getBets(filters)
      console.log(`✅ IPC: Retrieved ${result.length} bets`)
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error getting bets:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Get bet by ID
  ipcMain.handle('db:getBetById', async (event, betId) => {
    try {
      console.log('🔍 IPC: Getting bet by ID...', betId)
      const result = getBetById(betId)
      console.log('✅ IPC: Bet retrieved')
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error getting bet:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Get current month key
  ipcMain.handle('db:getCurrentMonthKey', async () => {
    try {
      const result = getCurrentMonthKey()
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error getting current month:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Check if first launch
  ipcMain.handle('db:isFirstLaunch', async () => {
    try {
      console.log('🔍 IPC: Checking if first launch...')
      const result = isFirstLaunch()
      console.log(`✅ IPC: First launch check: ${result}`)
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error checking first launch:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Get user setting
  ipcMain.handle('db:getUserSetting', async (event, key) => {
    try {
      console.log('🔍 IPC: Getting user setting:', key)
      const result = getUserSetting(key)
      console.log(`✅ IPC: User setting retrieved: ${key}`)
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error getting user setting:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Set user setting
  ipcMain.handle('db:setUserSetting', async (event, key, value) => {
    try {
      console.log('💾 IPC: Setting user setting:', key, '=', value)
      const result = setUserSetting(key, value)
      console.log(`✅ IPC: User setting saved: ${key}`)
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error setting user setting:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Recalculate all monthly statistics
  ipcMain.handle('db:recalculateAllStatistics', async () => {
    try {
      console.log('🔄 IPC: Recalculating all statistics...')
      const result = recalculateAllStatistics()
      console.log(`✅ IPC: Statistics recalculated for ${result.monthsRecalculated} month(s)`)
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error recalculating statistics:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Get current bankroll
  ipcMain.handle('db:getCurrentBankroll', async () => {
    try {
      const result = getCurrentBankroll()
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error getting current bankroll:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Update monthly statistics
  ipcMain.handle('db:updateMonthlyStatistics', async (event, monthKey) => {
    try {
      const result = updateMonthlyStatistics(monthKey)
      return { success: true, data: result }
    } catch (error) {
      console.error('❌ IPC: Error updating monthly statistics:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Initialize user (onboarding)
  ipcMain.handle('db:initializeUser', async (event, { username, startingBankroll }) => {
    try {
      console.log('🎯 IPC: Initializing user...', { username, startingBankroll })

      // Get database instance
      const db = require('./database.cjs').getDatabase()

      // Create transaction for atomic operation
      const transaction = db.transaction(() => {
        // Save user settings
        setUserSetting('username', username)
        setUserSetting('starting_bankroll', startingBankroll.toString())

        // Create initial bankroll snapshot
        const monthKey = getCurrentMonthKey()
        const now = new Date().toISOString()

        createBankrollSnapshot({
          amount: startingBankroll,
          changeAmount: startingBankroll,
          changeReason: 'initial',
          monthKey: monthKey,
          timestamp: now
        })

        // Update monthly statistics for current month
        updateMonthlyStatistics(monthKey)
      })

      // Execute transaction
      transaction()

      console.log('✅ IPC: User initialized successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ IPC: Error initializing user:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Add funds to bankroll
  ipcMain.handle('db:addFunds', async (event, amount) => {
    try {
      console.log('💰 IPC: Adding funds to bankroll...', amount)

      // Get database instance
      const db = require('./database.cjs').getDatabase()

      // Create transaction for atomic operation
      const transaction = db.transaction(() => {
        // Get current starting bankroll
        const currentSetting = getUserSetting('starting_bankroll')
        const currentStartingBankroll = currentSetting ? parseFloat(currentSetting) : 0

        // Calculate new starting bankroll
        const newStartingBankroll = currentStartingBankroll + amount

        // Update starting bankroll
        setUserSetting('starting_bankroll', newStartingBankroll.toString())

        // Create bankroll snapshot
        const monthKey = getCurrentMonthKey()
        const now = new Date().toISOString()
        const newBankroll = getCurrentBankroll()

        createBankrollSnapshot({
          amount: newBankroll,
          changeAmount: amount,
          changeReason: 'manual_adjustment',
          monthKey: monthKey,
          timestamp: now
        })

        // Recalculate all statistics since starting bankroll changed
        recalculateAllStatistics()
      })

      // Execute transaction
      transaction()

      console.log('✅ IPC: Funds added successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ IPC: Error adding funds:', error.message)
      return { success: false, error: error.message }
    }
  })

  // Clear all data
  ipcMain.handle('db:clearAllData', async () => {
    try {
      console.log('🗑️ IPC: Clearing all data...')
      const result = clearAllData()

      if (result.success) {
        console.log(`✅ IPC: Cleared ${result.deletedRecords} records`)
        return { success: true, data: { deletedRecords: result.deletedRecords } }
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('❌ IPC: Error clearing all data:', error.message)
      return { success: false, error: error.message }
    }
  })

  console.log('✅ IPC handlers registered')
}

function createWindow() {
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      preload: path.join(__dirname, 'preload.cjs')
    }
  })

  // Load React app
  // In development: Load from Vite dev server
  // In production: Load from built files
  const isDev = process.env.NODE_ENV === 'development'
  
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173') // Vite default port
    mainWindow.webContents.openDevTools() // Open DevTools in development
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  // Initialize database first
  console.log('🚀 Initializing database...')
  initDatabase()

  // Test database
  console.log('🧪 Testing database...')
  testDatabase()

  // Register IPC handlers
  console.log('🔌 Registering IPC handlers...')
  registerIPCHandlers()

  // Create window
  createWindow()

  // On macOS, re-create window when dock icon is clicked
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

// Quit when all windows are closed (except on macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Clean up database connection before quitting
app.on('before-quit', () => {
  console.log('🔒 Closing database connection...')
  closeDatabase()
})

console.log('Electron main process started!')
console.log('User data path:', app.getPath('userData'))

