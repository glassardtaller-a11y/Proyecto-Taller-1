'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Plus, MessageCircle } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/date-utils'
import MessageModal from '@/components/MessageModal'

export default function SalesPage() {

    const [selectedSale, setSelectedSale] = useState<any>(null)

    const supabase = createClient()

    const [sales, setSales] = useState<any[]>([])

    // Load sales
    useState(() => {
        supabase
            .from('sales')
            .select(`
        *,
        platforms (name),
        customers (full_name, phone)
      `)
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data) setSales(data)
            })
    })

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Sales</h1>

                <Link
                    href="/sales/new"
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Sale
                </Link>
            </div>

            {/* TABLE */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">

                    <thead className="bg-gray-50">
                        <tr>
                            <th>Date</th>
                            <th>Platform</th>
                            <th>Customer</th>
                            <th>Plan</th>
                            <th>Price</th>
                            <th>Next Charge</th>
                            <th>Status</th>
                            <th>Mensaje</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 bg-white">

                        {sales.map((sale) => (
                            <tr key={sale.id}>

                                <td className="px-6 py-3">{formatDate(sale.sale_date)}</td>
                                <td className="px-6 py-3 font-medium">{sale.platforms?.name}</td>
                                <td className="px-6 py-3">{sale.customers?.full_name}</td>
                                <td className="px-6 py-3">{sale.plan}</td>
                                <td className="px-6 py-3">{formatCurrency(sale.price)}</td>
                                <td className="px-6 py-3">
                                    {sale.next_charge_date ? formatDate(sale.next_charge_date) : '-'}
                                </td>

                                <td className="px-6 py-3">
                                    <span className="bg-green-100 text-green-800 px-2 rounded-full text-xs">
                                        {sale.status}
                                    </span>
                                </td>

                                {/* BOTON WHATSAPP */}
                                <td className="px-6 py-3">
                                    <button
                                        onClick={() => setSelectedSale(sale)}
                                        className="text-green-600 hover:text-green-800"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                </td>

                            </tr>
                        ))}

                    </tbody>

                </table>
            </div>

            {/* MODAL */}
            {selectedSale && (
                <MessageModal
                    sale={selectedSale}
                    onClose={() => setSelectedSale(null)}
                />
            )}

        </div>
    )
}
