'use client'

import Link from 'next/link'
import { NavigationIcon } from './navigation-icon'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { NavigationItem } from '@/contexts/navigation-context'
import { useAuth } from '@/contexts/auth-context'

interface NavigationItemProps {
  item: NavigationItem
  isExpanded?: boolean
  onToggleExpand?: (item: NavigationItem) => void
}

export function NavigationItemComponent({ item, isExpanded, onToggleExpand }: NavigationItemProps) {
  const { isAdmin } = useAuth()

  // Hide admin-only items for non-admin users
  if (item.adminOnly && !isAdmin) {
    return null
  }

  const isExternal = item.path.startsWith('http://') || item.path.startsWith('https://')
  const hasSubLinks = item.links && item.links.length > 0

  const iconButton = (
    <div
      className={cn(
        'flex items-center justify-center w-10 h-10 rounded-lg transition-colors cursor-pointer',
        'hover:bg-accent hover:text-accent-foreground',
        isExpanded && 'bg-accent',
      )}
    >
      <NavigationIcon icon={item.icon} className="text-xl" />
    </div>
  )

  const handleClick = (e: React.MouseEvent) => {
    if (hasSubLinks) {
      e.preventDefault()
      onToggleExpand?.(item)
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          {hasSubLinks ? (
            <button onClick={handleClick}>{iconButton}</button>
          ) : isExternal ? (
            <a href={item.path} target="_blank" rel="noopener noreferrer">
              {iconButton}
            </a>
          ) : (
            <Link href={item.path as any}>{iconButton}</Link>
          )}
        </TooltipTrigger>
        <TooltipContent side="right">
          <div className="font-medium">{item.name}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
