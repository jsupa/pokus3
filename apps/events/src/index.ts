import config from '@config'
import connectDB from '@pokus3/db'
import Job from '@pokus3/db/models/job'
// import { queueManager, QUEUE_NAMES } from '@pokus3/queue'
import { QueueEvents } from 'bullmq'

const getWorkerTypes = async () => {
  await connectDB(config.mongoUri)
  return Job.distinct('type')
}

const types = await getWorkerTypes()

for (const type of types) {
  const queue = new QueueEvents(type, {
    connection: { host: config.redisHost },
  })

  console.log(`Listening for events on queue: ${type}`)

  queue.on('added', ({ jobId, name }) => {
    console.log(`[${type}][EVENT] Job added: ${jobId}, name: ${name}`)
  })

  queue.on('waiting', ({ jobId }) => {
    console.log(`[${type}][EVENT] Job waiting: ${jobId}`)
  })

  queue.on('delayed', ({ jobId, delay }) => {
    console.log(`[${type}][EVENT] Job delayed: ${jobId}, delay: ${delay}`)
  })

  queue.on('active', ({ jobId }) => {
    console.log(`[${type}][EVENT] Job active: ${jobId}`)
  })

  queue.on('completed', ({ jobId, returnvalue }) => {
    console.log(`[${type}][EVENT] Job completed: ${jobId}, return value: ${JSON.stringify(returnvalue)}`)
  })

  queue.on('removed', ({ jobId }) => {
    console.log(`[${type}][EVENT] Job removed: ${jobId}`)
  })
}
