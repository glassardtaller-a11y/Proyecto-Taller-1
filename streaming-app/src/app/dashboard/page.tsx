
import { createClient } from '@/lib/supabase/server'
// Removed shadcn imports
import { CreditCard, Users, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/date-utils'

async function getData() {
    const supabase = await createClient()

    const { count: platformsCount } = await supabase.from('platforms').select('*', { count: 'exact', head: true }).eq('is_active', true)
    const { count: customersCount } = await supabase.from('customers').select('*', { count: 'exact', head: true })

    // Calculate revenue (this month)
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data: sales } = await supabase
        .from('sales')
        .select('price')
        .gte('sale_date', startOfMonth.toISOString())

    const revenue = sales?.reduce((acc: number, sale: { price: number }) => acc + (Number(sale.price) || 0), 0) || 0

    return {
        platformsCount: platformsCount || 0,
        customersCount: customersCount || 0,
        revenue,
    }
}

export default async function DashboardPage() {
    const data = await getData()

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Active Platforms */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center">
                        <div className="rounded-md bg-blue-100 p-3">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Active Platforms</p>
                            <p className="text-2xl font-semibold text-gray-900">{data.platformsCount}</p>
                        </div>
                    </div>
                </div>

                {/* Total Customers */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center">
                        <div className="rounded-md bg-green-100 p-3">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Total Customers</p>
                            <p className="text-2xl font-semibold text-gray-900">{data.customersCount}</p>
                        </div>
                    </div>
                </div>

                {/* Monthly Revenue */}
                <div className="rounded-lg bg-white p-6 shadow">
                    <div className="flex items-center">
                        <div className="rounded-md bg-purple-100 p-3">
                            <DollarSign className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500">Monthly Revenue</p>
                            <p className="text-2xl font-semibold text-gray-900">{formatCurrency(data.revenue)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section could be added here */}
        </div>
    )
}
