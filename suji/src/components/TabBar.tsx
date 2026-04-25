import { useStore } from '@/lib/store'
import { useTodos } from '@/hooks/useTodos'
import { Badge } from './ui/badge'
import { cn } from '@/lib/utils'
import { useMemo } from 'react'
import { Settings } from 'lucide-react'

export function TabBar() {
  const { activeTab, setActiveTab } = useStore()
  const { todos } = useTodos()

  const pendingCount = useMemo(() => {
    const today = new Date().toISOString().split('T')[0]
    return todos.filter(t => {
      if (t.status !== 'pending') return false
      if (!t.dueDate) return true
      return t.dueDate === today
    }).length
  }, [todos])

  return (
    <div className="flex border-b bg-muted dark:bg-muted dark:border-border">
      <button
        className={cn(
          "flex-1 px-4 py-2 text-sm font-medium transition-colors relative",
          activeTab === 'suji'
            ? "text-primary bg-card dark:bg-card"
            : "text-muted-foreground hover:text-foreground hover:bg-accent dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
        )}
        onClick={() => setActiveTab('suji')}
      >
        速记
      </button>
      <button
        className={cn(
          "flex-1 px-4 py-2 text-sm font-medium transition-colors relative flex items-center justify-center gap-1",
          activeTab === 'todo'
            ? "text-primary bg-card dark:bg-card"
            : "text-muted-foreground hover:text-foreground hover:bg-accent dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
        )}
        onClick={() => setActiveTab('todo')}
      >
        待办
        {pendingCount > 0 && (
          <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
            {pendingCount}
          </Badge>
        )}
      </button>
      <button
        className={cn(
          "flex-1 px-4 py-2 text-sm font-medium transition-colors relative",
          activeTab === 'report'
            ? "text-primary bg-card dark:bg-card"
            : "text-muted-foreground hover:text-foreground hover:bg-accent dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
        )}
        onClick={() => setActiveTab('report')}
      >
        日报
      </button>
      <button
        className={cn(
          "px-4 py-2 text-sm font-medium transition-colors",
          activeTab === 'settings'
            ? "text-primary bg-card dark:bg-card"
            : "text-muted-foreground hover:text-foreground hover:bg-accent dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent"
        )}
        onClick={() => setActiveTab('settings')}
      >
        <Settings className="h-4 w-4" />
      </button>
    </div>
  )
}
