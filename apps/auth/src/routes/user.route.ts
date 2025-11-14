import express, { Router } from 'express'

import userController from '@controllers/user'

const router: Router = express.Router()

router.get('/me', userController.me)

export default router
