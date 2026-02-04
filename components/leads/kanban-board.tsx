
'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Lead, LeadStatus } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

interface KanbanBoardProps {
    initialLeads: Lead[];
}

const COLUMNS: LeadStatus[] = [
    'New',
    'Contacted',
    'Demo Scheduled',
    'Negotiation',
    'Onboarded',
    'Lost'
];

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
    const router = useRouter();
    const supabase = createClient();
    const [leads, setLeads] = useState<Lead[]>(initialLeads);

    useEffect(() => {
        setLeads(initialLeads);
    }, [initialLeads]);

    const onDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        const newStatus = destination.droppableId as LeadStatus;
        const leadId = draggableId;

        // Optimistic Update
        const updatedLeads = leads.map(l =>
            l.id === leadId ? { ...l, status: newStatus } : l
        );
        setLeads(updatedLeads);

        // Persist to Supabase
        try {
            const { error } = await supabase
                .from('leads')
                .update({ status: newStatus })
                .eq('id', leadId);

            if (error) {
                console.error('Failed to update status', error);
                // Revert on error
                setLeads(initialLeads);
            } else {
                router.refresh();
            }
        } catch (e) {
            console.error(e);
            setLeads(initialLeads);
        }
    };

    const getLeadsByStatus = (status: LeadStatus) => leads.filter(l => l.status === status);

    return (
        <div className="flex h-full overflow-x-auto pb-4 gap-4">
            <DragDropContext onDragEnd={onDragEnd}>
                {COLUMNS.map((status) => (
                    <div key={status} className="flex flex-col min-w-[300px] w-[300px] rounded-lg bg-gray-100/50 border border-gray-200 h-full max-h-[calc(100vh-120px)]">
                        <div className="p-3 border-b border-gray-200 bg-white rounded-t-lg sticky top-0 z-10 flex items-center justify-between">
                            <h3 className="font-semibold text-sm text-gray-700">{status}</h3>
                            <Badge variant="secondary" className="text-xs">
                                {getLeadsByStatus(status).length}
                            </Badge>
                        </div>

                        <Droppable droppableId={status}>
                            {(provided, snapshot) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className={cn(
                                        "flex-1 p-2 flex flex-col gap-2 overflow-y-auto min-h-[100px]",
                                        snapshot.isDraggingOver ? "bg-blue-50/50" : ""
                                    )}
                                >
                                    {getLeadsByStatus(status).map((lead, index) => (
                                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                                            {(provided, snapshot) => (
                                                <Card
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    {...provided.dragHandleProps}
                                                    className={cn(
                                                        "cursor-pointer hover:shadow-md transition-shadow",
                                                        snapshot.isDragging ? "shadow-lg ring-2 ring-blue-400 rotate-2" : ""
                                                    )}
                                                >
                                                    <CardContent className="p-3 flex flex-col gap-2">
                                                        <div className="flex justify-between items-start">
                                                            <span className="font-semibold text-sm line-clamp-1">{lead.lead_name}</span>
                                                            {lead.lead_score > 50 && (
                                                                <Badge variant="outline" className="text-[10px] h-5 px-1 py-0">
                                                                    {lead.lead_score}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground line-clamp-1">
                                                            {lead.company_name}
                                                        </div>
                                                        <div className="flex gap-1 flex-wrap mt-1">
                                                            <Badge variant={lead.segment === "Web3" ? "web3" : "web2"} className="text-[10px] py-0 h-5">
                                                                {lead.segment}
                                                            </Badge>
                                                            <Badge variant="secondary" className="text-[10px] py-0 h-5">
                                                                {lead.source}
                                                            </Badge>
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
            </DragDropContext>
        </div>
    );
}
