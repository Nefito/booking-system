# Quick Setup Guide

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Set up environment variables:**
   ```bash
   # Backend
   cp apps/backend/.env.example apps/backend/.env
   # Edit apps/backend/.env with your DATABASE_URL
   
   # Frontend
   cp apps/frontend/.env.example apps/frontend/.env.local
   ```

3. **Set up database:**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

4. **Start development servers:**
   ```bash
   npm run dev
   ```

   - Frontend: http://localhost:3000
   - Backend: http://localhost:3001
   - Health check: http://localhost:3001/health

## ✅ Verification

### Backend Health Check
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

### Frontend
Open http://localhost:3000 in your browser. You should see:
- The Booking System homepage
- Backend health check status displayed on the page

## 🗄️ Database Options

### Option 1: Neon (Cloud PostgreSQL - Recommended)
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string
4. Update `apps/backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/booking_system?sslmode=require"
   ```

### Option 2: Local PostgreSQL
1. Install PostgreSQL
2. Create database:
   ```bash
   createdb booking_system
   ```
3. Update `apps/backend/.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/booking_system?schema=public"
   ```

## 📝 Next Steps

1. Review the main [README.md](./README.md) for detailed documentation
2. Explore the codebase structure
3. Start building your booking system features!

