
import { createClient } from '@/lib/supabase/server';
import { LeadTable } from '@/components/leads/lead-table';
import { redirect } from 'next/navigation';

export default async function LeadsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: leads, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching leads:', error);
        return <div>Error loading leads</div>;
    }

    return <LeadTable initialLeads={leads || []} />;
}
