import { useMemo } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { useStore, type TodoCategory } from '@/lib/store'
import { useTodos } from '@/hooks/useTodos'
import { TodoListItem } from './TodoListItem'
import { Input } from './ui/input'
import { cn } from '@/lib/utils'
import { isToday, isThisWeek, parseISO, isValid } from 'date-fns'

const categoryTabs: { key: TodoCategory; label: string }[] = [
  { key: 'today', label: '今日' },
  { key: 'week', label: '本周' },
  { key: 'all', label: '全部' },
  { key: 'completed', label: '已完成' },
]

export function TodoList() {
  const {
    selectedTodo,
    setSelectedTodo,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    priorityFilter,
    setPriorityFilter,
  } = useStore()

  const { todos, toggleTodo } = useTodos()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const filteredTodos = useMemo(() => {
    let filtered = [...todos]

    // Filter by category
    switch (activeCategory) {
      case 'today':
        filtered = filtered.filter(t => {
          if (t.status === 'completed') return false
          if (!t.dueDate) return true
          const due = parseISO(t.dueDate)
          return isValid(due) && isToday(due)
        })
        break
      case 'week':
        filtered = filtered.filter(t => {
          if (t.status === 'completed') return false
          if (!t.dueDate) return true
          const due = parseISO(t.dueDate)
          return isValid(due) && isThisWeek(due, { weekStartsOn: 1 })
        })
        break
      case 'all':
        filtered = filtered.filter(t => t.status !== 'completed')
        break
      case 'completed':
        filtered = filtered.filter(t => t.status === 'completed')
        break
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Filter by priority
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(t => t.priority === priorityFilter)
    }

    // Sort by priority (high > medium > low) then by created date
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    filtered.sort((a, b) => {
      if (a.status !== b.status) {
        return a.status === 'pending' ? -1 : 1
      }
      if (a.priority !== b.priority) {
        return priorityOrder[a.priority] - priorityOrder[b.priority]
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }, [todos, activeCategory, searchQuery, priorityFilter])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      // Reorder logic could be implemented here
      // For now we just let it be
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search and Filter */}
      <div className="p-3 space-y-2 border-b border-border dark:border-border">
        <Input
          placeholder="搜索待办..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="text-sm"
        />
        <select
          value={priorityFilter}
          onChange={e => setPriorityFilter(e.target.value as typeof priorityFilter)}
          className="w-full h-9 px-3 text-sm rounded-md border border-input bg-card dark:bg-card dark:border-input dark:text-foreground"
        >
          <option value="all">全部优先级</option>
          <option value="high">高优先级</option>
          <option value="medium">中优先级</option>
          <option value="low">低优先级</option>
        </select>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-border dark:border-border">
        {categoryTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveCategory(tab.key)}
            className={cn(
              'flex-1 px-3 py-2 text-sm font-medium transition-colors',
              activeCategory === tab.key
                ? 'text-primary border-b-2 border-primary bg-accent dark:bg-accent'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent dark:text-muted-foreground dark:hover:text-foreground dark:hover:bg-accent'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Todo List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={filteredTodos.map(t => t.id)}
            strategy={verticalListSortingStrategy}
          >
            {filteredTodos.map(todo => (
              <TodoListItem
                key={todo.id}
                todo={todo}
                isSelected={selectedTodo?.id === todo.id}
                onClick={() => setSelectedTodo(todo)}
                onToggle={() => toggleTodo(todo.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {filteredTodos.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8 dark:text-muted-foreground">
            暂无待办事项
          </div>
        )}
      </div>
    </div>
  )
}
