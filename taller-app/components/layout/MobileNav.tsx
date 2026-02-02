'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

interface NavItem {
    href: string;
    label: string;
    icon: ReactNode;
}

const navItems: NavItem[] = [
    {
        href: '/dashboard',
        label: 'Inicio',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
        ),
    },
    {
        href: '/asistencia',
        label: 'Asistencia',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        href: '/produccion',
        label: 'Producción',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        href: '/empleados',
        label: 'Empleados',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
    {
        href: '/pagos',
        label: 'Pagos',
        icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
        ),
    },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-full h-8 bg-gradient-to-t from-background to-transparent pointer-events-none" />

            {/* Nav bar */}
            <div className="bg-background-secondary/90 backdrop-blur-xl border-t border-glass-border">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                  flex flex-col items-center justify-center gap-1 py-1.5 px-3 rounded-xl min-w-[60px]
                  transition-all duration-200
                  ${isActive
                                        ? 'text-accent-orange'
                                        : 'text-foreground-muted'
                                    }
                `}
                            >
                                <span
                                    className={`
                    relative p-1.5 rounded-xl transition-all duration-200
                    ${isActive ? 'bg-accent-orange/10' : ''}
                  `}
                                >
                                    {item.icon}
                                    {isActive && (
                                        <span className="absolute inset-0 rounded-xl bg-accent-orange/20 animate-pulse" />
                                    )}
                                </span>
                                <span className={`text-[10px] font-medium ${isActive ? 'text-accent-orange' : ''}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}
                </div>

                {/* Safe area for iPhone */}
                <div className="h-[env(safe-area-inset-bottom)]" />
            </div>
        </nav>
    );
}

// Mobile Sidebar Overlay
interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    children: ReactNode;
}

export function MobileSidebar({ isOpen, onClose, children }: MobileSidebarProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="absolute top-0 left-0 h-full w-72 bg-background-secondary border-r border-glass-border animate-slide-in-left">
                {children}
            </div>
        </div>
    );
}
