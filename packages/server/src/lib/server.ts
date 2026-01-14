import dayjs from 'dayjs'
import morgan from 'morgan'
import Express from 'express'
import { ZodError } from 'zod'
import passport from 'passport'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import type { Request, Response, NextFunction, Router } from 'express'

import winston from 'winston'
import expressWinston from 'express-winston'
import LokiTransport from 'winston-loki'

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
  name: string
  router: Router
  viewEngine?: string
  viewsPath?: string
  publicPath?: string
}

let errorLogger: winston.Logger

const setupServer = (config: ServerConfig) => {
  app.set('trust proxy', 1)

  // Setup view engine if provided
  if (config.viewEngine) {
    app.set('view engine', config.viewEngine)
    if (config.viewsPath) {
      app.set('views', config.viewsPath)
    }
  }

  // Setup static files if provided
  if (config.publicPath) {
    app.use(Express.static(config.publicPath))
  }

  app.use(ExpressConfig.init) // i18n init middleware
  app.use(Express.json())
  app.use(Express.urlencoded({ extended: true }))

  app.get('/health', (_req: Request, res: Response) => res.send('OK'))

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

  const lokiTransport = new LokiTransport({
    host: 'http://localhost:3100',
    json: true,
    labels: { app: config.name },
    format: winston.format.json(),
    onConnectionError: (err) => console.error('Loki connection error:', err),
  })

  const winstonConfig = expressWinston.logger({
    transports: [lokiTransport],
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    meta: true,
    msg: ':method :url :status - :response-time ms',
    expressFormat: true,
    requestWhitelist: ['url', 'method', 'httpVersion', 'originalUrl', 'query', 'body'],
    responseWhitelist: ['body', 'statusCode'],
    bodyBlacklist: ['password'],
    dynamicMeta: (req: Request, res: Response) => {
      return {
        ip: req.headers['cf-connecting-ip'] || req.ip || 'unknown',
        country: req.headers['cf-ipcountry'] || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown',
        locale: req.getLocale?.() || 'unknown',
        sessionID: req.sessionID || 'unknown',
        userID: req.user ? req.user.id : 'guest',
        responseTime: res.get('X-Response-Time') || undefined,
      }
    },
  })

  errorLogger = winston.createLogger({
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    transports: [lokiTransport],
  })

  app.use(sessionConfig)

  app.use(passport.initialize())
  app.use(passport.session())

  app.use(locals)

  app.use(morgan(':method :url :status :locale - :response-time ms - :sessionID'))

  app.use(winstonConfig)

  app.use('/', config.router)

  app.use((_req: Request, res: Response) => {
    res.status(404)
    throw new Error('error.not_found'.t)
  })

  app.use(errorHandler)
}

const errorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  if (err.message === 'User not found during deserialization') res.status(401)

  if (res.statusCode === 200) res.status(500)

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

  // Log error to Loki
  errorLogger.error({
    message: err.message || 'Internal Server Error',
    statusCode: res.statusCode,
    errorType: err.name || 'Error',
    stack: err.stack,
    request: {
      method: req.method,
      url: req.url,
      originalUrl: req.originalUrl,
      query: req.query,
      body: req.body,
    },
    user: {
      id: req.user ? req.user.id : 'guest',
      sessionID: req.sessionID,
    },
    meta: {
      ip: req.headers['cf-connecting-ip'] || req.ip || 'unknown',
      country: req.headers['cf-ipcountry'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      locale: req.getLocale?.() || 'unknown',
    },
    zodErrors: err instanceof ZodError ? err.issues : undefined,
  })

  // If view engine is configured, render error page, otherwise send JSON
  if (app.get('view engine')) {
    res.render('error', {
      title: payload.error,
      message: err.message || 'Internal Server Error',
      statusCode: res.statusCode,
    })
  } else {
    res.json(payload)
  }
}

const startServer = (port: string) => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`)
  })
}

export { app, setupServer, startServer }
