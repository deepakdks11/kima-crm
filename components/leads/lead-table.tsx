
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
    ExternalLink
} from 'lucide-react';
import { LeadForm } from '@/components/leads/lead-form';
import { CSVImporter } from '@/components/leads/csv-importer';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from 'date-fns';
import Link from 'next/link';

interface LeadTableProps {
    initialLeads: Lead[];
}

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
        <div className="space-y-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Leads</h2>
                    <p className="text-sm text-muted-foreground">Manage your relationships and track interactions.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                    </Button>
                    <Button size="sm" onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search company or founder..."
                        className="pl-9 h-10 border-muted"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="h-10 w-10 border-muted">
                    <Filter className="h-4 w-4" />
                </Button>
            </div>

            <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow className="hover:bg-transparent">
                            <TableHead className="w-[200px]">Lead Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Segment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Contact</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredLeads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    No leads found matching your search.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredLeads.map((lead) => (
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
                                    <TableCell>{lead.company_name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className="font-normal">
                                            {lead.segment}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-normal capitalize">
                                            {lead.status?.toLowerCase()}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {lead.last_contact_date
                                            ? format(new Date(lead.last_contact_date), 'MMM d, yyyy')
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={lead.lead_score > 80 ? "text-green-500 font-bold" : "text-muted-foreground"}>
                                                {lead.lead_score}
                                            </span>
                                        </div>
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
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

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
