
import { createClient } from '@/lib/supabase/server';
import { LeadTable } from '@/components/leads/lead-table';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

export default async function FollowUpsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const now = new Date().toISOString();

    // Fetch leads with next_followup_date set and status not Lost/Onboarded (active leads)
    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .not('next_followup_date', 'is', null)
        .neq('status', 'Lost')
        .neq('status', 'Onboarded')
        .order('next_followup_date', { ascending: true }); // Soonest first

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Follow-ups</h1>
                <p className="text-muted-foreground">Manage your upcoming activities.</p>
            </div>

            {/* Could add specific View/Table for tasks, but reusing LeadTable is fine for v1 */}
            <LeadTable initialLeads={leads || []} />
        </div>
    );
}
