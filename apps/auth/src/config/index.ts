const config = {
  environment: process.env.NODE_ENV || 'development',

  corsOrigin: process.env.CORS_ORIGIN || 'localhost:3000',

  webPort: process.env.WEB_PORT || '3002',
  mongoUri: process.env.MONGO_URI || 'mongodb://db:27017/dev-001',

  sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
  cookieDomain: process.env.COOKIE_DOMAIN || '.pokus.local',

  magicLoginSecret: process.env.MAGIC_LOGIN_SECRET || 'default_secret',
  magicLinkExpiration: '15m',
  magicLoginRedirect: process.env.MAGIC_LOGIN_REDIRECT || 'http://dashboard.pokus.local',

  jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',

  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
}

export default config
