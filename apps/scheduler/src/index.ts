import config from '@config'
import connectDB from '@pokus3/db'
import Job from '@pokus3/db/models/job'
// import { queueManager, QUEUE_NAMES } from '@pokus3/queue'
import { Queue } from 'bullmq'

async function syncScheduler() {
  console.log('🔄 Starting Job Scheduler Synchronization...')
  await connectDB(config.mongoUri)

  const distinctWorkerTypes = await Job.distinct('type')

  for (const workerType of distinctWorkerTypes) {
    console.log(`\\nChecking Queue: [${workerType}]`)

    const queue = new Queue(workerType, {
      connection: { host: config.redisHost },
    })

    const existingSchedulers = await queue.getJobSchedulers(0, 100) // Načítame dostatočné množstvo

    console.log(`Found ${existingSchedulers.length} existing schedulers in queue.`)

    for (const scheduler of existingSchedulers) {
      const schedulerId = scheduler.key

      console.log(`Checking scheduler: ${schedulerId}`, scheduler)

      const dbJob = await Job.findById(schedulerId)

      if (!dbJob || !dbJob.enable || dbJob.type !== workerType) {
        console.log(`🧹 Removing orphaned/disabled scheduler: ${schedulerId}`)
        await queue.removeJobScheduler(schedulerId)
      }
    }

    const activeJobs = await Job.find({
      type: workerType,
      enable: true,
    })

    for (const job of activeJobs) {
      const schedulerId = job.id

      await queue.upsertJobScheduler(
        schedulerId,
        {
          pattern: job.cronExpression,
          // Môžeme pridať startDate, endDate ak treba
        },
        {
          name: job.name,
          data: {
            jobId: schedulerId,
            payload: job.payload,
          },
        },
      )
      process.stdout.write(`✅ Upserted: ${job.name} `)
    }
    console.log(`\\nDone with ${workerType}`)

    await queue.close()
  }

  console.log('\\n🏁 Synchronization complete.')
  process.exit(0)
}

syncScheduler().catch((err) => {
  console.error(err)
  process.exit(1)
})

// kill process on SIGINT and SIGTERM
process.on('SIGINT', async () => {
  console.log('Received SIGINT. Exiting...')
  await clearAllJobSchedulers()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Exiting...')
  await clearAllJobSchedulers()
  process.exit(0)
})

const clearAllJobSchedulers = async () => {
  await connectDB(config.mongoUri)
  const distinctWorkerTypes = await Job.distinct('type')

  for (const workerType of distinctWorkerTypes) {
    console.log(`\\nClearing Queue: [${workerType}]`)

    const queue = new Queue(workerType, {
      connection: { host: config.redisHost },
    })

    const existingSchedulers = await queue.getJobSchedulers(0, 100) // Načítame dostatočné množstvo

    console.log(`Found ${existingSchedulers.length} existing schedulers in queue.`)

    for (const scheduler of existingSchedulers) {
      const schedulerId = scheduler.key

      console.log(`Removing scheduler: ${schedulerId}`)

      await queue.removeJobScheduler(schedulerId)
    }

    await queue.close()
  }

  console.log('\\n🏁 All schedulers cleared.')
  process.exit(0)
}
