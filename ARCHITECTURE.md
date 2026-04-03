# fin-flow-api

**API de Gestión Financiera Personal** — NestJS + PostgreSQL + MikroORM v7

---

## Resumen

`fin-flow-api` es una API REST para gestionar finanzas personales. Permite registrar transacciones, categorizar gastos/ingresos, definir presupuestos mensuales, gestionar suscripciones recurrentes y usar un catálogo de plantillas de servicios populares.

---

## Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENTE (Frontend)                         │
│                   http://localhost:3000                        │
└─────────────────────────────┬───────────────────────────────────┘
                              │ REST API
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NESTJS (Backend)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Auth Module  │  │ Categories   │  │ Transactions Module   │ │
│  │ (JWT)        │  │ (Gastos/     │  │ (Registro de          │ │
│  │              │  │  Ingresos)   │  │  movimientos)         │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ Budgets      │  │ Subscriptions│  │ Subscription          │ │
│  │ (Presupuesto)│  │ (Suscrip-    │  │ Templates (Catálogo) │ │
│  │              │  │  ciones)      │  │                       │ │
│  └──────────────┘  └──────────────┘  └───────────────────────┘ │
└─────────────────────────────┬───────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              POSTGRESQL (Base de Datos)                         │
│                   + MikroORM v7 (ORM)                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Tablas de la Base de Datos

| Tabla                      | Propósito                     | Campos Clave                                                                                     |
| -------------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ |
| **users**                  | Usuarios registrados          | `id`, `name`, `email`, `password_hash`                                                           |
| **categories**             | Categorías de gastos/ingresos | `id`, `name`, `type` (income/expense), `user_id`                                                 |
| **transactions**           | Movimientos financieros       | `id`, `amount`, `description`, `date`, `category_id`, `user_id`                                  |
| **budgets**                | Presupuestos mensuales        | `id`, `limit_amount`, `month`, `year`, `category_id`, `user_id`                                  |
| **subscriptions**          | Suscripciones recurrentes     | `id`, `amount`, `description`, `billing_day`, `is_active`, `category_id`, `user_id`              |
| **subscription_templates** | Catálogo de servicios         | `id`, `name`, `icon_url`, `service_url`, `default_amount`, `category`, `ownership` (GLOBAL/USER) |

---

## Módulos de la Aplicación

### 1. Auth Module — Autenticación

```
Registro → Login → JWT Token
```

**Endpoints:**

- `POST /api/auth/register` — Crear usuario
- `POST /api/auth/login` — Obtener token JWT

**Flujo:**

1. El usuario se registra con email/password
2. El sistema hashea la contraseña y guarda en `users`
3. El usuario hace login y recibe un JWT token
4. Todas las requests subsiguientes incluyen el token en el header:
   ```
   Authorization: Bearer <token>
   ```

**Seguridad:**

- Contraseñas hasheadas con bcrypt
- JWT con expiración
- Cada endpoint protegido requiere token válido

---

### 2. Categories Module — Categorías

```
Usuario crea sus propias categorías de gastos/ingresos
```

**Endpoints:**

- `GET /api/categories` — Listar categorías del usuario
- `POST /api/categories` — Crear categoría
- `PUT /api/categories/:id` — Actualizar categoría
- `DELETE /api/categories/:id` — Eliminar categoría

**Características:**

- Cada usuario tiene sus propias categorías (aislamiento por `user_id`)
- Tipos: `income` (ingreso) o `expense` (gasto)
- Ejemplos: "Salario", "Alquiler", "Comida", "Transporte"

**Relaciones:**

- Una categoría puede tener muchas transacciones (`one-to-many`)
- Una categoría puede tener muchos presupuestos (`one-to-many`)
- Una categoría puede tener muchas suscripciones (`one-to-many`)

---

### 3. Transactions Module — Transacciones

```
Registro de movimientos financieros
```

**Endpoints:**

- `GET /api/transactions` — Listar transacciones (con filtros)
- `POST /api/transactions` — Crear transacción
- `PUT /api/transactions/:id` — Actualizar transacción
- `DELETE /api/transactions/:id` — Eliminar transacción
- `GET /api/transactions/summary` — Resumen de gastos/ingresos

