'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ======================
   TIPOS
====================== */

export interface TipoTrabajo {
    id: string;
    nombre: string;
    descripcion: string | null; // 👈 columna REAL
    tarifa_actual: number;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

interface UseTiposTrabajoReturn {
    tiposTrabajo: TipoTrabajo[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    crear: (data: Omit<TipoTrabajo, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
    actualizar: (id: string, data: Partial<TipoTrabajo>) => Promise<boolean>;
    eliminar: (id: string) => Promise<boolean>;
}

/* ======================
   HOOK
====================== */

export function useTiposTrabajo(): UseTiposTrabajoReturn {
    const supabase = createClient();

    const [tiposTrabajo, setTiposTrabajo] = useState<TipoTrabajo[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ========= LISTAR ========= */
    const fetchTiposTrabajo = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error } = await supabase
                .from('tipos_trabajo')
                .select(`
                    id,
                    nombre,
                    descripcion,
                    tarifa_actual,
                    activo,
                    created_at,
                    updated_at
                `)
                .order('nombre', { ascending: true });

            if (error) throw error;

            setTiposTrabajo(data ?? []);
        } catch (err: any) {
            console.error('useTiposTrabajo error:', err);
            setError(err?.message ?? 'Error al cargar tipos de trabajo');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    /* ========= CREAR ========= */
    const crear = useCallback(
        async (data: Omit<TipoTrabajo, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
            try {
                setError(null);

                const { error } = await supabase
                    .from('tipos_trabajo')
                    .insert({
                        nombre: data.nombre,
                        descripcion: data.descripcion, // ✅ mapeo correcto
                        tarifa_actual: data.tarifa_actual,
                        activo: data.activo,
                    });

                if (error) throw error;

                await fetchTiposTrabajo();
                return true;
            } catch (err: any) {
                console.error('Error al crear tipo de trabajo:', err);
                setError(err?.message ?? 'Error al crear tipo de trabajo');
                return false;
            }
        },
        [supabase, fetchTiposTrabajo]
    );

    /* ========= ACTUALIZAR ========= */
    const actualizar = useCallback(
        async (id: string, data: Partial<TipoTrabajo>): Promise<boolean> => {
            try {
                setError(null);

                const { error } = await supabase
                    .from('tipos_trabajo')
                    .update({
                        nombre: data.nombre,
                        descripcion: data.descripcion,
                        tarifa_actual: data.tarifa_actual,
                        activo: data.activo,
                    })
                    .eq('id', id);

                if (error) throw error;

                await fetchTiposTrabajo();
                return true;
            } catch (err: any) {
                console.error('Error al actualizar tipo de trabajo:', err);
                setError(err?.message ?? 'Error al actualizar tipo de trabajo');
                return false;
            }
        },
        [supabase, fetchTiposTrabajo]
    );

    /* ========= ELIMINAR ========= */
    const eliminar = useCallback(
        async (id: string): Promise<boolean> => {
            try {
                setError(null);

                const { error } = await supabase
                    .from('tipos_trabajo')
                    .delete()
                    .eq('id', id);

                if (error) throw error;

                await fetchTiposTrabajo();
                return true;
            } catch (err: any) {
                console.error('Error al eliminar tipo de trabajo:', err);
                setError(err?.message ?? 'Error al eliminar tipo de trabajo');
                return false;
            }
        },
        [supabase, fetchTiposTrabajo]
    );

    useEffect(() => {
        fetchTiposTrabajo();
    }, [fetchTiposTrabajo]);

    return {
        tiposTrabajo,
        loading,
        error,
        refetch: fetchTiposTrabajo,
        crear,
        actualizar,
        eliminar,
    };
}
