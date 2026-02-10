import { FormField } from './types';

export const DEFAULT_FORM_SCHEMA: FormField[] = [
    { id: 'sec_1', type: 'section', label: 'Basic Information', required: false },
    { id: 'lead_name', type: 'text', label: 'Name', placeholder: 'e.g. John Doe', required: true, is_standard: true, field_key: 'lead_name' },
    { id: 'company_name', type: 'text', label: 'Company', placeholder: 'e.g. Acme Inc.', required: false, is_standard: true, field_key: 'company_name' },
    { id: 'email', type: 'text', label: 'Email', placeholder: 'john@example.com', required: false, is_standard: true, field_key: 'email' },
    { id: 'client_geography', type: 'text', label: 'Geography', placeholder: 'e.g. USA, UK', required: false, is_standard: true, field_key: 'client_geography' },

    { id: 'sec_2', type: 'section', label: 'Online Presence', required: false },
    { id: 'linkedin_url', type: 'text', label: 'LinkedIn URL', placeholder: 'https://linkedin.com/in/...', required: false, is_standard: true, field_key: 'linkedin_url' },
    { id: 'website_url', type: 'text', label: 'Website URL', placeholder: 'https://...', required: false, is_standard: true, field_key: 'website_url' },

    { id: 'div_1', type: 'divider', label: '', required: false },

    { id: 'sec_3', type: 'section', label: 'Classification', required: false },
    { id: 'segment', type: 'select', label: 'Segment', placeholder: 'Select Segment', required: true, is_standard: true, field_key: 'segment', options: ['Web2', 'Web3'] },
    { id: 'sub_segment', type: 'select', label: 'Sub Segment', placeholder: 'Select Sub Segment', required: false, is_standard: true, field_key: 'sub_segment', options: ['Exporter', 'Freelancer', 'Agency', 'Wallet', 'dApp', 'Payments Infra', 'On-Ramp', 'Off-Ramp', 'Both On-Off Ramp'] },
    { id: 'product_fit', type: 'select', label: 'Product Fit', placeholder: 'Select Product Fit', required: false, is_standard: true, field_key: 'product_fit', options: ['Trustodi', 'Kima', 'Both'] },

    { id: 'sec_4', type: 'section', label: 'Point of Contact', required: false },
    { id: 'decision_maker_name', type: 'text', label: 'Decision Maker', placeholder: 'Name', required: false, is_standard: true, field_key: 'decision_maker_name' },
    { id: 'role', type: 'text', label: 'Role', placeholder: 'e.g. CEO, CTO', required: false, is_standard: true, field_key: 'role' },

    { id: 'sec_5', type: 'section', label: 'Business Details', required: false },
    { id: 'currency_flow', type: 'text', label: 'Currency Flow', placeholder: 'e.g. USD -> INR', required: false, is_standard: true, field_key: 'currency_flow' },
    { id: 'use_case', type: 'text', label: 'Use Case', placeholder: 'e.g. Payroll, Vendors', required: false, is_standard: true, field_key: 'use_case' },
];
