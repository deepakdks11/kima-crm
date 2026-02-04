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
import {
    ArrowLeft,
    Edit,
    MessageSquare,
    Calendar,
    Mail,
    Globe,
    DollarSign,
    TrendingUp,
    FileText,
    Clock,
    CheckCircle2,
    Building2,
    User as UserIcon,
    MapPin,
    Plus,
    Loader2,
    XCircle
} from "lucide-react";
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LeadForm } from '@/components/leads/lead-form';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

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

const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === 'new') return 'badge-new';
    if (statusLower === 'contacted') return 'badge-contacted';
    if (statusLower.includes('demo')) return 'badge-demo';
    if (statusLower === 'negotiation') return 'badge-negotiation';
    if (statusLower === 'onboarded') return 'badge-onboarded';
    if (statusLower === 'lost') return 'badge-lost';
    return '';
};

export default function LeadProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const supabase = createClient();
    const [lead, setLead] = useState<Lead | null>(null);
    const [loading, setLoading] = useState(true);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [noteDialogOpen, setNoteDialogOpen] = useState(false);
    const [noteContent, setNoteContent] = useState('');
    const [isSavingNote, setIsSavingNote] = useState(false);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                    <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse mx-auto" />
                    <p className="text-sm text-muted-foreground">Loading profile...</p>
                </div>
            </div>
        );
    }

    if (!lead) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center space-y-3">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mx-auto">
                        <UserIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg">Lead not found</h3>
                        <p className="text-sm text-muted-foreground">This lead may have been deleted.</p>
                    </div>
                    <Link href="/leads">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Leads
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const handleSaveNote = async () => {
        if (!noteContent.trim() || !lead) return;
        setIsSavingNote(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            const { error: noteError } = await supabase.from('activity_logs').insert([{
                lead_id: lead.id,
                user_id: user?.id,
                action: 'NOTE',
                details: { content: noteContent.trim() }
            }]);

            if (noteError) throw noteError;

            setNoteContent('');
            setNoteDialogOpen(false);
            const { data } = await supabase.from('leads').select('*').eq('id', lead.id).single();
            if (data) setLead(data);
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Failed to save note');
        } finally {
            setIsSavingNote(false);
        }
    };

    const handleCompleteFollowup = async () => {
        if (!lead) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();

            // Mark as contacted if currently new
            const newStatus = lead.status === 'New' ? 'Contacted' : lead.status;

            const { error: updateError } = await supabase
                .from('leads')
                .update({
                    next_followup_date: null,
                    last_contact_date: new Date().toISOString(),
                    status: newStatus
                })
                .eq('id', lead.id);

            if (updateError) throw updateError;

            // Log activity
            await supabase.from('activity_logs').insert([{
                lead_id: lead.id,
                user_id: user?.id,
                action: 'FOLLOWUP_COMPLETED',
                details: {
                    message: 'Follow-up call completed',
                    previous_status: lead.status,
                    new_status: newStatus
                }
            }]);

            // Refresh data
            const { data } = await supabase.from('leads').select('*').eq('id', lead.id).single();
            if (data) setLead(data);
        } catch (error) {
            console.error('Error completing follow-up:', error);
            alert('Failed to complete follow-up');
        }
    };

    const handleRescheduleFollowup = () => {
        setEditDialogOpen(true);
        // UX improvement: The date field will be visible in the edit form
    };

    const handleCancelFollowup = async () => {
        if (!lead) return;
        try {
            const { data: { user } } = await supabase.auth.getUser();

            const { error: updateError } = await supabase
                .from('leads')
                .update({
                    next_followup_date: null
                })
                .eq('id', lead.id);

            if (updateError) throw updateError;

            // Log activity
            await supabase.from('activity_logs').insert([{
                lead_id: lead.id,
                user_id: user?.id,
                action: 'FOLLOWUP_CANCELLED',
                details: {
                    message: 'Follow-up call cancelled'
                }
            }]);

            // Refresh data
            const { data } = await supabase.from('leads').select('*').eq('id', lead.id).single();
            if (data) setLead(data);
        } catch (error) {
            console.error('Error cancelling follow-up:', error);
            alert('Failed to cancel follow-up');
        }
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="flex items-start gap-3">
                    <Link href="/leads">
                        <Button variant="ghost" size="icon" className="touch-target">
                            <ArrowLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div className="flex-1 min-w-0">
                        <h1 className="text-2xl md:text-3xl font-bold tracking-tight truncate">
                            {lead.company_name || lead.lead_name}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
                            {lead.segment && (
                                <Badge variant="outline" className={cn("font-normal", getSegmentBadgeClass(lead.segment))}>
                                    {lead.segment}
                                </Badge>
                            )}
                            {lead.status && (
                                <Badge variant="outline" className={cn("font-normal capitalize", getStatusBadgeClass(lead.status))}>
                                    {lead.status.toLowerCase()}
                                </Badge>
                            )}
                            <div className="flex items-center gap-1 text-sm">
                                <TrendingUp className="h-3 w-3 text-muted-foreground" />
                                <span className={cn(
                                    "font-semibold",
                                    lead.lead_score > 80 ? "text-green-600 dark:text-green-400" : "text-muted-foreground"
                                )}>
                                    Score: {lead.lead_score}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="touch-target" onClick={() => setNoteDialogOpen(true)}>
                        <MessageSquare className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Add Note</span>
                        <span className="sm:hidden">Note</span>
                    </Button>
                    <Button size="sm" className="touch-target" onClick={() => setEditDialogOpen(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        <span className="hidden sm:inline">Edit Lead</span>
                        <span className="sm:hidden">Edit</span>
                    </Button>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b bg-transparent rounded-none h-auto p-0 gap-4 md:gap-8">
                    <TabsTrigger
                        value="overview"
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-1 touch-target"
                    >
                        Overview
                    </TabsTrigger>
                    <TabsTrigger
                        value="notes"
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-1 touch-target"
                    >
                        Notes
                    </TabsTrigger>
                    <TabsTrigger
                        value="timeline"
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-1 touch-target"
                    >
                        Timeline
                    </TabsTrigger>
                    <TabsTrigger
                        value="followups"
                        className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-12 px-1 touch-target"
                    >
                        Follow-ups
                    </TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="pt-6 space-y-6">
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Business Details */}
                        <Card className="md:col-span-2 border-border/50">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <CardTitle>Business Details</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="grid gap-6 sm:grid-cols-2">
                                <InfoItem icon={UserIcon} label="Contact Person" value={lead.lead_name} />
                                <InfoItem icon={Mail} label="Email" value={lead.email || 'Not provided'} />
                                <InfoItem icon={DollarSign} label="Currency Flow" value={lead.currency_flow || 'Not specified'} />
                                <InfoItem icon={MapPin} label="Geography" value={lead.client_geography || 'Not specified'} />
                            </CardContent>
                        </Card>

                        {/* Tracking Info */}
                        <Card className="border-border/50">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                                        <FileText className="h-4 w-4 text-violet-500" />
                                    </div>
                                    <CardTitle>Tracking</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Source</span>
                                    <span className="text-sm font-medium text-right">{lead.source || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Product Fit</span>
                                    <span className="text-sm font-medium text-right">{lead.product_fit || 'Not assessed'}</span>
                                </div>
                                <div className="flex justify-between items-start">
                                    <span className="text-sm text-muted-foreground">Created</span>
                                    <span className="text-sm font-medium text-right">
                                        {lead.created_at ? format(new Date(lead.created_at), 'MMM d, yyyy') : 'N/A'}
                                    </span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Additional Info */}
                    {lead.notes && (
                        <Card className="border-border/50">
                            <CardHeader>
                                <CardTitle className="text-lg">Internal Notes</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                    {lead.notes}
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                {/* Notes Tab */}
                <TabsContent value="notes" className="pt-6">
                    <Card className="border-border/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Notes & Comments</CardTitle>
                                    <CardDescription>Add context and track conversations</CardDescription>
                                </div>
                                <Button size="sm" onClick={() => setNoteDialogOpen(true)}>
                                    <MessageSquare className="h-4 w-4 mr-2" />
                                    New Note
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ActivityLogList leadId={lead.id} filterAction="NOTE" />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Timeline Tab */}
                <TabsContent value="timeline" className="pt-6">
                    <Card className="border-border/50">
                        <CardHeader>
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                    <Clock className="h-4 w-4 text-blue-500" />
                                </div>
                                <div>
                                    <CardTitle>Activity Timeline</CardTitle>
                                    <CardDescription>Complete history of all interactions and changes</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ActivityLogList leadId={lead.id} />
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Follow-ups Tab */}
                <TabsContent value="followups" className="pt-6">
                    <Card className="border-border/50">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Scheduled Follow-ups</CardTitle>
                                    <CardDescription>Manage upcoming touchpoints</CardDescription>
                                </div>
                                <Button size="sm" onClick={handleRescheduleFollowup}>
                                    <Calendar className="h-4 w-4 mr-2" />
                                    Schedule
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {lead.next_followup_date ? (
                                <div className="flex items-start gap-4 p-4 border border-border/50 rounded-xl bg-muted/30">
                                    <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                                        <Calendar className="h-5 w-5 text-orange-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold">Next Follow-up Call</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {format(new Date(lead.next_followup_date), 'EEEE, MMMM d, yyyy')}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-2">
                                            {formatDistanceToDate(new Date(lead.next_followup_date))}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="touch-target"
                                            onClick={handleCompleteFollowup}
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            Complete
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="touch-target"
                                            onClick={handleRescheduleFollowup}
                                        >
                                            Reschedule
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="touch-target text-destructive hover:text-destructive hover:bg-destructive/10"
                                            onClick={handleCancelFollowup}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 text-muted-foreground">
                                    <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                    <p className="font-medium">No follow-ups scheduled</p>
                                    <p className="text-sm mb-4">Stay on top of your pipeline by scheduling your next touchpoint.</p>
                                    <Button size="sm" onClick={handleRescheduleFollowup}>
                                        <Calendar className="h-4 w-4 mr-2" />
                                        Schedule Follow-up
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Dialogs */}
            <LeadForm
                open={editDialogOpen}
                onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (!open) {
                        // Refresh lead data after editing
                        supabase.from('leads').select('*').eq('id', lead.id).single().then(({ data }) => {
                            if (data) setLead(data);
                        });
                    }
                }}
                lead={lead}
            />

            <Dialog open={noteDialogOpen} onOpenChange={setNoteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Internal Note</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <Textarea
                            placeholder="Type your note here..."
                            value={noteContent}
                            onChange={(e) => setNoteContent(e.target.value)}
                            className="min-h-[150px]"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setNoteDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveNote} disabled={isSavingNote || !noteContent.trim()}>
                            {isSavingNote ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Save Note
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
            </div>
            <p className="font-medium text-sm pl-5">{value}</p>
        </div>
    );
}

function formatDistanceToDate(date: Date) {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Today';
    if (days === 1) return 'Tomorrow';
    return `In ${days} days`;
}
