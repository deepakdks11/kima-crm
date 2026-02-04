
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';

interface ActivityLog {
    id: string;
    created_at: string;
    action: string;
    details: any;
    user_id: string; // Could join with auth.users if we had access, or just show 'User'
}

interface ActivityLogListProps {
    leadId: string;
}

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

    if (loading) return <div className="text-sm text-gray-500">Loading history...</div>;
    if (logs.length === 0) return <div className="text-sm text-gray-500">No activity recorded.</div>;

    return (
        <ScrollArea className="h-[200px] w-full rounded-md border p-4">
            <div className="space-y-4">
                {logs.map((log) => (
                    <div key={log.id} className="text-sm">
                        <div className="flex items-center justify-between">
                            <span className="font-semibold text-gray-900">
                                {formatAction(log.action)}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                            </span>
                        </div>
                        <div className="text-gray-600 mt-1">
                            {formatDetails(log.details)}
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>
    );
}

function formatAction(action: string) {
    switch (action) {
        case 'CREATED': return 'Lead Created';
        case 'UPDATED': return 'Lead Updated';
        case 'STATUS_CHANGE': return 'Status Changed';
        default: return action;
    }
}

function formatDetails(details: any) {
    if (!details) return null;
    if (typeof details === 'string') return details;

    // Check if it's a change object { field: { from, to }}
    if (Object.keys(details).length > 0 && typeof Object.values(details)[0] === 'object') {
        return Object.entries(details).map(([key, val]: [string, any]) => {
            if (val?.from !== undefined && val?.to !== undefined) {
                return (
                    <div key={key}>
                        <span className="font-medium capitalize">{key.replace('_', ' ')}</span>:
                        <span className="line-through mx-1 text-gray-400">{val.from || 'Empty'}</span>
                        &rarr;
                        <span className="ml-1 text-gray-800">{val.to || 'Empty'}</span>
                    </div>
                );
            }
            return <div key={key}>{JSON.stringify(val)}</div>
        });
    }

    return JSON.stringify(details);
}
