import { SettingsSection } from './SettingsSection'
import { AIModelConfig } from './AIModelConfig'
import { ShortcutConfig } from './ShortcutConfig'
import { ThemeConfig } from './ThemeConfig'
import { DataManagement } from './DataManagement'
import { Button } from './ui/button'
import { ArrowLeft, Settings } from 'lucide-react'

interface SettingsPageProps {
  onBack?: () => void
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <div className="h-full flex flex-col bg-background dark:bg-background">
      <div className="bg-card border-b px-4 py-3 flex items-center gap-3 dark:bg-card dark:border-border">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-foreground dark:text-foreground" />
          <h1 className="text-lg font-semibold text-foreground dark:text-foreground">设置</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-[600px] mx-auto">
          <SettingsSection title="AI模型配置">
            <AIModelConfig />
          </SettingsSection>

          <SettingsSection title="快捷键配置" defaultOpen={false}>
            <ShortcutConfig />
          </SettingsSection>

          <SettingsSection title="主题设置">
            <ThemeConfig />
          </SettingsSection>

          <SettingsSection title="数据管理">
            <DataManagement />
          </SettingsSection>
        </div>
      </div>
    </div>
  )
}
