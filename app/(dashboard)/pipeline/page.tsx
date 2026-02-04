import { KanbanBoard } from '@/components/pipeline/kanban-board';

export default function PipelinePage() {
    return (
        <div className="flex h-[calc(100vh-12rem)] flex-col gap-6">
            {/* Page Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                    Pipeline
                </h1>
                <p className="text-sm text-muted-foreground">
                    Drag and drop leads through your sales stages.
                </p>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-hidden">
                <KanbanBoard />
            </div>
        </div>
    );
}
