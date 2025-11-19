'use client'

import { useState } from 'react'
import dayjs from 'dayjs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

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

interface SchedulersListProps {
  schedulers: SchedulersResponse
  loading: boolean
}

export function SchedulersList({ schedulers, loading }: SchedulersListProps) {
  const [expandedSchedulers, setExpandedSchedulers] = useState<Set<string>>(new Set())

  const toggleSchedulerDetails = (key: string) => {
    setExpandedSchedulers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Schedulers</CardTitle>
        <CardDescription>Currently running scheduled jobs with next execution times</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-muted-foreground py-4">Loading schedulers...</p>
        ) : Object.keys(schedulers).length === 0 ? (
          <p className="text-center text-muted-foreground py-4">No active schedulers found.</p>
        ) : (
          <div className="space-y-6">
            {Object.entries(schedulers).map(([queueName, jobs]) => (
              <div key={queueName} className="space-y-3">
                <h3 className="text-lg font-semibold capitalize border-b pb-2">{queueName.replace(/-/g, ' ')}</h3>
                <div className="space-y-3">
                  {jobs.map((schedulerJob) => {
                    const nextRunDate = dayjs(schedulerJob.next)
                    const isExpanded = expandedSchedulers.has(schedulerJob.key)

                    return (
                      <div
                        key={schedulerJob.key}
                        className="p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-base">{schedulerJob.name}</h4>
                              <span className="text-xs px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                                Active
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Next Run:</span>{' '}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {nextRunDate.format('MMM D, YYYY h:mm A')}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Pattern:</span>{' '}
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{schedulerJob.pattern}</code>
                              </div>
                              <div>
                                <span className="font-medium">Iterations:</span> {schedulerJob.iterationCount}
                              </div>
                              <div>
                                <span className="font-medium">Job ID:</span>{' '}
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {schedulerJob.template.data.jobId}
                                </code>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleSchedulerDetails(schedulerJob.key)}
                            className="whitespace-nowrap"
                          >
                            {isExpanded ? 'Hide Details' : 'Show Details'}
                          </Button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t">
                            <h5 className="text-sm font-semibold mb-2">Payload:</h5>
                            <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                              <code>{JSON.stringify(schedulerJob.template.data.payload, null, 2)}</code>
                            </pre>
                            <h5 className="text-sm font-semibold mb-2 mt-3">Full Template:</h5>
                            <pre className="bg-muted p-3 rounded-md overflow-x-auto text-xs">
                              <code>{JSON.stringify(schedulerJob.template, null, 2)}</code>
                            </pre>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
