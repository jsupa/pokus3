const config = {
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
    redirect: process.env.MAGIC_LOGIN_REDIRECT || 'http://dashboard.pokus.local/login',

    discordClientId: process.env.DISCORD_CLIENT_ID || '',
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',

    steamApiKey: process.env.STEAM_API_KEY || '',
  },

  discord: {
    guildId: process.env.DISCORD_GUILD_ID || '',
    botToken: process.env.DISCORD_BOT_TOKEN || '',
    memberRoleId: process.env.DISCORD_MEMBER_ROLE_ID || '',
  },
}

export default config
