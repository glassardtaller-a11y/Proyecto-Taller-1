'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LogoUpload } from '@/components/LogoUpload'

export default function NewPlatformPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [logoUrl, setLogoUrl] = useState('')

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)
        const data = {
            name: formData.get('name'),
            monthly_price: Number(formData.get('monthly_price')),
            yearly_price: Number(formData.get('yearly_price')),
            logo_url: logoUrl,
        }

        try {
            const res = await fetch('/api/platforms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            if (!res.ok) throw new Error('Failed to create platform')

            router.push('/platforms')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error creating platform')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">New Platform</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Logo</label>
                    <div className="mt-1">
                        <LogoUpload onUpload={setLogoUrl} />
                        {logoUrl && (
                            <div className="mt-2 text-sm text-green-600">Logo uploaded!</div>
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                        type="text"
                        name="name"
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Monthly Price</label>
                        <input
                            type="number"
                            step="0.01"
                            name="monthly_price"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Yearly Price</label>
                        <input
                            type="number"
                            step="0.01"
                            name="yearly_price"
                            required
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Create Platform'}
                    </button>
                </div>
            </form>
        </div>
    )
}
