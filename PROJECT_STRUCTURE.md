# Project Structure

```
booking-system/
├── .github/
│   └── workflows/
│       └── ci.yml                 # GitHub Actions CI/CD pipeline
├── apps/
│   ├── frontend/                  # Next.js frontend application
│   │   ├── app/                   # Next.js App Router
│   │   │   ├── layout.tsx         # Root layout with React Query provider
│   │   │   ├── page.tsx          # Homepage with health check example
│   │   │   └── providers.tsx     # React Query provider setup
│   │   ├── lib/
│   │   │   └── api.ts            # API client utilities
│   │   ├── .env.example          # Frontend environment variables example
│   │   ├── .env.local            # Frontend environment variables (local)
│   │   ├── .eslintrc.json       # ESLint configuration
│   │   ├── jest.config.js        # Jest configuration
│   │   ├── jest.setup.js         # Jest setup file
│   │   ├── next.config.ts        # Next.js configuration
│   │   ├── package.json          # Frontend dependencies
│   │   └── tsconfig.json         # TypeScript configuration
│   └── backend/                   # NestJS backend application
│       ├── src/
│       │   ├── main.ts           # Application entry point
│       │   ├── app.module.ts     # Root module
│       │   ├── app.controller.ts # Root controller with health endpoint
│       │   ├── app.service.ts    # Root service
│       │   └── app.controller.spec.ts # Controller tests
│       ├── prisma/
│       │   └── schema.prisma     # Prisma schema (PostgreSQL)
│       ├── test/                 # E2E tests
│       ├── .env.example          # Backend environment variables example
│       ├── .env                  # Backend environment variables (local)
│       ├── .eslintrc.js          # ESLint configuration
│       ├── nest-cli.json         # NestJS CLI configuration
│       ├── package.json          # Backend dependencies
│       └── tsconfig.json         # TypeScript configuration
├── packages/                      # Shared packages (for future use)
├── .gitignore                     # Git ignore rules
├── .prettierrc                    # Prettier configuration
├── .prettierignore               # Prettier ignore rules
├── package.json                   # Root package.json with workspaces
├── README.md                      # Main documentation
├── SETUP.md                       # Quick setup guide
└── PROJECT_STRUCTURE.md          # This file
```

## Key Features Implemented

### Frontend (Next.js)
- ✅ Next.js 16 with App Router
- ✅ TypeScript configuration
- ✅ Tailwind CSS for styling
- ✅ React Query (TanStack Query) for data fetching
- ✅ react-hook-form ready (installed)
- ✅ ESLint configuration
- ✅ Jest + React Testing Library setup
- ✅ API client utilities
- ✅ Example health check integration

### Backend (NestJS)
- ✅ NestJS framework setup
- ✅ TypeScript configuration
- ✅ Health check endpoint (`/health`)
- ✅ CORS configuration for frontend
- ✅ Global validation pipe
- ✅ Prisma ORM integration
- ✅ PostgreSQL database connection
- ✅ ESLint configuration
- ✅ Jest testing setup
- ✅ Example User model in Prisma schema

### DevOps & Tooling
- ✅ Monorepo structure with npm workspaces
- ✅ Prettier for code formatting
- ✅ ESLint for both frontend and backend
- ✅ GitHub Actions CI/CD pipeline
- ✅ Environment variable management
- ✅ Database migration setup

## Technology Stack

| Category | Technology |
|----------|-----------|
| Frontend Framework | Next.js 16 |
| Frontend Language | TypeScript |
| Frontend Styling | Tailwind CSS |
| Form Handling | react-hook-form |
| Data Fetching | React Query (TanStack Query) |
| Backend Framework | NestJS |
| Backend Language | TypeScript |
| Database | PostgreSQL |
| ORM | Prisma |
| Testing | Jest |
| Code Quality | ESLint, Prettier |
| CI/CD | GitHub Actions |

## Next Steps

1. **Database Setup**: Configure your PostgreSQL connection (Neon or local)
2. **Run Migrations**: Execute `npm run db:migrate` to set up the database
3. **Start Development**: Run `npm run dev` to start both servers
4. **Verify Setup**: Check http://localhost:3001/health and http://localhost:3000
5. **Build Features**: Start implementing your booking system logic!

