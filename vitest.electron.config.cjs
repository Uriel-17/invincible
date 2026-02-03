/**
 * Vitest Configuration for Electron/Node.js Tests
 * 
 * This configuration is specifically for testing the Electron main process
 * and database modules using CommonJS syntax.
 */

const { defineConfig } = require('vitest/config')

module.exports = defineConfig({
  test: {
    // Use Node.js environment for Electron tests
    environment: 'node',
    
    // Enable globals (describe, it, expect, etc.)
    globals: true,
    
    // Test file patterns
    include: ['electron/__tests__/**/*.test.js'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['electron/**/*.cjs'],
      exclude: ['electron/__tests__/**', 'electron/preload.cjs']
    },
    
    // Test timeout (10 seconds)
    testTimeout: 10000,
    
    // Disable threads for better debugging
    threads: false,
    
    // Show test output
    reporter: 'verbose'
  }
})

