// validation.ts
import type { ZodObject } from 'zod'
import type { Request, Response, NextFunction } from 'express'

type Schemas = {
  params?: ZodObject
  query?: ZodObject
  body?: ZodObject
}

const validate = (schemas: Schemas) => (req: Request, res: Response, next: NextFunction) => {
  res.status(400)

  if (schemas.params) schemas.params.parse(req.params)
  if (schemas.query) schemas.query.parse(req.query)
  if (schemas.body) schemas.body.parse(req.body)

  res.status(200)

  return next()
}

export default validate
