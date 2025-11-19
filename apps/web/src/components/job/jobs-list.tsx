'use client'

import { CronExpressionParser } from 'cron-parser'
import dayjs from 'dayjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { QUEUE_NAMES } from '@pokus3/queue/config'

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

interface JobsListProps {
  jobs: Job[]
  loading: boolean
  deletingJobId: string | null
  editingJobId?: string
  onEdit: (job: Job) => void
  onDelete: (jobId: string) => void
}

function getNextRuntime(cronExpression: string): Date | null {
  try {
    const interval = CronExpressionParser.parse(cronExpression)
    return interval.next().toDate()
  } catch (error) {
    console.error('Error parsing cron expression:', error)
    return null
  }
}

export function JobsList({ jobs, loading, deletingJobId, editingJobId, onEdit, onDelete }: JobsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Existing Jobs</CardTitle>
        <CardDescription>All scheduled jobs in the system</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Loading jobs...</p>
        ) : jobs.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No jobs found. Create your first job above.</p>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const nextRun = getNextRuntime(job.cronExpression)
              const isDeleting = deletingJobId === job._id
              const isEditing = editingJobId === job._id

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
                        Next run: {dayjs(nextRun).format('MMM D, YYYY h:mm A')}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {job.createdAt && <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onEdit(job)} disabled={isDeleting || isEditing}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => onDelete(job._id)} disabled={isDeleting}>
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
  )
}
