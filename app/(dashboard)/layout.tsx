'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { TopNavbar } from '@/components/dashboard/top-navbar';
import { MobileNav } from '@/components/dashboard/mobile-nav';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background">
            {/* Desktop Sidebar - hidden on mobile */}
            <Sidebar />

            {/* Mobile Navigation Drawer */}
            <MobileNav open={mobileNavOpen} onOpenChange={setMobileNavOpen} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Navbar - all devices */}
                <TopNavbar onMenuClick={() => setMobileNavOpen(true)} />

                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-y-auto container-padding py-6 lg:py-8">
                    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
