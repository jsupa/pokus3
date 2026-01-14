import mongoose, { Schema, Document, Model, type PaginateModel } from 'mongoose'
import type { ISteamCountry } from './steam-country.model'
import type { IAccount } from './account.model'

import Paginate from 'mongoose-paginate-v2'

export interface IQueue extends Document {
  id: string
  jobId: string

  discord: {
    channelId: string
    messageId: string
    guildId: string
  }
  errorCode?: string
  errorMessage?: string

  countryCode: string
  steamCountry: ISteamCountry

  account?: IAccount

  remainingCount?: number

  state: 'FAILURE' | 'SUCCESS' | 'PROCESSING'
}

export interface IQueueModel extends Model<IQueue>, PaginateModel<IQueue> {}

const modelSchema: Schema = new Schema(
  {
    jobId: { type: String, required: true, unique: true },

    discord: {
      channelId: { type: String, required: true },
      messageId: { type: String, required: true },
      guildId: { type: String, required: true },
    },

    errorCode: { type: String, required: false },
    errorMessage: { type: String, required: false },

    countryCode: { type: String, required: true },
    steamCountry: { type: Schema.Types.ObjectId, ref: 'SteamCountry', required: true },

    account: { type: Schema.Types.ObjectId, ref: 'Account', required: false },

    remainingCount: { type: Number, required: false },

    state: { type: String, required: true, enum: ['FAILURE', 'SUCCESS', 'PROCESSING'], default: 'PROCESSING' },
  },
  {
    timestamps: true,
  },
)

modelSchema.plugin(Paginate)

const Queue = mongoose.model<IQueue, IQueueModel>('Queue', modelSchema)

export default Queue
