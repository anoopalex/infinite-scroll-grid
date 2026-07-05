#!/bin/sh
set -e

DB_FILE="${DB_PATH:-/app/data/presight.db}"

if [ ! -f "$DB_FILE" ]; then
  echo "No database found at $DB_FILE, seeding..."
  npm run seed
fi

exec npm run start
