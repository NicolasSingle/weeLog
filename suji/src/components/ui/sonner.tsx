import { Toaster as SonnerToaster } from 'sonner'

export function Toaster() {
  return (
    <SonnerToaster
      position="top-center"
      toastOptions={{
        className: "bg-card border shadow-lg dark:bg-card dark:border-border",
      }}
    />
  )
}
