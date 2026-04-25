import { cn } from '@/lib/utils'

interface PrioritySelectorProps {
  value: 'high' | 'medium' | 'low'
  onChange: (priority: 'high' | 'medium' | 'low') => void
}

const priorities = [
  { key: 'high' as const, label: '高', color: '#F53F3F', bg: 'bg-[#F53F3F]' },
  { key: 'medium' as const, label: '中', color: '#FF7D00', bg: 'bg-[#FF7D00]' },
  { key: 'low' as const, label: '低', color: '#00B42A', bg: 'bg-[#00B42A]' },
]

export function PrioritySelector({ value, onChange }: PrioritySelectorProps) {
  return (
    <div className="flex gap-1">
      {priorities.map((p) => (
        <button
          key={p.key}
          type="button"
          onClick={() => onChange(p.key)}
          className={cn(
            'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5',
            value === p.key
              ? `${p.bg} text-white shadow-sm`
              : 'bg-accent text-muted-foreground hover:bg-accent/80 dark:bg-accent dark:text-muted-foreground dark:hover:bg-accent/80'
          )}
        >
          <span
            className={cn('w-2 h-2 rounded-full', value === p.key ? 'bg-white' : p.bg)}
          />
          {p.label}
        </button>
      ))}
    </div>
  )
}
