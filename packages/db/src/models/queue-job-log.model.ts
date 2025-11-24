import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { type SoftDeleteDocument, type SoftDeleteModel } from 'mongoose-delete'
import type { IJob } from './job.model'

enum QueueJobStatus {
  ADDED = 'added',
  WAITING = 'waiting',
  DELAYED = 'delayed',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export interface QueueJobLog extends SoftDeleteDocument {
  jobId: IJob['_id'] // Reference to the Job
  queueId: string // ID of the job in the queue
  status: QueueJobStatus
  data?: any
  result?: any
  error?: any

  createdAt: Date // Creation timestamp
  updatedAt: Date // Update timestamp
}

export interface QueueJobLogModel extends SoftDeleteModel<QueueJobLog> {}

const queueJobLogSchema: Schema = new Schema(
  {
    jobId: { type: mongoose.Types.ObjectId, ref: 'Job', required: true },
    queueId: { type: String, required: true },
    status: { type: String, enum: Object.values(QueueJobStatus), required: true },
    data: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    error: { type: Schema.Types.Mixed },
  },
  {
    timestamps: true,
  },
)

queueJobLogSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true })

const QueueJobLog = mongoose.model<QueueJobLog, QueueJobLogModel>('QueueJobLog', queueJobLogSchema)

export default QueueJobLog
