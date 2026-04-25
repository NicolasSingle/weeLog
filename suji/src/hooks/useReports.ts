import { useEffect, useCallback } from 'react'
import { db, initDb } from '@/lib/db'
import { useStore } from '@/lib/store'
import { v4 as uuidv4 } from 'uuid'
import type { Report } from '@/types'

export function useReports() {
  const { reports, setReports } = useStore()

  const loadReports = useCallback(async () => {
    await initDb()
    const result = await db!.select<any[]>('SELECT * FROM reports ORDER BY date DESC')
    setReports(result.map(r => ({
      id: r.id,
      date: r.date,
      content: r.content,
      tags: JSON.parse(r.tags || '[]'),
      todos: JSON.parse(r.todos || '[]'),
      createdAt: r.created_at,
      updatedAt: r.updated_at,
    })))
  }, [setReports])

  useEffect(() => { loadReports() }, [loadReports])

  const createReport = async (content: string) => {
    const now = new Date().toISOString()
    const today = now.split('T')[0]
    const tags = content.match(/#\w+/g)?.map((t: string) => t.slice(1)) || []

    let report = reports.find(r => r.date === today)
    if (report) {
      const newContent = report.content + '\n' + content
      await db!.execute('UPDATE reports SET content = ?, updated_at = ? WHERE id = ?', [newContent, now, report.id])
    } else {
      report = {
        id: uuidv4(),
        date: today,
        content,
        tags,
        todos: [],
        createdAt: now,
        updatedAt: now,
      }
      await db!.execute(
        'INSERT INTO reports (id, date, content, tags, todos, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [report.id, report.date, report.content, JSON.stringify(report.tags), JSON.stringify(report.todos), report.createdAt, report.updatedAt]
      )
    }
    await loadReports()
    return report
  }

  const updateReport = async (id: string, updates: Partial<Omit<Report, 'id' | 'createdAt'>>) => {
    const now = new Date().toISOString()
    const report = reports.find(r => r.id === id)
    if (!report) return null

    const updatedReport = {
      ...report,
      ...updates,
      tags: updates.tags ?? report.tags,
      updatedAt: now,
    }

    await db!.execute(
      'UPDATE reports SET date = ?, content = ?, tags = ?, todos = ?, updated_at = ? WHERE id = ?',
      [updatedReport.date, updatedReport.content, JSON.stringify(updatedReport.tags), JSON.stringify(updatedReport.todos), updatedReport.updatedAt, id]
    )
    await loadReports()
    return updatedReport
  }

  const deleteReport = async (id: string) => {
    await db!.execute('DELETE FROM reports WHERE id = ?', [id])
    await loadReports()
  }

  const getReportByDate = (date: string): Report | undefined => {
    return reports.find(r => r.date === date)
  }

  const createReportForDate = async (date: string, content: string) => {
    const now = new Date().toISOString()
    const tags = content.match(/#\w+/g)?.map((t: string) => t.slice(1)) || []

    const existingReport = reports.find(r => r.date === date)
    if (existingReport) {
      // Update existing report
      const newContent = existingReport.content + '\n' + content
      await db!.execute('UPDATE reports SET content = ?, updated_at = ? WHERE id = ?', [newContent, now, existingReport.id])
      await loadReports()
      return existingReport
    } else {
      // Create new report for this date
      const report: Report = {
        id: uuidv4(),
        date,
        content,
        tags,
        todos: [],
        createdAt: now,
        updatedAt: now,
      }
      await db!.execute(
        'INSERT INTO reports (id, date, content, tags, todos, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [report.id, report.date, report.content, JSON.stringify(report.tags), JSON.stringify(report.todos), report.createdAt, report.updatedAt]
      )
      await loadReports()
      return report
    }
  }

  return { reports, createReport, createReportForDate, updateReport, deleteReport, refreshReports: loadReports, getReportByDate }
}
