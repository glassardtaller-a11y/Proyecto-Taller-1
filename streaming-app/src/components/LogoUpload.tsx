
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Upload } from 'lucide-react'

export function LogoUpload({ onUpload }: { onUpload: (url: string) => void }) {
    const [uploading, setUploading] = useState(false)

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true)
            const supabase = createClient()

            if (!event.target.files || event.target.files.length === 0) {
                throw new Error('You must select an image to upload.')
            }

            const file = event.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('logos')
                .upload(filePath, file)

            if (uploadError) {
                throw uploadError
            }

            const { data } = supabase.storage.from('logos').getPublicUrl(filePath)

            onUpload(data.publicUrl)
        } catch (error) {
            alert('Error uploading avatar!')
            console.log(error)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <label className="block text-sm font-medium text-gray-700">Logo</label>
            <div className="mt-1 flex items-center">
                <label className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    <Upload className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
                    <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                    <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            </div>
        </div>
    )
}
