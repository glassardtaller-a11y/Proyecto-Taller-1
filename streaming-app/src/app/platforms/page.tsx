
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { formatCurrency } from '@/lib/date-utils'

export default async function PlatformsPage() {
    const supabase = await createClient()
    const { data: platforms } = await supabase.from('platforms').select('*').order('name')

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Platforms</h1>
                <Link
                    href="/platforms/new"
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Platform
                </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {platforms?.map((platform: any) => (
                    <div key={platform.id} className="overflow-hidden rounded-lg bg-white shadow">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-1">
                                    <h3 className="text-lg font-medium text-gray-900">{platform.name}</h3>
                                    <p className="text-sm text-gray-500">
                                        Monthly: {formatCurrency(platform.monthly_price)}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        Yearly: {formatCurrency(platform.yearly_price)}
                                    </p>
                                </div>
                                <div className="ml-4">
                                    {platform.is_active ? (
                                        <span className="inline-flex rounded-full bg-green-100 px-2 text-xs font-semibold leading-5 text-green-800">
                                            Active
                                        </span>
                                    ) : (
                                        <span className="inline-flex rounded-full bg-red-100 px-2 text-xs font-semibold leading-5 text-red-800">
                                            Inactive
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
