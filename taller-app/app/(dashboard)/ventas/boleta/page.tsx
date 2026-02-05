'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';


export default function BoletaVentaPage() {
    const supabase = createClient();

    const [cliente, setCliente] = useState('');
    const [documento, setDocumento] = useState('');
    const [direccion, setDireccion] = useState('');
    const [items, setItems] = useState<any[]>([]);



    async function guardarBoletaVenta() {
        if (!cliente || items.length === 0) {
            alert('Completa los datos obligatorios');
            return;
        }

        const { data, error } = await supabase
            .from('ventas_boletas')
            .insert({
                cliente_nombre: cliente,
                cliente_documento: documento,
                cliente_direccion: direccion,
                subtotal,
                igv,
                total
            })
            .select()
            .single();

        if (error) {
            console.error(error);
            alert('Error al guardar boleta');
            return;
        }

        const detalles = items.map(it => ({
            boleta_id: data.id,
            descripcion: it.descripcion,
            cantidad: it.cantidad,
            precio_unitario: it.precio,
            total: it.cantidad * it.precio
        }));

        await supabase
            .from('ventas_boletas_detalle')
            .insert(detalles);

        window.open(`/api/ventas/boleta/${data.id}`, '_blank');
    }



    function addItem() {
        setItems([...items, {
            descripcion: '',
            cantidad: 1,
            precio: 0
        }]);
    }

    function updateItem(i: number, field: string, value: any) {
        const copy = [...items];
        copy[i][field] = value;
        setItems(copy);
    }

    const subtotal = items.reduce(
        (s, i) => s + i.cantidad * i.precio,
        0
    );

    const igv = subtotal * 0.18;
    const total = subtotal + igv;

    return (
        <div className="space-y-6">

            <h1 className="text-2xl font-bold">Nueva Boleta de Venta</h1>

            {/* Cliente */}
            <div className="grid grid-cols-3 gap-4">
                <input
                    placeholder="Cliente"
                    className="input"
                    value={cliente}
                    onChange={e => setCliente(e.target.value)}
                />
                <input
                    placeholder="DNI / RUC"
                    className="input"
                    value={documento}
                    onChange={e => setDocumento(e.target.value)}
                />
            </div>

            {/* Items */}
            <div className="space-y-2">
                {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-4 gap-2">
                        <input
                            placeholder="Descripción"
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
                            value={it.precio}
                            onChange={e => updateItem(i, 'precio', Number(e.target.value))}
                        />
                        <div className="flex items-center">
                            S/. {(it.cantidad * it.precio).toFixed(2)}
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addItem} className="btn">
                + Agregar Item
            </button>

            {/* Totales */}
            <div className="text-right space-y-1">
                <div>Subtotal: S/. {subtotal.toFixed(2)}</div>
                <div>IGV (18%): S/. {igv.toFixed(2)}</div>
                <div className="text-xl font-bold">
                    Total: S/. {total.toFixed(2)}
                </div>
            </div>

            <button
                onClick={guardarBoletaVenta}
                className="bg-accent-rose px-4 py-2 rounded-lg text-white"
            >
                Generar Boleta
            </button>

        </div>
    );
}
