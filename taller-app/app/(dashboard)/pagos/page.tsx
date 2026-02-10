'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, StatCard } from '@/components/ui';
import { usePagos, useEmpleados } from '@/hooks';
import type { Movimiento, EmpleadoPendiente, Ciclo } from '@/hooks/usePagos';

// =============================================
// SKELETON LOADERS
// =============================================
function SkeletonCard() {
    return (
        <div className="animate-pulse p-4 rounded-2xl bg-glass border border-glass-border">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-glass"></div>
                <div className="flex-1">
                    <div className="h-5 bg-glass rounded w-32 mb-2"></div>
                    <div className="h-4 bg-glass rounded w-24"></div>
                </div>
                <div className="h-10 bg-glass rounded w-24"></div>
            </div>
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
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-glass-heavy border border-glass-border rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl max-h-[calc(100vh-8rem)] overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
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
export default function PagosPage() {
    const {
        empleadosPendientes,
        loadingEmpleados,
        fetchEmpleadosPendientes,

        movimientos,
        loadingMovimientos,
        crearMovimiento,
        eliminarMovimiento,

        pagarEmpleado,
        fetchCiclosEmpleado,

        boletas,
        error,
    } = usePagos();

    const { empleados } = useEmpleados(true);

    // State
    const [pagarModalOpen, setPagarModalOpen] = useState(false);
    const [movimientoModalOpen, setMovimientoModalOpen] = useState(false);
    const [historialModalOpen, setHistorialModalOpen] = useState(false);
    const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<EmpleadoPendiente | null>(null);
    const [historialCiclos, setHistorialCiclos] = useState<Ciclo[]>([]);
    const [saving, setSaving] = useState(false);

    const [movFormData, setMovFormData] = useState({
        empleado_id: '',
        tipo: 'adelanto' as Movimiento['tipo'],
        monto: 0,
        nota: '',
    });

    // Stats
    const totalPendienteGlobal = empleadosPendientes.reduce((sum, e) => sum + Math.max(0, e.neto_pendiente), 0);
    const empleadosConPendiente = empleadosPendientes.filter(e => e.neto_pendiente > 0).length;

    // Open pagar modal
    const openPagarModal = (emp: EmpleadoPendiente) => {
        setEmpleadoSeleccionado(emp);
        setPagarModalOpen(true);
    };

    // Confirm payment
    const handleConfirmarPago = async () => {
        if (!empleadoSeleccionado) return;

        setSaving(true);
        const success = await pagarEmpleado(
            empleadoSeleccionado.id,
            empleadoSeleccionado.neto_pendiente
        );

        if (success) {
            setPagarModalOpen(false);
            setEmpleadoSeleccionado(null);
        }
        setSaving(false);
    };

    // Open movimiento modal
    const openMovimientoModal = () => {
        setMovFormData({
            empleado_id: empleados[0]?.id || '',
            tipo: 'adelanto',
            monto: 0,
            nota: '',
        });
        setMovimientoModalOpen(true);
    };

    // Submit movimiento
    const handleMovimientoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!movFormData.empleado_id || movFormData.monto <= 0) return;

        setSaving(true);
        const signo = movFormData.tipo === 'bono' ? '+' : '-';

        const success = await crearMovimiento({
            empleado_id: movFormData.empleado_id,
            tipo: movFormData.tipo,
            monto: movFormData.monto,
            signo,
            fecha: new Date().toISOString().split('T')[0],
            nota: movFormData.nota || undefined,
        });

        if (success) {
            setMovimientoModalOpen(false);
        }
        setSaving(false);
    };

    // Open historial modal
    const openHistorialModal = async (emp: EmpleadoPendiente) => {
        setEmpleadoSeleccionado(emp);
        const ciclos = await fetchCiclosEmpleado(emp.id);
        setHistorialCiclos(ciclos);
        setHistorialModalOpen(true);
    };

    // Delete movimiento
    const handleDeleteMovimiento = async (id: string) => {
        if (confirm('¿Eliminar este movimiento?')) {
            await eliminarMovimiento(id);
        }
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return 'Sin pagos';
        const date = new Date(dateStr);
        return date.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatMoney = (amount: number) => `S/. ${amount.toFixed(2)}`;

    return (
        <div className="space-y-6 animate-fade-in pb-[calc(4rem+env(safe-area-inset-bottom))]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pagos por Empleado</h1>
                    <p className="text-foreground-muted mt-1">
                        Gestión de pagos individuales y ciclos de cada empleado
                    </p>
                </div>
                <button
                    onClick={openMovimientoModal}
                    className="px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground font-medium hover:bg-glass-hover transition-colors"
                >
                    + Nuevo Movimiento
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                    title="Total Pendiente"
                    value={formatMoney(totalPendienteGlobal)}
                    description="Suma de todos los empleados"
                    accentColor="orange"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Empleados con Pendiente"
                    value={empleadosConPendiente.toString()}
                    description={`de ${empleadosPendientes.length} activos`}
                    accentColor="violet"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    }
                />
                <StatCard
                    title="Boletas Generadas"
                    value={boletas.length.toString()}
                    description="Total histórico"
                    accentColor="emerald"
                    icon={
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    }
                />
            </div>

            {/* Error State */}
            {error && (
                <Card>
                    <div className="text-center py-4">
                        <p className="text-accent-rose font-medium">Error: {error}</p>
                    </div>
                </Card>
            )}

            {/* Employee List */}
            <Card padding="none">
                <CardHeader className="px-6 pt-6">
                    <CardTitle>Empleados y Pendientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingEmpleados ? (
                        <div className="p-6 space-y-4">
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </div>
                    ) : empleadosPendientes.length === 0 ? (
                        <div className="text-center py-12 text-foreground-muted">
                            <p>No hay empleados activos</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-glass-border">
                            {empleadosPendientes.map((emp) => (
                                <div key={emp.id} className="p-4 sm:p-6 hover:bg-glass transition-colors">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        {/* Employee Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-orange/20 to-accent-amber/20 flex items-center justify-center text-sm font-bold text-accent-orange">
                                                {emp.nombre.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-foreground">{emp.nombre}</p>
                                                <p className="text-sm text-foreground-muted">{emp.codigo}</p>
                                            </div>
                                        </div>

                                        {/* Payment Info */}
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                                            {/* Último pago */}
                                            <div className="text-sm">
                                                <p className="text-foreground-muted">Último pago</p>
                                                <p className="font-medium text-foreground">
                                                    {formatDate(emp.ultimo_pago_fecha)}
                                                    {emp.ultimo_pago_monto > 0 && (
                                                        <span className="text-foreground-muted ml-1">
                                                            ({formatMoney(emp.ultimo_pago_monto)})
                                                        </span>
                                                    )}
                                                </p>
                                            </div>

                                            {/* Detalles */}
                                            <div className="text-sm">
                                                <p className="text-foreground-muted">Producción</p>
                                                <p className="font-mono text-accent-emerald">
                                                    +{formatMoney(emp.total_produccion)}
                                                </p>
                                            </div>

                                            {emp.total_descuentos > 0 && (
                                                <div className="text-sm">
                                                    <p className="text-foreground-muted">Descuentos</p>
                                                    <p className="font-mono text-accent-rose">
                                                        -{formatMoney(emp.total_descuentos)}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Neto */}
                                            <div className="text-sm">
                                                <p className="text-foreground-muted">Neto Pendiente</p>
                                                <p className={`font-mono font-bold text-lg ${emp.neto_pendiente >= 0 ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                                                    {formatMoney(emp.neto_pendiente)}
                                                </p>
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openHistorialModal(emp)}
                                                    className="px-3 py-2 rounded-lg bg-glass border border-glass-border text-sm text-foreground hover:bg-glass-hover transition-colors"
                                                >
                                                    Historial
                                                </button>
                                                <button
                                                    onClick={() => openPagarModal(emp)}
                                                    disabled={emp.neto_pendiente <= 0}
                                                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white text-sm font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Pagar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Recent Movements */}
            <Card padding="none">
                <CardHeader className="px-6 pt-6">
                    <CardTitle>Movimientos Recientes</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loadingMovimientos ? (
                        <div className="p-6">
                            <SkeletonCard />
                        </div>
                    ) : movimientos.length === 0 ? (
                        <div className="text-center py-8 text-foreground-muted">
                            <p>No hay movimientos registrados</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-glass-border">
                            {movimientos.slice(0, 8).map((mov) => (
                                <div key={mov.id} className="flex items-center justify-between px-6 py-4 hover:bg-glass transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${mov.signo === '+' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-rose/10 text-accent-rose'}`}>
                                            {mov.signo === '+' ? '↑' : '↓'}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-foreground">
                                                {mov.empleado?.nombre || 'Empleado'}
                                            </p>
                                            <p className="text-xs text-foreground-muted capitalize">
                                                {mov.tipo} • {formatDate(mov.fecha)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className={`text-sm font-semibold font-mono ${mov.signo === '+' ? 'text-accent-emerald' : 'text-accent-rose'}`}>
                                            {mov.signo} {formatMoney(mov.monto)}
                                        </p>
                                        <button
                                            onClick={() => handleDeleteMovimiento(mov.id)}
                                            className="p-1 rounded hover:bg-glass-hover transition-colors text-foreground-muted"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal Pagar */}
            <Modal isOpen={pagarModalOpen} onClose={() => setPagarModalOpen(false)} title="Confirmar Pago">
                {empleadoSeleccionado && (
                    <div className="space-y-4">
                        <div className="p-4 rounded-lg bg-glass border border-glass-border">
                            <p className="text-lg font-semibold text-foreground">{empleadoSeleccionado.nombre}</p>
                            <p className="text-sm text-foreground-muted">{empleadoSeleccionado.codigo}</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-foreground-muted">Producción:</span>
                                <span className="font-mono text-accent-emerald">+{formatMoney(empleadoSeleccionado.total_produccion)}</span>
                            </div>
                            {empleadoSeleccionado.total_adelantos > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-muted">Bonos/Adelantos:</span>
                                    <span className="font-mono text-accent-emerald">+{formatMoney(empleadoSeleccionado.total_adelantos)}</span>
                                </div>
                            )}
                            {empleadoSeleccionado.total_descuentos > 0 && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-foreground-muted">Descuentos:</span>
                                    <span className="font-mono text-accent-rose">-{formatMoney(empleadoSeleccionado.total_descuentos)}</span>
                                </div>
                            )}
                            <hr className="border-glass-border" />
                            <div className="flex justify-between">
                                <span className="font-semibold text-foreground">Total a Pagar:</span>
                                <span className="font-mono font-bold text-xl text-accent-emerald">
                                    {formatMoney(empleadoSeleccionado.neto_pendiente)}
                                </span>
                            </div>
                        </div>

                        <div className="p-3 rounded-lg bg-accent-orange/10 border border-accent-orange/20">
                            <p className="text-sm text-accent-orange">
                                ⚠️ Al confirmar, se cerrará el ciclo actual y se generará una boleta de pago.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setPagarModalOpen(false)}
                                className="flex-1 px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground font-medium hover:bg-glass-hover transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmarPago}
                                disabled={saving}
                                className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-emerald to-accent-sky text-white font-medium hover:shadow-lg transition-all disabled:opacity-50"
                            >
                                {saving ? 'Procesando...' : 'Confirmar Pago'}
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Modal Movimiento */}
            <Modal isOpen={movimientoModalOpen} onClose={() => setMovimientoModalOpen(false)} title="Nuevo Movimiento">
                <form onSubmit={handleMovimientoSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Empleado</label>
                        <select
                            value={movFormData.empleado_id}
                            onChange={(e) => setMovFormData({ ...movFormData, empleado_id: e.target.value })}
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

                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Tipo</label>
                        <select
                            value={movFormData.tipo}
                            onChange={(e) => setMovFormData({ ...movFormData, tipo: e.target.value as Movimiento['tipo'] })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                        >
                            <option value="adelanto">Adelanto (-)</option>
                            <option value="descuento">Descuento (-)</option>
                            <option value="bono">Bono (+)</option>
                            <option value="ajuste">Ajuste (-)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Monto (S/.)</label>
                        <input
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={movFormData.monto}
                            onChange={(e) => setMovFormData({ ...movFormData, monto: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Nota (opcional)</label>
                        <textarea
                            value={movFormData.nota}
                            onChange={(e) => setMovFormData({ ...movFormData, nota: e.target.value })}
                            rows={2}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none resize-none"
                            placeholder="Motivo del movimiento..."
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={saving || !movFormData.empleado_id || movFormData.monto <= 0}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Registrar Movimiento'}
                    </button>
                </form>
            </Modal>

            {/* Modal Historial */}
            <Modal isOpen={historialModalOpen} onClose={() => setHistorialModalOpen(false)} title={`Historial - ${empleadoSeleccionado?.nombre || ''}`}>
                {historialCiclos.length === 0 ? (
                    <div className="text-center py-8 text-foreground-muted">
                        <p>No hay pagos anteriores</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {historialCiclos.map((ciclo) => {
                            // Find boleta for this ciclo
                            const boleta = boletas.find(b => b.ciclo_id === ciclo.id);

                            const handleDownloadPDF = () => {
                                if (!boleta) {
                                    alert('No se encontró la boleta para este ciclo');
                                    return;
                                }

                                window.open(`/api/boletas/${boleta.id}/pdf`, '_blank');
                            };


                            return (
                                <div key={ciclo.id} className="p-4 rounded-lg bg-glass border border-glass-border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-sm text-foreground-muted">
                                                {formatDate(ciclo.fecha_inicio)} → {formatDate(ciclo.fecha_fin)}
                                            </p>
                                            <p className="font-mono font-semibold text-foreground mt-1">
                                                {formatMoney(ciclo.total_pagado)}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded text-xs font-medium ${ciclo.estado === 'CERRADO' ? 'bg-accent-emerald/10 text-accent-emerald' : 'bg-accent-orange/10 text-accent-orange'}`}>
                                                {ciclo.estado}
                                            </span>
                                            {boleta && ciclo.estado === 'CERRADO' && (
                                                <button
                                                    onClick={handleDownloadPDF}
                                                    className="px-2 py-1 rounded text-xs font-medium bg-accent-violet/10 text-accent-violet hover:bg-accent-violet/20 transition-colors"
                                                    title="Descargar boleta PDF"
                                                >
                                                    📄 PDF
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Modal>
        </div>
    );
}
