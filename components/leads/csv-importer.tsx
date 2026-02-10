'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Download, Upload, Loader2, FileUp } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/components/providers/workspace-provider';

interface CSVImporterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CSVImporter({ open, onOpenChange }: CSVImporterProps) {
    const router = useRouter();
    const supabase = createClient();
    const { workspace } = useWorkspace();
    const [uploading, setUploading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);

    const handleDownloadTemplate = () => {
        const headers = ['Name', 'Company', 'Email', 'Segment', 'SubSegment', 'Status', 'Source', 'Website', 'LinkedIn'];
        const exampleRow = ['John Doe', 'Acme Corp', 'john@example.com', 'Web2, Web3', 'Wallet, dApp', 'New', 'Website', 'https://acme.com', 'https://linkedin.com/in/johndoe'];
        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + exampleRow.join(",");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "leads_import_template.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setSummary('Parsing...');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Papa.parse(file as any, {
            header: true,
            skipEmptyLines: true,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            complete: async (results: any) => {
                try {
                    // Start of fix for explicit any
                    const rows = results.data as Record<string, string | undefined>[];

                    if (rows.length === 0) {
                        setSummary('No data found in CSV.');
                        setUploading(false);
                        return;
                    }

                    // Extract emails to check for existing leads
                    const emails = rows.map(r => r.Email || r.email).filter(e => e) as string[];

                    // Fetch existing leads with these emails
                    const { data: existingLeads, error: fetchError } = await supabase
                        .from('leads')
                        .select('id, email')
                        .in('email', emails);

                    if (fetchError) throw fetchError;

                    const existingEmailMap = new Map();
                    existingLeads?.forEach(l => {
                        if (l.email) existingEmailMap.set(l.email.toLowerCase(), l.id);
                    });

                    const toUpsert = rows.map((row) => {
                        const email = row.Email || row.email || null;
                        const existingId = email ? existingEmailMap.get(email.toLowerCase()) : undefined;

                        const segmentRaw = row.Segment || row.segment || 'Web2';
                        const segmentArray = segmentRaw.split(',').map(s => s.trim()).filter(s => s);

                        const subSegmentRaw = row.SubSegment || row.sub_segment || '';
                        const subSegmentArray = subSegmentRaw ? subSegmentRaw.split(',').map(s => s.trim()).filter(s => s) : [];

                        return {
                            id: existingId, // If present, Supabase Upsert will update. IF not unique constraint, we might need manual separation.
                            // Since email is NOT unique in schema, "upsert" by ID is safer if we know ID.
                            // However, we only know ID if we found it.
                            // To update by ID, we must include ID. To insert, we exclude ID.

                            lead_name: row.Name || row.name || row.lead_name || 'Unknown',
                            company_name: row.Company || row.company || row.company_name || null,
                            email: email,
                            segment: segmentArray,
                            sub_segment: subSegmentArray,
                            status: row.Status || row.status || 'New',
                            source: row.Source || row.source || 'Website',
                            website_url: row.Website || row.website_url || null,
                            linkedin_url: row.LinkedIn || row.linkedin_url || null,
                            workspace_id: workspace?.id,
                            // Only set created_at for new? Supabase handles default.
                        };
                    }).filter(l => l.lead_name && l.lead_name !== 'Unknown');

                    setSummary(`Processing ${toUpsert.length} leads...`);

                    const { error } = await supabase.from('leads').upsert(toUpsert, { onConflict: 'id' });

                    if (error) {
                        console.error(error);
                        setSummary(`Error: ${error.message}`);
                    } else {
                        setSummary(`Success! Processed ${toUpsert.length} leads.`);
                        setTimeout(() => {
                            onOpenChange(false);
                            router.refresh();
                            setSummary(null);
                        }, 2000);
                    }
                } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : 'Unknown error';
                    setSummary(`Error: ${message}`);
                } finally {
                    setUploading(false);
                }
            },
            error: (err: Papa.ParseError) => {
                setSummary(`CSV Parse Error: ${err.message}`);
                setUploading(false);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Leads from CSV</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg border border-dashed">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <FileUp className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-0.5">
                                <h4 className="text-sm font-medium">CSV Format</h4>
                                <p className="text-xs text-muted-foreground">Download example template</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
                            <Download className="h-4 w-4" /> Template
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Supports bulk updates by matching <strong>Email</strong>. Separate multiple segments with commas.
                    </p>

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Input
                            type="file"
                            accept=".csv"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="cursor-pointer"
                        />
                    </div>

                    {summary && (
                        <p className="text-sm font-medium text-blue-600">{summary}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
