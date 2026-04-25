import { useEffect, useState } from 'react'
import { getCurrentWindow } from '@tauri-apps/api/window'
import { FloatingWindow } from './components/FloatingWindow'
import { MainLayout } from './components/MainLayout'

function App() {
  const [windowLabel, setWindowLabel] = useState<string | null>(null)

  useEffect(() => {
    const label = getCurrentWindow().label
    setWindowLabel(label)
  }, [])

  // Wait for window label to be determined
  if (!windowLabel) {
    return null
  }

  // Render different layouts based on window label
  if (windowLabel === 'float') {
    return <FloatingWindow />
  }

  // Main window or any other window
  return <MainLayout />
}

export default App
