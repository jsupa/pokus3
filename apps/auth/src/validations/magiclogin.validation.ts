import { z } from 'zod'

const magicLoginSchema = z.object({
  destination: z.string(),
})

const callbackSchema = z.object({
  token: z.string(),
})

export { magicLoginSchema, callbackSchema }
