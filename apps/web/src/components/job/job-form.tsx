'use client'

import type { FormEvent } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { QUEUE_NAMES } from '@pokus3/queue/config'
import { FormError } from './form-error'

type Job = {
  _id: string
  name: string
  type: (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]
  cronExpression: string
  enable?: boolean
  retryAttempts?: number
  createdAt?: string
  updatedAt?: string
}

interface JobFormData {
  name: string
  type: (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]
  cronExpression: string
  enable: boolean
  retryAttempts: number
}

interface JobFormProps {
  editingJob: Job | null
  formData: JobFormData
  validationErrors: Record<string, string>
  submitting: boolean
  onSubmit: (e: FormEvent) => void
  onChange: (data: Partial<JobFormData>) => void
  onCancel: () => void
}

export function JobForm({
  editingJob,
  formData,
  validationErrors,
  submitting,
  onSubmit,
  onChange,
  onCancel,
}: JobFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</CardTitle>
        <CardDescription>
          {editingJob ? 'Update the job details below' : 'Add a new scheduled job to the system'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {/* Job Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Job Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter job name"
              value={formData.name}
              onChange={(e) => onChange({ name: e.target.value })}
              required
              maxLength={50}
              disabled={submitting}
              className={validationErrors.name ? 'border-red-500' : ''}
            />
            <FormError error={validationErrors.name} />
          </div>

          {/* Job Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Job Type</Label>
            <select
              id="type"
              className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${validationErrors.type ? 'border-red-500' : ''}`}
              value={formData.type}
              onChange={(e) => onChange({ type: e.target.value as (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES] })}
              disabled={submitting}
            >
              {Object.values(QUEUE_NAMES).map((jobType) => (
                <option key={String(jobType)} value={String(jobType)}>
                  {String(jobType).replace('_', ' ')}
                </option>
              ))}
            </select>
            <FormError error={validationErrors.type} />
          </div>

          {/* Cron Expression */}
          <div className="space-y-2">
            <Label htmlFor="cronExpression">Cron Expression</Label>
            <Input
              id="cronExpression"
              type="text"
              placeholder="e.g., 0 0 * * * (every day at midnight)"
              value={formData.cronExpression}
              onChange={(e) => onChange({ cronExpression: e.target.value })}
              required
              maxLength={100}
              disabled={submitting}
              className={validationErrors.cronExpression ? 'border-red-500' : ''}
            />
            {validationErrors.cronExpression ? (
              <FormError error={validationErrors.cronExpression} />
            ) : (
              <p className="text-xs text-muted-foreground">
                Format: minute hour day month weekday (e.g., &quot;0 0 * * *&quot; runs daily at midnight)
              </p>
            )}
          </div>

          {/* Retry Attempts */}
          <div className="space-y-2">
            <Label htmlFor="retryAttempts">Retry Attempts</Label>
            <Input
              id="retryAttempts"
              type="number"
              min={0}
              max={10}
              placeholder="0"
              value={formData.retryAttempts}
              onChange={(e) => onChange({ retryAttempts: parseInt(e.target.value) || 0 })}
              disabled={submitting}
              className={validationErrors.retryAttempts ? 'border-red-500' : ''}
            />
            {validationErrors.retryAttempts ? (
              <FormError error={validationErrors.retryAttempts} />
            ) : (
              <p className="text-xs text-muted-foreground">Number of retry attempts on failure (0-10)</p>
            )}
          </div>

          {/* Enable Job */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable"
                checked={formData.enable}
                onChange={(e) => onChange({ enable: e.target.checked })}
                disabled={submitting}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enable" className="cursor-pointer">
                Enable job
              </Label>
            </div>
            <FormError error={validationErrors.enable} />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-2">
            <Button type="submit" disabled={submitting} className="flex-1">
              {submitting ? (editingJob ? 'Updating...' : 'Creating...') : editingJob ? 'Update Job' : 'Create Job'}
            </Button>
            {editingJob && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={submitting}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
