'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import {
    FileText,
    Edit,
    ArrowRightLeft,
    Plus,
    Activity as ActivityIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityLog {
    id: string;
    created_at: string;
    action: string;
    details: unknown;
    user_id: string;
}

interface ActivityLogListProps {
    leadId: string;
}

const ACTION_ICONS: Record<string, any> = {
    'CREATED': Plus,
    'UPDATED': Edit,
    'STATUS_CHANGE': ArrowRightLeft,
    'DEFAULT': FileText,
};

const ACTION_COLORS: Record<string, string> = {
    'CREATED': 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    'UPDATED': 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    'STATUS_CHANGE': 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
    'DEFAULT': 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20',
};

export function ActivityLogList({ leadId }: ActivityLogListProps) {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        async function fetchLogs() {
            const { data, error } = await supabase
                .from('activity_logs')
                .select('*')
                .eq('lead_id', leadId)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching logs:', error);
            } else {
                setLogs(data || []);
            }
            setLoading(false);
        }

        fetchLogs();
    }, [leadId, supabase]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 animate-pulse">
                        <div className="h-10 w-10 rounded-full bg-muted" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-1/3 bg-muted rounded" />
                            <div className="h-3 w-1/2 bg-muted rounded" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (logs.length === 0) {
        return (
            <div className="text-center py-12">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                    <ActivityIcon className="h-8 w-8 text-muted-foreground/50" />
                </div>
                <p className="font-medium text-muted-foreground">No activity recorded</p>
                <p className="text-sm text-muted-foreground mt-1">
                    Actions and changes will appear here as they happen.
                </p>
            </div>
        );
    }

    return (
        <ScrollArea className="h-[500px] w-full pr-4">
            <div className="relative space-y-6 pb-4">
                {/* Timeline Line */}
                <div className="absolute left-5 top-5 bottom-0 w-px bg-border" />

                {logs.map((log, index) => {
                    const Icon = ACTION_ICONS[log.action] || ACTION_ICONS['DEFAULT'];
                    const colorClass = ACTION_COLORS[log.action] || ACTION_COLORS['DEFAULT'];

                    return (
                        <div key={log.id} className="relative flex gap-4 group">
                            {/* Icon */}
                            <div className={cn(
                                "relative z-10 h-10 w-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110",
                                colorClass
                            )}>
                                <Icon className="h-4 w-4" />
                            </div>

                            {/* Content */}
                            <div className="flex-1 pb-6">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                    <h4 className="font-semibold text-sm">
                                        {formatAction(log.action)}
                                    </h4>
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                                        {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                                    </span>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    {formatDetails(log.details)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </ScrollArea>
    );
}

function formatAction(action: string) {
    switch (action) {
        case 'CREATED': return 'Lead Created';
        case 'UPDATED': return 'Lead Updated';
        case 'STATUS_CHANGE': return 'Status Changed';
        case 'NOTE_ADDED': return 'Note Added';
        case 'EMAIL_SENT': return 'Email Sent';
        case 'CALL_LOGGED': return 'Call Logged';
        default: return action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
}

function formatDetails(details: unknown) {
    if (!details) return null;
    if (typeof details === 'string') return details;

    if (typeof details === 'object' && details !== null) {
        const entries = Object.entries(details as Record<string, unknown>);
        if (entries.length > 0) {
            const firstVal = entries[0][1];
            if (typeof firstVal === 'object' && firstVal !== null && 'from' in firstVal) {
                return (
                    <div className="space-y-1">
                        {entries.map(([key, val]) => {
                            const change = val as { from?: unknown, to?: unknown };
                            if (change?.from !== undefined || change?.to !== undefined) {
                                const fromStr = change.from ? String(change.from) : 'Empty';
                                const toStr = change.to ? String(change.to) : 'Empty';
                                return (
                                    <div key={key} className="flex items-center gap-2 text-sm">
                                        <span className="font-medium capitalize text-foreground">
                                            {key.replace(/_/g, ' ')}:
                                        </span>
                                        <span className="line-through text-muted-foreground">{fromStr}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span className="font-medium text-foreground">{toStr}</span>
                                    </div>
                                );
                            }
                            return <div key={key}>{JSON.stringify(val)}</div>;
                        })}
                    </div>
                );
            }
        }
    }

    return <span className="text-xs font-mono">{JSON.stringify(details)}</span>;
}
