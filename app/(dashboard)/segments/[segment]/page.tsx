
import { createClient } from '@/lib/supabase/server';
import { LeadTable } from '@/components/leads/lead-table';
import { redirect } from 'next/navigation';

export default async function SegmentPage({ params }: { params: { segment: string } }) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    // Decode segment from URL (e.g., "Web3-Wallet")
    // Helper to map URL slug to DB fields
    const slug = params.segment;
    let segmentFilter: string | null = null;
    let subSegmentFilter: string | null = null;

    if (slug.includes('-')) {
        const parts = slug.split('-');
        segmentFilter = parts[0];
        subSegmentFilter = parts.slice(1).join(' ').replace('%20', ' ');
        // Handle "Web3-Payments Infra" -> "Web3" and "Payments Infra" (need robust slugify usually, but here simple split)
        // Actually the links in sidebar are hardcoded: /segments/Web2-Exporter
    } else {
        segmentFilter = slug;
    }

    // Handle spaces in subsegments if encoded
    if (subSegmentFilter) {
        subSegmentFilter = decodeURIComponent(subSegmentFilter);
    }

    let query = supabase.from('leads').select('*').order('created_at', { ascending: false });

    if (segmentFilter) {
        query = query.eq('segment', segmentFilter);
    }
    if (subSegmentFilter) {
        // Improve logic: if subSegmentFilter is "Wallet" etc.
        query = query.eq('sub_segment', subSegmentFilter);
    }

    const { data: leads, error } = await query;

    if (error) console.error(error);

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">{segmentFilter} {subSegmentFilter && `> ${subSegmentFilter}`}</h1>
            </div>
            <LeadTable initialLeads={leads || []} />
        </div>
    );
}
