
import { createClient } from '@/lib/supabase/server';
import { KanbanBoard } from '@/components/leads/kanban-board';
import { redirect } from 'next/navigation';

export default async function PipelinePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: leads } = await supabase
        .from('leads')
        .select('*')
        .order('lead_score', { ascending: false });

    return (
        <div className="h-full flex flex-col">
            <h1 className="text-2xl font-bold mb-4 px-1">Pipeline</h1>
            <KanbanBoard initialLeads={leads || []} />
        </div>
    );
}
