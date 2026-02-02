'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ======================
   TIPOS
====================== */

export interface Produccion {
    id: string;
    empleado_id: string;
    tipo_trabajo_id: string;
    fecha: string;
    cantidad: number;
    tarifa_aplicada: number;
    subtotal: number;
    nota: string | null;
    created_at: string;
    // Joins
    empleado?: {
        id: string;
        nombre: string;
        codigo: string;
    };
    tipo_trabajo?: {
        id: string;
        nombre: string;
    };
}

export interface ProduccionStats {
    totalHoy: number;
    registrosSemana: number;
    totalSemana: number;
}

interface UseProduccionReturn {
    produccion: Produccion[];
    stats: ProduccionStats;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    crear: (data: {
        empleado_id: string;
        tipo_trabajo_id: string;
        fecha: string;
        cantidad: number;
        tarifa_aplicada: number;
        nota?: string;
    }) => Promise<boolean>;
    eliminar: (id: string) => Promise<boolean>;
    fetchByFecha: (fecha: string) => Promise<void>;
    fetchByEmpleado: (empleadoId: string) => Promise<Produccion[]>;
}

/* ======================
   HOOK
====================== */

export function useProduccion(fechaInicial?: string): UseProduccionReturn {
    const supabase = createClient();

    const [produccion, setProduccion] = useState<Produccion[]>([]);
    const [stats, setStats] = useState<ProduccionStats>({
        totalHoy: 0,
        registrosSemana: 0,
        totalSemana: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const hoy = new Date().toISOString().split('T')[0];

    /* ========= LISTAR POR FECHA ========= */
    const fetchByFecha = useCallback(async (fecha: string) => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('produccion')
                .select(`
                    id,
                    empleado_id,
                    tipo_trabajo_id,
                    fecha,
                    cantidad,
                    tarifa_aplicada,
                    subtotal,
                    nota,
                    created_at,
                    empleado:empleados(id, nombre, codigo),
                    tipo_trabajo:tipos_trabajo(id, nombre)
                `)
                .eq('fecha', fecha)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Flatten the joined data (Supabase returns single-row joins as arrays)
            const formattedData: Produccion[] = (data ?? []).map((item: any) => ({
                ...item,
                empleado: Array.isArray(item.empleado) ? item.empleado[0] : item.empleado,
                tipo_trabajo: Array.isArray(item.tipo_trabajo) ? item.tipo_trabajo[0] : item.tipo_trabajo,
            }));

            setProduccion(formattedData);
        } catch (err: any) {
            console.error('useProduccion fetchByFecha error:', err);
            setError(err?.message ?? 'Error al cargar producción');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    /* ========= LISTAR POR EMPLEADO ========= */
    const fetchByEmpleado = useCallback(async (empleadoId: string): Promise<Produccion[]> => {
        try {
            const { data, error } = await supabase
                .from('produccion')
                .select(`
                    id,
                    empleado_id,
                    tipo_trabajo_id,
                    fecha,
                    cantidad,
                    tarifa_aplicada,
                    subtotal,
                    nota,
                    created_at,
                    empleado:empleados(id, nombre, codigo),
                    tipo_trabajo:tipos_trabajo(id, nombre)
                `)
                .eq('empleado_id', empleadoId)
                .order('fecha', { ascending: false });

            if (error) throw error;

            // Flatten the joined data
            const formattedData: Produccion[] = (data ?? []).map((item: any) => ({
                ...item,
                empleado: Array.isArray(item.empleado) ? item.empleado[0] : item.empleado,
                tipo_trabajo: Array.isArray(item.tipo_trabajo) ? item.tipo_trabajo[0] : item.tipo_trabajo,
            }));

            return formattedData;
        } catch (err: any) {
            console.error('useProduccion fetchByEmpleado error:', err);
            return [];
        }
    }, [supabase]);

    /* ========= FETCH STATS ========= */
    const fetchStats = useCallback(async () => {
        try {
            // Get start of week (Monday)
            const today = new Date();
            const dayOfWeek = today.getDay();
            const monday = new Date(today);
            monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
            const mondayStr = monday.toISOString().split('T')[0];

            // Total de hoy
            const { data: todayData } = await supabase
                .from('produccion')
                .select('subtotal')
                .eq('fecha', hoy);

            const totalHoy = (todayData ?? []).reduce((sum, item) => sum + (item.subtotal || 0), 0);

            // Registros y total de la semana
            const { data: weekData } = await supabase
                .from('produccion')
                .select('subtotal')
                .gte('fecha', mondayStr)
                .lte('fecha', hoy);

            const registrosSemana = weekData?.length ?? 0;
            const totalSemana = (weekData ?? []).reduce((sum, item) => sum + (item.subtotal || 0), 0);

            setStats({
                totalHoy,
                registrosSemana,
                totalSemana,
            });
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    }, [supabase, hoy]);

    /* ========= CREAR ========= */
    const crear = useCallback(
        async (data: {
            empleado_id: string;
            tipo_trabajo_id: string;
            fecha: string;
            cantidad: number;
            tarifa_aplicada: number;
            nota?: string;
        }): Promise<boolean> => {
            try {
                setError(null);

                const { error } = await supabase
                    .from('produccion')
                    .insert({
                        empleado_id: data.empleado_id,
                        tipo_trabajo_id: data.tipo_trabajo_id,
                        fecha: data.fecha,
                        cantidad: data.cantidad,
                        tarifa_aplicada: data.tarifa_aplicada,
                        nota: data.nota || null,
                    });

                if (error) throw error;

                await fetchByFecha(data.fecha);
                await fetchStats();
                return true;
            } catch (err: any) {
                console.error('Error al crear producción:', err);
                setError(err?.message ?? 'Error al crear registro de producción');
                return false;
            }
        },
        [supabase, fetchByFecha, fetchStats]
    );

    /* ========= ELIMINAR ========= */
    const eliminar = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                setError(null);

                // Get the record first to know the date
                const { data: record } = await supabase
                    .from('produccion')
                    .select('fecha')
                    .eq('id', id)
                    .single();

                const { error } = await supabase
                    .from('produccion')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                if (record?.fecha) {
                    await fetchByFecha(record.fecha);
                }
                await fetchStats();
                return true;
            } catch (err: any) {
                console.error('Error al eliminar producción:', err);
                setError(err?.message ?? 'Error al eliminar registro');
                return false;
            }
        },
        [supabase, fetchByFecha, fetchStats]
    );

    /* ========= REFETCH ========= */
    const refetch = useCallback(async () => {
        await fetchByFecha(fechaInicial || hoy);
        await fetchStats();
    }, [fetchByFecha, fetchStats, fechaInicial, hoy]);

    /* ========= INITIAL LOAD ========= */
    useEffect(() => {
        refetch();
    }, []);

    return {
        produccion,
        stats,
        loading,
        error,
        refetch,
        crear,
        eliminar,
        fetchByFecha,
        fetchByEmpleado,
    };
}
