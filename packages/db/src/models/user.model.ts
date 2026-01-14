import mongoose, { Schema, Document, Model } from 'mongoose'
import dayjs from 'dayjs'

import config from '@pokus3/config'
import { addToQueue } from '@pokus3/queue/operations'
import type { MessagePayload, MessageCreateOptions } from '@pokus3/discord'
import Account from './account.model'

export interface IUser extends Document {
  id: string
  username: string
  email: string
  discordId: string
  telegramId: string
  hash: string
  admin: boolean
  lastLoginUrl?: string
  lastLoginCode?: number
  lastLoginTryAt?: Date
  lastLoginAt?: Date
  mfaEnabled: boolean
  uid?: number

  sendDiscordMessage: (message: string | MessagePayload | MessageCreateOptions) => Promise<void>
  hasOldAccounts: () => Promise<boolean>
}

export interface IUserModel extends Model<IUser> {}

const modelSchema: Schema = new Schema(
  {
    username: { type: String },
    email: { type: String, required: false, unique: true, sparse: true },
    discordId: { type: String, unique: true, sparse: true },
    telegramId: { type: String, unique: true, sparse: true },
    hash: { type: String, unique: true, sparse: true },
    admin: { type: Boolean, default: false },
    lastLoginUrl: { type: String },
    lastLoginCode: { type: Number },
    lastLoginTryAt: { type: Date },
    lastLoginAt: { type: Date },
    mfaEnabled: { type: Boolean, default: false },
    uid: { type: Number, unique: true, sparse: true },
  },
  {
    timestamps: true,
  },
)

modelSchema.pre('save', async function () {
  if (this.uid) return

  const count = await User.countDocuments()

  this.uid = count + 1

  return
})

modelSchema.methods.sendDiscordMessage = async function (
  message: string | MessagePayload | MessageCreateOptions,
): Promise<void> {
  addToQueue('discord-queue', config.redisHost, {
    jobId: 'sendDirectMessage',
    payload: { discordId: this.discordId, message },
  })
}

modelSchema.methods.hasOldAccounts = async function (): Promise<boolean> {
  const beforeDate = dayjs('2026-01-01').toDate()
  const count = await Account.countDocuments({ owner: this, createdAt: { $lt: beforeDate } })

  return count > 0
}

const User = mongoose.model<IUser, IUserModel>('User', modelSchema)

export default User
