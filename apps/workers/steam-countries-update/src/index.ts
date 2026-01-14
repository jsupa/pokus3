import config from '@pokus3/config'
import connectDB from '@pokus3/db'
import SteamCountry from '@pokus3/db/models/steam-country'
import { Worker } from 'bullmq'
import got from 'got'
import { HTMLSelectElement, Window } from 'happy-dom'
import { HttpProxyAgent, HttpsProxyAgent } from 'hpagent'
import { QUEUE_NAMES } from '@pokus3/queue/config'
import { v4 as uuidv4 } from 'uuid'

const WORKER_ID = uuidv4()
const WORKER_TYPE = QUEUE_NAMES.STEAM_COUNTRIES_UPDATE

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
  const url = 'https://store.steampowered.com/join'
  const options = {
    agent: {
      http: new HttpProxyAgent({ proxy: config.rotationgProxyUrl }),
      https: new HttpsProxyAgent({ proxy: config.rotationgProxyUrl }),
    },
  }

  new Worker(
    WORKER_TYPE,
    async (bullJob) => {
      const { payload } = bullJob.data

      try {
        console.log(`Processing ${bullJob.name}`, payload)

        // const checkIp = await got('https://api.ipify.org?format=json', options)
        // console.log('Current IP:', checkIp.body)

        const response = await got(url, options)

        if (!response.ok) throw 'Failed to fetch Steam join page'

        const dom = new Window()
        dom.document.write(response.body)

        const countrySelect = dom.document.querySelector('#country') as HTMLSelectElement

        if (!countrySelect) throw 'Country select element not found'

        const countries = Array.from(countrySelect.options).map((option) => ({
          code: option.value,
          name: option.text,
        }))

        await SteamCountry.updateMany({}, { active: false })

        for (const country of countries) {
          await SteamCountry.findOneAndUpdate(
            { code: country.code },
            { name: country.name, active: true },
            { upsert: true, new: true },
          )
        }

        console.log(`Successfully updated ${countries.length} Steam countries.`)

        return { updatedCountries: countries.length }
      } catch (error: any) {
        console.error(`Error processing job ${bullJob.name}:`, error)
        throw error
      }
    },
    { connection: { host: config.redisHost } },
  )
}

startWorker()
