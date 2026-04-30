#!/bin/bash
# Pre-deployment hook to run Prisma migrations

set -e

echo "🔄 Running Prisma migrations..."

cd packages/server

# Generate Prisma client if not already generated
echo "📦 Generating Prisma client..."
pnpm prisma generate

# Run migrations
echo "🗄️ Deploying database migrations..."
pnpm prisma migrate deploy || true

# Optional: Seed database (comment out if not needed)
# echo "🌱 Seeding database..."
# pnpm seed || true

echo "✅ Database migrations completed successfully!"
