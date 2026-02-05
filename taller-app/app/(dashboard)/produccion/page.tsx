'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useProduccion, useEmpleados, useTiposTrabajo } from '@/hooks';
import type { Produccion } from '@/hooks/useProduccion';
import type { TipoTrabajo } from '@/hooks/useTiposTrabajo';
import type { Empleado } from '@/types';

// =============================================
// SKELETON LOADERS
// =============================================
function SkeletonStat() {
    return (
        <Card>
            <div className="animate-pulse flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-glass"></div>
                <div className="flex-1">
                    <div className="h-7 bg-glass rounded w-24 mb-1"></div>
                    <div className="h-4 bg-glass rounded w-32"></div>
                </div>
            </div>
        </Card>
    );
}

function SkeletonTable() {
    return (
        <div className="animate-pulse space-y-3">
            <div className="h-10 bg-glass rounded w-full"></div>
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 bg-glass rounded w-full"></div>
            ))}
        </div>
    );
}

// =============================================
// MODAL COMPONENT
// =============================================
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
}

function Modal({ isOpen, onClose, title, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20">
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            <div
                className="relative bg-glass-heavy border border-glass-border
                           rounded-2xl p-6 w-full max-w-lg mx-4
                           shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-glass transition-colors text-foreground-muted"
                    >
                        ✕
                    </button>
                </div>

                {children}
            </div>
        </div>
    );
}


