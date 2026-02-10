'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FormField, Workspace } from '@/lib/types';
import { DEFAULT_FORM_SCHEMA } from '@/lib/constants';
import { GripVertical, Plus, Trash2, Save, Loader2, RotateCcw, Layout, Type, MinusSquare, EyeOff, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

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
                    setFields((workspace.form_schema as any) || DEFAULT_FORM_SCHEMA);
                } else {
                    setFields(DEFAULT_FORM_SCHEMA);
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

    const addField = (type: FormField['type']) => {
        const newField: FormField = {
            id: `field_${Date.now()}`,
            label: type === 'section' ? 'New Section' : type === 'divider' ? '' : 'New Field',
            type: type,
            required: false,
            placeholder: '',
            is_standard: false
        };
        setFields([...fields, newField]);
    };

    const removeField = (index: number) => {
        const field = fields[index];
        if (field.is_standard) {
            toast({
                title: "Cannot delete standard field",
                description: "Standard fields can be hidden but not deleted.",
                variant: "destructive"
            });
            return;
        }
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

    const resetToDefault = () => {
        if (confirm("Are you sure you want to reset the form to its original layout? All custom fields and changes will be lost.")) {
            setFields(DEFAULT_FORM_SCHEMA);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                        <CardTitle>Form Layout Builder</CardTitle>
                        <CardDescription>Drag and drop to rearrange. Rename or hide any field.</CardDescription>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={resetToDefault} className="h-9 px-3">
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset
                        </Button>
                        <Button onClick={handleSave} disabled={saving} size="sm" className="h-9 px-3">
                            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            Save Layout
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2 mb-6 p-2 bg-muted/30 rounded-lg">
                        <Button variant="ghost" size="sm" onClick={() => addField('text')} className="gap-2">
                            <Plus className="h-4 w-4" /> Text
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => addField('textarea')} className="gap-2">
                            <Plus className="h-4 w-4" /> Long Text
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => addField('select')} className="gap-2">
                            <Plus className="h-4 w-4" /> Dropdown
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => addField('section')} className="gap-2 text-primary">
                            <Layout className="h-4 w-4" /> New Section
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => addField('divider')} className="gap-2 text-primary">
                            <MinusSquare className="h-4 w-4" /> Divider
                        </Button>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="form-fields">
                            {(provided) => (
                                <div
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                    className="space-y-3"
                                >
                                    {fields.map((field, index) => (
                                        <Draggable key={field.id} draggableId={field.id} index={index}>
                                            {(provided) => (
                                                <div
                                                    ref={provided.innerRef}
                                                    {...provided.draggableProps}
                                                    className={cn(
                                                        "flex items-start gap-4 p-3 border rounded-lg bg-card transition-all group",
                                                        field.hidden && "opacity-50 grayscale bg-muted/50",
                                                        field.type === 'section' && "bg-primary/5 border-primary/20",
                                                        field.type === 'divider' && "py-2 bg-muted/20 border-dashed"
                                                    )}
                                                >
                                                    <div {...provided.dragHandleProps} className="mt-2.5 cursor-move text-muted-foreground hover:text-foreground">
                                                        <GripVertical className="h-5 w-5" />
                                                    </div>

                                                    <div className="flex-1 grid gap-4 items-center" style={{ gridTemplateColumns: field.type === 'divider' ? '1fr auto' : '2fr 1.5fr auto' }}>
                                                        {field.type === 'divider' ? (
                                                            <div className="h-px bg-border w-full my-auto" />
                                                        ) : (
                                                            <>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px] uppercase text-muted-foreground">Label</Label>
                                                                    <Input
                                                                        className="h-8 text-sm"
                                                                        value={field.label}
                                                                        onChange={(e) => updateField(index, 'label', e.target.value)}
                                                                        placeholder={field.type === 'section' ? 'Section Header' : 'Field Label'}
                                                                    />
                                                                </div>

                                                                {field.type !== 'section' && (
                                                                    <>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-[10px] uppercase text-muted-foreground">Placeholder</Label>
                                                                            <Input
                                                                                className="h-8 text-sm"
                                                                                value={field.placeholder || ''}
                                                                                onChange={(e) => updateField(index, 'placeholder', e.target.value)}
                                                                                placeholder="Hint text..."
                                                                            />
                                                                        </div>

                                                                        <div className="space-y-1">
                                                                            <Label className="text-[10px] uppercase text-muted-foreground">Type</Label>
                                                                            <Select
                                                                                value={field.type}
                                                                                onValueChange={(val) => updateField(index, 'type', val)}
                                                                            >
                                                                                <SelectTrigger className="h-8 text-[10px] uppercase w-[100px] bg-muted">
                                                                                    <SelectValue />
                                                                                </SelectTrigger>
                                                                                <SelectContent>
                                                                                    <SelectItem value="text">Text</SelectItem>
                                                                                    <SelectItem value="textarea">Long Text</SelectItem>
                                                                                    <SelectItem value="number">Number</SelectItem>
                                                                                    <SelectItem value="date">Date</SelectItem>
                                                                                    <SelectItem value="select">Dropdown</SelectItem>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </>
                                                                )}
                                                                {field.type === 'section' && <div />}

                                                                {field.type === 'select' && (
                                                                    <div className="space-y-1 col-span-2">
                                                                        <div className="flex justify-between">
                                                                            <Label className="text-[10px] uppercase text-muted-foreground">Options (One per line)</Label>
                                                                            <span className="text-[10px] text-muted-foreground"> {field.options?.length || 0} options</span>
                                                                        </div>
                                                                        <Textarea
                                                                            className="min-h-[150px] text-sm resize-y font-mono"
                                                                            value={field.options?.join('\n') || ''}
                                                                            onChange={(e) => {
                                                                                const val = e.target.value;
                                                                                // Split by newline to get options
                                                                                updateField(index, 'options', val.split('\n'));
                                                                            }}
                                                                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                                                                        />
                                                                        <p className="text-[10px] text-muted-foreground">Enter each option on a new line. You can drag the bottom-right corner to resize.</p>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}

                                                        <div className="flex items-center gap-1 pt-4">
                                                            {field.type !== 'section' && field.type !== 'divider' && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon" // Using icon size for better alignment
                                                                    className={cn(
                                                                        "h-8 w-auto px-2 gap-1.5 transition-all",
                                                                        field.required
                                                                            ? "text-red-500 bg-red-500/10 hover:text-red-600 hover:bg-red-500/20"
                                                                            : "text-muted-foreground hover:text-foreground"
                                                                    )}
                                                                    onClick={() => updateField(index, 'required', !field.required)}
                                                                    title="Toggle Required"
                                                                >
                                                                    <span className="text-[10px] font-semibold uppercase tracking-wider">{field.required ? 'Required' : 'Optional'}</span>
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className={cn("h-8 w-8", field.hidden ? "text-primary bg-primary/10" : "text-muted-foreground")}
                                                                onClick={() => updateField(index, 'hidden', !field.hidden)}
                                                                title={field.hidden ? "Show Field" : "Hide Field"}
                                                            >
                                                                {field.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                            </Button>
                                                            {!field.is_standard && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                                    onClick={() => removeField(index)}
                                                                    title="Delete Field"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            )}
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
                </CardContent>
            </Card>
        </div>
    );
}
