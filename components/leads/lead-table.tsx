'use client';

import { useState } from 'react';
import { Lead } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Plus,
    MoreHorizontal,
    Upload,
    Edit,
    Trash2,
    Search,
    Filter,
    ExternalLink,
    Inbox,
    Clock,
    TrendingUp,
    ChevronDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react';
import { LeadForm } from '@/components/leads/lead-form';
import { CSVImporter } from '@/components/leads/csv-importer';
import { LeadExporter } from '@/components/leads/lead-exporter';
import { LeadCard } from '@/components/leads/lead-card';
import { EmptyState } from '@/components/ui/empty-state';
import { DeleteConfirmationDialog } from '@/components/settings/delete-confirmation-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

const getSegmentBadgeClass = (segment: string | string[]) => {
    // If array, use the first one or join them for classification
    const segmentStr = Array.isArray(segment) ? segment.join(' ').toLowerCase() : segment.toLowerCase();

    if (segmentStr.includes('export')) return 'badge-exporter';
    if (segmentStr.includes('freelance')) return 'badge-freelancer';
    if (segmentStr.includes('agency')) return 'badge-agency';
    if (segmentStr.includes('wallet')) return 'badge-wallet';
    if (segmentStr.includes('dapp')) return 'badge-dapp';
    if (segmentStr.includes('payment')) return 'badge-payments';
    return '';
};

const getStatusBadgeClass = (status: string) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'new') return 'badge-new';
    if (statusLower === 'contacted') return 'badge-contacted';
    if (statusLower.includes('demo')) return 'badge-demo';
    if (statusLower === 'negotiation') return 'badge-negotiation';
    if (statusLower === 'onboarded') return 'badge-onboarded';
    if (statusLower === 'lost') return 'badge-lost';
    return '';
};

interface StatusCounts {
    new: number;
    contacted: number;
    demo: number;
    negotiation: number;
}

interface LeadTableProps {
    initialLeads: Lead[];
}

