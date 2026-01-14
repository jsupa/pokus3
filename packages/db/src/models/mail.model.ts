import mongoose, { Schema, Document } from 'mongoose'

export interface IMail extends Document {
  from: string
  to: string
  subject: string
  text: string
  date: Date
  viewed: boolean
  textAsHtml: string
  guard?: string
  verificationLink?: string
  html?: string
  headerLines?: {
    key: string
    line: string
  }[]
  timeAgo?: string
}

const modelSchema = new Schema(
  {
    from: { type: String },
    to: { type: String, index: true },
    subject: { type: String },
    text: { type: String },
    date: { type: Date },
    html: { type: String },
    guard: { type: String },
    viewed: {
      type: Boolean,
      default: false,
    },
    textAsHtml: { type: String },
  },
  {
    timestamps: true,
  },
)

const Mail = mongoose.model<IMail>('Mail', modelSchema)

export default Mail
