'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function PricesManager() {

    const supabase = createClient()

    const [services, setServices] = useState<any[]>([])
    const [prices, setPrices] = useState<any[]>([])
    const [serviceId, setServiceId] = useState('')
    const [quantity, setQuantity] = useState('')
    const [price, setPrice] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {

        const { data: servs } = await supabase
            .from('social_services')
            .select('id,name')

        const { data: pr } = await supabase
            .from('social_service_prices')
            .select('*, social_services(name)')

        setServices(servs || [])
        setPrices(pr || [])
    }

    const savePrice = async () => {

        if (!serviceId || !quantity || !price) {
            alert('Complete los campos')
            return
        }

        await supabase
            .from('social_service_prices')
            .insert({
                service_id: serviceId,
                quantity: Number(quantity),
                price: Number(price)
            })

        setQuantity('')
        setPrice('')
        loadData()
    }

    return (
        <div className="space-y-4">

            <h2 className="text-xl font-bold text-gray-900">
                Tarifas
            </h2>

            <div className="flex gap-2">

                <select
                    className="border px-3 py-2 rounded"
                    value={serviceId}
                    onChange={e => setServiceId(e.target.value)}
                >
                    <option value="">Servicio</option>
                    {services.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name}
                        </option>
                    ))}
                </select>

                <input
                    className="border px-3 py-2 rounded"
                    placeholder="Cantidad"
                    type="number"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value)}
                />

                <input
                    className="border px-3 py-2 rounded"
                    placeholder="Precio S/"
                    type="number"
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                />

                <button
                    onClick={savePrice}
                    className="bg-blue-600 text-white px-3 rounded"
                >
                    Agregar
                </button>

            </div>

            <ul className="text-sm">
                {prices.map(p => (
                    <li key={p.id}>
                        {p.social_services?.name} - {p.quantity} → S/ {p.price}
                    </li>
                ))}
            </ul>

        </div>
    )
}
