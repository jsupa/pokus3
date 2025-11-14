import express from 'express'
import { auth } from '@/config/passport'
import userController from '@controllers/user'

export const routes: express.Router = express.Router()

routes.use('/me', auth, userController.me)

export default routes
