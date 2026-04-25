import { getCurrentWindow } from '@tauri-apps/api/window'
import { Button } from './ui/button'
import { useTheme } from './ThemeProvider'

export function TitleBar() {
  const appWindow = getCurrentWindow()
  const { setTheme, resolvedTheme } = useTheme()

  const handleMinimize = async () => {
    await appWindow.minimize()
  }

  const handleClose = async () => {
    await appWindow.hide()
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <div
      className="h-8 flex items-center justify-between bg-muted px-2 select-none dark:bg-muted"
      data-tauri-drag-region
    >
      <span className="text-sm font-medium text-foreground dark:text-foreground" data-tauri-drag-region>
        速记日报
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={toggleTheme}
        >
          {resolvedTheme === 'dark' ? (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 2v8M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M6 1.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleMinimize}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleClose}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </Button>
      </div>
    </div>
  )
}
