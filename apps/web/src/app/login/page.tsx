'use client'

import { LoginForm } from '@/components/login-form'
import { useAuth } from '@/contexts/auth-context'
import { useServiceStatus } from '@/hooks/use-service-status'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LoginPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const serviceStatus = useServiceStatus()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm isAuthOnline={serviceStatus.auth} />
      </div>
    </div>
  )
}
