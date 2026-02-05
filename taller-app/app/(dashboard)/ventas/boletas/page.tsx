'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function ListaBoletasPage() {

    const supabase = createClient();
    const [boletas, setBoletas] = useState<any[]>([]);

    async function cargarBoletas() {
        const { data } = await supabase
            .from('ventas_boletas')
            .select('*')
            .order('created_at', { ascending: false });

        setBoletas(data || []);
    }

    async function eliminarBoleta(id: string) {
        if (!confirm('¿Eliminar boleta?')) return;

        await supabase
            .from('ventas_boletas_detalle')
            .delete()
            .eq('boleta_id', id);

        await supabase
            .from('ventas_boletas')
            .delete()
            .eq('id', id);

        cargarBoletas();
    }

    useEffect(() => {
        cargarBoletas();
    }, []);

    return (
        <div className="max-w-6xl mx-auto space-y-6">

            <h1 className="text-2xl font-bold">Registro de Boletas</h1>

            <table className="w-full text-sm border">
                <thead className="bg-muted">
                    <tr>
                        <th>Serie</th>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Total</th>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>

                <tbody>
                    {boletas.map(b => (
                        <tr key={b.id} className="border-b">
                            <td>{b.serie}</td>
                            <td>{String(b.numero).padStart(8, '0')}</td>
                            <td>{b.cliente_nombre}</td>
                            <td>S/. {Number(b.total).toFixed(2)}</td>
                            <td>{new Date(b.created_at).toLocaleDateString()}</td>

                            <td className="space-x-2">

                                <a
                                    href={`/api/ventas/boleta/${b.id}`}
                                    target="_blank"
                                    className="text-blue-500"
                                >
                                    Ver PDF
                                </a>

                                <Link
                                    href={`/ventas/boleta/${b.id}`}
                                    className="text-yellow-500"
                                >
                                    Editar
                                </Link>

                                <button
                                    onClick={() => eliminarBoleta(b.id)}
                                    className="text-red-500"
                                >
                                    Eliminar
                                </button>

                            </td>
                        </tr>
                    ))}
                </tbody>

            </table>

        </div>
    );
}
