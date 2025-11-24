'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface Domain {
  _id: string
  name: string
  usesLast24h: number
  banned: boolean
  lastUsedAt: string | null
  bannedDays: number
  deleted: boolean
  active: boolean
  createdAt: string
  updatedAt: string
  __v: number
}

interface DomainsListProps {
  domains: Domain[]
  loading: boolean
  togglingDomainId: string | null
  deletingDomainId: string | null
  onToggleActive: (domainId: string) => void
  onDelete: (domainId: string) => void
}

export function DomainsList({
  domains,
  loading,
  togglingDomainId,
  deletingDomainId,
  onToggleActive,
  onDelete,
}: DomainsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Domains</CardTitle>
        <CardDescription>All domains in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Loading domains...</p>
        ) : domains.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No domains found. Create your first domain above.</p>
        ) : (
          <div className="space-y-4">
            {domains.map((domain) => {
              const isToggling = togglingDomainId === domain._id
              const isDeleting = deletingDomainId === domain._id

              return (
                <div
                  key={domain._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0 gap-4"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{domain.name}</h3>
                      {!domain.active && (
                        <span className="text-xs px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                          Inactive
                        </span>
                      )}
                      {domain.banned && (
                        <span className="text-xs px-2 py-1 rounded bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-200">
                          Banned
                        </span>
                      )}
                      {domain.deleted && (
                        <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                          Deleted
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
                      <span>Uses last 24h: {domain.usesLast24h}</span>
                      {domain.bannedDays > 0 && <span>Banned days: {domain.bannedDays}</span>}
                      {domain.lastUsedAt && <span>Last used: {new Date(domain.lastUsedAt).toLocaleString()}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      <div>Created: {new Date(domain.createdAt).toLocaleDateString()}</div>
                      <div>Updated: {new Date(domain.updatedAt).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onToggleActive(domain._id)}
                        disabled={isToggling || isDeleting || domain.deleted}
                      >
                        {isToggling ? 'Toggling...' : domain.active ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onDelete(domain._id)}
                        disabled={isToggling || isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
