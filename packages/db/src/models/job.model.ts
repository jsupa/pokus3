import mongoose, { Schema, type PaginateModel } from 'mongoose'

import Delete, { type SoftDeleteDocument, type SoftDeleteModel } from 'mongoose-delete'
import Paginate from 'mongoose-paginate-v2'

import { QUEUE_NAMES } from '@pokus3/queue/config'

export interface IJob extends SoftDeleteDocument {
  id: string
  name: string // Job name
  type: (typeof QUEUE_NAMES)[keyof typeof QUEUE_NAMES] // Job type
  enable: boolean // Is job enabled
  payload: object // Job payload/data
  lastRunAt: Date | null // Last run timestamp
  nextRunAt: Date | null // Next run timestamp
  cronExpression: string // Cron expression for scheduling
  retryAttempts: number // Number of retry attempts

  createdAt: Date // Creation timestamp
  updatedAt: Date // Update timestamp
}

export interface IJobModel extends SoftDeleteModel<IJob>, PaginateModel<IJob> {}

const modelSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(QUEUE_NAMES), required: true },
    enable: { type: Boolean, default: true },
    payload: { type: Object, required: false, default: {} },
    lastRunAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null },
    cronExpression: { type: String, required: true },
    retryAttempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

modelSchema.plugin(Delete, { deletedAt: true, overrideMethods: true })
modelSchema.plugin(Paginate)

const Job = mongoose.model<IJob, IJobModel>('Job', modelSchema)

export default Job
