import config from '@pokus3/config'
import { setupServer, startServer } from '@pokus3/server'
import router from '@router'

import connectDB from '@pokus3/db'
import User from '@pokus3/db/models/user'

import '@/config/passport'

const init = async () => {
  console.log('Auth Server is starting...')

  await connectDB(config.mongoUri)

  // await User.create({ name: 'John Doe' })

  setupServer({
    mongoUri: config.mongoUri,
    sessionSecret: config.sessionSecret,
    cookieDomain: config.cookieDomain,
    isProd: config.isProd,
    router,
  })

  startServer(config.auth!.webPort)

  const count = await User.countDocuments()

  console.log(`There are ${count} users in the database.`)
}

init()
