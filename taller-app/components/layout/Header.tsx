'use client';

import { useState } from 'react';
import { SearchInput } from '../ui/Input';
import { Button, IconButton } from '../ui/Button';
import { CountBadge } from '../ui/Badge';

interface HeaderProps {
    title?: string;
    subtitle?: string;
    showSearch?: boolean;
    onMenuClick?: () => void;
    showMenuButton?: boolean;
}

export function Header({
    title,
    subtitle,
    showSearch = true,
    onMenuClick,
    showMenuButton = false,
}: HeaderProps) {
    const [searchValue, setSearchValue] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-xl border-b border-glass-border">
            <div className="flex items-center justify-between h-16 px-4 lg:px-6">
                {/* Left Section */}
                <div className="flex items-center gap-4">
                    {showMenuButton && (
                        <IconButton
                            icon={
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            }
                            label="Abrir menú"
                            variant="ghost"
                            onClick={onMenuClick}
                            className="lg:hidden"
                        />
                    )}
                    {title && (
                        <div>
                            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
                            {subtitle && (
                                <p className="text-sm text-foreground-muted">{subtitle}</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Center - Search (Desktop) */}
                {showSearch && (
                    <div className="hidden md:block flex-1 max-w-md mx-8">
                        <SearchInput
                            placeholder="Buscar empleados, registros..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onClear={() => setSearchValue('')}
                        />
                    </div>
                )}

                {/* Right Section */}
                <div className="flex items-center gap-2">
                    {/* Search Button (Mobile) */}
                    {showSearch && (
                        <IconButton
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            }
                            label="Buscar"
                            variant="ghost"
                            className="md:hidden"
                        />
                    )}

                    {/* Notifications */}
                    <div className="relative">
                        <IconButton
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                </svg>
                            }
                            label="Notificaciones"
                            variant="ghost"
                            onClick={() => setShowNotifications(!showNotifications)}
                        />
                        <span className="absolute -top-0.5 -right-0.5">
                            <CountBadge count={5} />
                        </span>

                        {/* Dropdown de notificaciones */}
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-80 bg-background-secondary border border-glass-border rounded-xl shadow-2xl overflow-hidden animate-fade-in">
                                <div className="p-4 border-b border-glass-border">
                                    <h3 className="font-semibold text-foreground">Notificaciones</h3>
                                </div>
                                <div className="max-h-80 overflow-y-auto">
                                    {[1, 2, 3].map((i) => (
                                        <div
                                            key={i}
                                            className="p-4 border-b border-glass-border hover:bg-glass transition-colors cursor-pointer"
                                        >
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-full bg-accent-orange/10 flex items-center justify-center text-accent-orange flex-shrink-0">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm text-foreground">
                                                        <span className="font-medium">Carlos Mendoza</span> marcó entrada
                                                    </p>
                                                    <p className="text-xs text-foreground-muted mt-0.5">Hace 5 minutos</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-3 border-t border-glass-border">
                                    <Button variant="ghost" size="sm" className="w-full">
                                        Ver todas las notificaciones
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Action */}
                    <Button
                        variant="primary"
                        size="sm"
                        leftIcon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        }
                        className="hidden sm:flex"
                    >
                        Registrar
                    </Button>

                    {/* Quick Action (Mobile) */}
                    <IconButton
                        icon={
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        }
                        label="Registrar"
                        variant="primary"
                        className="sm:hidden"
                    />
                </div>
            </div>
        </header>
    );
}
