import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-context'
import { ToastProvider } from '@/contexts/toast-context'
import AppContent from '@/components/app-content'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
