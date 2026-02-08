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
    getCurrentMonthKey: () => ipcRenderer.invoke('db:getCurrentMonthKey'),

    /**
     * Check if this is the first launch (no user settings exist)
     * @returns {Promise<{success: boolean, data?: boolean, error?: string}>}
     */
    isFirstLaunch: () => ipcRenderer.invoke('db:isFirstLaunch'),

    /**
     * Get user setting by key
     * @param {string} key - Setting key
     * @returns {Promise<{success: boolean, data?: string, error?: string}>}
     */
    getUserSetting: (key) => ipcRenderer.invoke('db:getUserSetting', key),

    /**
     * Set user setting (upsert)
     * @param {string} key - Setting key
     * @param {string} value - Setting value
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    setUserSetting: (key, value) => ipcRenderer.invoke('db:setUserSetting', key, value),

    /**
     * Initialize user (onboarding)
     * @param {Object} userData - User data {username: string, startingBankroll: number}
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    initializeUser: (userData) => ipcRenderer.invoke('db:initializeUser', userData),

    /**
     * Recalculate all monthly statistics
     * @returns {Promise<{success: boolean, data?: {monthsRecalculated: number}, error?: string}>}
     */
    recalculateAllStatistics: () => ipcRenderer.invoke('db:recalculateAllStatistics'),

    /**
     * Get current bankroll amount
     * @returns {Promise<{success: boolean, data?: number, error?: string}>}
     */
    getCurrentBankroll: () => ipcRenderer.invoke('db:getCurrentBankroll'),

    /**
     * Update monthly statistics for a given month
     * @param {string} monthKey - Month key in format "YYYY-MM"
     * @returns {Promise<{success: boolean, data?: any, error?: string}>}
     */
    updateMonthlyStatistics: (monthKey) => ipcRenderer.invoke('db:updateMonthlyStatistics', monthKey),

    /**
     * Add funds to bankroll
     * @param {number} amount - Amount to add to starting bankroll
     * @returns {Promise<{success: boolean, error?: string}>}
     */
    addFunds: (amount) => ipcRenderer.invoke('db:addFunds', amount),

    /**
     * Clear all betting data (bets, parlay legs, bankroll snapshots, monthly archives)
     * Keeps user_settings table intact
     * @returns {Promise<{success: boolean, data?: {deletedRecords: number}, error?: string}>}
     */
    clearAllData: () => ipcRenderer.invoke('db:clearAllData')
  }
})

console.log('✅ Electron API exposed to renderer process')

