const config = {
  environment: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  isProd: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ezaltz-reborn',

  // Redis
  redisHost: process.env.REDIS_HOST || 'localhost',

  // Common secrets
  sessionSecret: process.env.SESSION_SECRET || 'default_session_secret',
  cookieDomain: process.env.COOKIE_DOMAIN || '.ezaltz.com',

  redirectHost: process.env.REDIRECT_HOST || 'https://reborn.ezaltz.com',

  // API namespace
  api: {
    webPort: process.env.API_PORT || '3003',
    host: process.env.API_HOST || 'https://api.ezaltz.com',
  },

  // Auth namespace
  auth: {
    webPort: process.env.AUTH_PORT || '3002',
    host: process.env.AUTH_HOST || 'https://auth.ezaltz.com',

    magicLoginSecret: process.env.MAGIC_LOGIN_SECRET || 'default_secret',
    magicLinkExpiration: '15m',
    redirect: process.env.MAGIC_LOGIN_REDIRECT || 'https://reborn.ezaltz.com/login',

    discordClientId: process.env.DISCORD_CLIENT_ID || '',
    discordClientSecret: process.env.DISCORD_CLIENT_SECRET || '',

    telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',

    steamApiKey: process.env.STEAM_API_KEY || '',
  },

  discord: {
    guildId: process.env.DISCORD_GUILD_ID || '',
    ezaltzToken: process.env.DISCORD_EZALTZ_TOKEN || '',
    ezbotToken: process.env.DISCORD_EZBOT_TOKEN || '',
    memberRoleId: process.env.DISCORD_MEMBER_ROLE_ID || '',
  },

  proxyUrl: process.env.PROXY_URL || '',
  rotationgProxyUrl: process.env.ROTATING_PROXY_URL || '',

  // Orders & Payments
  baseAccountPrice: Number.parseFloat(process.env.BASE_ACCOUNT_PRICE || '0.1'),
  orderExpirationMinutes: Number.parseInt(process.env.ORDER_EXPIRATION_MINUTES || '20', 10),

  // Payment Gateways
  payments: {
    webPort: process.env.PAYMENTS_PORT || '3004',
    host: process.env.PAYMENTS_HOST || 'https://payments.ezaltz.com',
    x402: {
      facilitatorUrl: process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator',
      evmAddress: (process.env.X402_EVM_ADDRESS || '0x03aCA810Ecc763B9d32E9cD2776FAd64f214E5d9') as `0x${string}`,
      svmAddress: process.env.X402_SVM_ADDRESS || 'DrkwxovmRFKDBaU3jZ739CLbNFCKEu9VJkHWd53rA1No',
      network: (process.env.X402_NETWORK || 'eip155:84532') as `${string}:${string}`, // Base Sepolia testnet
      testnet: process.env.X402_TESTNET || 'true',
    },
  },
}

export default config
