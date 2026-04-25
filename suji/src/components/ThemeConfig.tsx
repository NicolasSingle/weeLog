import { useEffect } from 'react'
import { cn } from '@/lib/utils'
import { LazyStore } from '@tauri-apps/plugin-store'
import { useTheme } from './ThemeProvider'

type ThemeMode = 'light' | 'dark' | 'system'

const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'light', label: '浅色' },
  { value: 'dark', label: '深色' },
  { value: 'system', label: '跟随系统' },
]

const store = new LazyStore('settings.json')

export function ThemeConfig() {
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await store.init()
        const savedTheme = await store.get<ThemeMode>('themeMode')
        if (savedTheme) {
          setTheme(savedTheme)
        }
      } catch (error) {
        console.error('Failed to load theme settings:', error)
      }
    }
    loadSettings()
  }, [setTheme])

  const handleThemeChange = async (newTheme: ThemeMode) => {
    setTheme(newTheme)
    try {
      await store.set('themeMode', newTheme)
    } catch (error) {
      console.error('Failed to save theme settings:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => handleThemeChange(option.value)}
            className={cn(
              "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors border",
              theme === option.value
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-card text-foreground border-input hover:bg-accent dark:bg-card dark:text-foreground dark:border-input dark:hover:bg-accent"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <p className="text-sm font-medium text-foreground mb-3 dark:text-foreground">主题预览</p>
        <div className="grid grid-cols-2 gap-4">
          <div className={cn(
            "p-4 rounded-lg border-2 transition-colors",
            theme === 'light' || theme === 'system'
              ? "border-primary bg-card"
              : "border-border bg-muted"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded bg-primary"></div>
              <span className="text-sm font-medium text-foreground">浅色主题</span>
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          </div>

          <div className={cn(
            "p-4 rounded-lg border-2 transition-colors",
            theme === 'dark'
              ? "border-primary bg-card"
              : "border-border bg-muted"
          )}>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded bg-secondary"></div>
              <span className="text-sm font-medium text-foreground dark:text-foreground">深色主题</span>
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-muted rounded w-3/4"></div>
              <div className="h-2 bg-muted rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
