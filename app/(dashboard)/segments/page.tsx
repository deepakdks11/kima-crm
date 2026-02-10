'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Ship,
    User,
    Briefcase,
    Wallet,
    Zap,
    TrendingUp
} from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { cn } from '@/lib/utils';

const SEGMENT_CONFIG = [
    {
        name: 'Exporters',
        description: 'Web2 businesses focused on global trade and cross-border payments.',
        icon: Ship,
        gradient: 'from-blue-500/10 to-blue-600/5',
        iconColor: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-500/10',
    },
    {
        name: 'Freelancers',
        description: 'Independent professionals and contractors managing global clients.',
        icon: User,
        gradient: 'from-green-500/10 to-green-600/5',
        iconColor: 'text-green-600 dark:text-green-400',
        bgColor: 'bg-green-500/10',
    },
    {
        name: 'Agencies',
        description: 'Consultants and service provider agencies with international reach.',
        icon: Briefcase,
        gradient: 'from-orange-500/10 to-orange-600/5',
        iconColor: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-500/10',
    },
    {
        name: 'Wallets / dApps',
        description: 'Web3 native platforms, wallet providers, and decentralized applications.',
        icon: Wallet,
        gradient: 'from-violet-500/10 to-violet-600/5',
        iconColor: 'text-violet-600 dark:text-violet-400',
        bgColor: 'bg-violet-500/10',
    },
    {
        name: 'Payments Infrastructure',
        description: 'Payment rails, infrastructure providers, and fintech platforms.',
        icon: Zap,
        gradient: 'from-indigo-500/10 to-indigo-600/5',
        iconColor: 'text-indigo-600 dark:text-indigo-400',
        bgColor: 'bg-indigo-500/10',
    },
];

export default function SegmentsPage() {
    const supabase = createClient();
    const [segmentCounts, setSegmentCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSegmentCounts() {
            try {
                const { data: leads } = await supabase
                    .from('leads')
                    .select('sub_segment');

                if (leads) {
                    const counts: Record<string, number> = {};
                    SEGMENT_CONFIG.forEach(seg => {
                        counts[seg.name] = leads.filter(l => {
                            if (!l.sub_segment) return false;
                            if (Array.isArray(l.sub_segment)) {
                                return l.sub_segment.some(s => s.toLowerCase().includes(seg.name.toLowerCase()));
                            }
                            // Fallback if somehow string (shouldn't happen with types but runtime safe)
                            return String(l.sub_segment).toLowerCase().includes(seg.name.toLowerCase());
                        }).length;
                    });
                    setSegmentCounts(counts);
                }
            } catch (error) {
                console.error('Error fetching segment counts:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchSegmentCounts();
    }, [supabase]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Lead Segments
                </h1>
                <p className="text-muted-foreground">
                    Explore your leads organized by business type and industry.
                </p>
            </div>

            {/* Segment Cards */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {SEGMENT_CONFIG.map((segment) => {
                    const count = segmentCounts[segment.name] || 0;

                    return (
                        <Link
                            key={segment.name}
                            href={`/leads?sub_segment=${encodeURIComponent(segment.name)}`}
                        >
                            <Card className={cn(
                                "group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer border-border/50 h-full touch-target"
                            )}>
                                {/* Gradient Background */}
                                <div className={cn(
                                    "absolute inset-0 bg-gradient-to-br opacity-50 transition-opacity group-hover:opacity-70",
                                    segment.gradient
                                )} />

                                <CardHeader className="relative z-10">
                                    <div className="flex items-start justify-between">
                                        <div className={cn(
                                            "p-3 rounded-xl transition-transform group-hover:scale-110",
                                            segment.bgColor
                                        )}>
                                            <segment.icon className={cn("h-6 w-6", segment.iconColor)} />
                                        </div>
                                        <Badge variant="secondary" className="font-semibold">
                                            {loading ? '...' : count}
                                        </Badge>
                                    </div>
                                    <div className="pt-2">
                                        <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                                            {segment.name}
                                        </CardTitle>
                                        <CardDescription className="text-xs uppercase tracking-wide font-medium mt-1">
                                            {count === 1 ? '1 Lead' : `${count} Leads`}
                                        </CardDescription>
                                    </div>
                                </CardHeader>

                                <CardContent className="relative z-10">
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        {segment.description}
                                    </p>

                                    {/* View Details Link */}
                                    <div className="flex items-center gap-1 mt-4 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                                        View leads
                                        <TrendingUp className="h-4 w-4" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    );
                })}
            </div>

            {/* Summary Stats */}
            <Card className="border-dashed border-2 border-border/50">
                <CardContent className="py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold text-lg">Total Segmented Leads</h3>
                            <p className="text-sm text-muted-foreground">
                                Across all business categories
                            </p>
                        </div>
                        <div className="text-4xl font-bold">
                            {loading ? '...' : Object.values(segmentCounts).reduce((a, b) => a + b, 0)}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
