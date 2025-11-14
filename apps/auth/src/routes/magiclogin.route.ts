import express, { Router } from 'express'
import { magicLogin } from '@/config/passport'
import passport from 'passport'
import config from '@config'

const router: Router = express.Router()

router.post('/', magicLogin.send)
router.get('/callback', passport.authenticate('magiclogin'), (_req, res) => {
  res.redirect(config.magicLoginRedirect)
})

export default router
