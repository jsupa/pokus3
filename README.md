# pokus3


## Available Scripts

- `pnpm run dev`: Start all applications in development mode
- `pnpm run build`: Build all applications

## turbo.json configuration

envMode
Default: "strict"

Turborepo's Environment Modes allow you to control which environment variables are available to a task at runtime:

"strict": Filter environment variables to only those that are specified in the env and globalEnv keys in turbo.json.
"loose": Allow all environment variables for the process to be available.



## Features

- **TypeScript** - For type safety and improved developer experience
- **Tsdown** - Type-safe API client generation
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

