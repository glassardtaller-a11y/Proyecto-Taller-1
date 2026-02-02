'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Turno {
    id: string;
    nombre: string;
    hora_inicio: string;
    hora_fin: string;
    tolerancia_minutos: number;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

interface UseTurnosReturn {
    turnos: Turno[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    crear: (data: Omit<Turno, 'id' | 'created_at' | 'updated_at'>) => Promise<boolean>;
    actualizar: (id: string, data: Partial<Turno>) => Promise<boolean>;
    eliminar: (id: string) => Promise<boolean>;
}

export function useTurnos(): UseTurnosReturn {
    const supabase = createClient();

    const [turnos, setTurnos] = useState<Turno[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTurnos = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: supabaseError } = await supabase
                .from('turnos')
                .select('*')
                .order('hora_inicio', { ascending: true });

            if (supabaseError) throw supabaseError;

            setTurnos(data ?? []);
        } catch (err: any) {
            console.error('useTurnos error:', err);
            setError(err?.message ?? 'Error al cargar turnos');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const crear = useCallback(async (data: Omit<Turno, 'id' | 'created_at' | 'updated_at'>): Promise<boolean> => {
        try {
            const { error: supabaseError } = await supabase
                .from('turnos')
                .insert([data]);

            if (supabaseError) throw supabaseError;

            await fetchTurnos();
            return true;
        } catch (err: any) {
            console.error('Error al crear turno:', err);
            setError(err?.message ?? 'Error al crear turno');
            return false;
        }
    }, [supabase, fetchTurnos]);

    const actualizar = useCallback(async (id: string, data: Partial<Turno>): Promise<boolean> => {
        try {
            const { error: supabaseError } = await supabase
                .from('turnos')
                .update(data)
                .eq('id', id);

            if (supabaseError) throw supabaseError;

            await fetchTurnos();
            return true;
        } catch (err: any) {
            console.error('Error al actualizar turno:', err);
            setError(err?.message ?? 'Error al actualizar turno');
            return false;
        }
    }, [supabase, fetchTurnos]);

    const eliminar = useCallback(async (id: string): Promise<boolean> => {
        try {
            const { error: supabaseError } = await supabase
                .from('turnos')
                .delete()
                .eq('id', id);

            if (supabaseError) throw supabaseError;

            await fetchTurnos();
            return true;
        } catch (err: any) {
            console.error('Error al eliminar turno:', err);
            setError(err?.message ?? 'Error al eliminar turno');
            return false;
        }
    }, [supabase, fetchTurnos]);

    useEffect(() => {
        fetchTurnos();
    }, [fetchTurnos]);

    return {
        turnos,
        loading,
        error,
        refetch: fetchTurnos,
        crear,
        actualizar,
        eliminar,
    };
}
