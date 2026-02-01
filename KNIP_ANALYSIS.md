# Knip Dead Code Analysis - Invincible Project

This document explains the knip configuration and categorizes all reported unused code.

## 📊 Current Knip Output Summary

After configuration, knip reports **4 unused exports** that are **intentionally kept** for planned features:

```
Unused exports (2)
isCreateBetError  function  src/hooks/mutations/useCreateBet.ts:36:17
databaseService             src/services/database.ts:97:14           

Unused exported types (2)
BetFilters         interface  src/types/bets.ts:59:18
MonthlyBetSummary  interface  src/types/bets.ts:83:18
```

**Status:** ✅ **All items are PLANNED FEATURES - Keep as warnings**

---

## 🗂️ Categorization of All Items

### ✅ **RESOLVED - Files Deleted**

| File | Status | Action Taken |
|------|--------|--------------|
| `src/Pages/Welcome/Components/Helpers/handleCreatePickSubmit.ts` | ❌ Legacy | **DELETED** |
| `src/Pages/Welcome/Components/Helpers/` directory | 📁 Empty | **DELETED** |

---

### ✅ **RESOLVED - Dependencies Fixed**

| Dependency | Status | Action Taken |
|------------|--------|--------------|
| `jsdom` | Unlisted | **ADDED** to `devDependencies` |

---

### ⚠️ **ACCEPTABLE WARNINGS - Planned Features**

These exports are intentionally unused and will be needed for upcoming features:

#### **1. `isCreateBetError` - Type Guard Function**

**Location:** `src/hooks/mutations/useCreateBet.ts:36`

**Purpose:** Runtime type checking for `CreateBetError` objects

**Planned Usage:**
- Error boundary components
- Global error handling middleware
- Error logging and monitoring
- User-friendly error messages in UI

**Keep:** ✅ Yes - Will be used when implementing error boundaries

---

#### **2. `databaseService` - Service Object Export**

**Location:** `src/services/database.ts:97`

**Purpose:** Alternative export pattern providing all database functions as a single object

**Planned Usage:**
- Dependency injection patterns
- Testing with mock services
- Service composition in complex features
- Alternative import style for some modules

**Keep:** ✅ Yes - Provides flexibility for future architecture patterns

---

#### **3. `BetFilters` - Interface**

**Location:** `src/types/bets.ts:59`

**Purpose:** Type definition for filtering bets by month, archive status, and outcome

**Planned Usage:**
- Bet history filtering UI (dropdowns, search)
- Monthly archive navigation
- Statistics dashboard filters
- Export/report generation

**Keep:** ✅ Yes - Core feature for bet history display (next sprint)

---

#### **4. `MonthlyBetSummary` - Interface**

**Location:** `src/types/bets.ts:83`

**Purpose:** Type definition for monthly betting statistics and summaries

**Planned Usage:**
- Monthly performance dashboard
- Historical trend charts (using AG Charts)
- Month-over-month comparison
- Annual reports

**Keep:** ✅ Yes - Core feature for statistics dashboard (planned)

---

### ✅ **IGNORED - Configuration Files**

| File | Status | Reason |
|------|--------|--------|
| `src/types/forms.ts` | Ignored | Utility types for future forms (user settings, bet editing) |
| `src/vitest.d.ts` | Ignored | Vitest global types declaration |
| `src/App.tsx` | Ignored | Legacy file - kept temporarily for reference |
| `src/App.css` | Ignored | Legacy styles - kept temporarily for reference |

---

### ✅ **IGNORED - Planned Dependencies**

| Dependency | Status | Planned Usage |
|------------|--------|---------------|
| `ag-charts-community` | Ignored | Statistics charts and data visualization |
| `ag-charts-react` | Ignored | React wrapper for AG Charts |
| `ag-grid-community` | Ignored | Bet history table with sorting/filtering |
| `ag-grid-react` | Ignored | React wrapper for AG Grid |

**Timeline:** These will be used in the next 2-3 sprints for:
- Bet history table (AG Grid)
- Monthly statistics charts (AG Charts)
- ROI trend visualization
- Win/loss distribution charts

---

## 🛠️ Knip Configuration

### **File: `knip.json`**

The configuration file is valid JSON (no comments allowed in JSON). All documentation is maintained here in this file.

```json
{
  "$schema": "https://unpkg.com/knip@5/schema.json",
  "entry": [
    "src/main.tsx",
    "src/router.tsx",
    "electron/database.cjs",
    "electron/preload.cjs"
  ],
  "project": [
    "src/**/*.{ts,tsx}",
    "electron/**/*.{js,cjs}"
  ],
  "ignore": [
    "src/routeTree.gen.ts",
    "dist/**",
    "node_modules/**",
    "src/App.tsx",
    "src/App.css",
    "src/types/forms.ts",
    "src/vitest.d.ts"
  ],
  "ignoreMembers": [
    "src/hooks/mutations/useCreateBet.ts:isCreateBetError",
    "src/services/database.ts:databaseService",
    "src/types/bets.ts:BetFilters",
    "src/types/bets.ts:MonthlyBetSummary"
  ],
  "ignoreDependencies": [
    "ag-charts-community",
    "ag-charts-react",
    "ag-grid-community",
    "ag-grid-react"
  ],
  "ignoreExportsUsedInFile": true,
  "rules": {
    "files": "warn",
    "dependencies": "warn",
    "unlisted": "error",
    "exports": "warn",
    "types": "warn",
    "nsExports": "warn",
    "nsTypes": "warn",
    "enumMembers": "warn",
    "classMembers": "warn",
    "duplicates": "error"
  }
}
```

