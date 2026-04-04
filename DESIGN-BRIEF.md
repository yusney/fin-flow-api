# Design Brief: fin-flow-api

## Documento para Diseño Frontend

---

## 1. Producto: ¿Qué estamos construyendo?

**fin-flow** es una aplicación de finanzas personales que permite a los usuarios:

- 📝 **Registrar gastos e ingresos** (transacciones)
- 🏷️ **Categorizar** cada movimiento (comida, transporte, salary, etc.)
- 📊 **Definir presupuestos mensuales** por categoría
- 🔔 **Gestionar suscripciones** recurrentes (Netflix, Spotify, gimnasio)
- 🎯 **Visualizar su salud financiera** con resúmenes y gráficos

**Meta del usuario**: Mantener control sobre sus finanzas personales, saber cuánto gasta en cada área y evitar sorpresas.

---

## 2. Usuario Tipo

| Aspecto          | Descripción                                                           |
| ---------------- | --------------------------------------------------------------------- |
| **Edad**         | 25-45 años                                                            |
| **Perfil**       | Profesional trabajando, quiere organize sus finanzas                  |
| **Tech skills**  | Medio-alto, usa apps bancarias                                        |
| **Dolor actual** | No sabe en qué gasta su dinero, se le escapan suscripciones olvidadas |
| **Goal**         | Ver dashboard y entender "a dónde fue mi plata"                       |

---

## 3. Funcionalidades Principales

### 3.1 Autenticación

- **Registro**: Email + contraseña
- **Login**: Email + contraseña → JWT token
- **Logout**: Cerrar sesión (limpiar token)

### 3.2 Dashboard (Home)

- **Saldo total**: Ingresos - Gastos del mes
- **Resumen rápido**: Gastos por categoría del mes actual
- **Suscripciones activas**: Cuántas y cuánto suman al mes
- **Alertas**: Si excediste algún presupuesto
- **Acciones rápidas**: Botones para agregar transacción, ver más

### 3.3 Transacciones

- **Listado**: Historial de movimientos (más recientes primero)
- **Filtros**: Por fecha, por categoría, por tipo (ingreso/gasto)
- **Crear**: Formulario rápido (monto, descripción, fecha, categoría)
- **Editar/Eliminar**: Modificar o borrar transacciones
- **Resumen**: Gráfico de torta o barras de gastos por categoría

### 3.4 Categorías

- **Listado**: Todas las categorías del usuario
- **Crear**: Nombre + tipo (ingreso/gasto)
- **Icono/color**: Para identificar visualmente cada categoría
- **Predeterminadas**: El sistema sugiere categorías comunes al registarse

### 3.5 Presupuestos

- **Listado**: Budgets del mes actual
- **Crear**: Seleccionar categoría + límite + mes/año
- **Visualización**: Barra de progreso (gastado vs límite)
- **Estado**: Verde (OK), Amarillo (80%+), Rojo (excedido)

### 3.6 Suscripciones

- **Listado**: Todas las suscripciones activas
- **Crear manual**: Nombre, monto, día de cobro, categoría
- **Crear desde catálogo**: Elegir de la lista de servicios populares
- **Toggle**: Pausar/activar sin borrar
- **Próximos cobros**: Ver cuáles se cobran pronto

### 3.7 Catálogo de Suscripciones (Templates)

- **Explorar**: Ver servicios populares (Netflix, Spotify, etc.)
- **Filtrar**: Por categoría (Streaming, Música, Cloud, Productividad)
- **Detalles**: Ver precio default, URL del servicio, ícono
- **Usar**: "Crear suscripción" → pre-llena el formulario

---

## 4. Flujos de Usuario

### Flujo 1: Nuevo usuario

```
Registro → Login → (Sin categorías) → Crear categorías iniciales →
Agregar primera transacción → Ver dashboard
```

### Flujo 2: Agregar gasto rápido

```
Dashboard → Botón "+" → Ingresar monto → Seleccionar categoría →
Descripción (opcional) → Guardar → Volver a Dashboard actualizado
```

### Flujo 3: Crear suscripción desde catálogo

```
Suscripciones → "Explorar plantillas" → Filtrar por "Música" →
Seleccionar Spotify → Ver detalles → "Crear suscripción" →
Elegir categoría personal → Confirmar monto/día → Guardar
```

### Flujo 4: Revisar presupuestos

```
Presupuestos → Ver lista del mes → Barras de progreso →
Categoría en rojo (excedido) → Click → Ver transacciones de esa categoría
```

---

## 5. Pantallas Requeridas

| Pantalla              | Descripción                | Acciones principales                  |
| --------------------- | -------------------------- | ------------------------------------- |
| **Login**             | Email + password           | Registrarse, Login                    |
| **Register**          | Nombre + email + password  | Crear cuenta                          |
| **Dashboard**         | Resumen financiero del mes | Ver overview, accesos rápidos         |
| **Transacciones**     | Historial filtrable        | Agregar, filtrar, editar, eliminar    |
| **Nueva Transacción** | Formulario rápido          | Guardar transacción                   |
| **Categorías**        | Listado de categorías      | Crear, editar, eliminar               |
| **Presupuestos**      | Lista de budgets           | Crear, editar, eliminar, ver progreso |
| **Suscripciones**     | Lista de suscripciones     | Crear, pausar, eliminar               |
| **Catálogo**          | Explorador de plantillas   | Explorar, filtrar, usar plantilla     |
| **Perfil/Settings**   | Configuración de cuenta    | Cerrar sesión, cambiar password       |

---

## 6. Componentes UI Necesarios

### Navigation

- **Sidebar** o **Bottom nav**: Navegación entre secciones
- **Header**: Título de pantalla + acciones contextuales

