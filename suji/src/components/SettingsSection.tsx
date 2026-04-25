import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SettingsSectionProps {
  title: string
  children: ReactNode
  defaultOpen?: boolean
}

export function SettingsSection({ title, children, defaultOpen = true }: SettingsSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-card rounded-lg shadow-sm mb-4 overflow-hidden dark:bg-card">
      <button
        type="button"
        className="w-full px-4 py-3 flex items-center justify-between font-semibold text-left border-b border-border hover:bg-accent transition-colors dark:border-border dark:hover:bg-accent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-foreground dark:text-foreground">{title}</span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200 dark:text-muted-foreground",
            isOpen ? "rotate-180" : ""
          )}
        />
      </button>
      <div
        className={cn(
          "transition-all duration-200 ease-in-out",
          isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        )}
      >
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  )
}
