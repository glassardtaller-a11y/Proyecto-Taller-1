'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { MobileNav, MobileSidebar } from '@/components/layout/MobileNav';

import { AuthProvider } from '@/components/providers/AuthProvider';
import { ProtectedRoute } from '@/components/providers/ProtectedRoute';

function DashboardContent({ children }: { children: React.ReactNode }) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const getMainMargin = () => {
        if (!isMounted) return '0';
        if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
            return sidebarCollapsed ? '72px' : '256px';
        }
        return '0';
    };

    return (
        <div className="app-shell bg-background flex flex-col">
            <div className="hidden lg:block">
                <Sidebar
                    collapsed={sidebarCollapsed}
                    onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
                />
            </div>

            <MobileSidebar
                isOpen={mobileSidebarOpen}
                onClose={() => setMobileSidebarOpen(false)}
            >
                <Sidebar collapsed={false} />
            </MobileSidebar>

            <div
                className="transition-all duration-300 flex flex-col flex-1 min-h-0"
                style={{ marginLeft: getMainMargin() }}
            >
                <Header
                    showMenuButton
                    onMenuClick={() => setMobileSidebarOpen(true)}
                    showSearch
                />

                <main
                    className="
                        flex-1
                        overflow-y-auto
                        p-4 lg:p-6
                        pb-[calc(4rem+env(safe-area-inset-bottom))]
                    "
                >
                    {children}
                </main>

            </div>

            <MobileNav />
        </div>
    );
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <AuthProvider>
            <ProtectedRoute>
                <DashboardContent>{children}</DashboardContent>
            </ProtectedRoute>
        </AuthProvider>
    );
}
