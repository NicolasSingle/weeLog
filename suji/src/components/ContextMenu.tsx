import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export interface ContextMenuItem {
  label: string
  icon: React.ComponentType<{ className?: string }>
  action: () => void
  destructive?: boolean
  disabled?: boolean
}

interface ContextMenuProps {
  x: number
  y: number
  items: ContextMenuItem[]
  onClose: () => void
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // Adjust position to stay within viewport
  const adjustedStyle: React.CSSProperties = {
    left: Math.min(x, window.innerWidth - 180),
    top: Math.min(y, window.innerHeight - items.length * 36 - 8),
  }

  return (
    <div
      ref={menuRef}
      className="fixed z-50 min-w-[160px] py-1 bg-card rounded-lg shadow-lg border border-border animate-in fade-in-0 zoom-in-95"
      style={adjustedStyle}
    >
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <button
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.action()
                onClose()
              }
            }}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors',
              item.disabled
                ? 'text-muted-foreground/50 cursor-not-allowed'
                : item.destructive
                  ? 'text-destructive hover:bg-destructive/10'
                  : 'text-foreground hover:bg-accent'
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </div>
  )
}
