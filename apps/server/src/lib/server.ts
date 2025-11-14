import cors from 'cors'
import dayjs from 'dayjs'
import morgan from 'morgan'
import Express from 'express'
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import type { Request, Response, NextFunction } from 'express'

import { ExpressConfig } from '@pokus3/locales'
import locals from '@/lib/locals'
import config from '@/config'
import router from '@router'

import '@/config/passport'

const app: Express.Application = Express()

// morgan.token('body', (req: Request) => JSON.stringify(req.body))
morgan.token('locale', (req: Request) => req.getLocale())

const setupServer = () => {
  app.set('trust proxy', 1)

  if (config.isDev) app.use(cors({ origin: config.corsOrigin, credentials: true }))

  app.use(ExpressConfig.init) // i18n init middleware
  app.use(Express.json())
  app.use(Express.urlencoded({ extended: true }))

  app.use(sessionConfig)

  app.use(passport.initialize())
  app.use(passport.session())

  app.use(locals)

  app.use(morgan(':method :url :status :locale - :response-time ms'))

  app.use('/', router)

  app.use((_req: Request, res: Response) => {
    res.status(404)
    throw new Error('error.not_found'.t)
  })

  app.use(errorHandler)
}

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  // console.error(err.stack)
  res.json({ sessionID: req.sessionID, code: res.statusCode, error: err.message || 'Internal Server Error' })
}

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
    maxAge: dayjs().add(30, 'day').toDate().getTime(),
  },
  saveUninitialized: false,
})

const startServer = (port: string) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export { app, setupServer, startServer }
