import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: ['./dist/**/*.schema.js'],
  entitiesTs: ['./src/**/*.schema.ts'],
  extensions: [Migrator],
  migrations: {
    path: './src/migrations',
  },
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: true,
});
