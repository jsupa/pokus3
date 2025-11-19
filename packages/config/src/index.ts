export interface Config {
  environment: string
  isDev: boolean
  isProd: boolean

  // Database
  mongoUri: string

  // Redis
  redisHost: string

  // Common secrets
  sessionSecret: string
  cookieDomain: string

  // App-specific namespaces
  api?: {
    webPort: string
  }

  auth?: {
    webPort: string
    magicLoginSecret: string
    magicLinkExpiration: string
    magicLoginRedirect: string
  }
}

const config: Config = {
  environment: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://db:27017/dev-001',

  // Redis
  redisHost: process.env.REDIS_HOST || 'redis',

  // Common secrets
  sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
  cookieDomain: process.env.COOKIE_DOMAIN || '.pokus.local',

  // API namespace
  api: {
    webPort: process.env.API_PORT || '3003',
  },

  // Auth namespace
  auth: {
    webPort: process.env.AUTH_PORT || '3002',
    magicLoginSecret: process.env.MAGIC_LOGIN_SECRET || 'default_secret',
    magicLinkExpiration: '15m',
    magicLoginRedirect: process.env.MAGIC_LOGIN_REDIRECT || 'http://dashboard.pokus.local',
  },
}

export default config
