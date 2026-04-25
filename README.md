# 速记日报

轻量级桌面端日报与工作管理工具，10秒快速写日报，一键管理待办事项。

## 功能特性

### 悬浮窗口 (Ctrl+Shift+D)
- 全局快捷键 `Ctrl+Shift+D` 唤起/隐藏
- 双标签页设计：
  - **速记**：快速录入今日工作，支持 `#标签` 自动识别
  - **待办**：快速添加和管理待办事项
- 拖拽标题栏可移动窗口
- 贴边隐藏：拖动到屏幕边缘自动收起

### 主窗口
- 通过系统托盘 **"显示主窗口"** 打开
- 左侧边栏导航：
  - **待办**：完整的待办管理（今日/本周/全部/已完成）
  - **日报**：日历视图和时间线视图
  - **设置**：AI配置、主题、数据管理

### 系统托盘
- 左键点击：唤起悬浮窗口
- 右键菜单：
  - 显示主窗口
  - 显示悬浮窗口
  - 退出

## 技术栈

- **框架**：Tauri 2.0 + React 19 + TypeScript
- **前端**：Vite 6 + Tailwind CSS v4 + shadcn/ui
- **状态管理**：Zustand
- **数据库**：SQLite（本地存储）
- **拖拽**：@dnd-kit

## 开发

### 环境要求
- Node.js 18+
- Rust 1.70+
- pnpm

### 安装依赖

```bash
cd suji
pnpm install
```

### 开发模式

```bash
cd suji
pnpm run tauri dev
```

### 构建

```bash
cd suji
pnpm run tauri build
```

## 项目结构

```
suji/
├── src/                    # React 前端源码
│   ├── components/         # React 组件
│   │   ├── FloatingWindow.tsx  # 悬浮窗口
│   │   ├── MainLayout.tsx     # 主窗口布局
│   │   ├── TodoPage.tsx       # 待办页面
│   │   ├── ReportPage.tsx     # 日报页面
│   │   └── SettingsPage.tsx    # 设置页面
│   ├── hooks/              # React Hooks
│   │   ├── useTodos.ts     # 待办相关逻辑
│   │   └── useReports.ts   # 日报相关逻辑
│   ├── lib/                # 工具库
│   │   ├── db.ts          # 数据库操作
│   │   └── store.ts       # Zustand 状态管理
│   ├── types/              # TypeScript 类型定义
│   └── App.tsx             # 应用入口
├── src-tauri/             # Rust 后端源码
│   ├── src/
│   │   └── lib.rs         # Tauri 主逻辑
│   └── tauri.conf.json     # Tauri 配置
└── package.json
```

## 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Shift+D` | 唤起/隐藏悬浮窗口 |
| `Enter` (速记输入框) | 发送日报 |
| `Shift+Enter` | 换行 |

## 数据存储

所有数据均保存在本地 SQLite 数据库中：
- Windows：`%APPDATA%\com.suji.app\suji_data.db`
- macOS：`~/Library/Application Support/com.suji.app/suji_data.db`

支持通过设置页面的"数据管理"功能进行备份和恢复。

## License

MIT
