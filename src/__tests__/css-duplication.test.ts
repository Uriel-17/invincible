import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'
import postcss from 'postcss'

/**
 * Recursively find all CSS files in a directory
 */
function findCSSFiles(dir: string, fileList: string[] = []): string[] {
  const files = readdirSync(dir)

  files.forEach((file) => {
    const filePath = join(dir, file)
    const stat = statSync(filePath)

    if (stat.isDirectory()) {
      // Skip node_modules and hidden directories
      if (!file.startsWith('.') && file !== 'node_modules') {
        findCSSFiles(filePath, fileList)
      }
    } else if (file.endsWith('.css')) {
      fileList.push(filePath)
    }
  })

  return fileList
}

/**
 * Extract all CSS class names from a CSS file
 */
function extractClassNames(cssContent: string): Set<string> {
  const classNames = new Set<string>()
  
  try {
    const root = postcss.parse(cssContent)
    
    root.walkRules((rule) => {
      rule.selectors.forEach((selector) => {
        // Match class selectors (e.g., .my-class, .my-class:hover, .my-class.another-class)
        const classMatches = selector.match(/\.([a-zA-Z0-9_-]+)/g)
        if (classMatches) {
          classMatches.forEach((match) => {
            // Remove the leading dot
            const className = match.substring(1)
            classNames.add(className)
          })
        }
      })
    })
  } catch (error) {
    console.error('Error parsing CSS:', error)
  }

  return classNames
}

describe('CSS Duplication Detection - Phase 1', () => {
  it('should not have duplicate modal CSS classes across files', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    // Map of class name to array of files where it's defined
    const classMap = new Map<string, string[]>()

    // Parse each CSS file and extract class names
    cssFiles.forEach((filePath) => {
      const cssContent = readFileSync(filePath, 'utf-8')
      const classNames = extractClassNames(cssContent)

      classNames.forEach((className) => {
        if (!classMap.has(className)) {
          classMap.set(className, [])
        }
        classMap.get(className)!.push(filePath)
      })
    })

    // Find modal-related classes that appear in multiple files
    const modalClassPatterns = [
      /-overlay$/,
      /-dialog$/,
      /-modal$/,
      /-header$/,
      /-content$/,
      /-actions$/,
      /-button$/,
      /-field$/,
      /-input$/,
    ]

    const duplicates: Array<{ className: string; files: string[] }> = []

    classMap.forEach((files, className) => {
      if (files.length > 1) {
        // Check if this is a modal-related class
        const isModalClass = modalClassPatterns.some((pattern) =>
          pattern.test(className)
        )

        if (isModalClass) {
          // Get relative paths for better readability
          const relativeFiles = files.map((f) => f.replace(srcDir, 'src'))
          duplicates.push({ className, files: relativeFiles })
        }
      }
    })

    // If duplicates found, create a detailed error message
    if (duplicates.length > 0) {
      const errorMessage = [
        '\n❌ Found duplicate modal CSS classes across multiple files:',
        '',
        ...duplicates.map(({ className, files }) => {
          return `  Class: .${className}\n  Found in:\n${files.map((f) => `    - ${f}`).join('\n')}`
        }),
        '',
        '💡 Fix: Each modal should have its own unique CSS classes in a single file.',
        '   For example, .add-funds-overlay should only be in AddFundsModal.css',
      ].join('\n')

      expect(duplicates, errorMessage).toEqual([])
    }

    // Test passes if no duplicates found
    expect(duplicates).toEqual([])
  })

  it('should have consistent modal overlay opacity values', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    const overlayOpacities: Array<{ file: string; className: string; opacity: string }> = []

    cssFiles.forEach((filePath) => {
      // Only check files that are actual modals (contain "Modal" in the filename)
      // This excludes confirmation dialogs and other overlay components
      const isModalFile = filePath.includes('Modal.css')
      if (!isModalFile) {
        return
      }

      const cssContent = readFileSync(filePath, 'utf-8')

      try {
        const root = postcss.parse(cssContent)

        root.walkRules((rule) => {
          // Check if this is an overlay class
          const isOverlay = rule.selectors.some((selector) =>
            selector.includes('-overlay')
          )

          if (isOverlay) {
            rule.walkDecls('background-color', (decl) => {
              const value = decl.value
              // Extract opacity from rgba() values
              const rgbaMatch = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
              if (rgbaMatch) {
                const opacity = rgbaMatch[4]
                const className = rule.selectors[0].replace('.', '')
                const relativeFile = filePath.replace(srcDir, 'src')
                overlayOpacities.push({ file: relativeFile, className, opacity })
              }
            })
          }
        })
      } catch (error) {
        console.error('Error parsing CSS:', error)
      }
    })

    // Check that all modal overlays use either 0.98 (standard) or 0.45 (CreatePickModal)
    const invalidOpacities = overlayOpacities.filter(
      ({ opacity }) => opacity !== '0.98' && opacity !== '0.45'
    )

    if (invalidOpacities.length > 0) {
      const errorMessage = [
        '\n❌ Found modal overlays with non-standard opacity values:',
        '',
        ...invalidOpacities.map(({ file, className, opacity }) => {
          return `  ${file}\n  Class: .${className}\n  Opacity: ${opacity} (expected: 0.98 or 0.45)`
        }),
        '',
        '💡 Standard: Use rgba(15, 23, 42, 0.98) for most modals',
        '   Exception: CreatePickModal uses rgba(15, 23, 42, 0.45) for lighter overlay',
      ].join('\n')

      expect(invalidOpacities, errorMessage).toEqual([])
    }

    expect(invalidOpacities).toEqual([])
  })
})

