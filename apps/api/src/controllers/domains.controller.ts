import type { Request, Response } from 'express'
import Domain from '@pokus3/db/models/domain'

const index = async (_req: Request, res: Response) => {
  const domains = await Domain.find({})

  res.json(domains)
}

const create = async (req: Request, res: Response) => {
  const { name } = req.body

  const domain = new Domain({ name })

  await domain.checkDup()
  await domain.save()

  res.status(201).json(domain)
}

const toggleActive = async (req: Request, res: Response) => {
  const { id } = req.params

  const domain = await Domain.findById(id)

  if (!domain) throw new Error('Domain not found')

  domain.active = !domain.active

  await domain.save()

  res.json(domain)
}

const archive = async (req: Request, res: Response) => {
  const { id } = req.params

  const domain = await Domain.findById(id)

  if (!domain) throw new Error('Domain not found')

  await domain.deleteOne()

  res.status(204).send()
}

export default { index, create, toggleActive, archive }
