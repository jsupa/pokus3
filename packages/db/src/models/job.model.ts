import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { type SoftDeleteDocument, type SoftDeleteModel } from 'mongoose-delete'
import { QUEUE_NAMES } from '@pokus3/queue/config'

export interface IJob extends SoftDeleteDocument {
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

export interface IJobModel extends SoftDeleteModel<IJob> {}

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

modelSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true })

const Job = mongoose.model<IJob, IJobModel>('Job', modelSchema)

export default Job
