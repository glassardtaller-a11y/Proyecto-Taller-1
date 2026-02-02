'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { StatusBadge } from '@/components/ui';
import { useAsistencia } from '@/hooks';

// Skeleton loader para stats
function SkeletonStat() {
    return (
        <Card>
            <div className="text-center animate-pulse">
                <div className="h-9 bg-glass rounded w-16 mx-auto mb-1"></div>
                <div className="h-4 bg-glass rounded w-20 mx-auto"></div>
            </div>
        </Card>
    );
}

// Skeleton loader para tabla
function SkeletonTable() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-10 bg-glass rounded w-full"></div>
            <div className="h-16 bg-glass rounded w-full"></div>
            <div className="h-16 bg-glass rounded w-full"></div>
            <div className="h-16 bg-glass rounded w-full"></div>
            <div className="h-16 bg-glass rounded w-full"></div>
        </div>
    );
}

export default function AsistenciaPage() {
    const { asistencias, stats, loading, error } = useAsistencia();

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Asistencia</h1>
                    <p className="text-foreground-muted mt-1">
                        Control de entradas y salidas del personal
                        {!loading && (
                            <span className="ml-2 text-foreground-subtle">
                                ({new Date().toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })})
                            </span>
                        )}
                    </p>
                </div>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    Escanear QR
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {loading ? (
                    <>
                        <SkeletonStat />
                        <SkeletonStat />
                        <SkeletonStat />
                        <SkeletonStat />
                    </>
                ) : (
                    <>
                        <Card>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-accent-emerald">{stats.presentes}</p>
                                <p className="text-sm text-foreground-muted mt-1">Presentes</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-accent-rose">{stats.ausentes}</p>
                                <p className="text-sm text-foreground-muted mt-1">Ausentes</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-accent-amber">{stats.tardanzas}</p>
                                <p className="text-sm text-foreground-muted mt-1">Tardanzas</p>
                            </div>
                        </Card>
                        <Card>
                            <div className="text-center">
                                <p className="text-3xl font-bold text-accent-violet">{stats.sinSalida}</p>
                                <p className="text-sm text-foreground-muted mt-1">Sin salida</p>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            {/* Error State */}
            {error && (
                <Card>
                    <div className="text-center py-8">
                        <p className="text-accent-rose font-medium">Error al cargar asistencia</p>
                        <p className="text-foreground-muted text-sm mt-1">{error}</p>
                    </div>
                </Card>
            )}

            {/* Table */}
            <Card padding="none">
                <CardHeader className="px-6 pt-6">
                    <CardTitle>Registros de Hoy</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="px-6 pb-6">
                            <SkeletonTable />
                        </div>
                    ) : asistencias.length === 0 && !error ? (
                        <div className="px-6 py-12 text-center text-foreground-muted">
                            <p>No hay registros de asistencia para hoy</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-glass-border">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                            Empleado
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                            Turno
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                            Entrada
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                            Salida
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                            Horas
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase tracking-wider">
                                            Estado
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {asistencias.map((row: any, index) => {
                                        // Calcular horas trabajadas si hay salida
                                        let horasTrabajadas = '--:--';
                                        if (row.hora_entrada && row.hora_salida) {
                                            const entrada = new Date(`1970-01-01T${row.hora_entrada}`);
                                            const salida = new Date(`1970-01-01T${row.hora_salida}`);
                                            const diffMs = salida.getTime() - entrada.getTime();
                                            const hours = Math.floor(diffMs / 3600000);
                                            const minutes = Math.floor((diffMs % 3600000) / 60000);
                                            horasTrabajadas = `${hours}:${minutes.toString().padStart(2, '0')}`;
                                        }

                                        return (
                                            <tr key={index} className="hover:bg-glass transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-violet/20 to-accent-sky/20 flex items-center justify-center text-xs font-medium">
                                                            {row.empleado?.nombre?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || '??'}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-foreground">
                                                                {row.empleado?.nombre || 'Desconocido'}
                                                            </p>
                                                            <p className="text-xs text-foreground-muted">
                                                                {row.empleado?.codigo || row.codigo || '--'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                                                    {row.turno || '--'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                                                    {row.hora_entrada ? row.hora_entrada.substring(0, 5) : '--:--'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground">
                                                    {row.hora_salida ? row.hora_salida.substring(0, 5) : '--:--'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-foreground-muted">
                                                    {horasTrabajadas}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <StatusBadge 
                                                        status={row.estado} 
                                                        size="sm" 
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
