import { useStore } from '@/lib/store'
import { Input } from './ui/input'
import { Search, X } from 'lucide-react'

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
      <Search
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
      />
      {reportSearchQuery && (
        <button
          onClick={() => setReportSearchQuery('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground dark:text-muted-foreground dark:hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
