'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthContext } from './AuthProvider';
import { canAccessRoute } from '@/hooks/useRole';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isLoading, isAuthenticated, role, empleado } = useAuthContext();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isLoading) return;

        if (!isAuthenticated) {
            router.replace('/login');
            return;
        }

        // ⬅️ SOLO bloquea si NO existe empleado
        if (!empleado) {
            router.replace('/login');
            return;
        }

        if (role && !canAccessRoute(pathname, role)) {
            router.replace('/dashboard');
        }
    }, [isLoading, isAuthenticated, role, empleado, pathname, router]);

    if (isLoading) return null;

    if (!isAuthenticated || !empleado) return null;

    return <>{children}</>;
}
