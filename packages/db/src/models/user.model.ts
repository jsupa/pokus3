import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IUser extends Document {
  username: string
  email: string
  admin: boolean

  sendWelcomeEmail(): Promise<void>
}

export interface IUserModel extends Model<IUser> {
  getRandomUser(): Promise<IUser>
}

const modelSchema: Schema = new Schema(
  {
    username: { type: String },
    email: { type: String, required: true, unique: true },
    admin: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

modelSchema.methods.sendWelcomeEmail = async function () {
  const { email } = this

  try {
    // send email logic
    console.log(`Sending welcome email to ${email}`)
  } catch (error: any) {
    throw new Error('Failed to send welcome email')
  }
}

modelSchema.statics.getRandomUser = async function () {
  const user = await User.aggregate([{ $sample: { size: 1 } }])
  return user
}

const User = mongoose.model<IUser, IUserModel>('User', modelSchema)

export default User
