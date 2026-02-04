'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ModeToggle } from '@/components/mode-toggle';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface TopNavbarProps {
    onMenuClick?: () => void;
}

export function TopNavbar({ onMenuClick }: TopNavbarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());
        if (searchQuery) {
            params.set('q', searchQuery);
        } else {
            params.delete('q');
        }
        router.push(`/leads?${params.toString()}`);
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container-padding flex h-16 items-center gap-4">
                {/* Mobile Menu Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="lg:hidden touch-target"
                    onClick={onMenuClick}
                    aria-label="Toggle menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>

                {/* Logo - Hidden on mobile, visible on desktop */}
                <Link href="/dashboard" className="hidden lg:flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-lg">K</span>
                    </div>
                    <span className="font-bold text-xl tracking-tight">
                        <span className="text-primary">Kima</span>CRM
                    </span>
                </Link>

                {/* Global Search */}
                <div className="flex-1 max-w-md">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search leads, companies..."
                            className="pl-9 h-10 w-full"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                    {/* Add Lead Button */}
                    <Link href="/leads">
                        <Button size="sm" className="hidden sm:flex touch-target">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Lead
                        </Button>
                        <Button size="icon" className="sm:hidden touch-target">
                            <Plus className="h-4 w-4" />
                        </Button>
                    </Link>

                    {/* Theme Toggle */}
                    <ModeToggle />

                    {/* User Menu */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="rounded-full touch-target"
                            >
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/40 to-violet-500/40 flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary-foreground">A</span>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium">Axel CRM</p>
                                    <p className="text-xs text-muted-foreground">Admin</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                                <Link href="/settings">Settings</Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/docs">Help Center</Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                                Sign Out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
