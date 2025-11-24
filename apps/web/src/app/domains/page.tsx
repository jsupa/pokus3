'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { DomainForm } from '@/components/domain/domain-form'
import { DomainsList } from '@/components/domain/domains-list'

interface ValidationMessage {
  path: string[]
  message: string
}

interface ApiResponse {
  success?: boolean
  error?: string
  messages?: ValidationMessage[]
  sessionID?: string
  code?: number
}

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

interface DomainFormData {
  name: string
}

export default function DomainsPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [domains, setDomains] = useState<Domain[]>([])
  const [loadingDomains, setLoadingDomains] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [togglingDomainId, setTogglingDomainId] = useState<string | null>(null)
  const [deletingDomainId, setDeletingDomainId] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<DomainFormData>({
    name: '',
  })

  const fetchDomains = async () => {
    try {
      setLoadingDomains(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/domains`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch domains')
      }

      const data: Domain[] = await response.json()
      setDomains(data)
    } catch (error) {
      toast.error('Failed to load domains')
      console.error('Error fetching domains:', error)
    } finally {
      setLoadingDomains(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchDomains()
    }
  }, [isAuthenticated])

  const handleFormChange = (data: Partial<DomainFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    try {
      setSubmitting(true)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/domains`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      const data: ApiResponse & Domain = await response.json()

      if (response.ok && !data.error) {
        setDomains([data, ...domains])
        toast.success('Domain created successfully')
        setFormData({ name: '' })
      } else if (data.messages?.length) {
        const errors: Record<string, string> = {}
        data.messages.forEach((msg) => {
          const fieldName = msg.path.join('.')
          errors[fieldName] = msg.message
        })
        setValidationErrors(errors)
        toast.error(data.error || 'Validation error')
      } else {
        toast.error(data.error || 'Failed to create domain. Please try again.')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create domain')
      console.error('Error creating domain:', error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleToggleActive = async (domainId: string) => {
    try {
      setTogglingDomainId(domainId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/domains/${domainId}/active`, {
        method: 'PUT',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to toggle domain active status')
      }

      const updatedDomain: Domain = await response.json()

      setDomains(domains.map((domain) => (domain._id === domainId ? updatedDomain : domain)))

      toast.success(`Domain ${updatedDomain.active ? 'activated' : 'deactivated'} successfully`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to toggle domain status')
      console.error('Error toggling domain active status:', error)
    } finally {
      setTogglingDomainId(null)
    }
  }

  const handleDelete = async (domainId: string) => {
    if (!confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      return
    }

    try {
      setDeletingDomainId(domainId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/domains/${domainId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete domain')
      }

      setDomains(domains.filter((domain) => domain._id !== domainId))
      toast.success('Domain deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete domain')
      console.error('Error deleting domain:', error)
    } finally {
      setDeletingDomainId(null)
    }
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    )
  }

  // Auth Check
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center text-muted-foreground">Please log in to access this page.</div>
      </div>
    )
  }

  // Main Render
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Domain Management</h1>
        <p className="text-muted-foreground mt-2">Manage and create domains</p>
      </div>

      {/* Create Domain Form Section */}
      <DomainForm
        formData={formData}
        validationErrors={validationErrors}
        submitting={submitting}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
      />

      {/* Existing Domains List Section */}
      <DomainsList
        domains={domains}
        loading={loadingDomains}
        togglingDomainId={togglingDomainId}
        deletingDomainId={deletingDomainId}
        onToggleActive={handleToggleActive}
        onDelete={handleDelete}
      />
    </div>
  )
}
