# Vercel Deployment Guide - Medical Patient Management System

This guide walks you through deploying the Medical App to Vercel.

## 📋 Pre-Deployment Checklist

Before starting, ensure you have:

- [ ] A GitHub account and repository
- [ ] Vercel account (free tier available at https://vercel.com)
- [ ] PostgreSQL database ready (external service like Neon, AWS RDS, etc.)
- [ ] All environment variables documented (see `VERCEL_ENV_VARS.md`)
- [ ] Project built successfully locally: `npm run build`

## 🗄️ Step 1: Set Up PostgreSQL Database

The Medical App requires an external PostgreSQL database. Choose one of these options:

### Option A: Neon (Recommended - Free tier available)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (looks like: `postgresql://user:password@host/database`)
4. Save for later - you'll need this in Step 4

**Pros:** Free tier, auto-scaling, easy to use  
**Cons:** Limited free tier (3 projects)

### Option B: AWS RDS

1. Go to https://console.aws.amazon.com/rds
2. Create a new PostgreSQL database
3. Configure security groups to allow connections from Vercel
4. Copy the endpoint and credentials

**Pros:** Highly scalable, enterprise-ready  
**Cons:** Can be costly, more configuration

### Option C: Render

1. Go to https://render.com and sign up
2. Create a new PostgreSQL database
3. Copy the connection string

**Pros:** Free tier available, simple setup  
**Cons:** Limited free tier resources

### Option D: Supabase (PostgreSQL)

1. Go to https://supabase.com and sign up
2. Create a new project
3. Copy the connection string from Project Settings

**Pros:** Built on PostgreSQL, includes backups and monitoring  
**Cons:** Limited free tier

### Test Your Database Connection

After creating your database, test it locally:

```bash
# Replace with your DATABASE_URL
psql "postgresql://user:password@host:port/database"

# If connection succeeds, you'll see the psql prompt
postgres=# \q
```

If you get a connection error, check:
- ✓ Database user exists
- ✓ Password is correct
- ✓ Host/port are correct
- ✓ Database exists
- ✓ Firewall allows connections (if applicable)

## 🔑 Step 2: Generate Secrets

Generate strong, unique secrets for your deployment:

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Generate JWT_REFRESH_SECRET (run again, use different value)
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Save these values securely - you'll need them in Step 4.

## 📦 Step 3: Push Code to GitHub

```bash
# If not already done
git init
git add .
git commit -m "feat: prepare for Vercel deployment

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Push to GitHub (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/medical-app.git
git branch -M main
git push -u origin main
```

## 🚀 Step 4: Deploy to Vercel

### Option A: Using Vercel Dashboard (Easiest)

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project settings:
   - **Build Command:** `pnpm run build` (already configured)
   - **Output Directory:** `packages/web/dist` (already configured)
   - **Install Command:** `pnpm install` (already configured)
   - Framework Preset: **Other** (it's a monorepo)

5. Click **"Deploy"** to start build
6. **Wait for build to complete** - you'll see a progress indicator
7. Once build succeeds, proceed to Step 5 to add environment variables

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Navigate to project
cd /path/to/medical-app

# Deploy (this will prompt for settings)
vercel --prod

# Link to existing project (if redeploying)
vercel link
```

## 🔐 Step 5: Configure Environment Variables in Vercel

Environment variables must be set in the Vercel dashboard BEFORE the database works.

### Via Dashboard

1. Go to Vercel Dashboard → Your Project
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

   **DATABASE_URL**
   - Value: `postgresql://user:password@host:port/database`
   - Environments: Select all (Production, Preview, Development)

   **JWT_SECRET**
   - Value: The string you generated in Step 2
   - Environments: Production only (for security)

   **JWT_REFRESH_SECRET**
   - Value: The second string you generated in Step 2
   - Environments: Production only

   **NODE_ENV**
   - Value: `production`
   - Environments: Production only

   **CORS_ORIGIN**
   - Value: Your Vercel deployment URL (e.g., `https://medical-app-xyz.vercel.app`)
   - Environments: Production only
   - **Note:** You'll update this after getting your deployment URL

4. Click **"Save"** after each variable

### Via Vercel CLI

```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add JWT_REFRESH_SECRET
vercel env add NODE_ENV
vercel env add CORS_ORIGIN
```

## 🗄️ Step 6: Run Database Migrations

After environment variables are set, run database migrations:

### Option A: Via Vercel CLI

```bash
# This runs the migration script on your production environment
# ⚠️ Only do this once during initial setup!
vercel env pull  # Download env vars locally
cd packages/server
pnpm prisma migrate deploy
```

### Option B: Via Dashboard

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the latest successful deployment
3. Go to the **Function Logs** tab to see if migrations ran
4. If not, trigger a manual deployment:
   - Make a small change to your code
   - Commit and push to main
   - Vercel will redeploy automatically
   - Monitor logs to confirm migrations ran

### Option C: Test Migrations Locally First (Recommended)

```bash
# Simulate production environment locally
cp packages/server/.env.example packages/server/.env.local

# Edit packages/server/.env.local with your production DATABASE_URL
nano packages/server/.env.local

# Test migration script
cd packages/server
pnpm prisma migrate deploy

# If successful, proceed with Vercel deployment
```

⚠️ **IMPORTANT:** Migrations modify your database. Test them in a staging environment first if possible.

## ✅ Step 7: Verify Deployment

After deployment completes and migrations run:

1. **Check Build Logs**
   - Go to Deployments tab
   - Click the latest deployment
   - Verify no errors in build output

2. **Test API Endpoint**
   ```bash
   # Replace with your Vercel URL
   curl https://your-app.vercel.app/api/health
   ```

3. **Test Frontend**
   - Visit `https://your-app.vercel.app/medical-app`
   - You should see the login page
   - Try logging in with test credentials

4. **Monitor Logs**
   - Go to Vercel Dashboard → Your Project → Functions
   - Watch real-time logs as you interact with the app

## 🔧 Step 8: Update CORS_ORIGIN

After your first deployment succeeds:

1. Get your Vercel deployment URL from the dashboard
2. Update CORS_ORIGIN environment variable:
   - Dashboard → Settings → Environment Variables
   - Find CORS_ORIGIN
   - Update value: `https://your-deployment-url.vercel.app`
   - Click Save
3. Redeploy for changes to take effect:
   ```bash
   vercel redeploy --prod
   ```

## 🚨 Troubleshooting

### Build Fails: "Cannot find module '@prisma/client'"

**Cause:** Prisma client not generated during build  
**Solution:**
```bash
# Ensure Prisma is in vercel-build script
# In packages/server/package.json, "vercel-build" should include "prisma generate"
cd packages/server
pnpm prisma generate
```

### Database Connection Error

**Cause:** DATABASE_URL not set or connection fails  
**Solution:**
1. Verify DATABASE_URL in Vercel Environment Variables
2. Check connection string format (should start with `postgresql://`)
3. Test connection locally: `psql $DATABASE_URL`
4. Check database firewall/security groups allow Vercel IPs

### "CORS error" in Browser Console

**Cause:** CORS_ORIGIN not updated after deployment  
**Solution:**
1. Get your deployment URL: `https://your-deployment-url.vercel.app`
2. Update CORS_ORIGIN environment variable
3. Redeploy: `vercel redeploy --prod`

### Frontend Shows 404 or Blank Page

**Cause:** SPA routing not configured properly  
**Solution:**
1. Check vercel.json has SPA rewrite rules
2. Ensure outputDirectory is `packages/web/dist`
3. Check index.html exists in dist folder
4. Clear browser cache and retry

### API Requests Return 503

**Cause:** Serverless function cold start or database connection issue  
**Solution:**
1. Check Prisma migrations completed
2. Check DATABASE_URL is set correctly
3. Wait for database to initialize (first request may take 30s)
4. Check Function Logs for errors

### Migrations Not Running

**Cause:** Migrations script not executed or permissions issue  
**Solution:**
1. Manually run via CLI:
   ```bash
   vercel env pull
   cd packages/server
   pnpm prisma migrate deploy
   ```
2. Check migration status:
   ```bash
   pnpm prisma migrate status
   ```
3. Verify DATABASE_URL is accessible from Vercel

## 📊 Monitoring & Maintenance

### Monitor Performance

1. **Vercel Analytics**
   - Dashboard → Analytics
   - Track response times and error rates

2. **Function Logs**
   - Dashboard → Functions
   - Real-time logs for debugging

3. **Error Tracking**
   - Monitor for database connection errors
   - Check rate limiting isn't triggered

### Regular Maintenance

```bash
# Check for dependency updates
pnpm update --interactive

# Audit for security vulnerabilities
pnpm audit

# After updates, test and redeploy
npm run build
git commit -m "deps: update dependencies"
git push origin main
# Vercel auto-deploys on push
```

### Database Backups

Most PostgreSQL services provide automatic backups. Check your provider:
- **Neon:** Auto backup daily
- **AWS RDS:** Configure backup retention
- **Render:** Auto backup daily
- **Supabase:** Auto backup daily

Enable point-in-time recovery if available.

## 🔐 Security Checklist

Before going to production:

- [ ] Change JWT secrets from default
- [ ] Set NODE_ENV to `production`
- [ ] Enable database SSL/TLS
- [ ] Configure IP whitelisting if available
- [ ] Set up rate limiting on API endpoints
- [ ] Enable Vercel deployment protection
- [ ] Use strong database passwords
- [ ] Never commit `.env` files to git
- [ ] Rotate secrets periodically
- [ ] Monitor logs for suspicious activity

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Prisma Vercel Guide](https://www.prisma.io/docs/guides/other/vercel)
- [Express on Vercel](https://vercel.com/docs/runtimes/nodejs/middleware)
- [PostgreSQL Connection Strings](https://www.postgresql.org/docs/current/libpq-connect.html)

## 💬 Getting Help

If you encounter issues:

1. **Check Vercel Logs**
   - Dashboard → Deployments → Click latest → Logs tab
   - Look for error messages

2. **Check Function Logs**
   - Real-time logs during API requests
   - Dashboard → Functions

3. **Common Issues**
   - See Troubleshooting section above
   - Check VERCEL_ENV_VARS.md for variable setup

4. **Ask for Help**
   - Vercel Support: https://vercel.com/support
   - Repository Issues: https://github.com/YOUR_USERNAME/medical-app/issues

## 🎉 Success!

Once deployed, your Medical App is live! 

**Deployment checklist completed:**
- ✅ Database set up
- ✅ Code deployed to Vercel
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Frontend accessible
- ✅ API responding

**Next steps:**
1. Share your deployment URL with your team
2. Collect feedback and iterate
3. Monitor performance and logs
4. Keep dependencies updated
5. Plan scaling as needed

Happy coding! 🚀
