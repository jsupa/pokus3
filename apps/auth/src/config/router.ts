import express from 'express'

import { checkLogin, checkAuth } from '@/config/passport'

import magicLoginRoute from '@routes/magiclogin'
import userRoute from '@routes/user'

export const routes: express.Router = express.Router()

routes.use('/user', checkAuth, userRoute)
routes.use('/magiclogin', checkLogin, magicLoginRoute)

routes.get('/logout', checkAuth, (req, res) => {
  req.logout(() => res.json({ message: 'Logged out successfully' }))
})

export default routes
