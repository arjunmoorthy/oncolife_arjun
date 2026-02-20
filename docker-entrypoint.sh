#!/bin/sh
set -e

echo "Applying database schema..."
npx prisma db push --schema=packages/db/prisma/schema.prisma --accept-data-loss

echo "Seeding database..."
npx prisma db seed --schema=packages/db/prisma/schema.prisma || echo "Seed skipped or already done"

echo "Starting server..."
exec node server/dist/server.js

