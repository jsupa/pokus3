import type { Request, Response } from 'express'

const index = async (req: Request, res: Response) => {
  const isAdmin = req.user.admin
  const navigationItems = [
    {
      name: 'Discord',
      icon: 'link',
      main: true,
      path: 'https://discord.gg/ezaltz',
    },
    {
      name: 'Accounts',
      icon: 'account_circle',
      path: '/accounts',
      adminOnly: false,
      main: true,
      links: [
        { name: 'Favorite Accounts', path: '/accounts?favorite=true', main: true },
        { name: 'Archived Accounts', path: '/accounts?archived=true' },
      ],
    },
  ]

  if (isAdmin) {
    navigationItems.push({
      name: 'Admin',
      icon: 'admin_panel_settings',
      path: '#',
      adminOnly: true,
      main: true,
      links: [
        { name: 'Users', path: '/users' },
        { name: 'Jobs', path: '/jobs' },
        { name: 'Domains', path: '/domains' },
      ],
    })
  }

  res.json({ navigation: navigationItems })
}

export default { index }
