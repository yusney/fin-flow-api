#!/bin/sh
set -e

echo "🚀 Starting fin-flow-api..."

# Run migrations if not skipped
if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo "📦 Running database migrations..."
    
    # Use MikroORM CLI directly - it handles the module format correctly
    if npx mikro-orm migration:up 2>&1; then
        echo "✅ Migrations completed successfully"
    else
        echo "❌ Migration failed"
        # Don't exit - let the app try to start anyway
        # This allows for cases where DB is temporarily unavailable
        if [ "$REQUIRE_MIGRATIONS" = "true" ]; then
            exit 1
        fi
    fi
fi

echo "🎯 Starting NestJS application..."
exec node dist/src/main.js
