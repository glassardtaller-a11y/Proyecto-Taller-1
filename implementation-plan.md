# Sistema de Control de Asistencia, Producción y Pagos

Sistema SaaS moderno para gestionar trabajadores, asistencia mediante QR, producción diaria y pagos con boletas.

## Stack Tecnológico

| Tecnología | Propósito |
|------------|-----------|
| Next.js 14 (App Router) | Frontend + API Routes |
| Tailwind CSS | Estilos + Dark mode + Glassmorphism |
| Supabase | PostgreSQL + Auth + RLS |
| PWA | Instalable en móvil |

## Roles del Sistema

| Rol | Permisos |
|-----|----------|
| **Trabajador** | Ver mis horas, producción, pagos y boletas |
| **Registrador** | Registrar producción, adelantos y descuentos |
| **Admin** | Acceso total al sistema |

---

## Estructura del Proyecto

```
Proyecto Taller/
├── app/
│   ├── (auth)/
│   │   └── login/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (Dashboard)
│   │   ├── asistencia/
│   │   ├── produccion/
│   │   ├── empleados/
│   │   ├── pagos/
│   │   └── configuracion/
│   ├── api/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx
│   │   ├── MobileNav.tsx
│   │   └── Header.tsx
│   └── ui/
│       ├── Card.tsx
│       ├── Button.tsx
│       ├── Input.tsx
│       └── Badge.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   └── server.ts
│   └── utils.ts
├── hooks/
│   ├── useAuth.ts
│   └── useRole.ts
├── types/
│   └── index.ts
├── tailwind.config.ts
└── next.config.js
```

---

## Componentes UI con Glassmorphism

### Card.tsx
Componente base para cards con efecto glassmorphism:
- Background con transparencia (`bg-white/5`)
- Backdrop blur (`backdrop-blur-xl`)
- Border sutil (`border-white/10`)
- Gradient overlays opcionales

### Sidebar.tsx
Sidebar colapsable con:
- Logo en la parte superior
- Iconos de navegación
- Estado activo con indicador visual
- Colapso a solo iconos en mobile

---

## Esquema de Base de Datos (Supabase)

### Tablas Principales

#### `empleados`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| nombre | string | Nombre completo |
| codigo | string | Código único (ej: GLA002) |
| email | string | Email para login |
| rol | string | admin, registrador, trabajador |
| qr_token | string | Token único para QR |
| activo | boolean | Estado del empleado |

#### `asistencia`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| empleado_id | uuid | FK a empleados |
| fecha | date | Fecha del registro |
| hora_entrada | time | Hora de entrada |
| hora_salida | time | Hora de salida |
| turno | string | Mañana / Tarde |
| estado | string | COMPLETO / INCOMPLETO |

#### `tipos_trabajo`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| nombre | string | Nombre del tipo |
| categoria | string | Categoría del proceso |
| activo | boolean | Estado |

#### `tarifas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| tipo_trabajo_id | uuid | FK a tipos_trabajo |
| monto | decimal | Monto por unidad |
| vigente_desde | date | Fecha de vigencia |

#### `produccion`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| empleado_id | uuid | FK a empleados |
| tipo_trabajo_id | uuid | FK a tipos_trabajo |
| fecha | date | Fecha del registro |
| cantidad | decimal | Cantidad producida |
| tarifa_aplicada | decimal | Tarifa al momento |
| total | decimal | cantidad × tarifa |

#### `movimientos`
| Campo           | Tipo     | Descripción |
|-----------------|----------|-------------|
| id              | uuid     | PK |
| empleado_id     | uuid     | FK a empleados |
| tipo            | string   | adelanto, descuento, ajuste |
| monto           | decimal  | Monto (positivo siempre) |
| signo           | string   | + o - (define si suma o resta) |
| fecha           | date     | Fecha en que se registra |
| aplica_en       | string   | inmediato, proximo_ciclo, manual |
| ciclo_id        | uuid     | FK a ciclos (nullable) |
| registrado_por  | uuid     | FK a usuarios |
| nota            | string   | Observación / motivo |
| created_at      | timestamp| Auditoría |

#### `ciclos`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| tipo | string | semanal, quincenal, mensual |
| fecha_inicio | date | Inicio del ciclo |
| fecha_fin | date | Fin del ciclo |
| estado | string | abierto, cerrado |

#### `boletas`
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | uuid | PK |
| empleado_id | uuid | FK a empleados |
| ciclo_id | uuid | FK a ciclos |
| total_produccion | decimal | Suma de producción |
| total_adelantos | decimal | Suma de adelantos |
| total_descuentos | decimal | Suma de descuentos |
| total_neto | decimal | Monto final a pagar |
| generada_at | timestamp | Fecha de generación |

---

## Tema y Estilos (tailwind.config.ts)

```typescript
theme: {
  extend: {
    colors: {
      background: '#0a0a0f',
      card: {
        DEFAULT: 'rgba(255, 255, 255, 0.05)',
        hover: 'rgba(255, 255, 255, 0.08)',
      },
      accent: {
        orange: '#f97316',
        amber: '#fbbf24',
      }
    },
    backdropBlur: {
      glass: '20px',
    }
  }
}
```

---

## Orden de Implementación

1. **Setup inicial** - Crear proyecto, instalar dependencias, estructura de carpetas
2. **Sistema de diseño** - Componentes UI base con glassmorphism
3. **Layout** - Sidebar + Header + Mobile nav
4. **Páginas placeholder** - Dashboard, Asistencia, Producción, Pagos
5. **Supabase** - Configurar cliente y tablas
6. **Auth** - Login, middleware, roles
7. **Features** - Dashboard funcional, luego resto de módulos

---

## Verificación

### Verificación Visual en Browser
1. Ejecutar `npm run dev`
2. Abrir `http://localhost:3000`
3. Verificar tema dark con glassmorphism
4. Probar sidebar colapsable
5. Verificar responsive en móvil (width < 768px)

### Testing por Fase
| Fase | Acción | Resultado esperado |
|------|--------|-------------------|
| Layout | Resize < 768px | Sidebar oculto, nav móvil visible |
| Auth | Acceder sin login | Redirect a /login |
| Dashboard | Login admin | Ver todos los KPIs |
| Dashboard | Login trabajador | Solo ver mis datos |
