'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ======================
   TIPOS
====================== */

export interface Movimiento {
    id: string;
    empleado_id: string;
    tipo: 'adelanto' | 'descuento' | 'ajuste' | 'bono';
    monto: number;
    signo: '+' | '-';
    fecha: string;
    ciclo_id: string | null;
    nota: string | null;
    created_at: string;
    empleado?: {
        id: string;
        nombre: string;
        codigo: string;
    };
}

export interface Ciclo {
    id: string;
    empleado_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    total_pagado: number;
    estado: 'ABIERTO' | 'CERRADO';
    created_at: string;
}

export interface Boleta {
    id: string;
    empleado_id: string;
    ciclo_id: string;
    total_produccion: number;
    total_adelantos: number;
    total_descuentos: number;
    total_neto: number;
    pagado: boolean;
    pagado_at: string | null;
    created_at: string;
    empleado?: {
        id: string;
        nombre: string;
        codigo: string;
    };
    ciclo?: Ciclo;
}

export interface EmpleadoPendiente {
    id: string;
    nombre: string;
    codigo: string;
    ultimo_pago_fecha: string | null;
    ultimo_pago_monto: number;
    total_produccion: number;
    total_adelantos: number;
    total_descuentos: number;
    neto_pendiente: number;
}

interface UsePagosReturn {
    // Empleados con pendiente
    empleadosPendientes: EmpleadoPendiente[];
    loadingEmpleados: boolean;
    fetchEmpleadosPendientes: () => Promise<void>;

    // Movimientos
    movimientos: Movimiento[];
    loadingMovimientos: boolean;
    crearMovimiento: (data: {
        empleado_id: string;
        tipo: Movimiento['tipo'];
        monto: number;
        signo: '+' | '-';
        fecha: string;
        nota?: string;
    }) => Promise<boolean>;
    eliminarMovimiento: (id: string) => Promise<boolean>;
    fetchMovimientos: (empleadoId?: string) => Promise<void>;

    // Pagos
    pagarEmpleado: (empleadoId: string, totalPagado: number) => Promise<boolean>;

    // Historial de ciclos por empleado
    fetchCiclosEmpleado: (empleadoId: string) => Promise<Ciclo[]>;

    // Boletas
    boletas: Boleta[];
    loadingBoletas: boolean;
    fetchBoletas: (empleadoId?: string) => Promise<void>;

    error: string | null;
    refetch: () => Promise<void>;
}

/* ======================
   HOOK
====================== */

