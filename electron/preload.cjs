// Preload script - Bridge between main and renderer processes
// This file runs before your React app loads and exposes safe APIs to React

const { contextBridge, ipcRenderer } = require('electron')

console.log('Preload script loaded!')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Database operations
  database: {
    /**
     * Create a new bet
     * @param {Object} betData - Bet data from form
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    createBet: (betData) => ipcRenderer.invoke('db:createBet', betData),

    /**
     * Get bets with optional filters
     * @param {Object} filters - Optional filters (monthKey, isArchived, outcome)
     * @returns {Promise<{success: boolean, data?: any[], error?: string}>}
     */
    getBets: (filters) => ipcRenderer.invoke('db:getBets', filters),

    /**
     * Get bet by ID
     * @param {string} betId - Bet ID
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    getBetById: (betId) => ipcRenderer.invoke('db:getBetById', betId),

    /**
     * Get current month key (YYYY-MM)
     * @returns {Promise<{success: boolean, data?: string, error?: string}>}
     */
    getCurrentMonthKey: () => ipcRenderer.invoke('db:getCurrentMonthKey')
  }
})

console.log('✅ Electron API exposed to renderer process')

