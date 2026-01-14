import passport from 'passport'
import _MagicLoginStrategy from 'passport-magic-login'
import { Strategy as DiscordStrategy, type Profile } from 'passport-discord-auth'
import SteamStrategy from 'passport-steam'
import { TelegramStrategy } from 'passport-telegram-official'
import got from 'got'
import dayjs from 'dayjs'
import crypto from 'crypto'

import type { DoneCallback, PassportTelegramUser } from 'passport-telegram-official/dist/types'
import type { Request } from 'express'

import { setupPassportSerialization, checkAuth, checkLogin } from '@pokus3/passport'
import { ButtonBuilder, ActionRowBuilder, ButtonStyle } from '@pokus3/discord'
import User from '@pokus3/db/models/user'
import config from '@pokus3/config'
import { Log } from '@pokus3/logger'

// @ts-ignore
const MagicLoginStrategy = _MagicLoginStrategy.default

// define payload in verifyUser
interface UserPayload {
  email?: string
  discordId?: string
  telegramId?: string
  hash?: string
  username?: string
  mfaEnabled?: boolean
  code?: number
}

const verifyUser = async (payload: UserPayload, done: Function) => {
  const email = payload.email
  const discordId = payload.discordId
  const telegramId = payload.telegramId
  const hash = payload.hash
  const username = payload.username
  const mfaEnabled = payload.mfaEnabled || false
  const code = payload.code

  try {
    const filter: any = {}

    if (username && code) filter.username = username
    if (discordId && username && email) filter.discordId = discordId
    if (telegramId && hash) filter.telegramId = telegramId

    if (telegramId && hash) filter.hash = { $ne: hash } // prevent reuse of the same hash

    if (code) filter.lastLoginCode = code

    Log.info({ message: 'Verifying user with filter', filter, payload })

    if (Object.keys(filter).length === 0) {
      Log.warn({ message: 'Insufficient information to verify user', payload })
      throw new Error('Insufficient information to verify user')
    }

    const user = await User.findOne(filter)

    if (user) await user.updateOne({ lastLoginCode: null, lastLoginUrl: null, hash })

    if (user) return done(null, user)

    if (user && hash) throw new Error('Invalid or already used login') // telegram login reuse check
    if (code) throw new Error('Invalid magic login code') // magic login code check

    const newUser = await User.create({ email, username, discordId, mfaEnabled, telegramId, hash })

    Log.info({ message: 'New user created', newUser })

    return done(null, newUser)
  } catch (error: any) {
    console.error('Error in verifyUser:', error.message, payload)
    return done(null, false, { message: error.message })
  }
}

const verifyMagicLogin = async (payload: any, done: Function) => {
  await verifyUser({ username: payload.destination, code: payload.code }, done)
}

const sendMagicLink = async (destinationUsername: string, magicLink: string, code: number) => {
  const before15Min = dayjs().subtract(15, 'minute').toDate()
  const user = await User.findOne({ username: destinationUsername })

  if (!user || !user.discordId) throw 'User not found.'

  if (user.lastLoginTryAt && user.lastLoginTryAt > before15Min) {
    throw 'Too many magic link requests. Please wait before trying again.'
  }

  await user.updateOne({ lastLoginUrl: magicLink, lastLoginCode: code, lastLoginTryAt: dayjs().toDate() })

  const loginLink = new ButtonBuilder().setLabel('Login').setStyle(ButtonStyle.Link).setURL(magicLink)
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(loginLink)

  const content = 'Your one-time login link is ready. It will expire in a few minutes.'

  await user.sendDiscordMessage({ content, components: [row] })
}

const magicLogin = new MagicLoginStrategy({
  secret: config.auth!.magicLoginSecret,
  callbackUrl: `${config.auth.host}/magiclogin/callback`,
  sendMagicLink: sendMagicLink,
  verify: verifyMagicLogin,
  jwtOptions: { expiresIn: config.auth!.magicLinkExpiration },
})

