import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import type { Report } from '@/types'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface TimelineItemProps {
  report: Report
  onClick: () => void
}

export function TimelineItem({ report, onClick }: TimelineItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const contentPreview = report.content.slice(0, 80)
  const hasMoreContent = report.content.length > 80

  const formattedDate = format(new Date(report.date), 'yyyy 年 M 月 d 日', { locale: zhCN })
  const weekday = format(new Date(report.date), 'EEEE', { locale: zhCN })

  const handleClick = () => {
    if (isExpanded) {
      onClick()
    } else {
      setIsExpanded(true)
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "bg-card dark:bg-card rounded-lg border border-border dark:border-border overflow-hidden cursor-pointer transition-all hover:shadow-md",
        isExpanded ? "min-h-[80px]" : "min-h-[80px]"
      )}
    >
      <div className="p-4">
        {/* Date Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground dark:text-foreground">
              {formattedDate}
            </span>
            <span className="text-xs text-muted-foreground dark:text-muted-foreground">{weekday}</span>
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-muted-foreground transition-transform dark:text-muted-foreground",
              isExpanded && "rotate-180"
            )}
          />
        </div>

        {/* Content Preview */}
        <p className="text-sm text-muted-foreground dark:text-muted-foreground leading-relaxed">
          {isExpanded ? report.content : contentPreview}
          {!isExpanded && hasMoreContent && '...'}
        </p>

        {/* Tags */}
        {report.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {report.tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary text-xs px-2 py-0.5 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
