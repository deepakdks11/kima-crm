import { KanbanBoard } from '@/components/pipeline/kanban-board';

export default function PipelinePage() {
    return (
        <div className="flex h-[calc(100vh-8rem)] flex-col gap-4">
            <h1 className="text-2xl font-bold">Pipeline</h1>
            <KanbanBoard />
        </div>
    );
}
