
import { createClient } from '@/lib/supabase/server'
import { RevenueChart } from '@/components/RevenueChart'
import { formatCurrency } from '@/lib/date-utils'
import { eachMonthOfInterval, startOfYear, endOfYear, format } from 'date-fns'

export default async function ReportsPage() {
    const supabase = await createClient()

    // Get sales for current year
    const currentYearStart = startOfYear(new Date()).toISOString()
    const currentYearEnd = endOfYear(new Date()).toISOString()

    const { data: sales } = await supabase
        .from('sales')
        .select('sale_date, price')
        .gte('sale_date', currentYearStart)
        .lte('sale_date', currentYearEnd)

    // Aggregate by month
    const months = eachMonthOfInterval({
        start: new Date(currentYearStart),
        end: new Date(currentYearEnd)
    })

    const chartData = months.map(month => {
        const monthStr = format(month, 'yyyy-MM')
        const monthSales = sales?.filter((s: any) => s.sale_date.startsWith(monthStr))
        const total = monthSales?.reduce((acc: number, sale: any) => acc + (Number(sale.price) || 0), 0) || 0

        return {
            name: format(month, 'MMM'),
            total: total
        }
    })

    const totalRevenue = sales?.reduce((acc: number, sale: any) => acc + (Number(sale.price) || 0), 0) || 0

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Reports</h1>

            <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-xl font-semibold mb-2">Total Revenue (Year To Date)</h2>
                <p className="text-4xl font-bold text-green-600">{formatCurrency(totalRevenue)}</p>
            </div>

            <div className="rounded-lg bg-white p-6 shadow">
                <h2 className="text-xl font-semibold mb-6">Monthly Revenue</h2>
                <div className="h-[400px]">
                    <RevenueChart data={chartData} />
                </div>
            </div>
        </div>
    )
}
