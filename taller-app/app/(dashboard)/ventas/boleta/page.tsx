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
            precio_unitario: it.precio_unitario,
            total: it.cantidad * it.precio_unitario
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
            precio_unitario: 0
        }]);
    }
    function getValorUnitario(precioUnitario: number) {
        return precioUnitario / 1.18;
    }


    function updateItem(i: number, field: string, value: any) {
        const copy = [...items];
        copy[i][field] = value;
        setItems(copy);
    }

    const total = items.reduce(
        (s, i) => s + i.cantidad * i.precio_unitario,
        0
    );

    const subtotal = total / 1.18;
    const igv = total - subtotal;


    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* Título */}
            <h1 className="text-2xl font-bold">Nueva Boleta de Venta</h1>

            {/* DATOS CLIENTE */}
            <div className="bg-glass p-6 rounded-xl space-y-4">
                <h2 className="font-semibold">Datos del Cliente</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                    <div>
                        <label className="text-sm">Cliente</label>
                        <input
                            className="input w-full"
                            value={cliente}
                            onChange={e => setCliente(e.target.value)}
                            placeholder="Nombre del cliente"
                        />
                    </div>

                    <div>
                        <label className="text-sm">DNI / RUC</label>
                        <input
                            className="input w-full"
                            value={documento}
                            onChange={e => setDocumento(e.target.value)}
                            placeholder="Documento"
                        />
                    </div>

                    <div>
                        <label className="text-sm">Dirección</label>
                        <input
                            className="input w-full"
                            value={direccion}
                            onChange={e => setDireccion(e.target.value)}
                            placeholder="Dirección"
                        />
                    </div>

                </div>
            </div>

            {/* DETALLE */}
            <div className="bg-glass p-6 rounded-xl space-y-4">

                <h2 className="font-semibold">Detalle de Productos</h2>

                {/* Cabecera */}
                <div className="grid grid-cols-6 font-semibold text-sm text-foreground-muted">
                    <div>Descripción</div>
                    <div>Cantidad</div>
                    <div>P/U</div>
                    <div>V/U</div>
                    <div>Total</div>
                    <div></div>
                </div>

                {/* Filas */}
                {items.map((it, i) => (
                    <div key={i} className="grid grid-cols-6 gap-2 items-center">

                        <input
                            className="input"
                            value={it.descripcion}
                            onChange={e => updateItem(i, 'descripcion', e.target.value)}
                            placeholder="Producto"
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

                        <div className="text-sm text-foreground-muted">
                            S/. {getValorUnitario(it.precio_unitario).toFixed(2)}
                        </div>

                        <div>
                            S/. {(it.cantidad * it.precio_unitario).toFixed(2)}
                        </div>

                        <button
                            onClick={() =>
                                setItems(items.filter((_, index) => index !== i))
                            }
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
            <div className="bg-glass p-6 rounded-xl text-right space-y-1">

                <div>Subtotal: S/. {subtotal.toFixed(2)}</div>
                <div>IGV (18%): S/. {igv.toFixed(2)}</div>

                <div className="text-xl font-bold">
                    Total: S/. {total.toFixed(2)}
                </div>

            </div>

            {/* BOTÓN */}
            <div className="text-right">
                <button
                    onClick={guardarBoletaVenta}
                    className="bg-accent-rose px-6 py-3 rounded-lg text-white text-lg"
                >
                    Generar Boleta
                </button>
            </div>

        </div>
    );

}
