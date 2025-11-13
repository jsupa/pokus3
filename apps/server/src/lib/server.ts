import Express from 'express'
import type { Request } from 'express'
import cors from 'cors'
import morgan from 'morgan'

import { ExpressConfig } from '@pokus3/locales'
import config from '@/config'

const app: Express.Application = Express()

// morgan.token('body', (req: Request) => JSON.stringify(req.body))
morgan.token('locale', (req: Request) => req.getLocale())

const setupServer = () => {
  app.set('trust proxy', 1)

  if (config.isDev) app.use(cors({ origin: config.corsOrigin, credentials: true }))

  app.use(ExpressConfig.init)
  app.use(Express.json())
  app.use(Express.urlencoded({ extended: true }))
}

const startServer = (port: string) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export { app, setupServer, startServer }
