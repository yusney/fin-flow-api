# Plan de Mejora de Diseño y Maquetado — fin-flow

## Problema

El maquetado actual tiene **problemas críticos** de responsive y layout. Los textos se montan, la grilla del dashboard colapsa en mobile, las tablas se salen de pantalla, y el sidebar se superpone al contenido.

### Evidencia visual actual

````carousel
![Dashboard Desktop — Sidebar se superpone al contenido, la grilla de 12 columnas no tiene breakpoints mobile, los montos del balance se cortan](/home/yusney/.gemini/antigravity/brain/a6ecce2d-8d04-4bd2-9c65-7d1a63085663/dashboard_desktop_1774729592810.png)
<!-- slide -->
![Dashboard Mobile — Las cards del bento grid se montan, textos superpuestos ("Add Transaction" encima de "$19.99"), las dos columnas Recent Transactions + Budgets se comprimen hasta ser ilegibles](/home/yusney/.gemini/antigravity/brain/a6ecce2d-8d04-4bd2-9c65-7d1a63085663/dashboard_mobile_1774729587694.png)
<!-- slide -->
![Login Desktop — Layout split panel funciona razonablemente bien, pero el formulario está desbalanceado verticalmente y los inputs carecen de padding visual](/home/yusney/.gemini/antigravity/brain/a6ecce2d-8d04-4bd2-9c65-7d1a63085663/login_desktop_1774729540174.png)
<!-- slide -->
![Register Mobile — El logo y heading se apiñan, hay poco espacio entre label y campo, sin bordes los inputs se confunden con el fondo](/home/yusney/.gemini/antigravity/brain/a6ecce2d-8d04-4bd2-9c65-7d1a63085663/register_mobile_1774729570180.png)
<!-- slide -->
![Transactions Mobile — El botón "Add Transaction" se sale de la pantalla, los filtros se aprietan, la tabla desborda horizontalmente](/home/yusney/.gemini/antigravity/brain/a6ecce2d-8d04-4bd2-9c65-7d1a63085663/budgets_mobile_view_1774729629712.png)
````

### Referencia visual objetivo

![Plantilla stitch_subscriptions — Esta es la referencia visual a seguir: layout limpio, tipografía con jerarquía clara, cards con tonal layering, sidebar con buen spacing, grilla bento bien proporcionada](/home/yusney/app/fin-flow/stitch_subscriptions/screen.png)

---

## Principios de la mejora

1. **Mobile-first** — Todo breakpoint parte de mobile y escala hacia desktop
2. **Mantener colores y tokens** — Los tokens Prism del design system (`tokens.css`) no se tocan
3. **Mantener Tailwind CSS v4** — Ya está instalado y configurado con `@theme`, no hay razón de migrar
4. **Seguir el DESIGN.md** — No-Line Rule, tonal layering, editorial spacing, tabular-nums
5. **Seguir la referencia** — El template `stitch_subscriptions` es el norte visual

> [!IMPORTANT]
> **Sobre Tailwind versión**: El proyecto ya usa **Tailwind CSS v4.2** con el plugin de Vite (`@tailwindcss/vite`). NO hay necesidad de actualizar ni cambiar la versión — v4 ya es la última estable. El `@theme` directive ya está configurado correctamente.

---

## User Review Required

> [!WARNING]
> El dashboard en desktop usa `grid-cols-12` sin breakpoints mobile, provocando que los 12 columnas se mantengan incluso en 375px de ancho. Esto causa que TODO se comprima hasta ser ilegible. La corrección propuesta es pasar a `grid-cols-1` en mobile, `grid-cols-12` en `lg:`.

> [!IMPORTANT]
> Las tablas (DataTable, TransactionTable, SubscriptionTable) en mobile actualmente desbordan. Se propone **dos estrategias** — elegí cuál preferís:
> - **Opción A**: Scroll horizontal con indicador (más rápido de implementar)
> - **Opción B**: Vista de cards en mobile que reemplaza la tabla (más trabajo pero UX superior — **recomendado**)

---

## Proposed Changes

Los cambios están organizados en 5 fases secuenciales. Cada fase es auto-contenida y testeable.

---

### Fase 1: Sistema de layout responsive

Arreglar los contenedores base — sin esto nada más funciona.

