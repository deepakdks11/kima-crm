'use client';

import { useState } from 'react';
import { Lead } from '@/lib/types';
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
import { Input } from '@/components/ui/input';
import {
    Plus,
    MoreHorizontal,
    Upload,
    Edit,
    Trash2,
    Search,
    Filter,
    ExternalLink,
    Inbox
} from 'lucide-react';
import { LeadForm } from '@/components/leads/lead-form';
import { CSVImporter } from '@/components/leads/csv-importer';
import { LeadCard } from '@/components/leads/lead-card';
import { EmptyState } from '@/components/ui/empty-state';
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

interface LeadTableProps {
    initialLeads: Lead[];
}

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

export function LeadTable({ initialLeads }: LeadTableProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const leads = initialLeads || [];

    const handleEdit = (lead: Lead) => {
        setEditingLead(lead);
        setIsAddOpen(true);
    };

    const handleAdd = () => {
        setEditingLead(null);
        setIsAddOpen(true);
    };

    const filteredLeads = leads.filter(lead =>
        lead.lead_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.company_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

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

            {/* Search and Filters */}
            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search company or founder..."
                        className="pl-9 h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 touch-target">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            {/* Empty State */}
            {filteredLeads.length === 0 && !searchQuery && (
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
            {filteredLeads.length === 0 && searchQuery && (
                <EmptyState
                    icon={Search}
                    title="No results found"
                    description={`No leads found matching "${searchQuery}". Try a different search term.`}
                />
            )}

            {/* Mobile Card View */}
            {filteredLeads.length > 0 && (
                <div className="md:hidden space-y-3">
                    {filteredLeads.map((lead) => (
                        <LeadCard key={lead.id} lead={lead} />
                    ))}
                </div>
            )}

            {/* Desktop Table View */}
            {filteredLeads.length > 0 && (
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
                            {filteredLeads.map((lead) => (
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
                                            {lead.segment}
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
                                                <DropdownMenuItem className="text-destructive focus:text-destructive">
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
        </div>
    );
}
