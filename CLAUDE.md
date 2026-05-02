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
- **float window** (480x48, always-on-top, frameless, non-resizable): Listary-style quick input bar, summoned via `Ctrl+Shift+D`. Supports three input modes:
  - `todo:内容` — creates a new todo
  - `done:关键词` — fuzzy matches pending todos to complete
  - plain text — appends to today's report

### Data Flow

1. `src/lib/db.ts` initializes SQLite and runs migrations (including `ALTER TABLE` for new columns)
2. `src/hooks/useTodos.ts` and `src/hooks/useReports.ts` load data from SQLite on mount, write to both SQLite and Zustand store
3. `src/lib/store.ts` holds in-memory state shared across all components
4. Components read from the Zustand store, call hook methods to persist changes

### Hybrid Report Mode

Completed todos automatically appear in the daily report timeline alongside quick notes. The `ReportEditor` merges `todos` (filtered by `completedAt` date) with `reports` (filtered by `date`) into a unified chronological timeline. No separate "generate report" step is needed.

### Key Modules

| Path | Purpose |
|------|---------|
| `src/lib/store.ts` | Zustand global state (todos, reports, UI state) |
| `src/lib/db.ts` | SQLite init, table creation, column migrations |
| `src/types/index.ts` | TypeScript interfaces: `Todo`, `Report` |
| `src/hooks/useTodos.ts` | CRUD + reorder/archive/expire logic for todos |
| `src/hooks/useReports.ts` | CRUD for reports, date-based lookup |
| `src/components/MainLayout.tsx` | Main window shell with sidebar navigation |
| `src/components/FloatingWindow.tsx` | Compact floating window with edge-snap |
| `src/components/CommandInput.tsx` | Listary-style input (todo/done/report modes) |
| `src/components/TodoList.tsx` | Filterable, sortable, draggable todo list |
| `src/components/ReportEditor.tsx` | Hybrid timeline: completed todos + quick notes |
| `src-tauri/src/lib.rs` | Rust entry point, tray icon, window management |

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
  sortOrder: number
  archived: boolean
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

- Tauri config is in `src-tauri/tauri.conf.json` with two window labels: "main" and "float"
- `productName` must be ASCII-only (currently "Suji") — WiX toolset for Windows MSI packaging does not support non-ASCII characters
- SQLite database (`suji_data.db`) is preloaded via `tauri-plugin-sql` plugin config
- Database schema changes use `ALTER TABLE` with try/catch in `db.ts` for backward compatibility
- Global shortcut `Ctrl+Shift+D` toggles the floating window
- Theme follows system preference by default, user can override in settings
- Window edge-snap: dragging the float window to screen edges collapses it into a thin bar
- Capabilities are defined in `src-tauri/capabilities/default.json` — both windows ("main", "float") must be listed for permissions to apply
