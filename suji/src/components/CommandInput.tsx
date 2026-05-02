import { useState, useRef, useEffect, useCallback, KeyboardEvent } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { useTodos } from '@/hooks/useTodos'
import { useReports } from '@/hooks/useReports'
import { useStore } from '@/lib/store'
import { CheckCircle2, ListTodo, PenLine } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Todo } from '@/types'

type InputMode = 'report' | 'todo' | 'done'

function detectMode(value: string): InputMode {
  if (value.startsWith('todo:')) return 'todo'
  if (value.startsWith('done:')) return 'done'
  return 'report'
}

function getCommandText(value: string, mode: InputMode): string {
  if (mode === 'todo') return value.slice(5).trim()
  if (mode === 'done') return value.slice(5).trim()
  return value.trim()
}

function fuzzyMatch(todos: Todo[], query: string): Todo[] {
  if (!query) return []
  const lower = query.toLowerCase()
  return todos
    .filter(t => t.status === 'pending' && t.title.toLowerCase().includes(lower))
    .slice(0, 5)
}

const modeConfig = {
  todo: { icon: ListTodo, label: '待办', color: 'text-blue-500' },
  done: { icon: CheckCircle2, label: '完成', color: 'text-green-500' },
  report: { icon: PenLine, label: '速记', color: 'text-orange-500' },
}

export function CommandInput() {
  const [value, setValue] = useState('')
  const [suggestions, setSuggestions] = useState<Todo[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showProgress, setShowProgress] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const { createTodo, toggleTodo } = useTodos()
  const { createReport } = useReports()
  const todos = useStore((s) => s.todos)

  const mode = detectMode(value)
  const commandText = getCommandText(value, mode)
  const config = modeConfig[mode]
  const ModeIcon = config.icon

  // Reset all state when window gains focus (i.e., reopens)
  useEffect(() => {
    let unlisten: (() => void) | undefined

    const setup = async () => {
      const appWindow = getCurrentWindow()
      unlisten = await appWindow.onFocusChanged((event) => {
        if (event.payload) {
          // Window gained focus - reset everything
          setValue('')
          setSuggestions([])
          setSelectedIndex(-1)
          setIsSubmitting(false)
          setShowProgress(false)
          inputRef.current?.focus()
        }
      })
    }
    setup()
    return () => { if (unlisten) unlisten() }
  }, [])

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Update suggestions in "done" mode
  useEffect(() => {
    if (mode === 'done') {
      const matched = fuzzyMatch(todos, commandText)
      setSuggestions(matched)
      setSelectedIndex(matched.length > 0 ? 0 : -1)
    } else {
      setSuggestions([])
      setSelectedIndex(-1)
    }
  }, [value, mode, commandText, todos])

  const hideWindow = useCallback(async () => {
    const appWindow = getCurrentWindow()
    await appWindow.hide()
  }, [])

  const execute = useCallback(async () => {
    if (isSubmitting) return

    if (mode === 'done') {
      if (suggestions.length > 0 && selectedIndex >= 0) {
        const todo = suggestions[selectedIndex]
        setIsSubmitting(true)
        setShowProgress(true)
        try {
          await toggleTodo(todo.id)
        } catch {
          setIsSubmitting(false)
          setShowProgress(false)
          return
        }
        // Wait for progress bar animation, then hide
        setTimeout(hideWindow, 350)
      }
      return
    }

    if (!commandText) return

    setIsSubmitting(true)
    setShowProgress(true)
    try {
      if (mode === 'todo') {
        await createTodo(commandText)
      } else {
        await createReport(commandText)
      }
    } catch {
      setIsSubmitting(false)
      setShowProgress(false)
      return
    }
    setTimeout(hideWindow, 350)
  }, [mode, commandText, suggestions, selectedIndex, isSubmitting, createTodo, createReport, toggleTodo, hideWindow])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      hideWindow()
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      execute()
      return
    }

    if (mode === 'done' && suggestions.length > 0) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex(i => (i + 1) % suggestions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex(i => (i - 1 + suggestions.length) % suggestions.length)
      }
    }
  }

  return (
    <div className="flex flex-col">
      {/* Input row - the progress bar sits at the bottom of this */}
      <div className="flex items-center h-12 px-3 gap-2 relative">
        {/* Progress bar at the very bottom of the input area */}
        {showProgress && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-green-500/15">
            <div className="h-full bg-green-500 animate-progress-fill" />
          </div>
        )}

        {/* Mode indicator */}
        <div className={cn('flex items-center gap-1 shrink-0', config.color)}>
          <ModeIcon className="h-4 w-4" />
          <span className="text-xs font-medium">{config.label}</span>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          placeholder={
            mode === 'todo' ? '输入待办内容...' :
            mode === 'done' ? '输入待办关键词...' :
            '记录今天的工作...'
          }
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
        />

        {/* Hint */}
        <span className="text-[10px] text-muted-foreground shrink-0">
          {mode === 'done' && suggestions.length > 0
            ? '↑↓ 选择 · Enter 完成'
            : 'Enter 确认 · Esc 关闭'}
        </span>
      </div>

      {/* Suggestions dropdown */}
      {mode === 'done' && suggestions.length > 0 && !isSubmitting && (
        <div className="border-t border-border">
          {suggestions.map((todo, index) => (
            <div
              key={todo.id}
              className={cn(
                'px-3 py-2 text-sm cursor-pointer transition-colors',
                index === selectedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50'
              )}
              onClick={() => {
                setSelectedIndex(index)
                setIsSubmitting(true)
                setShowProgress(true)
                toggleTodo(todo.id).then(() => {
                  setTimeout(hideWindow, 350)
                }).catch(() => {
                  setIsSubmitting(false)
                  setShowProgress(false)
                })
              }}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="truncate">{todo.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
