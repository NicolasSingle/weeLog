import { useEffect, useRef, useCallback } from 'react'
import { getCurrentWindow, LogicalPosition } from '@tauri-apps/api/window'
import { TitleBar } from './TitleBar'
import { TabBar } from './TabBar'
import { SujiTab } from './SujiTab'
import { TodoTab } from './TodoTab'
import { ReportPage } from './ReportPage'
import { SettingsPage } from './SettingsPage'
import { useStore } from '@/lib/store'
import { Toaster } from './ui/sonner'

const EDGE_THRESHOLD = 10
const EXPAND_HOVER_DELAY = 500
const SHORTCUT_COOLDOWN = 300 // ms to prevent rapid toggle

export function FloatingWindow() {
  const activeTab = useStore((s) => s.activeTab)
  const isCollapsed = useStore((s) => s.isCollapsed)
  const collapsedEdge = useStore((s) => s.collapsedEdge)
  const lastWindowPosition = useStore((s) => s.lastWindowPosition)
  const setCollapsed = useStore((s) => s.setCollapsed)
  const setActiveTab = useStore((s) => s.setActiveTab)

  const hoverTimeoutRef = useRef<number | null>(null)
  const shortcutLastFiredRef = useRef<number>(0)

  const expandFromEdge = useCallback(async () => {
    const appWindow = getCurrentWindow()

    // Restore to last position if available
    if (lastWindowPosition) {
      await appWindow.setPosition(new LogicalPosition(lastWindowPosition.x, lastWindowPosition.y))
    }

    // Show and focus the window
    await appWindow.show()
    await appWindow.setFocus()

    setCollapsed(false, null)
  }, [lastWindowPosition, setCollapsed])

  // Handle mouse enter on collapsed bar
  const handleCollapsedBarMouseEnter = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      expandFromEdge()
    }, EXPAND_HOVER_DELAY)
  }

  // Handle mouse leave on collapsed bar
  const handleCollapsedBarMouseLeave = () => {
    if (hoverTimeoutRef.current !== null) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  // Setup window move listener
  useEffect(() => {
    let unlisten: (() => void) | undefined

    const setupListener = async () => {
      const appWindow = getCurrentWindow()

      unlisten = await appWindow.onMoved(async (event) => {
        // Don't process if already collapsed
        if (isCollapsed) return

        const position = event.payload

        // Check if window is near left edge
        if (position.x < EDGE_THRESHOLD) {
          // Store current position before hiding
          setCollapsed(true, 'left', { x: position.x, y: position.y })
          // Hide the main window
          await appWindow.hide()
        }
      })
    }

    setupListener()

    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  }, [isCollapsed, setCollapsed])

  // Cleanup hover timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current !== null) {
        clearTimeout(hoverTimeoutRef.current)
      }
    }
  }, [])

  // Setup global shortcut
  useEffect(() => {
    let mounted = true

    const setupShortcut = async () => {
      try {
        const { register, isRegistered } = await import('@tauri-apps/plugin-global-shortcut')

        const shortcut = 'CommandOrControl+Shift+D'
        const alreadyRegistered = await isRegistered(shortcut)

        if (!alreadyRegistered && mounted) {
          await register(shortcut, async () => {
            // Debounce: prevent rapid toggling
            const now = Date.now()
            if (now - shortcutLastFiredRef.current < SHORTCUT_COOLDOWN) {
              return
            }
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

    return () => {
      mounted = false
    }
  }, [])

  // If collapsed, render the collapsed bar
  if (isCollapsed && collapsedEdge) {
    return (
      <div
        className="fixed top-0 bottom-0 w-[20px] bg-muted flex flex-col items-center py-2 cursor-pointer transition-all duration-200 ease-out hover:bg-accent dark:bg-muted dark:hover:bg-accent"
        style={{
          [collapsedEdge]: 0,
        }}
        onMouseEnter={handleCollapsedBarMouseEnter}
        onMouseLeave={handleCollapsedBarMouseLeave}
      >
        {/* Arrow indicator */}
        <div
          className="flex-1 flex items-center"
          style={{
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
          }}
        >
          {collapsedEdge === 'left' ? (
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="text-muted-foreground">
              <path d="M2 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : (
            <svg width="8" height="12" viewBox="0 0 8 12" fill="none" className="text-muted-foreground" style={{ transform: 'rotate(180deg)' }}>
              <path d="M2 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-card rounded-lg shadow-lg overflow-hidden dark:bg-card" data-tauri-drag-region>
      <TitleBar />
      <TabBar />
      <div className="flex-1 overflow-hidden">
        {activeTab === 'suji' ? <SujiTab /> : activeTab === 'todo' ? <TodoTab /> : activeTab === 'report' ? <ReportPage /> : <SettingsPage onBack={() => setActiveTab('suji')} />}
      </div>
      <Toaster />
    </div>
  )
}
