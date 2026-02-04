
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
import { Plus, MoreHorizontal, Upload, Edit, Trash2 } from 'lucide-react';
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

interface LeadTableProps {
    initialLeads: Lead[];
}

export function LeadTable({ initialLeads }: LeadTableProps) {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const leads = initialLeads || [];

    const handleEdit = (lead: Lead) => {
        setEditingLead(lead);
        setIsAddOpen(true);
    };

    const handleAdd = () => {
        setEditingLead(null);
        setIsAddOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Leads Database</h2>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                        <Upload className="mr-2 h-4 w-4" /> Import CSV
                    </Button>
                    <Button onClick={handleAdd}>
                        <Plus className="mr-2 h-4 w-4" /> Add Lead
                    </Button>
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Company</TableHead>
                            <TableHead>Segment</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Contact</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {leads.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    No leads found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            leads.map((lead) => (
                                <TableRow key={lead.id}>
                                    <TableCell className="font-medium">{lead.lead_name}</TableCell>
                                    <TableCell>{lead.company_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={lead.segment === 'Web3' ? 'secondary' : 'outline'}>
                                            {lead.segment}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline">{lead.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-sm text-gray-500">
                                        {lead.last_contact_date
                                            ? format(new Date(lead.last_contact_date), 'MMM d, yyyy')
                                            : '-'}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <span className={lead.lead_score > 80 ? "text-green-600 font-bold" : "text-gray-600"}>
                                                {lead.lead_score}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleEdit(lead)}>
                                                    <Edit className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
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
