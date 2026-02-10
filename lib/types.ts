
export type LeadSegment = 'Web2' | 'Web3';
export type LeadSubSegment = 'Exporter' | 'Freelancer' | 'Agency' | 'Wallet' | 'dApp' | 'Payments Infra' | 'On-Ramp' | 'Off-Ramp' | 'Both On-Off Ramp';
export type LeadProductFit = 'Trustodi' | 'Kima' | 'Both';
export type LeadStatus = 'New' | 'Contacted' | 'Demo Scheduled' | 'Negotiation' | 'Onboarded' | 'Lost';
export type LeadSource = 'LinkedIn' | 'Referral' | 'Website' | 'Cold Outreach' | 'Facebook Ads' | 'Instagram Ads' | 'Google Ads';

export interface Lead {
    id: string;
    created_at: string;
    lead_name: string;
    company_name: string | null;
    email: string | null;
    linkedin_url: string | null;
    website_url: string | null;
    segment: string[]; // Changed from LeadSegment to string[] for multi-select
    sub_segment: string[] | null; // Changed from LeadSubSegment to string[]
    product_fit: LeadProductFit | null;
    client_geography: string | null;
    currency_flow: string | null;
    use_case: string | null;
    decision_maker_name: string | null;
    role: string | null;
    source: LeadSource;
    status: LeadStatus;
    lead_score: number;
    owner: string | null; // UUID

    // Tracking
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_content: string | null;
    ad_id: string | null;
    ad_set_id: string | null;
    campaign_id: string | null;

    last_contact_date: string | null;
    next_followup_date: string | null;
    notes: string | null;
    updated_at: string | null;
    custom_data?: Record<string, any>; // JSONB

    // Multi-tenancy
    workspace_id?: string;
    board_id?: string;
}

export interface FormField {
    id: string;
    type: 'text' | 'number' | 'date' | 'select' | 'textarea' | 'section' | 'divider';
    label: string;
    placeholder?: string;
    required: boolean;
    options?: string[]; // For select type
    field_key?: string; // Mapped DB column or custom_data key
    is_standard?: boolean; // True if mapping to a built-in Lead column
    hidden?: boolean;
}

export interface Workspace {
    id: string;
    name: string;
    slug: string;
    owner_id: string;
    created_at: string;
    form_schema?: FormField[]; // JSONB
    brand_color?: string;
}

export interface WorkspaceMember {
    workspace_id: string;
    user_id: string;
    role: 'owner' | 'admin' | 'member';
    joined_at: string;
}

export interface Board {
    id: string;
    workspace_id: string;
    name: string;
    description: string | null;
    is_active: boolean;
    created_at: string;
}

export interface Invitation {
    id: string;
    email: string;
    workspace_id: string;
    role: 'owner' | 'admin' | 'member';
    token: string;
    expires_at: string;
    created_at: string;
}

export interface ActivityLog {
    id: string;
    created_at: string;
    lead_id: string;
    user_id: string | null;
    action: string;
    details: Record<string, unknown>; // JSON
}

export interface TeamMember {
    id: string;
    user_id: string | null;
    name: string;
    email: string;
    role: 'Owner' | 'Admin' | 'Member';
    invited_by: string | null;
    invited_at: string;
    accepted_at: string | null;
    created_at: string;
}

export interface UserProfile {
    id: string;
    first_name: string | null;
    last_name: string | null;
    bio: string | null;
    avatar_url: string | null;
    updated_at: string;
}

export interface UserPreferences {
    user_id: string;
    email_notifications: boolean;
    followup_reminders: boolean;
    deal_stage_changes: boolean;
    new_lead_assignments: boolean;
    weekly_summary: boolean;
}
