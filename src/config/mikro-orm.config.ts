import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';

export default defineConfig({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  dbName: process.env.DB_NAME || 'fin_flow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  entities: ['./dist/**/*.schema.js'],
  entitiesTs: ['./src/**/*.schema.ts'],
  extensions: [Migrator],
  migrations: {
    path: './src/migrations',
  },
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: true,
});
