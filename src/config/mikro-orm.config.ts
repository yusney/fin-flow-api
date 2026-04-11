import { defineConfig } from '@mikro-orm/postgresql';
import { Migrator } from '@mikro-orm/migrations';
import { join } from 'path';

// This file compiles to: dist/src/config/mikro-orm.config.js
// At runtime, __dirname is always the compiled location (dist/src/config/)
//
// Development: /home/user/project/dist/src/config
//   -> projectRoot: 3 levels up -> /home/user/project
//   -> entities: projectRoot/dist/**/*.schema.js
//   -> entitiesTs: projectRoot/src/**/*.schema.ts
//   -> migrations: projectRoot/src/migrations (source TS files)
//
// Production (Docker): /app/dist/src/config
//   -> entities: 2 levels up -> /app/dist/**/*.schema.js
//   -> migrations: 1 level up + migrations -> /app/dist/src/migrations (compiled JS)
//   -> entitiesTs and pathTs are ignored in production

const isProduction = process.env.NODE_ENV === 'production';

// __dirname = dist/src/config
// Go up 3 levels to project root (in dev), or 2 levels to dist/ (in prod)
const projectRoot = join(__dirname, '..', '..', '..'); // /home/user/project or /app
const distRoot = join(__dirname, '..', '..'); // dist/src/config -> dist/

export default defineConfig({
  clientUrl: process.env.DATABASE_URL,
  // Production: /app/dist/**/*.schema.js
  // Development: /home/user/project/dist/**/*.schema.js
  entities: [join(distRoot, '**', '*.schema.js')],
  // Only used in development for ts-node / better metadata
  entitiesTs: isProduction
    ? undefined
    : [join(projectRoot, 'src', '**', '*.schema.ts')],
  extensions: [Migrator],
  migrations: {
    // Production: compiled migrations at /app/dist/src/migrations
    // Development: source migrations at /home/user/project/src/migrations
    path: isProduction
      ? join(__dirname, '..', 'migrations') // dist/src/config -> dist/src/migrations
      : join(projectRoot, 'src', 'migrations'),
    // Only used in development
    pathTs: isProduction ? undefined : join(projectRoot, 'src', 'migrations'),
  },
  debug: process.env.NODE_ENV === 'development',
  allowGlobalContext: true,
});