### Forms

- **Input fields**: Monto, descripción, fecha, fecha de nacimiento
- **Select/Dropdown**: Categorías, meses, años
- **Toggle**: Activar/pausar suscripciones
- **Date picker**: Selección de fecha
- **Search**: Buscar transacciones, categorías, plantillas

### Visualización de Datos

- **Cards**: Resumen de saldo, presupuesto, suscripción
- **Progress bars**: Gastado vs límite de presupuesto
- **Pie chart**: Distribución de gastos por categoría
- **List items**: Transacciones, categorías, presupuestos
- **Badges**: Estado (OK/Warning/Danger), tipo (ingreso/gasto)
- **Icons**: Categorías, servicios, acciones

### Estados

- **Empty states**: "No hay transacciones aún", "Crea tu primera categoría"
- **Loading states**: Skeleton loaders mientras cargan datos
- **Error states**: Mensajes claros cuando falla algo
- **Success**: Feedback al guardar/eliminar (toast/snackbar)

---

## 7. Consideraciones de UX

### Principios

1. **Simplicidad**: El usuario quiere registrar algo en < 10 segundos
2. **Feedback inmediato**: Al guardar, ver el cambio instantáneamente
3. **Visualización clara**: Gráficos y colores que hablen por sí solos
4. **Acceso rápido**: "Agregar transacción" siempre visible (FAB o botón principal)
5. **Mobile-first**: La mayoría de usuarios lo usarán desde el celular

### Jerarquía Visual

- **Primario**: Monto, saldo total, estado de budget
- **Secundario**: Descripciones, fechas
- **Terciario**: Metadata, timestamps

### Colores Sugeridos

| Propósito | Color            | Uso                |
| --------- | ---------------- | ------------------ |
| Ingreso   | Verde            | Money coming in    |
| Gasto     | Rojo/Rojo oscuro | Money going out    |
| Warning   | Amarillo/Naranja | Cerca del límite   |
| Danger    | Rojo brillante   | Excedido           |
| Neutral   | Gris             | Textos secundarios |
| Primary   | Azul/Violeta     | Buttons, acentos   |

### Tipografía

- **Números**: Monospace o tabular para que alineen bien (ej: $1,234.56)
- **Títulos**: Sans-serif bold
- **Body**: Sans-serif regular, legible

---

## 8. Datos y Estructura (API Reference)

### Autenticación

```
POST /api/auth/register
POST /api/auth/login
```

### Transacciones

```
GET    /api/transactions?from=2026-01-01&to=2026-03-31&categoryId=xxx
POST   /api/transactions
PUT    /api/transactions/:id
DELETE /api/transactions/:id
GET    /api/transactions/summary?month=3&year=2026
```

### Categorías

```
GET    /api/categories
POST   /api/categories
PUT    /api/categories/:id
DELETE /api/categories/:id
```

### Presupuestos

```
GET    /api/budgets?month=3&year=2026
POST   /api/budgets
PUT    /api/budgets/:id
DELETE /api/budgets/:id
GET    /api/budgets/status?month=3&year=2026
```

### Suscripciones

```
GET    /api/subscriptions
POST   /api/subscriptions
PUT    /api/subscriptions/:id/toggle
DELETE /api/subscriptions/:id
```

### Catálogo de Plantillas

```
GET    /api/subscription-templates?category=STREAMING
GET    /api/subscription-templates/:id
POST   /api/subscription-templates  (crear plantilla propia)
PATCH  /api/subscription-templates/:id
DELETE /api/subscription-templates/:id
```

---

## 9. Ejemplo de Response (Dashboard)

```json
{
  "summary": {
    "totalIncome": 5000.0,
    "totalExpense": 2340.5,
    "balance": 2659.5,
    "month": 3,
    "year": 2026
  },
  "byCategory": [
    {
      "categoryId": "uuid-1",
      "categoryName": "Comida",
      "spent": 450.0,
      "limit": 500.0
    },
    {
      "categoryId": "uuid-2",
      "categoryName": "Transporte",
      "spent": 150.0,
      "limit": 200.0
    },
    {
      "categoryId": "uuid-3",
      "categoryName": "Entretenimiento",
      "spent": 220.0,
      "limit": 150.0
    }
  ],
  "subscriptions": {
    "active": 5,
    "totalMonthly": 89.97,
    "dueSoon": [{ "name": "Netflix", "amount": 15.49, "dueDate": "2026-03-28" }]
  },
  "budgetAlerts": [
    {
      "category": "Entretenimiento",
      "status": "exceeded",
      "spent": 220,
      "limit": 150
    }
  ]
}
```

---

## 10. Referencia Visual / Inspiración

Apps similares para inspiration:

- **Money Manager** — UI clásica de finanzas
- **YNAB** — Enfoque en presupuesto
- **Monzo/Starling** — Banking apps modernos
- **Spendometer** — Simple y visual

### Elementos a evitar

- ❌ Formularios largos y complejos
- ❌ Jerga financiera técnica
- ❌ Colores confusos (rojo para ingreso)
- ❌ Pantallas sobrecargadas de información

---

## 11. Próximos Pasos

1. **Wireframes** de cada pantalla
2. **Diseño visual** (colores, tipografía, componentes)
3. **Prototipo interactivo**
4. **Validación** con usuarios

---

## Contacto Técnico

Para dudas sobre la API o estructura de datos:

- Revisar `ARCHITECTURE.md` para detalles técnicos
- Revisar `src/modules/*/presentation/` para endpoints exactos
- La API usa JWT para autenticación en todos los endpoints excepto auth

---

**Documento creado para equipo de diseño — FinFlow 2026**
