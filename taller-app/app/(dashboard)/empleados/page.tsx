'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { RoleBadge, StatusBadge } from '@/components/ui';
import { useEmpleados } from '@/hooks';

// Skeleton loader para cards de empleados
function SkeletonEmployeeCard() {
    return (
        <Card className="animate-pulse">
            <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-glass"></div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="h-4 bg-glass rounded w-32"></div>
                        <div className="h-5 bg-glass rounded w-16"></div>
                    </div>
                    <div className="h-3 bg-glass rounded w-20 mb-1"></div>
                    <div className="h-3 bg-glass rounded w-36 mb-2"></div>
                    <div className="h-5 bg-glass rounded w-24"></div>
                </div>
            </div>
            <div className="mt-4 pt-4 border-t border-glass-border flex gap-2">
                <div className="flex-1 h-8 bg-glass rounded-lg"></div>
                <div className="w-10 h-8 bg-glass rounded-lg"></div>
            </div>
        </Card>
    );
}

export default function EmpleadosPage() {
    const { empleados, loading, error, totalActivos, totalInactivos } = useEmpleados();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Empleados</h1>
                    <p className="text-foreground-muted mt-1">
                        Gestión del personal del taller
                        {!loading && (
                            <span className="ml-2 text-foreground-subtle">
                                ({totalActivos} activos, {totalInactivos} inactivos)
                            </span>
                        )}
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Nuevo Empleado
                </button>
            </div>

            {/* Search and Filters */}
            <Card>
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Buscar empleado..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground placeholder-foreground-subtle focus:outline-none focus:border-accent-orange"
                        />
                    </div>
                    <select className="px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground-muted">
                        <option>Todos los roles</option>
                        <option>Admin</option>
                        <option>Registrador</option>
                        <option>Trabajador</option>
                    </select>
                    <select className="px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground-muted">
                        <option>Todos los estados</option>
                        <option>Activos</option>
                        <option>Inactivos</option>
                    </select>
                </div>
            </Card>

            {/* Error State */}
            {error && (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-accent-rose font-medium">Error al cargar empleados</p>
                        <p className="text-foreground-muted text-sm mt-1">{error}</p>
                    </div>
                </Card>
            )}

            {/* Loading State */}
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <SkeletonEmployeeCard />
                    <SkeletonEmployeeCard />
                    <SkeletonEmployeeCard />
                    <SkeletonEmployeeCard />
                    <SkeletonEmployeeCard />
                    <SkeletonEmployeeCard />
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && empleados.length === 0 && (
                <Card>
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 mx-auto text-foreground-subtle mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <p className="text-foreground-muted font-medium">No hay empleados registrados</p>
                        <p className="text-foreground-subtle text-sm mt-1">Agrega tu primer empleado para comenzar</p>
                    </div>
                </Card>
            )}

            {/* Employees Grid */}
            {!loading && !error && empleados.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {empleados.map((employee) => (
                        <Card key={employee.id} hover glow="none" className="cursor-pointer">
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-accent-violet to-accent-sky flex items-center justify-center text-white font-semibold text-lg">
                                    {employee.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-base font-semibold text-foreground truncate">{employee.nombre}</h3>
                                        <StatusBadge
                                            status={employee.activo ? 'ACTIVO' : 'INACTIVO'}
                                            size="sm"
                                        />
                                    </div>
                                    <p className="text-sm text-foreground-muted">{employee.codigo}</p>
                                    <p className="text-xs text-foreground-subtle truncate">{employee.email}</p>
                                    <div className="mt-2">
                                        <RoleBadge role={employee.rol} size="sm" />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-glass-border flex gap-2">
                                <button className="flex-1 px-3 py-1.5 text-sm rounded-lg bg-glass border border-glass-border text-foreground-muted hover:bg-glass-hover hover:text-foreground transition-colors">
                                    Ver perfil
                                </button>
                                <button className="px-3 py-1.5 text-sm rounded-lg bg-glass border border-glass-border text-foreground-muted hover:bg-glass-hover hover:text-foreground transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                    </svg>
                                </button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
