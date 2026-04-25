import { Input } from './ui/input'

interface Shortcut {
  action: string
  keys: string
}

const SHORTCUTS: Shortcut[] = [
  { action: '唤起/隐藏悬浮窗口', keys: 'Ctrl+Shift+D' },
  { action: '新建待办', keys: 'Ctrl+Shift+T' },
  { action: '新建日报', keys: 'Ctrl+Shift+N' },
]

export function ShortcutConfig() {
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground mb-4 dark:text-muted-foreground">
        快捷键自定义将在 Phase 2 中开放，当前显示默认快捷键
      </p>
      {SHORTCUTS.map((shortcut, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm text-foreground dark:text-foreground">{shortcut.action}</span>
          <Input
            type="text"
            value={shortcut.keys}
            readOnly
            className="w-40 text-center bg-muted cursor-not-allowed dark:bg-muted dark:text-muted-foreground"
          />
        </div>
      ))}
    </div>
  )
}
