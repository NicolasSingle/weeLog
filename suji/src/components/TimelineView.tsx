import { useMemo } from 'react'
import { useReports } from '@/hooks/useReports'
import { useStore } from '@/lib/store'
import { FileText, CheckCircle2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export function TimelineView() {
  const { reports } = useReports()
  const todos = useStore((s) => s.todos)
  const reportSearchQuery = useStore((s) => s.reportSearchQuery)
  const setReportPageView = useStore((s) => s.setReportPageView)
  const setSelectedReportDate = useStore((s) => s.setSelectedReportDate)

  // Build a map of dates with activity (reports or completed todos)
  const dateActivity = useMemo(() => {
    const map = new Map<string, { hasReport: boolean; completedTodoCount: number; content: string }>()

    // Add reports
    for (const r of reports) {
      map.set(r.date, {
        hasReport: true,
        completedTodoCount: 0,
        content: r.content,
      })
    }

    // Add completed todos
    for (const t of todos) {
      if (t.status === 'completed' && t.completedAt) {
        const date = format(parseISO(t.completedAt), 'yyyy-MM-dd')
        const existing = map.get(date)
        if (existing) {
          existing.completedTodoCount++
        } else {
          map.set(date, {
            hasReport: false,
            completedTodoCount: 1,
            content: '',
          })
        }
      }
    }

    return map
  }, [reports, todos])

  // Get all activity dates sorted
  const activityDates = useMemo(() => {
    let dates = Array.from(dateActivity.keys())

    // Filter by search
    if (reportSearchQuery) {
      const query = reportSearchQuery.toLowerCase()
      dates = dates.filter(d => {
        const activity = dateActivity.get(d)!
        return activity.content.toLowerCase().includes(query)
      })
    }

    // Sort descending (newest first)
    return dates.sort((a, b) => (a < b ? 1 : -1))
  }, [dateActivity, reportSearchQuery])

  const handleReportClick = (date: string) => {
    setSelectedReportDate(date)
    setReportPageView('editor')
  }

  if (activityDates.length === 0) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-sm">
              {reportSearchQuery ? '没有找到匹配的记录' : '暂无日报记录'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-3">
        {activityDates.map((date) => {
          const activity = dateActivity.get(date)!
          const dateObj = parseISO(date)
          const formattedDate = format(dateObj, 'yyyy 年 M 月 d 日', { locale: zhCN })
          const weekday = format(dateObj, 'EEEE', { locale: zhCN })

          return (
            <div
              key={date}
              onClick={() => handleReportClick(date)}
              className="bg-card dark:bg-card rounded-lg border border-border overflow-hidden cursor-pointer transition-all hover:shadow-md"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{formattedDate}</span>
                    <span className="text-xs text-muted-foreground">{weekday}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {activity.completedTodoCount > 0 && (
                      <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-3 w-3" />
                        {activity.completedTodoCount}
                      </span>
                    )}
                    {activity.hasReport && (
                      <span className="flex items-center gap-1 text-xs text-orange-500">
                        <FileText className="h-3 w-3" />
                        笔记
                      </span>
                    )}
                  </div>
                </div>

                {activity.content && (
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                    {activity.content.slice(0, 80)}
                    {activity.content.length > 80 && '...'}
                  </p>
                )}
                {!activity.content && activity.completedTodoCount > 0 && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    完成了 {activity.completedTodoCount} 项待办
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
