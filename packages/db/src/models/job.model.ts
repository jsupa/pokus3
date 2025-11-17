import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { type SoftDeleteDocument, type SoftDeleteModel } from 'mongoose-delete'

// enums for job types
enum JobType {
  EMAIL_SENDING = 'EMAIL_SENDING',
}

export interface IJob extends SoftDeleteDocument {
  name: string // Job name
  type: JobType // Job type
  enable: boolean // Is job enabled
  lastRunAt: Date | null // Last run timestamp
  nextRunAt: Date | null // Next run timestamp
  cronExpression: string // Cron expression for scheduling
  retryAttempts: number // Number of retry attempts

  createdAt: Date // Creation timestamp
  updatedAt: Date // Update timestamp
}

export interface IJobModel extends SoftDeleteModel<IJob> {}

const userSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: Object.values(JobType), required: true },
    enable: { type: Boolean, default: true },
    lastRunAt: { type: Date, default: null },
    nextRunAt: { type: Date, default: null },
    cronExpression: { type: String, required: true },
    retryAttempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
)

userSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true })

const Job = mongoose.model<IJob, IJobModel>('Job', userSchema)

export default Job
