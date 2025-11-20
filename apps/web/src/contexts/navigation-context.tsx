'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'

export interface NavigationLink {
  name: string
  path: string
  main?: boolean
}

export interface NavigationItem {
  name: string
  icon: string
  path: string
  main?: boolean
  adminOnly?: boolean
  links?: NavigationLink[]
}

interface NavigationContextType {
  navigation: NavigationItem[]
  isLoading: boolean
  fetchNavigation: () => Promise<void>
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNavigation = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/navigation`, {
        method: 'GET',
        credentials: 'include',
      })

      if (response.ok) {
        const data = await response.json()
        setNavigation(data.navigation || [])
      } else {
        setNavigation([])
      }
    } catch (error) {
      console.error('Navigation fetch error:', error)
      setNavigation([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNavigation()
  }, [])

  return (
    <NavigationContext.Provider value={{ navigation, isLoading, fetchNavigation }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const context = useContext(NavigationContext)
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider')
  }
  return context
}
