import { Queue, type QueueOptions } from 'bullmq'
import { redisConnection, type QueueName } from './config'

export class QueueManager {
  private queues: Map<string, Queue> = new Map()

  getQueue(name: QueueName): Queue {
    if (!this.queues.has(name)) {
      const queueOptions: QueueOptions = {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: {
            count: 100,
            age: 24 * 3600,
          },
          removeOnFail: {
            count: 1000,
          },
        },
      }
      this.queues.set(name, new Queue(name, queueOptions))
    }
    return this.queues.get(name)!
  }

  async closeAll(): Promise<void> {
    const closePromises = Array.from(this.queues.values()).map((queue) => queue.close())
    await Promise.all(closePromises)
    this.queues.clear()
  }
}

export const queueManager = new QueueManager()
