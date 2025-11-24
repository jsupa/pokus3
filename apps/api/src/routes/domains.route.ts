import express, { Router } from 'express'

import { validate } from '@pokus3/server'

import controller from '@controllers/domains'

import { domainCreateSchema } from '@validations/domains'

const router: Router = express.Router()

router.get('/', controller.index)
router.post('/', validate({ body: domainCreateSchema }), controller.create)
router.delete('/:id', controller.archive)
router.put('/:id/active', controller.toggleActive)

export default router
