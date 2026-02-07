
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Platform = {
    id: string
    name: string
    monthly_price: number
    yearly_price: number
}

export default function NewSalePage() {
    const router = useRouter()
    // const supabase = createClient() // Moved inside hooks
    const [loading, setLoading] = useState(false)
    const [platforms, setPlatforms] = useState<Platform[]>([])

    const [selectedPlatform, setSelectedPlatform] = useState<string>('')
    const [plan, setPlan] = useState<'MONTHLY' | 'YEARLY' | 'CUSTOM_RANGE'>('MONTHLY')
    const [price, setPrice] = useState<number>(0)

    // Load platforms
    useEffect(() => {
        const supabase = createClient()
        supabase.from('platforms').select('*').eq('is_active', true)
            .then(({ data }: any) => {
                if (data) setPlatforms(data)
            })
    }, [])

    // Auto-set price when platform or plan changes
    useEffect(() => {
        if (!selectedPlatform) return
        const platform = platforms.find(p => p.id === selectedPlatform)
        if (!platform) return

        if (plan === 'MONTHLY') setPrice(platform.monthly_price)
        if (plan === 'YEARLY') setPrice(platform.yearly_price)
    }, [selectedPlatform, plan, platforms])

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setLoading(true)

        const formData = new FormData(e.currentTarget)

        const payload = {
            platform_id: formData.get('platform_id'),
            customer: {
                full_name: formData.get('customer_name'),
                email: formData.get('customer_email'),
                phone: formData.get('customer_phone'),
            },
            payment_method: formData.get('payment_method'),
            plan: formData.get('plan'),
            start_date: formData.get('start_date') || new Date().toISOString(),
            end_date: formData.get('end_date') || null,
            price: formData.get('price'),
        }

        try {
            const res = await fetch('/api/sales', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            const json = await res.json()

            if (!res.ok) throw new Error(json.error || 'Failed to create sale')

            router.push('/sales')
            router.refresh()
        } catch (error) {
            console.error(error)
            alert('Error creating sale: ' + (error as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">New Sale</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">

                {/* Customer Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Customer Details</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <input type="text" name="customer_name" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <input type="email" name="customer_email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <input type="tel" name="customer_phone" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6 space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Sale Details</h3>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Platform</label>
                            <select
                                name="platform_id"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={selectedPlatform}
                                onChange={(e) => setSelectedPlatform(e.target.value)}
                            >
                                <option value="">Select Platform</option>
                                {platforms.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Plan</label>
                            <select
                                name="plan"
                                required
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                value={plan}
                                onChange={(e) => setPlan(e.target.value as any)}
                            >
                                <option value="MONTHLY">Monthly</option>
                                <option value="YEARLY">Yearly</option>
                                <option value="CUSTOM_RANGE">Custom Range</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Start Date</label>
                            <input
                                type="date"
                                name="start_date"
                                required
                                defaultValue={new Date().toISOString().split('T')[0]}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>

                        {plan === 'CUSTOM_RANGE' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700">End Date</label>
                                <input type="date" name="end_date" required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Price (S/)</label>
                            <input
                                type="number"
                                step="0.01"
                                name="price"
                                required
                                value={price}
                                onChange={(e) => setPrice(Number(e.target.value))}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                            <select name="payment_method" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
                                <option value="YAPE">Yape</option>
                                <option value="PLIN">Plin</option>
                                <option value="TRANSFER">Transferencia</option>
                                <option value="CASH">Efectivo</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                        {loading ? 'Processing...' : 'Register Sale'}
                    </button>
                </div>
            </form>
        </div>
    )
}
