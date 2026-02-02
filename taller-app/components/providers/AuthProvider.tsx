'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types';

interface EmpleadoData {
    id: string;
    nombre: string;
    codigo: string;
    email: string;
    rol: UserRole;
    activo: boolean;
}

interface AuthContextType {
    user: any | null;
    empleado: EmpleadoData | null;
    role: UserRole | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    error: string | null;
    signOut: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provider de autenticación para envolver la aplicación
 */
export function AuthProvider({ children }: { children: ReactNode }) {
    const auth = useAuth();

    return (
        <AuthContext.Provider value={auth}>
            {children}
        </AuthContext.Provider>
    );
}

/**
 * Hook para acceder al contexto de autenticación
 */
export function useAuthContext() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
}
