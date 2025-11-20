'use client'

import { cn } from '@/lib/utils'

interface NavigationIconProps {
  icon: string
  className?: string
}

export function NavigationIcon({ icon, className }: NavigationIconProps) {
  return (
    <span className={cn('material-symbols-outlined', className)} style={{ fontSize: '24px' }} aria-label={icon}>
      {icon}
    </span>
  )
}