**Características:**

- Cada transacción tiene: amount, description, date, category_id
- Amount positivo = ingreso, negativo = gasto (o usar category type)
- Filtrable por rango de fechas, categoría, etc.

**Flujo típico:**

```typescript
// Crear transacción de gasto
POST /api/transactions
{
  "amount": 50.00,
  "description": "Supermercado",
  "date": "2026-03-27",
  "categoryId": "uuid-de-categoria-comida"
}
```

---

### 4. Budgets Module — Presupuestos

```
Límites de gasto mensuales por categoría
```

**Endpoints:**

- `GET /api/budgets` — Listar presupuestos
- `POST /api/budgets` — Crear presupuesto
- `PUT /api/budgets/:id` — Actualizar presupuesto
- `DELETE /api/budgets/:id` — Eliminar presupuesto
- `GET /api/budgets/status` — Estado de presupuestos vs gastos reales

**Características:**

- Define cuánto podés gastar en cada categoría por mes
- Formato: `limit_amount`, `month` (1-12), `year`
- Única restricción: un presupuesto por categoría/mes/año (`UNIQUE`)

**Flujo típico:**

```typescript
// Crear presupuesto para marzo 2026
POST /api/budgets
{
  "limitAmount": 500.00,
  "month": 3,
  "year": 2026,
  "categoryId": "uuid-de-categoria-comida"
}
```

**Cálculo de estado:**

- El endpoint `/status` compara:
  - Lo gastado en el mes (suma de transactions de esa categoría)
  - vs el límite definido en budget

---

### 5. Subscriptions Module — Suscripciones

```
Gestión de suscripciones recurrentes
```

**Endpoints:**

- `GET /api/subscriptions` — Listar suscripciones
- `POST /api/subscriptions` — Crear suscripción
- `PUT /api/subscriptions/:id/toggle` — Pausar/Activar suscripción

**Características:**

- Representa servicios recurrentes (Netflix, Spotify, gimnasio, etc.)
- Tiene `billing_day` (día del mes donde se cobra, ej: 15)
- Campo `is_active` para pausar sin eliminar
- Frecuencia: MONTHLY o ANNUAL

**Flujo típico:**

```typescript
// Crear suscripción a Netflix
POST /api/subscriptions
{
  "amount": 15.49,
  "description": "Netflix",
  "billingDay": 15,
  "categoryId": "uuid-de-entretenimiento",
  "frequency": "MONTHLY"
}
```

---

### 6. Subscription Templates Module — Catálogo

```
Catálogo de servicios predefinidos para crear suscripciones rápido
```

**Endpoints:**

- `GET /api/subscription-templates` — Listar plantillas (filtrable por categoría)
- `GET /api/subscription-templates/:id` — Obtener plantilla específica
- `POST /api/subscription-templates` — Crear plantilla propia
- `PATCH /api/subscription-templates/:id` — Actualizar plantilla propia
- `DELETE /api/subscription-templates/:id` — Eliminar plantilla propia

**Características:**

- **72 plantillas globales** precargadas (Netflix, Spotify, Amazon Prime, etc.)
- Ownership dual:
  - `GLOBAL` = del sistema (no editable por usuarios)
  - `USER` = creada por el usuario
- Categorías: STREAMING, MUSIC, CLOUD_STORAGE, PRODUCTIVITY, GAMING, etc.
- Incluye URL de icono (Clearbit) y enlace al servicio

**Flujo típico:**

```typescript
// 1. Ver plantillas disponibles
GET /api/subscription-templates?category=STREAMING

// 2. Ver una plantilla específica
GET /api/subscription-templates/:id

// 3. Crear suscripción basada en plantilla (usando datos de la plantilla)
POST /api/subscriptions
{
  "amount": 15.49,  // de la plantilla
  "description": "Netflix",  // de la plantilla
  "billingDay": 15,
  "categoryId": "uuid-del-usuario"
}
```

**Plantillas globales seeded:**

- Streaming: Netflix, Disney+, HBO Max, Paramount+, Apple TV+, etc.
- Música: Spotify, Apple Music, YouTube Music, Tidal, etc.
- Cloud: iCloud+, Google One, Dropbox, OneDrive
- Productividad: Microsoft 365, Adobe CC, Notion, ChatGPT Plus, etc.
- Y más...

