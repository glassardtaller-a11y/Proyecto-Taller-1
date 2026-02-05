'use client';
import Link from 'next/link';

import { StatCard, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StatusBadge, RoleBadge } from '@/components/ui';
import { useEmpleados, useAsistencia } from '@/hooks';

// Iconos para las cards
const UsersIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const ClockIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const ChartIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const MoneyIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

// Datos placeholder para producción y pagos (sin datos reales aún)
const topProducers = [
    { name: 'Sin datos', role: 'trabajador' as const, production: 'S/. 0', items: 0 },
];

// Skeleton loader component
function SkeletonCard() {
    return (
        <div className="animate-pulse">
            <div className="h-4 bg-glass rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-glass rounded w-1/2 mb-2"></div>
            <div className="h-3 bg-glass rounded w-2/3"></div>
        </div>
    );
}

function SkeletonRow() {
    return (
        <div className="flex items-center justify-between px-6 py-3 animate-pulse">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-glass"></div>
                <div>
                    <div className="h-4 bg-glass rounded w-24 mb-1"></div>
                    <div className="h-3 bg-glass rounded w-16"></div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <div className="h-4 bg-glass rounded w-12"></div>
                <div className="h-5 bg-glass rounded w-20"></div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    // Hooks para datos reales
    const { totalActivos, loading: loadingEmpleados } = useEmpleados();
    const { asistencias, stats, loading: loadingAsistencia } = useAsistencia(undefined, 5);

    // Formatear hora desde timestamp
    const formatTime = (timestamp: string | null): string => {
        if (!timestamp) return '--:--';
        const date = new Date(timestamp);
        return date.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    };

    // Determinar estado para badge
    const getStatus = (asistencia: any): 'COMPLETO' | 'INCOMPLETO' | 'PENDIENTE' => {
        if (!asistencia.hora_entrada) return 'PENDIENTE';
        if (asistencia.hora_entrada && asistencia.hora_salida) return 'COMPLETO';
        return 'INCOMPLETO';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-foreground-muted mt-1">
                    Resumen general del taller • {new Date().toLocaleDateString('es-PE', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Empleados Activos - Datos reales */}
                {loadingEmpleados ? (
                    <Card><SkeletonCard /></Card>
                ) : (
                    <StatCard
                        title="Empleados Activos"
                        value={totalActivos.toString()}
                        description="Total registrados"
                        icon={<UsersIcon />}
                        accentColor="emerald"
                    />
                )}

                {/* Asistencia Hoy - Datos reales */}
                {loadingAsistencia ? (
                    <Card><SkeletonCard /></Card>
                ) : (
                    <StatCard
                        title="Asistencia Hoy"
                        value={stats.presentes.toString()}
                        description={`${stats.ausentes} pendientes`}
                        icon={<ClockIcon />}
                        accentColor="orange"
                    />
                )}

                {/* Producción Semana - Placeholder */}
                <StatCard
                    title="Producción Semana"
                    value="S/. --"
                    description="Sin datos aún"
                    icon={<ChartIcon />}
                    accentColor="violet"
                />

                {/* Pagos Pendientes - Placeholder */}
                <StatCard
                    title="Pagos Pendientes"
                    value="--"
                    description="Sin datos aún"
                    icon={<MoneyIcon />}
                    accentColor="rose"
                />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Attendance - Datos reales */}
                <Card padding="none">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex items-center justify-between">
                            <CardTitle>Asistencia Reciente</CardTitle>
                            <button className="text-sm text-accent-orange hover:underline">
                                Ver todo
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-glass-border">
                            {loadingAsistencia ? (
                                <>
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                    <SkeletonRow />
                                </>
                            ) : asistencias.length === 0 ? (
                                <div className="px-6 py-8 text-center text-foreground-muted">
                                    No hay registros de asistencia
                                </div>
                            ) : (
                                asistencias.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between px-6 py-3 hover:bg-glass transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-violet/20 to-accent-sky/20 flex items-center justify-center text-sm font-medium text-foreground">
                                                {item.empleado?.nombre?.split(' ').map((n: string) => n[0]).join('') || '??'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">
                                                    {item.empleado?.nombre || 'Empleado desconocido'}
                                                </p>
                                                <p className="text-xs text-foreground-muted">
                                                    {item.empleado?.codigo || item.codigo || '--'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm text-foreground-muted font-mono">
                                                {formatTime(item.hora_entrada)}
                                            </span>
                                            <StatusBadge status={getStatus(item)} size="sm" />
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Top Producers - Placeholder */}
                <Card padding="none">
                    <CardHeader className="px-6 pt-6">
                        <div className="flex items-center justify-between">
                            <CardTitle>Top Productores</CardTitle>
                            <button className="text-sm text-accent-orange hover:underline">
                                Ver ranking
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y divide-glass-border">
                            <div className="px-6 py-8 text-center text-foreground-muted">
                                <p>Sin datos de producción</p>
                                <p className="text-xs mt-1">Se mostrará cuando haya registros en la tabla produccion</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent>
                    {[
                        {
                            label: 'Escanear QR',
                            icon: '📱',
                            color: 'from-accent-orange to-accent-amber',
                            href: 'https://script.google.com/macros/s/AKfycbwfVlntLUDfRXBY75ZOtqtusAmlM1NVWZHY18EJwTEN_3Fm4HD1xZuuFWh8gFVdzhUm/exec'
                        },
                        {
                            label: 'Registrar Producción',
                            icon: '📊',
                            color: 'from-accent-violet to-accent-sky',
                            href: '/produccion'
                        },
                        {
                            label: 'Nuevo Adelanto',
                            icon: '💰',
                            color: 'from-accent-emerald to-teal-500',
                            href: '/pagos'
                        },
                        {
                            label: 'Generar Boleta',
                            icon: '📄',
                            color: 'from-accent-rose to-pink-500',
                            href: '/ventas/boleta'
                        }
                    ].map((action) => (
                        action.href.startsWith('http') ? (
                            <a
                                key={action.label}
                                href={action.href}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-glass border border-glass-border hover:bg-glass-hover hover:border-glass-border-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-sm font-medium text-foreground text-center">
                                        {action.label}
                                    </span>
                                </div>
                            </a>
                        ) : (
                            <Link key={action.label} href={action.href}>
                                <div className="flex flex-col items-center gap-3 p-4 rounded-xl bg-glass border border-glass-border hover:bg-glass-hover hover:border-glass-border-hover transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl`}>
                                        {action.icon}
                                    </div>
                                    <span className="text-sm font-medium text-foreground text-center">
                                        {action.label}
                                    </span>
                                </div>
                            </Link>
                        )
                    ))}


                </CardContent>
            </Card>
        </div>
    );
}
