import { setupPassportSerialization, checkAuth, checkLogin, isAdmin } from '@pokus3/passport'

setupPassportSerialization()

export { checkAuth, checkLogin, isAdmin }
