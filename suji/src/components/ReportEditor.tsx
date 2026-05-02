import { useState, useMemo } from 'react'
import { format, parseISO, isSameDay, isValid } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useReports } from '@/hooks/useReports'
import { useTodos } from '@/hooks/useTodos'
import { useStore } from '@/lib/store'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { ArrowLeft, CheckCircle2, FileText, Plus, Trash2 } from 'lucide-react'
import type { Todo } from '@/types'

interface TimelineEntry {
  type: 'todo' | 'note'
  time: Date
  todo?: Todo
  noteText?: string
  noteIndex?: number
}

export function ReportEditor() {
  const { reports, updateReport, deleteReport, getReportByDate, createReportForDate } = useReports()
  const { todos } = useTodos()
  const selectedReportDate = useStore((s) => s.selectedReportDate)
  const setReportPageView = useStore((s) => s.setReportPageView)
  const setSelectedReportDate = useStore((s) => s.setSelectedReportDate)

  const [noteInput, setNoteInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Get completed todos for the selected date
  const completedTodosForDate = useMemo(() => {
    if (!selectedReportDate) return []
    return todos.filter(t => {
      if (t.status !== 'completed' || !t.completedAt) return false
      const completedDate = parseISO(t.completedAt)
      const selectedDate = parseISO(selectedReportDate)
      return isValid(completedDate) && isValid(selectedDate) && isSameDay(completedDate, selectedDate)
    }).sort((a, b) => {
      if (!a.completedAt || !b.completedAt) return 0
      return parseISO(a.completedAt).getTime() - parseISO(b.completedAt).getTime()
    })
  }, [todos, selectedReportDate])

  // Get report for the selected date
  const report = useMemo(() => {
    if (!selectedReportDate) return null
    return getReportByDate(selectedReportDate) || null
  }, [selectedReportDate, reports, getReportByDate])

  // Parse report content into lines
  const noteLines = useMemo(() => {
    if (!report?.content) return []
    return report.content.split('\n').filter(line => line.trim())
  }, [report])

  // Build unified timeline
  const timeline = useMemo((): TimelineEntry[] => {
    const entries: TimelineEntry[] = []

    // Add completed todos
    for (const todo of completedTodosForDate) {
      entries.push({
        type: 'todo',
        time: parseISO(todo.completedAt!),
        todo,
      })
    }

    // Add notes
    for (let i = 0; i < noteLines.length; i++) {
      const line = noteLines[i]
      // Try to extract time from report createdAt, or use current time
      const time = report ? parseISO(report.createdAt) : new Date()
      entries.push({
        type: 'note',
        time,
        noteText: line,
        noteIndex: i,
      })
    }

    // Sort by time
    entries.sort((a, b) => a.time.getTime() - b.time.getTime())

    return entries
  }, [completedTodosForDate, noteLines, report])

  const handleBack = () => {
    setSelectedReportDate(null)
    setReportPageView('list')
  }

  const handleAddNote = async () => {
    if (!selectedReportDate || !noteInput.trim()) return

    setIsSaving(true)
    try {
      const newContent = noteInput.trim()
      if (report) {
        const updatedContent = report.content
          ? report.content + '\n' + newContent
          : newContent
        await updateReport(report.id, { content: updatedContent })
      } else {
        await createReportForDate(selectedReportDate, newContent)
      }
      setNoteInput('')
      toast.success('已添加')
    } catch {
      toast.error('添加失败')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteNote = async (noteIndex: number) => {
    if (!report) return
    const newLines = noteLines.filter((_, i) => i !== noteIndex)
    const newContent = newLines.join('\n')
    try {
      if (newContent) {
        await updateReport(report.id, { content: newContent })
      } else {
        await deleteReport(report.id)
      }
      toast.success('已删除')
    } catch {
      toast.error('删除失败')
    }
  }

  const handleDeleteReport = async () => {
    if (!report) return
    try {
      await deleteReport(report.id)
      toast.success('日报已删除')
      setSelectedReportDate(null)
      setReportPageView('list')
    } catch {
      toast.error('删除失败')
    }
  }

  const handleNoteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAddNote()
    }
  }

  if (!selectedReportDate) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm">请选择一个日期</p>
      </div>
    )
  }

  const formattedDate = format(new Date(selectedReportDate), 'yyyy 年 M 月 d 日', { locale: zhCN })
  const weekday = format(new Date(selectedReportDate), 'EEEE', { locale: zhCN })

  return (
    <div className="h-full flex flex-col bg-background dark:bg-background">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border dark:bg-card dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h2 className="text-base font-semibold text-foreground">{formattedDate}</h2>
              <p className="text-xs text-muted-foreground">{weekday}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {completedTodosForDate.length} 已完成 · {noteLines.length} 笔记
            </span>
            {report && (
              <Button variant="ghost" size="sm" onClick={handleDeleteReport} className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10">
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {timeline.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-12">
            <FileText className="w-10 h-10 mx-auto mb-3 text-muted-foreground/50" />
            <p>当天没有记录</p>
            <p className="text-xs mt-1">完成待办或添加速记笔记后将自动显示在这里</p>
          </div>
        ) : (
          <div className="space-y-1">
            {timeline.map((entry) => (
              <div key={`${entry.type}-${entry.type === 'todo' ? entry.todo!.id : entry.noteIndex}`} className="group">
                {entry.type === 'todo' ? (
                  // Completed todo entry
                  <div className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">{entry.todo!.title}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {format(entry.time, 'HH:mm')}
                        {entry.todo!.priority === 'high' && ' · 高优先级'}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Note entry
                  <div className="flex items-start gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors group">
                    <FileText className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-foreground">{entry.noteText}</div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {format(entry.time, 'HH:mm')} · 速记
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(entry.noteIndex!)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add quick note input */}
        <div className="mt-4 pt-4 border-t border-border">
          <div className="flex gap-2">
            <input
              type="text"
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              onKeyDown={handleNoteKeyDown}
              placeholder="添加速记笔记..."
              className="flex-1 h-9 px-3 text-sm rounded-md border border-input bg-transparent outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
            />
            <Button
              size="sm"
              onClick={handleAddNote}
              disabled={!noteInput.trim() || isSaving}
              className="h-9"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
