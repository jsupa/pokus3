import cors from 'cors'
import morgan from 'morgan'
import Express from 'express'
import passport from 'passport'
import type { Request, Response, NextFunction } from 'express'

import { ExpressConfig } from '@pokus3/locales'
import config from '@/config'
import router from '@router'

import '@/config/passport'

const app: Express.Application = Express()

// morgan.token('body', (req: Request) => JSON.stringify(req.body))
morgan.token('locale', (req: Request) => req.getLocale())

const setupServer = () => {
  app.set('trust proxy', 1)

  if (config.isDev) app.use(cors({ origin: config.corsOrigin, credentials: true }))

  app.use(ExpressConfig.init)
  app.use(Express.json())
  app.use(Express.urlencoded({ extended: true }))

  app.use(passport.initialize())

  app.use('/', router)

  app.use((_req: Request, res: Response) => {
    res.status(404)
    throw new Error('Not Found')
  })

  app.use(errorHandler)
}

const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  // console.error(err.stack)
  res.json({ code: res.statusCode, error: err.message || 'Internal Server Error' })
}

const startServer = (port: string) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export { app, setupServer, startServer }
