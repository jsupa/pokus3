'use client'

import { ThemeProvider } from './theme-provider'
import { Toaster } from './ui/sonner'
import { AuthProvider } from '@/contexts/auth-context'
import { NavigationProvider } from '@/contexts/navigation-context'

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <NavigationProvider>
          {children}
          <Toaster richColors />
        </NavigationProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
