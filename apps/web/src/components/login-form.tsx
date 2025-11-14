'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_MAGIC_LOGIN_AUTH || '/magiclogin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ destination: email }),
      })

      const data = await response.json()

      if (data.success) {
        setIsSuccess(true)
        toast.success('Magic link sent! Check your email.')
      } else {
        // Show error from server response
        const errorMessage = data.error || 'Failed to send magic link. Please try again.'
        toast.error(errorMessage)
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a magic login link to <strong>{email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Click the link in the email to complete your login. The link will expire in 15 minutes.
          </p>
          <Button
            variant="outline"
            className="mt-4 w-full"
            onClick={() => {
              setIsSuccess(false)
              setEmail('')
            }}
          >
            Send Another Link
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Magic Login</CardTitle>
        <CardDescription>No password needed. We'll send you a login link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
