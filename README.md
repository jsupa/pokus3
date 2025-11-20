# pokus3

This project was created with [Better-T-Stack](https://github.com/AmanVarshney01/create-better-t-stack), a modern TypeScript stack that combines Next.js, Express, and more.

## Features

- **TypeScript** - For type safety and improved developer experience
- **Next.js** - Full-stack React framework
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Reusable UI components
- **Express** - Fast, unopinionated web framework
- **Node.js** - Runtime environment
- **Mongoose** - TypeScript-first ORM
- **MongoDB** - Database engine
- **BullMq** - For Background Jobs
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
pnpm install
```

## Project Structure

```
┌─────────────┐
│    Web      │ (Next.js - User Interface)
│  (Port 3001)│
└──────┬──────┘
       │
       ├──────────────┐
       ▼              ▼
┌─────────────┐ ┌─────────────┐
│    Auth     │ │     API     │
│  (Port 3002)│ │  (Port 3003)│
└──────┬──────┘ └──────┬──────┘
       │               │
       └───────┬───────┘
               ▼
        ┌─────────────┐
        │  MongoDB    │ (Shared session + data)
        └─────────────┘

┌─────────────┐
│  Scheduler  │ (One-time sync script)
└──────┬──────┘
       ▼
┌─────────────┐      ┌─────────────┐
│   Redis     │◄─────┤   Events    │ (Monitoring)
│  (BullMQ)   │      └─────────────┘
└──────┬──────┘
       ▼
┌─────────────┐
│  Workers    │ (Process jobs)
│  - email    │
│  - ...      │
└─────────────┘
```

## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications
