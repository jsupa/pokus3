'use client'

import { LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      await fetch(process.env.NEXT_PUBLIC_LOGOUT_URL || '/logout', {
        method: 'GET',
        credentials: 'include',
      })
      window.location.reload()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <Button variant="outline" size="icon" onClick={handleLogout}>
      <LogOut className="h-[1.2rem] w-[1.2rem]" />
      <span className="sr-only">Logout</span>
    </Button>
  )
}
