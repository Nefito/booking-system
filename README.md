# Booking System

A full-stack booking system built with Next.js (frontend) and NestJS (backend), using PostgreSQL as the database.

## Tables Schema

https://excalidraw.com/#room=c997bc2fdec5fd5d226f,cofWlj3GA8WuFsy7YkaXFA

## 🏗️ Project Structure

```
booking-system/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   └── backend/            # NestJS backend application
├── packages/               # Shared packages (if needed)
├── package.json           # Root package.json with workspace configuration
└── README.md              # This file
```

## 🚀 Tech Stack

### Frontend

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Handling**: react-hook-form
- **Data Fetching**: React Query (TanStack Query)
- **Testing**: Jest + React Testing Library

### Backend

- **Framework**: NestJS
- **Language**: TypeScript
- **Runtime**: Node.js (Bun compatible)
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Jest

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** >= 18.0.0
- **npm** (comes with Node.js)
- **PostgreSQL** >= 14 (or use Neon cloud PostgreSQL)
- **Git**

Optional but recommended:

- **Bun** >= 1.0.0 (for faster package management and runtime)

## 🔧 Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd booking-system
```

### 2. Install Dependencies

Install all dependencies for the monorepo:

```bash
npm install
```

### 3. Database Setup

#### Option A: Using Neon (Cloud PostgreSQL - Recommended)

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string from the Neon dashboard
4. Update `apps/backend/.env` with your Neon connection string:

```env
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/booking_system?sslmode=require"
```

#### Option B: Using Local PostgreSQL

1. Install PostgreSQL on your machine
2. Create a database:

```bash
createdb booking_system
```

3. Update `apps/backend/.env` with your local connection string:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/booking_system?schema=public"
```

### 4. Configure Environment Variables

#### Backend Environment Variables

Copy the example environment file and update with your values:

```bash
cd apps/backend
cp .env.example .env
```

Edit `.env` and set:

- `DATABASE_URL`: Your PostgreSQL connection string
- `PORT`: Backend server port (default: 3001)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:3000)

#### Frontend Environment Variables

```bash
cd apps/frontend
cp .env.example .env.local
```

Edit `.env.local` and set:

- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:3001)

### 5. Initialize Database

Run Prisma migrations to set up the database schema:

```bash
# From the root directory
npm run db:generate
npm run db:migrate
```

Or from the backend directory:

```bash
cd apps/backend
npm run db:generate
npm run db:migrate
```

### 6. Start Development Servers

#### Option A: Run Both Servers Together

From the root directory:

```bash
npm run dev
```

This will start:

- Frontend on http://localhost:3000
- Backend on http://localhost:3001

#### Option B: Run Servers Separately

**Terminal 1 - Frontend:**

```bash
npm run dev:frontend
# or
cd apps/frontend && npm run dev
```

**Terminal 2 - Backend:**

```bash
npm run dev:backend
# or
cd apps/backend && npm run dev
```

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Run Frontend Tests

```bash
cd apps/frontend
npm run test
```

### Run Backend Tests

```bash
cd apps/backend
npm run test
```

### Run Backend E2E Tests

```bash
cd apps/backend
npm run test:e2e
```

## 🗄️ Database Management

### Prisma Studio (Database GUI)

Open Prisma Studio to view and edit your database:

```bash
npm run db:studio
# or
cd apps/backend && npm run db:studio
```

### Create a Migration

```bash
cd apps/backend
npm run db:migrate
```

### Generate Prisma Client

After updating `schema.prisma`:

```bash
npm run db:generate
# or
cd apps/backend && npm run db:generate
```

## 🏗️ Building for Production

### Build All Applications

```bash
npm run build
```

### Build Individual Applications

```bash
# Frontend
npm run build:frontend

# Backend
npm run build:backend
```

### Start Production Servers

**Frontend:**

```bash
cd apps/frontend
npm run build
npm run start
```

**Backend:**

```bash
cd apps/backend
npm run build
npm run start:prod
```

## 📝 Code Quality

### Linting

```bash
# Lint all workspaces
npm run lint

# Lint specific workspace
cd apps/frontend && npm run lint
cd apps/backend && npm run lint
```

### Formatting

```bash
# Format all code
npm run format

# Check formatting
npm run format:check
```

## 🔍 Health Check

The backend includes a health check endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "development"
}
```

## 📚 Available Scripts

### Root Level

- `npm run dev` - Start both frontend and backend in development mode
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run build` - Build all applications
- `npm run lint` - Lint all workspaces
- `npm run format` - Format all code with Prettier
- `npm run test` - Run tests for all workspaces
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Frontend Scripts

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

### Backend Scripts

- `npm run dev` - Start development server with hot reload (port 3001)
- `npm run build` - Build for production
- `npm run start:prod` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

## 🐛 Troubleshooting

### Database Connection Issues

1. Verify PostgreSQL is running:

   ```bash
   # macOS
   brew services list

   # Linux
   sudo systemctl status postgresql
   ```

2. Check your `DATABASE_URL` in `apps/backend/.env`

3. Test connection:
   ```bash
   psql $DATABASE_URL
   ```

### Port Already in Use

If port 3000 or 3001 is already in use:

- **Frontend**: Change port in `apps/frontend/package.json` dev script
- **Backend**: Change `PORT` in `apps/backend/.env`

### Module Resolution Issues

If you encounter module resolution errors:

```bash
# Clean install
rm -rf node_modules apps/*/node_modules
npm install
```

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## 📄 License

ISC

## 🆘 Support

For issues and questions, please open an issue in the repository.
