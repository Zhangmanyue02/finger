# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An Electron application with React and TypeScript, using electron-vite as the build tool. This is a multi-view browser-like application with tab management capabilities.

## Commands

```bash
pnpm install        # Install dependencies
pnpm dev            # Start development server
pnpm build          # Build for production (runs typecheck first)
pnpm lint           # Run ESLint
pnpm format         # Format code with Prettier
pnpm typecheck      # Run TypeScript type checking
pnpm build:win      # Build Windows installer
pnpm build:mac      # Build macOS installer
pnpm build:linux    # Build Linux installer
```

## Architecture

### Process Model

The application follows Electron's multi-process architecture with three main parts:

1. **Main Process** (`src/main/`) - Node.js environment
   - Entry: `src/main/index.ts`
   - Window management via `MainWindow` class (uses `BaseWindow` with `WebContentsView`)
   - View management via `AppViewManager` and `ViewManager` classes
   - Tab management via `TabManager` class
   - IPC services registered through custom duplex communication system

2. **Renderer Process** (`src/renderer/`) - Browser environment
   - Entry: `src/renderer/src/main.tsx`
   - React 19 with react-router-dom (hash router)
   - Multiple views controlled by URL `?view=` parameter (e.g., `?view=navbar` for tabbar)
   - Tailwind CSS 4 for styling

3. **Preload Scripts** (`src/preload/`) - Bridge between main and renderer
   - Exposes APIs via `contextBridge.exposeInMainWorld`
   - Uses custom duplex IPC client (`RendererIpc`) for communication

### Key Modules

- **MainWindow** (`src/main/window/MainWindow.ts`) - Creates frameless `BaseWindow` with configurable dimensions
- **AppViewManager** (`src/main/views/AppViewManager.ts`) - Manages `tabbar` and `content` WebContentsView instances
- **TabManager** (`src/main/tabs/TabManager.ts`) - Manages browser-like tabs with navigation support
- **Duplex IPC** (`src/main/duplext/index.ts`, `src/shared/duplex/`) - Custom request/response/pub/sub IPC system

### IPC Communication

The app uses a custom duplex IPC system instead of standard Electron IPC:

- **Request/Response**: Renderer calls `window.api.serviceName.fnName(args)` → Main process handles → Returns result
- **Pub/Sub**: Main process can publish events; renderer can subscribe/unsubscribe

Services are defined in `src/main/ipc/` and registered via `registerIpcServices()`.

### Path Aliases

Configured in `electron.vite.config.ts`:
- `@` → `src/` (main/preload processes)
- `@renderer` → `src/renderer/src/`
- `@shared` → `src/shared/`

## Development Notes

- The app uses `WebContentsView` (Electron's modern view API) instead of `BrowserView` or `webContents`
- Window is frameless (`frame: false`) with a custom navbar view
- Development mode auto-opens DevTools for both navbar and content views
- Uses `@electron-toolkit/utils` for dev/prod environment detection
