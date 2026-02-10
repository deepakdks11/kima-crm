'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { createClient } from '@/lib/supabase/client';
import { Lead } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

const STAGES = ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Onboarded', 'Lost'];

const STAGE_COLORS: Record<string, string> = {
    'New': 'bg-gray-500/10 text-gray-600 dark:text-gray-400',
    'Contacted': 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'Demo Scheduled': 'bg-green-500/10 text-green-600 dark:text-green-400',
    'Negotiation': 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400',
    'Onboarded': 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'Lost': 'bg-red-500/10 text-red-600 dark:text-red-400',
};

const getSegmentBadgeClass = (segment: string | string[]) => {
    const segmentStr = Array.isArray(segment) ? segment.join(' ').toLowerCase() : (segment || '').toLowerCase();

    if (segmentStr.includes('export')) return 'badge-exporter';
    if (segmentStr.includes('freelance')) return 'badge-freelancer';
    if (segmentStr.includes('agency')) return 'badge-agency';
    if (segmentStr.includes('wallet')) return 'badge-wallet';
    if (segmentStr.includes('dapp')) return 'badge-dapp';
    if (segmentStr.includes('payment')) return 'badge-payments';
    return '';
};

export function KanbanBoard() {
    const supabase = createClient();
    const [leads, setLeads] = useState<Lead[]>([]);
    const [columns, setColumns] = useState<Record<string, Lead[]>>({});

    const organizeColumns = useCallback((data: Lead[]) => {
        const cols: Record<string, Lead[]> = {};
        STAGES.forEach(stage => {
            cols[stage] = data.filter(l => l.status === stage);
        });
        setColumns(cols);
    }, []);

    const fetchLeads = useCallback(async () => {
        const { data } = await supabase.from('leads').select('*');
        if (data) {
            setLeads(data);
            organizeColumns(data);
        }
    }, [supabase, organizeColumns]);

    useEffect(() => {
        fetchLeads();
    }, [fetchLeads]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const startCol = columns[source.droppableId];
        const finishCol = columns[destination.droppableId];

        const draggedLead = startCol.find(l => l.id === draggableId);
        if (!draggedLead) return;

        const newStartList = Array.from(startCol);
        newStartList.splice(source.index, 1);

        const newFinishList = Array.from(finishCol);

        if (source.droppableId === destination.droppableId) {
            newStartList.splice(destination.index, 0, draggedLead);
            setColumns({
                ...columns,
                [source.droppableId]: newStartList
            });
        } else {
            const updatedLead = { ...draggedLead, status: destination.droppableId } as Lead;
            newFinishList.splice(destination.index, 0, updatedLead);
            setColumns({
                ...columns,
                [source.droppableId]: newStartList,
                [destination.droppableId]: newFinishList
            });

            await supabase.from('leads').update({ status: destination.droppableId }).eq('id', draggableId);

            await supabase.from('activity_logs').insert([{
                lead_id: draggableId,
                action: 'STATUS_CHANGE',
                details: { from: source.droppableId, to: destination.droppableId }
            }]);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-thin snap-x snap-mandatory">
                {STAGES.map(stage => (
                    <div
                        key={stage}
                        className="flex h-full w-[280px] md:w-[320px] min-w-[280px] md:min-w-[320px] flex-col rounded-xl border border-border/50 bg-muted/30 p-3 snap-center"
                    >
                        {/* Column Header */}
                        <div className="mb-3 flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={cn(
                                    "h-2 w-2 rounded-full",
                                    STAGE_COLORS[stage]
                                )} />
                                <span className="font-semibold text-sm">{stage}</span>
                            </div>
                            <Badge variant="secondary" className="h-5 min-w-[24px] justify-center px-1.5 text-xs font-semibold">
                                {columns[stage]?.length || 0}
                            </Badge>
                        </div>

                        {/* Droppable Area */}
                        <Droppable droppableId={stage}>
                            {(provided, snapshot) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className={cn(
                                        "flex-1 space-y-2 overflow-y-auto scrollbar-thin rounded-lg p-1 transition-colors",
                                        snapshot.isDraggingOver && "bg-primary/5"
                                    )}
                                >
                                    {columns[stage]?.length === 0 && (
                                        <div className="flex items-center justify-center h-24 text-xs text-muted-foreground border-2 border-dashed rounded-lg">
                                            Drop leads here
                                        </div>
                                    )}
                                    {columns[stage]?.map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                            {(provided, snapshot) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={cn(
                                                        "cursor-grab active:cursor-grabbing hover:shadow-md transition-all touch-target border-border/50",
                                                        snapshot.isDragging && "shadow-lg rotate-2 ring-2 ring-primary/20"
                                                    )}
                                                >
                                                    <CardContent className="p-3 space-y-2">
                                                        {/* Drag Handle */}
                                                        <div
                                                            {...provided.dragHandleProps}
                                                            className="flex items-start gap-2"
                                                        >
                                                            <GripVertical className="h-4 w-4 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                                                            <div className="flex-1 min-w-0">
                                                                <div className="font-semibold text-sm truncate">
                                                                    {lead.company_name || lead.lead_name}
                                                                </div>
                                                                <div className="text-xs text-muted-foreground truncate">
                                                                    {lead.lead_name}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Metadata */}
                                                        <div className="flex items-center justify-between gap-2 pt-1">
                                                            {lead.segment && (
                                                                <Badge
                                                                    variant="outline"
                                                                    className={cn("text-[10px] px-1.5 py-0 h-5", getSegmentBadgeClass(lead.segment))}
                                                                >
                                                                    {Array.isArray(lead.segment) ? lead.segment.join(', ') : lead.segment}
                                                                </Badge>
                                                            )}
                                                            {lead.next_followup_date && (
                                                                <span className="text-[10px] text-orange-600 dark:text-orange-400 font-medium">
                                                                    {format(new Date(lead.next_followup_date), 'MMM d')}
                                                                </span>
                                                            )}
                                                            {lead.lead_score && (
                                                                <span className={cn(
                                                                    "text-[10px] font-semibold ml-auto",
                                                                    lead.lead_score > 80
                                                                        ? "text-green-600 dark:text-green-400"
                                                                        : "text-muted-foreground"
                                                                )}>
                                                                    {lead.lead_score}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </Draggable>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>
                    </div>
                ))}
            </div>
        </DragDropContext>
    );
}
