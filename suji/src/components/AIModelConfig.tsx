import { useState, useEffect } from 'react'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Slider } from './ui/slider'
import { toast } from 'sonner'
import { LazyStore } from '@tauri-apps/plugin-store'

interface AIModelConfigProps {
  onSettingsChange?: (settings: AIConfig) => void
}

export interface AIConfig {
  apiKey: string
  modelName: string
  temperature: number
  maxTokens: number
}

const DEFAULT_CONFIG: AIConfig = {
  apiKey: '',
  modelName: 'abab6.5s-chat',
  temperature: 0.7,
  maxTokens: 2000,
}

const store = new LazyStore('settings.json')

export function AIModelConfig({ onSettingsChange }: AIModelConfigProps) {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG)
  const [showApiKey, setShowApiKey] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        await store.init()
        const savedConfig = await store.get<AIConfig>('aiConfig')
        if (savedConfig) {
          setConfig(savedConfig)
        }
      } catch (error) {
        console.error('Failed to load AI config:', error)
      }
    }
    loadSettings()
  }, [])

  const updateConfig = async (updates: Partial<AIConfig>) => {
    const newConfig = { ...config, ...updates }
    setConfig(newConfig)
    onSettingsChange?.(newConfig)

    try {
      await store.set('aiConfig', newConfig)
    } catch (error) {
      console.error('Failed to save AI config:', error)
    }
  }

  const validateApiKey = (key: string): boolean => {
    if (!key) return true
    return key.length >= 10 && (key.startsWith('sk-') || key.length > 20)
  }

  const handleApiKeyChange = (value: string) => {
    if (!validateApiKey(value) && value.length > 0) {
      toast.error('API Key 格式不正确')
      return
    }
    updateConfig({ apiKey: value })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">API Key</label>
        <div className="flex gap-2">
          <Input
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => handleApiKeyChange(e.target.value)}
            placeholder="请输入 API Key"
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? '隐藏' : '显示'}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">模型名称</label>
        <Input
          type="text"
          value={config.modelName}
          onChange={(e) => updateConfig({ modelName: e.target.value })}
          placeholder="abab6.5s-chat"
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-foreground">Temperature</label>
          <span className="text-sm text-muted-foreground">{config.temperature.toFixed(1)}</span>
        </div>
        <Slider
          value={config.temperature}
          onChange={(value) => updateConfig({ temperature: value })}
          min={0}
          max={1}
          step={0.1}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>精确</span>
          <span>创意</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">最大 Token 数</label>
        <Input
          type="number"
          value={config.maxTokens}
          onChange={(e) => updateConfig({ maxTokens: parseInt(e.target.value) || 2000 })}
          min={100}
          max={100000}
        />
      </div>
    </div>
  )
}
