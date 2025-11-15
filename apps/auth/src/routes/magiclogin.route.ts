import express, { Router } from 'express'
import { magicLogin } from '@/config/passport'
import passport from 'passport'
import config from '@config'

import { validate } from '@pokus3/server'

import { magicLoginSchema, callbackSchema } from '@validations/magiclogin'

const router: Router = express.Router()

router.post('/', validate({ body: magicLoginSchema }), magicLogin.send)
router.get(
  '/callback',
  validate({ query: callbackSchema }),
  passport.authenticate('magiclogin', {
    failureRedirect: `${config.magicLoginRedirect}?error=authentication_failed`,
    successRedirect: config.magicLoginRedirect,
  }),
)

export default router
