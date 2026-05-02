import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO, isToday, isTomorrow, isThisWeek, isPast, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Checkbox } from './ui/checkbox'
import { cn } from '@/lib/utils'
import { ContextMenu, type ContextMenuItem } from './ContextMenu'
import { CheckCircle2, Archive, ArchiveRestore, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'

interface TodoListItemProps {
  todo: Todo
  isSelected: boolean
  onClick: () => void
  onToggle: () => void
  onComplete?: () => void
  onArchive?: () => void
  onDelete?: () => void
  isSelectionMode?: boolean
  isChecked?: boolean
  onCheckToggle?: () => void
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

export function TodoListItem({
  todo, isSelected, onClick, onToggle, onComplete, onArchive, onDelete,
  isSelectionMode, isChecked, onCheckToggle,
}: TodoListItemProps) {
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

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

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }

  const menuItems: ContextMenuItem[] = [
    {
      label: todo.status === 'completed' ? '标记未完成' : '标记完成',
      icon: CheckCircle2,
      action: onComplete || onToggle,
    },
    {
      label: todo.archived ? '取消归档' : '归档',
      icon: todo.archived ? ArchiveRestore : Archive,
      action: onArchive || (() => {}),
    },
    {
      label: '删除',
      icon: Trash2,
      action: onDelete || (() => {}),
      destructive: true,
    },
  ]

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={isSelectionMode ? onCheckToggle : onClick}
        onContextMenu={handleContextMenu}
        className={cn(
          'flex items-start gap-2 p-3 bg-card rounded-lg shadow-sm border-l-4 cursor-pointer transition-all dark:bg-card',
          priorityColors[todo.priority],
          isSelected && !isSelectionMode && 'ring-2 ring-primary ring-offset-1',
          isDragging && 'opacity-50 shadow-lg',
          todo.status === 'completed' && 'opacity-60',
          todo.status === 'expired' && 'border-l-[#F53F3F] bg-red-50/30 dark:bg-red-950/10',
          isChecked && 'ring-2 ring-primary/50 bg-accent/30',
        )}
      >
        {isSelectionMode ? (
          <Checkbox
            checked={isChecked}
            onChange={onCheckToggle}
            className="mt-0.5"
          />
        ) : (
          <Checkbox
            checked={todo.status === 'completed'}
            onChange={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className="mt-0.5"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className={cn(
            'text-sm truncate',
            todo.status === 'completed' ? 'line-through text-muted-foreground dark:text-muted-foreground' : 'text-foreground dark:text-foreground'
          )}>
            {todo.title}
          </div>
          <div className="flex items-center gap-2 mt-1">
            {todo.status === 'expired' && (
              <span className="text-xs text-[#F53F3F] font-medium">已过期</span>
            )}
            {dueDateText && (
              <span className={cn(
                'text-xs',
                overdue ? 'text-[#F53F3F]' : 'text-muted-foreground dark:text-muted-foreground'
              )}>
                {dueDateText}
              </span>
            )}
            {todo.tags.length > 0 && (
              <span className="text-xs text-muted-foreground dark:text-muted-foreground">
                {todo.tags.slice(0, 2).join(', ')}
                {todo.tags.length > 2 && `...`}
              </span>
            )}
            {todo.archived && (
              <span className="text-xs text-muted-foreground">已归档</span>
            )}
          </div>
        </div>
        <span className={cn('w-2 h-2 rounded-full shrink-0 mt-1.5', priorityDotColors[todo.priority])} />
      </div>

      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={menuItems}
          onClose={() => setContextMenu(null)}
        />
      )}
    </>
  )
}
