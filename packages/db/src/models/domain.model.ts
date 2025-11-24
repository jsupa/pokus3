import mongoose, { Schema } from 'mongoose'
import MongooseDelete, { type SoftDeleteDocument, type SoftDeleteModel } from 'mongoose-delete'

export interface IDomain extends SoftDeleteDocument {
  name: string
  usesLast24h: number
  banned: boolean
  lastUsedAt: Date | null
  bannedDays: number // Number of days the domain has been banned
  active: boolean // Whether the domain is active

  createdAt: Date // Creation timestamp
  updatedAt: Date // Update timestamp

  checkDup(): Promise<void>
}

export interface IDomainModel extends SoftDeleteModel<IDomain> {}

const modelSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    usesLast24h: { type: Number, required: true, default: 0 },
    banned: { type: Boolean, required: true, default: false },
    lastUsedAt: { type: Date, default: null },
    bannedDays: { type: Number, required: true, default: 0 },
    active: { type: Boolean, required: true, default: true },
  },
  {
    timestamps: true,
  },
)

modelSchema.methods.checkDup = async function (): Promise<void> {
  const existing = await Domain.findOne({ name: this.name })
  if (existing) throw new Error('Domain with this name already exists')

  return Promise.resolve()
}

modelSchema.plugin(MongooseDelete, { deletedAt: true, overrideMethods: true })

const Domain = mongoose.model<IDomain, IDomainModel>('Domain', modelSchema)

export default Domain
