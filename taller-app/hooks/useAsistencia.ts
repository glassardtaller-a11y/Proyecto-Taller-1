'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { AsistenciaStatus } from '@/types';

/* =======================
   TIPOS
======================= */

interface Empleado {
    id: string;
    nombre: string;
    codigo: string;
    rol: string;
    activo: boolean;
}

interface AsistenciaConEmpleado {
    id: string;
    fecha: string;
    codigo: string;
    turno: string;
    estado: AsistenciaStatus;
    hora_entrada: string | null;
    hora_salida: string | null;
    horas_decimal: number | null;
    created_at: string;
    empleado: Empleado | null;
}

interface AsistenciaStats {
    presentes: number;
    ausentes: number;
    tardanzas: number;
    sinSalida: number;
    totalEmpleados: number;
}

interface UseAsistenciaReturn {
    asistencias: AsistenciaConEmpleado[];
    loading: boolean;
    error: string | null;
    stats: AsistenciaStats;
    refetch: () => Promise<void>;
}

/* =======================
   HOOK
======================= */

export function useAsistencia(
    fecha?: string,
    limit?: number
): UseAsistenciaReturn {
    const supabase = createClient();

    const [asistencias, setAsistencias] = useState<AsistenciaConEmpleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [stats, setStats] = useState<AsistenciaStats>({
        presentes: 0,
        ausentes: 0,
        tardanzas: 0,
        sinSalida: 0,
        totalEmpleados: 0,
    });

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const fechaFiltro =
                fecha ?? new Date().toISOString().split('T')[0];

            // 1️⃣ Asistencias
            let asistQuery = supabase
                .from('asistencia')
                .select(`
                    id,
                    fecha,
                    codigo,
                    turno,
                    estado,
                    hora_entrada,
                    hora_salida,
                    horas_decimal,
                    created_at
                    `)
                .eq('fecha', fechaFiltro)
                .order('hora_entrada', { ascending: true });

            if (limit) asistQuery = asistQuery.limit(limit);

            const { data: asistData, error: asistError } = await asistQuery;
            if (asistError) throw asistError;

            // 2️⃣ Empleados
            const { data: empData, error: empError } = await supabase
                .from('empleados')
                .select('*')
                .eq('activo', true);

            if (empError) throw empError;

            // 3️⃣ Mapa por codigo
            const empleadosMap = new Map(
                (empData ?? []).map(e => [e.codigo, e])
            );

            // 4️⃣ Merge
            const registros: AsistenciaConEmpleado[] = (asistData ?? []).map(a => ({
                id: a.id,
                fecha: a.fecha,
                codigo: a.codigo,
                turno: a.turno,
                estado: a.estado,
                hora_entrada: a.hora_entrada,
                hora_salida: a.hora_salida,
                horas_decimal: a.horas_decimal,
                created_at: a.created_at,
                empleado: empleadosMap.get(a.codigo) ?? null,
            }));

            setAsistencias(registros);

            // 5️⃣ Stats
            const presentes = registros.filter(r => r.hora_entrada).length;
            const sinSalida = registros.filter(
                r => r.hora_entrada && !r.hora_salida
            ).length;

            const tardanzas = registros.filter(r => {
                if (!r.hora_entrada) return false;
                const d = new Date(`1970-01-01T${r.hora_entrada}`);
                return d.getHours() > 8 || (d.getHours() === 8 && d.getMinutes() > 30);
            }).length;

            const totalEmpleados = empData?.length ?? 0;
            const ausentes = Math.max(totalEmpleados - presentes, 0);

            setStats({
                presentes,
                ausentes,
                tardanzas,
                sinSalida,
                totalEmpleados,
            });

        } catch (err: any) {
            console.error('useAsistencia error:', err);
            setError(err?.message ?? 'Error al cargar asistencias');
        } finally {
            setLoading(false);
        }
    }, [fecha, limit, supabase]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        asistencias,
        loading,
        error,
        stats,
        refetch: fetchData,
    };
}