#### [MODIFY] [AppLayout.tsx](file:///home/yusney/app/fin-flow/src/shared/components/layouts/AppLayout.tsx)
- **Header**: Reducir padding top en mobile (`pt-4` → `pt-3`), asegurar que el título no choque con el botón de notificaciones usando `min-w-0 flex-1 truncate`
- **Main content**: Ajustar padding mobile `px-4 pb-24` (dejar espacio para bottom nav), desktop `lg:px-12 lg:pb-12`
- **Sidebar overlay**: Asegurar z-index correcto (`z-50` sidebar, `z-40` overlay)

#### [MODIFY] [MobileNav.tsx](file:///home/yusney/app/fin-flow/src/shared/components/organisms/MobileNav.tsx)
- Agregar `safe-area-inset-bottom` para dispositivos con notch
- Aumentar ligeramente el hit area de cada tab (de `py-2.5` a `py-3`)
- Agregar label más visible (de `text-[10px]` a `text-[11px]`)

#### [MODIFY] [Sidebar.tsx](file:///home/yusney/app/fin-flow/src/shared/components/organisms/Sidebar.tsx)
- Agregar botón de cierre visible en mobile (X en la esquina superior derecha)
- Ajustar spacing entre items de nav para que coincida con el template (de `gap-y-8` a `gap-y-6`)
- El account section en la parte inferior necesita un separador visual con tonal layering más marcado

#### [MODIFY] [PageShell.tsx](file:///home/yusney/app/fin-flow/src/shared/components/layouts/PageShell.tsx)
- Cambiar de `gap-6` a `gap-4 lg:gap-6` para mejor compactación mobile

#### [MODIFY] [AuthLayout.tsx](file:///home/yusney/app/fin-flow/src/shared/components/layouts/AuthLayout.tsx)
- Mobile: centrar logo verticalmente con más padding, mejorar espaciado entre logo y formularios
- Desktop: El panel izquierdo editorial necesita más jerarquía visual (gradient de fondo, no solo color sólido)

---

### Fase 2: Dashboard — Rediseño de grilla bento

Esta es la página con **más problemas**. El grid `grid-cols-12` sin breakpoints es el problema principal.

#### [MODIFY] [DashboardPage.tsx](file:///home/yusney/app/fin-flow/src/features/dashboard/components/DashboardPage.tsx)

Cambios en la sección "Key Metrics Bento Grid":
- **Grid**: `grid-cols-1 lg:grid-cols-12` → en mobile stack vertical, en desktop bento
- **Balance Card**: `col-span-12 lg:col-span-8` — el balance ocupa full width en mobile
  - Texto balance: `text-4xl lg:text-6xl` — escalar tipografía
  - Income/Expenses: `flex-col sm:flex-row` — stack vertical en mobile
  - Botón "Add Transaction": mover abajo en mobile, inline con métricas en desktop
- **Upcoming Subscription**: `col-span-12 lg:col-span-4` — full width en mobile debajo del balance

Cambios en la sección "Two Column Layout":
- **Grid**: `grid-cols-1 lg:grid-cols-12` 
- **Recent Transactions**: `col-span-12 lg:col-span-7`
- **Budgets**: `col-span-12 lg:col-span-5`

Cambios en el FAB:
- **Mobile**: Mover a `right-4 bottom-20` (encima de la bottom nav) y reducir tamaño a `h-14 w-14`
- **Desktop**: Mantener `right-12 bottom-12` y `h-16 w-16`

Cambios en el Footer:
- **Mobile**: Stack vertical (`flex-col items-start gap-4`), en desktop horizontal (`lg:flex-row lg:items-center lg:justify-between`)

---

### Fase 3: Tablas mobile-adaptive

#### [MODIFY] [DataTable.tsx](file:///home/yusney/app/fin-flow/src/shared/components/organisms/DataTable.tsx)
- Agregar prop `mobileCardView?: boolean` (default `true`)
- En pantallas `< lg`: renderizar como lista de cards en lugar de tabla HTML
- Cada card muestra: título (description), subtítulo (date + category), valor (amount), y acciones
- En desktop: mantener la tabla actual exacta
- Agregar `overflow-x-auto` como fallback si `mobileCardView = false`

#### [MODIFY] [TransactionTable.tsx](file:///home/yusney/app/fin-flow/src/features/transactions/components/TransactionTable.tsx)
- Pasar `mobileCardView={true}` al DataTable
- Definir cómo se renderiza cada card en mobile (icon + description + date + amount)

#### [MODIFY] [SubscriptionTable.tsx](file:///home/yusney/app/fin-flow/src/features/subscriptions/components/SubscriptionTable.tsx)
- Pasar `mobileCardView={true}` al DataTable
- Card en mobile: servicio icon + nombre + monto + toggle

