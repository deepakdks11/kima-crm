
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

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
                {/* Helper info for first run */}
                {leads?.length === 0 && (
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-md border border-blue-200">
                        <p className="text-sm">
                            <strong>Tip:</strong> No leads found. Add a test lead via the &quot;Add Lead&quot; button.
                            If you see Row Level Security errors in console, ensure you ran the schema policies.
                        </p>
                    </div>
                )}
            </div>
            <LeadTable initialLeads={leads || []} />
        </div>
    );
}
