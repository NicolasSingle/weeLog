import { useState, KeyboardEvent, ChangeEvent } from 'react'
import { Input } from './ui/input'
import { useTodos } from '@/hooks/useTodos'
import { toast } from 'sonner'

export function TodoInput() {
  const [value, setValue] = useState('')
  const { createTodo } = useTodos()

  const handleKeyDown = async (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (!value.trim()) return

      try {
        await createTodo(value.trim())
        setValue('')
        toast('已添加待办', { duration: 1500 })
      } catch (error) {
        toast.error('添加失败')
      }
    }
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }

  return (
    <Input
      value={value}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder="添加待办事项，回车确认..."
      className="text-sm bg-card text-foreground dark:bg-card dark:text-foreground"
    />
  )
}
