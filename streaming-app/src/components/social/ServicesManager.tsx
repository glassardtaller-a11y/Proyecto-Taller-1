'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export function ServicesManager() {

    const supabase = createClient()

    const [categories, setCategories] = useState<any[]>([])
    const [services, setServices] = useState<any[]>([])
    const [categoryId, setCategoryId] = useState('')
    const [name, setName] = useState('')

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {

        const { data: cats } = await supabase
            .from('social_categories')
            .select('id,name')

        const { data: servs } = await supabase
            .from('social_services')
            .select('*, social_categories(name)')

        setCategories(cats || [])
        setServices(servs || [])
    }

    const saveService = async () => {

        if (!categoryId || !name) {
            alert('Complete los campos')
            return
        }

        await supabase
            .from('social_services')
            .insert({
                category_id: categoryId,
                name
            })

        setName('')
        loadData()
    }

    return (
        <div className="space-y-4">

            <h2 className="text-lg font-semibold">
                Servicios
            </h2>

            <div className="flex gap-2">

                <select
                    className="border px-3 py-2 rounded"
                    value={categoryId}
                    onChange={e => setCategoryId(e.target.value)}
                >
                    <option value="">Categoría</option>

                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <input
                    className="border px-3 py-2 rounded"
                    placeholder="Ej: Rápido"
                    value={name}
                    onChange={e => setName(e.target.value)}
                />

                <button
                    onClick={saveService}
                    className="bg-blue-600 text-white px-3 rounded"
                >
                    Agregar
                </button>

            </div>

            <ul className="text-sm">
                {services.map(s => (
                    <li key={s.id}>
                        {s.social_categories?.name} - {s.name}
                    </li>
                ))}
            </ul>

        </div>
    )
}
