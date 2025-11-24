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

type JobLog = {
  _id: string
  jobId: string
  queueId: string
  status: string
  data: Record<string, any>
  result?: Record<string, any>
  deleted: boolean
  createdAt: string
  updatedAt: string
}

type JobHistory = {
  logs: JobLog[]
  queueId: string
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
  const [historyData, setHistoryData] = useState<Record<string, JobHistory[]>>({})
  const [loadingHistory, setLoadingHistory] = useState<Set<string>>(new Set())
  const [expandedRuns, setExpandedRuns] = useState<Record<string, boolean>>({})

  const fetchHistory = async (key: string, jobId: string) => {
    setLoadingHistory((prev) => new Set(prev).add(key))

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/job/${jobId}/history`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data: JobHistory[] = await response.json()
        const sorted = data.sort((a, b) => {
          const aCompleted = a.logs[0]?.status === 'completed'
          const bCompleted = b.logs[0]?.status === 'completed'
          if (aCompleted && !bCompleted) return 1
          if (!aCompleted && bCompleted) return -1
          return 0
        })
        setHistoryData((prev) => ({ ...prev, [key]: sorted }))
      }
    } catch (error) {
      console.error('Failed to fetch job history:', error)
    } finally {
      setLoadingHistory((prev) => {
        const newSet = new Set(prev)
        newSet.delete(key)
        return newSet
      })
    }
  }

  const toggleSchedulerDetails = async (key: string, jobId: string) => {
    const isExpanded = expandedSchedulers.has(key)

    setExpandedSchedulers((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(key)) {
        newSet.delete(key)
      } else {
        newSet.add(key)
      }
      return newSet
    })

    // Fetch history if expanding and not already loaded
    if (!isExpanded && !historyData[key]) {
      await fetchHistory(key, jobId)
    }
  }

  const toggleRunExpansion = (queueId: string) => {
    setExpandedRuns((prev) => ({
      ...prev,
      [queueId]: !prev[queueId],
    }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
      case 'active':
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'failed':
        return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'waiting':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300'
    }
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
                    const history = historyData[schedulerJob.key] || []
                    const isLoadingHistory = loadingHistory.has(schedulerJob.key)
                    const latestStatus = history[0]?.logs?.[0]?.status

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
                              {latestStatus && (
                                <span
                                  className={`text-xs px-2 py-1 rounded capitalize ${getStatusColor(latestStatus)}`}
                                >
                                  {latestStatus}
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                              <div>
                                <span className="font-medium">Next Run:</span>{' '}
                                <span className="text-emerald-600 dark:text-emerald-400">
                                  {nextRunDate.toDate().toString()}
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
                            onClick={() => toggleSchedulerDetails(schedulerJob.key, schedulerJob.template.data.jobId)}
                            className="whitespace-nowrap"
                            disabled={isLoadingHistory}
                          >
                            {isLoadingHistory ? 'Loading...' : isExpanded ? 'Hide History' : 'Show History'}
                          </Button>
                        </div>

                        {isExpanded && (
                          <div className="mt-4 pt-4 border-t">
                            {history.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center py-4">No history available</p>
                            ) : (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <h5 className="text-sm font-semibold">Last 5 Runs:</h5>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => fetchHistory(schedulerJob.key, schedulerJob.template.data.jobId)}
                                    disabled={isLoadingHistory}
                                  >
                                    <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                      />
                                    </svg>
                                    Refresh
                                  </Button>
                                </div>
                                {history.map((historyItem, idx) => {
                                  const latestLog = historyItem.logs[0]
                                  const isRunExpanded = expandedRuns[historyItem.queueId] || false

                                  return (
                                    <div key={historyItem.queueId} className="border rounded-lg p-4 bg-muted/30">
                                      <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                          {/* Status Workflow Timeline */}
                                          <div className="flex items-center gap-1 mb-3 flex-wrap">
                                            {historyItem.logs
                                              .slice()
                                              .reverse()
                                              .map((log, logIdx) => (
                                                <div key={log._id} className="flex items-center">
                                                  <div
                                                    className={`relative flex items-center justify-center w-8 h-8 rounded-full ${getStatusColor(log.status)} font-medium text-xs`}
                                                    title={`${log.status} - ${dayjs(log.createdAt).toDate().toString()}`}
                                                  >
                                                    {logIdx === historyItem.logs.length - 1 ? (
                                                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path
                                                          fillRule="evenodd"
                                                          d={
                                                            log.status === 'completed'
                                                              ? 'M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
                                                              : log.status === 'failed'
                                                                ? 'M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                                                                : 'M14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0z'
                                                          }
                                                          clipRule="evenodd"
                                                        />
                                                      </svg>
                                                    ) : (
                                                      <span className="text-[10px] font-bold">
                                                        {log.status.charAt(0).toUpperCase()}
                                                      </span>
                                                    )}
                                                  </div>
                                                  {logIdx < historyItem.logs.length - 1 && (
                                                    <svg
                                                      className="w-4 h-4 mx-0.5 text-muted-foreground"
                                                      viewBox="0 0 24 24"
                                                      fill="currentColor"
                                                    >
                                                      <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
                                                    </svg>
                                                  )}
                                                </div>
                                              ))}
                                          </div>

                                          <div className="text-xs space-y-1">
                                            <div>
                                              <span className="font-medium">Queue ID:</span>{' '}
                                              <code className="bg-muted px-1 py-0.5 rounded">
                                                {historyItem.queueId}
                                              </code>
                                            </div>
                                            <div>
                                              <span className="font-medium">Scheduled At:</span>{' '}
                                              {dayjs(parseInt(historyItem.queueId.split(':').pop() || '0'))
                                                .toDate()
                                                .toString()}
                                            </div>
                                            {latestLog && (
                                              <>
                                                <div>
                                                  <span className="font-medium">Latest Status:</span>{' '}
                                                  <span
                                                    className={`px-1.5 py-0.5 rounded capitalize ${getStatusColor(latestLog.status)}`}
                                                  >
                                                    {latestLog.status}
                                                  </span>
                                                </div>
                                                <div>
                                                  <span className="font-medium">Updated:</span>{' '}
                                                  {dayjs(latestLog.updatedAt).toDate().toString()}
                                                </div>
                                                {latestLog.result && (
                                                  <div>
                                                    <span className="font-medium">Result:</span>{' '}
                                                    <code className="bg-muted px-1 py-0.5 rounded">
                                                      {JSON.stringify(latestLog.result)}
                                                    </code>
                                                  </div>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="h-6 text-xs ml-2"
                                          onClick={() => toggleRunExpansion(historyItem.queueId)}
                                        >
                                          {isRunExpanded ? 'Hide Logs' : `View Logs (${historyItem.logs.length})`}
                                        </Button>
                                      </div>

                                      {isRunExpanded && (
                                        <div className="mt-3 pt-3 border-t">
                                          <h6 className="text-xs font-semibold mb-2">All Logs:</h6>
                                          <pre className="bg-muted p-2 rounded text-xs overflow-x-auto max-h-60 overflow-y-auto">
                                            <code>{JSON.stringify(historyItem.logs, null, 2)}</code>
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </div>
                            )}
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
