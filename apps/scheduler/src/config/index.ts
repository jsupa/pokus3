const config = {
  environment: process.env.NODE_ENV || 'development',

  mongoUri: process.env.MONGO_URI || 'mongodb://db:27017/dev-001',
  redisHost: process.env.REDIS_HOST || 'redis',

  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',
}

export default config
