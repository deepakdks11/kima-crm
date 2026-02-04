'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Ship,
    User,
    Briefcase,
    Wallet,
    Zap
} from "lucide-react";
import Link from "next/link";

const segments = [
    {
        name: 'Exporters',
        description: 'Web2 businesses focused on global trade.',
        icon: Ship,
        color: 'bg-blue-500/10 text-blue-500',
        count: 12
    },
    {
        name: 'Freelancers',
        description: 'Independent professionals and contractors.',
        icon: User,
        color: 'bg-green-500/10 text-green-500',
        count: 24
    },
    {
        name: 'Agencies',
        description: 'Consultants and service provider agencies.',
        icon: Briefcase,
        color: 'bg-purple-500/10 text-purple-500',
        count: 8
    },
    {
        name: 'Wallets / dApps',
        description: 'Web3 native platforms and wallet providers.',
        icon: Wallet,
        color: 'bg-orange-500/10 text-orange-500',
        count: 15
    },
    {
        name: 'Payments Infra',
        description: 'Infrastructure and payment rail providers.',
        icon: Zap,
        color: 'bg-yellow-500/10 text-yellow-500',
        count: 6
    },
];

export default function SegmentsPage() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Segments</h1>
                <p className="text-sm text-muted-foreground">Click a segment to view filtered leads.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {segments.map((segment) => (
                    <Link key={segment.name} href={`/leads?sub_segment=${encodeURIComponent(segment.name)}`}>
                        <Card className="hover:border-primary transition-colors cursor-pointer group h-full">
                            <CardHeader className="flex flex-row items-center gap-4">
                                <div className={`p-2 rounded-xl ${segment.color}`}>
                                    <segment.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg">{segment.name}</CardTitle>
                                    <CardDescription>{segment.count} Leads</CardDescription>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    {segment.description}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
