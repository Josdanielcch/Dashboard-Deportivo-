import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/components/auth-context'
import AppContent from '@/components/app-content'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  )
}
