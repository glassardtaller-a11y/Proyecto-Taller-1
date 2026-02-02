-- ==========================================
-- SCRIPT CORREGIDO PRODUCCIÓN Y PAGOS
-- Compatible con empleados.auth_user_id
-- ==========================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. PRODUCCIÓN
-- ==========================================
CREATE TABLE IF NOT EXISTS produccion (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    tipo_trabajo_id UUID NOT NULL REFERENCES tipos_trabajo(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    cantidad NUMERIC(10,2) NOT NULL,
    tarifa_aplicada NUMERIC(10,2) NOT NULL,
    subtotal NUMERIC(10,2) GENERATED ALWAYS AS (cantidad * tarifa_aplicada) STORED,
    nota TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_produccion_empleado ON produccion(empleado_id);
CREATE INDEX IF NOT EXISTS idx_produccion_fecha ON produccion(fecha);

ALTER TABLE produccion ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS produccion_select ON produccion;
CREATE POLICY produccion_select
ON produccion
FOR SELECT
TO authenticated
USING (
    empleado_id IN (
        SELECT id FROM empleados WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
);

DROP POLICY IF EXISTS produccion_write ON produccion;
CREATE POLICY produccion_write
ON produccion
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
);

-- ==========================================
-- 2. CICLOS
-- ==========================================
CREATE TABLE IF NOT EXISTS ciclos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre TEXT,
    tipo TEXT CHECK (tipo IN ('semanal','quincenal','mensual')),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    estado TEXT DEFAULT 'ABIERTO',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE ciclos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS ciclos_select ON ciclos;
CREATE POLICY ciclos_select
ON ciclos
FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS ciclos_admin ON ciclos;
CREATE POLICY ciclos_admin
ON ciclos
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol = 'admin'
    )
);

-- ==========================================
-- 3. MOVIMIENTOS
-- ==========================================
CREATE TABLE IF NOT EXISTS movimientos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id) ON DELETE CASCADE,
    tipo TEXT CHECK (tipo IN ('adelanto','descuento','ajuste','bono')),
    monto NUMERIC(10,2) NOT NULL,
    signo CHAR(1) CHECK (signo IN ('+','-')),
    fecha DATE DEFAULT CURRENT_DATE,
    ciclo_id UUID REFERENCES ciclos(id),
    nota TEXT,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE movimientos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS movimientos_select ON movimientos;
CREATE POLICY movimientos_select
ON movimientos
FOR SELECT
TO authenticated
USING (
    empleado_id IN (
        SELECT id FROM empleados WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
);

DROP POLICY IF EXISTS movimientos_write ON movimientos;
CREATE POLICY movimientos_write
ON movimientos
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
);

-- ==========================================
-- 4. BOLETAS
-- ==========================================
CREATE TABLE IF NOT EXISTS boletas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empleado_id UUID NOT NULL REFERENCES empleados(id),
    ciclo_id UUID NOT NULL REFERENCES ciclos(id),
    total_produccion NUMERIC(10,2) DEFAULT 0,
    total_adelantos NUMERIC(10,2) DEFAULT 0,
    total_descuentos NUMERIC(10,2) DEFAULT 0,
    total_neto NUMERIC(10,2)
        GENERATED ALWAYS AS (total_produccion + total_adelantos - total_descuentos) STORED,
    pagado BOOLEAN DEFAULT false,
    pagado_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    UNIQUE (empleado_id, ciclo_id)
);

ALTER TABLE boletas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS boletas_select ON boletas;
CREATE POLICY boletas_select
ON boletas
FOR SELECT
TO authenticated
USING (
    empleado_id IN (
        SELECT id FROM empleados WHERE auth_user_id = auth.uid()
    )
    OR EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
);

DROP POLICY IF EXISTS boletas_admin ON boletas;
CREATE POLICY boletas_admin
ON boletas
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol = 'admin'
    )
);
