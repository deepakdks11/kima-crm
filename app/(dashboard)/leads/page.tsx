
import { createClient } from '@/lib/supabase/server';
import { LeadTable } from '@/components/leads/lead-table';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function LeadsPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const cookieStore = await cookies();
    const activeWorkspaceId = cookieStore.get('kima_active_workspace_id')?.value;

    let query = supabase
        .from('leads')
        .select('*');

    if (activeWorkspaceId) {
        query = query.eq('workspace_id', activeWorkspaceId);
    }

    const { data: leads, error } = await query
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching leads:', error);
        return <div>Error loading leads</div>;
    }

    return <LeadTable initialLeads={leads || []} />;
}
