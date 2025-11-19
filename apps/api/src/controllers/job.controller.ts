import type { Request, Response } from 'express'
import config from '@pokus3/config'
import Job from '@pokus3/db/models/job'
import { upsertScheduler, removeScheduler, getAllSchedulers } from '@pokus3/queue/operations'

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

const create = async (req: Request, res: Response) => {
  const { name, type, cronExpression, retryAttempts, enable } = req.body

  const job = await Job.create({ name, type, cronExpression, retryAttempts, enable })

  if (enable) {
    await upsertScheduler(type, config.redisHost, job.id, cronExpression, job.name, {
      jobId: job.id,
      payload: job.payload,
    })
  }

  res.status(201).json(job)
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

export default { index, schedulers, create, archive, update }
