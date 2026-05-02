import { useState, useEffect } from 'react'
import { useStore } from '@/lib/store'
import { useTodos } from '@/hooks/useTodos'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Textarea } from './ui/textarea'
import { Badge } from './ui/badge'
import { PrioritySelector } from './PrioritySelector'
import { DateTimePicker } from './DateTimePicker'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { Archive, ArchiveRestore } from 'lucide-react'

export function TodoDetail() {
  const { selectedTodo, setSelectedTodo } = useStore()
  const { updateTodo, deleteTodo, archiveTodo, unarchiveTodo } = useTodos()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<string | null>(null)
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (selectedTodo) {
      setTitle(selectedTodo.title)
      setDescription(selectedTodo.description)
      setDueDate(selectedTodo.dueDate)
      setPriority(selectedTodo.priority)
      setTags(selectedTodo.tags)
      setHasChanges(false)
    }
  }, [selectedTodo])

  useEffect(() => {
    if (selectedTodo) {
      const changed =
        title !== selectedTodo.title ||
        description !== selectedTodo.description ||
        dueDate !== selectedTodo.dueDate ||
        priority !== selectedTodo.priority ||
        JSON.stringify(tags) !== JSON.stringify(selectedTodo.tags)
      setHasChanges(changed)
    }
  }, [title, description, dueDate, priority, tags, selectedTodo])

  const handleSave = async () => {
    if (!selectedTodo || !title.trim()) return

    try {
      await updateTodo(selectedTodo.id, {
        title: title.trim(),
        description: description.trim(),
        dueDate,
        priority,
        tags,
        updatedAt: new Date().toISOString(),
      })
      setHasChanges(false)
      toast('已保存', { duration: 1500 })
    } catch (error) {
      toast.error('保存失败')
    }
  }

  const handleDelete = async () => {
    if (!selectedTodo) return

    try {
      await deleteTodo(selectedTodo.id)
      setSelectedTodo(null)
      toast('已删除', { duration: 1500 })
    } catch (error) {
      toast.error('删除失败')
    }
  }

  const handleAddTag = () => {
    const tag = tagInput.trim()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove))
  }

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddTag()
    }
  }

  if (!selectedTodo) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm dark:text-muted-foreground">
        选择一个待办事项查看详情
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-background dark:bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card border-b dark:bg-card dark:border-border">
        <div className="text-sm text-muted-foreground">
          创建于 {new Date(selectedTodo.createdAt).toLocaleDateString('zh-CN')}
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button size="sm" onClick={handleSave}>
              保存
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              if (selectedTodo.archived) {
                await unarchiveTodo(selectedTodo.id)
                toast.success('已取消归档')
              } else {
                await archiveTodo(selectedTodo.id)
                toast.success('已归档')
              }
            }}
          >
            {selectedTodo.archived ? <ArchiveRestore className="h-4 w-4 mr-1" /> : <Archive className="h-4 w-4 mr-1" />}
            {selectedTodo.archived ? '取消归档' : '归档'}
          </Button>
          <Button size="sm" variant="destructive" onClick={handleDelete}>
            删除
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Title */}
        <div>
          <Input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="待办标题"
            className="text-lg font-medium border-none shadow-none px-0 focus-visible:ring-0 bg-transparent"
          />
        </div>

        {/* Due Date */}
        <div className="bg-card rounded-lg p-3 shadow-sm dark:bg-card">
          <label className="text-sm text-muted-foreground mb-2 block dark:text-muted-foreground">截止日期</label>
          <DateTimePicker value={dueDate} onChange={setDueDate} />
        </div>

        {/* Priority */}
        <div className="bg-card rounded-lg p-3 shadow-sm dark:bg-card">
          <label className="text-sm text-muted-foreground mb-2 block dark:text-muted-foreground">优先级</label>
          <PrioritySelector value={priority} onChange={setPriority} />
        </div>

        {/* Description */}
        <div className="bg-card rounded-lg p-3 shadow-sm dark:bg-card">
          <label className="text-sm text-muted-foreground mb-2 block dark:text-muted-foreground">描述</label>
          <Textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="添加描述..."
            className="min-h-[100px] resize-none border-none shadow-none p-0 focus-visible:ring-0 bg-transparent"
          />
        </div>

        {/* Tags */}
        <div className="bg-card rounded-lg p-3 shadow-sm dark:bg-card">
          <label className="text-sm text-muted-foreground mb-2 block dark:text-muted-foreground">标签</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map(tag => (
              <Badge
                key={tag}
                variant="secondary"
                className="cursor-pointer hover:bg-accent dark:hover:bg-accent"
                onClick={() => handleRemoveTag(tag)}
              >
                {tag} ×
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={e => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder="添加标签，回车确认"
              className="text-sm"
            />
            <Button size="sm" variant="outline" onClick={handleAddTag}>
              添加
            </Button>
          </div>
        </div>

        {/* Status */}
        <div className="bg-card rounded-lg p-3 shadow-sm dark:bg-card">
          <label className="text-sm text-muted-foreground mb-2 block dark:text-muted-foreground">状态</label>
          <div className="flex gap-2">
            <Badge
              variant={selectedTodo.status === 'completed' ? 'default' : 'outline'}
              className={cn(
                selectedTodo.status === 'completed' && 'bg-green-500',
                selectedTodo.status === 'expired' && 'bg-red-500'
              )}
            >
              {selectedTodo.status === 'completed' ? '已完成' : selectedTodo.status === 'expired' ? '已过期' : '进行中'}
            </Badge>
            {selectedTodo.completedAt && (
              <span className="text-xs text-muted-foreground self-center dark:text-muted-foreground">
                完成于 {new Date(selectedTodo.completedAt).toLocaleDateString('zh-CN')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
