import { LoginForm } from '@/components/login-form'

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground mt-2">Enter your email to receive a magic login link</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
