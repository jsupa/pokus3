import { z } from 'zod'
import { QUEUE_NAMES } from '@pokus3/queue/config'

const jobCreateSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(Object.values(QUEUE_NAMES)),
  cronExpression: z.string().min(1).max(100),
  enable: z.boolean().optional(),
  retryAttempts: z.number().min(0).max(10).optional(),
})

const jobUpdateSchemaBody = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(Object.values(QUEUE_NAMES)).optional(),
  cronExpression: z.string().min(1).max(100).optional(),
  enable: z.boolean().optional(),
  retryAttempts: z.number().min(0).max(10).optional(),
})

const jobUpdateSchemaParams = z.object({
  id: z.string().length(24),
})

const jobArchiveSchema = z.object({
  id: z.string().length(24),
})

export { jobCreateSchema, jobArchiveSchema, jobUpdateSchemaBody, jobUpdateSchemaParams }
