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
  getCurrentMonthKey
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

