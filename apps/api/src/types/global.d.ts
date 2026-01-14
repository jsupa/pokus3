import { IUser } from '@pokus3/db/models/user'

declare global {
  interface String {
    readonly t: string
  }

  namespace Express {
    interface User extends IUser {}
  }
}

export {}
