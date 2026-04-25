import { useState, useRef, useCallback, KeyboardEvent, ChangeEvent } from 'react'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import { useReports } from '@/hooks/useReports'
import { getCurrentWindow } from '@tauri-apps/api/window'

export function SujiTab() {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { createReport } = useReports()

  const handleKeyDown = useCallback(async (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!content.trim() || isSubmitting) return

      setIsSubmitting(true)
      try {
        await createReport(content.trim())
        setContent('')
        toast('已保存', { duration: 1000 })

        setTimeout(async () => {
          const appWindow = getCurrentWindow()
          await appWindow.hide()
        }, 1000)
      } catch (error) {
        toast.error('保存失败')
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [content, isSubmitting, createReport])

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  return (
    <div className="h-full p-3 flex flex-col">
      <div className="relative flex-1">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="今天做了什么？"
          className="h-full resize-none text-sm bg-card text-foreground dark:bg-card dark:text-foreground"
          autoFocus
        />
      </div>
      <div className="mt-2 text-xs text-muted-foreground text-right dark:text-muted-foreground">
        Enter 发送 / Shift+Enter 换行
      </div>
    </div>
  )
}
