import { z } from 'zod'

const jobCreateSchema = z.object({
  name: z.string().min(1).max(50),
  type: z.enum(['EMAIL_SENDING']),
  cronExpression: z.string().min(1).max(100),
  retryAttempts: z.number().min(0).max(10).optional(),
})

const jobArchiveSchema = z.object({
  id: z.string().length(24),
})

const jobUpdateSchemaBody = z.object({
  name: z.string().min(1).max(50).optional(),
  type: z.enum(['EMAIL_SENDING']).optional(),
  cronExpression: z.string().min(1).max(100).optional(),
  enable: z.boolean().optional(),
  retryAttempts: z.number().min(0).max(10).optional(),
})

const jobUpdateSchemaParams = z.object({
  id: z.string().length(24),
})

export { jobCreateSchema, jobArchiveSchema, jobUpdateSchemaBody, jobUpdateSchemaParams }
