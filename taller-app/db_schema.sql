-- ==========================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS
-- Sistema de Control de Asistencia y Pagos
-- ==========================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TIPOS DE TRABAJO (Modelos, operaciones)
CREATE TABLE IF NOT EXISTS tipos_trabajo (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre VARCHAR(255) NOT NULL,
  categoria VARCHAR(100), -- 'costura', 'corte', 'manual', etc.
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tipos_trabajo ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública para autenticados" ON tipos_trabajo FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo admin gestiona tipos" ON tipos_trabajo FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol = 'admin')
);


-- 2. TARIFAS (Histórico de precios por tipo de trabajo)
CREATE TABLE IF NOT EXISTS tarifas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo_trabajo_id UUID NOT NULL REFERENCES tipos_trabajo(id),
  monto DECIMAL(10, 2) NOT NULL,
  vigente_desde TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE tarifas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lectura pública para autenticados" ON tarifas FOR SELECT TO authenticated USING (true);
CREATE POLICY "Solo admin gestiona tarifas" ON tarifas FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol = 'admin')
);


-- 3. ASISTENCIA
CREATE TABLE IF NOT EXISTS asistencia (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  fecha DATE NOT NULL,
  hora_entrada TIMESTAMP WITH TIME ZONE,
  hora_salida TIMESTAMP WITH TIME ZONE,
  turno VARCHAR(20) CHECK (turno IN ('Mañana', 'Tarde')),
  estado VARCHAR(20) DEFAULT 'PENDIENTE' CHECK (estado IN ('COMPLETO', 'INCOMPLETO', 'PENDIENTE')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE asistencia ENABLE ROW LEVEL SECURITY;

-- Empleados ven su propia asistencia, Admins/Registradores ven todas
CREATE POLICY "Ver propia asistencia y admin/registrador ven todo" ON asistencia FOR SELECT TO authenticated USING (
  empleado_id IN (SELECT id FROM empleados WHERE email = auth.email()) OR
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol IN ('admin', 'registrador'))
);

-- Registrar entrada/salida (Admin, Registrador y el propio empleado si usara scanner personal - por ahora restringido a roles altos)
CREATE POLICY "Gestionar asistencia" ON asistencia FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol IN ('admin', 'registrador'))
);


-- 4. PRODUCCIÓN
CREATE TABLE IF NOT EXISTS produccion (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  tipo_trabajo_id UUID NOT NULL REFERENCES tipos_trabajo(id),
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  cantidad INTEGER NOT NULL,
  tarifa_aplicada DECIMAL(10, 2) NOT NULL, -- Se guarda la tarifa del momento para histórico
  total DECIMAL(10, 2) GENERATED ALWAYS AS (cantidad * tarifa_aplicada) STORED,
  registrado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE produccion ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver propia produccion y admin/registrador ven todo" ON produccion FOR SELECT TO authenticated USING (
  empleado_id IN (SELECT id FROM empleados WHERE email = auth.email()) OR
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol IN ('admin', 'registrador'))
);

CREATE POLICY "Gestionar produccion" ON produccion FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol IN ('admin', 'registrador'))
);


-- 5. CICLOS (Periodos de pago)
CREATE TABLE IF NOT EXISTS ciclos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tipo VARCHAR(20) CHECK (tipo IN ('semanal', 'quincenal', 'mensual')),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  estado VARCHAR(20) DEFAULT 'ABIERTO' CHECK (estado IN ('ABIERTO', 'CERRADO')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE ciclos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver ciclos autenticados" ON ciclos FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin gestiona ciclos" ON ciclos FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol = 'admin')
);


-- 6. MOVIMIENTOS (Adelantos, Descuentos, Bonos)
CREATE TABLE IF NOT EXISTS movimientos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  tipo VARCHAR(20) CHECK (tipo IN ('adelanto', 'descuento', 'ajuste')),
  monto DECIMAL(10, 2) NOT NULL,
  signo CHAR(1) CHECK (signo IN ('+', '-')), -- '+' suma al pago, '-' resta
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  aplica_en VARCHAR(20) DEFAULT 'inmediato' CHECK (aplica_en IN ('inmediato', 'proximo_ciclo', 'manual')),
  ciclo_id UUID REFERENCES ciclos(id), -- Opcional, si se ata a un ciclo específico
  registrado_por UUID REFERENCES auth.users(id),
  nota TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver propios movimientos y admin/registrador ven todo" ON movimientos FOR SELECT TO authenticated USING (
  empleado_id IN (SELECT id FROM empleados WHERE email = auth.email()) OR
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol IN ('admin', 'registrador'))
);

CREATE POLICY "Gestionar movimientos" ON movimientos FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol IN ('admin', 'registrador'))
);


-- 7. BOLETAS (Resumen de pago generado al cerrar ciclo)
CREATE TABLE IF NOT EXISTS boletas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empleado_id UUID NOT NULL REFERENCES empleados(id),
  ciclo_id UUID NOT NULL REFERENCES ciclos(id),
  total_produccion DECIMAL(10, 2) DEFAULT 0,
  total_adelantos DECIMAL(10, 2) DEFAULT 0,
  total_descuentos DECIMAL(10, 2) DEFAULT 0,
  total_neto DECIMAL(10, 2) GENERATED ALWAYS AS (total_produccion + total_adelantos - total_descuentos) STORED, -- Asumiendo adelantos suma y descuentos resta en lógica de negocio, o ajustar signos
  generada_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(empleado_id, ciclo_id)
);

ALTER TABLE boletas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ver propias boletas y admin ven todo" ON boletas FOR SELECT TO authenticated USING (
  empleado_id IN (SELECT id FROM empleados WHERE email = auth.email()) OR
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol IN ('admin', 'registrador'))
);

CREATE POLICY "Admin gestiona boletas" ON boletas FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM empleados WHERE email = auth.email() AND rol = 'admin')
);
