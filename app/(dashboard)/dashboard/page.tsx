'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Wallet, ArrowUpRight, CheckSquare, TrendingUp, Target, Activity, LayoutDashboard } from "lucide-react";
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
    gradient: string;
    iconColor: string;
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
                // Fetch all leads for real-time aggregation
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
        <div className="space-y-10">
            {/* Page Header / Welcome */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60">
                        Dashboard
                    </h1>
                    <p className="text-muted-foreground font-medium">
                        Welcome back! Here&apos;s what&apos;s happening in your pipeline.
                    </p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-2xl glass backdrop-blur-md">
                    <Activity className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm font-bold tracking-wide uppercase">Real-time Analytics</span>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <KPICard
                    title="Total Leads"
                    value={stats.totalLeads}
                    loading={loading}
                    icon={Users}
                    description="All time captured leads"
                    gradient="from-blue-500/10 to-transparent"
                    iconColor="text-blue-500"
                />
                <KPICard
                    title="Web3 Segment"
                    value={stats.web3Segments}
                    loading={loading}
                    icon={Target}
                    description="Strategic target accounts"
                    gradient="from-indigo-500/10 to-transparent"
                    iconColor="text-indigo-500"
                />
                <KPICard
                    title="Demos Ready"
                    value={stats.demoScheduled}
                    loading={loading}
                    icon={TrendingUp}
                    description="Scheduled presentations"
                    gradient="from-purple-500/10 to-transparent"
                    iconColor="text-purple-500"
                />
                <KPICard
                    title="Active Deals"
                    value={stats.activeDeals}
                    loading={loading}
                    icon={ArrowUpRight}
                    description="High intent opportunities"
                    gradient="from-pink-500/10 to-transparent"
                    iconColor="text-pink-500"
                />
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                <Card className="lg:col-span-4 glass-card overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Pipeline Funnel</CardTitle>
                                <CardDescription>Sales journey distribution</CardDescription>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <LayoutDashboard className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <PipelineFunnel data={pipelineData} />
                    </CardContent>
                </Card>

                <Card className="lg:col-span-3 glass-card overflow-hidden">
                    <CardHeader className="border-b border-white/5 bg-white/5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Lead Segments</CardTitle>
                                <CardDescription>Industry breakdown</CardDescription>
                            </div>
                            <div className="h-8 w-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                <Wallet className="h-4 w-4 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <SegmentPieChart data={segmentData} />
                    </CardContent>
                </Card>
            </div>

            {/* Today's Tasks */}
            <Card className="glass-card border-dashed">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-bold">
                        <CheckSquare className="h-6 w-6 text-primary" />
                        Intelligence Feed
                    </CardTitle>
                    <CardDescription>Automated insights and prioritized actions</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-sm font-medium text-center text-muted-foreground py-12 flex flex-col items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                            <Activity className="h-6 w-6 text-primary/40" />
                        </div>
                        No urgent follow-ups required. Your pipeline is healthy!
                    </div>
                </CardContent>
            </Card>

            <div className="text-[10px] text-center text-muted-foreground/30 py-4">
                Last updated: {format(new Date(), 'HH:mm:ss')}
            </div>
        </div>
    );
}

function KPICard({ title, value, loading, icon: Icon, description, gradient, iconColor }: KPICardProps) {
    return (
        <Card className={cn("glass-card overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/5 border-white/10 relative h-full")}>
            <div className={cn("absolute inset-0 bg-gradient-to-br opacity-50", gradient)} />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground/80">{title}</CardTitle>
                <div className={cn("p-2 rounded-xl bg-white/10 border border-white/10 group-hover:scale-110 transition-transform duration-300 shadow-sm", iconColor)}>
                    <Icon className="h-4 w-4" />
                </div>
            </CardHeader>
            <CardContent className="relative z-10">
                <div className="text-3xl font-black tracking-tight mb-1">
                    {loading ? (
                        <div className="h-8 w-16 bg-white/10 animate-pulse rounded" />
                    ) : (
                        value
                    )}
                </div>
                <p className="text-[11px] font-medium text-muted-foreground/70 uppercase tracking-tight">{description}</p>
            </CardContent>
        </Card>
    );
}
