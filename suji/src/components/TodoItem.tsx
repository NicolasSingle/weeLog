import { Checkbox } from './ui/checkbox'
import { useTodos } from '@/hooks/useTodos'
import { useReports } from '@/hooks/useReports'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
}

export function TodoItem({ todo }: TodoItemProps) {
  const { toggleTodo } = useTodos()
  const { createReport } = useReports()

  const handleToggle = async () => {
    await toggleTodo(todo.id)
    if (todo.status !== 'completed') {
      await createReport(`✓ 完成了：${todo.title}`)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
      default: return 'border-l-border dark:border-l-muted-foreground'
    }
  }

  return (
    <div
      className={`flex items-start gap-2 p-2 rounded bg-accent border-l-2 ${getPriorityColor(todo.priority)} dark:bg-accent ${
        todo.status === 'completed' ? 'opacity-60' : ''
      }`}
    >
      <Checkbox
        checked={todo.status === 'completed'}
        onChange={handleToggle}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className={`text-sm ${todo.status === 'completed' ? 'line-through text-muted-foreground dark:text-muted-foreground' : 'text-foreground dark:text-foreground'}`}>
          {todo.title}
        </div>
        {todo.status === 'completed' && todo.completedAt && (
          <div className="text-xs text-muted-foreground mt-0.5 dark:text-muted-foreground">
            {formatDistanceToNow(new Date(todo.completedAt), { addSuffix: true, locale: zhCN })}
          </div>
        )}
      </div>
    </div>
  )
}
