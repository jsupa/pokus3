import type { Request, Response, NextFunction } from 'express'
import passport from 'passport'

import User, { type IUser } from '@pokus3/db/models/user'

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

const isAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const user = req.user as IUser

  if (user && user.admin) return next()

  res.status(403)
  throw new Error('error.forbidden'.t)
}

export { checkAuth, checkLogin, isAdmin }
