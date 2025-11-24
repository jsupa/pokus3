import config from '@pokus3/config'
import connectDB from '@pokus3/db'
import Job from '@pokus3/db/models/job'
import QueueJobLog from '@pokus3/db/models/queue-job-log'
import { getJob } from '@pokus3/queue/operations'
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

  queue.on('added', async ({ jobId }) => {
    const job = await getJob(type, config.redisHost, jobId)
    await QueueJobLog.create({
      jobId: job.data.jobId,
      queueId: jobId,
      status: 'added',
      data: job.data,
    })
    console.log(`[${type}][EVENT] Job added: ${jobId}, queueId: ${job.data.jobId}`)
  })

  queue.on('waiting', async ({ jobId }) => {
    const job = await getJob(type, config.redisHost, jobId)
    await QueueJobLog.create({
      jobId: job.data.jobId,
      queueId: jobId,
      status: 'waiting',
      data: job.data,
    })
    console.log(`[${type}][EVENT] Job waiting: ${jobId}`)
  })

  queue.on('delayed', async ({ jobId, delay }) => {
    console.log(`[${type}][EVENT] Job delayed: ${jobId}, delay: ${delay}`)
  })

  queue.on('active', async ({ jobId }) => {
    const job = await getJob(type, config.redisHost, jobId)
    await QueueJobLog.create({
      jobId: job.data.jobId,
      queueId: jobId,
      status: 'active',
      data: job.data,
    })
    console.log(`[${type}][EVENT] Job active: ${jobId}`)
  })

  queue.on('completed', async ({ jobId, returnvalue }) => {
    const job = await getJob(type, config.redisHost, jobId)
    await QueueJobLog.create({
      jobId: job.data.jobId,
      queueId: jobId,
      status: 'completed',
      data: job.data,
      result: returnvalue,
    })
    console.log(`[${type}][EVENT] Job completed: ${jobId}, return value: ${JSON.stringify(returnvalue)}`)
  })

  queue.on('failed', async ({ jobId, failedReason }) => {
    const job = await getJob(type, config.redisHost, jobId)
    await QueueJobLog.create({
      jobId: job.data.jobId,
      queueId: jobId,
      status: 'failed',
      data: job.data,
      error: failedReason,
    })
  })

  queue.on('removed', ({ jobId }) => {
    console.log(`[${type}][EVENT] Job removed: ${jobId}`)
  })
}
