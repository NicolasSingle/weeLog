import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { toast } from 'sonner'
import { LazyStore } from '@tauri-apps/plugin-store'
import { initDb, db } from '@/lib/db'
import { format } from 'date-fns'

interface BackupInfo {
  lastBackupTime: string | null
}

const store = new LazyStore('settings.json')

export function DataManagement() {
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  useEffect(() => {
    const loadBackupInfo = async () => {
      try {
        await store.init()
        const backupInfo = await store.get<BackupInfo>('backupInfo')
        if (backupInfo?.lastBackupTime) {
          setLastBackupTime(backupInfo.lastBackupTime)
        }
      } catch (error) {
        console.error('Failed to load backup info:', error)
      }
    }
    loadBackupInfo()
  }, [])

  const updateBackupTime = async () => {
    const now = new Date().toISOString()
    setLastBackupTime(now)
    try {
      await store.set('backupInfo', { lastBackupTime: now })
    } catch (error) {
      console.error('Failed to save backup info:', error)
    }
  }

  const exportDatabase = async () => {
    setIsExporting(true)
    try {
      await initDb()
      const todos = await db!.select<any[]>('SELECT * FROM todos')
      const reports = await db!.select<any[]>('SELECT * FROM reports')

      const backup = {
        version: 1,
        exportTime: new Date().toISOString(),
        data: {
          todos,
          reports,
        },
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `suji-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      await updateBackupTime()
      toast.success('备份成功')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('备份失败')
    } finally {
      setIsExporting(false)
    }
  }

  const importDatabase = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      setIsImporting(true)
      try {
        const text = await file.text()
        const backup = JSON.parse(text)

        if (!backup.version || !backup.data) {
          throw new Error('Invalid backup file format')
        }

        await initDb()

        // Clear existing data
        await db!.execute('DELETE FROM todos')
        await db!.execute('DELETE FROM reports')

        // Import todos
        for (const todo of backup.data.todos) {
          await db!.execute(
            `INSERT INTO todos (id, title, description, due_date, priority, status, tags, created_at, updated_at, completed_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [todo.id, todo.title, todo.description, todo.due_date, todo.priority, todo.status, todo.tags, todo.created_at, todo.updated_at, todo.completed_at]
          )
        }

        // Import reports
        for (const report of backup.data.reports) {
          await db!.execute(
            `INSERT INTO reports (id, date, content, tags, todos, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [report.id, report.date, report.content, report.tags, report.todos, report.created_at, report.updated_at]
          )
        }

        await updateBackupTime()
        toast.success('恢复成功，请刷新页面以查看数据')
        setTimeout(() => window.location.reload(), 1500)
      } catch (error) {
        console.error('Import failed:', error)
        toast.error('恢复失败：文件格式不正确或数据损坏')
      } finally {
        setIsImporting(false)
      }
    }

    input.click()
  }

  const downloadBackupNow = async () => {
    setIsExporting(true)
    try {
      await initDb()
      const todos = await db!.select<any[]>('SELECT * FROM todos')
      const reports = await db!.select<any[]>('SELECT * FROM reports')

      const backup = {
        version: 1,
        exportTime: new Date().toISOString(),
        data: {
          todos,
          reports,
        },
      }

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `suji-backup-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      await updateBackupTime()
      toast.success('立即备份下载成功')
    } catch (error) {
      console.error('Immediate backup failed:', error)
      toast.error('立即备份失败')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Button
          variant="outline"
          onClick={exportDatabase}
          disabled={isExporting}
        >
          {isExporting ? '导出中...' : '备份'}
        </Button>
        <Button
          variant="outline"
          onClick={importDatabase}
          disabled={isImporting}
        >
          {isImporting ? '导入中...' : '恢复'}
        </Button>
        <Button
          variant="default"
          onClick={downloadBackupNow}
          disabled={isExporting}
        >
          立即备份
        </Button>
      </div>

      {lastBackupTime && (
        <p className="text-sm text-muted-foreground">
          上次备份时间: {format(new Date(lastBackupTime), 'yyyy-MM-dd HH:mm:ss')}
        </p>
      )}

      <div className="mt-4 p-3 bg-muted rounded-md">
        <p className="text-xs text-muted-foreground">
          提示：定期备份可以防止数据丢失。恢复操作将覆盖当前所有数据，请谨慎操作。
        </p>
      </div>
    </div>
  )
}
