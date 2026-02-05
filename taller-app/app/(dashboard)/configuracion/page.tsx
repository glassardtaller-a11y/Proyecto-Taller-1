'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { useTiposTrabajo, useTurnos, useConfiguracion } from '@/hooks';
import type { TipoTrabajo } from '@/hooks/useTiposTrabajo';
import type { Turno } from '@/hooks/useTurnos';

// =============================================
// SKELETON LOADERS
// =============================================
function SkeletonList() {
    return (
        <div className="animate-pulse space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="h-14 bg-glass rounded-lg"></div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-glass-heavy border border-glass-border rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-glass transition-colors text-foreground-muted"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
}

// =============================================
// TOGGLE SWITCH COMPONENT
// =============================================
interface ToggleProps {
    checked: boolean;
    onChange: (value: boolean) => void;
    loading?: boolean;
}

function Toggle({ checked, onChange, loading }: ToggleProps) {
    return (
        <button
            onClick={() => !loading && onChange(!checked)}
            className={`w-12 h-6 rounded-full relative transition-colors ${loading ? 'opacity-50' : ''
                } ${checked ? 'bg-accent-orange' : 'bg-glass-active'}`}
            disabled={loading}
        >
            <span
                className={`absolute top-1 w-4 h-4 rounded-full transition-all ${checked ? 'right-1 bg-white' : 'left-1 bg-foreground-muted'
                    }`}
            />
        </button>
    );
}

// =============================================
// TIPOS DE TRABAJO SECTION
// =============================================
function TiposTrabajoSection() {
    const { tiposTrabajo, loading, crear, actualizar, eliminar } = useTiposTrabajo();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<TipoTrabajo | null>(null);
    const [formData, setFormData] = useState({ nombre: '', descripcion: '', tarifa_actual: 0, activo: true });
    const [saving, setSaving] = useState(false);

    const openCreate = () => {
        setEditingItem(null);
        setFormData({ nombre: '', descripcion: '', tarifa_actual: 0, activo: true });
        setModalOpen(true);
    };

    const openEdit = (item: TipoTrabajo) => {
        setEditingItem(item);
        setFormData({
            nombre: item.nombre,
            descripcion: item.descripcion || '',
            tarifa_actual: item.tarifa_actual || 0,
            activo: item.activo
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const success = editingItem
            ? await actualizar(editingItem.id, formData)
            : await crear(formData);

        if (success) {
            setModalOpen(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este tipo de trabajo?')) {
            await eliminar(id);
        }
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Tipos de Trabajo</CardTitle>
                        <button
                            onClick={openCreate}
                            className="text-sm text-accent-orange hover:underline"
                        >
                            Agregar
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <SkeletonList />
                    ) : tiposTrabajo.length === 0 ? (
                        <p className="text-center text-foreground-muted py-4">No hay tipos de trabajo registrados</p>
                    ) : (
                        <div className="space-y-3">
                            {tiposTrabajo.map((tipo) => (
                                <div key={tipo.id} className="flex items-center justify-between p-3 rounded-lg bg-glass border border-glass-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{tipo.nombre}</p>
                                        <p className="text-xs text-foreground-muted">{tipo.descripcion || 'Sin categoría'}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-mono text-accent-emerald">
                                            S/. {Number(tipo.tarifa_actual || 0).toLocaleString('es-PE', {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 3
                                            })}
                                        </span>
                                        <button
                                            onClick={() => openEdit(tipo)}
                                            className="p-1 rounded hover:bg-glass-hover transition-colors text-foreground-muted"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(tipo.id)}
                                            className="p-1 rounded hover:bg-glass-hover transition-colors text-accent-rose"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? 'Editar Tipo de Trabajo' : 'Nuevo Tipo de Trabajo'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Nombre</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Categoría</label>
                        <input
                            type="text"
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                            placeholder="Ej: Confección, Acabados..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Tarifa (S/.)</label>
                        <input
                            type="number"
                            step="0.001"
                            min="0"
                            value={formData.tarifa_actual}
                            onChange={(e) => setFormData({ ...formData, tarifa_actual: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-glass border border-glass-border">
                        <span className="text-sm text-foreground">Activo</span>
                        <Toggle
                            checked={formData.activo}
                            onChange={(value) => setFormData({ ...formData, activo: value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
                    </button>
                </form>
            </Modal>
        </>
    );
}

// =============================================
// TURNOS SECTION
// =============================================
function TurnosSection() {
    const { turnos, loading, crear, actualizar, eliminar } = useTurnos();
    const [modalOpen, setModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Turno | null>(null);
    const [formData, setFormData] = useState({ nombre: '', hora_inicio: '08:00', hora_fin: '13:00', tolerancia_minutos: 15, activo: true });
    const [saving, setSaving] = useState(false);

    const openCreate = () => {
        setEditingItem(null);
        setFormData({ nombre: '', hora_inicio: '08:00', hora_fin: '13:00', tolerancia_minutos: 15, activo: true });
        setModalOpen(true);
    };

    const openEdit = (item: Turno) => {
        setEditingItem(item);
        setFormData({
            nombre: item.nombre,
            hora_inicio: item.hora_inicio?.substring(0, 5) || '08:00',
            hora_fin: item.hora_fin?.substring(0, 5) || '13:00',
            tolerancia_minutos: item.tolerancia_minutos || 15,
            activo: item.activo
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        const success = editingItem
            ? await actualizar(editingItem.id, formData)
            : await crear(formData);

        if (success) {
            setModalOpen(false);
        }
        setSaving(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de eliminar este turno?')) {
            await eliminar(id);
        }
    };

    const formatTime = (time: string | null) => {
        if (!time) return '--:--';
        return time.substring(0, 5);
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle>Turnos</CardTitle>
                        <button
                            onClick={openCreate}
                            className="text-sm text-accent-orange hover:underline"
                        >
                            Agregar
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <SkeletonList />
                    ) : turnos.length === 0 ? (
                        <p className="text-center text-foreground-muted py-4">No hay turnos registrados</p>
                    ) : (
                        <div className="space-y-3">
                            {turnos.map((turno) => (
                                <div key={turno.id} className="flex items-center justify-between p-3 rounded-lg bg-glass border border-glass-border">
                                    <div>
                                        <p className="text-sm font-medium text-foreground">{turno.nombre}</p>
                                        <p className="text-xs text-foreground-muted">
                                            {formatTime(turno.hora_inicio)} - {formatTime(turno.hora_fin)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-foreground-subtle">
                                            Tolerancia: {turno.tolerancia_minutos} min
                                        </span>
                                        <button
                                            onClick={() => openEdit(turno)}
                                            className="p-1 rounded hover:bg-glass-hover transition-colors text-foreground-muted"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={() => handleDelete(turno.id)}
                                            className="p-1 rounded hover:bg-glass-hover transition-colors text-accent-rose"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                title={editingItem ? 'Editar Turno' : 'Nuevo Turno'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Nombre</label>
                        <input
                            type="text"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                            required
                            placeholder="Ej: Mañana, Tarde..."
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1.5">Hora Inicio</label>
                            <input
                                type="time"
                                value={formData.hora_inicio}
                                onChange={(e) => setFormData({ ...formData, hora_inicio: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground-muted mb-1.5">Hora Fin</label>
                            <input
                                type="time"
                                value={formData.hora_fin}
                                onChange={(e) => setFormData({ ...formData, hora_fin: e.target.value })}
                                className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Tolerancia (minutos)</label>
                        <input
                            type="number"
                            min="0"
                            max="60"
                            value={formData.tolerancia_minutos}
                            onChange={(e) => setFormData({ ...formData, tolerancia_minutos: parseInt(e.target.value) || 0 })}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                        />
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-glass border border-glass-border">
                        <span className="text-sm text-foreground">Activo</span>
                        <Toggle
                            checked={formData.activo}
                            onChange={(value) => setFormData({ ...formData, activo: value })}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
                    </button>
                </form>
            </Modal>
        </>
    );
}

// =============================================
// CICLOS CONFIG SECTION
// =============================================
function CiclosConfigSection() {
    const { ciclosConfig, loading, updateCiclosConfig } = useConfiguracion();
    const [saving, setSaving] = useState(false);
    const [tipo, setTipo] = useState<'semanal' | 'quincenal' | 'mensual'>('semanal');
    const [diaInicio, setDiaInicio] = useState(1);

    // Update local state when data loads
    useState(() => {
        if (ciclosConfig) {
            setTipo(ciclosConfig.tipo);
            setDiaInicio(ciclosConfig.dia_inicio);
        }
    });

    const handleSave = async () => {
        setSaving(true);
        await updateCiclosConfig({ tipo, dia_inicio: diaInicio });
        setSaving(false);
    };

    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Configuración de Ciclos</CardTitle>
                </CardHeader>
                <CardContent>
                    <SkeletonList />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Configuración de Ciclos</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Tipo de ciclo</label>
                        <select
                            value={tipo}
                            onChange={(e) => setTipo(e.target.value as 'semanal' | 'quincenal' | 'mensual')}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                        >
                            <option value="semanal">Semanal</option>
                            <option value="quincenal">Quincenal</option>
                            <option value="mensual">Mensual</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground-muted mb-1.5">Día de inicio</label>
                        <select
                            value={diaInicio}
                            onChange={(e) => setDiaInicio(parseInt(e.target.value))}
                            className="w-full px-4 py-2 rounded-lg bg-glass border border-glass-border text-foreground focus:border-accent-orange focus:outline-none"
                        >
                            {dias.map((dia, index) => (
                                <option key={index + 1} value={index + 1}>{dia}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-accent-orange to-accent-amber text-white font-medium hover:shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-all disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </CardContent>
        </Card>
    );
}

// =============================================
// AJUSTES GENERALES SECTION
// =============================================
function AjustesGeneralesSection() {
    const { getSetting, updateSetting, loading, settings } = useConfiguracion();
    const [updating, setUpdating] = useState<string | null>(null);

    const handleToggle = async (clave: string, currentValue: boolean) => {
        setUpdating(clave);
        await updateSetting(clave, (!currentValue).toString());
        setUpdating(null);
    };

    const settingsConfig = [
        { clave: 'notificaciones_activas', label: 'Notificaciones', description: 'Recibir alertas de asistencia' },
        { clave: 'auto_cierre_ciclo', label: 'Auto-cierre de ciclo', description: 'Cerrar ciclo automáticamente' },
        { clave: 'modo_oscuro', label: 'Modo oscuro', description: 'Tema de la aplicación' },
    ];

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Ajustes Generales</CardTitle>
                </CardHeader>
                <CardContent>
                    <SkeletonList />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ajustes Generales</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {settingsConfig.map((config) => {
                        const currentValue = getSetting(config.clave) as boolean;
                        return (
                            <div key={config.clave} className="flex items-center justify-between p-3 rounded-lg bg-glass border border-glass-border">
                                <div>
                                    <p className="text-sm font-medium text-foreground">{config.label}</p>
                                    <p className="text-xs text-foreground-muted">{config.description}</p>
                                </div>
                                <Toggle
                                    checked={currentValue ?? false}
                                    onChange={() => handleToggle(config.clave, currentValue ?? false)}
                                    loading={updating === config.clave}
                                />
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}

// =============================================
// MAIN PAGE
// =============================================
export default function ConfiguracionPage() {
    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
                <p className="text-foreground-muted mt-1">
                    Ajustes del sistema y preferencias
                </p>
            </div>

            {/* Settings Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <TiposTrabajoSection />
                <TurnosSection />
                <CiclosConfigSection />
                <AjustesGeneralesSection />
            </div>
        </div>
    );
}
