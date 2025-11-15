import dayjs from 'dayjs'
import morgan from 'morgan'
import Express from 'express'
import { ZodError } from 'zod'
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import type { Request, Response, NextFunction, Router } from 'express'

import { ExpressConfig } from '@pokus3/locales'
import locals from './locals'

const app: Express.Application = Express()

// morgan.token('body', (req: Request) => JSON.stringify(req.body))
morgan.token('locale', (req: Request) => req.getLocale())
morgan.token('sessionID', (req: Request) => req.sessionID || '')

export interface ServerConfig {
  mongoUri: string
  sessionSecret: string
  cookieDomain: string
  isProd: boolean
  router: Router
}

const setupServer = (config: ServerConfig) => {
  app.set('trust proxy', 1)

  app.use(ExpressConfig.init) // i18n init middleware
  app.use(Express.json())
  app.use(Express.urlencoded({ extended: true }))

  const store = MongoStore.create({
    mongoUrl: config.mongoUri,
    collectionName: 'sessions',
  })

  const sessionConfig = session({
    secret: config.sessionSecret,
    name: 'supreme_red_oreo',
    resave: false,
    store: store as any,
    cookie: {
      httpOnly: true,
      secure: config.isProd,
      domain: config.cookieDomain,
      sameSite: 'lax',
      maxAge: dayjs().add(30, 'day').toDate().getTime(),
    },
    saveUninitialized: true,
    proxy: true,
  })

  app.use(sessionConfig)

  app.use(passport.initialize())
  app.use(passport.session())

  app.use(locals)

  app.use(morgan(':method :url :status :locale - :response-time ms - :sessionID'))

  app.use('/', config.router)

  app.use((_req: Request, res: Response) => {
    res.status(404)
    throw new Error('error.not_found'.t)
  })

  app.use(errorHandler)
}

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const payload = {
    sessionID: req.sessionID,
    code: res.statusCode,
    error: err.message || 'Internal Server Error',
    messages: undefined as any,
  }

  if (err instanceof ZodError) {
    payload.error = 'Validation error'
    payload.messages = err.issues
  }

  res.json(payload)
}

const startServer = (port: string) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export { app, setupServer, startServer }
