# fin-flow-api

**Personal Finance Management API** — NestJS + PostgreSQL + MikroORM v7

---

## Overview

`fin-flow-api` is a RESTful API for managing personal finances. It allows you to register transactions, categorize expenses/income, define monthly budgets, manage recurring subscriptions, and use a catalog of popular service templates.

---

## Tech Stack

| Layer          | Technology             |
| -------------- | ---------------------- |
| Framework      | NestJS                 |
| ORM            | MikroORM v7            |
| Database       | PostgreSQL             |
| Authentication | JWT (@nestjs/passport) |
| Validation     | class-validator        |
| Testing        | Jest                   |
| Patterns       | CQRS + Hexagonal + DDD |

---

## Modules

| Module                     | Description                                |
| -------------------------- | ------------------------------------------ |
| **Auth**                   | User registration, login, JWT tokens       |
| **Categories**             | User-defined expense/income categories     |
| **Transactions**           | Financial movement records                 |
| **Budgets**                | Monthly spending limits per category       |
| **Subscriptions**          | Recurring subscription management          |
| **Subscription Templates** | Catalog of 72+ pre-built service templates |

---

## Architecture

```
src/modules/{module-name}/
├── domain/                    # Pure business logic
│   ├── entities/              # Models
│   ├── enums/                # Constants
│   └── ports/                 # Repository interfaces
├── application/               # Use cases (CQRS)
│   ├── commands/              # WRITE: Create, Update, Delete
│   └── queries/               # READ: GetAll, GetById
├── infrastructure/            # Concrete implementations
│   └── persistence/           # MikroORM schemas + repositories
└── presentation/             # API layer
    ├── controllers/           # REST endpoints
    └── dtos/                 # Data Transfer Objects
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone git@github.com:yusney/fin-flow-api.git
cd fin-flow-api

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your database and JWT settings
```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fin_flow
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=your-secret-here
JWT_EXPIRATION=7d

NODE_ENV=development
```

### Database Setup

```bash
# Run migrations
npm run migration:up

# Seed default data (optional)
npm run seed
```

### Running the Application

```bash
# Development mode (watch)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### API Documentation

Once running, access Swagger UI at:

```
http://localhost:3000/api/docs
```

### Base URL

```
http://localhost:3000/api
```

---

## API Endpoints

### Authentication

| Method | Endpoint       | Description       |
| ------ | -------------- | ----------------- |
| POST   | /auth/register | Register new user |
| POST   | /auth/login    | Login and get JWT |

### Categories

| Method | Endpoint        | Description          |
| ------ | --------------- | -------------------- |
| GET    | /categories     | List user categories |
| POST   | /categories     | Create category      |
| PUT    | /categories/:id | Update category      |
| DELETE | /categories/:id | Delete category      |

### Transactions

| Method | Endpoint              | Description          |
| ------ | --------------------- | -------------------- |
| GET    | /transactions         | List transactions    |
| POST   | /transactions         | Create transaction   |
| PUT    | /transactions/:id     | Update transaction   |
| DELETE | /transactions/:id     | Delete transaction   |
| GET    | /transactions/summary | Get spending summary |

### Budgets

| Method | Endpoint        | Description               |
| ------ | --------------- | ------------------------- |
| GET    | /budgets        | List budgets              |
| POST   | /budgets        | Create budget             |
| PUT    | /budgets/:id    | Update budget             |
| DELETE | /budgets/:id    | Delete budget             |
| GET    | /budgets/status | Budget vs actual spending |

### Subscriptions

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | /subscriptions            | List subscriptions  |
| POST   | /subscriptions            | Create subscription |
| PUT    | /subscriptions/:id/toggle | Pause/Active toggle |

### Subscription Templates

| Method | Endpoint                    | Description          |
| ------ | --------------------------- | -------------------- |
| GET    | /subscription-templates     | List templates       |
| GET    | /subscription-templates/:id | Get template by ID   |
| POST   | /subscription-templates     | Create user template |
| PATCH  | /subscription-templates/:id | Update user template |
| DELETE | /subscription-templates/:id | Delete user template |

---

## Testing

```bash
# Unit tests
npm test

# Unit tests (watch mode)
npm run test:watch

# Test coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

---

## Database Scripts

```bash
# Generate migration
npm run migration:create

# Run migrations
npm run migration:up

# Rollback last migration
npm run migration:down

# Update schema (dev only)
npm run schema:update
```

---

## License

MIT
