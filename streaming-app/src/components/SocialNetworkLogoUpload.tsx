'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload, Image as ImageIcon } from 'lucide-react'

interface Props {
    onUpload: (url: string) => void
}

export function SocialNetworkLogoUpload({ onUpload }: Props) {

    const [uploading, setUploading] = useState(false)

    const MAX_SIZE_MB = 2
    const ALLOWED_TYPES = [
        'image/png',
        'image/jpeg',
        'image/webp',
        'image/svg+xml'
    ]

    const handleUpload = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        try {
            setUploading(true)
            const supabase = createClient()

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('Debe seleccionar una imagen')
            }

            const file = event.target.files[0]

            // ✅ Validar tipo
            if (!ALLOWED_TYPES.includes(file.type)) {
                throw new Error('Formato no permitido')
            }

            // ✅ Validar tamaño
            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                throw new Error('Máximo 2MB')
            }

            const fileExt = file.name.split('.').pop()
            const fileName = `network-${crypto.randomUUID()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('social-network-logos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            const { data } = supabase.storage
                .from('social-network-logos')
                .getPublicUrl(fileName)

            onUpload(data.publicUrl)

        } catch (error: any) {
            alert(error.message || 'Error al subir imagen')
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-medium">
                Logo de la Red
            </label>

            <label className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition">

                {uploading
                    ? 'Subiendo...'
                    : (
                        <>
                            <ImageIcon className="h-5 w-5 mr-2" />
                            Subir Imagen
                        </>
                    )
                }

                <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleUpload}
                    disabled={uploading}
                />
            </label>

            <p className="text-xs text-gray-500">
                PNG, JPG, WEBP, SVG | Máx 2MB
            </p>
        </div>
    )
}
