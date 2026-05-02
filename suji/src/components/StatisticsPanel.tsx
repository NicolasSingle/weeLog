import { useMemo } from 'react'
import { useStore } from '@/lib/store'
import { useReports } from '@/hooks/useReports'
import { parseISO, differenceInDays, format, subDays } from 'date-fns'

export function StatisticsPanel() {
  const todos = useStore((s) => s.todos)
  const { reports } = useReports()

  const stats = useMemo(() => {
    const totalTodos = todos.length
    const completedTodos = todos.filter(t => t.status === 'completed').length
    const pendingTodos = todos.filter(t => t.status === 'pending').length
    const expiredTodos = todos.filter(t => t.status === 'expired').length
    const totalReports = reports.length

    // Calculate streak (consecutive days with reports from today backwards)
    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const reportDates = new Set(reports.map(r => r.date))

    for (let i = 0; i < 365; i++) {
      const checkDate = format(subDays(today, i), 'yyyy-MM-dd')
      if (reportDates.has(checkDate)) {
        streak++
      } else {
        break
      }
    }

    // Total usage days (days since first created item)
    let usageDays = 0
    const allDates = [
      ...todos.map(t => t.createdAt),
      ...reports.map(r => r.createdAt),
    ]
    if (allDates.length > 0) {
      const earliest = allDates.reduce((a, b) => a < b ? a : b)
      usageDays = differenceInDays(new Date(), parseISO(earliest)) + 1
    }

    return {
      totalTodos,
      completedTodos,
      pendingTodos,
      expiredTodos,
      totalReports,
      streak,
      usageDays,
    }
  }, [todos, reports])

  const statItems = [
    { label: '使用天数', value: stats.usageDays, suffix: '天' },
    { label: '创建待办', value: stats.totalTodos, suffix: '个' },
    { label: '已完成', value: stats.completedTodos, suffix: '个' },
    { label: '待处理', value: stats.pendingTodos, suffix: '个' },
    { label: '已过期', value: stats.expiredTodos, suffix: '个' },
    { label: '编写日报', value: stats.totalReports, suffix: '篇' },
    { label: '连续 streak', value: stats.streak, suffix: '天' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-background dark:bg-background rounded-lg p-3 border border-border"
        >
          <div className="text-2xl font-bold text-foreground dark:text-foreground">
            {item.value}
            <span className="text-sm font-normal text-muted-foreground ml-1">{item.suffix}</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">{item.label}</div>
        </div>
      ))}
    </div>
  )
}
