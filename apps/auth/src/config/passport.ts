import passport from 'passport'
import _MagicLoginStrategy from 'passport-magic-login'
import type { Request, Response, NextFunction } from 'express'

import config from '@config'
import User, { type IUser } from '@pokus3/db/models/user'

// @ts-ignore
const MagicLoginStrategy = _MagicLoginStrategy.default

const sendMagicLink = async (destinationEmail: string, magicLink: string) => {
  console.log(`Send magic link to ${destinationEmail}: ${magicLink}`)
}

const verify = async (payload: any, done: Function) => {
  const email = payload.destination

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

const magicLogin = new MagicLoginStrategy({
  secret: config.magicLoginSecret,
  callbackUrl: '/magiclogin/callback',
  sendMagicLink,
  verify,
  jwtOptions: { expiresIn: config.magicLinkExpiration },
})

passport.use('magiclogin', magicLogin)

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
