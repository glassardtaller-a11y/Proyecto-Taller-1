'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SocialNetworkLogoUpload } from '@/components/SocialNetworkLogoUpload'

export default function SocialNetworksConfigPage() {

    const supabase = createClient()

    const [name, setName] = useState('')
    const [logoUrl, setLogoUrl] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSave = async () => {
        if (!name) {
            alert('Ingrese nombre de la red')
            return
        }

        setLoading(true)

        const { error } = await supabase
            .from('social_networks')
            .insert({
                name,
                logo_url: logoUrl
            })

        setLoading(false)

        if (error) {
            alert(error.message)
        } else {
            alert('Red creada')
            setName('')
            setLogoUrl('')
        }
    }

    return (
        <div className="max-w-xl space-y-6">

            <h1 className="text-2xl font-bold">
                Configuración - Redes Sociales
            </h1>

            {/* NOMBRE */}
            <div>
                <label className="block text-sm font-medium">
                    Nombre de la Red
                </label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border rounded-md px-3 py-2"
                    placeholder="Ej: TikTok"
                />
            </div>

            {/* LOGO */}
            <SocialNetworkLogoUpload
                onUpload={(url) => setLogoUrl(url)}
            />

            {/* BOTÓN */}
            <button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
                {loading ? 'Guardando...' : 'Guardar Red'}
            </button>

        </div>
    )
}
