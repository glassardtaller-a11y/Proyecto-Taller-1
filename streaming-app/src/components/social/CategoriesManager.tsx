'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function CategoriesManager() {

    const supabase = createClient()

    const [networks, setNetworks] = useState<any[]>([])
    const [categories, setCategories] = useState<any[]>([])
    const [networkId, setNetworkId] = useState('')
    const [name, setName] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        const { data: nets } = await supabase
            .from('social_networks')
            .select('*')

        const { data: cats } = await supabase
            .from('social_categories')
            .select('*, social_networks(name)')

        setNetworks(nets || [])
        setCategories(cats || [])
    }

    const saveCategory = async () => {
        if (!networkId || !name) {
            alert('Complete los campos')
            return
        }

        await supabase
            .from('social_categories')
            .insert({
                network_id: networkId,
                name
            })

        setName('')
        loadData()
    }

    return (
        <div className="space-y-4">

            <h2 className="text-lg font-semibold">
                Categorías
            </h2>

            <div className="flex gap-2">

                <select
                    className="border px-3 py-2 rounded"
                    value={networkId}
                    onChange={e => setNetworkId(e.target.value)}
                >
                    <option value="">Red</option>
                    {networks.map(n => (
                        <option key={n.id} value={n.id}>
                            {n.name}
                        </option>
                    ))}
                </select>

                <input
                    className="border px-3 py-2 rounded"
                    placeholder="Ej: TikTok Seguidores"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <button
                    onClick={saveCategory}
                    className="bg-blue-600 text-white px-3 rounded"
                >
                    Agregar
                </button>

            </div>

            <ul className="text-sm">
                {categories.map(c => (
                    <li key={c.id}>
                        {c.social_networks?.name} - {c.name}
                    </li>
                ))}
            </ul>

        </div>
    )
}
