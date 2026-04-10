#!/bin/sh
set -e

echo "🚀 Starting fin-flow-api..."

# Run migrations if not skipped
if [ "$SKIP_MIGRATIONS" != "true" ]; then
    echo "📦 Running database migrations..."
    node -e "
        const config = require('./dist/src/config/mikro-orm.config.js');
        const { MikroORM } = require('@mikro-orm/postgresql');
        const { Migrator } = require('@mikro-orm/migrations');
        
        (async () => {
            try {
                const orm = await MikroORM.init(config.default);
                const migrator = new Migrator(orm.em);
                await migrator.init(orm);
                
                // Get executed migrations count
                const storage = migrator.getStorage();
                const executed = await storage.getExecutedMigrations();
                console.log('Already executed:', executed.length, 'migrations');
                
                // Run any pending migrations
                const result = await migrator.runMigrations();
                
                if (result.length > 0) {
                    console.log('✅ Executed', result.length, 'new migration(s):', result.map(m => m.name).join(', '));
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
