'use client';

export type UserRole = 'admin' | 'registrador' | 'trabajador';

/**
 * Configuración de acceso por ruta
 */
const routePermissions: Record<string, UserRole[]> = {
    '/dashboard': ['admin', 'registrador', 'trabajador'],
    '/asistencia': ['admin', 'registrador', 'trabajador'],
    '/produccion': ['admin', 'registrador', 'trabajador'],
    '/empleados': ['admin'],
    '/pagos': ['admin', 'registrador'],
    '/configuracion': ['admin'],
};

/**
 * Verifica si un rol puede acceder a una ruta
 */
export function canAccessRoute(
    route: string,
    role: UserRole | null
): boolean {
    if (!role) return false;

    const match = Object.keys(routePermissions)
        .filter(r => route.startsWith(r))
        .sort((a, b) => b.length - a.length)[0];

    if (!match) return role === 'admin';

    return routePermissions[match].includes(role);
}