// =============================================
// MAIN PAGE
// =============================================
export default function ProduccionPage() {
    const [fechaSeleccionada, setFechaSeleccionada] = useState(
        new Date().toISOString().split('T')[0]
    );
    const { produccion, stats, loading, error, crear, eliminar, fetchByFecha } = useProduccion(fechaSeleccionada);
    const { empleados, loading: loadingEmpleados } = useEmpleados(true); // Solo activos
    const { tiposTrabajo, loading: loadingTipos } = useTiposTrabajo();

    const [modalOpen, setModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        empleado_id: '',
        tipo_trabajo_id: '',
        fecha: fechaSeleccionada,
        cantidad: 1,
        nota: '',
    });
    const [saving, setSaving] = useState(false);
    const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');



    // Update tarifa when tipo_trabajo changes
    const tipoSeleccionado = tiposTrabajo.find(t => t.id === formData.tipo_trabajo_id);
    const tarifaAplicada = Number(tipoSeleccionado?.tarifa_actual || 0);

    const subtotalCalculado = Number(
        (formData.cantidad * tarifaAplicada).toFixed(2)
    );


    // Fetch production when date changes
    useEffect(() => {
        fetchByFecha(fechaSeleccionada);
    }, [fechaSeleccionada]);

    const openModal = () => {
        setFormData({
            empleado_id: empleados[0]?.id || '',
            tipo_trabajo_id: '',
            fecha: fechaSeleccionada, // ✅ AQUÍ
            cantidad: 1,
            nota: '',
        });
        setCategoriaSeleccionada(''); // ✅ importante
        setModalOpen(true);
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.empleado_id || !formData.tipo_trabajo_id) return;

        setSaving(true);
        const success = await crear({
            empleado_id: formData.empleado_id,
            tipo_trabajo_id: formData.tipo_trabajo_id,
            fecha: formData.fecha,
            cantidad: formData.cantidad,
            tarifa_aplicada: tarifaAplicada,
            nota: formData.nota || undefined,
        });

        if (success) {
            setModalOpen(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Eliminar este registro de producción?')) {
            await eliminar(id);
        }
    };

    const getEmpleadoNombre = (empleadoId: string) => {
        const emp = empleados.find(e => e.id === empleadoId);
        return emp?.nombre || 'Desconocido';
    };

    const getTipoNombre = (tipoId: string) => {
        const tipo = tiposTrabajo.find(t => t.id === tipoId);
        return tipo?.nombre || 'Desconocido';
    };

    const categorias = Array.from(
        new Set(
            tiposTrabajo
                .filter(t => t.activo)
                .map(t => t.descripcion)
                .filter(Boolean)
        )
    ) as string[];

    const tiposFiltrados = tiposTrabajo.filter(
        t => t.activo && t.descripcion === categoriaSeleccionada
    );



    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Producción</h1>
                    <p className="text-foreground-muted mt-1">
                        Registro y seguimiento de producción diaria
                    </p>
                </div>
                <button
                    onClick={openModal}
                    disabled={loadingEmpleados || loadingTipos}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Registro
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {loading ? (
                    <>
                        <SkeletonStat />
                        <SkeletonStat />
                        <SkeletonStat />
                    </>
                ) : (
                    <>
                        <Card glow="orange">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-orange/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-accent-orange" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">S/. {stats.totalHoy.toFixed(2)}</p>
                                    <p className="text-sm text-foreground-muted">Producción Hoy</p>
                                </div>
                            </div>
                        </Card>
                        <Card glow="emerald">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-emerald/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-accent-emerald" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">{stats.registrosSemana}</p>
                                    <p className="text-sm text-foreground-muted">Registros Semana</p>
                                </div>
                            </div>
                        </Card>
                        <Card glow="violet">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-accent-violet/10 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-accent-violet" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-foreground">S/. {stats.totalSemana.toFixed(2)}</p>
                                    <p className="text-sm text-foreground-muted">Total Semana</p>
                                </div>
                            </div>
                        </Card>
                    </>
                )}
            </div>

            {/* Error State */}
            {error && (
                <Card>
                    <div className="text-center py-4">
                        <p className="text-accent-rose font-medium">Error: {error}</p>
                    </div>
                </Card>
            )}

            {/* Production Table */}
            <Card padding="none">
                <CardHeader className="px-6 pt-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <CardTitle>Producción del Día</CardTitle>
                        <input
                            type="date"
                            value={fechaSeleccionada}
                            onChange={(e) => setFechaSeleccionada(e.target.value)}
                            className="px-3 py-1.5 rounded-lg bg-glass border border-glass-border text-sm text-foreground focus:border-accent-orange focus:outline-none"
                        />
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <SkeletonTable />
                    ) : produccion.length === 0 ? (
                        <div className="text-center py-12 text-foreground-muted">
                            <p>No hay registros de producción para esta fecha</p>
                            <button
                                onClick={openModal}
                                className="mt-4 text-accent-orange hover:underline"
                            >
                                Agregar primer registro
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-glass-border">
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Empleado</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-foreground-muted uppercase">Tipo Trabajo</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Cantidad</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Tarifa</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Total</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-foreground-muted uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-glass-border">
                                    {produccion.map((row) => (
                                        <tr key={row.id} className="hover:bg-glass transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-amber/20 flex items-center justify-center text-xs font-medium">
                                                        {row.empleado?.nombre?.split(' ').map(n => n[0]).join('').slice(0, 2) || '??'}
                                                    </div>
                                                    <span className="text-sm font-medium text-foreground">
                                                        {row.empleado?.nombre || getEmpleadoNombre(row.empleado_id)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted">
                                                {row.tipo_trabajo?.nombre || getTipoNombre(row.tipo_trabajo_id)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground text-right font-mono">
                                                {row.cantidad}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground-muted text-right font-mono">
                                                S/. {Number(row.tarifa_aplicada.toFixed(2)).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-accent-emerald text-right font-mono font-semibold">
                                                S/. {Number(row.subtotal.toFixed(2)).toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <button
                                                    onClick={() => handleDelete(row.id)}
                                                    className="p-1.5 rounded hover:bg-glass-hover transition-colors text-accent-rose"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-glass">
                                        <td colSpan={4} className="px-6 py-3 text-right text-sm font-semibold text-foreground">
                                            Total del día:
                                        </td>
                                        <td className="px-6 py-3 text-right text-lg font-bold text-accent-emerald font-mono">
                                            S/. {produccion.reduce((sum, p) => sum + p.subtotal, 0).toFixed(2)}
                                        </td>
                                        <td></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Nuevo Registro */}
            <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Nuevo Registro de Producción">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Empleado */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Empleado</label>
                        <select
                            value={formData.empleado_id}
                            onChange={(e) => setFormData({ ...formData, empleado_id: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                            required
                        >
                            <option value="">Seleccionar empleado</option>
                            {empleados.map((emp) => (
                                <option key={emp.id} value={emp.id}>
                                    {emp.nombre} ({emp.codigo})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Fecha */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                            Fecha de producción
                        </label>
                        <input
                            type="date"
                            value={formData.fecha}
                            max={new Date().toISOString().split('T')[0]} // 👈 bloquea futuras (opcional)
                            onChange={(e) =>
                                setFormData({ ...formData, fecha: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border
                                    text-foreground focus:border-accent-orange focus:outline-none"
                            required
                        />
                    </div>


                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                            Categoría
                        </label>
                        <select
                            value={categoriaSeleccionada}
                            onChange={(e) => {
                                setCategoriaSeleccionada(e.target.value);
                                setFormData({ ...formData, tipo_trabajo_id: '' });
                            }}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                            required
                        >
                            <option value="">Seleccionar categoría</option>
                            {categorias.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Tipo de Trabajo */}
                    {categoriaSeleccionada && (
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1.5">
                                Tipo de Trabajo
                            </label>
                            <select
                                value={formData.tipo_trabajo_id}
                                onChange={(e) =>
                                    setFormData({ ...formData, tipo_trabajo_id: e.target.value })
                                }
                                className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                                required
                            >
                                <option value="">Seleccionar tipo</option>
                                {tiposFiltrados.map(tipo => (
                                    <option key={tipo.id} value={tipo.id}>
                                        {tipo.nombre} – S/. {
                                            Number(tipo.tarifa_actual).toLocaleString('es-PE', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 3
                                            })
                                        }

                                    </option>
                                ))}
                            </select>
                        </div>
                    )}



                    {/* Cantidad */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Cantidad</label>
                        <input
                            type="number"
                            min="1"
                            step="1"
                            value={formData.cantidad}
                            onChange={(e) => setFormData({ ...formData, cantidad: parseInt(e.target.value) || 1 })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                            required
                        />
                    </div>

                    {/* Nota */}
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Nota (opcional)</label>
                        <textarea
                            value={formData.nota}
                            onChange={(e) => setFormData({ ...formData, nota: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none resize-none"
                            placeholder="Observaciones..."
                        />
                    </div>

                    {/* Preview */}
                    <div className="p-4 rounded-lg bg-glass border border-glass-border">
                        <div className="flex justify-between items-center">
                            <span className="text-foreground-muted">Tarifa aplicada:</span>
                            <span className="font-mono text-foreground">S/. {Number(tarifaAplicada).toLocaleString('es-PE', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 3
                            })}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="text-foreground-muted">Subtotal:</span>
                            <span className="font-mono text-lg font-bold text-accent-emerald">
                                S/. {subtotalCalculado.toFixed(2)}
                            </span>
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={saving || !formData.empleado_id || !formData.tipo_trabajo_id}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Registrar Producción'}
                    </button>
                </form>
            </Modal>
        </div>
    );
}
