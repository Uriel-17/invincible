/**
 * Comprehensive unit tests for field validation regex patterns
 * Tests happy paths and edge cases for all validation functions
 */

import { describe, it, expect } from 'vitest'
import {
  getBetAmountValidation,
  getQuotaValidation,
  getPotentialGainsValidation,
  getNetGainValidation,
  getCashoutValidation,
  getLegQuotaValidation,
} from './fieldValidations'

describe('Field Validation Regex Patterns', () => {
  describe('getBetAmountValidation - Positive decimals only', () => {
    const { pattern } = getBetAmountValidation()

    describe('Happy paths - Valid inputs', () => {
      it('should accept positive integers', () => {
        expect(pattern?.test('1')).toBe(true)
        expect(pattern?.test('10')).toBe(true)
        expect(pattern?.test('100')).toBe(true)
        expect(pattern?.test('9999')).toBe(true)
      })

      it('should accept positive decimals with one decimal place', () => {
        expect(pattern?.test('1.5')).toBe(true)
        expect(pattern?.test('10.9')).toBe(true)
        expect(pattern?.test('100.0')).toBe(true)
      })

      it('should accept positive decimals with two decimal places', () => {
        expect(pattern?.test('1.50')).toBe(true)
        expect(pattern?.test('10.99')).toBe(true)
        expect(pattern?.test('100.00')).toBe(true)
        expect(pattern?.test('25.75')).toBe(true)
      })

      it('should accept positive decimals with many decimal places', () => {
        expect(pattern?.test('1.123456')).toBe(true)
        expect(pattern?.test('99.999999')).toBe(true)
      })
    })

    describe('Edge cases - Invalid inputs', () => {
      it('should reject negative numbers', () => {
        expect(pattern?.test('-1')).toBe(false)
        expect(pattern?.test('-10.50')).toBe(false)
        expect(pattern?.test('-0.01')).toBe(false)
      })

      it('should reject numbers with plus sign', () => {
        expect(pattern?.test('+1')).toBe(false)
        expect(pattern?.test('+10.50')).toBe(false)
      })

      it('should reject letters and special characters', () => {
        expect(pattern?.test('abc')).toBe(false)
        expect(pattern?.test('Hello')).toBe(false)
        expect(pattern?.test('12abc')).toBe(false)
        expect(pattern?.test('abc12')).toBe(false)
        expect(pattern?.test('12.5abc')).toBe(false)
      })

      it('should reject empty string', () => {
        expect(pattern?.test('')).toBe(false)
      })

      it('should reject whitespace', () => {
        expect(pattern?.test(' ')).toBe(false)
        expect(pattern?.test('  ')).toBe(false)
        expect(pattern?.test('12 ')).toBe(false)
        expect(pattern?.test(' 12')).toBe(false)
        expect(pattern?.test('12 .50')).toBe(false)
      })

      it('should reject multiple decimal points', () => {
        expect(pattern?.test('12.50.75')).toBe(false)
        expect(pattern?.test('1.2.3')).toBe(false)
      })

      it('should reject decimal point without digits', () => {
        expect(pattern?.test('.')).toBe(false)
        expect(pattern?.test('.5')).toBe(false)
      })

      it('should reject special characters', () => {
        expect(pattern?.test('12$')).toBe(false)
        expect(pattern?.test('12%')).toBe(false)
        expect(pattern?.test('12!')).toBe(false)
        expect(pattern?.test('12@')).toBe(false)
      })
    })
  })

  describe('getQuotaValidation - American odds format (integers with optional +/- sign)', () => {
    const { pattern } = getQuotaValidation()

    describe('Happy paths - Valid inputs', () => {
      it('should accept positive integers without sign', () => {
        expect(pattern?.test('100')).toBe(true)
        expect(pattern?.test('110')).toBe(true)
        expect(pattern?.test('200')).toBe(true)
        expect(pattern?.test('9999')).toBe(true)
      })

      it('should accept negative integers with minus sign', () => {
        expect(pattern?.test('-100')).toBe(true)
        expect(pattern?.test('-110')).toBe(true)
        expect(pattern?.test('-200')).toBe(true)
        expect(pattern?.test('-9999')).toBe(true)
      })

      it('should accept positive integers with plus sign', () => {
        expect(pattern?.test('+100')).toBe(true)
        expect(pattern?.test('+150')).toBe(true)
        expect(pattern?.test('+200')).toBe(true)
      })
    })

    describe('Edge cases - Invalid inputs', () => {
      it('should reject decimal numbers', () => {
        expect(pattern?.test('110.5')).toBe(false)
        expect(pattern?.test('-110.5')).toBe(false)
        expect(pattern?.test('+150.25')).toBe(false)
      })

      it('should reject letters and special characters', () => {
        expect(pattern?.test('abc')).toBe(false)
        expect(pattern?.test('Hello')).toBe(false)
        expect(pattern?.test('110abc')).toBe(false)
        expect(pattern?.test('abc110')).toBe(false)
      })

      it('should reject empty string', () => {
        expect(pattern?.test('')).toBe(false)
      })

      it('should reject whitespace', () => {
        expect(pattern?.test(' ')).toBe(false)
        expect(pattern?.test('110 ')).toBe(false)
        expect(pattern?.test(' 110')).toBe(false)
        expect(pattern?.test('- 110')).toBe(false)
      })

      it('should reject multiple signs', () => {
        expect(pattern?.test('++110')).toBe(false)
        expect(pattern?.test('--110')).toBe(false)
        expect(pattern?.test('+-110')).toBe(false)
      })

      it('should reject sign in the middle or end', () => {
        expect(pattern?.test('1-10')).toBe(false)
        expect(pattern?.test('110-')).toBe(false)
        expect(pattern?.test('110+')).toBe(false)
      })
    })
  })

  describe('getPotentialGainsValidation - Any number including negative decimals', () => {
    const { pattern } = getPotentialGainsValidation()

    describe('Happy paths - Valid inputs', () => {
      it('should accept positive integers', () => {
        expect(pattern?.test('1')).toBe(true)
        expect(pattern?.test('100')).toBe(true)
        expect(pattern?.test('9999')).toBe(true)
      })

      it('should accept positive decimals', () => {
        expect(pattern?.test('1.5')).toBe(true)
        expect(pattern?.test('45.50')).toBe(true)
        expect(pattern?.test('100.99')).toBe(true)
      })

      it('should accept negative integers', () => {
        expect(pattern?.test('-1')).toBe(true)
        expect(pattern?.test('-100')).toBe(true)
        expect(pattern?.test('-9999')).toBe(true)
      })

      it('should accept negative decimals', () => {
        expect(pattern?.test('-1.5')).toBe(true)
        expect(pattern?.test('-12.25')).toBe(true)
        expect(pattern?.test('-100.00')).toBe(true)
      })

      it('should accept zero', () => {
        expect(pattern?.test('0')).toBe(true)
        expect(pattern?.test('0.0')).toBe(true)
        expect(pattern?.test('0.00')).toBe(true)
      })
    })

    describe('Edge cases - Invalid inputs', () => {
      it('should reject numbers with plus sign', () => {
        expect(pattern?.test('+1')).toBe(false)
        expect(pattern?.test('+10.50')).toBe(false)
      })

      it('should reject letters and special characters', () => {
        expect(pattern?.test('abc')).toBe(false)
        expect(pattern?.test('Hello')).toBe(false)
        expect(pattern?.test('45abc')).toBe(false)
        expect(pattern?.test('-12.5abc')).toBe(false)
      })

      it('should reject empty string', () => {
        expect(pattern?.test('')).toBe(false)
      })

      it('should reject whitespace', () => {
        expect(pattern?.test(' ')).toBe(false)
        expect(pattern?.test('45 ')).toBe(false)
        expect(pattern?.test(' 45')).toBe(false)
        expect(pattern?.test('- 45')).toBe(false)
      })

      it('should reject multiple decimal points', () => {
        expect(pattern?.test('45.50.75')).toBe(false)
        expect(pattern?.test('-1.2.3')).toBe(false)
      })

      it('should reject decimal point without digits', () => {
        expect(pattern?.test('.')).toBe(false)
        expect(pattern?.test('.5')).toBe(false)
        expect(pattern?.test('-.5')).toBe(false)
      })

      it('should reject multiple minus signs', () => {
        expect(pattern?.test('--45')).toBe(false)
        expect(pattern?.test('---45.50')).toBe(false)
      })
    })
  })

  describe('getNetGainValidation - Any number including negative decimals', () => {
    const { pattern } = getNetGainValidation()

    describe('Happy paths - Valid inputs', () => {
      it('should accept positive integers', () => {
        expect(pattern?.test('1')).toBe(true)
        expect(pattern?.test('100')).toBe(true)
        expect(pattern?.test('9999')).toBe(true)
      })

      it('should accept positive decimals', () => {
        expect(pattern?.test('33.75')).toBe(true)
        expect(pattern?.test('100.00')).toBe(true)
      })

      it('should accept negative integers', () => {
        expect(pattern?.test('-1')).toBe(true)
        expect(pattern?.test('-25')).toBe(true)
      })

      it('should accept negative decimals', () => {
        expect(pattern?.test('-25.00')).toBe(true)
        expect(pattern?.test('-33.75')).toBe(true)
      })
    })

    describe('Edge cases - Invalid inputs', () => {
      it('should reject letters and special characters', () => {
        expect(pattern?.test('abc')).toBe(false)
        expect(pattern?.test('33abc')).toBe(false)
      })

      it('should reject empty string', () => {
        expect(pattern?.test('')).toBe(false)
      })

      it('should reject whitespace', () => {
        expect(pattern?.test(' ')).toBe(false)
        expect(pattern?.test('33 ')).toBe(false)
      })
    })
  })

  describe('getCashoutValidation - Positive decimals only', () => {
    const { pattern } = getCashoutValidation()

    describe('Happy paths - Valid inputs', () => {
      it('should accept positive integers', () => {
        expect(pattern?.test('25')).toBe(true)
        expect(pattern?.test('100')).toBe(true)
      })

      it('should accept positive decimals', () => {
        expect(pattern?.test('45.50')).toBe(true)
        expect(pattern?.test('100.00')).toBe(true)
      })
    })

    describe('Edge cases - Invalid inputs', () => {
      it('should reject negative numbers', () => {
        expect(pattern?.test('-45.50')).toBe(false)
        expect(pattern?.test('-100')).toBe(false)
      })

      it('should reject letters and special characters', () => {
        expect(pattern?.test('abc')).toBe(false)
        expect(pattern?.test('45abc')).toBe(false)
      })

      it('should reject empty string', () => {
        expect(pattern?.test('')).toBe(false)
      })
    })
  })

  describe('getLegQuotaValidation - American odds format (same as getQuotaValidation)', () => {
    const { pattern } = getLegQuotaValidation()

    describe('Happy paths - Valid inputs', () => {
      it('should accept integers with optional +/- sign', () => {
        expect(pattern?.test('110')).toBe(true)
        expect(pattern?.test('-110')).toBe(true)
        expect(pattern?.test('+150')).toBe(true)
      })
    })

    describe('Edge cases - Invalid inputs', () => {
      it('should reject decimal numbers', () => {
        expect(pattern?.test('110.5')).toBe(false)
        expect(pattern?.test('-110.5')).toBe(false)
      })

      it('should reject letters', () => {
        expect(pattern?.test('abc')).toBe(false)
        expect(pattern?.test('110abc')).toBe(false)
      })
    })
  })
})
