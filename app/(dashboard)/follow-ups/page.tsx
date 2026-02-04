'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    Calendar,
    Building2,
    ArrowRight,
    Plus,
    Filter
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Lead } from "@/lib/types";
import { format, isToday, isBefore, isAfter, startOfDay, endOfDay } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

const getSegmentBadgeClass = (segment: string) => {
    const segmentLower = segment.toLowerCase();
    if (segmentLower.includes('export')) return 'badge-exporter';
    if (segmentLower.includes('freelance')) return 'badge-freelancer';
    if (segmentLower.includes('agency')) return 'badge-agency';
    if (segmentLower.includes('wallet')) return 'badge-wallet';
    if (segmentLower.includes('dapp')) return 'badge-dapp';
    if (segmentLower.includes('payment')) return 'badge-payments';
    return '';
};

export default function FollowUpsPage() {
    const supabase = createClient();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFollowUps() {
            const { data } = await supabase
                .from('leads')
                .select('*')
                .not('next_followup_date', 'is', null)
                .order('next_followup_date', { ascending: true });

            if (data) setLeads(data);
            setLoading(false);
        }

        fetchFollowUps();
    }, [supabase]);

    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const overdueLeads = leads.filter(lead =>
        lead.next_followup_date && isBefore(new Date(lead.next_followup_date), todayStart)
    );

    const todayLeads = leads.filter(lead =>
        lead.next_followup_date &&
        isToday(new Date(lead.next_followup_date))
    );

    const upcomingLeads = leads.filter(lead =>
        lead.next_followup_date && isAfter(new Date(lead.next_followup_date), todayEnd)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Follow-ups</h1>
                    <p className="text-muted-foreground mt-1">
                        Stay on top of your pipeline with scheduled touchpoints.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="touch-target">
                        <Filter className="h-4 w-4 mr-2" />
                        Filter
                    </Button>
                    <Button size="sm" className="touch-target">
                        <Plus className="h-4 w-4 mr-2" />
                        New Task
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                    title="Overdue"
                    count={overdueLeads.length}
                    icon={AlertCircle}
                    color="text-red-600 dark:text-red-400"
                    bgColor="bg-red-500/10"
                />
                <StatCard
                    title="Due Today"
                    count={todayLeads.length}
                    icon={CheckCircle2}
                    color="text-green-600 dark:text-green-400"
                    bgColor="bg-green-500/10"
                />
                <StatCard
                    title="Upcoming"
                    count={upcomingLeads.length}
                    icon={Clock}
                    color="text-blue-600 dark:text-blue-400"
                    bgColor="bg-blue-500/10"
                />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="today" className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-3 h-auto">
                    <TabsTrigger value="overdue" className="touch-target relative">
                        Overdue
                        {overdueLeads.length > 0 && (
                            <Badge variant="destructive" className="ml-2 h-5 min-w-[20px] px-1.5">
                                {overdueLeads.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="today" className="touch-target relative">
                        Today
                        {todayLeads.length > 0 && (
                            <Badge className="ml-2 h-5 min-w-[20px] px-1.5">
                                {todayLeads.length}
                            </Badge>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="upcoming" className="touch-target">
                        Upcoming
                    </TabsTrigger>
                </TabsList>

                {/* Overdue Tab */}
                <TabsContent value="overdue" className="mt-6">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : overdueLeads.length === 0 ? (
                        <EmptyState
                            icon={CheckCircle2}
                            title="All caught up!"
                            description="You have no overdue follow-ups. Great work staying on top of your pipeline."
                        />
                    ) : (
                        <div className="space-y-3">
                            {overdueLeads.map((lead) => (
                                <FollowUpCard
                                    key={lead.id}
                                    lead={lead}
                                    variant="overdue"
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Today Tab */}
                <TabsContent value="today" className="mt-6">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : todayLeads.length === 0 ? (
                        <EmptyState
                            icon={Calendar}
                            title="No tasks due today"
                            description="You have a clear schedule for today. Check upcoming tasks to plan ahead."
                        />
                    ) : (
                        <div className="space-y-3">
                            {todayLeads.map((lead) => (
                                <FollowUpCard
                                    key={lead.id}
                                    lead={lead}
                                    variant="today"
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>

                {/* Upcoming Tab */}
                <TabsContent value="upcoming" className="mt-6">
                    {loading ? (
                        <LoadingSkeleton />
                    ) : upcomingLeads.length === 0 ? (
                        <EmptyState
                            icon={Clock}
                            title="No upcoming tasks"
                            description="Schedule follow-ups to keep your pipeline moving forward."
                            action={{
                                label: "Schedule Task",
                                onClick: () => console.log('Schedule task')
                            }}
                        />
                    ) : (
                        <div className="space-y-3">
                            {upcomingLeads.map((lead) => (
                                <FollowUpCard
                                    key={lead.id}
                                    lead={lead}
                                    variant="upcoming"
                                />
                            ))}
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard({ title, count, icon: Icon, color, bgColor }: {
    title: string;
    count: number;
    icon: any;
    color: string;
    bgColor: string;
}) {
    return (
        <Card className="border-border/50">
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <p className="text-3xl font-bold mt-2">{count}</p>
                    </div>
                    <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center", bgColor)}>
                        <Icon className={cn("h-6 w-6", color)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function FollowUpCard({ lead, variant }: { lead: Lead; variant: 'overdue' | 'today' | 'upcoming' }) {
    const variantStyles = {
        overdue: 'border-red-500/20 bg-red-500/5',
        today: 'border-green-500/20 bg-green-500/5',
        upcoming: 'border-border/50',
    };

    const dateColor = {
        overdue: 'text-red-600 dark:text-red-400',
        today: 'text-green-600 dark:text-green-400',
        upcoming: 'text-blue-600 dark:text-blue-400',
    };

    return (
        <Card className={cn(
            "transition-all hover:shadow-md group",
            variantStyles[variant]
        )}>
            <CardContent className="p-4">
                <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-primary" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                            <div className="flex-1 min-w-0">
                                <h3 className="font-semibold truncate">
                                    {lead.company_name || lead.lead_name}
                                </h3>
                                <p className="text-sm text-muted-foreground truncate">
                                    {lead.lead_name}
                                </p>
                            </div>
                            <Link href={`/leads/${lead.id}`}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="opacity-0 group-hover:opacity-100 transition-opacity touch-target"
                                >
                                    View
                                    <ArrowRight className="h-4 w-4 ml-1" />
                                </Button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {lead.segment && (
                                <Badge variant="outline" className={cn("text-xs", getSegmentBadgeClass(lead.segment))}>
                                    {lead.segment}
                                </Badge>
                            )}
                            {lead.next_followup_date && (
                                <div className={cn("flex items-center gap-1 text-xs font-medium", dateColor[variant])}>
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(lead.next_followup_date), 'MMM d, yyyy')}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <Button size="sm" variant="default" className="touch-target">
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Complete
                            </Button>
                            <Button size="sm" variant="outline" className="touch-target">
                                Reschedule
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2, 3].map((i) => (
                <Card key={i} className="border-border/50">
                    <CardContent className="p-4">
                        <div className="flex gap-4 animate-pulse">
                            <div className="h-10 w-10 rounded-lg bg-muted" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-1/3 bg-muted rounded" />
                                <div className="h-3 w-1/2 bg-muted rounded" />
                                <div className="h-8 w-24 bg-muted rounded mt-3" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
