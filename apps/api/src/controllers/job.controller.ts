import type { Request, Response } from 'express'
import { Queue } from 'bullmq'
import config from '@config'
import Job from '@pokus3/db/models/job'

const index = async (_req: Request, res: Response) => {
  const jobs = await Job.find({})

  res.json(jobs)
}

const schedulers = async (_req: Request, res: Response) => {
  const jobs = await Job.find({})

  const schedulers = {} as Record<string, any>

  for (const job of jobs) {
    const activeSchedulers = await getActiveJobsStauses(job.type)

    schedulers[job.type] = activeSchedulers
  }

  res.json(schedulers)
}

const create = async (req: Request, res: Response) => {
  const { name, type, cronExpression, retryAttempts, enable } = req.body

  const job = await Job.create({ name, type, cronExpression, retryAttempts, enable })

  if (enable) {
    const queue = new Queue(type, {
      connection: { host: config.redisHost },
    })

    await queue.upsertJobScheduler(
      job.id,
      { pattern: cronExpression },
      { name: job.name, data: { jobId: job.id, payload: job.payload } },
    )

    await queue.close()
  }

  res.status(201).json(job)
}

const archive = async (req: Request, res: Response) => {
  const { id } = req.params

  const job = await Job.findById(id)

  if (!job) throw new Error('Job not found')

  const queue = new Queue(job.type, {
    connection: { host: config.redisHost },
  })

  await queue.removeJobScheduler(job.id)

  await queue.close()

  await job.deleteOne()

  res.status(204).send()
}

const update = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, type, cronExpression, enable, retryAttempts } = req.body

  const job = await Job.findByIdAndUpdate(
    id,
    {
      name,
      type,
      cronExpression,
      enable,
      retryAttempts,
    },
    { new: true },
  )

  if (!job) {
    return res.status(404).json({ message: 'Job not found' })
  }

  res.json(job)
}

export default { index, schedulers, create, archive, update }

const getActiveJobsStauses = async (queueType: string) => {
  const queue = new Queue(queueType, {
    connection: { host: config.redisHost },
  })

  const existingSchedulers = await queue.getJobSchedulers(0, 100)

  await queue.close()

  return existingSchedulers
}

const getActiveJobsInQueue = async (queueType: string) => {
  const queue = new Queue(queueType, {
    connection: { host: config.redisHost },
  })

  const activeJobs = await queue.getJobCounts('wait', 'completed', 'failed', 'repeat')

  await queue.close()

  return activeJobs
}
