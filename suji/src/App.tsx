import { useEffect, useState, Component, ReactNode } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { FloatingWindow } from './components/FloatingWindow'
import { MainLayout } from './components/MainLayout'

// Error boundary to catch runtime errors
class ErrorBoundary extends Component<
  { children: ReactNode; windowLabel: string },
  { error: Error | null }
> {
  constructor(props: { children: ReactNode; windowLabel: string }) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`[${this.props.windowLabel}] React error:`, error, errorInfo)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 20, fontFamily: 'monospace', color: '#ff4444', background: '#1a1a1a', height: '100vh', overflow: 'auto' }}>
          <h2>渲染错误 ({this.props.windowLabel})</h2>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13 }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}

function App() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null)

  useEffect(() => {
    const label = getCurrentWindow().label
    console.log('[App] Window label:', label)
    setWindowLabel(label)
  }, [])

  // Wait for window label to be determined
  if (!windowLabel) {
    return null
  }

  // Render different layouts based on window label
  if (windowLabel === 'float') {
    return (
      <ErrorBoundary windowLabel={windowLabel}>
        <FloatingWindow />
      </ErrorBoundary>
    )
  }

  // Main window or any other window
  return (
    <ErrorBoundary windowLabel={windowLabel}>
      <MainLayout />
    </ErrorBoundary>
  )
}

export default App
