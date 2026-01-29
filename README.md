# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Architecture

This application is built as an **Electron desktop application** with a React frontend and SQLite database for local data storage.

### Electron Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    ELECTRON APP                              │
│                                                              │
│  ┌────────────────────┐         ┌─────────────────────┐    │
│  │  RENDERER PROCESS  │         │   MAIN PROCESS      │    │
│  │  (Your React App)  │◄───────►│   (Node.js)         │    │
│  │                    │   IPC   │                     │    │
│  │  - UI Components   │         │  - SQLite Database  │    │
│  │  - React Hooks     │         │  - File System      │    │
│  │  - Forms           │         │  - Native APIs      │    │
│  └────────────────────┘         └─────────────────────┘    │
│         ▲                                  │                │
│         │                                  │                │
│         │                                  ▼                │
│         │                          invincible.db            │
│         │                          (SQLite file)            │
│         │                                                   │
│         └───────────── User sees this ─────────────────────┘
```

**Key Components:**

- **Renderer Process (Frontend)**: Your React application runs here in a browser-like environment. It handles UI rendering, user interactions, and form management. For security reasons, it cannot directly access the file system or native APIs.

- **Main Process (Backend)**: A Node.js process that acts as the application's backend. It manages the SQLite database, handles file system operations, and provides access to native Electron APIs.

- **IPC (Inter-Process Communication)**: A secure bridge that allows the React app to communicate with the main process. Think of it like API calls between frontend and backend.

- **SQLite Database**: A local database file (`invincible.db`) stored in the user's application data directory, managed entirely by the main process.

### Project Structure

```
invincible/
├── electron/
│   ├── main.cjs      ← Electron main process (your "backend")
│   └── preload.cjs   ← Security bridge (IPC communication)
├── src/              ← Your React app (frontend)
│   ├── Components/
│   ├── Pages/
│   ├── hooks/
│   ├── routes/
│   └── main.tsx
├── package.json      ← Project configuration with Electron scripts
└── README.md
```

### Development Workflow

Run the application in development mode:

```bash
npm run electron:dev
```

This command:
1. Starts the Vite development server for React (with hot reload)
2. Launches the Electron window
3. Loads your React app inside the Electron window

### Data Storage

- **Location**: User data is stored in platform-specific directories:
  - **macOS**: `~/Library/Application Support/invincible`
  - **Windows**: `%APPDATA%/invincible`
  - **Linux**: `~/.config/invincible`

- **Database**: SQLite database file (`invincible.db`) for storing bets, bankroll history, and user settings

- **Backup**: The database is a single file that can be easily backed up or exported

#### Database Schema

The application uses SQLite with the following tables:

| Table | Purpose |
|-------|---------|
| `bets` | Store all bet records (single & parlay) with details like bet type, outcome, amount, quota, market, selection, potential gains, and notes |
| `parlay_legs` | Store individual legs for parlay bets, including description, market, and quota for each leg |
| `bankroll_snapshots` | Track bankroll changes over time with timestamps, amounts, and reasons for changes (bet wins/losses, cashouts, manual adjustments) |
| `monthly_archives` | Store monthly statistics and metadata including total bets, wins, losses, net profit, ROI, and archive status |
| `user_settings` | Store user preferences and configuration in a flexible key-value format |
| `schema_version` | Track database schema version for managing migrations and ensuring compatibility |

**Key Features:**
- **Foreign key constraints** ensure referential integrity between tables
- **Check constraints** validate data (e.g., bet types, outcomes, positive amounts)
- **Indexes** on frequently queried columns (month_key, outcome, placed_at) for optimal performance
- **Soft archiving** using `is_archived` flag to maintain historical data without deletion
- **ACID transactions** guarantee data consistency and reliability

## Testing

Run unit tests:

```bash
npm test
```

Check for circular dependencies:

```bash
npm run depcheck
```

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
