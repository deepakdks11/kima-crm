'use client';

import { use, useEffect, useState } from 'react';
import { createClient } from "@/lib/supabase/client";
import { Lead } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLogList } from "@/components/activity/activity-log-list";
import { format } from 'date-fns';
import { ArrowLeft, Edit, MessageSquare, Calendar } from "lucide-react";
import Link from 'next/link';

export default function LeadProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const supabase = createClient();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchLead() {
            const { data } = await supabase
                .from('leads')
                .select('*')
                .eq('id', resolvedParams.id)
                .single();

            if (data) setLead(data);
            setLoading(false);
        }
        fetchLead();
    }, [resolvedParams.id, supabase]);

    if (loading) return <div className="p-12 text-center text-muted-foreground">Loading profile...</div>;
    if (!lead) return <div className="p-12 text-center">Lead not found.</div>;

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Link href="/leads">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold tracking-tight">{lead.company_name || lead.lead_name}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{lead.segment}</Badge>
                        <Badge>{lead.status}</Badge>
                        <span className="text-xs text-muted-foreground ml-2">Score: {lead.lead_score}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Note
                    </Button>
                    <Button size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Lead
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-12 p-0 gap-8">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">Overview</TabsTrigger>
                    <TabsTrigger value="activity" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">Activity Timeline</TabsTrigger>
                    <TabsTrigger value="followups" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-0">Follow-ups</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="pt-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        <Card className="md:col-span-2">
                            <CardHeader>
                                <CardTitle>Business Details</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-4 sm:grid-cols-2 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Contact Person</p>
                                    <p className="font-medium">{lead.lead_name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Email</p>
                                    <p className="font-medium">{lead.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Currency Flow</p>
                                    <p className="font-medium">{lead.currency_flow || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Geography</p>
                                    <p className="font-medium">{lead.client_geography || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="grid gap-3 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Source</span>
                                    <span className="font-medium">{lead.source}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Product</span>
                                    <span className="font-medium">{lead.product_fit}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="activity" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Audit Trail</CardTitle>
                            <CardDescription>Comprehensive history of all interactions and status changes.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ActivityLogList leadId={lead.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="followups" className="pt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Scheduled Follow-ups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-4 p-4 border rounded-xl">
                                <Calendar className="h-8 w-8 text-orange-500" />
                                <div className="flex-1">
                                    <p className="font-medium">Next Follow-up Call</p>
                                    <p className="text-sm text-muted-foreground">
                                        {lead.next_followup_date ? format(new Date(lead.next_followup_date), 'MMMM d, yyyy') : 'No date set'}
                                    </p>
                                </div>
                                <Button variant="outline" size="sm">Reschedule</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
