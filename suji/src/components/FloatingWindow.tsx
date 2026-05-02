import { useEffect, useRef, useCallback } from 'react'
import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window'
import { CommandInput } from './CommandInput'
import { useStore } from '@/lib/store'
import { X, ChevronRight, ChevronLeft } from 'lucide-react'

const EDGE_THRESHOLD = 10
const EXPAND_HOVER_DELAY = 500
const SHORTCUT_COOLDOWN = 300

export function FloatingWindow() {
  const isCollapsed = useStore((s) => s.isCollapsed)
  const collapsedEdge = useStore((s) => s.collapsedEdge)
  const lastWindowPosition = useStore((s) => s.lastWindowPosition)
  const setCollapsed = useStore((s) => s.setCollapsed)

  const hoverTimeoutRef = useRef<number | null>(null)
  const shortcutLastFiredRef = useRef<number>(0)

  const expandFromEdge = useCallback(async () => {
    const appWindow = getCurrentWindow()
    if (lastWindowPosition) {
      await appWindow.setPosition(new LogicalPosition(lastWindowPosition.x, lastWindowPosition.y))
    }
    await appWindow.show()
    await appWindow.setFocus()
    setCollapsed(false, null)
  }, [lastWindowPosition, setCollapsed])

  const handleCollapsedBarMouseEnter = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      expandFromEdge()
    }, EXPAND_HOVER_DELAY)
  }

  const handleCollapsedBarMouseLeave = () => {
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  // Window move listener for edge snap
  useEffect(() => {
    let unlisten: (() => void) | undefined

    const setupListener = async () => {
      const appWindow = getCurrentWindow()

      unlisten = await appWindow.onMoved(async (event) => {
        if (isCollapsed) return
        const position = event.payload

        // Left edge snap
        if (position.x < EDGE_THRESHOLD) {
          setCollapsed(true, 'left', { x: position.x, y: position.y })
          await appWindow.hide()
        }
        // Right edge snap - requires screen width, approximate with large threshold
        else if (position.x > 1920 - EDGE_THRESHOLD) {
          setCollapsed(true, 'right', { x: position.x, y: position.y })
          await appWindow.hide()
        }
      })
    }

    setupListener()
    return () => { if (unlisten) unlisten() }
  }, [isCollapsed, setCollapsed])

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Global shortcut Ctrl+Shift+D
  useEffect(() => {
    let mounted = true

    const setupShortcut = async () => {
      try {
        const { register, isRegistered } = await import('@tauri-apps/plugin-global-shortcut')
        const shortcut = 'CommandOrControl+Shift+D'
        const alreadyRegistered = await isRegistered(shortcut)

        if (!alreadyRegistered && mounted) {
          await register(shortcut, async () => {
            const now = Date.now()
            if (now - shortcutLastFiredRef.current < SHORTCUT_COOLDOWN) return
            shortcutLastFiredRef.current = now

            const appWindow = getCurrentWindow()
            try {
              const isVisible = await appWindow.isVisible()
              if (isVisible) {
                await appWindow.hide()
              } else {
                await appWindow.show()
                await appWindow.setFocus()
              }
            } catch (e) {
              console.error('Shortcut toggle error:', e)
            }
          })
        }
      } catch (e) {
        console.error('Failed to register shortcut:', e)
      }
    }

    setupShortcut()
    return () => { mounted = false }
  }, [])

  // Handle window blur - auto hide
  useEffect(() => {
    let unlisten: (() => void) | undefined

    const setupBlur = async () => {
      const appWindow = getCurrentWindow()
      unlisten = await appWindow.onFocusChanged(async (event) => {
        // If focus is lost and window is visible, hide it
        if (!event.payload && !(await appWindow.isVisible())) return
        if (!event.payload) {
          await appWindow.hide()
        }
      })
    }

    setupBlur()
    return () => { if (unlisten) unlisten() }
  }, [])

  // Collapsed bar
  if (isCollapsed && collapsedEdge) {
    const EdgeIcon = collapsedEdge === 'left' ? ChevronRight : ChevronLeft
    return (
      <div
        className="fixed top-0 bottom-0 w-5 bg-muted/80 flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
        style={{ [collapsedEdge]: 0 }}
        onMouseEnter={handleCollapsedBarMouseEnter}
        onMouseLeave={handleCollapsedBarMouseLeave}
      >
        <EdgeIcon className="h-3 w-3 text-muted-foreground" />
      </div>
    )
  }

  // Main input window
  const handleClose = async () => {
    const appWindow = getCurrentWindow()
    await appWindow.hide()
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-card rounded-xl shadow-2xl overflow-hidden border border-border/50">
      {/* Drag region + close button */}
      <div className="flex items-center h-0 relative" data-tauri-drag-region>
        <button
          onClick={handleClose}
          className="absolute right-1.5 top-1.5 p-0.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Command input */}
      <div className="flex-1">
        <CommandInput />
      </div>
    </div>
  )
}
