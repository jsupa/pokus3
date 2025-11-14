import type { Request, Response } from 'express'

const me = async (req: Request, res: Response) => {
  res.json({ user: req.user.id })
}

export default { me }
