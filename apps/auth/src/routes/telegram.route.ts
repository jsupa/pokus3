import express, { Router } from 'express'
import passport from 'passport'
import config from '@pokus3/config'

const router: Router = express.Router()

router.get(
  '/callback',
  passport.authenticate('telegram', {
    failureRedirect: `${config.auth!.redirect}?error=authentication_failed`,
    successRedirect: config.auth!.redirect,
  }),
)

export default router
