'use client';

import { useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

export type UserRole = 'admin' | 'registrador' | 'trabajador';

interface EmpleadoData {
    id: string;
    auth_user_id: string;
    username: string;
    nombre: string;
    rol: UserRole;
    activo: boolean;
}

interface AuthState {
    user: User | null;
    empleado: EmpleadoData | null;
    role: UserRole | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

export function useAuth() {
    const supabase = createClient();

    const [state, setState] = useState<AuthState>({
        user: null,
        empleado: null,
        role: null,
        isLoading: true,
        isAuthenticated: false,
        error: null,
    });

    // 🔹 Obtener empleado por auth_user_id (CORRECTO)
    const fetchEmpleado = useCallback(
        async (authUserId: string): Promise<EmpleadoData | null> => {
            const { data, error } = await supabase
                .from('empleados')
                .select('id, auth_user_id, username, nombre, rol, activo')
                .eq('auth_user_id', authUserId)
                .single();

            if (error) {
                console.error('Empleado no encontrado:', error.message);
                return null;
            }

            return data as EmpleadoData;
        },
        [supabase]
    );

    const loadAuthState = useCallback(async () => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            setState({
                user: null,
                empleado: null,
                role: null,
                isLoading: false,
                isAuthenticated: false,
                error: null,
            });
            return;
        }

        const empleado = await fetchEmpleado(user.id);

        if (!empleado) {
            setState({
                user,
                empleado: null,
                role: null,
                isLoading: false,
                isAuthenticated: true,
                error: 'Usuario no registrado como empleado',
            });
            return;
        }

        if (!empleado.activo) {
            setState({
                user,
                empleado,
                role: null,
                isLoading: false,
                isAuthenticated: true,
                error: 'Cuenta desactivada',
            });
            return;
        }

        setState({
            user,
            empleado,
            role: empleado.rol,
            isLoading: false,
            isAuthenticated: true,
            error: null,
        });
    }, [fetchEmpleado, supabase]);

    const signOut = async () => {
        await supabase.auth.signOut();
        setState({
            user: null,
            empleado: null,
            role: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
        });
    };

    useEffect(() => {
        loadAuthState();

        const { data: subscription } = supabase.auth.onAuthStateChange(() => {
            loadAuthState();
        });

        return () => {
            subscription.subscription.unsubscribe();
        };
    }, [loadAuthState, supabase]);

    return {
        ...state,
        signOut,
        refresh: loadAuthState,
    };
}
