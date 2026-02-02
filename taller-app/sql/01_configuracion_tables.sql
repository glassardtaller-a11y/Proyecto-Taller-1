-- ==========================================
-- SCRIPT DE CONFIGURACIÓN - TABLAS ADICIONALES
-- Sistema de Control de Asistencia y Pagos
-- ==========================================
-- EJECUTAR MANUALMENTE EN SUPABASE SQL EDITOR
-- ==========================================

-- Habilitar extensión UUID si no existe
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. TURNOS (Horarios de trabajo)
-- ==========================================
CREATE TABLE IF NOT EXISTS turnos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    tolerancia_minutos INTEGER DEFAULT 15,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentario: RLS se configurará después
-- ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;

-- Datos iniciales para turnos
INSERT INTO turnos (nombre, hora_inicio, hora_fin, tolerancia_minutos) VALUES
    ('Mañana', '08:00:00', '13:00:00', 15),
    ('Tarde', '14:00:00', '18:00:00', 10)
ON CONFLICT DO NOTHING;


-- ==========================================
-- 2. CICLOS_CONFIG (Configuración de ciclos de pago)
-- ==========================================
CREATE TABLE IF NOT EXISTS ciclos_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('semanal', 'quincenal', 'mensual')),
    dia_inicio INTEGER DEFAULT 1, -- 1=Lunes, 7=Domingo
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentario: RLS se configurará después
-- ALTER TABLE ciclos_config ENABLE ROW LEVEL SECURITY;

-- Configuración inicial
INSERT INTO ciclos_config (tipo, dia_inicio, activo) VALUES
    ('semanal', 1, true)
ON CONFLICT DO NOTHING;


-- ==========================================
-- 3. SETTINGS (Configuración general del sistema)
-- ==========================================
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clave VARCHAR(100) UNIQUE NOT NULL,
    valor TEXT NOT NULL,
    tipo VARCHAR(20) DEFAULT 'string' CHECK (tipo IN ('string', 'boolean', 'number', 'json')),
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Comentario: RLS se configurará después
-- ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Configuraciones iniciales
INSERT INTO settings (clave, valor, tipo, descripcion) VALUES
    ('notificaciones_activas', 'true', 'boolean', 'Recibir alertas de asistencia'),
    ('auto_cierre_ciclo', 'false', 'boolean', 'Cerrar ciclo automáticamente al finalizar'),
    ('modo_oscuro', 'true', 'boolean', 'Tema oscuro de la aplicación'),
    ('nombre_empresa', 'Mi Taller', 'string', 'Nombre de la empresa'),
    ('moneda', 'PEN', 'string', 'Moneda para los montos (ISO 4217)')
ON CONFLICT (clave) DO NOTHING;


-- ==========================================
-- 4. VERIFICAR/ACTUALIZAR tipos_trabajo
-- (Ya existe, solo agregar columna tarifa_actual si no existe)
-- ==========================================
-- La tabla tipos_trabajo ya existe según db_schema.sql
-- Si necesitas agregar tarifa directa en lugar de usar tabla tarifas:
-- ALTER TABLE tipos_trabajo ADD COLUMN IF NOT EXISTS tarifa_actual DECIMAL(10,2) DEFAULT 0;

-- Opcional: Agregar updated_at si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tipos_trabajo' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE tipos_trabajo 
        ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL;
    END IF;
END $$;

-- Agregar tarifa_actual si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tipos_trabajo' AND column_name = 'tarifa_actual'
    ) THEN
        ALTER TABLE tipos_trabajo 
        ADD COLUMN tarifa_actual DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;


-- ==========================================
-- 5. FUNCIÓN PARA ACTUALIZAR updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
DROP TRIGGER IF EXISTS update_turnos_updated_at ON turnos;
CREATE TRIGGER update_turnos_updated_at
    BEFORE UPDATE ON turnos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_ciclos_config_updated_at ON ciclos_config;
CREATE TRIGGER update_ciclos_config_updated_at
    BEFORE UPDATE ON ciclos_config
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
    BEFORE UPDATE ON settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tipos_trabajo_updated_at ON tipos_trabajo;
CREATE TRIGGER update_tipos_trabajo_updated_at
    BEFORE UPDATE ON tipos_trabajo
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ==========================================
-- VERIFICACIÓN
-- ==========================================
-- Ejecutar después para verificar que todo se creó correctamente:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
