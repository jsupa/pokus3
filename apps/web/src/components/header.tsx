'use client'
import Link from 'next/link'
import { ModeToggle } from './mode-toggle'
import { LogoutButton } from './logout-button'
import { ServiceStatus } from './service-status'
import { ThemeLogo } from './theme-logo'
import { useAuth } from '@/contexts/auth-context'
import { useServiceStatus } from '@/hooks/use-service-status'

export default function Header() {
  const links = [{ to: '/', label: 'Home' }] as const
  const { isAuthenticated } = useAuth()
  const serviceStatus = useServiceStatus()

  return (
    <div>
      <div className="flex flex-row items-center justify-between px-2 py-1">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center">
            <ThemeLogo className="h-8 w-auto" priority />
          </Link>
          <nav className="flex gap-4 text-lg">
            {links.map(({ to, label }) => {
              return (
                <Link key={to} href={to}>
                  {label}
                </Link>
              )
            })}
          </nav>
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
