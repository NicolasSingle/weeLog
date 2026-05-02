import { useEffect, useCallback } from 'react'
import { db, initDb } from '@/lib/db'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import { parseISO, isPast, isToday } from 'date-fns'
import type { Todo } from '@/types'

function mapRow(r: any): Todo {
  return {
    id: r.id,
    title: r.title,
    description: r.description || '',
    dueDate: r.due_date,
    priority: r.priority || 'medium',
    status: r.status || 'pending',
    tags: JSON.parse(r.tags || '[]'),
    sortOrder: r.sort_order ?? 0,
    archived: r.archived === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    completedAt: r.completed_at,
  }
}

export function useTodos() {
  const { todos, setTodos, addTodo, updateTodo, removeTodo } = useStore()

  const loadTodos = useCallback(async () => {
    await initDb()
    const result = await db!.select<any[]>('SELECT * FROM todos ORDER BY sort_order DESC, created_at DESC')
    const mapped = result.map(mapRow)

    // Check for expired todos
    const now = new Date().toISOString()
    for (const todo of mapped) {
      if (todo.status === 'pending' && todo.dueDate) {
        const due = parseISO(todo.dueDate)
        if (isPast(due) && !isToday(due)) {
          todo.status = 'expired'
          await db!.execute('UPDATE todos SET status = ?, updated_at = ? WHERE id = ?', ['expired', now, todo.id])
        }
      }
    }

    setTodos(mapped)
  }, [setTodos])

  useEffect(() => { loadTodos() }, [loadTodos])

  const createTodo = async (title: string) => {
    const now = new Date().toISOString()
    const maxOrder = todos.length > 0 ? Math.max(...todos.map(t => t.sortOrder)) : 0
    const todo: Todo = {
      id: uuidv4(),
      title,
      description: '',
      dueDate: null,
      priority: 'medium',
      status: 'pending',
      tags: [],
      sortOrder: maxOrder + 1,
      archived: false,
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    }
    await db!.execute(
      'INSERT INTO todos (id, title, description, due_date, priority, status, tags, sort_order, archived, created_at, updated_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [todo.id, todo.title, todo.description, todo.dueDate, todo.priority, todo.status, JSON.stringify(todo.tags), todo.sortOrder, todo.archived ? 1 : 0, todo.createdAt, todo.updatedAt, todo.completedAt]
    )
    addTodo(todo)
    return todo
  }

  const toggleTodo = async (id: string) => {
    const todo = todos.find(t => t.id === id)
    if (!todo) return
    const now = new Date().toISOString()
    const status = todo.status === 'completed' ? 'pending' : 'completed'
    const completedAt = status === 'completed' ? now : null
    await db!.execute('UPDATE todos SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?', [status, completedAt, now, id])
    updateTodo(id, { status, completedAt, updatedAt: now })
  }

  const deleteTodo = async (id: string) => {
    await db!.execute('DELETE FROM todos WHERE id = ?', [id])
    removeTodo(id)
  }

  const archiveTodo = async (id: string) => {
    const now = new Date().toISOString()
    await db!.execute('UPDATE todos SET archived = 1, updated_at = ? WHERE id = ?', [now, id])
    updateTodo(id, { archived: true, updatedAt: now })
  }

  const unarchiveTodo = async (id: string) => {
    const now = new Date().toISOString()
    await db!.execute('UPDATE todos SET archived = 0, updated_at = ? WHERE id = ?', [now, id])
    updateTodo(id, { archived: false, updatedAt: now })
  }

  const reorderTodos = async (activeId: string, overId: string) => {
    const oldIndex = todos.findIndex(t => t.id === activeId)
    const newIndex = todos.findIndex(t => t.id === overId)
    if (oldIndex === -1 || newIndex === -1) return

    const newTodos = [...todos]
    const [moved] = newTodos.splice(oldIndex, 1)
    newTodos.splice(newIndex, 0, moved)

    // Update sort orders
    const now = new Date().toISOString()
    for (let i = 0; i < newTodos.length; i++) {
      const newOrder = newTodos.length - i
      if (newTodos[i].sortOrder !== newOrder) {
        newTodos[i].sortOrder = newOrder
        await db!.execute('UPDATE todos SET sort_order = ?, updated_at = ? WHERE id = ?', [newOrder, now, newTodos[i].id])
      }
    }

    setTodos(newTodos)
  }

  const deleteTodos = async (ids: string[]) => {
    for (const id of ids) {
      await db!.execute('DELETE FROM todos WHERE id = ?', [id])
    }
    setTodos(todos.filter(t => !ids.includes(t.id)))
  }

  const toggleTodos = async (ids: string[]) => {
    const now = new Date().toISOString()
    for (const id of ids) {
      const todo = todos.find(t => t.id === id)
      if (!todo || todo.status === 'completed') continue
      await db!.execute('UPDATE todos SET status = ?, completed_at = ?, updated_at = ? WHERE id = ?', ['completed', now, now, id])
      updateTodo(id, { status: 'completed', completedAt: now, updatedAt: now })
    }
  }

  return { todos, createTodo, toggleTodo, deleteTodo, refreshTodos: loadTodos, updateTodo, archiveTodo, unarchiveTodo, reorderTodos, deleteTodos, toggleTodos }
}
