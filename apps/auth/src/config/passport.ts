import passport from 'passport'
import _MagicLoginStrategy from 'passport-magic-login'
import { Strategy as DiscordStrategy, type Profile } from 'passport-discord-auth'
import SteamStrategy from 'passport-steam'

import type { Request, Response, NextFunction } from 'express'

import config from '@pokus3/config'
import User, { type IUser } from '@pokus3/db/models/user'
import got from 'got'

// @ts-ignore
const MagicLoginStrategy = _MagicLoginStrategy.default

// define payload in verifyUser
interface UserPayload {
  email?: string
  discordId?: string
  username?: string
  mfa_enabled?: boolean
}

const verifyUser = async (payload: UserPayload, done: Function) => {
  const email = payload.email

  if (email) {
    try {
      const user = await User.findOne({ email })

      if (user) return done(null, user)

      const newUser = await User.create({ email })

      return done(null, newUser)
    } catch (error) {
      return done(error)
    }
  }
  return done(new Error('No valid identifier found in token'))
}

const verifyMagicLogin = async (payload: any, done: Function) => {
  await verifyUser({ email: payload.email }, done)
}

const sendMagicLink = async (destinationEmail: string, magicLink: string) => {
  console.log(`Send magic link to ${destinationEmail}: ${magicLink}`)
}

const magicLogin = new MagicLoginStrategy({
  secret: config.auth!.magicLoginSecret,
  callbackUrl: '/magiclogin/callback',
  sendMagicLink,
  verify: verifyMagicLogin,
  jwtOptions: { expiresIn: config.auth!.magicLinkExpiration },
})

const verifyDicord = async (accessToken: string, _refreshToken: string, profile: Profile, done: Function) => {
  const discordId = profile.id
  const email = profile.email
  await addToDiscordGuild(discordId, accessToken)

  await verifyUser({ discordId, email, username: profile.username, mfa_enabled: profile.mfa_enabled }, done)
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

passport.use('magiclogin', magicLogin)
passport.use('discord', discord)
passport.use('steam', steam)

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as IUser).id)
})

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id)
    if (!user) throw new Error('User not found during deserialization')
    done(null, user)
  } catch (error) {
    done(error)
  }
})

const checkLogin = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isUnauthenticated()) return next()

  res.status(400)
  throw new Error('error.already_authenticated'.t)
}

const checkAuth = (req: Request, res: Response, next: NextFunction): void => {
  if (req.isAuthenticated()) return next()

  res.status(401)
  throw new Error('error.unauthorized'.t)
}

export { magicLogin, checkAuth, checkLogin }

const addToDiscordGuild = async (userId: string, accessToken: string) => {
  try {
    const url = `https://discord.com/api/guilds/${config.discord!.guildId}/members/${userId}`
    const headers = { Authorization: `Bot ${config.discord!.botToken}` }
    const body = { access_token: accessToken, roles: [config.discord!.memberRoleId] }

    const response = await got.put(url, { json: body, headers: headers })

    console.log('Successfully added user to Discord guild:', response.statusCode)
  } catch (error: any) {
    console.error('Error adding user to Discord guild:', error.message)
  }
}
