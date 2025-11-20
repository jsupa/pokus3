'use client'

import { useEffect, useState } from 'react'

interface ServiceStatus {
  auth: boolean
  api: boolean
}

export function useServiceStatus() {
  const [status, setStatus] = useState<ServiceStatus>({
    auth: false,
    api: false,
  })

  useEffect(() => {
    const checkServices = async () => {
      // Check Auth service
      try {
        const authResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/health` || '', {
          method: 'HEAD',
          credentials: 'include',
        })
        setStatus((prev) => ({ ...prev, auth: authResponse.ok || authResponse.status < 500 }))
      } catch {
        setStatus((prev) => ({ ...prev, auth: false }))
      }

      // Check API service
      try {
        const apiResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
          method: 'HEAD',
          credentials: 'include',
        })
        setStatus((prev) => ({ ...prev, api: apiResponse.ok || apiResponse.status < 500 }))
      } catch {
        setStatus((prev) => ({ ...prev, api: false }))
      }
    }

    checkServices()
    const interval = setInterval(checkServices, 30000) // Check every 30 seconds

    return () => clearInterval(interval)
  }, [])

  return status
}
