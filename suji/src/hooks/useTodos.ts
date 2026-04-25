import { useEffect, useCallback } from 'react'
import { db, initDb } from '@/lib/db'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import type { Todo } from '@/types'

export function useTodos() {
  const { todos, setTodos, addTodo, updateTodo, removeTodo } = useStore()

  const loadTodos = useCallback(async () => {
    await initDb()
    const result = await db!.select<any[]>('SELECT * FROM todos ORDER BY created_at DESC')
    setTodos(result.map(r => ({
      id: r.id,
      title: r.title,
      description: r.description || '',
      dueDate: r.due_date,
      priority: r.priority || 'medium',
      status: r.status || 'pending',
      tags: JSON.parse(r.tags || '[]'),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      completedAt: r.completed_at,
    })))
  }, [setTodos])

  useEffect(() => { loadTodos() }, [loadTodos])

  const createTodo = async (title: string) => {
    const now = new Date().toISOString()
    const todo: Todo = {
      id: uuidv4(),
      title,
      description: '',
      dueDate: null,
      priority: 'medium',
      status: 'pending',
      tags: [],
      createdAt: now,
      updatedAt: now,
      completedAt: null,
    }
    await db!.execute(
      'INSERT INTO todos (id, title, description, due_date, priority, status, tags, created_at, updated_at, completed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [todo.id, todo.title, todo.description, todo.dueDate, todo.priority, todo.status, JSON.stringify(todo.tags), todo.createdAt, todo.updatedAt, todo.completedAt]
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

  return { todos, createTodo, toggleTodo, deleteTodo, refreshTodos: loadTodos, updateTodo }
}
