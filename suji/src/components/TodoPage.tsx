import { useState } from 'react'
import { useTodos } from '@/hooks/useTodos'
import { TodoList } from './TodoList'
import { TodoDetail } from './TodoDetail'
import { Input } from './ui/input'
import { toast } from 'sonner'

export function TodoPage() {
  const { createTodo } = useTodos()
  const [newTodoTitle, setNewTodoTitle] = useState('')

  const handleAddTodo = async (title: string) => {
    if (!title.trim()) return
    try {
      await createTodo(title.trim())
      setNewTodoTitle('')
      toast('已添加待办', { duration: 1500 })
    } catch (error) {
      toast.error('添加失败')
    }
  }

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      await handleAddTodo(newTodoTitle)
    }
  }

  return (
    <div className="h-full flex bg-background dark:bg-background">
      {/* Left Panel - 300px */}
      <div className="w-[300px] flex flex-col bg-card border-r border-border dark:bg-card dark:border-border">
        {/* Add Todo Input */}
        <div className="p-3 border-b border-border dark:border-border">
          <Input
            value={newTodoTitle}
            onChange={e => setNewTodoTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="添加待办事项，回车确认..."
            className="text-sm"
          />
        </div>

        {/* Todo List */}
        <div className="flex-1 overflow-hidden">
          <TodoList />
        </div>
      </div>

      {/* Right Panel - flex-1 */}
      <div className="flex-1 overflow-hidden">
        <TodoDetail />
      </div>
    </div>
  )
}
