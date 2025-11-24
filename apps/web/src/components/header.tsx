'use client'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { LogoutButton } from './logout-button'
import { ServiceStatus } from './service-status'
import { ThemeLogo } from './theme-logo'
import { useAuth } from '@/contexts/auth-context'
import { useServiceStatus } from '@/hooks/use-service-status'

export default function Header() {
  // const links = [{ to: '/', label: 'Home' }] as const
  const { isAuthenticated } = useAuth()
  const serviceStatus = useServiceStatus()

  return (
    <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <ThemeLogo className="h-8 w-auto" priority />
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <ServiceStatus
            services={[
              { name: 'Auth', isOnline: serviceStatus.auth },
              { name: 'API', isOnline: serviceStatus.api },
            ]}
          />
          <div className="flex items-center gap-2">
            {isAuthenticated && <LogoutButton />}
            <ModeToggle />
          </div>
        </div>
      </div>
      <hr />
    </div>
  )
}
