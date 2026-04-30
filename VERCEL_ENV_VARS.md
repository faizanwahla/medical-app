# Vercel Environment Variables Guide

This document describes all required and optional environment variables for deploying the Medical Patient Management System to Vercel.

## Required Environment Variables

### Database Configuration

#### `DATABASE_URL`
- **Type**: Connection string
- **Required**: Yes
- **Description**: PostgreSQL database connection string
- **Format**: `postgresql://[user]:[password]@[host]:[port]/[database]`
- **Example**: `postgresql://postgres:password123@db.example.com:5432/medical_app`
- **Notes**: 
  - Use a strong, unique password
  - For development, use: `postgresql://postgres:postgres@localhost:5432/medical_app`
  - For production, ensure SSL is enabled if available
  - URL-encode special characters in password

### Authentication Secrets

#### `JWT_SECRET`
- **Type**: String
- **Required**: Yes
- **Description**: Secret key for signing JWT access tokens
- **Length**: Minimum 32 characters
- **Example**: `your-super-secret-jwt-key-min-32-chars-long-change-this`
- **Notes**:
  - Generate a cryptographically secure random string
  - Use: `openssl rand -base64 32` or `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`
  - Change this value in production - use different keys for dev/staging/prod

#### `JWT_REFRESH_SECRET`
- **Type**: String
- **Required**: Yes
- **Description**: Secret key for signing JWT refresh tokens
- **Length**: Minimum 32 characters
- **Example**: `your-super-secret-refresh-key-min-32-chars-long-change-this`
- **Notes**:
  - Must be different from `JWT_SECRET`
  - Generate using same method as JWT_SECRET

### Server Configuration

#### `NODE_ENV`
- **Type**: Enum
- **Required**: Yes
- **Values**: `production`, `staging`, `development`
- **Default**: `production` (for Vercel)
- **Description**: Node.js environment mode
- **Notes**:
  - Set to `production` for Vercel deployment
  - Affects error handling, logging, and optimization

#### `PORT`
- **Type**: Number
- **Required**: No
- **Default**: `5000`
- **Description**: Server port (Vercel serverless functions ignore this)
- **Notes**:
  - Vercel automatically assigns the port for serverless functions
  - This is mainly for local development

#### `CORS_ORIGIN`
- **Type**: String (comma-separated URLs)
- **Required**: No
- **Default**: `http://localhost:3000`
- **Example**: `https://medical-app.vercel.app,https://medical-app.yourdomain.com,https://www.medical-app.yourdomain.com`
- **Description**: Allowed origins for CORS requests
- **Notes**:
  - For production, set to your Vercel deployment URL and custom domain
  - Separate multiple origins with commas
  - Include both www and non-www versions if using custom domain
  - Frontend and API must match for CORS to work

## Optional Environment Variables

### Debugging & Monitoring

#### `DEBUG`
- **Type**: String
- **Default**: Empty
- **Description**: Enable debug logging
- **Example**: `*` (all) or `medical-app:*` (app only)
- **Notes**: Only use in development/staging

## How to Set Variables in Vercel

### Method 1: Vercel Dashboard
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Navigate to **Settings** → **Environment Variables**
4. Add each variable with its value
5. Select environments: Production, Preview, Development
6. Click **Save**
7. Redeploy project for changes to take effect

### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Add environment variable
vercel env add DATABASE_URL

# Deploy
vercel deploy --prod
```

### Method 3: vercel.json
Add to `vercel.json` (for reference only, actual values in dashboard):
```json
{
  "env": [
    "DATABASE_URL",
    "JWT_SECRET",
    "JWT_REFRESH_SECRET",
    "NODE_ENV",
    "CORS_ORIGIN"
  ]
}
```

## Production Setup Checklist

Before deploying to production:

- [ ] Create PostgreSQL database (external provider: Neon, AWS RDS, Heroku Postgres, etc.)
- [ ] Generate strong JWT secrets (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` with production URLs
- [ ] Verify DATABASE_URL connection works
- [ ] Set unique secrets for each environment (dev/staging/prod)
- [ ] Enable SSL/TLS if available for database
- [ ] Test database migrations run successfully
- [ ] Backup production database before first deploy
- [ ] Enable Vercel deployment protection for production

## Recommended External Services for Database

### Option 1: Neon (PostgreSQL)
- Free tier available
- Auto-scaling, serverless PostgreSQL
- Easy backup and restore
- Sign up: https://neon.tech

### Option 2: AWS RDS
- Managed PostgreSQL
- Fine-grained control
- Higher cost than Neon
- Sign up: https://aws.amazon.com/rds/

### Option 3: Render
- Managed PostgreSQL
- Free tier with limitations
- Easy Vercel integration
- Sign up: https://render.com

### Option 4: Heroku Postgres
- Legacy option, no longer recommended
- Consider alternatives above

## Database Connection Testing

After setting DATABASE_URL, verify connection:

```bash
# Test locally with CLI
psql DATABASE_URL

# Or in your Node.js app:
# The server will test connection on startup
npm run dev
```

## Security Notes

⚠️ **IMPORTANT SECURITY GUIDELINES:**

1. **Never commit .env files to git** - they're already in .gitignore
2. **Use strong, unique secrets** - not the examples shown here
3. **Rotate secrets periodically** in production
4. **Use separate values for dev/staging/prod**
5. **Enable Vercel deployment protection** to prevent unauthorized deployments
6. **Audit environment variable access** via Vercel dashboard
7. **Use IP whitelisting** for database if available
8. **Enable SSL** for database connections
9. **Monitor failed login attempts** in application logs
10. **Keep dependencies updated** (npm/pnpm audit regularly)

## Troubleshooting

### "Cannot find module '@prisma/client'"
- Ensure DATABASE_URL is set during build
- Prisma generates client during `vercel-build` script
- Check build logs in Vercel dashboard

### "Database connection failed"
- Verify DATABASE_URL format is correct
- Check if database is accessible from Vercel's IP range
- Ensure database user has correct permissions
- For external databases, check firewall/security groups

### "CORS error in browser"
- Verify your Vercel URL is in CORS_ORIGIN
- Check for typos in domain names
- Restart deployment after changing CORS_ORIGIN
- Clear browser cache

### "JWT token not working"
- Ensure JWT_SECRET and JWT_REFRESH_SECRET are exactly the same as during development
- Re-login after changing JWT secrets (old tokens won't work)
- Check token expiration time

## References

- [Vercel Environment Variables Docs](https://vercel.com/docs/projects/environment-variables)
- [Prisma Connection Strings](https://www.prisma.io/docs/reference/database-reference/connection-urls/postgresql)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Documentation](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