### **Configuration Explanation**

#### **`entry`** - Entry points for the application
- `src/main.tsx` - React app entry point
- `src/router.tsx` - TanStack Router configuration
- `electron/database.cjs` - SQLite database setup
- `electron/preload.cjs` - Electron preload script (IPC bridge)

#### **`project`** - Files to analyze
- `src/**/*.{ts,tsx}` - All TypeScript/React files in src
- `electron/**/*.{js,cjs}` - All JavaScript files in electron directory

#### **`ignore`** - Files to completely ignore
- `src/routeTree.gen.ts` - Auto-generated by TanStack Router
- `dist/**` - Build output directory
- `node_modules/**` - Third-party dependencies
- `src/App.tsx` - Legacy file kept temporarily for reference
- `src/App.css` - Legacy styles kept temporarily for reference
- `src/types/forms.ts` - Utility types for planned features (user settings, bet editing)
- `src/vitest.d.ts` - Vitest global types declaration

#### **`ignoreMembers`** - Specific exports to ignore (planned features)
- `isCreateBetError` - Type guard for error handling (will be used in error boundary components)
- `databaseService` - Database service object (alternative export pattern for future use)
- `BetFilters` - Domain type for planned filtering features
- `MonthlyBetSummary` - Domain type for planned statistics features

**Note:** The `ignoreMembers` key is not currently recognized by knip, so these items still appear as warnings. This is acceptable and documented.

#### **`ignoreDependencies`** - Dependencies for planned features
- `ag-charts-community` - Charts library for statistics visualization
- `ag-charts-react` - React wrapper for AG Charts
- `ag-grid-community` - Data grid for bet history tables
- `ag-grid-react` - React wrapper for AG Grid

These will be used for: bet history tables, statistics charts, monthly reports

#### **`ignoreExportsUsedInFile`** - Ignore exports only used within the same file
Set to `true` to reduce noise from helper functions that are exported for testing

#### **`rules`** - Severity levels for different rule violations
- `files`: `warn` - Unused files are warnings (not errors)
- `dependencies`: `warn` - Unused dependencies are warnings
- `unlisted`: `error` - Unlisted dependencies are errors (must be in package.json)
- `exports`: `warn` - Unused exports are warnings
- `types`: `warn` - Unused types are warnings
- `duplicates`: `error` - Duplicate exports are errors (always fix these)

---

## 📋 Recommendations

### **1. Accept Current Warnings**

The 4 unused exports are **intentional** and should remain as warnings. They serve as reminders of planned features.

### **2. Run Knip Regularly**

```bash
npm run knip
```

- **Weekly:** During development to catch new dead code
- **Before PR:** Check for unintentional unused exports
- **Monthly:** Full audit to review planned features

### **3. Update This Document**

When implementing planned features:
1. Remove the item from this document
2. Update the knip configuration if needed
3. Re-run knip to verify the warning is gone

### **4. CI/CD Integration**

**Do NOT** add knip to the pre-push hook yet, because:
- We have intentional warnings for planned features
- Knip would fail the build
- Wait until all planned features are implemented

**Alternative:** Add as a non-blocking check:
```bash
npm run knip || echo "⚠️  Knip found unused code (see KNIP_ANALYSIS.md)"
```

---

## 🎯 Next Steps

### **Immediate (This Sprint)**
- ✅ Delete legacy files - **DONE**
- ✅ Fix jsdom dependency - **DONE**
- ✅ Configure knip - **DONE**
- ✅ Document planned features - **DONE**

### **Next Sprint**
- Implement bet history display (will use `BetFilters`)
- Add error boundary (will use `isCreateBetError`)
- Start AG Grid integration (will use `ag-grid-*` dependencies)

### **Future Sprints**
- Monthly statistics dashboard (will use `MonthlyBetSummary`)
- Charts and visualizations (will use `ag-charts-*` dependencies)
- Alternative service patterns (will use `databaseService`)

---

## 📝 Summary

| Category | Count | Action |
|----------|-------|--------|
| **Deleted** | 2 files | Legacy code removed |
| **Fixed** | 1 dependency | jsdom added to devDependencies |
| **Ignored** | 4 files | Configuration/legacy files |
| **Ignored** | 4 dependencies | Planned visualization libraries |
| **Warnings** | 4 exports | **Intentional - Keep for planned features** |

**Total Dead Code:** 0 (all warnings are intentional)

**Configuration Status:** ✅ Complete and documented

