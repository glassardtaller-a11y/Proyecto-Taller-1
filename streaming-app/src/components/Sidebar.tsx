'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Users,
    CreditCard,
    ShoppingCart,
    BarChart3,
    Share2,
    ChevronDown,
    ChevronRight
} from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Platforms', href: '/platforms', icon: CreditCard },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
]

export function Sidebar() {

    const pathname = usePathname()
    const [openSocial, setOpenSocial] = useState(
        pathname.startsWith('/redes-sociales')
    )

    return (
        <div className="flex h-screen w-64 flex-col bg-gray-900 text-white">

            {/* LOGO */}
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold">Streaming Manager</h1>
            </div>

            {/* MENU */}
            <nav className="flex-1 space-y-1 px-2 py-4">

                {/* LINKS NORMALES */}
                {navigation.map((item) => {
                    const isActive = pathname.startsWith(item.href)

                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={clsx(
                                isActive
                                    ? 'bg-gray-800 text-white'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-sm font-medium'
                            )}
                        >
                            <item.icon
                                className={clsx(
                                    isActive
                                        ? 'text-white'
                                        : 'text-gray-400 group-hover:text-white',
                                    'mr-3 h-6 w-6'
                                )}
                            />
                            {item.name}
                        </Link>
                    )
                })}

                {/* REDES SOCIALES */}
                <div>
                    <button
                        onClick={() => setOpenSocial(!openSocial)}
                        className={clsx(
                            pathname.startsWith('/redes-sociales')
                                ? 'bg-gray-800 text-white'
                                : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                            'group flex w-full items-center rounded-md px-2 py-2 text-sm font-medium'
                        )}
                    >
                        <Share2 className="mr-3 h-6 w-6 text-gray-400 group-hover:text-white" />
                        Redes Sociales

                        {openSocial ? (
                            <ChevronDown className="ml-auto h-4 w-4" />
                        ) : (
                            <ChevronRight className="ml-auto h-4 w-4" />
                        )}
                    </button>

                    {openSocial && (
                        <div className="ml-8 mt-1 space-y-1">

                            <Link
                                href="/redes-sociales/nueva-orden"
                                className={clsx(
                                    pathname === '/redes-sociales/nueva-orden'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white',
                                    'block text-sm'
                                )}
                            >
                                Nueva Orden
                            </Link>

                            <Link
                                href="/redes-sociales/configuracion"
                                className={clsx(
                                    pathname === '/redes-sociales/configuracion'
                                        ? 'text-white'
                                        : 'text-gray-400 hover:text-white',
                                    'block text-sm'
                                )}
                            >
                                Configuración
                            </Link>

                        </div>
                    )}
                </div>

            </nav>

            <div className="border-t border-gray-800 p-4">
                <p className="text-xs text-gray-500">v1.0.0</p>
            </div>

        </div>
    )
}
