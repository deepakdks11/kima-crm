
'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';

interface CSVImporterProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CSVImporter({ open, onOpenChange }: CSVImporterProps) {
    const router = useRouter();
    const supabase = createClient();
    const [uploading, setUploading] = useState(false);
    const [summary, setSummary] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setSummary('Parsing...');

        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    const rows = results.data as any[];

                    if (rows.length === 0) {
                        setSummary('No data found in CSV.');
                        setUploading(false);
                        return;
                    }

                    // Transform keys if needed, or assume CSV headers match DB columns exactly?
                    // For simplicity v1, we assume specific headers or map common ones.
                    // Let's do simple mapping: Name -> lead_name, Email -> email, etc.

                    const leads = rows.map((row) => ({
                        lead_name: row.Name || row.name || row.lead_name,
                        company_name: row.Company || row.company || row.company_name,
                        email: row.Email || row.email,
                        segment: row.Segment || row.segment || 'Web2',
                        sub_segment: row.SubSegment || row.sub_segment,
                        status: 'New', // Default
                        source: 'Cold Outreach', // Default for import
                        created_at: new Date().toISOString()
                    })).filter(l => l.lead_name); // Valid leads only

                    setSummary(`Uploading ${leads.length} leads...`);

                    const { error } = await supabase.from('leads').insert(leads);

                    if (error) {
                        console.error(error);
                        setSummary(`Error: ${error.message}`);
                    } else {
                        setSummary(`Success! Imported ${leads.length} leads.`);
                        setTimeout(() => {
                            onOpenChange(false);
                            router.refresh();
                            setSummary(null);
                        }, 1500);
                    }
                } catch (err: any) {
                    setSummary(`Error: ${err.message}`);
                } finally {
                    setUploading(false);
                }
            },
            error: (err: any) => {
                setSummary(`CSV Parse Error: ${err.message}`);
                setUploading(false);
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import Leads from CSV</DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <p className="text-sm text-gray-500">
                        Ensure your CSV has headers: Name, Company, Email, Segment.
                    </p>
                    <Input
                        type="file"
                        accept=".csv"
                        onChange={handleFileUpload}
                        disabled={uploading}
                    />
                    {summary && (
                        <p className="text-sm font-medium text-blue-600">{summary}</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