describe('CSS Duplication Prevention - Phase 2', () => {
  it('should not have modal CSS rules in non-modal files', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    // Modal class patterns that should ONLY appear in modal-specific CSS files
    const modalClassPatterns = [
      /-overlay$/,
      /-dialog$/,
      /-modal$/,
    ]

    // Whitelist: Files that are allowed to have modal-style classes
    // (e.g., confirmation dialogs that use similar patterns)
    const whitelistedFiles = [
      'src/Components/HeaderComponents/Styles/ClearMonthBtn.css',
    ]

    const violations: Array<{ file: string; className: string }> = []

    cssFiles.forEach((filePath) => {
      // Skip modal files - they're allowed to have modal classes
      const isModalFile = filePath.includes('Modal.css')
      if (isModalFile) {
        return
      }

      const relativeFile = filePath.replace(srcDir, 'src')

      // Skip whitelisted files
      if (whitelistedFiles.includes(relativeFile)) {
        return
      }

      const cssContent = readFileSync(filePath, 'utf-8')
      const classNames = extractClassNames(cssContent)

      classNames.forEach((className) => {
        const isModalClass = modalClassPatterns.some((pattern) =>
          pattern.test(className)
        )

        if (isModalClass) {
          violations.push({ file: relativeFile, className })
        }
      })
    })

    if (violations.length > 0) {
      const errorMessage = [
        '\n❌ Found modal CSS classes in non-modal files:',
        '',
        ...violations.map(({ file, className }) => {
          return `  File: ${file}\n  Class: .${className}`
        }),
        '',
        '💡 Fix: Modal classes (ending in -overlay, -dialog, -modal) should only be in Modal.css files.',
        '   Move these classes to the appropriate modal CSS file.',
      ].join('\n')

      expect(violations, errorMessage).toEqual([])
    }

    expect(violations).toEqual([])
  })

  it('should have consistent modal overlay base color (15, 23, 42)', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    const invalidColors: Array<{ file: string; className: string; color: string }> = []

    cssFiles.forEach((filePath) => {
      // Only check modal files
      const isModalFile = filePath.includes('Modal.css')
      if (!isModalFile) {
        return
      }

      const cssContent = readFileSync(filePath, 'utf-8')

      try {
        const root = postcss.parse(cssContent)

        root.walkRules((rule) => {
          const isOverlay = rule.selectors.some((selector) =>
            selector.includes('-overlay')
          )

          if (isOverlay) {
            rule.walkDecls('background-color', (decl) => {
              const value = decl.value
              // Extract RGB values from rgba()
              const rgbaMatch = value.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)
              if (rgbaMatch) {
                const [, r, g, b] = rgbaMatch
                // Check if it's NOT the standard color (15, 23, 42)
                if (r !== '15' || g !== '23' || b !== '42') {
                  const className = rule.selectors[0].replace('.', '')
                  const relativeFile = filePath.replace(srcDir, 'src')
                  invalidColors.push({
                    file: relativeFile,
                    className,
                    color: `rgba(${r}, ${g}, ${b}, ...)`,
                  })
                }
              }
            })
          }
        })
      } catch (error) {
        console.error('Error parsing CSS:', error)
      }
    })

    if (invalidColors.length > 0) {
      const errorMessage = [
        '\n❌ Found modal overlays with non-standard base color:',
        '',
        ...invalidColors.map(({ file, className, color }) => {
          return `  ${file}\n  Class: .${className}\n  Color: ${color} (expected: rgba(15, 23, 42, ...))`
        }),
        '',
        '💡 Standard: All modal overlays should use rgba(15, 23, 42, opacity)',
        '   Only the opacity value should vary (0.98 for standard, 0.45 for CreatePickModal)',
      ].join('\n')

      expect(invalidColors, errorMessage).toEqual([])
    }

    expect(invalidColors).toEqual([])
  })

  it('should have backdrop-filter blur on all modal overlays', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    // Whitelist: Modals that intentionally don't use backdrop-filter
    // (e.g., CreatePickModal has a lighter design without blur)
    const whitelistedModals = [
      'src/Pages/Welcome/Styles/CreatePickModal.css',
    ]

    const missingBlur: Array<{ file: string; className: string }> = []

    cssFiles.forEach((filePath) => {
      // Only check modal files
      const isModalFile = filePath.includes('Modal.css')
      if (!isModalFile) {
        return
      }

      const relativeFile = filePath.replace(srcDir, 'src')

      // Skip whitelisted modals
      if (whitelistedModals.includes(relativeFile)) {
        return
      }

      const cssContent = readFileSync(filePath, 'utf-8')

      try {
        const root = postcss.parse(cssContent)

        root.walkRules((rule) => {
          const isOverlay = rule.selectors.some((selector) =>
            selector.includes('-overlay')
          )

          if (isOverlay) {
            let hasBackdropFilter = false

            rule.walkDecls('backdrop-filter', (decl) => {
              if (decl.value.includes('blur')) {
                hasBackdropFilter = true
              }
            })

            if (!hasBackdropFilter) {
              const className = rule.selectors[0].replace('.', '')
              missingBlur.push({ file: relativeFile, className })
            }
          }
        })
      } catch (error) {
        console.error('Error parsing CSS:', error)
      }
    })

    if (missingBlur.length > 0) {
      const errorMessage = [
        '\n❌ Found modal overlays without backdrop-filter blur:',
        '',
        ...missingBlur.map(({ file, className }) => {
          return `  ${file}\n  Class: .${className}`
        }),
        '',
        '💡 Standard: All modal overlays should have backdrop-filter: blur(8px)',
        '   This creates a modern depth effect and improves readability',
      ].join('\n')

      expect(missingBlur, errorMessage).toEqual([])
    }

    expect(missingBlur).toEqual([])
  })

  it('should have consistent z-index values for modal overlays', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    // Whitelist: Base Modal.css uses CSS custom properties for dynamic z-index
    const whitelistedFiles = [
      'src/Components/Modal/Modal.css',
    ]

    const zIndexValues: Array<{ file: string; className: string; zIndex: string }> = []

    cssFiles.forEach((filePath) => {
      // Only check modal files
      const isModalFile = filePath.includes('Modal.css')
      if (!isModalFile) {
        return
      }

      const relativeFile = filePath.replace(srcDir, 'src')

      // Skip whitelisted files
      if (whitelistedFiles.includes(relativeFile)) {
        return
      }

      const cssContent = readFileSync(filePath, 'utf-8')

      try {
        const root = postcss.parse(cssContent)

        root.walkRules((rule) => {
          const isOverlay = rule.selectors.some((selector) =>
            selector.includes('-overlay')
          )

          if (isOverlay) {
            rule.walkDecls('z-index', (decl) => {
              const className = rule.selectors[0].replace('.', '')
              zIndexValues.push({
                file: relativeFile,
                className,
                zIndex: decl.value,
              })
            })
          }
        })
      } catch (error) {
        console.error('Error parsing CSS:', error)
      }
    })

    // Check that z-index is either 100 (standard), 101 (LanguageSelectionModal), or 60 (CreatePickModal)
    const invalidZIndex = zIndexValues.filter(
      ({ zIndex }) => zIndex !== '100' && zIndex !== '101' && zIndex !== '60'
    )

    if (invalidZIndex.length > 0) {
      const errorMessage = [
        '\n❌ Found modal overlays with non-standard z-index values:',
        '',
        ...invalidZIndex.map(({ file, className, zIndex }) => {
          return `  ${file}\n  Class: .${className}\n  z-index: ${zIndex} (expected: 100 or 101)`
        }),
        '',
        '💡 Standard: Use z-index: 100 for most modals',
        '   Exception: LanguageSelectionModal uses z-index: 101 (appears during first launch)',
        '   Exception: CreatePickModal uses z-index: 60 (lower priority modal)',
      ].join('\n')

      expect(invalidZIndex, errorMessage).toEqual([])
    }

    expect(invalidZIndex).toEqual([])
  })

  it('should have consistent border-radius for modal dialogs', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    const borderRadiusValues: Array<{ file: string; className: string; borderRadius: string }> = []

    cssFiles.forEach((filePath) => {
      // Only check modal files
      const isModalFile = filePath.includes('Modal.css')
      if (!isModalFile) {
        return
      }

      const cssContent = readFileSync(filePath, 'utf-8')

      try {
        const root = postcss.parse(cssContent)

        root.walkRules((rule) => {
          const isDialog = rule.selectors.some((selector) =>
            selector.includes('-dialog')
          )

          if (isDialog) {
            rule.walkDecls('border-radius', (decl) => {
              const className = rule.selectors[0].replace('.', '')
              const relativeFile = filePath.replace(srcDir, 'src')
              borderRadiusValues.push({
                file: relativeFile,
                className,
                borderRadius: decl.value,
              })
            })
          }
        })
      } catch (error) {
        console.error('Error parsing CSS:', error)
      }
    })

    // Check that border-radius is 18px (standard)
    const invalidBorderRadius = borderRadiusValues.filter(
      ({ borderRadius }) => borderRadius !== '18px'
    )

    if (invalidBorderRadius.length > 0) {
      const errorMessage = [
        '\n❌ Found modal dialogs with non-standard border-radius:',
        '',
        ...invalidBorderRadius.map(({ file, className, borderRadius }) => {
          return `  ${file}\n  Class: .${className}\n  border-radius: ${borderRadius} (expected: 18px)`
        }),
        '',
        '💡 Standard: All modal dialogs should use border-radius: 18px',
        '   This ensures consistent rounded corners across all modals',
      ].join('\n')

      expect(invalidBorderRadius, errorMessage).toEqual([])
    }

    expect(invalidBorderRadius).toEqual([])
  })

  it('should have consistent button border-radius (pill buttons)', () => {
    const srcDir = join(process.cwd(), 'src')
    const cssFiles = findCSSFiles(srcDir)

    // Whitelist: Button classes that intentionally use different border-radius
    // (e.g., circular icon buttons)
    const whitelistedButtons = [
      'onboarding-back-button', // Circular back button (50%)
    ]

    const buttonBorderRadius: Array<{ file: string; className: string; borderRadius: string }> = []

    cssFiles.forEach((filePath) => {
      // Only check modal files
      const isModalFile = filePath.includes('Modal.css')
      if (!isModalFile) {
        return
      }

      const cssContent = readFileSync(filePath, 'utf-8')

      try {
        const root = postcss.parse(cssContent)

        root.walkRules((rule) => {
          const isButton = rule.selectors.some((selector) =>
            selector.includes('-button') && !selector.includes(':')
          )

          if (isButton) {
            rule.walkDecls('border-radius', (decl) => {
              const className = rule.selectors[0].replace('.', '')
              const relativeFile = filePath.replace(srcDir, 'src')

              // Skip whitelisted buttons
              if (whitelistedButtons.includes(className)) {
                return
              }

              buttonBorderRadius.push({
                file: relativeFile,
                className,
                borderRadius: decl.value,
              })
            })
          }
        })
      } catch (error) {
        console.error('Error parsing CSS:', error)
      }
    })

    // Check that button border-radius is 999px (pill buttons)
    const invalidButtonRadius = buttonBorderRadius.filter(
      ({ borderRadius }) => borderRadius !== '999px'
    )

    if (invalidButtonRadius.length > 0) {
      const errorMessage = [
        '\n❌ Found modal buttons with non-standard border-radius:',
        '',
        ...invalidButtonRadius.map(({ file, className, borderRadius }) => {
          return `  ${file}\n  Class: .${className}\n  border-radius: ${borderRadius} (expected: 999px)`
        }),
        '',
        '💡 Standard: All modal buttons should use border-radius: 999px (pill buttons)',
        '   This creates the modern pill-shaped button design',
      ].join('\n')

      expect(invalidButtonRadius, errorMessage).toEqual([])
    }

    expect(invalidButtonRadius).toEqual([])
  })
})

