import mongoose from 'mongoose'

const connectDB = async (mongoUri: string) => {
  try {
    await mongoose.connect(mongoUri)
    console.log('Database connected successfully')
  } catch (error) {
    console.error('Error connecting to database:', error)
  }
}

export default connectDB
