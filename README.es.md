# fin-flow-api

**API de Gestión Financiera Personal** — NestJS + PostgreSQL + MikroORM v7

---

## Resumen

`fin-flow-api` es una API REST para gestionar finanzas personales. Permite registrar transacciones, categorizar gastos/ingresos, definir presupuestos mensuales, gestionar suscripciones recurrentes y usar un catálogo de plantillas de servicios populares.

---

## Tecnologías

| Capa          | Tecnología             |
| ------------- | ---------------------- |
| Framework     | NestJS                 |
| ORM           | MikroORM v7            |
| Base de Datos | PostgreSQL             |
| Autenticación | JWT (@nestjs/passport) |
| Validación    | class-validator        |
| Testing       | Jest                   |
| Patrones      | CQRS + Hexagonal + DDD |

---

## Módulos

| Módulo                     | Descripción                                            |
| -------------------------- | ------------------------------------------------------ |
| **Auth**                   | Registro de usuarios, login, tokens JWT                |
| **Categories**             | Categorías de gastos/ingresos definidas por el usuario |
| **Transactions**           | Registro de movimientos financieros                    |
| **Budgets**                | Límites de gasto mensuales por categoría               |
| **Subscriptions**          | Gestión de suscripciones recurrentes                   |
| **Subscription Templates** | Catálogo de 72+ plantillas de servicios predefinidos   |

---

## Arquitectura

```
src/modules/{module-name}/
├── domain/                    # Lógica de negocio pura
│   ├── entities/              # Modelos
│   ├── enums/                 # Constantes
│   └── ports/                 # Interfaces de repositorios
├── application/               # Casos de uso (CQRS)
│   ├── commands/              # ESCRIBIR: Crear, Actualizar, Eliminar
│   └── queries/               # LEER: ObtenerTodo, ObtenerPorId
├── infrastructure/            # Implementaciones concretas
│   └── persistence/           # Esquemas y repositorios MikroORM
└── presentation/              # Capa API
    ├── controllers/           # Endpoints REST
    └── dtos/                  # Objetos de Transferencia de Datos
```

---

## Primeros Pasos

### Requisitos Previos

- Node.js 20+
- PostgreSQL 15+
- npm o pnpm

### Instalación

```bash
# Clonar el repositorio
git clone git@github.com:yusney/fin-flow-api.git
cd fin-flow-api

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tu configuración de base de datos y JWT
```

### Variables de Entorno

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

### Configuración de Base de Datos

```bash
# Ejecutar migraciones
npm run migration:up

# Poblar datos por defecto (opcional)
npm run seed
```

### Ejecutar la Aplicación

```bash
# Modo desarrollo (watch)
npm run start:dev

# Modo producción
npm run build
npm run start:prod
```

### Documentación de la API

Una vez ejecutándose, accede a Swagger UI en:

```
http://localhost:3000/api/docs
```

### URL Base

```
http://localhost:3000/api
```

---

## Endpoints de la API

### Autenticación

| Método | Endpoint       | Descripción                  |
| ------ | -------------- | ---------------------------- |
| POST   | /auth/register | Registrar nuevo usuario      |
| POST   | /auth/login    | Iniciar sesión y obtener JWT |

### Categorías

| Método | Endpoint        | Descripción                   |
| ------ | --------------- | ----------------------------- |
| GET    | /categories     | Listar categorías del usuario |
| POST   | /categories     | Crear categoría               |
| PUT    | /categories/:id | Actualizar categoría          |
| DELETE | /categories/:id | Eliminar categoría            |

### Transacciones

| Método | Endpoint              | Descripción               |
| ------ | --------------------- | ------------------------- |
| GET    | /transactions         | Listar transacciones      |
| POST   | /transactions         | Crear transacción         |
| PUT    | /transactions/:id     | Actualizar transacción    |
| DELETE | /transactions/:id     | Eliminar transacción      |
| GET    | /transactions/summary | Obtener resumen de gastos |

### Presupuestos

| Método | Endpoint        | Descripción            |
| ------ | --------------- | ---------------------- |
| GET    | /budgets        | Listar presupuestos    |
| POST   | /budgets        | Crear presupuesto      |
| PUT    | /budgets/:id    | Actualizar presupuesto |
| DELETE | /budgets/:id    | Eliminar presupuesto   |
| GET    | /budgets/status | Estado vs gasto real   |

### Suscripciones

| Método | Endpoint                  | Descripción          |
| ------ | ------------------------- | -------------------- |
| GET    | /subscriptions            | Listar suscripciones |
| POST   | /subscriptions            | Crear suscripción    |
| PUT    | /subscriptions/:id/toggle | Pausar/Activar       |

### Plantillas de Suscripción

| Método | Endpoint                    | Descripción              |
| ------ | --------------------------- | ------------------------ |
| GET    | /subscription-templates     | Listar plantillas        |
| GET    | /subscription-templates/:id | Obtener plantilla por ID |
| POST   | /subscription-templates     | Crear plantilla propia   |
| PATCH  | /subscription-templates/:id | Actualizar plantilla     |
| DELETE | /subscription-templates/:id | Eliminar plantilla       |

---

## Testing

```bash
# Tests unitarios
npm test

# Tests unitarios (modo watch)
npm run test:watch

# Coverage de tests
npm run test:cov

# Tests E2E
npm run test:e2e
```

---

## Scripts de Base de Datos

```bash
# Generar migración
npm run migration:create

# Ejecutar migraciones
npm run migration:up

# Revertir última migración
npm run migration:down

# Actualizar esquema (solo desarrollo)
npm run schema:update
```

---

## Licencia

MIT
