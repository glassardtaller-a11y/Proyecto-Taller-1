// Tipos de datos del sistema

// ==========================================
// ROLES Y AUTH
// ==========================================

export type UserRole = 'admin' | 'registrador' | 'trabajador';

export interface User {
    id: string;
    nombre: string;
    codigo: string;
    email: string;
    rol: UserRole;
    qr_token: string;
    activo: boolean;
    created_at: string;
}

// ==========================================
// EMPLEADOS
// ==========================================

export interface Empleado {
    id: string;
    codigo: string;
    username: string;
    nombre: string;
    rol: string;
    activo: boolean;
    created_at: string;
}


// ==========================================
// ASISTENCIA
// ==========================================

export type TurnoType = 'Mañana' | 'Tarde';
export type AsistenciaStatus = 'COMPLETO' | 'INCOMPLETO' | 'PENDIENTE';

export interface Asistencia {
    id: string;
    empleado_id: string;
    fecha: string;
    hora_entrada: string | null;
    hora_salida: string | null;
    turno: TurnoType;
    estado: AsistenciaStatus;
    created_at: string;
}

export interface AsistenciaConEmpleado extends Asistencia {
    empleado: Empleado;
}

// ==========================================
// TIPOS DE TRABAJO Y TARIFAS
// ==========================================

export interface TipoTrabajo {
    id: string;
    nombre: string;
    categoria: string;
    activo: boolean;
    created_at: string;
}

export interface Tarifa {
    id: string;
    tipo_trabajo_id: string;
    monto: number;
    vigente_desde: string;
    created_at: string;
}

export interface TipoTrabajoConTarifa extends TipoTrabajo {
    tarifa_actual: number;
}

// ==========================================
// PRODUCCIÓN
// ==========================================

export interface Produccion {
    id: string;
    empleado_id: string;
    tipo_trabajo_id: string;
    fecha: string;
    cantidad: number;
    tarifa_aplicada: number;
    total: number;
    registrado_por: string;
    created_at: string;
}

export interface ProduccionConDetalles extends Produccion {
    empleado: Empleado;
    tipo_trabajo: TipoTrabajo;
}

// ==========================================
// MOVIMIENTOS (ADELANTOS, DESCUENTOS)
// ==========================================

export type MovimientoTipo = 'adelanto' | 'descuento' | 'ajuste';
export type MovimientoSigno = '+' | '-';
export type MovimientoAplicaEn = 'inmediato' | 'proximo_ciclo' | 'manual';

export interface Movimiento {
    id: string;
    empleado_id: string;
    tipo: MovimientoTipo;
    monto: number;
    signo: MovimientoSigno;
    fecha: string;
    aplica_en: MovimientoAplicaEn;
    ciclo_id: string | null;
    registrado_por: string;
    nota: string | null;
    created_at: string;
}

export interface MovimientoConEmpleado extends Movimiento {
    empleado: Empleado;
}

// ==========================================
// CICLOS
// ==========================================

export type CicloTipo = 'semanal' | 'quincenal' | 'mensual';
export type CicloEstado = 'ABIERTO' | 'CERRADO';

export interface Ciclo {
    id: string;
    tipo: CicloTipo;
    fecha_inicio: string;
    fecha_fin: string;
    estado: CicloEstado;
    created_at: string;
}

// ==========================================
// BOLETAS
// ==========================================

export interface Boleta {
    id: string;
    empleado_id: string;
    ciclo_id: string;
    total_produccion: number;
    total_adelantos: number;
    total_descuentos: number;
    total_neto: number;
    generada_at: string;
    created_at: string;
}

export interface BoletaConDetalles extends Boleta {
    empleado: Empleado;
    ciclo: Ciclo;
    producciones: Produccion[];
    movimientos: Movimiento[];
}

// ==========================================
// COMPONENTES UI
// ==========================================

export type AccentColor = 'orange' | 'emerald' | 'violet' | 'sky' | 'rose' | 'amber';

export interface StatCardData {
    title: string;
    value: string | number;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    accentColor: AccentColor;
    icon?: React.ReactNode;
}

// ==========================================
// API RESPONSES
// ==========================================

export interface ApiResponse<T> {
    data: T | null;
    error: string | null;
    success: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
