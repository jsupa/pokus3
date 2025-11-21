'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeLogo } from '@/components/theme-logo'
import { toast } from 'sonner'
import * as SimpleIcons from 'simple-icons/icons'

interface ValidationMessage {
  path: string[]
  message: string
}

interface ApiResponse {
  success?: boolean
  error?: string
  messages?: ValidationMessage[]
}

interface LoginFormProps {
  isAuthOnline?: boolean
}

export function LoginForm({ isAuthOnline = true }: LoginFormProps) {
  const [destination, setDestination] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const clearFieldError = (field: string) => {
    setFieldErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }

  const handleValidationErrors = (messages: ValidationMessage[]) => {
    const errors: Record<string, string> = {}
    messages.forEach((msg) => {
      const fieldName = msg.path.join('.')
      errors[fieldName] = msg.message
    })
    setFieldErrors(errors)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!destination) {
      toast.error('Please enter your email address')
      return
    }

    setIsLoading(true)
    setFieldErrors({})

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/magiclogin/` || '/magiclogin/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ destination }),
      })

      const data: ApiResponse = await response.json()

      if (data.success) {
        setIsSuccess(true)
        toast.success('Magic link sent! Check your email.')
      } else if (data.messages?.length) {
        handleValidationErrors(data.messages)
      } else {
        toast.error(data.error || 'Failed to send magic link. Please try again.')
      }
    } catch (error) {
      console.error('Login error:', error)
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setIsSuccess(false)
    setDestination('')
    setFieldErrors({})
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <ThemeLogo className="h-12 w-auto" priority />
          </div>
          <CardTitle>Check Your Email</CardTitle>
          <CardDescription>
            We've sent a magic login link to <strong>{destination}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">
            Click the link in the email to complete your login. The link will expire in 15 minutes.
          </p>
          <Button variant="outline" className="mt-4 w-full" onClick={resetForm}>
            Send Another Link
          </Button>
        </CardContent>
      </Card>
    )
  }

  const handleDiscordLogin = () => {
    const discordAuthUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}/discord` || 'http://auth.pokus.local/discord'
    window.location.href = discordAuthUrl
  }

  const handleSteamLogin = () => {
    const steamAuthUrl = `${process.env.NEXT_PUBLIC_AUTH_URL}/steam` || 'http://auth.pokus.local/steam'
    window.location.href = steamAuthUrl
  }

  return (
    <Card>
      <CardHeader>
        <div className="mb-4 flex justify-center">
          <ThemeLogo className="h-12 w-auto" priority />
        </div>
        <CardTitle>Magic Login</CardTitle>
        <CardDescription>No password needed. We'll send you a login link.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="destination">Email Address</Label>
            <Input
              id="destination"
              name="destination"
              type="email"
              placeholder="you@example.com"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value)
                if (fieldErrors.destination) clearFieldError('destination')
              }}
              disabled={isLoading}
              required
              aria-invalid={!!fieldErrors.destination}
            />
            {fieldErrors.destination && <p className="text-destructive text-sm">{fieldErrors.destination}</p>}
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !isAuthOnline}>
            {isLoading ? 'Sending...' : !isAuthOnline ? 'Auth Service Offline' : 'Send Magic Link'}
          </Button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleDiscordLogin}
          disabled={!isAuthOnline}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d={SimpleIcons.siDiscord.path} />
          </svg>
          Continue with Discord
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full mt-2"
          onClick={handleSteamLogin}
          disabled={!isAuthOnline}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d={SimpleIcons.siSteam.path} />
          </svg>
          Continue with Steam
        </Button>
      </CardContent>
    </Card>
  )
}
