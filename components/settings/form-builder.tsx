'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormField, Workspace } from '@/lib/types';
import { GripVertical, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export function FormBuilder() {
    const supabase = createClient();
    const { toast } = useToast();
    const [fields, setFields] = useState<FormField[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);

    useEffect(() => {
        fetchSchema();
    }, []);

    const fetchSchema = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Get first workspace for now (assuming single workspace context or switcher handles it)
            // Ideally we get this from a context, but let's fetch it
            const { data: member } = await supabase
                .from('workspace_members')
                .select('workspace_id')
                .eq('user_id', user.id)
                .single();

            if (member) {
                setWorkspaceId(member.workspace_id);
                const { data: workspace } = await supabase
                    .from('workspaces')
                    .select('form_schema')
                    .eq('id', member.workspace_id)
                    .single();

                if (workspace?.form_schema) {
                    // unexpected type safety issue with Supabase JSONB, allow any cast for now
                    setFields((workspace.form_schema as any) || []);
                }
            }
        } catch (error) {
            console.error('Error fetching schema:', error);
            toast({
                title: "Error",
                description: "Failed to load form configuration.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!workspaceId) return;
        setSaving(true);
        try {
            const { error } = await supabase
                .from('workspaces')
                .update({ form_schema: fields })
                .eq('id', workspaceId);

            if (error) throw error;

            toast({
                title: "Saved",
                description: "Form layout updated successfully.",
            });
        } catch (error) {
            console.error('Error saving schema:', error);
            toast({
                title: "Error",
                description: "Failed to save changes.",
                variant: "destructive"
            });
        } finally {
            setSaving(false);
        }
    };

    const addField = () => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            label: 'New Field',
            type: 'text',
            required: false,
            placeholder: ''
        };
        setFields([...fields, newField]);
    };

    const removeField = (index: number) => {
        const newFields = [...fields];
        newFields.splice(index, 1);
        setFields(newFields);
    };

    const updateField = (index: number, key: keyof FormField, value: any) => {
        const newFields = [...fields];
        newFields[index] = { ...newFields[index], [key]: value };
        setFields(newFields);
    };

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        const items = Array.from(fields);
        const [reorderedItem] = items.splice(result.source.index, 1);
        items.splice(result.destination.index, 0, reorderedItem);
        setFields(items);
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle>Custom Lead Fields</CardTitle>
                    <CardDescription>Customize the information you collect for each lead.</CardDescription>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Changes
                </Button>
            </CardHeader>
            <CardContent>
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="form-fields">
                        {(provided) => (
                            <div
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                                className="space-y-4 pt-4"
                            >
                                {fields.map((field, index) => (
                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className="flex items-start gap-4 p-4 border rounded-lg bg-card hover:bg-accent/5 transition-colors group"
                                            >
                                                <div {...provided.dragHandleProps} className="mt-3 cursor-move text-muted-foreground hover:text-foreground">
                                                    <GripVertical className="h-5 w-5" />
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1">
                                                    <div className="space-y-2">
                                                        <Label>Label</Label>
                                                        <Input
                                                            value={field.label}
                                                            onChange={(e) => updateField(index, 'label', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Type</Label>
                                                        <Select
                                                            value={field.type}
                                                            onValueChange={(val) => updateField(index, 'type', val)}
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="text">Text Check</SelectItem>
                                                                <SelectItem value="number">Number</SelectItem>
                                                                <SelectItem value="date">Date</SelectItem>
                                                                <SelectItem value="textarea">Long Text</SelectItem>
                                                                <SelectItem value="select">Select (Simple)</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Placeholder</Label>
                                                        <Input
                                                            value={field.placeholder || ''}
                                                            onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                                                        />
                                                    </div>

                                                    <div className="flex items-center justify-between pt-8 space-x-4">
                                                        <div className="flex items-center space-x-2">
                                                            <Switch
                                                                checked={field.required}
                                                                onCheckedChange={(checked) => updateField(index, 'required', checked)}
                                                            />
                                                            <Label className="text-muted-foreground">Required</Label>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-destructive"
                                                            onClick={() => removeField(index)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>

                <Button variant="outline" className="w-full mt-4 border-dashed" onClick={addField}>
                    <Plus className="mr-2 h-4 w-4" /> Add Custom Field
                </Button>
            </CardContent>
        </Card>
    );
}
