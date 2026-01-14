import express from 'express'

import { checkLogin, checkAuth } from '@/config/passport'

import magicLoginRoute from '@routes/magiclogin'
import discordRoute from '@routes/discord'
import telegramRoute from '@routes/telegram'
import userRoute from '@routes/user'
import steamRoute from '@routes/steam'

export const routes: express.Router = express.Router()

routes.use('/user', checkAuth, userRoute)
routes.use('/magiclogin', checkLogin, magicLoginRoute)
routes.use('/discord', checkLogin, discordRoute)
routes.use('/telegram', checkLogin, telegramRoute)
routes.use('/steam', checkLogin, steamRoute)

routes.get('/logout', checkAuth, (req, res) => {
  req.logout(() => res.json({ message: 'Logged out successfully' }))
})

export default routes
