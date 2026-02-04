
import { createClient } from '@/lib/supabase/server';
import { LeadTable } from '@/components/leads/lead-table';
import { redirect } from 'next/navigation';

export default async function CustomersPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) redirect('/login');

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'Onboarded')
        .order('updated_at', { ascending: false });

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-2xl font-bold tracking-tight">Closed Customers</h1>
            </div>
            <LeadTable initialLeads={leads || []} />
        </div>
    );
}
