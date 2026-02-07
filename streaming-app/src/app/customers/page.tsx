
import { createClient } from '@/lib/supabase/server'
import { formatDate } from '@/lib/date-utils'

export default async function CustomersPage() {
    const supabase = await createClient()
    const { data: customers } = await supabase.from('customers').select('*').order('created_at', { ascending: false })

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Customers</h1>

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Contact
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                                Created At
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                        {customers?.map((customer: any) => (
                            <tr key={customer.id}>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm font-medium text-gray-900">{customer.full_name}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    <div className="text-sm text-gray-500">{customer.email}</div>
                                    <div className="text-sm text-gray-500">{customer.phone}</div>
                                </td>
                                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                                    {formatDate(customer.created_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
