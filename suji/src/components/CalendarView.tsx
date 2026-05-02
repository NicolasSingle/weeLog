import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CalendarDay } from './CalendarDay'
import { useReports } from '@/hooks/useReports'
import { useStore } from '@/lib/store'
import { Button } from './ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六']

export function CalendarView() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const { reports } = useReports()
  const todos = useStore((s) => s.todos)
  const reportSearchQuery = useStore((s) => s.reportSearchQuery)
  const setReportPageView = useStore((s) => s.setReportPageView)
  const setSelectedReportDate = useStore((s) => s.setSelectedReportDate)

  // Filter reports by search query if present
  const filteredReports = useMemo(() => {
    if (!reportSearchQuery) return reports
    const query = reportSearchQuery.toLowerCase()
    return reports.filter(
      (r) =>
        r.content.toLowerCase().includes(query) ||
        r.tags.some((t) => t.toLowerCase().includes(query))
    )
  }, [reports, reportSearchQuery])

  // Get dates with activity (reports or completed todos)
  const datesWithActivity = useMemo(() => {
    const dates = new Set(filteredReports.map((r) => r.date))
    // Also add dates with completed todos
    for (const t of todos) {
      if (t.status === 'completed' && t.completedAt) {
        dates.add(format(parseISO(t.completedAt), 'yyyy-MM-dd'))
      }
    }
    return dates
  }, [filteredReports, todos])

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))
  const handleToday = () => setCurrentMonth(new Date())

  const handleDateClick = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    setSelectedReportDate(dateStr)
    setReportPageView('editor')
  }

  // Generate calendar grid
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  // Split into weeks
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  const today = new Date()

  return (
    <div className="h-full flex flex-col p-4">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <h2 className="text-base font-semibold text-foreground dark:text-foreground min-w-[120px] text-center">
            {format(currentMonth, 'yyyy 年 M 月', { locale: zhCN })}
          </h2>
          <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <Button variant="outline" size="sm" onClick={handleToday} className="h-8 text-xs">
          今天
        </Button>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 mb-2">
        {WEEKDAYS.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground dark:text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-7 gap-1">
          {days.map((d, idx) => {
            const dateStr = format(d, 'yyyy-MM-dd')
            const hasReport = datesWithActivity.has(dateStr)
            const isCurrentMonth = isSameMonth(d, currentMonth)
            const isToday = isSameDay(d, today)

            return (
              <CalendarDay
                key={idx}
                date={d}
                hasReport={hasReport}
                isCurrentMonth={isCurrentMonth}
                isToday={isToday}
                onClick={() => handleDateClick(d)}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
