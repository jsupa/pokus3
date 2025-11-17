import type { Request, Response } from 'express'
import Job from '@pokus3/db/models/job'

const index = async (_req: Request, res: Response) => {
  const jobs = await Job.find({})

  res.json(jobs)
}

const create = async (req: Request, res: Response) => {
  const { name, type, cronExpression, retryAttempts } = req.body

  const job = await Job.create({
    name,
    type,
    cronExpression,
    retryAttempts,
  })

  res.status(201).json(job)
}

const archive = async (req: Request, res: Response) => {
  const { id } = req.params

  await Job.deleteById(id)

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

export default { index, create, archive, update }
