// Electron main process - This is the "backend"
// This file runs in Node.js and can access the file system, SQLite, etc.

const { app, BrowserWindow } = require('electron')
const path = require('path')
const { initDatabase, closeDatabase, testDatabase } = require('./database.cjs')

// Keep a global reference of the window object
let mainWindow

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

