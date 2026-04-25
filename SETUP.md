# Setup Guide - Medical Patient Management System

## Quick Start

### Prerequisites
- Node.js 18.x or higher
- PostgreSQL 14.x or higher
- pnpm (recommended) or npm/yarn

### Step 1: Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd medical-app

# Install all dependencies
pnpm install

# Or with npm
npm install
```

### Step 2: Database Setup

#### Option A: Local PostgreSQL
1. **Install PostgreSQL** (if not already installed)
   ```bash
   # macOS
   brew install postgresql
   
   # Ubuntu/Debian
   sudo apt-get install postgresql postgresql-contrib
   
   # Windows
   # Download from https://www.postgresql.org/download/windows/
   ```

2. **Create database**
   ```bash
   psql -U postgres
   postgres=# CREATE DATABASE medical_app;
   postgres=# \q
   ```

#### Option B: Docker PostgreSQL
```bash
docker run -d \
  --name medical-db \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=medical_app \
  -p 5432:5432 \
  postgres:14
```

### Step 3: Environment Configuration

#### Backend Configuration
```bash
cd packages/server
cp .env.example .env
```

Edit `packages/server/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/medical_app"
JWT_SECRET="your-secret-key-min-32-chars-change-in-production"
JWT_REFRESH_SECRET="your-refresh-secret-min-32-chars-change-in-production"
NODE_ENV="development"
PORT=5000
```

#### Frontend Configuration
Create `packages/web/.env.local`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Step 4: Initialize Database

```bash
cd packages/server

# Generate Prisma client
pnpm prisma generate

# Run migrations
pnpm prisma migrate deploy

# (Optional) Seed initial data
pnpm seed
```

### Step 5: Start Development Servers

**Option A: Run all from root**
```bash
# From medical-app/ root directory
pnpm dev

# Both frontend and backend will start:
# Frontend: http://localhost:3000
# Backend: http://localhost:5000
```

**Option B: Run separately**
```bash
# Terminal 1 - Backend
cd packages/server
pnpm dev

# Terminal 2 - Frontend
cd packages/web
pnpm dev
```

### Step 6: Access the Application

1. Open http://localhost:3000 in your browser
2. Register a new account:
   - Email: test@example.com
   - Password: Test123456
   - Specialty: General Medicine

## Testing the Application

### Test Workflow

1. **Create a Patient**
   - Click "New Patient"
   - Fill in patient details
   - Submit

2. **Add Vital Signs**
   - Go to patient details
   - Add vital signs (temperature, pulse, etc.)

3. **Generate DDx**
   - Add symptoms and signs
   - System suggests differential diagnoses

4. **Record Investigation**
   - Request an investigation
   - Add results when available

5. **Prescribe Treatment**
   - Search and select medicine
   - Set dosage and frequency
   - Track treatment status

## Troubleshooting

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill process (macOS/Linux)
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Database Connection Error
```bash
# Verify PostgreSQL is running
psql -U postgres -d medical_app

# Check DATABASE_URL in .env
# Should be: postgresql://user:password@host:port/database

# Verify credentials are correct
```

### Module Not Found Errors
```bash
# Clean and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
pnpm prisma generate
```

### Frontend Not Connecting to Backend
- Check VITE_API_BASE_URL in packages/web/.env.local
- Ensure backend is running on port 5000
- Check browser console for errors
- Check CORS is enabled (should be by default)

## Project Commands

```bash
# From root directory

# Development
pnpm dev              # Run both frontend and backend

# Building
pnpm build           # Build all packages

# Type checking
pnpm type-check      # Check TypeScript errors

# Database
cd packages/server && pnpm prisma:migrate      # Run migrations
cd packages/server && pnpm prisma:studio       # Open Prisma Studio
cd packages/server && pnpm seed                # Seed initial data

# Cleaning
pnpm clean           # Remove all node_modules and build files
```

## Project Structure Explanation

### `/packages/shared`
Common types, schemas, and constants shared between frontend and backend.

**Key files:**
- `types.ts` - TypeScript interfaces for all entities
- `schemas.ts` - Zod validation schemas
- `constants.ts` - Application constants

### `/packages/server`
Express.js backend with medical logic.

**Key directories:**
- `src/modules/` - Feature modules (auth, patients, diagnosis, etc.)
- `src/lib/` - Utilities (auth, errors, diagnosis engine)
- `src/middleware/` - Express middleware
- `prisma/` - Database schema and migrations

**Starting backend:**
```bash
cd packages/server
pnpm dev
```

### `/packages/web`
React frontend with Vite build tool.

**Key directories:**
- `src/pages/` - Page components
- `src/components/` - Reusable components
- `src/layouts/` - Layout components
- `src/lib/` - Utilities (API client, state store)

**Starting frontend:**
```bash
cd packages/web
pnpm dev
```

## Next Steps After Setup

1. **Explore the codebase**
   - Start with `packages/shared/src/types.ts`
   - Then `packages/server/src/index.ts`
   - Then `packages/web/src/App.tsx`

2. **Populate medical data**
   - Add diseases to database
   - Add medicines reference
   - Add investigations templates

3. **Build features**
   - Dashboard improvements
   - Reporting system
   - Advanced search

4. **Customization**
   - Adjust UI colors in tailwind.config.js
   - Add more specialties
   - Implement role-based access

## Performance Tips

- Use React DevTools Profiler to identify bottlenecks
- Check Network tab in browser for slow API calls
- Use `pnpm build` and preview to test production build
- Profile backend with `node --inspect` if needed

## Security Checklist Before Production

- [ ] Change JWT secrets in .env
- [ ] Set NODE_ENV=production
- [ ] Enable HTTPS/TLS
- [ ] Set strong database password
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Implement audit logging
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Review and update dependencies

## Useful Resources

- [Medical App README](../README.md) - Full documentation
- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [Prisma Docs](https://www.prisma.io/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## Getting Help

1. Check error messages carefully
2. Look at console logs (browser and terminal)
3. Check Prisma Studio for database state: `pnpm prisma:studio`
4. Verify environment variables are correct
5. Try restarting servers
6. Check GitHub issues for known problems

---

Happy coding! 🏥
