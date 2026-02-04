// Database service - React interface to Electron database
import type { BetRecord, BetFilters } from '../types/electron'
import type { CreateBetFormValues } from '../types/bets'

/**
 * Check if we're running in Electron
 */
function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

/**
 * Get the Electron API (throws if not available)
 */
export function getElectronAPI() {
  if (!isElectron()) {
    throw new Error('Electron API not available. Are you running in Electron?')
  }
  return window.electronAPI
}

/**
 * Create a new bet in the database
 */
export async function createBet(formValues: CreateBetFormValues): Promise<BetRecord> {
  const api = getElectronAPI()
  
  console.log('📝 Creating bet...', formValues)
  
  const response = await api.database.createBet(formValues)
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create bet')
  }
  
  console.log('✅ Bet created successfully:', response.data)
  return response.data
}

/**
 * Get bets from the database
 */
export async function getBets(filters?: BetFilters): Promise<BetRecord[]> {
  const api = getElectronAPI()
  
  console.log('📋 Getting bets...', filters)
  
  const response = await api.database.getBets(filters)
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get bets')
  }
  
  console.log(`✅ Retrieved ${response.data.length} bets`)
  return response.data
}

/**
 * Get a single bet by ID
 */
export async function getBetById(betId: string): Promise<BetRecord> {
  const api = getElectronAPI()
  
  const response = await api.database.getBetById(betId)
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get bet')
  }
  
  return response.data
}

/**
 * Get current month key (YYYY-MM)
 */
export async function getCurrentMonthKey(): Promise<string> {
  const api = getElectronAPI()
  
  const response = await api.database.getCurrentMonthKey()
  
  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to get current month')
  }
  
  return response.data
}

/**
 * Get bets for current month
 */
export async function getCurrentMonthBets(): Promise<BetRecord[]> {
  const monthKey = await getCurrentMonthKey()
  return getBets({ monthKey, isArchived: false })
}

/**
 * Check if this is the first launch (no user settings exist)
 */
export async function isFirstLaunch(): Promise<boolean> {
  const api = getElectronAPI()

  console.log('🔍 Checking if first launch...')

  const response = await api.database.isFirstLaunch()

  if (!response.success || response.data === undefined) {
    throw new Error(response.error || 'Failed to check first launch')
  }

  console.log(`✅ First launch check: ${response.data}`)
  return response.data
}

/**
 * Get user setting by key
 */
export async function getUserSetting(key: string): Promise<string | null> {
  const api = getElectronAPI()

  console.log('🔍 Getting user setting:', key)

  const response = await api.database.getUserSetting(key)

  if (!response.success) {
    throw new Error(response.error || 'Failed to get user setting')
  }

  console.log(`✅ User setting retrieved: ${key}`)
  return response.data ?? null
}

/**
 * Set user setting (upsert)
 * @returns Object with needsRecalculation flag
 */
export async function setUserSetting(key: string, value: string): Promise<{ needsRecalculation: boolean }> {
  const api = getElectronAPI()

  console.log('💾 Setting user setting:', key, '=', value)

  const response = await api.database.setUserSetting(key, value)

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to set user setting')
  }

  console.log(`✅ User setting saved: ${key}`)

  if (response.data.needsRecalculation) {
    console.log('⚠️  This setting change requires statistics recalculation')
  }

  return response.data
}

/**
 * Initialize user (onboarding)
 */
export async function initializeUser(username: string, startingBankroll: number): Promise<void> {
  const api = getElectronAPI()

  console.log('🎯 Initializing user...', { username, startingBankroll })

  const response = await api.database.initializeUser({ username, startingBankroll })

  if (!response.success) {
    throw new Error(response.error || 'Failed to initialize user')
  }

  console.log('✅ User initialized successfully')
}

/**
 * Recalculate all monthly statistics
 * Useful when starting bankroll or other settings change
 */
export async function recalculateAllStatistics(): Promise<{ monthsRecalculated: number }> {
  const api = getElectronAPI()

  console.log('🔄 Recalculating all statistics...')

  const response = await api.database.recalculateAllStatistics()

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to recalculate statistics')
  }

  console.log(`✅ Recalculated statistics for ${response.data.monthsRecalculated} month(s)`)
  return response.data
}

// Export all functions
export const databaseService = {
  createBet,
  getBets,
  getBetById,
  getCurrentMonthKey,
  getCurrentMonthBets,
  isFirstLaunch,
  getUserSetting,
  setUserSetting,
  initializeUser,
  recalculateAllStatistics,
  isElectron
}

