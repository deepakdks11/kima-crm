'use client';

import { Lead } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface LeadCardProps {
    lead: Lead;
}

const getSegmentBadgeClass = (segment: string | string[]) => {
    // If array, use the first one or join them for classification
    const segmentStr = Array.isArray(segment) ? segment.join(' ').toLowerCase() : (segment || '').toLowerCase();

    if (segmentStr.includes('export')) return 'badge-exporter';
    if (segmentStr.includes('freelance')) return 'badge-freelancer';
    if (segmentStr.includes('agency')) return 'badge-agency';
    if (segmentStr.includes('wallet')) return 'badge-wallet';
    if (segmentStr.includes('dapp')) return 'badge-dapp';
    if (segmentStr.includes('payment')) return 'badge-payments';
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

export function LeadCard({ lead }: LeadCardProps) {
    return (
        <Link href={`/leads/${lead.id}`}>
            <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer border-border/50 touch-target">
                <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base truncate">
                                {lead.company_name || lead.lead_name}
                            </h3>
                            <p className="text-sm text-muted-foreground truncate">
                                {lead.lead_name}
                            </p>
                        </div>
                        <ExternalLink className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-2">
                        {lead.segment && (
                            <Badge
                                variant="outline"
                                className={cn("text-xs", getSegmentBadgeClass(lead.segment))}
                            >
                                {Array.isArray(lead.segment) ? lead.segment.join(', ') : lead.segment}
                            </Badge>
                        )}
                        {lead.status && (
                            <Badge
                                variant="outline"
                                className={cn("text-xs capitalize", getStatusBadgeClass(lead.status))}
                            >
                                {lead.status.toLowerCase()}
                            </Badge>
                        )}
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center justify-between text-sm pt-2 border-t">
                        <div className="flex items-center gap-4">
                            <div>
                                <span className="text-muted-foreground text-xs">Score:</span>
                                <span className={cn(
                                    "ml-1 font-semibold",
                                    lead.lead_score > 80 ? "text-green-600 dark:text-green-400" : "text-foreground"
                                )}>
                                    {lead.lead_score}
                                </span>
                            </div>
                            {lead.last_contact_date && (
                                <div className="text-xs text-muted-foreground">
                                    Last: {format(new Date(lead.last_contact_date), 'MMM d')}
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
