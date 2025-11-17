'use client'

import { useEffect, useState } from 'react'
import { CronExpressionParser } from 'cron-parser'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

type Job = {
  _id: string
  name: string
  type: 'EMAIL_SENDING'
  cronExpression: string
  enable?: boolean
  retryAttempts?: number
  createdAt?: string
  updatedAt?: string
}

export default function JobAdminPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    type: 'EMAIL_SENDING' as const,
    cronExpression: '',
    enable: true,
    retryAttempts: 0,
  })

  const getNextRuntime = (cronExpression: string) => {
    try {
      const interval = CronExpressionParser.parse(cronExpression)
      return interval.next().toDate()
    } catch (error) {
      console.error('Error parsing cron expression:', error)
      return null
    }
  }

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch jobs')
      }

      const data = await response.json()
      setJobs(data)
    } catch (error) {
      toast.error('Failed to load jobs')
      console.error('Error fetching jobs:', error)
    } finally {
      setLoadingJobs(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs()
    }
  }, [isAuthenticated])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSubmitting(true)

      if (editingJob) {
        // Update existing job
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${editingJob._id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to update job')
        }

        const updatedJob = await response.json()
        setJobs(jobs.map((job) => (job._id === updatedJob._id ? updatedJob : job)))
        toast.success('Job updated successfully')
      } else {
        // Create new job
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify(formData),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to create job')
        }

        const newJob = await response.json()
        setJobs([newJob, ...jobs])
        toast.success('Job created successfully')
      }

      setFormData({
        name: '',
        type: 'EMAIL_SENDING',
        cronExpression: '',
        enable: true,
        retryAttempts: 0,
      })
      setEditingJob(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to ${editingJob ? 'update' : 'create'} job`)
      console.error(`Error ${editingJob ? 'updating' : 'creating'} job:`, error)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (job: Job) => {
    setEditingJob(job)
    setFormData({
      name: job.name,
      type: job.type,
      cronExpression: job.cronExpression,
      enable: job.enable ?? true,
      retryAttempts: job.retryAttempts ?? 0,
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleCancelEdit = () => {
    setEditingJob(null)
    setFormData({
      name: '',
      type: 'EMAIL_SENDING',
      cronExpression: '',
      enable: true,
      retryAttempts: 0,
    })
  }

  const handleDelete = async (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) {
      return
    }

    try {
      setDeletingJobId(jobId)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to delete job')
      }

      setJobs(jobs.filter((job) => job._id !== jobId))
      toast.success('Job deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete job')
      console.error('Error deleting job:', error)
    } finally {
      setDeletingJobId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <p className="text-center text-muted-foreground">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the job admin page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Administration</h1>
        <p className="text-muted-foreground mt-2">Manage and create scheduled jobs</p>
      </div>

      {/* Create Job Form */}
      <Card>
        <CardHeader>
          <CardTitle>{editingJob ? 'Edit Job' : 'Create New Job'}</CardTitle>
          <CardDescription>
            {editingJob ? 'Update the job details below' : 'Add a new scheduled job to the system'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Job Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter job name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                maxLength={50}
                disabled={submitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <select
                id="type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'EMAIL_SENDING' })}
                disabled={submitting}
              >
                <option value="EMAIL_SENDING">EMAIL_SENDING</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cronExpression">Cron Expression</Label>
              <Input
                id="cronExpression"
                type="text"
                placeholder="e.g., 0 0 * * * (every day at midnight)"
                value={formData.cronExpression}
                onChange={(e) => setFormData({ ...formData, cronExpression: e.target.value })}
                required
                maxLength={100}
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">
                Format: minute hour day month weekday (e.g., &quot;0 0 * * *&quot; runs daily at midnight)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retryAttempts">Retry Attempts</Label>
              <Input
                id="retryAttempts"
                type="number"
                min={0}
                max={10}
                placeholder="0"
                value={formData.retryAttempts}
                onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value) || 0 })}
                disabled={submitting}
              />
              <p className="text-xs text-muted-foreground">Number of retry attempts on failure (0-10)</p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enable"
                checked={formData.enable}
                onChange={(e) => setFormData({ ...formData, enable: e.target.checked })}
                disabled={submitting}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="enable" className="cursor-pointer">
                Enable job
              </Label>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? (editingJob ? 'Updating...' : 'Creating...') : editingJob ? 'Update Job' : 'Create Job'}
              </Button>
              {editingJob && (
                <Button type="button" variant="outline" onClick={handleCancelEdit} disabled={submitting}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Jobs List */}
      <Card>
        <CardHeader>
          <CardTitle>Existing Jobs</CardTitle>
          <CardDescription>All scheduled jobs in the system</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingJobs ? (
            <p className="text-center text-muted-foreground py-4">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No jobs found. Create your first job above.</p>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => {
                const nextRun = getNextRuntime(job.cronExpression)
                const isDeleting = deletingJobId === job._id
                return (
                  <div
                    key={job._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg space-y-2 sm:space-y-0 gap-4"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{job.name}</h3>
                        {job.enable === false && (
                          <span className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                            Disabled
                          </span>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-sm text-muted-foreground">
                        <span>Type: {job.type}</span>
                        <span>Cron: {job.cronExpression}</span>
                        {job.retryAttempts !== undefined && job.retryAttempts > 0 && (
                          <span>Retries: {job.retryAttempts}</span>
                        )}
                      </div>
                      {nextRun && job.enable !== false && (
                        <div className="text-sm text-emerald-600 dark:text-emerald-400">
                          Next run: {nextRun.toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {job.createdAt && <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(job)}
                        disabled={isDeleting || editingJob?._id === job._id}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(job._id)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
