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
import { Lead, LeadSegment, LeadSubSegment, LeadProductFit, LeadStatus, LeadSource, FormField } from '@/lib/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ActivityLogList } from '@/components/activity/activity-log-list';
import { useWorkspace } from '@/components/providers/workspace-provider';

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
    const [loading, setLoading] = useState(false);
    const [showMarketing, setShowMarketing] = useState(false);

    // Dynamic Fields
    const customFields = (workspace?.form_schema as any) as FormField[] || [];

    // State for form fields
    const [formData, setFormData] = useState<Partial<Lead>>({
        lead_name: '',
        company_name: '',
        email: '',
        linkedin_url: '',
        website_url: '',
        segment: 'Web2',
        sub_segment: null,
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
        // Dates need to be strings for input[type=date/datetime-local] or null
        last_contact_date: null,
        next_followup_date: null,
        notes: '',
        custom_data: {},
    });

    // Load lead data if editing - simplified sync
    useEffect(() => {
        if (open && lead) {
            setFormData({
                ...lead,
                // Ensure dates are in the correct format for datetime-local input if they exist
                last_contact_date: lead.last_contact_date,
                next_followup_date: lead.next_followup_date,
                custom_data: lead.custom_data || {},
            });
        } else if (open && !lead) {
            // Reset form for new lead when dialog opens
            setFormData({
                lead_name: '',
                company_name: '',
                email: '',
                linkedin_url: '',
                website_url: '',
                segment: 'Web2',
                sub_segment: null,
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

    const getChanges = (oldData: Lead, newData: Partial<Lead>) => {
        const changes: Record<string, { from: unknown, to: unknown }> = {};
        const keys = Object.keys(newData) as (keyof Lead)[];

        keys.forEach(key => {
            if (key === 'updated_at' || key === 'created_at' || key === 'id' || key === 'owner' || key === 'lead_score' || key === 'custom_data') return;
            // Simple comparison
            const oldVal = (oldData as any)[key];
            const newVal = (newData as any)[key];

            // Handle dates and nulls roughly
            if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                // Ignore if both are effectively null/empty
                if (!oldVal && !newVal) return;
                // Don't log internal format changes if the value is same date
                changes[key] = { from: oldVal, to: newVal };
            }
        });
        return changes;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                ...formData,
                sub_segment: formData.sub_segment || null,
                product_fit: formData.product_fit || null,
                linkedin_url: formData.linkedin_url || null,
                website_url: formData.website_url || null,
                client_geography: formData.client_geography || null,
                currency_flow: formData.currency_flow || null,
                use_case: formData.use_case || null,
                decision_maker_name: formData.decision_maker_name || null,
                role: formData.role || null,
                utm_source: formData.utm_source || null,
                utm_medium: formData.utm_medium || null,
                utm_campaign: formData.utm_campaign || null,
                utm_content: formData.utm_content || null,
                notes: formData.notes || null,
                workspace_id: workspace?.id,
                custom_data: formData.custom_data || {},
            };

            let error;
            let resultData;

            if (lead) {
                // Edit mode
                const { data, error: updateError } = await supabase
                    .from('leads')
                    .update(payload)
                    .eq('id', lead.id)
                    .select()
                    .single();

                error = updateError;
                resultData = data;

                if (!error && resultData) {
                    const changes = getChanges(lead, payload as Lead);
                    if (Object.keys(changes).length > 0) {
                        const action = changes.status ? 'STATUS_CHANGE' : 'UPDATED';
                        await logActivity(lead.id, action, changes);
                    }
                }
            } else {
                // Create mode
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

            onOpenChange(false);
            router.refresh();
        } catch (error) {
            console.error('Error saving lead:', error);
            alert('Failed to save lead');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{lead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="grid gap-6 py-4">

                    {/* Core Info */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="lead_name">Name *</Label>
                            <Input
                                id="lead_name"
                                required
                                value={formData.lead_name || ''}
                                onChange={(e) => setFormData({ ...formData, lead_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="company_name">Company</Label>
                            <Input
                                id="company_name"
                                value={formData.company_name || ''}
                                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email || ''}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="client_geography">Geography</Label>
                            <Input
                                id="client_geography"
                                placeholder="e.g. USA, UK"
                                value={formData.client_geography || ''}
                                onChange={(e) => setFormData({ ...formData, client_geography: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* URLs */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                            <Input
                                id="linkedin_url"
                                value={formData.linkedin_url || ''}
                                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="website_url">Website URL</Label>
                            <Input
                                id="website_url"
                                value={formData.website_url || ''}
                                onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            />
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* Segmentation */}
                    <section className="grid grid-cols-3 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="segment">Segment</Label>
                            <Select
                                value={formData.segment || 'Web2'}
                                onValueChange={(val: string) => setFormData({ ...formData, segment: val as LeadSegment })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Web2">Web2</SelectItem>
                                    <SelectItem value="Web3">Web3</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="sub_segment">Sub Segment</Label>
                            <Select
                                value={formData.sub_segment || ''}
                                onValueChange={(val: string) => setFormData({ ...formData, sub_segment: val as LeadSubSegment })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Exporter">Exporter</SelectItem>
                                    <SelectItem value="Freelancer">Freelancer</SelectItem>
                                    <SelectItem value="Agency">Agency</SelectItem>
                                    <SelectItem value="Wallet">Wallet</SelectItem>
                                    <SelectItem value="dApp">dApp</SelectItem>
                                    <SelectItem value="Payments Infra">Payments Infra</SelectItem>
                                    <SelectItem value="On-Ramp">On-Ramp</SelectItem>
                                    <SelectItem value="Off-Ramp">Off-Ramp</SelectItem>
                                    <SelectItem value="Both On-Off Ramp">Both On-Off Ramp</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="product_fit">Product Fit</Label>
                            <Select
                                value={formData.product_fit || ''}
                                onValueChange={(val: string) => setFormData({ ...formData, product_fit: val as LeadProductFit })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Trustodi">Trustodi</SelectItem>
                                    <SelectItem value="Kima">Kima</SelectItem>
                                    <SelectItem value="Both">Both</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </section>

                    {/* Business Details */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="decision_maker_name">Decision Maker</Label>
                            <Input
                                id="decision_maker_name"
                                placeholder="Name"
                                value={formData.decision_maker_name || ''}
                                onChange={(e) => setFormData({ ...formData, decision_maker_name: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="role">Role</Label>
                            <Input
                                id="role"
                                placeholder="e.g. CEO, CTO"
                                value={formData.role || ''}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="currency_flow">Currency Flow</Label>
                            <Input
                                id="currency_flow"
                                placeholder="e.g. USD -> INR"
                                value={formData.currency_flow || ''}
                                onChange={(e) => setFormData({ ...formData, currency_flow: e.target.value })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="use_case">Use Case</Label>
                            <Input
                                id="use_case"
                                placeholder="e.g. Payroll, Vendors"
                                value={formData.use_case || ''}
                                onChange={(e) => setFormData({ ...formData, use_case: e.target.value })}
                            />
                        </div>
                    </section>

                    {/* Custom Fields */}
                    {customFields.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 border-t pt-4">
                            <h3 className="col-span-2 text-sm font-medium text-muted-foreground">Custom Fields</h3>
                            {customFields.map((field) => (
                                <div key={field.id} className="grid gap-2">
                                    <Label htmlFor={field.id}>
                                        {field.label} {field.required && '*'}
                                    </Label>
                                    {field.type === 'select' ? (
                                        <Select
                                            value={formData.custom_data?.[field.label] as string || ''}
                                            onValueChange={(val) => setFormData({
                                                ...formData,
                                                custom_data: { ...formData.custom_data, [field.label]: val }
                                            })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {field.options?.map((opt) => (
                                                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                                )) || (
                                                        // Fallback if no options are defined (which shouldn't happen for valid select types)
                                                        <>
                                                            <SelectItem value="Yes">Yes</SelectItem>
                                                            <SelectItem value="No">No</SelectItem>
                                                        </>
                                                    )}
                                            </SelectContent>
                                        </Select>
                                    ) : field.type === 'textarea' ? (
                                        <Textarea
                                            id={field.id}
                                            placeholder={field.placeholder}
                                            value={formData.custom_data?.[field.label] as string || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                custom_data: { ...formData.custom_data, [field.label]: e.target.value }
                                            })}
                                        />
                                    ) : (
                                        <Input
                                            id={field.id}
                                            type={field.type}
                                            placeholder={field.placeholder}
                                            required={field.required}
                                            value={formData.custom_data?.[field.label] as string || ''}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                custom_data: { ...formData.custom_data, [field.label]: e.target.value }
                                            })}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <hr className="border-gray-100" />

                    {/* Sales Process */}
                    <section className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="status">Status</Label>
                            <Select
                                value={formData.status || 'New'}
                                onValueChange={(val: string) => setFormData({ ...formData, status: val as LeadStatus })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="New">New</SelectItem>
                                    <SelectItem value="Contacted">Contacted</SelectItem>
                                    <SelectItem value="Demo Scheduled">Demo Scheduled</SelectItem>
                                    <SelectItem value="Negotiation">Negotiation</SelectItem>
                                    <SelectItem value="Onboarded">Onboarded</SelectItem>
                                    <SelectItem value="Lost">Lost</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="source">Source</Label>
                            <Select
                                value={formData.source || 'Website'}
                                onValueChange={(val: string) => setFormData({ ...formData, source: val as LeadSource })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Website">Website</SelectItem>
                                    <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                                    <SelectItem value="Referral">Referral</SelectItem>
                                    <SelectItem value="Cold Outreach">Cold Outreach</SelectItem>
                                    <SelectItem value="Facebook Ads">Facebook Ads</SelectItem>
                                    <SelectItem value="Google Ads">Google Ads</SelectItem>
                                    <SelectItem value="Instagram Ads">Instagram Ads</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="next_followup">Next Follow-up</Label>
                            <Input
                                id="next_followup"
                                type="datetime-local"
                                value={toLocalISOString(formData.next_followup_date || null)}
                                onChange={(e) => setFormData({ ...formData, next_followup_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="last_contact">Last Contact</Label>
                            <Input
                                id="last_contact"
                                type="datetime-local"
                                value={toLocalISOString(formData.last_contact_date || null)}
                                onChange={(e) => setFormData({ ...formData, last_contact_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
                            />
                        </div>
                    </section>

                    <div className="grid gap-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea
                            id="notes"
                            placeholder="Additional details..."
                            value={formData.notes || ''}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    {/* Collapsible Marketing */}
                    <div className="border rounded-md p-3">
                        <div
                            className="flex items-center justify-between cursor-pointer"
                            onClick={() => setShowMarketing(!showMarketing)}
                        >
                            <span className="text-sm font-medium">Marketing Details (UTMs)</span>
                            {showMarketing ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>

                        {showMarketing && (
                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="utm_source">UTM Source</Label>
                                    <Input
                                        id="utm_source"
                                        value={formData.utm_source || ''}
                                        onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="utm_medium">UTM Medium</Label>
                                    <Input
                                        id="utm_medium"
                                        value={formData.utm_medium || ''}
                                        onChange={(e) => setFormData({ ...formData, utm_medium: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="utm_campaign">UTM Campaign</Label>
                                    <Input
                                        id="utm_campaign"
                                        value={formData.utm_campaign || ''}
                                        onChange={(e) => setFormData({ ...formData, utm_campaign: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="utm_content">UTM Content</Label>
                                    <Input
                                        id="utm_content"
                                        value={formData.utm_content || ''}
                                        onChange={(e) => setFormData({ ...formData, utm_content: e.target.value })}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {lead && (
                        <div className="border-t pt-4">
                            <Label className="mb-2 block">Activity History</Label>
                            <ActivityLogList leadId={lead.id} />
                        </div>
                    )}

                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? 'Saving...' : 'Save Lead'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
