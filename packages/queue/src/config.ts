import type { ConnectionOptions } from 'bullmq'

export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
}

export const QUEUE_NAMES = {
  EMAIL_DELETION: 'email-deletion',
  ACCOUNT_GENERATION: 'account-generation',
  STEAM_COUNTRIES_UPDATE: 'steam-countries-update',
  ORDER_RESERVATION: 'order-reservation',
  ORDER_EXPIRATION: 'order-expiration',
} as const

export type QueueName = (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES]
