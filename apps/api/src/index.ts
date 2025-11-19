import config from '@pokus3/config'
import { setupServer, startServer } from '@pokus3/server'
import router from '@router'

import connectDB from '@pokus3/db'
import User from '@pokus3/db/models/user'

import '@/config/passport'

const init = async () => {
  console.log('API Server is starting...')

  await connectDB(config.mongoUri)

  setupServer({
    mongoUri: config.mongoUri,
    sessionSecret: config.sessionSecret,
    cookieDomain: config.cookieDomain,
    isProd: config.isProd,
    router,
  })

  startServer(config.api!.webPort)

  const count = await User.countDocuments()

  console.log(`There are ${count} users in the database.`)
}

init()
