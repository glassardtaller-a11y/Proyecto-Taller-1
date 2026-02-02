'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useState } from 'react';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { RoleBadge } from '@/components/ui/Badge';

type Role = 'admin' | 'registrador' | 'trabajador';

interface NavItem {
    href: string;
    label: string;
    icon: ReactNode;
    roles: Role[];
    badge?: number;
}

const navItems: NavItem[] = [
    {
        href: '/dashboard',
        label: 'Dashboard',
        roles: ['admin', 'registrador', 'trabajador'],
        icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z
             M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z
             M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z
             M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        ),
    },
    {
        href: '/asistencia',
        label: 'Asistencia',
        roles: ['admin', 'registrador', 'trabajador'],
        icon: <span>⏱️</span>,
    },
    {
        href: '/produccion',
        label: 'Producción',
        roles: ['admin', 'registrador', 'trabajador'],
        icon: <span>📊</span>,
    },
    {
        href: '/empleados',
        label: 'Empleados',
        roles: ['admin'],
        icon: <span>👥</span>,
    },
    {
        href: '/pagos',
        label: 'Pagos',
        roles: ['admin', 'registrador'],
        icon: <span>💰</span>,
    },
    {
        href: '/configuracion',
        label: 'Configuración',
        roles: ['admin'],
        icon: <span>⚙️</span>,
    },
];

interface SidebarProps {
    collapsed?: boolean;
    onToggle?: () => void;
}

export function Sidebar({ collapsed = false, onToggle }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { empleado, role, signOut, isLoading } = useAuthContext();

    // ✅ FILTRADO POR ROL (SIN canAccessRoute)
    const filteredNavItems = navItems.filter(
        item => role && item.roles.includes(role)
    );

    const getInitials = (nombre: string) =>
        nombre
            .split(' ')
            .map(n => n[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    return (
        <aside
            className={`
        fixed top-0 left-0 h-screen z-40
        bg-glass backdrop-blur-xl border-r border-glass-border
        transition-all duration-300
        flex flex-col
        ${collapsed ? 'w-[72px]' : 'w-64'}
      `}
        >
            {/* LOGO */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-glass-border">
                {!collapsed && <span className="font-semibold">Control Taller</span>}
                {onToggle && (
                    <button onClick={onToggle} className="text-sm text-foreground-muted">
                        ⇔
                    </button>
                )}
            </div>

            {/* NAV */}
            <nav className="flex-1 py-4 px-3">
                <ul className="space-y-1">
                    {filteredNavItems.map(item => {
                        const isActive =
                            pathname === item.href ||
                            pathname.startsWith(item.href + '/');

                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg
                    transition-colors
                    ${isActive
                                            ? 'bg-accent-orange/10 text-accent-orange'
                                            : 'text-foreground-muted hover:bg-glass-hover hover:text-foreground'}
                    ${collapsed ? 'justify-center' : ''}
                  `}
                                    title={collapsed ? item.label : undefined}
                                >
                                    {item.icon}
                                    {!collapsed && <span className="text-sm">{item.label}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* USER */}
            <div className="p-3 border-t border-glass-border">
                {isLoading ? (
                    <div className="flex justify-center py-2">
                        <div className="w-5 h-5 border-2 border-accent-orange border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : empleado ? (
                    <>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-accent-orange text-white flex items-center justify-center text-sm">
                                {getInitials(empleado.nombre)}
                            </div>
                            {!collapsed && (
                                <div>
                                    <p className="text-sm">{empleado.nombre}</p>
                                    <RoleBadge role={empleado.rol} size="sm" />
                                </div>
                            )}
                        </div>

                        {!collapsed && (
                            <button
                                onClick={handleSignOut}
                                className="mt-3 w-full text-left text-sm text-accent-rose hover:underline"
                            >
                                Cerrar sesión
                            </button>
                        )}
                    </>
                ) : null}
            </div>
        </aside>
    );
}
