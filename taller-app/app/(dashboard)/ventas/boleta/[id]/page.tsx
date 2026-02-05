'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EditarBoletaPage() {

    const { id } = useParams();
    const router = useRouter();
    const supabase = createClient();

    const [cliente, setCliente] = useState('');
    const [items, setItems] = useState<any[]>([]);

    useEffect(() => {
        cargar();
    }, []);

    async function cargar() {

        const { data: boleta } = await supabase
            .from('ventas_boletas')
            .select('*')
            .eq('id', id)
            .single();

        const { data: detalle } = await supabase
            .from('ventas_boletas_detalle')
            .select('*')
            .eq('boleta_id', id);

        setCliente(boleta.cliente_nombre);
        setItems(detalle || []);
    }

    async function guardarCambios() {

        const total = items.reduce(
            (s, i) => s + i.cantidad * i.precio_unitario,
            0
        );

        const subtotal = total / 1.18;
        const igv = total - subtotal;

        await supabase
            .from('ventas_boletas')
            .update({ subtotal, igv, total })
            .eq('id', id);

        await supabase
            .from('ventas_boletas_detalle')
            .delete()
            .eq('boleta_id', id);

        await supabase
            .from('ventas_boletas_detalle')
            .insert(
                items.map(i => ({
                    boleta_id: id,
                    descripcion: i.descripcion,
                    cantidad: i.cantidad,
                    precio_unitario: i.precio_unitario,
                    total: i.cantidad * i.precio_unitario
                }))
            );

        alert('Boleta actualizada');
        router.push('/ventas/boletas');
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            <h1 className="text-xl font-bold">Editar Boleta</h1>

            <input
                className="input"
                value={cliente}
                onChange={e => setCliente(e.target.value)}
            />

            <button
                onClick={guardarCambios}
                className="bg-accent-rose px-4 py-2 rounded text-white"
            >
                Guardar Cambios
            </button>

        </div>
    );
}
