#!/bin/sh
set -eu
: "${DATABASE_URL:?DATABASE_URL is required}"
: "${IDENTITY_ENCRYPTION_KEY:?IDENTITY_ENCRYPTION_KEY is required}"
./node_modules/.bin/prisma migrate deploy
if [ "${TEST_DEPLOYMENT:-false}" = true ]; then
  node deploy/seed-test.mjs
fi
exec node server.js
