import { format } from 'date-fns'
import { cn } from '@/lib/utils'

interface CalendarDayProps {
  date: Date
  hasReport: boolean
  isCurrentMonth: boolean
  isToday: boolean
  onClick: () => void
}

export function CalendarDay({ date, hasReport, isCurrentMonth, isToday, onClick }: CalendarDayProps) {
  const day = format(date, 'd')

  return (
    <button
      onClick={onClick}
      className={cn(
        "relative w-[40px] h-[40px] flex flex-col items-center justify-center rounded-lg text-sm transition-colors",
        !isCurrentMonth && "text-muted-foreground/50 dark:text-muted-foreground/50",
        isCurrentMonth && "text-foreground dark:text-foreground hover:bg-accent dark:hover:bg-accent",
        isToday && "bg-accent dark:bg-accent text-primary dark:text-primary font-semibold"
      )}
    >
      <span className="text-sm">{day}</span>
      {hasReport && (
        <span className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-primary" />
      )}
    </button>
  )
}
