import express from 'express'

import { checkAuth } from '@/config/passport'

import userRoute from '@routes/user'

export const routes: express.Router = express.Router()

routes.use('/user', checkAuth, userRoute)

export default routes
