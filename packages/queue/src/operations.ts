import { Job, Queue, type JobType } from 'bullmq'

export interface SchedulerOptions {
  pattern: string
  startDate?: Date
  endDate?: Date
}

export interface JobData {
  jobId: string
  payload?: any
}

/**
 * Creates a new Queue instance
 */
export function createQueue(queueName: string, redisHost: string): Queue {
  return new Queue(queueName, {
    connection: { host: redisHost },
  })
}

/**
 * Upserts a job scheduler in the queue
 */
export async function upsertJobScheduler(
  queue: Queue,
  schedulerId: string,
  schedulerOptions: SchedulerOptions,
  jobOptions: { name: string; data: JobData },
): Promise<Job> {
  return await queue.upsertJobScheduler(schedulerId, schedulerOptions, jobOptions)
}

/**
 * Removes a job scheduler from the queue
 */
export async function removeJobScheduler(queue: Queue, schedulerId: string): Promise<void> {
  await queue.removeJobScheduler(schedulerId)
}

/**
 * Gets all job schedulers from the queue
 */
export async function getJobSchedulers(queue: Queue, start = 0, end = 100) {
  const scheduler = await queue.getJobSchedulers(start, end)
  return scheduler
}

export async function addToQueue(queueName: string, redisHost: string, jobData: JobData): Promise<void> {
  withQueue(queueName, redisHost, async (queue) => {
    const job = await queue.add('immediate-job', jobData)
    return job
  })
}

/**
 * Gets job counts for various states
 */
export async function getJobCounts(queue: Queue, ...types: JobType[]) {
  return await queue.getJobCounts(...types)
}

/**
 * Helper to create queue, perform operation, and close
 */
export async function withQueue<T>(
  queueName: string,
  redisHost: string,
  operation: (queue: Queue) => Promise<T>,
): Promise<T> {
  const queue = createQueue(queueName, redisHost)
  try {
    return await operation(queue)
  } finally {
    await queue.close()
  }
}

/**
 * High-level function to upsert a scheduler
 */
export async function upsertScheduler(
  queueName: string,
  redisHost: string,
  schedulerId: string,
  cronExpression: string,
  jobName: string,
  jobData: JobData,
): Promise<Job> {
  return await withQueue(queueName, redisHost, async (queue) => {
    return await upsertJobScheduler(queue, schedulerId, { pattern: cronExpression }, { name: jobName, data: jobData })
  })
}

/**
 * Perform Now a job by ID
 */
export async function performJobNow(queueName: string, redisHost: string, jobId: string): Promise<void> {
  await withQueue(queueName, redisHost, async (queue) => {
    // console.log(await queue.getJobs())
    const job = await queue.getJob(jobId)
    if (!job) throw new Error('Job not found')
    await job.promote()
    // console.log(job)
  })
}

/**
 * High-level function to remove a scheduler
 */
export async function removeScheduler(queueName: string, redisHost: string, schedulerId: string): Promise<void> {
  await withQueue(queueName, redisHost, async (queue) => {
    await removeJobScheduler(queue, schedulerId)
  })
}

/**
 * High-level function to get all schedulers
 */
export async function getAllSchedulers(queueName: string, redisHost: string, start = 0, end = 100) {
  return await withQueue(queueName, redisHost, async (queue) => {
    return await getJobSchedulers(queue, start, end)
  })
}

/**
 * High-level function to get queue job counts
 */
export async function getQueueJobCounts(queueName: string, redisHost: string, ...types: JobType[]) {
  return await withQueue(queueName, redisHost, async (queue) => {
    return await getJobCounts(queue, ...types)
  })
}
