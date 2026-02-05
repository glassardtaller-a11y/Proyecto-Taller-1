'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useParams, useRouter } from 'next/navigation';

export default function EditarBoletaPage() {

    const supabase = createClient();
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [cliente, setCliente] = useState('');
    const [documento, setDocumento] = useState('');
    const [direccion, setDireccion] = useState('');
    const [items, setItems] = useState<any[]>([]);

    /* ===========================
       CARGAR BOLETA
    =========================== */
    useEffect(() => {
        cargarBoleta();
    }, []);

    async function cargarBoleta() {

        const { data: boleta } = await supabase
            .from('ventas_boletas')
            .select('*')
            .eq('id', id)
            .single();

        const { data: detalle } = await supabase
            .from('ventas_boletas_detalle')
            .select('*')
            .eq('boleta_id', id);

        if (boleta) {
            setCliente(boleta.cliente_nombre);
            setDocumento(boleta.cliente_documento || '');
            setDireccion(boleta.cliente_direccion || '');
        }

        setItems(detalle || []);
    }

    /* ===========================
       HELPERS
    =========================== */

    function addItem() {
        setItems([...items, {
            descripcion: '',
            cantidad: 1,
            precio_unitario: 0
        }]);
    }

    function updateItem(i: number, field: string, value: any) {
        const copy = [...items];
        copy[i][field] = value;
        setItems(copy);
    }

    function removeItem(i: number) {
        setItems(items.filter((_, index) => index !== i));
    }

    const total = items.reduce(
        (s, i) => s + i.cantidad * i.precio_unitario,
        0
    );

    const subtotal = total / 1.18;
    const igv = total - subtotal;

    /* ===========================
       GUARDAR CAMBIOS
    =========================== */
    async function guardarCambios() {

        await supabase
            .from('ventas_boletas')
            .update({
                cliente_nombre: cliente,
                cliente_documento: documento,
                cliente_direccion: direccion,
                subtotal,
                igv,
                total
            })
            .eq('id', id);

        // Borrar detalle anterior
        await supabase
            .from('ventas_boletas_detalle')
            .delete()
            .eq('boleta_id', id);

        // Insertar nuevo detalle
        const nuevos = items.map(it => ({
            boleta_id: id,
            descripcion: it.descripcion,
            cantidad: it.cantidad,
            precio_unitario: it.precio_unitario,
            total: it.cantidad * it.precio_unitario
        }));

        await supabase
            .from('ventas_boletas_detalle')
            .insert(nuevos);

        alert('Boleta actualizada');
        router.push('/ventas/boletas');
    }

    /* ===========================
       UI
    =========================== */

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            <h1 className="text-2xl font-bold">Editar Boleta</h1>

            {/* CLIENTE */}
            <div className="bg-glass p-6 rounded-xl space-y-4">

                <div className="grid grid-cols-3 gap-4">

                    <input
                        className="input"
                        value={cliente}
                        onChange={e => setCliente(e.target.value)}
                        placeholder="Cliente"
                    />

                    <input
                        className="input"
                        value={documento}
                        onChange={e => setDocumento(e.target.value)}
                        placeholder="DNI / RUC"
                    />

                    <input
                        className="input"
                        value={direccion}
                        onChange={e => setDireccion(e.target.value)}
                        placeholder="Dirección"
                    />

                </div>

            </div>

            {/* DETALLE */}
            <div className="bg-glass p-6 rounded-xl space-y-4">

                <div className="grid grid-cols-5 font-semibold text-sm">
                    <div>Descripción</div>
                    <div>Cant</div>
                    <div>P/U</div>
                    <div>Total</div>
                    <div></div>
                </div>

                {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2">

                        <input
                            className="input"
                            value={it.descripcion}
                            onChange={e => updateItem(i, 'descripcion', e.target.value)}
                        />

                        <input
                            type="number"
                            className="input"
                            value={it.cantidad}
                            onChange={e => updateItem(i, 'cantidad', Number(e.target.value))}
                        />

                        <input
                            type="number"
                            className="input"
                            value={it.precio_unitario}
                            onChange={e => updateItem(i, 'precio_unitario', Number(e.target.value))}
                        />

                        <div className="flex items-center">
                            S/. {(it.cantidad * it.precio_unitario).toFixed(2)}
                        </div>

                        <button
                            onClick={() => removeItem(i)}
                            className="text-red-500"
                        >
                            ✕
                        </button>

                    </div>
                ))}

                <button
                    onClick={addItem}
                    className="bg-accent-violet px-4 py-2 rounded-lg text-white"
                >
                    + Agregar Producto
                </button>

            </div>

            {/* TOTALES */}
            <div className="bg-glass p-6 rounded-xl text-right">

                <div>Subtotal: S/. {subtotal.toFixed(2)}</div>
                <div>IGV (18%): S/. {igv.toFixed(2)}</div>

                <div className="text-xl font-bold">
                    Total: S/. {total.toFixed(2)}
                </div>

            </div>

            {/* BOTÓN */}
            <div className="text-right">
                <button
                    onClick={guardarCambios}
                    className="bg-accent-rose px-6 py-3 rounded-lg text-white text-lg"
                >
                    Guardar Cambios
                </button>
            </div>

        </div>
    );
}

