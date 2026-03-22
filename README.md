# Invincible

A local-first sports betting tracker. Track bets, monitor your bankroll, and analyze performance — all stored privately on your machine.

## Stack

Electron · React 19 · TypeScript · SQLite · TanStack Router/Query · Vite

## Run

```bash
npm install
npm run electron:dev
```

## First Time Setup

1. Go to the [Releases](../../releases) page and download the latest `.dmg` (macOS) or `.exe` (Windows)
2. Open the installer and drag Invincible to your Applications folder
3. On first launch, macOS may warn you it's from an unidentified developer — go to **System Settings → Privacy & Security → Open Anyway**
4. Pick your language — supported: **English**, **Spanish**
5. Enter a username and your starting bankroll
6. You're on the dashboard — hit **Create pick** to log your first bet

Your data is stored locally on your machine. Nothing is sent anywhere.

## Test

```bash
npm test
```
