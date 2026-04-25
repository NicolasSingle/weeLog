import { useMemo } from 'react'
import { useReports } from '@/hooks/useReports'
import { useStore } from '@/lib/store'
import { TimelineItem } from './ReportCard'

export function TimelineView() {
  const { reports } = useReports()
  const reportSearchQuery = useStore((s) => s.reportSearchQuery)
  const setReportPageView = useStore((s) => s.setReportPageView)
  const setSelectedReportDate = useStore((s) => s.setSelectedReportDate)

  // Filter and sort reports
  const filteredReports = useMemo(() => {
    let filtered = reports

    // Filter by search query
    if (reportSearchQuery) {
      const query = reportSearchQuery.toLowerCase()
      filtered = reports.filter(
        (r) =>
          r.content.toLowerCase().includes(query) ||
          r.tags.some((t) => t.toLowerCase().includes(query))
      )
    }

    // Sort by date descending (newest first)
    return [...filtered].sort((a, b) => (a.date < b.date ? 1 : -1))
  }, [reports, reportSearchQuery])

  const handleReportClick = (date: string) => {
    setSelectedReportDate(date)
    setReportPageView('editor')
  }

  if (filteredReports.length === 0) {
    return (
      <div className="h-full flex flex-col p-4">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-gray-400 dark:text-gray-500">
            <svg
              className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-sm">
              {reportSearchQuery ? '没有找到匹配的日报' : '暂无日报记录'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="space-y-3">
        {filteredReports.map((report) => (
          <TimelineItem
            key={report.id}
            report={report}
            onClick={() => handleReportClick(report.date)}
          />
        ))}
      </div>
    </div>
  )
}
