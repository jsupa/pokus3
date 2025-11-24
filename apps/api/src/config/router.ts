import express from 'express'

import { checkAuth, isAdmin } from '@/config/passport'

import userRoute from '@routes/user'
import jobRoute from '@routes/job'
import navigationRoute from '@routes/navigation'
import domainsRoute from '@routes/domains'

export const routes: express.Router = express.Router()

routes.use('/user', checkAuth, userRoute)
routes.use('/job', checkAuth, isAdmin, jobRoute)
routes.use('/navigation', checkAuth, navigationRoute)
routes.use('/domains', checkAuth, isAdmin, domainsRoute)

export default routes
