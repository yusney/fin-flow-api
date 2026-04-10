# AGENTS.md — fin-flow-api

## Stack

NestJS 11 + MikroORM v7 + PostgreSQL. Package manager: **pnpm** (not npm — README is wrong).
Patterns: CQRS (`@nestjs/cqrs`) + Hexagonal Architecture + DDD.

## Commands

```bash
pnpm start:dev          # dev with watch
pnpm build              # compile TypeScript → dist/
pnpm start:prod         # run compiled output

pnpm test               # unit tests (rootDir: src, pattern: *.spec.ts)
pnpm test:watch
pnpm test:cov
pnpm test:e2e           # requires running Postgres

pnpm migration:create   # generate migration from entity changes
pnpm migration:up       # run pending migrations
pnpm migration:down     # rollback last migration
pnpm schema:update      # sync schema directly — DEV ONLY, never prod
```

## Environment

Copy `.env.example` → `.env`. Required vars:

```
PORT, NODE_ENV, DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, JWT_EXPIRES_IN
```

Local Postgres via Docker: `docker compose up -d` (spins up postgres:16-alpine on 5432).

## Module Structure (enforced pattern)

Every feature module lives under `src/modules/{name}/` with these layers:

```
domain/
  entities/       # Pure domain entities (no ORM decorators)
  ports/          # Repository interfaces (e.g. TRANSACTION_REPOSITORY token)
  enums/
application/
  commands/       # Write: handler + command class + .spec.ts
  queries/        # Read: handler + query class + .spec.ts
infrastructure/
  persistence/    # MikroORM schemas (.schema.ts) + concrete repositories
  seeders/        # Seed data (dev only)
presentation/
  controllers/    # Thin — delegates to CommandBus/QueryBus only
  dtos/           # class-validator + class-transformer decorators
```

**Critical**: MikroORM entities (`*.schema.ts`) are separate from domain entities (`*.entity.ts`). Never add ORM decorators to domain entities.

## Dependency Injection

Repository interfaces are injected via token constants, not class types:

```ts
// domain/ports/transaction.repository.ts
export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
export interface ITransactionRepository { ... }

// handler injection
@Inject(TRANSACTION_REPOSITORY)
private readonly repo: ITransactionRepository
```

## Shared Module

`src/shared/` contains cross-cutting concerns available to all modules:

- `domain/base.entity.ts` — base class for all entities (id, createdAt, updatedAt)
- `domain/exceptions/` — `DomainException`, `NotFoundEx`, `ConflictEx`, `ForbiddenEx`, `ValidationEx`
- `infrastructure/filters/domain-exception.filter.ts` — maps domain exceptions to HTTP responses
- `infrastructure/guards/jwt-auth.guard.ts` — global JWT guard
- `infrastructure/decorators/public.decorator.ts` — `@Public()` to bypass JWT guard
- `infrastructure/decorators/current-user.decorator.ts` — `@CurrentUser()` param decorator
- `application/ports/hashing.port.ts` — `IHashingService` interface

## Testing Pattern

Unit tests instantiate handlers directly (no NestJS testing module):

```ts
handler = new CreateXHandler(mockRepo, mockOtherDep);
```

Mocks are plain `jest.Mocked<IRepository>` objects — not `jest.mock()` on modules.
E2E tests (`test/`) require a live Postgres instance.

## MikroORM Config

`mikro-orm.config.ts` at root re-exports from `src/config/mikro-orm.config.ts`.
Entity discovery: `./dist/**/*.schema.js` (prod) / `./src/**/*.schema.ts` (dev).
Migrations path: `src/migrations/` — files named `Migration000XX_description.ts`.

## CI / Docker

- **GitHub Actions** (`.github/workflows/build-and-push.yml`): triggers on push to `main`, builds multi-stage Docker image and pushes to `ghcr.io/{owner}/fin-flow-api`.
- Tags: `latest`, git SHA, timestamp.
- **Pre-commit hook** ("Gentleman Guardian Angel") runs AI code review. It fails if the Claude provider is not configured — use `--no-verify` only as last resort.

## API

- Base path: `/api` (set via NestJS global prefix)
- Swagger: `http://localhost:3000/api/docs`
- Health: `GET /health` (no auth required)
- All routes except `POST /auth/register` and `POST /auth/login` require `Authorization: Bearer <token>`

## Commits & PRs

- All commits, PR titles, and code comments **must be in English**
- Format: `type(scope): description` (Conventional Commits)
- Types: `feat` `fix` `docs` `style` `refactor` `perf` `test` `build` `ci` `chore`
- Subject line ≤ 50 chars, imperative mood ("add" not "added")
- Body: explain WHAT and WHY, wrap at 72 chars
- PR title follows same format; reference issues with `Closes #123`

## NestJS Conventions

- Controllers are thin: only parse request, call `CommandBus.execute()` or `QueryBus.execute()`, return response
- Business logic lives exclusively in command/query handlers
- All request/response shapes use DTOs with `class-validator` decorators
- Use `ValidationPipe({ whitelist: true, transform: true })` — already global in `AppModule`
- Throw domain exceptions from `src/shared/domain/exceptions/`, never NestJS HTTP exceptions from domain/application layers
