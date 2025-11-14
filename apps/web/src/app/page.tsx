'use client'

import { LoginForm } from '@/components/login-form'

export default function Home() {
  return (
    <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4">
      <div className="w-full max-w-md">
        <LoginForm />
      </div>
    </div>
  )
}
