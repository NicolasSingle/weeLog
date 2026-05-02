import { useState, useEffect } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { Button } from './ui/button'
import { useTheme } from './ThemeProvider'
import { useStore } from '@/lib/store'
import { TodoPage } from './TodoPage'
import { ReportPage } from './ReportPage'
import { SettingsPage } from './SettingsPage'
import { Toaster } from './ui/sonner'
import {
  ListTodo,
  FileText,
  Settings,
  Sun,
  Moon,
  Minus,
  X,
  Maximize2,
} from 'lucide-react'

type MainView = 'todo' | 'report' | 'settings'

export function MainLayout() {
  const [activeView, setActiveView] = useState<MainView>('todo')
  const appWindow = getCurrentWindow()
  const { setTheme, resolvedTheme } = useTheme()
  const todos = useStore((s) => s.todos)

  // Count today's incomplete todos
  const todayCount = todos.filter((t) => {
    if (t.status === 'completed') return false
    if (!t.dueDate) return false
    const today = new Date().toISOString().split('T')[0]
    return t.dueDate.startsWith(today)
  }).length

  const handleMinimize = () => appWindow.minimize()
  const handleMaximize = () => appWindow.toggleMaximize()
  const handleClose = () => appWindow.hide()
  const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.ctrlKey || e.metaKey) {
        if (e.key === '1') { e.preventDefault(); setActiveView('todo') }
        else if (e.key === '2') { e.preventDefault(); setActiveView('report') }
        else if (e.key === '3') { e.preventDefault(); setActiveView('settings') }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const navItems = [
    { id: 'todo' as MainView, label: '待办', icon: ListTodo, badge: todayCount },
    { id: 'report' as MainView, label: '日报', icon: FileText, badge: 0 },
    { id: 'settings' as MainView, label: '设置', icon: Settings, badge: 0 },
  ]

  return (
    <div className="h-screen w-screen flex flex-col bg-background dark:bg-background">
      {/* Title Bar */}
      <div
        className="h-9 flex items-center justify-between bg-muted px-3 select-none dark:bg-muted"
        data-tauri-drag-region
      >
        <span
          className="text-sm font-medium text-foreground dark:text-foreground"
          data-tauri-drag-region
        >
          速记日报
        </span>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={toggleTheme}>
            {resolvedTheme === 'dark' ? (
              <Sun className="h-3.5 w-3.5" />
            ) : (
              <Moon className="h-3.5 w-3.5" />
            )}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMinimize}>
            <Minus className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleMaximize}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleClose}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <nav className="w-48 bg-card border-r border-border flex flex-col dark:bg-card dark:border-border">
          <div className="flex-1 py-2">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeView === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors relative ${
                    isActive
                      ? 'text-foreground bg-accent dark:text-foreground dark:bg-accent'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/50 dark:text-muted-foreground dark:hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.badge > 0 && (
                    <span className="ml-auto bg-primary text-primary-foreground text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                      {item.badge}
                    </span>
                  )}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-r" />
                  )}
                </button>
              )
            })}
          </div>

          {/* Bottom hint */}
          <div className="p-3 border-t border-border dark:border-border">
            <p className="text-xs text-muted-foreground dark:text-muted-foreground">
              Ctrl+Shift+D 唤起悬浮窗
            </p>
          </div>
        </nav>

        {/* Content Area */}
        <main className="flex-1 overflow-hidden">
          {activeView === 'todo' && <TodoPage />}
          {activeView === 'report' && <ReportPage />}
          {activeView === 'settings' && <SettingsPage />}
        </main>
      </div>

      <Toaster />
    </div>
  )
}