const verifyDicord = async (accessToken: string, _refreshToken: string, profile: Profile, done: Function) => {
  const discordId = profile.id
  const email = profile.email
  const mfaEnabled = profile.mfa_enabled

  await addToDiscordGuild(discordId, accessToken)

  await verifyUser({ discordId, mfaEnabled, email, username: profile.username }, done)
}

const discord: any = new DiscordStrategy(
  {
    clientId: config.auth!.discordClientId,
    clientSecret: config.auth!.discordClientSecret,
    callbackUrl: '/discord/callback',
    scope: ['identify', 'guilds.join', 'email'],
  },
  verifyDicord,
)

const verifySteam = async (identifier: string, profile: any, done: Function) => {
  console.log(identifier, profile)
  done(new Error('Not implemented'), null)
}

const steam = new SteamStrategy(
  {
    returnURL: 'http://auth.pokus.local/steam/callback',
    realm: 'http://auth.pokus.local/',
    apiKey: config.auth!.steamApiKey || '',
  },
  verifySteam,
)

const verifyTelegram = async (req: Request, user: PassportTelegramUser, done: DoneCallback) => {
  const telegramId = user.id

  const verification = verifyTelegramHash(req.query, config.auth!.telegramBotToken || '')

  if (!verification.valid) {
    Log.info({ message: 'Telegram auth verification failed', telegramId, error: verification.error })
    return done(null, false, { message: verification.error || 'Invalid authentication' })
  }

  await verifyUser({ telegramId, hash: user.hash, username: user.username }, done)
}

const telegram = new TelegramStrategy(
  {
    botToken: config.auth!.telegramBotToken || '',
    passReqToCallback: true,
  },
  verifyTelegram,
)

passport.use('magiclogin', magicLogin)
passport.use('discord', discord)
passport.use('telegram', telegram)
passport.use('steam', steam)

setupPassportSerialization()

export { magicLogin, checkAuth, checkLogin }

//? Helper Functions

const addToDiscordGuild = async (userId: string, accessToken: string) => {
  try {
    const url = `https://discord.com/api/guilds/${config.discord!.guildId}/members/${userId}`
    const headers = { Authorization: `Bot ${config.discord!.ezaltzToken}` }
    const body = { access_token: accessToken, roles: [config.discord!.memberRoleId] }

    const response = await got.put(url, { json: body, headers: headers })

    console.log('Successfully added user to Discord guild:', response.statusCode)
  } catch (error: any) {
    console.error('Error adding user to Discord guild:', error.message)
  }
}

const verifyTelegramHash = (query: Request['query'], botToken: string): { valid: boolean; error?: string } => {
  const { hash, ...userData } = query as any

  console.log(userData)

  if (!hash) {
    Log.info({ message: 'No hash provided in Telegram auth data' })
    return { valid: false, error: 'No hash provided' }
  }

  // Create data-check-string: sort keys alphabetically and format as key=value\n
  const dataCheckString = Object.keys(userData)
    .filter((key) => userData[key] !== undefined)
    .sort()
    .map((key) => `${key}=${userData[key]}`)
    .join('\n')

  // Create secret key: SHA256 hash of bot token (binary)
  const secretKey = crypto.createHash('sha256').update(botToken).digest()

  // Compute HMAC-SHA256 of data-check-string using secret key (hex output)
  const computedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex')

  // Compare computed hash with received hash
  if (computedHash !== hash) {
    Log.info({ message: 'Invalid Telegram hash', computedHash, receivedHash: hash })
    return { valid: false, error: 'Data is NOT from Telegram' }
  }

  // Check if data is not older than 24 hours (86400 seconds)
  if (userData.auth_date) {
    const authDate = parseInt(userData.auth_date)
    const currentTime = dayjs().unix()

    if (currentTime - authDate > 60) {
      Log.info({ message: 'Outdated Telegram auth data', authDate, currentTime })
      return { valid: false, error: 'Data is outdated' }
    }
  }

  return { valid: true }
}
