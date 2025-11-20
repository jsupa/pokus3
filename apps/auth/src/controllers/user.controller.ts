import type { Request, Response } from 'express'

const me = async (req: Request, res: Response) => {
  res.json({ user: req.user.id, isAdmin: req.user.admin })
}

export default { me }
