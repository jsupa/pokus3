import type { Request, Response, NextFunction } from 'express'

const locals = async (req: Request, _res: Response, next: NextFunction) => {
  stringTranslate(req)

  next()
}

export default locals

const stringTranslate = (req: Request) => {
  if ('t' in String.prototype) {
    delete (String.prototype as any).t
  }

  Object.defineProperty(String.prototype, 't', {
    get: function () {
      return req.__(this) as string
    },
    configurable: true,
  })
}
