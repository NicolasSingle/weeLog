import { useStore } from '@/lib/store'
import { Input } from './ui/input'

export function ReportSearch() {
  const reportSearchQuery = useStore((s) => s.reportSearchQuery)
  const setReportSearchQuery = useStore((s) => s.setReportSearchQuery)

  return (
    <div className="relative">
      <Input
        type="text"
        placeholder="搜索内容或标签..."
        value={reportSearchQuery}
        onChange={(e) => setReportSearchQuery(e.target.value)}
        className="h-8 text-xs pl-8"
      />
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {reportSearchQuery && (
        <button
          onClick={() => setReportSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
