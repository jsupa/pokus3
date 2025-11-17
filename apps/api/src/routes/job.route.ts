import express, { Router } from 'express'

import { validate } from '@pokus3/server'

import jobController from '@controllers/job'

import { jobCreateSchema, jobArchiveSchema, jobUpdateSchemaParams, jobUpdateSchemaBody } from '@validations/job'

const router: Router = express.Router()

router.get('/', jobController.index)
router.post('/', validate({ body: jobCreateSchema }), jobController.create)
router.delete('/:id', validate({ params: jobArchiveSchema }), jobController.archive)
router.put('/:id', validate({ params: jobUpdateSchemaParams, body: jobUpdateSchemaBody }), jobController.update)

export default router
