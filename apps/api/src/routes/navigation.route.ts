import express, { Router } from 'express'

import navigationController from '@controllers/navigation'

const router: Router = express.Router()

router.get('/', navigationController.index)

export default router