---

## Patrones de Arquitectura

### Clean Architecture (Hexagonal)

```
src/modules/{module-name}/
├── domain/                    # Lógica de negocio pura
│   ├── entities/              # Modelos (Subscription, User, etc.)
│   ├── enums/                 # Constantes (TemplateOwnership, BillingFrequency)
│   └── ports/                 # Interfaces de repositorios
├── application/               # Casos de uso (CQRS)
│   ├── commands/              # WRITE: Create, Update, Delete
│   └── queries/               # READ: GetAll, GetById
├── infrastructure/            # Implementaciones concretas
│   └── persistence/          # MikroORM (schema + repository)
└── presentation/              # API HTTP
    ├── controllers/           # Endpoints REST
    └── dtos/                 # Data Transfer Objects
```

**Ejemplo: Subscription Template**

```
subscription-templates/
├── domain/
│   ├── entities/
│   │   ├── subscription-template.entity.ts      # Modelo + validación
│   │   └── subscription-template.entity.spec.ts # Tests
│   ├── enums/
│   │   ├── template-category.enum.ts           # STREAMING, MUSIC, etc.
│   │   └── template-ownership.enum.ts          # GLOBAL, USER
│   └── ports/
│       └── subscription-template.repository.ts  # Interfaz
├── application/
│   ├── commands/
│   │   ├── create-subscription-template.command.ts
│   │   ├── create-subscription-template.handler.ts
│   │   └── ...
│   └── queries/
│       ├── get-subscription-templates.query.ts
│       └── ...
├── infrastructure/
│   └── persistence/
│       ├── subscription-template.schema.ts       # MikroORM Schema
│       └── mikro-orm-subscription-template.repository.ts
├── presentation/
│   ├── controllers/
│   │   └── subscription-templates.controller.ts
│   └── dtos/
│       ├── create-subscription-template.dto.ts
│       └── update-subscription-template.dto.ts
└── subscription-templates.module.ts
```

### CQRS (Command Query Responsibility Segregation)

- **Commands** (ESCRIBIR): Create, Update, Delete
  - Usan `CommandBus` de NestJS
  - Retornan el resultado de la operación
- **Queries** (LEER): GetAll, GetById
  - Usan `QueryBus` de NestJS
  - Retornan datos

### Repository Pattern

- **Port** (interfaz): En `domain/ports/`
- **Implementación**: En `infrastructure/persistence/`
- Inyectado vía DI con tokens (ej: `SUBSCRIPTION_TEMPLATE_REPOSITORY`)

### Entity Schema (MikroORM v7)

No se usan decorators como `@Entity()`. En cambio, se define un schema separado:

```typescript
// subscription-template.schema.ts
export const SubscriptionTemplateSchema = new EntitySchema({
  class: SubscriptionTemplate,
  tableName: 'subscription_templates',
  properties: {
    id: { type: 'uuid', primary: true },
    name: { type: 'string', length: 100 },
    // ...
  },
});
```

---

## Tecnologías

| Capa          | Tecnología                          |
| ------------- | ----------------------------------- |
| Framework     | NestJS                              |
| ORM           | MikroORM v7                         |
| Base de Datos | PostgreSQL                          |
| Autenticación | JWT (@nestjs/passport)              |
| Validación    | class-validator                     |
| Testing       | Jest                                |
| Patrones      | CQRS + Hexagonal Architecture + DDD |

---

## Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Iniciar en modo watch
npm run build              # Compilar

# Testing
npm test                   # Unit tests
npm run test:watch         # Unit tests en watch
npm run test:cov           # Coverage
npm run test:e2e           # E2E tests

# Base de datos
npm run migration:generate # Generar migración
npm run migration:run      # Correr migraciones
npm run seed               # Correr seeders
```

---

## Variables de Entorno

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fin_flow
DB_USER=postgres
DB_PASSWORD=postgres

JWT_SECRET=tu-secret-aqui
JWT_EXPIRATION=7d

NODE_ENV=development
```

---

## Licencia

MIT
