-- ==========================================
-- MIGRACIÓN: Ciclos por Empleado
-- ==========================================
-- EJECUTAR EN SUPABASE SQL EDITOR
-- ==========================================

-- 1. Agregar columna empleado_id a ciclos (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ciclos' AND column_name = 'empleado_id'
    ) THEN
        ALTER TABLE ciclos ADD COLUMN empleado_id UUID REFERENCES empleados(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Agregar columna total_pagado a ciclos (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ciclos' AND column_name = 'total_pagado'
    ) THEN
        ALTER TABLE ciclos ADD COLUMN total_pagado NUMERIC(10,2) DEFAULT 0;
    END IF;
END $$;

-- 3. Crear índice para búsqueda rápida por empleado
CREATE INDEX IF NOT EXISTS idx_ciclos_empleado ON ciclos(empleado_id);

-- 4. Actualizar políticas RLS para ciclos por empleado
DROP POLICY IF EXISTS ciclos_select ON ciclos;
CREATE POLICY ciclos_select
ON ciclos
FOR SELECT
TO authenticated
USING (
    -- Empleado ve sus propios ciclos
    empleado_id IN (
        SELECT id FROM empleados WHERE auth_user_id = auth.uid()
    )
    OR
    -- Admin/Registrador ven todos
    EXISTS (
        SELECT 1 FROM empleados
        WHERE auth_user_id = auth.uid()
        AND rol IN ('admin','registrador')
    )
);

DROP POLICY IF EXISTS ciclos_admin ON ciclos;
CREATE POLICY ciclos_admin
ON ciclos
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
-- FUNCIÓN: Calcular pendiente por empleado
-- ==========================================
CREATE OR REPLACE FUNCTION get_pendiente_empleado(p_empleado_id UUID)
RETURNS TABLE (
    ultimo_pago_fecha DATE,
    ultimo_pago_monto NUMERIC,
    total_produccion NUMERIC,
    total_adelantos NUMERIC,
    total_descuentos NUMERIC,
    neto_pendiente NUMERIC
) AS $$
DECLARE
    v_fecha_desde DATE;
    v_ultimo_monto NUMERIC;
BEGIN
    -- Obtener fecha del último pago (ciclo cerrado más reciente)
    SELECT fecha_fin, total_pagado
    INTO v_fecha_desde, v_ultimo_monto
    FROM ciclos
    WHERE empleado_id = p_empleado_id
      AND estado = 'CERRADO'
    ORDER BY fecha_fin DESC
    LIMIT 1;

    -- Si no hay pagos previos, usar fecha muy antigua
    IF v_fecha_desde IS NULL THEN
        v_fecha_desde := '1900-01-01'::DATE;
        v_ultimo_monto := 0;
    END IF;

    RETURN QUERY
    SELECT
        CASE WHEN v_fecha_desde = '1900-01-01'::DATE THEN NULL ELSE v_fecha_desde END,
        v_ultimo_monto,
        COALESCE((
            SELECT SUM(subtotal)
            FROM produccion
            WHERE empleado_id = p_empleado_id
              AND fecha >= v_fecha_desde
        ), 0)::NUMERIC AS total_produccion,
        COALESCE((
            SELECT SUM(monto)
            FROM movimientos
            WHERE empleado_id = p_empleado_id
              AND fecha >= v_fecha_desde
              AND signo = '+'
        ), 0)::NUMERIC AS total_adelantos,
        COALESCE((
            SELECT SUM(monto)
            FROM movimientos
            WHERE empleado_id = p_empleado_id
              AND fecha >= v_fecha_desde
              AND signo = '-'
        ), 0)::NUMERIC AS total_descuentos,
        (
            COALESCE((
                SELECT SUM(subtotal)
                FROM produccion
                WHERE empleado_id = p_empleado_id
                  AND fecha >= v_fecha_desde
            ), 0)
            +
            COALESCE((
                SELECT SUM(monto)
                FROM movimientos
                WHERE empleado_id = p_empleado_id
                  AND fecha >= v_fecha_desde
                  AND signo = '+'
            ), 0)
            -
            COALESCE((
                SELECT SUM(monto)
                FROM movimientos
                WHERE empleado_id = p_empleado_id
                  AND fecha >= v_fecha_desde
                  AND signo = '-'
            ), 0)
        )::NUMERIC AS neto_pendiente;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Permisos para la función
GRANT EXECUTE ON FUNCTION get_pendiente_empleado(UUID) TO authenticated;
