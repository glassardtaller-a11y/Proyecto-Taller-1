'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function NuevaOrdenPage() {

    const supabase = createClient()

    const [networks, setNetworks] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [prices, setPrices] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])

    const [networkId, setNetworkId] = useState('')
    const [categoryId, setCategoryId] = useState('')
    const [serviceId, setServiceId] = useState('')
    const [link, setLink] = useState('')
    const [quantity, setQuantity] = useState('')
    const [price, setPrice] = useState('')
    const [manualPrice, setManualPrice] = useState(false)

    /* ================= LOADERS ================= */

    useEffect(() => {
        loadNetworks()
        loadOrders()
    }, [])

    const loadNetworks = async () => {
        const { data } = await supabase
            .from('social_networks')
            .select('*')
            .eq('active', true)

        setNetworks(data || [])
    }

    const loadCategories = async (id: string) => {
        const { data } = await supabase
            .from('social_categories')
            .select('*')
            .eq('network_id', id)

        setCategories(data || [])
    }

    const loadServices = async (id: string) => {
        const { data } = await supabase
            .from('social_services')
            .select('*')
            .eq('category_id', id)

        setServices(data || [])
    }

    const loadPrices = async (id: string) => {
        const { data } = await supabase
            .from('social_service_prices')
            .select('*')
            .eq('service_id', id)

        setPrices(data || [])
    }

    const loadOrders = async () => {
        const { data } = await supabase
            .from('social_orders')
            .select(`
        *,
        social_networks(name),
        social_categories(name),
        social_services(name)
      `)
            .order('created_at', { ascending: false })

        setOrders(data || [])
    }

    /* ================= LOGIC ================= */

    const handleQuantity = (value: string) => {
        setQuantity(value)

        const found = prices.find(
            p => p.quantity === Number(value)
        )

        if (found) {
            setPrice(found.price)
            setManualPrice(false)
        } else {
            setPrice('')
            setManualPrice(true)
        }
    }

    const saveOrder = async () => {

        if (
            !networkId ||
            !categoryId ||
            !serviceId ||
            !link ||
            !quantity ||
            !price
        ) {
            alert('Complete todos los campos')
            return
        }

        await supabase.from('social_orders').insert({
            network_id: networkId,
            category_id: categoryId,
            service_id: serviceId,
            client_link: link,
            quantity: Number(quantity),
            price: Number(price)
        })

        alert('Orden registrada')

        setLink('')
        setQuantity('')
        setPrice('')

        loadOrders()
    }

    /* ================= UI ================= */

    return (
        <div className="max-w-4xl space-y-8">

            <h1 className="text-2xl font-bold text-white">
                Nueva Orden - Redes Sociales
            </h1>

            {/* FORM */}
            <div className="bg-white text-gray-900 p-6 rounded-lg shadow space-y-4">

                {/* REDES CON LOGO */}
                <div>
                    <p className="font-semibold mb-2">Seleccione Red</p>

                    <div className="grid grid-cols-4 md:grid-cols-6 gap-4">

                        {networks.map((n) => (
                            <button
                                key={n.id}
                                onClick={() => {
                                    setNetworkId(n.id)
                                    loadCategories(n.id)
                                    setCategoryId('')
                                    setServiceId('')
                                }}
                                className={`
                                    border rounded-lg p-3 flex flex-col items-center justify-center
                                    hover:border-blue-500 transition
                                    ${networkId === n.id ? 'border-blue-600 ring-2 ring-blue-400' : 'border-gray-300'}
                                    `}
                            >
                                <img
                                    src={n.logo_url}
                                    alt={n.name}
                                    className="w-12 h-12 object-contain mb-2"
                                />

                                <span className="text-sm font-medium">
                                    {n.name}
                                </span>
                            </button>
                        ))}

                    </div>
                </div>


                <select
                    className="w-full border px-3 py-2 rounded"
                    value={categoryId}
                    onChange={(e) => {
                        setCategoryId(e.target.value)
                        loadServices(e.target.value)
                        setServiceId('')
                    }}
                >
                    <option value="">Seleccione Categoría</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <select
                    className="w-full border px-3 py-2 rounded"
                    value={serviceId}
                    onChange={(e) => {
                        setServiceId(e.target.value)
                        loadPrices(e.target.value)
                    }}
                >
                    <option value="">Seleccione Servicio</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <input
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Link del perfil o publicación"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                />

                <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    placeholder="Cantidad"
                    value={quantity}
                    onChange={e => handleQuantity(e.target.value)}
                />

                <input
                    type="number"
                    className="w-full border px-3 py-2 rounded"
                    placeholder={manualPrice ? 'Ingrese precio manual' : 'Precio automático'}
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    disabled={!manualPrice}
                />

                {manualPrice && (
                    <p className="text-yellow-600 text-sm">
                        No existe tarifa para esta cantidad. Ingrese precio manual.
                    </p>
                )}

                <button
                    onClick={saveOrder}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                    Guardar Orden
                </button>

            </div>

            {/* TABLE */}
            <div className="bg-white text-gray-900 p-6 rounded-lg shadow">

                <h2 className="text-xl font-bold mb-3">
                    Órdenes Registradas
                </h2>

                <table className="w-full text-sm border">

                    <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2">Red</th>
                            <th className="p-2">Categoría</th>
                            <th className="p-2">Servicio</th>
                            <th className="p-2">Link</th>
                            <th className="p-2">Cantidad</th>
                            <th className="p-2">Precio</th>
                            <th className="p-2">Estado</th>
                        </tr>
                    </thead>

                    <tbody>
                        {orders.map(o => (
                            <tr key={o.id} className="border-t">
                                <td className="p-2">{o.social_networks?.name}</td>
                                <td className="p-2">{o.social_categories?.name}</td>
                                <td className="p-2">{o.social_services?.name}</td>
                                <td className="p-2">
                                    <a
                                        href={o.client_link}
                                        target="_blank"
                                        className="text-blue-600 underline"
                                    >
                                        Abrir
                                    </a>
                                </td>
                                <td className="p-2">{o.quantity}</td>
                                <td className="p-2">S/ {o.price}</td>
                                <td className="p-2">
                                    <select
                                        value={o.status}
                                        onChange={async (e) => {

                                            await supabase
                                                .from('social_orders')
                                                .update({ status: e.target.value })
                                                .eq('id', o.id)

                                            loadOrders()
                                        }}
                                        className={`border rounded px-2 py-1 text-sm font-semibold
                                            ${o.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                            ${o.status === 'processing' ? 'bg-yellow-100 text-yellow-800' : ''}
                                            ${o.status === 'pending' ? 'bg-red-100 text-red-800' : ''}
                                        `}
                                    >
                                        <option value="pending">Pendiente</option>
                                        <option value="processing">Procesando</option>
                                        <option value="completed">Completado</option>
                                    </select>

                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>

            </div>

        </div>
    )
}
