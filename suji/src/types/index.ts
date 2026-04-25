export interface Todo {
  id: string
  title: string
  description: string
  dueDate: string | null
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'completed' | 'expired'
  tags: string[]
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export interface Report {
  id: string
  date: string
  content: string
  tags: string[]
  todos: string[]
  createdAt: string
  updatedAt: string
}
