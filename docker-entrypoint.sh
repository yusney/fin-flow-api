#!/bin/sh
set -e

echo "🚀 Starting fin-flow-api..."

# Run migrations if not skipped
if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo "📦 Running database migrations..."
    node -e "
        const config = require('./dist/src/config/mikro-orm.config.js');
        const { MikroORM } = require('@mikro-orm/postgresql');
        
        (async () => {
            try {
                const orm = await MikroORM.init(config.default);
                const migrator = orm.getMigrator();
                const pending = await migrator.getPendingMigrations();
                
                if (pending.length > 0) {
                    console.log('Pending migrations:', pending.map(m => m.name).join(', '));
                    await migrator.up();
                    console.log('✅ Migrations completed successfully');
                } else {
                    console.log('✅ No pending migrations');
                }
                
                await orm.close();
            } catch (error) {
                console.error('❌ Migration failed:', error.message);
                // Don't exit - let the app try to start anyway
                // This allows for cases where DB is temporarily unavailable
                if (process.env.REQUIRE_MIGRATIONS === 'true') {
                    process.exit(1);
                }
            }
        })();
    "
fi

echo "🎯 Starting NestJS application..."
exec node dist/src/main.js
