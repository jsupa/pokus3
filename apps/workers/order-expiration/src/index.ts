import config from '@pokus3/config'
import connectDB from '@pokus3/db'
import { QUEUE_NAMES } from '@pokus3/queue/config'
import Account from '@pokus3/db/models/account'
import Order from '@pokus3/db/models/order'
import { Worker } from 'bullmq'

const WORKER_TYPE = QUEUE_NAMES.ORDER_EXPIRATION

console.log(`🚀 Starting Order Expiration Worker`)
console.log(`📦 Worker Type: ${WORKER_TYPE}`)
console.log(`🔗 Redis Host: ${config.redisHost}`)
console.log(`🗄️ MongoDB URI: ${config.mongoUri}`)

await connectDB(config.mongoUri)

const worker = new Worker(
  WORKER_TYPE,
  async (_bullJob) => {
    console.log(`🔍 Checking for expired orders...`)

    // Find all orders that are reserved and expired
    const expiredOrders = await Order.find({
      status: { $in: ['reserved', 'waiting'] },
      expiresAt: { $lt: new Date() },
    })

    if (expiredOrders.length === 0) {
      console.log(`✅ No expired orders found`)
      return { processed: 0 }
    }

    console.log(`⚠️  Found ${expiredOrders.length} expired orders`)

    let processedCount = 0

    for (const order of expiredOrders) {
      try {
        console.log(`⏰ Expiring order ${order._id}`)

        // Release reserved accounts back to marketplace
        const result = await Account.updateMany(
          { _id: { $in: order.accountIds } },
          {
            $set: { state: 'marketed' },
            $unset: { reservedBy: '', reservedAt: '' },
          },
        )

        console.log(`   Released ${result.modifiedCount} accounts`)

        // Update order status to expired
        order.status = 'expired'
        await order.save()

        processedCount++
        console.log(`   ✅ Order ${order._id} marked as expired`)
      } catch (error: any) {
        console.error(`   ❌ Error expiring order ${order._id}:`, error.message)
      }
    }

    console.log(`✅ Processed ${processedCount} expired orders`)

    return { processed: processedCount }
  },
  {
    connection: { host: config.redisHost },
  },
)

worker.on('completed', (job) => {
  console.log(`✅ Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err.message)
})

worker.on('error', (err) => {
  console.error('❌ Worker error:', err)
})

console.log(`✅ Order Expiration Worker started and listening for jobs`)
