import passport from 'passport'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import type { Request, Response, NextFunction } from 'express'

import config from '@config'
import User, { type IUser } from '@pokus3/db/models/user'

const verify = async (payload: any, done: Function) => {
  const id = payload.id

  if (id) {
    try {
      const user = await User.findById(id)

      if (user) return done(null, user)

      return done(new Error('User not found'))
    } catch (error) {
      return done(error)
    }
  }
  return done(new Error('No valid identifier found in token'))
}

const jwtStrategy = new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.jwtSecret,
  },
  verify,
)

passport.use('jwt', jwtStrategy)

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

const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: string | undefined, user: Express.User) => {
    res.status(500)
    if (err) throw new Error(err)

    res.status(401)
    if (!user) throw new Error('Unauthorized')

    res.status(200)
    req.login(user, { session: false }, (err) => console.log(err))

    next()
  })(req, res, next)
}

export { checkAuth }
