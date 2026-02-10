"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Download, Loader2 } from 'lucide-react';
import Papa from 'papaparse';

export function LeadExporter() {
    const [exporting, setExporting] = useState(false);
    const supabase = createClient();

    const handleExport = async () => {
        setExporting(true);
        try {
            const { data: leads, error } = await supabase
                .from('leads')
                .select('*');

            if (error) throw error;

            if (!leads || leads.length === 0) {
                alert('No leads to export.');
                return;
            }

            // Flatten data for CSV
            // Handle arrays (segment, sub_segment) and JSONB (custom_data)
            const flattenedLeads = leads.map(lead => {
                const { custom_data, segment, sub_segment, ...rest } = lead;

                // Convert arrays to comma-separated strings
                const segmentStr = Array.isArray(segment) ? segment.join(', ') : segment;
                const subSegmentStr = Array.isArray(sub_segment) ? sub_segment.join(', ') : sub_segment;

                return {
                    ...rest,
                    segment: segmentStr,
                    sub_segment: subSegmentStr,
                    ...custom_data // Spread custom data as columns
                };
            });

            const csv = Papa.unparse(flattenedLeads);

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Export failed:', error);
            alert('Failed to export leads.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <Button variant="outline" onClick={handleExport} disabled={exporting} className="gap-2">
            {exporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
        </Button>
    );
}
