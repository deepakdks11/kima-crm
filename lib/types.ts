
export type LeadSegment = 'Web2' | 'Web3';
export type LeadSubSegment = 'Exporter' | 'Freelancer' | 'Agency' | 'Wallet' | 'dApp' | 'Payments Infra';
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
    segment: LeadSegment;
    sub_segment: LeadSubSegment | null;
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
}

export interface ActivityLog {
    id: string;
    created_at: string;
    lead_id: string;
    user_id: string | null;
    action: string;
    details: Record<string, unknown>; // JSON
}
