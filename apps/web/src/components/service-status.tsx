'use client'

import { cn } from '@/lib/utils'

interface ServiceStatusProps {
  services: Array<{
    name: string
    isOnline: boolean
  }>
}

export function ServiceStatus({ services }: ServiceStatusProps) {
  return (
    <div className="flex items-center gap-3">
      {services.map((service) => (
        <div key={service.name} className="flex items-center gap-1.5" title={`${service.name}: ${service.isOnline ? 'Online' : 'Offline'}`}>
          <span className="text-muted-foreground text-xs uppercase tracking-wider">
            {service.name}
          </span>
          <div className="relative">
            <div
              className={cn(
                'h-2 w-2 rounded-full',
                service.isOnline ? 'bg-green-500' : 'bg-red-500'
              )}
            />
            {service.isOnline && (
              <div className="absolute inset-0 animate-ping rounded-full bg-green-500 opacity-75" />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
