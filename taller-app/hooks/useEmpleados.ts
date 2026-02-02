'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Empleado } from '@/types';

interface UseEmpleadosReturn {
    empleados: Empleado[];
    loading: boolean;
    error: string | null;
    totalActivos: number;
    totalInactivos: number;
    refetch: () => Promise<void>;
}

export function useEmpleados(
    soloActivos: boolean = false
): UseEmpleadosReturn {
    const supabase = createClient();

    const [empleados, setEmpleados] = useState<Empleado[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEmpleados = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            let query = supabase
                .from('empleados')
                .select(`
          id,
          codigo,
          username,
          nombre,
          rol,
          activo,
          created_at
        `)
                .order('nombre', { ascending: true });

            if (soloActivos) {
                query = query.eq('activo', true);
            }

            const { data, error: supabaseError } = await query;
            if (supabaseError) throw supabaseError;

            // ✅ MAPEO EXPLÍCITO (CLAVE)
            const empleadosFormateados: Empleado[] = (data ?? []).map(
                (e: any) => ({
                    id: e.id,
                    codigo: e.codigo,
                    username: e.username,
                    nombre: e.nombre,
                    rol: e.rol,
                    activo: e.activo,
                    created_at: e.created_at,
                })
            );

            setEmpleados(empleadosFormateados);
        } catch (err: any) {
            console.error('useEmpleados error:', err);
            setError(err?.message ?? 'Error al cargar empleados');
        } finally {
            setLoading(false);
        }
    }, [soloActivos, supabase]);

    useEffect(() => {
        fetchEmpleados();
    }, [fetchEmpleados]);

    return {
        empleados,
        loading,
        error,
        totalActivos: empleados.filter(e => e.activo).length,
        totalInactivos: empleados.filter(e => !e.activo).length,
        refetch: fetchEmpleados,
    };
}
