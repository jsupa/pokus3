import config from '@pokus3/config'
import connectDB from '@pokus3/db'
import Job from '@pokus3/db/models/job'
import { withQueue, upsertJobScheduler, removeJobScheduler, getJobSchedulers } from '@pokus3/queue/operations'

async function syncScheduler() {
  console.log('🔄 Starting Job Scheduler Synchronization...')
  await connectDB(config.mongoUri)

  const distinctWorkerTypes = await Job.distinct('type')

  for (const workerType of distinctWorkerTypes) {
    console.log(`\\nChecking Queue: [${workerType}]`)

    await withQueue(workerType, config.redisHost, async (queue) => {
      const existingSchedulers = await getJobSchedulers(queue, 0, 100)

      console.log(`Found ${existingSchedulers.length} existing schedulers in queue.`)

      for (const scheduler of existingSchedulers) {
        const schedulerId = scheduler.key

        console.log(`Checking scheduler: ${schedulerId}`, scheduler)

        const dbJob = await Job.findById(schedulerId)

        if (!dbJob || !dbJob.enable || dbJob.type !== workerType) {
          console.log(`🧹 Removing orphaned/disabled scheduler: ${schedulerId}`)
          await removeJobScheduler(queue, schedulerId)
        }
      }

      const activeJobs = await Job.find({
        type: workerType,
        enable: true,
      })

      for (const job of activeJobs) {
        const schedulerId = job.id

        await upsertJobScheduler(
          queue,
          schedulerId,
          {
            pattern: job.cronExpression,
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
    })
  }

  console.log('\\n🏁 Synchronization complete.')
  process.exit(0)
}

syncScheduler().catch((err) => {
  console.error(err)
  process.exit(1)
})
