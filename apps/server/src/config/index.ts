const config = {
  environment: process.env.NODE_ENV || 'development',

  corsOrigin: process.env.CORS_ORIGIN || 'localhost:3000',

  webPort: process.env.WEB_PORT || '3002',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/dev-001',

  isDev: process.env.NODE_ENV !== 'production',
}

export default config
