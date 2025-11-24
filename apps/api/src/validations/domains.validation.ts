import { z } from 'zod'

const domainCreateSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(100)
    .regex(/^(?!-)(?:[a-zA-Z0-9-]{0,62}[a-zA-Z0-9]\.)+[a-zA-Z]{2,63}$/),
})

export { domainCreateSchema }
