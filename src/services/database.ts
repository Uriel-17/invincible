// Database service - React interface to Electron database
import type { BetRecord, BetFilters, DatabaseResponse } from '../types/electron'
import type { CreatePickFormValues } from '../Pages/types'

/**
 * Check if we're running in Electron
 */
function isElectron(): boolean {
  return typeof window !== 'undefined' && window.electronAPI !== undefined
}

/**
 * Get the Electron API (throws if not available)
 */
function getElectronAPI() {
  if (!isElectron()) {
    throw new Error('Electron API not available. Are you running in Electron?')
  }
  return window.electronAPI
}

/**
 * Create a new bet in the database
 */
export async function createBet(formValues: CreatePickFormValues): Promise<BetRecord> {
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

// Export all functions
export const databaseService = {
  createBet,
  getBets,
  getBetById,
  getCurrentMonthKey,
  getCurrentMonthBets,
  isElectron
}

