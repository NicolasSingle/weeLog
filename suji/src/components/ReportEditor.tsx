import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { useReports } from '@/hooks/useReports'
import { useStore } from '@/lib/store'
import { Button } from './ui/button'
import { Textarea } from './ui/textarea'
import { toast } from 'sonner'
import type { Report } from '@/types'

export function ReportEditor() {
  const { reports, updateReport, deleteReport, getReportByDate, createReportForDate } = useReports()
  const selectedReportDate = useStore((s) => s.selectedReportDate)
  const setReportPageView = useStore((s) => s.setReportPageView)
  const setSelectedReportDate = useStore((s) => s.setSelectedReportDate)

  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [report, setReport] = useState<Report | null>(null)

  // Load report when date changes
  useEffect(() => {
    if (selectedReportDate) {
      const existingReport = getReportByDate(selectedReportDate)
      if (existingReport) {
        setReport(existingReport)
        setContent(existingReport.content)
        setTags(existingReport.tags)
      } else {
        // New report for this date
        setReport(null)
        setContent('')
        setTags([])
      }
      setIsEditing(false)
    }
  }, [selectedReportDate, reports, getReportByDate])

  const handleBack = () => {
    setSelectedReportDate(null)
    setReportPageView('list')
  }

  const handleSave = async () => {
    if (!selectedReportDate || !content.trim()) return

    setIsSaving(true)
    try {
      // Extract tags from content
      const extractedTags = content.match(/#\w+/g)?.map((t: string) => t.slice(1)) || []

      if (report) {
        await updateReport(report.id, {
          content: content.trim(),
          tags: extractedTags,
        })
        toast.success('日报已更新')
      } else {
        await createReportForDate(selectedReportDate, content.trim())
        toast.success('日报已创建')
      }

      setIsEditing(false)
      setSelectedReportDate(null)
      setReportPageView('list')
    } catch (error) {
      toast.error('保存失败')
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!report) return

    try {
      await deleteReport(report.id)
      toast.success('日报已删除')
      setSelectedReportDate(null)
      setReportPageView('list')
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleExportMarkdown = () => {
    if (!content) return

    const frontmatter = `---
date: "${selectedReportDate}"
tags: [${tags.map((t) => `"${t}"`).join(', ')}]
---

`
    const markdown = frontmatter + content

    // Create and download file
    const blob = new Blob([markdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `日报_${selectedReportDate}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('已导出 Markdown')
  }

  const handleExportJSON = () => {
    const data = {
      date: selectedReportDate,
      content,
      tags,
      createdAt: report?.createdAt,
      updatedAt: report?.updatedAt,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `日报_${selectedReportDate}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success('已导出 JSON')
  }

  if (!selectedReportDate) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-muted-foreground text-sm dark:text-muted-foreground">请选择一个日期</p>
      </div>
    )
  }

  const formattedDate = format(new Date(selectedReportDate), 'yyyy 年 M 月 d 日', { locale: zhCN })
  const weekday = format(new Date(selectedReportDate), 'EEEE', { locale: zhCN })

  return (
    <div className="h-full flex flex-col bg-background dark:bg-background">
      {/* Header */}
      <div className="px-4 py-3 bg-card border-b border-border dark:bg-card dark:border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack} className="h-8 w-8">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <div>
              <h2 className="text-base font-semibold text-foreground dark:text-foreground">
                {formattedDate}
              </h2>
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">{weekday}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {report && (
              <>
                <Button variant="outline" size="sm" onClick={handleExportMarkdown} className="h-8 text-xs">
                  MD
                </Button>
                <Button variant="outline" size="sm" onClick={handleExportJSON} className="h-8 text-xs">
                  JSON
                </Button>
              </>
            )}
            {isEditing ? (
              <>
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} className="h-8 text-xs">
                  取消
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || !content.trim()}
                  className="h-8 text-xs"
                >
                  {isSaving ? '保存中...' : '保存'}
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-8 text-xs"
              >
                {report ? '编辑' : '写日报'}
              </Button>
            )}
            {report && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDelete}
                className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-card dark:bg-card rounded-lg border border-border dark:border-border p-4">
          {isEditing ? (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="今天做了什么？使用 #标签 来添加标签..."
              className="min-h-[300px] resize-none border-0 p-0 focus-visible:ring-0 text-sm leading-relaxed bg-transparent"
              autoFocus
            />
          ) : (
            <div className="min-h-[300px] text-sm leading-relaxed text-foreground dark:text-foreground whitespace-pre-wrap">
              {content || (
                <span className="text-muted-foreground dark:text-muted-foreground">暂无内容</span>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-border dark:border-border">
              {tags.map((tag) => (
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
    </div>
  )
}
