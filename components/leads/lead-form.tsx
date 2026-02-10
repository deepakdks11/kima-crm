'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MultiSelect } from '@/components/ui/multi-select';
import { Lead, LeadSegment, LeadSubSegment, LeadProductFit, LeadStatus, LeadSource, FormField } from '@/lib/types';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { ActivityLogList } from '@/components/activity/activity-log-list';
import { useWorkspace } from '@/components/providers/workspace-provider';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface LeadFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lead?: Lead | null; // If present, edit mode
}

function toLocalISOString(dateStr: string | null): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const offset = date.getTimezoneOffset() * 60000;
    const localDate = new Date(date.getTime() - offset);
    return localDate.toISOString().slice(0, 16);
}

export function LeadForm({ open, onOpenChange, lead }: LeadFormProps) {
    const router = useRouter();
    const supabase = createClient();
    const { workspace } = useWorkspace();
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [showMarketing, setShowMarketing] = useState(false);

    // Dynamic Fields for custom data
    const schema = (workspace?.form_schema as any) as FormField[] || [];
    const customFields = schema.filter(f => !f.is_standard && !f.hidden);

    const getLabel = (fieldKey: string, defaultLabel: string) => {
        return schema.find(f => f.field_key === fieldKey)?.label || defaultLabel;
    };

    const [formData, setFormData] = useState<Partial<Lead>>({
        lead_name: '',
        company_name: '',
        email: '',
        linkedin_url: '',
        website_url: '',
        website_url: '',
        segment: ['Web2'],
        sub_segment: [],
        product_fit: null,
        client_geography: '',
        currency_flow: '',
        use_case: '',
        decision_maker_name: '',
        role: '',
        status: 'New',
        source: 'Website',
        lead_score: 0,
        utm_source: '',
        utm_medium: '',
        utm_campaign: '',
        utm_content: '',
        last_contact_date: null,
        next_followup_date: null,
        notes: '',
        custom_data: {},
    });

    useEffect(() => {
        if (open && lead) {
            setFormData({
                ...lead,
                custom_data: lead.custom_data || {},
            });
        } else if (open && !lead) {
            setFormData({
                lead_name: '',
                company_name: '',
                email: '',
                linkedin_url: '',
                website_url: '',
                website_url: '',
                segment: ['Web2'],
                sub_segment: [],
                product_fit: null,
                client_geography: '',
                currency_flow: '',
                use_case: '',
                decision_maker_name: '',
                role: '',
                status: 'New',
                source: 'Website',
                lead_score: 0,
                utm_source: '',
                utm_medium: '',
                utm_campaign: '',
                utm_content: '',
                last_contact_date: null,
                next_followup_date: null,
                notes: '',
                custom_data: {},
            });
        }
    }, [open, lead]);
    const logActivity = async (leadId: string, action: string, details: Record<string, unknown>) => {
        try {
            await supabase.from('activity_logs').insert([{
                lead_id: leadId,
                action,
                details
            }]);
        } catch (err) {
            console.error('Failed to log activity', err);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                workspace_id: workspace?.id,
            };

            if (!workspace?.id) {
                toast({
                    title: "No workspace selected",
                    description: "Please select or create a workspace before saving a lead.",
                    variant: "destructive",
                });
                setLoading(false);
                return;
            }

            let error;
            let resultData;

            if (lead) {
                const { data, error: updateError } = await supabase
                    .from('leads')
                    .update(payload)
                    .eq('id', lead.id)
                    .select()
                    .single();
                error = updateError;
                resultData = data;
            } else {
                const { data, error: insertError } = await supabase
                    .from('leads')
                    .insert([payload])
                    .select()
                    .single();
                error = insertError;
                resultData = data;
                if (!error && resultData) {
                    await logActivity(resultData.id, 'CREATED', { name: resultData.lead_name });
                }
            }

            if (error) throw error;

            toast({
                title: lead ? "Lead updated" : "Lead created",
                description: `Successfully ${lead ? 'updated' : 'created'} lead "${formData.lead_name}"`,
            });

            onOpenChange(false);
            router.refresh();
        } catch (error: any) {
            console.error('Error saving lead:', error);
            toast({
                title: "Error saving lead",
                description: error.message || "Failed to save lead. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field: FormField, value: any) => {
        if (field.is_standard && field.field_key) {
            setFormData(prev => ({ ...prev, [field.field_key!]: value }));
        } else {
            const key = field.field_key || field.label;
            setFormData(prev => ({
                ...prev,
                custom_data: {
                    ...(prev.custom_data || {}),
                    [key]: value
                }
            }));
        }
    };

    const getValue = (field: FormField) => {
        if (field.is_standard && field.field_key) {
            return (formData as any)[field.field_key] || '';
        }
        const key = field.field_key || field.label;
        return formData.custom_data?.[key] || '';
    };

    const renderField = (field: FormField) => {
        if (field.hidden) return null;

        // Heuristic for column spans
        let colSpan = "col-span-3";
        if (field.type === 'section' || field.type === 'divider' || field.type === 'textarea') {
            colSpan = "col-span-6";
        } else if (['segment', 'sub_segment', 'product_fit'].includes(field.field_key || '')) {
            colSpan = "col-span-2";
        }

        // Special handling for segment and sub_segment to use MultiSelect
        if (field.field_key === 'segment') {
            return (
                <div key={field.id} className={cn("grid gap-2", colSpan)}>
                    <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
                    <MultiSelect
                        options={['Web2', 'Web3']}
                        selected={formData.segment || []}
                        onChange={(val) => setFormData(prev => ({ ...prev, segment: val }))}
                        placeholder="Select segments..."
                    />
                </div>
            );
        }

        if (field.field_key === 'sub_segment') {
            return (
                <div key={field.id} className={cn("grid gap-2", colSpan)}>
                    <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
                    <MultiSelect
                        options={['Exporter', 'Freelancer', 'Agency', 'Wallet', 'dApp', 'Payments Infra', 'On-Ramp', 'Off-Ramp', 'Both On-Off Ramp']}
                        selected={formData.sub_segment || []}
                        onChange={(val) => setFormData(prev => ({ ...prev, sub_segment: val }))}
                        placeholder="Select sub-segments..."
                    />
                </div>
            );
        }

        switch (field.type) {
            case 'section':
                return (
                    <div key={field.id} className="col-span-6 pt-6 pb-2">
                        <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">{field.label}</h3>
                    </div>
                );
            case 'divider':
                return <div key={field.id} className="col-span-6 py-2"><hr className="border-muted/30" /></div>;
            case 'textarea':
                return (
                    <div key={field.id} className="col-span-6 grid gap-2">
                        <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
                        <Textarea
                            id={field.id}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={getValue(field)}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="min-h-[100px] bg-background/50"
                        />
                    </div>
                );
            case 'select':
                return (
                    <div key={field.id} className={cn("grid gap-2", colSpan)}>
                        <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
                        <Select
                            value={getValue(field)}
                            onValueChange={(val) => handleChange(field, val)}
                        >
                            <SelectTrigger id={field.id} className="bg-background/50">
                                <SelectValue placeholder={field.placeholder || "Select..."} />
                            </SelectTrigger>
                            <SelectContent className="backdrop-blur-xl bg-background/80 border-white/10 shadow-2xl">
                                {field.options?.map((opt) => (
                                    <SelectItem key={opt} value={opt} className="hover:bg-primary/10 transition-colors">{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                );
            default:
                return (
                    <div key={field.id} className={cn("grid gap-2", colSpan)}>
                        <Label htmlFor={field.id}>{field.label} {field.required && '*'}</Label>
                        <Input
                            id={field.id}
                            type={field.type}
                            placeholder={field.placeholder}
                            required={field.required}
                            value={getValue(field)}
                            onChange={(e) => handleChange(field, e.target.value)}
                            className="bg-background/50"
                        />
                    </div>
                );
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] flex flex-col p-0 border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl overflow-hidden">
                <DialogHeader className="px-8 pt-8 pb-4 shrink-0">
                    <DialogTitle className="text-2xl font-bold tracking-tight">{lead ? 'Edit' : 'Add'} Lead</DialogTitle>
                </DialogHeader>

                <form id="lead-form-id" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                    <div className="grid grid-cols-6 gap-x-6 gap-y-4">
                        {/* Dynamic Fields from Schema */}
                        {schema.length > 0 ? (
                            schema.map(renderField)
                        ) : (
                            <div className="col-span-6 py-4 text-center text-muted-foreground italic">
                                No form schema defined. Please check settings.
                            </div>
                        )}

                        <div className="col-span-6 pt-10 pb-2">
                            <h3 className="text-sm font-semibold text-primary/80 uppercase tracking-wider">Process & Notes</h3>
                        </div>

                        {/* Sales Process - Standard hardcoded below dynamic part for now */}
                        <div className="col-span-3 grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status || 'New'}
                                onValueChange={(val: string) => setFormData({ ...formData, status: val as LeadStatus })}
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-xl bg-background/80 border-white/10 shadow-2xl">
                                    <SelectItem value="New" className="hover:bg-primary/10 transition-colors">New</SelectItem>
                                    <SelectItem value="Contacted" className="hover:bg-primary/10 transition-colors">Contacted</SelectItem>
                                    <SelectItem value="Demo Scheduled" className="hover:bg-primary/10 transition-colors">Demo Scheduled</SelectItem>
                                    <SelectItem value="Negotiation" className="hover:bg-primary/10 transition-colors">Negotiation</SelectItem>
                                    <SelectItem value="Onboarded" className="hover:bg-primary/10 transition-colors">Onboarded</SelectItem>
                                    <SelectItem value="Lost" className="hover:bg-primary/10 transition-colors">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="col-span-3 grid gap-2">
                            <Label htmlFor="source">Source</Label>
                            <Select
                                value={formData.source || 'Website'}
                                onValueChange={(val: string) => setFormData({ ...formData, source: val as LeadSource })}
                            >
                                <SelectTrigger className="bg-background/50">
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent className="backdrop-blur-xl bg-background/80 border-white/10 shadow-2xl">
                                    <SelectItem value="Website" className="hover:bg-primary/10 transition-colors">Website</SelectItem>
                                    <SelectItem value="LinkedIn" className="hover:bg-primary/10 transition-colors">LinkedIn</SelectItem>
                                    <SelectItem value="Referral" className="hover:bg-primary/10 transition-colors">Referral</SelectItem>
                                    <SelectItem value="Cold Outreach" className="hover:bg-primary/10 transition-colors">Cold Outreach</SelectItem>
                                    <SelectItem value="Facebook Ads" className="hover:bg-primary/10 transition-colors">Facebook Ads</SelectItem>
                                    <SelectItem value="Google Ads" className="hover:bg-primary/10 transition-colors">Google Ads</SelectItem>
                                    <SelectItem value="Instagram Ads" className="hover:bg-primary/10 transition-colors">Instagram Ads</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="col-span-3 grid gap-2">
                            <Label htmlFor="next_followup">Next Follow-up</Label>
                            <Input
                                id="next_followup"
                                type="datetime-local"
                                value={toLocalISOString(formData.next_followup_date || null)}
                                onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="bg-background/50"
                            />
                        </div>
                        <div className="col-span-3 grid gap-2">
                            <Label htmlFor="last_contact">Last Contact</Label>
                            <Input
                                id="last_contact"
                                type="datetime-local"
                                value={toLocalISOString(formData.last_contact_date || null)}
                                onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                                className="bg-background/50"
                            />
                        </div>

                        <div className="col-span-6 grid gap-2">
                            <Label htmlFor="notes">Internal Notes</Label>
                            <Textarea
                                id="notes"
                                placeholder="Additional details..."
                                value={formData.notes || ''}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="min-h-[100px] bg-background/50"
                            />
                        </div>

                        {/* Collapsible Marketing */}
                        <div className="col-span-6 border border-white/10 rounded-xl p-4 mt-2 bg-white/5 shadow-inner">
                            <div
                                className="flex items-center justify-between cursor-pointer group"
                                onClick={() => setShowMarketing(!showMarketing)}
                            >
                                <span className="text-sm font-semibold tracking-wide">MARKETING ATTRIBUTION (UTMS)</span>
                                {showMarketing ? <ChevronUp className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> : <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />}
                            </div>

                            {showMarketing && (
                                <div className="grid grid-cols-6 gap-4 mt-6">
                                    <div className="col-span-3 grid gap-2">
                                        <Label htmlFor="utm_source" className="text-xs">UTM Source</Label>
                                        <Input
                                            id="utm_source"
                                            value={formData.utm_source || ''}
                                            onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
                                            className="bg-background/30 h-8 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-3 grid gap-2">
                                        <Label htmlFor="utm_medium" className="text-xs">UTM Medium</Label>
                                        <Input
                                            id="utm_medium"
                                            value={formData.utm_medium || ''}
                                            onChange={(e) => setFormData({ ...formData, utm_medium: e.target.value })}
                                            className="bg-background/30 h-8 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-3 grid gap-2">
                                        <Label htmlFor="utm_campaign" className="text-xs">UTM Campaign</Label>
                                        <Input
                                            id="utm_campaign"
                                            value={formData.utm_campaign || ''}
                                            onChange={(e) => setFormData({ ...formData, utm_campaign: e.target.value })}
                                            className="bg-background/30 h-8 text-sm"
                                        />
                                    </div>
                                    <div className="col-span-3 grid gap-2">
                                        <Label htmlFor="utm_content" className="text-xs">UTM Content</Label>
                                        <Input
                                            id="utm_content"
                                            value={formData.utm_content || ''}
                                            onChange={(e) => setFormData({ ...formData, utm_content: e.target.value })}
                                            className="bg-background/30 h-8 text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {lead && (
                        <div className="mt-12 pt-8 border-t border-white/10">
                            <Label className="mb-6 block text-lg font-bold tracking-tight">Activity Timeline</Label>
                            <ActivityLogList leadId={lead.id} />
                        </div>
                    )}
                </form>

                <DialogFooter className="px-8 py-6 border-t border-white/10 bg-white/5 shrink-0">
                    <Button onClick={() => onOpenChange(false)} variant="ghost" className="hover:bg-white/5 transition-colors">Cancel</Button>
                    <Button
                        type="submit"
                        form="lead-form-id"
                        disabled={loading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {lead ? 'Update Lead Profile' : 'Create New Lead'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

