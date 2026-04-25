import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO, isToday, isTomorrow, isThisWeek, isPast, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Checkbox } from './ui/checkbox'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types'

interface TodoListItemProps {
  todo: Todo
  isSelected: boolean
  onClick: () => void
  onToggle: () => void
}

const priorityColors = {
  high: 'border-l-[#F53F3F]',
  medium: 'border-l-[#FF7D00]',
  low: 'border-l-[#00B42A]',
}

const priorityDotColors = {
  high: 'bg-[#F53F3F]',
  medium: 'bg-[#FF7D00]',
  low: 'bg-[#00B42A]',
}

function formatDueDate(dueDate: string | null): string | null {
  if (!dueDate) return null
  try {
    const date = parseISO(dueDate)
    if (!isValid(date)) return null
    if (isToday(date)) return '今天'
    if (isTomorrow(date)) return '明天'
    if (isThisWeek(date)) return format(date, 'EEEE', { locale: zhCN })
    return format(date, 'M月d日', { locale: zhCN })
  } catch {
    return null
  }
}

function isOverdue(dueDate: string | null, status: string): boolean {
  if (!dueDate || status === 'completed') return false
  try {
    const date = parseISO(dueDate)
    return isPast(date) && !isToday(date)
  } catch {
    return false
  }
}

export function TodoListItem({ todo, isSelected, onClick, onToggle }: TodoListItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: todo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dueDateText = formatDueDate(todo.dueDate)
  const overdue = isOverdue(todo.dueDate, todo.status)

  const handleCheckboxChange = (e: React.ChangeEvent) => {
    e.stopPropagation()
    onToggle()
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={cn(
        'flex items-start gap-2 p-3 bg-card rounded-lg shadow-sm border-l-4 cursor-pointer transition-all dark:bg-card',
        priorityColors[todo.priority],
        isSelected && 'ring-2 ring-primary ring-offset-1',
        isDragging && 'opacity-50 shadow-lg',
        todo.status === 'completed' && 'opacity-60'
      )}
    >
      <Checkbox
        checked={todo.status === 'completed'}
        onChange={handleCheckboxChange}
        className="mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className={cn(
          'text-sm truncate',
          todo.status === 'completed' ? 'line-through text-muted-foreground dark:text-muted-foreground' : 'text-foreground dark:text-foreground'
        )}>
          {todo.title}
        </div>
        <div className="flex items-center gap-2 mt-1">
          {dueDateText && (
            <span className={cn(
              'text-xs',
              overdue ? 'text-[#F53F3F]' : 'text-muted-foreground dark:text-muted-foreground'
            )}>
              {overdue && '已过期 '}
              {dueDateText}
            </span>
          )}
          {todo.tags.length > 0 && (
            <span className="text-xs text-muted-foreground dark:text-muted-foreground">
              {todo.tags.slice(0, 2).join(', ')}
              {todo.tags.length > 2 && `...`}
            </span>
          )}
        </div>
      </div>
      <span className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', priorityDotColors[todo.priority])} />
    </div>
  )
}