#### [MODIFY] [TransactionFilters.tsx](file:///home/yusney/app/fin-flow/src/features/transactions/components/TransactionFilters.tsx)
- En mobile, colapsar filtros en un row scrollable horizontal o usar un dropdown "Filters"
- El search input debe ser full-width en mobile, no inline con los filtros

---

### Fase 4: Formularios y Auth

#### [MODIFY] [LoginForm.tsx](file:///home/yusney/app/fin-flow/src/features/auth/components/LoginForm.tsx)
- Mejorar spacing entre label y input (de `mb-2` a `mb-1.5`, reducir label size a `text-[11px]`)
- Inputs: agregar un ghost border sutil en focus state más visible
- Botón sign in: mantener gradient pero con más `py-3.5` para hit area

#### [MODIFY] [RegisterForm.tsx](file:///home/yusney/app/fin-flow/src/features/auth/components/RegisterForm.tsx)
- Mismo tratamiento que LoginForm
- En mobile, el formulario de registro es largo — agregar scroll suave y `gap-4` entre campos

#### [MODIFY] [SettingsPage.tsx](file:///home/yusney/app/fin-flow/src/features/auth/components/SettingsPage.tsx)
- Revisar que los settings cards usen responsive spacing

---

### Fase 5: Pulido visual y micro-interacciones

#### [MODIFY] [globals.css](file:///home/yusney/app/fin-flow/src/design-system/globals.css)
- Agregar clases responsive para `text-display` (`text-3xl lg:text-5xl` mapping via @apply)
- Agregar `scroll-smooth` en html
- Agregar transiciones suaves para las surfaces

#### [MODIFY] [utilities.css](file:///home/yusney/app/fin-flow/src/design-system/utilities.css)
- Agregar utility `.card-hover` con transición (scale 1.01 + ambient shadow on hover)
- Agregar utility `.mobile-card-list` para el DataTable mobile view
- Agregar `.safe-bottom` para bottom padding respetando safe area inset

#### [MODIFY] [BudgetCard.tsx](file:///home/yusney/app/fin-flow/src/features/budgets/components/BudgetCard.tsx)
- Ajustar padding responsive: `p-4 lg:p-5`
- Mejorar la jerarquía visual entre emoji, nombre y badge

#### [MODIFY] [BudgetProgressSummary.tsx](file:///home/yusney/app/fin-flow/src/features/budgets/components/BudgetProgressSummary.tsx)
- Hacer responsive el grid de summary

#### [MODIFY] [SectionCard.tsx](file:///home/yusney/app/fin-flow/src/shared/components/layouts/SectionCard.tsx)
- Padding responsive: `p-4 lg:p-8`
- Elevated variant shadow más sutil en mobile

#### [MODIFY] [Modal.tsx](file:///home/yusney/app/fin-flow/src/shared/components/organisms/Modal.tsx)
- En mobile: convertir modal en bottom sheet (full width, slide up)
- En desktop: mantener modal centrado

#### [MODIFY] [QuickAddDrawer.tsx](file:///home/yusney/app/fin-flow/src/shared/components/organisms/QuickAddDrawer.tsx)
- Asegurar que el drawer no se corte detrás del bottom nav

---

## Open Questions

> [!IMPORTANT]
> **Tablas en mobile**: ¿Preferís la **Opción A** (scroll horizontal) o la **Opción B** (card view que reemplaza la tabla en mobile)? Recomiendo B, pero A es más rápido.

> [!NOTE]
> **Modal → Bottom Sheet**: En mobile, ¿te parece bien que los modales se conviertan en bottom sheets (como las apps nativas)? Esto requiere ajustar el Sheet de Radix para que se abra desde abajo.

---

## Verification Plan

### Visual Testing
- Abrir la app en el browser con viewport 375px (iPhone SE), 390px (iPhone 14), 768px (iPad), 1440px (desktop) y verificar cada página
- Capturar snapshots antes/después de cada fase

### Automated Tests
```bash
npm run lint     # Verificar que no haya errores de ESLint
npm run build    # Verificar que compile correctamente (TypeScript strict)
```

### Manual Verification
- Navegar por todas las rutas en cada viewport
- Verificar que ningún texto se monte sobre otro
- Verificar que los formularios sean usables en mobile
- Verificar que el sidebar se abra/cierre correctamente en mobile
