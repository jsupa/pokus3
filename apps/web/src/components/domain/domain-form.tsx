'use client'

import type { FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormError } from '../job/form-error'

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

interface DomainFormProps {
  formData: DomainFormData
  validationErrors: Record<string, string>
  submitting: boolean
  onSubmit: (e: FormEvent) => void
  onChange: (data: Partial<DomainFormData>) => void
}

export function DomainForm({ formData, validationErrors, submitting, onSubmit, onChange }: DomainFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Domain</CardTitle>
        <CardDescription>Add a new domain to the system</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Domain Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Domain Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="example.com"
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              required
              maxLength={100}
              disabled={submitting}
              className={validationErrors.name ? 'border-red-500' : ''}
            />
            <FormError error={validationErrors.name} />
            {!validationErrors.name && (
              <p className="text-xs text-muted-foreground">Enter a valid domain name (e.g., example.com)</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" disabled={submitting} className="w-full">
            {submitting ? 'Creating...' : 'Create Domain'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
