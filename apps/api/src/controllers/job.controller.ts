import type { Request, Response } from 'express'
import config from '@pokus3/config'
import Job from '@pokus3/db/models/job'
import { upsertScheduler, removeScheduler, getAllSchedulers, addToQueue } from '@pokus3/queue/operations'
import QueueJobLog from '@pokus3/db/models/queue-job-log'
import mongoose from 'mongoose'

const index = async (_req: Request, res: Response) => {
  const jobs = await Job.find({})

  res.json(jobs)
}

const schedulers = async (_req: Request, res: Response) => {
  const jobs = await Job.find({})

  const schedulers = {} as Record<string, any>

  for (const job of jobs) {
    const activeSchedulers = await getAllSchedulers(job.type, config.redisHost)

    if (activeSchedulers.length <= 0) continue

    schedulers[job.type] = activeSchedulers
  }

  res.json(schedulers)
}

const history = async (req: Request, res: Response) => {
  const { id } = req.params
  const pipeline = [
    { $match: { jobId: new mongoose.Types.ObjectId(id) } }, // Filter logs for the specific jobId
    { $sort: { createdAt: -1 } }, // Sort by createdAt descending
    {
      $group: {
        _id: '$queueId', // Group by queueId
        logs: { $push: '$$ROOT' }, // Collect all log documents for each queueId (in descending createdAt order)
        latestCreatedAt: { $first: '$createdAt' }, // Capture the most recent createdAt for sorting groups
      },
    },
    { $sort: { latestCreatedAt: -1 } }, // Sort groups by the most recent createdAt descending
    { $limit: 5 }, // Limit to the last 5 unique queueIds
    {
      $project: {
        _id: 0, // Remove the _id field (which is queueId)
        queueId: '$_id', // Rename _id back to queueId
        logs: 1, // Keep the array of logs
      },
    },
  ] as any[]

  const lastJobLogs = await QueueJobLog.aggregate(pipeline)
  // const lastJobLogs = await QueueJobLog.find({ jobId: id }).sort({ createdAt: -1 }).limit(50).exec()

  res.json(lastJobLogs)
}

const create = async (req: Request, res: Response) => {
  const { name, type, cronExpression, retryAttempts, enable } = req.body

  const job = await Job.create({ name, type, cronExpression, retryAttempts, enable })

  if (enable) {
    await upsertScheduler(type, config.redisHost, job.id, cronExpression, job.name, {
      jobId: job.id,
      payload: job.payload,
    })

    await job.save()
  }

  res.status(201).json(job)
}

const performNow = async (req: Request, res: Response) => {
  const { id } = req.params

  const job = await Job.findById(id)

  if (!job) throw new Error('Job not found')

  await addToQueue(job.type, config.redisHost, { jobId: job.id, payload: job.payload })

  res.status(200).json({ message: 'Job performed successfully' })
}

const archive = async (req: Request, res: Response) => {
  const { id } = req.params

  const job = await Job.findById(id)

  if (!job) throw new Error('Job not found')

  await removeScheduler(job.type, config.redisHost, job.id)

  await job.deleteOne()

  res.status(204).send()
}

const update = async (req: Request, res: Response) => {
  const { id } = req.params
  const { name, type, cronExpression, enable, retryAttempts } = req.body

  const job = await Job.findByIdAndUpdate(id, { name, type, cronExpression, enable, retryAttempts }, { new: true })

  if (!job) {
    return res.status(404).json({ message: 'Job not found' })
  }

  await removeScheduler(job.type, config.redisHost, job.id)

  if (enable) {
    await upsertScheduler(job.type, config.redisHost, job.id, cronExpression, job.name, {
      jobId: job.id,
      payload: job.payload,
    })
  }

  res.json(job)
}

export default { index, schedulers, create, archive, update, performNow, history }
