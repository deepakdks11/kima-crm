'use client';

import { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { createClient } from '@/lib/supabase/client';
import { Lead } from '@/lib/types';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const STAGES = ['New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Onboarded', 'Lost'];

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

        // Optimistic UI Update
        const startCol = columns[source.droppableId];
        const finishCol = columns[destination.droppableId];

        const draggedLead = startCol.find(l => l.id === draggableId);
        if (!draggedLead) return;

        // Create new objects to avoid reference issues
        const newStartList = Array.from(startCol);
        newStartList.splice(source.index, 1);

        const newFinishList = Array.from(finishCol);
        // Note: if moving to same column, we need to handle that, but for now assuming changing status
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

            // Persist to DB
            await supabase.from('leads').update({ status: destination.droppableId }).eq('id', draggableId);

            // Log Activity
            await supabase.from('activity_logs').insert([{
                lead_id: draggableId,
                action: 'STATUS_CHANGE',
                details: { from: source.droppableId, to: destination.droppableId }
            }]);
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex h-full gap-4 overflow-x-auto pb-4">
                {STAGES.map(stage => (
                    <div key={stage} className="flex h-full w-[300px] min-w-[300px] flex-col rounded-md bg-muted/50 p-2">
                        <div className="mb-2 flex items-center justify-between px-2 font-semibold">
                            <span>{stage}</span>
                            <span className="text-xs text-muted-foreground">{columns[stage]?.length || 0}</span>
                        </div>
                        <Droppable droppableId={stage}>
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="flex-1 space-y-2 overflow-y-auto"
                                >
                                    {columns[stage]?.map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                            {(provided) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className="cursor-grab active:cursor-grabbing hover:bg-accent"
                                                >
                                                    <CardContent className="p-3">
                                                        <div className="font-medium text-sm">{lead.company_name}</div>
                                                        <div className="text-xs text-muted-foreground mb-2">{lead.lead_name}</div>
                                                        <div className="flex items-center justify-between">
                                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                                {lead.segment}
                                                            </Badge>
                                                            {lead.next_followup_date && (
                                                                <span className="text-[10px] text-orange-500">
                                                                    {format(new Date(lead.next_followup_date), 'MMM d')}
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
