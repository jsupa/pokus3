'use client'

import { LoginForm } from '@/components/login-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/auth-context'
import { useServiceStatus } from '@/hooks/use-service-status'

export default function Home() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const serviceStatus = useServiceStatus()

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">Loading...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <CardTitle>Welcome Back!</CardTitle>
              <CardDescription>
                You are successfully logged in{user.email && ` as ${user.email}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={logout} variant="outline" className="w-full">
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm isAuthOnline={serviceStatus.auth} />
      </div>
    </div>
  )
}
