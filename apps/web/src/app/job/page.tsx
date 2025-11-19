'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { QUEUE_NAMES } from '@pokus3/queue/config'
import { SchedulersList } from '@/components/job/schedulers-list'
import { JobForm } from '@/components/job/job-form'
import { JobsList } from '@/components/job/jobs-list'

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

type SchedulerJob = {
  key: string
  name: string
  next: number
  iterationCount: number
  pattern: string
  offset: number
  template: {
    data: {
      jobId: string
      payload: Record<string, any>
    }
  }
}

type SchedulersResponse = {
  [queueName: string]: SchedulerJob[]
}

type JobFormData = {
  name: string
  type: (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]
  cronExpression: string
  enable: boolean
  retryAttempts: number
}

export default function JobAdminPage() {
  const { isAuthenticated, isLoading } = useAuth()

  // State
  const [jobs, setJobs] = useState<Job[]>([])
  const [schedulers, setSchedulers] = useState<SchedulersResponse>({})
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingSchedulers, setLoadingSchedulers] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<JobFormData>({
    name: '',
    type: QUEUE_NAMES.EMAIL_DELETION,
    cronExpression: '',
    enable: true,
    retryAttempts: 0,
  })

  // API Functions
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

  const fetchSchedulers = async () => {
    try {
      setLoadingSchedulers(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/schedulers`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Failed to fetch schedulers')
      }

      const data = await response.json()
      setSchedulers(data)
    } catch (error) {
      toast.error('Failed to load schedulers')
      console.error('Error fetching schedulers:', error)
    } finally {
      setLoadingSchedulers(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated) {
      fetchJobs()
      fetchSchedulers()
    }
  }, [isAuthenticated])

  // Event Handlers
  const handleFormChange = (data: Partial<JobFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationErrors({})

    try {
      setSubmitting(true)

      const url = editingJob
        ? `${process.env.NEXT_PUBLIC_API_URL}/job/${editingJob._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/job`

      const response = await fetch(url, {
        method: editingJob ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()

        if (error.code === 400 && error.messages) {
          const errors: Record<string, string> = {}
          error.messages.forEach((msg: any) => {
            const field = msg.path[0]
            errors[field] = msg.message
          })
          setValidationErrors(errors)
          toast.error(error.error || 'Validation error')
          return
        }

        throw new Error(error.message || `Failed to ${editingJob ? 'update' : 'create'} job`)
      }

      const resultJob = await response.json()

      if (editingJob) {
        setJobs(jobs.map((job) => (job._id === resultJob._id ? resultJob : job)))
        toast.success('Job updated successfully')
      } else {
        setJobs([resultJob, ...jobs])
        toast.success('Job created successfully')
      }

      fetchSchedulers()
      resetForm()
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
    setValidationErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const resetForm = () => {
    setEditingJob(null)
    setValidationErrors({})
    setFormData({
      name: '',
      type: QUEUE_NAMES.EMAIL_DELETION,
      cronExpression: '',
      enable: true,
      retryAttempts: 0,
    })
  }

  const handleCancelEdit = () => {
    resetForm()
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
      fetchSchedulers()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete job')
      console.error('Error deleting job:', error)
    } finally {
      setDeletingJobId(null)
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
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please log in to access the job admin page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Main Render
  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Job Administration</h1>
        <p className="text-muted-foreground mt-2">Manage and create scheduled jobs</p>
      </div>

      {/* Active Schedulers Section */}
      <SchedulersList schedulers={schedulers} loading={loadingSchedulers} />

      {/* Create/Edit Job Form Section */}
      <JobForm
        editingJob={editingJob}
        formData={formData}
        validationErrors={validationErrors}
        submitting={submitting}
        onSubmit={handleSubmit}
        onChange={handleFormChange}
        onCancel={handleCancelEdit}
      />

      {/* Existing Jobs List Section */}
      <JobsList
        jobs={jobs}
        loading={loadingJobs}
        deletingJobId={deletingJobId}
        editingJobId={editingJob?._id}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  )
}
