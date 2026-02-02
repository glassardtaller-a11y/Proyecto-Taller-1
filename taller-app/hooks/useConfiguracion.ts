'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

export interface Setting {
    id: string;
    clave: string;
    valor: string;
    tipo: 'string' | 'boolean' | 'number' | 'json';
    descripcion: string | null;
    created_at: string;
    updated_at: string;
}

export interface CiclosConfig {
    id: string;
    tipo: 'semanal' | 'quincenal' | 'mensual';
    dia_inicio: number;
    activo: boolean;
    created_at: string;
    updated_at: string;
}

interface UseConfiguracionReturn {
    settings: Setting[];
    ciclosConfig: CiclosConfig | null;
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    getSetting: (clave: string) => string | boolean | number | null;
    updateSetting: (clave: string, valor: string) => Promise<boolean>;
    updateCiclosConfig: (data: Partial<CiclosConfig>) => Promise<boolean>;
}

export function useConfiguracion(): UseConfiguracionReturn {
    const supabase = createClient();

    const [settings, setSettings] = useState<Setting[]>([]);
    const [ciclosConfig, setCiclosConfig] = useState<CiclosConfig | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchConfiguracion = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch settings
            const { data: settingsData, error: settingsError } = await supabase
                .from('settings')
                .select('*')
                .order('clave', { ascending: true });

            if (settingsError) throw settingsError;

            // Fetch ciclos_config (solo el activo)
            const { data: ciclosData, error: ciclosError } = await supabase
                .from('ciclos_config')
                .select('*')
                .eq('activo', true)
                .limit(1)
                .single();

            if (ciclosError && ciclosError.code !== 'PGRST116') throw ciclosError;

            setSettings(settingsData ?? []);
            setCiclosConfig(ciclosData ?? null);
        } catch (err: any) {
            console.error('useConfiguracion error:', err);
            setError(err?.message ?? 'Error al cargar configuración');
        } finally {
            setLoading(false);
        }
    }, [supabase]);

    const getSetting = useCallback((clave: string): string | boolean | number | null => {
        const setting = settings.find(s => s.clave === clave);
        if (!setting) return null;

        switch (setting.tipo) {
            case 'boolean':
                return setting.valor === 'true';
            case 'number':
                return parseFloat(setting.valor);
            default:
                return setting.valor;
        }
    }, [settings]);

    const updateSetting = useCallback(async (clave: string, valor: string): Promise<boolean> => {
        try {
            const { error: supabaseError } = await supabase
                .from('settings')
                .update({ valor })
                .eq('clave', clave);

            if (supabaseError) throw supabaseError;

            await fetchConfiguracion();
            return true;
        } catch (err: any) {
            console.error('Error al actualizar setting:', err);
            setError(err?.message ?? 'Error al actualizar configuración');
            return false;
        }
    }, [supabase, fetchConfiguracion]);

    const updateCiclosConfig = useCallback(async (data: Partial<CiclosConfig>): Promise<boolean> => {
        try {
            if (!ciclosConfig?.id) {
                // Crear nuevo si no existe
                const { error: supabaseError } = await supabase
                    .from('ciclos_config')
                    .insert([{ ...data, activo: true }]);

                if (supabaseError) throw supabaseError;
            } else {
                const { error: supabaseError } = await supabase
                    .from('ciclos_config')
                    .update(data)
                    .eq('id', ciclosConfig.id);

                if (supabaseError) throw supabaseError;
            }

            await fetchConfiguracion();
            return true;
        } catch (err: any) {
            console.error('Error al actualizar ciclos config:', err);
            setError(err?.message ?? 'Error al actualizar configuración de ciclos');
            return false;
        }
    }, [supabase, ciclosConfig, fetchConfiguracion]);

    useEffect(() => {
        fetchConfiguracion();
    }, [fetchConfiguracion]);

    return {
        settings,
        ciclosConfig,
        loading,
        error,
        refetch: fetchConfiguracion,
        getSetting,
        updateSetting,
        updateCiclosConfig,
    };
}
