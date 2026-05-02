import { create } from 'zustand'
import type { Todo, Report } from '@/types'

export interface WindowPosition {
  x: number
  y: number
}

export type TodoCategory = 'today' | 'week' | 'all' | 'completed' | 'archived'
type ReportView = 'calendar' | 'timeline'
type ReportPageView = 'list' | 'editor'

interface AppState {
  todos: Todo[]
  setTodos: (todos: Todo[]) => void
  addTodo: (todo: Todo) => void
  updateTodo: (id: string, updates: Partial<Todo>) => void
  removeTodo: (id: string) => void
  reports: Report[]
  setReports: (reports: Report[]) => void
  // Edge snap/collapse state
  isCollapsed: boolean
  collapsedEdge: 'left' | 'right' | null
  lastWindowPosition: WindowPosition | null
  setCollapsed: (collapsed: boolean, edge: 'left' | 'right' | null, position?: WindowPosition | null) => void
  // Todo page state
  selectedTodo: Todo | null
  setSelectedTodo: (todo: Todo | null) => void
  activeCategory: TodoCategory
  setActiveCategory: (category: TodoCategory) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  priorityFilter: 'all' | 'high' | 'medium' | 'low'
  setPriorityFilter: (priority: 'all' | 'high' | 'medium' | 'low') => void
  // Selection mode
  isSelectionMode: boolean
  selectedTodoIds: Set<string>
  toggleSelectionMode: () => void
  toggleTodoSelection: (id: string) => void
  clearSelection: () => void
  // Report page state
  reportView: ReportView
  setReportView: (view: ReportView) => void
  reportPageView: ReportPageView
  setReportPageView: (view: ReportPageView) => void
  selectedReportDate: string | null
  setSelectedReportDate: (date: string | null) => void
  reportSearchQuery: string
  setReportSearchQuery: (query: string) => void
}

export const useStore = create<AppState>((set) => ({
  todos: [],
  setTodos: (todos) => set({ todos }),
  addTodo: (todo) => set((state) => ({ todos: [todo, ...state.todos] })),
  updateTodo: (id, updates) =>
    set((state) => ({
      todos: state.todos.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  removeTodo: (id) =>
    set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
  reports: [],
  setReports: (reports) => set({ reports }),
  // Edge snap/collapse state
  isCollapsed: false,
  collapsedEdge: null,
  lastWindowPosition: null,
  setCollapsed: (collapsed, edge, position = null) =>
    set({
      isCollapsed: collapsed,
      collapsedEdge: edge,
      lastWindowPosition: position,
    }),
  // Todo page state
  selectedTodo: null,
  setSelectedTodo: (todo) => set({ selectedTodo: todo }),
  activeCategory: 'today',
  setActiveCategory: (category) => set({ activeCategory: category }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  priorityFilter: 'all',
  setPriorityFilter: (priority) => set({ priorityFilter: priority }),
  // Selection mode
  isSelectionMode: false,
  selectedTodoIds: new Set<string>(),
  toggleSelectionMode: () => set((state) => ({
    isSelectionMode: !state.isSelectionMode,
    selectedTodoIds: new Set<string>(),
  })),
  toggleTodoSelection: (id) => set((state) => {
    const newSet = new Set(state.selectedTodoIds)
    if (newSet.has(id)) newSet.delete(id)
    else newSet.add(id)
    return { selectedTodoIds: newSet }
  }),
  clearSelection: () => set({ selectedTodoIds: new Set<string>() }),
  // Report page state
  reportView: 'calendar' as ReportView,
  setReportView: (view: ReportView) => set({ reportView: view }),
  reportPageView: 'list' as ReportPageView,
  setReportPageView: (view: ReportPageView) => set({ reportPageView: view }),
  selectedReportDate: null as string | null,
  setSelectedReportDate: (date: string | null) => set({ selectedReportDate: date }),
  reportSearchQuery: '',
  setReportSearchQuery: (query: string) => set({ reportSearchQuery: query }),
}))
