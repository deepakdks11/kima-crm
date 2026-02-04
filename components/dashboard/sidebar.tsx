'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    KanbanSquare,
    Layers,
    CheckSquare,
    Trophy,
    BookOpen,
    Zap,
    Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ModeToggle } from '@/components/mode-toggle';

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Leads', href: '/leads', icon: Users },
    { name: 'Pipeline', href: '/pipeline', icon: KanbanSquare },
    { name: 'Segments', href: '/segments', icon: Layers },
    { name: 'Follow-ups', href: '/follow-ups', icon: CheckSquare },
    { name: 'Closed Customers', href: '/customers', icon: Trophy },
];

const secondaryNavigation = [
    { name: 'Help Center', href: '/docs', icon: BookOpen },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full w-64 flex-col glass border-r border-white/10 text-foreground overflow-hidden">
            <div className="flex h-20 items-center px-6 border-b border-white/5 bg-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap className="h-5 w-5 text-primary-foreground fill-current" />
                    </div>
                    <span className="font-bold text-xl tracking-tight">
                        <span className="text-primary">Kima</span>CRM
                    </span>
                </div>
            </div>

            <div className="flex-1 flex flex-col gap-1 overflow-y-auto py-6 px-3 scrollbar-none">
                <div className="px-3 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Main Menu</span>
                </div>
                {navigation.map((item) => {
                    const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl relative overflow-hidden",
                                isActive
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                            )}
                        >
                            <item.icon className={cn(
                                "h-5 w-5 transition-transform duration-200",
                                isActive ? "scale-110" : "group-hover:scale-110"
                            )} />
                            <span>{item.name}</span>
                            {isActive && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20" />
                            )}
                        </Link>
                    );
                })}

                <div className="px-3 mt-8 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Support</span>
                </div>
                {secondaryNavigation.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "group flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-xl text-muted-foreground hover:bg-white/5 hover:text-foreground"
                        )}
                    >
                        <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                        {item.name}
                    </Link>
                ))}
            </div>

            <div className="mt-auto p-4 border-t border-white/5 bg-white/5 backdrop-blur-sm">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Zap className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-bold text-primary active:scale-95 transition-transform uppercase">Premium Build</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-snug">
                        AI Scoring & Real-time Analytics Enabled.
                    </p>
                </div>

                <div className="flex items-center justify-between gap-2 px-2">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-slate-200 border border-white/20 overflow-hidden">
                            {/* Placeholder for avatar */}
                            <div className="w-full h-full bg-gradient-to-br from-primary/40 to-secondary/40" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-bold truncate max-w-[80px]">Axel CRM</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">Admin</span>
                        </div>
                    </div>
                    <ModeToggle />
                </div>
            </div>
        </div>
    );
}
