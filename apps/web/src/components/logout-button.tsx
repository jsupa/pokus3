'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'

export function LogoutButton() {
  const { logout } = useAuth()

  return (
    <Button variant="outline" size="icon" onClick={logout}>
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Logout</span>
    </Button>
  )
}
