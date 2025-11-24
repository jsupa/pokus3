import config from '@pokus3/config'
import connectDB from '@pokus3/db'
import { Worker } from 'bullmq'
import { QUEUE_NAMES } from '@pokus3/queue/config'
import { v4 as uuidv4 } from 'uuid'

const WORKER_ID = uuidv4()
const WORKER_TYPE = QUEUE_NAMES.EMAIL_DELETION

// async function startHeartbeat() {
//   setInterval(async () => {
//     try {
//       await WorkerNode.findOneAndUpdate(
//         { workerId: WORKER_ID },
//         {
//           workerType: WORKER_TYPE,
//           hostname: os.hostname(),
//           lastHeartbeat: new Date(),
//           status: 'ACTIVE' // Môžeš meniť na IDLE/WORKING podľa stavu workera
//         },
//         { upsert: true, new: true }
//       );
//     } catch (err) {
//       console.error('Heartbeat failed', err);
//     }
//   }, 10000);
// }

// 2. WORKER PROCESSOR
async function startWorker() {
  await connectDB(config.mongoUri)
  // startHeartbeat();

  console.log(`🚀 Worker [${WORKER_TYPE}] ${WORKER_ID} started...`)

  new Worker(
    WORKER_TYPE,
    async (bullJob) => {
      const { payload } = bullJob.data

      try {
        console.log(`Processing ${bullJob.name}`, payload)

        await new Promise((r) => setTimeout(r, 10000))

        // throw new Error('Simulated error for testing')
        return { result: 'Done' }
      } catch (error: any) {
        throw error
      }
    },
    { connection: { host: config.redisHost } },
  )
}

startWorker()
