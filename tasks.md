# Tasks - Sistema de Control de Asistencia

## Fase 1: Setup Inicial y Layout Base
- [x] Crear proyecto Next.js con App Router
- [x] Configurar Tailwind CSS con tema dark/glassmorphism
- [x] Crear estructura de carpetas (/app, /components, /lib, /hooks, /types)
- [x] Crear componentes UI base (Card, Button, Input, Badge, etc.)
- [x] Crear layout con sidebar colapsable (desktop) y navegación móvil
- [x] Implementar responsive design
- [ ] Configurar PWA (manifest, service worker)

## Fase 2: Autenticación y Roles
- [x] Configurar Supabase Client
- [x] Implementar Auth con Supabase (login, logout)
- [x] Crear middleware de protección de rutas
- [x] Implementar sistema de roles (admin, registrador, trabajador)
- [x] Crear navegación condicional por rol

## Fase 3: Modelos de Datos Supabase
- [x] Crear tabla `empleados`
- [x] Crear tabla `asistencia`
- [ ] Crear tabla `tipos_trabajo`
- [ ] Crear tabla `produccion`
- [ ] Crear tabla `tarifas`
- [ ] Crear tabla `movimientos` (adelantos, descuentos)
- [ ] Crear tabla `ciclos`
- [ ] Crear tabla `boletas`
- [ ] Configurar Row Level Security (RLS)

## Fase 4: Dashboard Admin
- [x] Cards de KPIs (Total a pagar, empleados activos, horas del ciclo)
- [ ] Gráfico de producción
- [x] Lista de empleados con estados
- [x] Registros del día

## Fase 5: Gestión de Asistencia
- [ ] Generador de QR por trabajador
- [ ] Scanner de QR para registro
- [ ] Registro de entrada/salida
- [x] Vista de asistencia por día/turno
- [ ] Cálculo de horas trabajadas

## Fase 6: Gestión de Producción
- [ ] CRUD tipos de trabajo
- [ ] CRUD tarifas
- [ ] Registro de producción diaria
- [ ] Vista de producción por empleado

## Fase 7: Pagos y Boletas
- [ ] CRUD movimientos financieros
- [ ] Gestión de ciclos
- [ ] Generación de boletas PDF
- [ ] Vista de boletas por empleado