export function usePagos(): UsePagosReturn {
    const supabase = createClient();

    const [empleadosPendientes, setEmpleadosPendientes] = useState<EmpleadoPendiente[]>([]);
    const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
    const [boletas, setBoletas] = useState<Boleta[]>([]);
    const [loadingEmpleados, setLoadingEmpleados] = useState(true);
    const [loadingMovimientos, setLoadingMovimientos] = useState(true);
    const [loadingBoletas, setLoadingBoletas] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /* ========= EMPLEADOS CON PENDIENTE ========= */
    const fetchEmpleadosPendientes = useCallback(async () => {
        try {
            setLoadingEmpleados(true);
            setError(null);

            // Get all active employees
            const { data: empleados, error: empError } = await supabase
                .from('empleados')
                .select('id, nombre, codigo')
                .eq('activo', true)
                .order('nombre');

            if (empError) throw empError;

            const pendientes: EmpleadoPendiente[] = [];

            for (const emp of empleados ?? []) {
                // Get último ciclo cerrado
                const { data: ultimoCiclo } = await supabase
                    .from('ciclos')
                    .select('fecha_fin, total_pagado')
                    .eq('empleado_id', emp.id)
                    .eq('estado', 'CERRADO')
                    .order('fecha_fin', { ascending: false })
                    .limit(1)
                    .single();

                const fechaDesde = ultimoCiclo?.fecha_fin || '1900-01-01';

                // Get producción pendiente
                const { data: prodData } = await supabase
                    .from('produccion')
                    .select('subtotal')
                    .eq('empleado_id', emp.id)
                    .gt('fecha', fechaDesde);

                const totalProduccion = (prodData ?? []).reduce((sum, p) => sum + (p.subtotal || 0), 0);

                // Get movimientos pendientes
                const { data: movData } = await supabase
                    .from('movimientos')
                    .select('monto, signo')
                    .eq('empleado_id', emp.id)
                    .gt('fecha', fechaDesde);

                let totalAdelantos = 0;
                let totalDescuentos = 0;

                (movData ?? []).forEach(m => {
                    if (m.signo === '+') {
                        totalAdelantos += m.monto;
                    } else {
                        totalDescuentos += m.monto;
                    }
                });

                const netoPendiente = totalProduccion - totalAdelantos - totalDescuentos;

                pendientes.push({
                    id: emp.id,
                    nombre: emp.nombre,
                    codigo: emp.codigo,
                    ultimo_pago_fecha: ultimoCiclo?.fecha_fin || null,
                    ultimo_pago_monto: ultimoCiclo?.total_pagado || 0,
                    total_produccion: totalProduccion,
                    total_adelantos: totalAdelantos,
                    total_descuentos: totalDescuentos,
                    neto_pendiente: netoPendiente,
                });
            }

            // Sort by pending amount (descending)
            pendientes.sort((a, b) => b.neto_pendiente - a.neto_pendiente);
            setEmpleadosPendientes(pendientes);

        } catch (err: any) {
            console.error('fetchEmpleadosPendientes error:', err);
            setError(err?.message ?? 'Error al cargar empleados');
        } finally {
            setLoadingEmpleados(false);
        }
    }, [supabase]);

    /* ========= MOVIMIENTOS ========= */
    const fetchMovimientos = useCallback(async (empleadoId?: string) => {
        try {
            setLoadingMovimientos(true);
            setError(null);

            let query = supabase
                .from('movimientos')
                .select(`
                    id,
                    empleado_id,
                    tipo,
                    monto,
                    signo,
                    fecha,
                    ciclo_id,
                    nota,
                    created_at,
                    empleado:empleados(id, nombre, codigo)
                `)
                .order('fecha', { ascending: false })
                .limit(50);

            if (empleadoId) {
                query = query.eq('empleado_id', empleadoId);
            }

            const { data, error } = await query;
            if (error) throw error;

            const formatted = (data ?? []).map((item: any) => ({
                ...item,
                empleado: Array.isArray(item.empleado) ? item.empleado[0] : item.empleado,
            }));

            setMovimientos(formatted);
        } catch (err: any) {
            console.error('fetchMovimientos error:', err);
            setError(err?.message ?? 'Error al cargar movimientos');
        } finally {
            setLoadingMovimientos(false);
        }
    }, [supabase]);

    const crearMovimiento = useCallback(async (data: {
        empleado_id: string;
        tipo: Movimiento['tipo'];
        monto: number;
        signo: '+' | '-';
        fecha: string;
        nota?: string;
    }): Promise<boolean> => {
        try {
            setError(null);

            const { error } = await supabase
                .from('movimientos')
                .insert({
                    empleado_id: data.empleado_id,
                    tipo: data.tipo,
                    monto: data.monto,
                    signo: data.signo,
                    fecha: data.fecha,
                    nota: data.nota || null,
                });

            if (error) throw error;

            await fetchMovimientos();
            await fetchEmpleadosPendientes();
            return true;
        } catch (err: any) {
            console.error('Error al crear movimiento:', err);
            setError(err?.message ?? 'Error al crear movimiento');
            return false;
        }
    }, [supabase, fetchMovimientos, fetchEmpleadosPendientes]);

    const eliminarMovimiento = useCallback(async (id: string): Promise<boolean> => {
        try {
            setError(null);

            const { error } = await supabase
                .from('movimientos')
                .delete()
                .eq('id', id);

            if (error) throw error;

            await fetchMovimientos();
            await fetchEmpleadosPendientes();
            return true;
        } catch (err: any) {
            console.error('Error al eliminar movimiento:', err);
            setError(err?.message ?? 'Error al eliminar movimiento');
            return false;
        }
    }, [supabase, fetchMovimientos, fetchEmpleadosPendientes]);

    /* ========= PAGAR EMPLEADO ========= */
    const pagarEmpleado = useCallback(async (empleadoId: string, totalPagado: number): Promise<boolean> => {
        try {
            setError(null);

            // Get último ciclo cerrado para fecha_inicio
            const { data: ultimoCiclo } = await supabase
                .from('ciclos')
                .select('fecha_fin')
                .eq('empleado_id', empleadoId)
                .eq('estado', 'CERRADO')
                .order('fecha_fin', { ascending: false })
                .limit(1)
                .single();

            let fechaInicio: string;

            if (ultimoCiclo?.fecha_fin) {
                fechaInicio = new Date(
                    new Date(ultimoCiclo.fecha_fin).getTime() + 86400000
                )
                    .toISOString()
                    .split('T')[0];
            } else {
                // buscar primera producción
                const { data: primeraProd } = await supabase
                    .from('produccion')
                    .select('fecha')
                    .eq('empleado_id', empleadoId)
                    .order('fecha', { ascending: true })
                    .limit(1)
                    .single();

                fechaInicio = primeraProd?.fecha ?? new Date().toISOString().split('T')[0];
            }

            const fechaFin = new Date().toISOString().split('T')[0];

            // Create new ciclo CERRADO
            const { data: nuevoCiclo, error: cicloError } = await supabase
                .from('ciclos')
                .insert({
                    empleado_id: empleadoId,
                    fecha_inicio: fechaInicio,
                    fecha_fin: fechaFin,
                    total_pagado: totalPagado,
                    estado: 'CERRADO',
                })
                .select()
                .single();

            if (cicloError) throw cicloError;

            // Get empleado pendiente info for boleta
            const emp = empleadosPendientes.find(e => e.id === empleadoId);

            if (emp && nuevoCiclo) {

                const { data: boletaCreada, error: boletaError } = await supabase
                    .from('boletas')
                    .upsert({
                        empleado_id: empleadoId,
                        ciclo_id: nuevoCiclo.id,
                        total_produccion: emp.total_produccion,
                        total_adelantos: emp.total_adelantos,
                        total_descuentos: emp.total_descuentos,
                        pagado: true,
                        pagado_at: new Date().toISOString(),
                    })
                    .select()
                    .single();

                if (boletaError) throw boletaError;

                // 🔥 LLAMAR BACKEND
                await fetch('/api/pagos/cerrar', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ cicloId: nuevoCiclo.id })
                });

            }


            await fetchEmpleadosPendientes();
            await fetchBoletas();
            return true;
        } catch (err: any) {
            console.error('Error al pagar empleado:', err);
            setError(err?.message ?? 'Error al procesar pago');
            return false;
        }
    }, [supabase, empleadosPendientes, fetchEmpleadosPendientes]);

    /* ========= CICLOS POR EMPLEADO ========= */
    const fetchCiclosEmpleado = useCallback(async (empleadoId: string): Promise<Ciclo[]> => {
        try {
            const { data, error } = await supabase
                .from('ciclos')
                .select('*')
                .eq('empleado_id', empleadoId)
                .order('fecha_fin', { ascending: false });

            if (error) throw error;
            return data ?? [];
        } catch (err: any) {
            console.error('fetchCiclosEmpleado error:', err);
            return [];
        }
    }, [supabase]);

    /* ========= BOLETAS ========= */
    const fetchBoletas = useCallback(async (empleadoId?: string) => {
        try {
            setLoadingBoletas(true);
            setError(null);

            let query = supabase
                .from('boletas')
                .select(`
                    id,
                    empleado_id,
                    ciclo_id,
                    total_produccion,
                    total_adelantos,
                    total_descuentos,
                    total_neto,
                    pagado,
                    pagado_at,
                    created_at,
                    empleado:empleados(id, nombre, codigo),
                    ciclo:ciclos(id, empleado_id, fecha_inicio, fecha_fin, total_pagado, estado)
                `)
                .order('created_at', { ascending: false });

            if (empleadoId) {
                query = query.eq('empleado_id', empleadoId);
            }

            const { data, error } = await query;
            if (error) throw error;

            const formatted = (data ?? []).map((item: any) => ({
                ...item,
                empleado: Array.isArray(item.empleado) ? item.empleado[0] : item.empleado,
                ciclo: Array.isArray(item.ciclo) ? item.ciclo[0] : item.ciclo,
            }));

            setBoletas(formatted);
        } catch (err: any) {
            console.error('fetchBoletas error:', err);
            setError(err?.message ?? 'Error al cargar boletas');
        } finally {
            setLoadingBoletas(false);
        }
    }, [supabase]);

    /* ========= REFETCH ========= */
    const refetch = useCallback(async () => {
        await fetchEmpleadosPendientes();
        await fetchMovimientos();
        await fetchBoletas();
    }, [fetchEmpleadosPendientes, fetchMovimientos, fetchBoletas]);

    /* ========= INITIAL LOAD ========= */
    useEffect(() => {
        refetch();
    }, []);

    return {
        empleadosPendientes,
        loadingEmpleados,
        fetchEmpleadosPendientes,

        movimientos,
        loadingMovimientos,
        crearMovimiento,
        eliminarMovimiento,
        fetchMovimientos,

        pagarEmpleado,
        fetchCiclosEmpleado,

        boletas,
        loadingBoletas,
        fetchBoletas,

        error,
        refetch,
    };
}
