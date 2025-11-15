'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import logoDark from '@/app/logo-dark.png'
import logoLight from '@/app/logo-light.png'

interface ThemeLogoProps {
  className?: string
  priority?: boolean
}

export function ThemeLogo({ className, priority }: ThemeLogoProps) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <div className={className} />
  }

  return (
    <Image src={resolvedTheme === 'dark' ? logoDark : logoLight} alt="Logo" className={className} priority={priority} />
  )
}
