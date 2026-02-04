
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    KanbanSquare,
    CheckSquare,
    Trophy,
    Settings,
    LogOut,
    Layers,
    Wallet
} from 'lucide-react';
import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button'; // Will add later

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'All Leads', href: '/leads', icon: Users },
    { name: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
    { name: 'Follow-ups', href: '/follow-ups', icon: CheckSquare },
    { name: 'Customers', href: '/customers', icon: Trophy },
];

const segments = [
    { name: 'Exporters', href: '/segments/Web2-Exporter' },
    { name: 'Freelancers', href: '/segments/Web2-Freelancer' },
    { name: 'Agencies', href: '/segments/Web2-Agency' },
    { name: 'Wallets / dApps', href: '/segments/Web3-Wallet' },
    { name: 'Payments Infra', href: '/segments/Web3-Payments' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
            <div className="flex h-16 items-center px-6 font-bold text-xl tracking-tight">
                <span className="text-blue-400">Trustodi</span><span className="text-white">+Kima</span>
            </div>

            <div className="flex-1 flex flex-col gap-1 overflow-y-auto py-4">
                <div className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Main
                </div>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-blue-600 text-white border-r-4 border-blue-400"
                                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                            )}
                        >
                            <item.icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}

                <div className="mt-8 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Segments
                </div>
                {segments.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex items-center gap-3 px-6 py-2 text-sm font-medium transition-colors",
                            pathname === item.href
                                ? "text-blue-400"
                                : "text-gray-400 hover:text-white"
                        )}
                    >
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                        {item.name}
                    </Link>
                ))}
            </div>

            <div className="p-4 border-t border-gray-800">
                <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white w-full px-2 py-2">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
