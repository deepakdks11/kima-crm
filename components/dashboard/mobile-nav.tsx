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
    Settings,
    Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { WorkspaceSwitcher } from '@/components/dashboard/workspace-switcher';

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

interface MobileNavProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function MobileNav({ open, onOpenChange }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="left" className="w-[280px] p-0">
                <div className="flex h-full flex-col">
                    {/* Header */}
                    <SheetHeader className="border-b p-6">
                        <SheetTitle className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                                <Zap className="h-5 w-5 text-primary-foreground fill-current" />
                            </div>
                            <span className="font-bold text-xl tracking-tight">
                                <span className="text-primary">Kima</span>CRM
                            </span>
                        </SheetTitle>
                    </SheetHeader>

                    {/* Workspace Switcher */}
                    <div className="px-6 py-4 border-b border-border/50">
                        <WorkspaceSwitcher className="w-full" />
                    </div>

                    {/* Navigation */}
                    <div className="flex-1 overflow-y-auto py-6 px-3">
                        <div className="px-3 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Main Menu
                            </span>
                        </div>
                        <nav className="space-y-1">
                            {navigation.map((item) => {
                                const isActive =
                                    pathname === item.href ||
                                    (item.href !== '/dashboard' && pathname?.startsWith(item.href));
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => onOpenChange(false)}
                                        className={cn(
                                            'group flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-xl touch-target',
                                            isActive
                                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                        )}
                                    >
                                        <item.icon
                                            className={cn(
                                                'h-5 w-5 transition-transform duration-200',
                                                isActive ? 'scale-110' : 'group-hover:scale-110'
                                            )}
                                        />
                                        <span>{item.name}</span>
                                    </Link>
                                );
                            })}
                        </nav>

                        <div className="px-3 mt-8 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                Support
                            </span>
                        </div>
                        <nav className="space-y-1">
                            {secondaryNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    onClick={() => onOpenChange(false)}
                                    className="group flex items-center gap-3 px-3 py-3 text-sm font-medium transition-all duration-200 rounded-xl text-muted-foreground hover:bg-accent hover:text-foreground touch-target"
                                >
                                    <item.icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>

                    {/* Footer */}
                    <div className="mt-auto p-4 border-t">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
                            <div className="flex items-center gap-2 mb-1">
                                <Zap className="h-3 w-3 text-primary" />
                                <span className="text-[10px] font-bold text-primary uppercase">
                                    Premium Build
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-snug">
                                AI Scoring & Real-time Analytics Enabled.
                            </p>
                        </div>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
