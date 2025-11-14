import { z } from 'zod'

const magicLoginSchema = z.object({
  destination: z.email(),
})

const callbackSchema = z.object({
  token: z.string(),
})

export { magicLoginSchema, callbackSchema }