export function LeadTable({ initialLeads }: LeadTableProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const searchQuery = searchParams.get('q') || '';
    const sortLabel = searchParams.get('sort') || 'newest';

    const leads = initialLeads || [];

    const handleEdit = (lead: Lead) => {
        setEditingLead(lead);
        setIsAddOpen(true);
    };

    const handleAdd = () => {
        setEditingLead(null);
        setIsAddOpen(true);
    };

    const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!leadToDelete) return;

        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('leads')
                .delete()
                .eq('id', leadToDelete.id);

            if (error) throw error;

            setLeadToDelete(null);
            router.refresh();
        } catch (error) {
            console.error('Error deleting lead:', error);
            alert('Failed to delete lead. You may not have permission.');
        } finally {
            setIsDeleting(false);
        }
    };

    const updateSort = (sort: string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort', sort);
        router.push(`/leads?${params.toString()}`);
    };

    const filteredAndSortedLeads = leads
        .filter(lead =>
            lead.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .sort((a, b) => {
            if (sortLabel === 'name_asc') return a.lead_name.localeCompare(b.lead_name);
            if (sortLabel === 'score_desc') return (b.lead_score || 0) - (a.lead_score || 0);
            if (sortLabel === 'score_asc') return (a.lead_score || 0) - (b.lead_score || 0);
            if (sortLabel === 'status_asc') return (a.status || '').localeCompare(b.status || '');
            if (sortLabel === 'segment_asc') {
                const segA = Array.isArray(a.segment) ? a.segment.join('') : (a.segment || '');
                const segB = Array.isArray(b.segment) ? b.segment.join('') : (b.segment || '');
                return segA.localeCompare(segB);
            }
            // Default: Newest first
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Leads</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage your relationships and track interactions.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <LeadExporter />
                    <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)} className="touch-target">
                        <Upload className="mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Import CSV</span>
                        <span className="sm:hidden">Import</span>
                    </Button>
                    <Button size="sm" onClick={handleAdd} className="touch-target">
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                </div>
            </div>

            {/* Actions Bar (No search bar here now, just Filter/Sort) */}
            <div className="flex items-center justify-between gap-2 border-b pb-4 border-border/50">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-muted-foreground ml-1">
                        {filteredAndSortedLeads.length} Lead{filteredAndSortedLeads.length !== 1 ? 's' : ''}
                    </span>
                    {searchQuery && (
                        <Badge variant="secondary" className="bg-primary/5 text-primary border-primary/10">
                            Search: {searchQuery}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="h-9 gap-2 touch-target">
                                <Filter className="h-4 w-4" />
                                <span>Sort: {sortLabel.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuLabel>Sort Options</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => updateSort('newest')}>
                                <Clock className="mr-2 h-4 w-4" /> Newest First
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSort('score_desc')}>
                                <TrendingUp className="mr-2 h-4 w-4" /> Score (High to Low)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSort('name_asc')}>
                                <ArrowUp className="mr-2 h-4 w-4" /> Name (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSort('status_asc')}>
                                <ArrowUp className="mr-2 h-4 w-4" /> Status (A-Z)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSort('segment_asc')}>
                                <ArrowUp className="mr-2 h-4 w-4" /> Segment (Web2/Web3)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Empty State */}
            {filteredAndSortedLeads.length === 0 && !searchQuery && (
                <EmptyState
                    icon={Inbox}
                    title="No leads yet"
                    description="Get started by adding your first lead or importing from CSV."
                    action={{
                        label: "Add Lead",
                        onClick: handleAdd
                    }}
                />
            )}

            {/* Search Empty State */}
            {filteredAndSortedLeads.length === 0 && searchQuery && (
                <EmptyState
                    icon={Search}
                    title="No results found"
                    description={`No leads found matching "${searchQuery}". Try a different search term.`}
                />
            )}

            {/* Mobile Card View */}
            {filteredAndSortedLeads.length > 0 && (
                <div className="md:hidden space-y-3">
                    {filteredAndSortedLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                    ))}
                </div>
            )}

            {/* Desktop Table View */}
            {filteredAndSortedLeads.length > 0 && (
                <div className="hidden md:block rounded-xl border border-border/50 bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[200px] font-semibold">Lead Name</TableHead>
                                <TableHead className="font-semibold">Company</TableHead>
                                <TableHead className="font-semibold">Segment</TableHead>
                                <TableHead className="font-semibold">Status</TableHead>
                                <TableHead className="font-semibold">Last Contact</TableHead>
                                <TableHead className="font-semibold">Score</TableHead>
                                <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAndSortedLeads.map((lead) => (
                                <TableRow key={lead.id} className="group transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold">{lead.lead_name}</span>
                                            <Link
                                                href={`/leads/${lead.id}`}
                                                className="text-[10px] text-primary flex items-center gap-1 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                View Profile <ExternalLink className="h-2 w-2" />
                                            </Link>
                                        </div>
                                    </TableCell>
                                    <TableCell className="font-medium">{lead.company_name}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn("font-normal", getSegmentBadgeClass(lead.segment))}
                                        >
                                            {Array.isArray(lead.segment) ? lead.segment.join(', ') : lead.segment}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={cn("font-normal capitalize", getStatusBadgeClass(lead.status))}
                                        >
                                            {lead.status?.toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {lead.last_contact_date
                                            ? format(new Date(lead.last_contact_date), 'MMM d, yyyy')
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "font-semibold",
                                            lead.lead_score > 80
                                                ? "text-green-600 dark:text-green-400"
                                                : "text-muted-foreground"
                                        )}>
                                            {lead.lead_score}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-40">
                                                <DropdownMenuLabel>Lead Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(lead)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit Details
                                                </DropdownMenuItem>
                                                <Link href={`/leads/${lead.id}`}>
                                                    <DropdownMenuItem>
                                                        <ExternalLink className="mr-2 h-4 w-4" /> Go to Profile
                                                    </DropdownMenuItem>
                                                </Link>
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive cursor-pointer"
                                                    onClick={() => setLeadToDelete(lead)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete Lead
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            <LeadForm
                open={isAddOpen}
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) setEditingLead(null);
                }}
                lead={editingLead}
            />
            <CSVImporter open={isImportOpen} onOpenChange={setIsImportOpen} />

            <DeleteConfirmationDialog
                open={!!leadToDelete}
                onOpenChange={(open) => !open && setLeadToDelete(null)}
                onConfirm={handleDelete}
                title="Delete Lead"
                description={`Are you sure you want to delete ${leadToDelete?.lead_name}? This will permanently remove all their data.`}
                isLoading={isDeleting}
            />
        </div>
    );
}
