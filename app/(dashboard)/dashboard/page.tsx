'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Target, TrendingUp, ArrowUpRight, Activity, LayoutDashboard, Wallet, CheckSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PipelineFunnel } from "@/components/dashboard/pipeline-funnel";
import { SegmentPieChart } from "@/components/dashboard/segment-pie-chart";
import { format } from "date-fns";
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    title: string;
    value: number | string;
    loading: boolean;
    icon: LucideIcon;
    description: string;
    trend?: string;
    trendUp?: boolean;
}

export default function DashboardPage() {
    const supabase = createClient();
    const [stats, setStats] = useState({
        totalLeads: 0,
        web3Segments: 0,
        demoScheduled: 0,
        activeDeals: 0
    });
    const [pipelineData, setPipelineData] = useState<{ name: string; value: number }[]>([]);
    const [segmentData, setSegmentData] = useState<{ name: string; value: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboardData() {
            try {
                const { data: leads, error } = await supabase
                    .from('leads')
                    .select('status, segment');

                if (error) throw error;

                if (leads) {
                    const total = leads.length;
                    const web3 = leads.filter(l => l.segment === 'Web3').length;
                    const demos = leads.filter(l => l.status === 'Demo Scheduled').length;
                    const active = leads.filter(l => ['Negotiation', 'Demo Scheduled', 'Contacted'].includes(l.status)).length;

                    setStats({
                        totalLeads: total,
                        web3Segments: web3,
                        demoScheduled: demos,
                        activeDeals: active
                    });

                    // Pipeline aggregation
                    const statuses = ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Onboarded', 'Lost'];
                    const pData = statuses.map(status => ({
                        name: status === 'Demo Scheduled' ? 'Demo' : status,
                        value: leads.filter(l => l.status === status).length
                    }));
                    setPipelineData(pData);

                    // Segment aggregation
                    const uniqueSegments = Array.from(new Set(leads.map(l => l.segment || 'Other')));
                    const sData = uniqueSegments.map(seg => ({
                        name: seg,
                        value: leads.filter(l => l.segment === seg).length
                    }));
                    setSegmentData(sData);
                }
            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        }

        fetchDashboardData();
    }, [supabase]);

    return (
        <div className="space-y-8">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Dashboard
                </h1>
                <p className="text-muted-foreground">
                    Welcome back! Here's what's happening in your pipeline.
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Leads"
                    value={stats.totalLeads}
                    loading={loading}
                    icon={Users}
                    description="All captured leads"
                    trend="+12% from last month"
                    trendUp={true}
                />
                <KPICard
                    title="Web3 Segment"
                    value={stats.web3Segments}
                    loading={loading}
                    icon={Target}
                    description="Strategic accounts"
                    trend="+8% from last month"
                    trendUp={true}
                />
                <KPICard
                    title="Demos Ready"
                    value={stats.demoScheduled}
                    loading={loading}
                    icon={TrendingUp}
                    description="Scheduled presentations"
                    trend="+23% from last month"
                    trendUp={true}
                />
                <KPICard
                    title="Active Deals"
                    value={stats.activeDeals}
                    loading={loading}
                    icon={ArrowUpRight}
                    description="High intent opportunities"
                    trend="In progress"
                    trendUp={true}
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-7">
                <Card className="lg:col-span-4 overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Pipeline Funnel</CardTitle>
                                <CardDescription>Sales journey distribution</CardDescription>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                <LayoutDashboard className="h-5 w-5 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <PipelineFunnel data={pipelineData} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="border-b bg-muted/30">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-semibold">Lead Segments</CardTitle>
                                <CardDescription>Industry breakdown</CardDescription>
                            </div>
                            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-violet-500" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <SegmentPieChart data={segmentData} />
                    </CardContent>
                </Card>
            </div>

            {/* Today's Work Section */}
            <Card className="border-dashed border-2 border-border/50">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <CheckSquare className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-xl font-bold">Today's Priority Tasks</CardTitle>
                            <CardDescription>Automated insights and prioritized actions</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-sm font-medium text-center text-muted-foreground py-12 flex flex-col items-center gap-3">
                        <div className="h-16 w-16 rounded-full bg-primary/5 flex items-center justify-center border-2 border-primary/10">
                            <Activity className="h-8 w-8 text-primary/40" />
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold text-foreground">All caught up!</p>
                            <p className="text-xs">No urgent follow-ups required. Your pipeline is healthy.</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Footer Timestamp */}
            <div className="text-xs text-center text-muted-foreground/50 py-2">
                Last updated: {format(new Date(), 'MMM d, yyyy • HH:mm:ss')}
            </div>
        </div>
    );
}

function KPICard({ title, value, loading, icon: Icon, description, trend, trendUp }: KPICardProps) {
    return (
        <Card className={cn(
            "overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-border/50 relative"
        )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {title}
                </CardTitle>
                <div className="p-2.5 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    <Icon className="h-4 w-4 text-primary" />
                </div>
            </CardHeader>
            <CardContent className="space-y-1">
                <div className="text-3xl font-bold tracking-tight">
                    {loading ? (
                        <div className="h-9 w-20 bg-muted animate-pulse rounded" />
                    ) : (
                        value
                    )}
                </div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
                {trend && (
                    <div className={cn(
                        "text-xs font-medium flex items-center gap-1 pt-1",
                        trendUp ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                    )}>
                        {trendUp && <TrendingUp className="h-3 w-3" />}
                        {trend}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
