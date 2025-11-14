import config from '@config'
import { setupServer, startServer } from '@server'

import connectDB from '@pokus3/db'
import User from '@pokus3/db/models/user'

const init = async () => {
  console.log('Server is starting...')

  await connectDB(config.mongoUri)

  // await User.create({ name: 'John Doe' })

  setupServer()

  startServer(config.webPort)

  const count = await User.countDocuments()

  console.log(`There are ${count} users in the database.`)
}

init()
