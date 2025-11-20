'use client'

import { useState } from 'react'
import { useNavigation } from '@/contexts/navigation-context'
import { useAuth } from '@/contexts/auth-context'
import { NavigationItemComponent } from './navigation-item'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import type { NavigationItem } from '@/contexts/navigation-context'

export function SideNavigation() {
  const { navigation, isLoading } = useNavigation()
  const { isAuthenticated } = useAuth()
  const [expandedItem, setExpandedItem] = useState<NavigationItem | null>(null)

  // Only show navigation for authenticated users
  if (!isAuthenticated) {
    return null
  }

  // Filter to show only main items
  const mainItems = navigation.filter((item) => item.main)

  const handleItemClick = (item: NavigationItem) => {
    if (item.links && item.links.length > 0) {
      setExpandedItem(expandedItem?.path === item.path ? null : item)
    }
  }

  return (
    <>
      <div className="fixed left-0 top-[57px] bottom-0 w-16 border-r bg-background flex flex-col items-center py-4 gap-2 z-10">
        {isLoading ? (
          // Loading skeleton
          <>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-lg" />
            ))}
          </>
        ) : mainItems.length === 0 ? (
          <div className="text-xs text-muted-foreground text-center px-2 mt-4">No items</div>
        ) : (
          mainItems.map((item) => (
            <NavigationItemComponent
              key={item.path}
              item={item}
              isExpanded={expandedItem?.path === item.path}
              onToggleExpand={handleItemClick}
            />
          ))
        )}
      </div>

      {/* Expanded Panel */}
      {expandedItem && expandedItem.links && expandedItem.links.length > 0 && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/20 z-20" onClick={() => setExpandedItem(null)} />
          {/* Expanded content */}
          <div className="fixed left-16 top-[57px] bottom-0 w-64 border-r bg-background shadow-lg z-30 p-4 overflow-y-auto">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">{expandedItem.name}</h3>
            </div>
            <div className="space-y-1">
              {expandedItem.links.map((link) => (
                <Link
                  key={link.path}
                  href={link.path as any}
                  onClick={() => setExpandedItem(null)}
                  className="block px-3 py-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  )
}
