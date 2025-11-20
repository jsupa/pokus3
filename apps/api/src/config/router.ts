import express from 'express'

import { checkAuth, isAdmin } from '@/config/passport'

import userRoute from '@routes/user'
import jobRoute from '@routes/job'
import navigationRoute from '@routes/navigation'

export const routes: express.Router = express.Router()

routes.use('/user', checkAuth, userRoute)
routes.use('/job', checkAuth, isAdmin, jobRoute)
routes.use('/navigation', checkAuth, navigationRoute)

export default routes
