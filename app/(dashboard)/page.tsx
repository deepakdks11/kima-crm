'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Building2, Wallet, ArrowUpRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { FunnelChart } from '@/components/dashboard/funnel-chart';
import { SourceChart } from '@/components/dashboard/source-chart';

export default function DashboardPage() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        totalLeads: 0,
        web3Segments: 0,
        demoScheduled: 0,
        activeDeals: 0
    });
    const [funnelData, setFunnelData] = useState<{ name: string, value: number }[]>([]);
    const [sourceData, setSourceData] = useState<{ name: string, value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                // Fetch all leads for aggregation (client side aggregation for v1 is fine)
                const { data: leads, error } = await supabase.from('leads').select('*');

                if (error || !leads) return;

                const totalLeads = leads.length;
                const web3Segments = leads.filter(l => l.segment === 'Web3').length;
                const demoScheduled = leads.filter(l => l.status === 'Demo Scheduled').length;
                const activeDeals = leads.filter(l => ['Negotiation', 'Demo Scheduled', 'Contacted'].includes(l.status)).length;

                setStats({
                    totalLeads,
                    web3Segments,
                    demoScheduled,
                    activeDeals
                });

                // Funnel Data
                const statusCounts = leads.reduce((acc: any, lead) => {
                    acc[lead.status] = (acc[lead.status] || 0) + 1;
                    return acc;
                }, {});

                setFunnelData([
                    { name: "New", value: statusCounts['New'] || 0 },
                    { name: "Contacted", value: statusCounts['Contacted'] || 0 },
                    { name: "Demo", value: statusCounts['Demo Scheduled'] || 0 },
                    { name: "Negotiation", value: statusCounts['Negotiation'] || 0 },
                    { name: "Onboarded", value: statusCounts['Onboarded'] || 0 },
                    { name: "Lost", value: statusCounts['Lost'] || 0 },
                ]);

                // Source Data
                const sourceCounts = leads.reduce((acc: any, lead) => {
                    const src = lead.source || 'Unknown';
                    acc[src] = (acc[src] || 0) + 1;
                    return acc;
                }, {});

                setSourceData(Object.entries(sourceCounts).map(([name, value]) => ({ name, value: value as number })));

            } catch (error) {
                console.error("Error fetching stats", error);
            } finally {
                setLoading(false);
            }
        }

        fetchStats();
    }, [supabase]);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dashboard</h1>
                <div className="flex items-center gap-2">
                    {/* Date Range Picker Placeholder */}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.totalLeads}
                        </div>
                        <p className="text-xs text-muted-foreground">All time leads</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Web3 Segment</CardTitle>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.web3Segments}
                        </div>
                        <p className="text-xs text-muted-foreground">Target segment leads</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Demos</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.demoScheduled}
                        </div>
                        <p className="text-xs text-muted-foreground">Scheduled demos</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Deals</CardTitle>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {loading ? "..." : stats.activeDeals}
                        </div>
                        <p className="text-xs text-muted-foreground">In progress pipeline</p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Pipeline Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        {loading ? <div className="h-[350px] bg-slate-100 animate-pulse rounded" /> : <FunnelChart data={funnelData} />}
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Lead Sources</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? <div className="h-[250px] bg-slate-100 animate-pulse rounded" /> : <SourceChart data={sourceData} />}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
