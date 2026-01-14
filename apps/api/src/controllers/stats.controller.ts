import Account from '@pokus3/db/models/account'
import Domain from '@pokus3/db/models/domain'
import Queue from '@pokus3/db/models/queue'
import User from '@pokus3/db/models/user'
import dayjs from 'dayjs'
import type { Request, Response } from 'express'

const index = async (_req: Request, res: Response) => {
  const query24h = { createdAt: { $gte: dayjs().subtract(24, 'hour').toDate() } }
  const startOf2026 = { createdAt: { $gte: dayjs('2026-01-01').toDate() } }

  const stats = {
    totalUsers: await User.countDocuments(),
    totalAccounts: await Account.countDocuments(),
    newAccounts: await Account.countDocuments(startOf2026),
    last24hCreatedAccounts: await Account.countDocuments(query24h),
    remainingCreationsDomain: await Domain.getPossibleCreations(),
    queues24h: await Queue.countDocuments(query24h),
    accountMarketCount: await Account.countDocuments({ state: 'marketed' }),
  }

  res.json(stats)
}

export default { index }
