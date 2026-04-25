import { useStore } from '@/lib/store'
import { CalendarView } from './CalendarView'
import { TimelineView } from './TimelineView'
import { ReportEditor } from './ReportEditor'
import { ReportSearch } from './ReportSearch'
import { cn } from '@/lib/utils'

export function ReportPage() {
  const reportView = useStore((s) => s.reportView)
  const reportPageView = useStore((s) => s.reportPageView)
  const setReportView = useStore((s) => s.setReportView)

  return (
    <div className="h-full flex flex-col bg-[#F7F8FA] dark:bg-[#1C1C1E]">
      {/* Header */}
      <div className="px-4 py-3 bg-white dark:bg-[#2C2C2E] border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-lg font-semibold text-gray-800 dark:text-gray-100">日报</h1>

          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-[#3C3C3E] rounded-lg p-0.5">
            <button
              onClick={() => setReportView('calendar')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                reportView === 'calendar'
                  ? "bg-white dark:bg-[#4C4C4E] text-gray-800 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              日历
            </button>
            <button
              onClick={() => setReportView('timeline')}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-md transition-colors",
                reportView === 'timeline'
                  ? "bg-white dark:bg-[#4C4C4E] text-gray-800 dark:text-gray-100 shadow-sm"
                  : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              )}
            >
              时间线
            </button>
          </div>

          {/* Search */}
          <div className="flex-1 max-w-[200px]">
            <ReportSearch />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {reportPageView === 'editor' ? (
          <ReportEditor />
        ) : reportView === 'calendar' ? (
          <CalendarView />
        ) : (
          <TimelineView />
        )}
      </div>
    </div>
  )
}
