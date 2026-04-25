# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**速记日报 (Suji)** is a lightweight desktop work management tool built with Tauri 2 + React 19. It provides todo management and daily report functionality with a compact floating window mode.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4
- **Backend**: Tauri 2 (Rust)
- **State**: Zustand
- **Database**: SQLite via `tauri-plugin-sql`
- **UI**: dnd-kit (drag-and-drop), lucide-react (icons), sonner (toasts)

## Architecture

### Multi-Window Model

The app has two windows controlled by Tauri's window API:
- **main window** (1000x700): Full application with sidebar navigation (Todo, Report, Settings views)
- **float window** (320x240, always-on-top, frameless): Compact overlay, summoned via `Ctrl+Shift+D`

### Key Modules

| Path | Purpose |
|------|---------|
| `src/lib/store.ts` | Zustand global state (todos, reports, theme, UI state) |
| `src/lib/db.ts` | SQLite database initialization and table creation |
| `src/types/index.ts` | TypeScript interfaces: `Todo`, `Report` |
| `src/components/MainLayout.tsx` | Main window shell with sidebar navigation |
| `src/components/FloatingWindow.tsx` | Compact floating window UI |
| `src/components/TodoPage.tsx` | Todo management view |
| `src/components/ReportPage.tsx` | Daily reports with calendar/timeline views |
| `src-tauri/src/lib.rs` | Rust entry point, system tray setup, window management |

### Data Models

```typescript
interface Todo {
  id: string
  title: string
  description: string
  dueDate: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'expired'
  tags: string[]
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

interface Report {
  id: string
  date: string
  content: string
  tags: string[]
  todos: string[]
  createdAt: string
  updatedAt: string
}
```

## Common Commands

```bash
cd suji

# Frontend only
pnpm dev          # Start Vite dev server (port 5174)
pnpm build        # Build frontend for production

# Tauri (full app)
pnpm tauri dev    # Start Tauri development mode
pnpm tauri build  # Build production executable

# Dependencies
pnpm install      # Install Node dependencies
```

## Development Notes

- The Tauri context is configured in `src-tauri/tauri.conf.json` with two windows (labels: "main", "float")
- SQLite database (`suji_data.db`) is preloaded via `tauri-plugin-sql` plugin configuration
- Global shortcut `Ctrl+Shift+D` triggers the floating window (configured in system shortcuts plugin)
- Theme follows system preference by default, user can override in settings
- Window state (position, collapsed edge) is managed via Zustand and persisted through the store plugin
