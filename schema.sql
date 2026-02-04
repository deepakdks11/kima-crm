-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Enums for fixed values
create type lead_segment as enum ('Web2', 'Web3');
create type lead_sub_segment as enum ('Exporter', 'Freelancer', 'Agency', 'Wallet', 'dApp', 'Payments Infra');
create type lead_product_fit as enum ('Trustodi', 'Kima', 'Both');
create type lead_status as enum ('New', 'Contacted', 'Demo Scheduled', 'Negotiation', 'Onboarded', 'Lost');
create type lead_source as enum ('LinkedIn', 'Referral', 'Website', 'Cold Outreach', 'Facebook Ads', 'Instagram Ads', 'Google Ads');

-- LEADS TABLE
create table leads (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Core Lead Info
  lead_name text not null,
  company_name text,
  email text,
  linkedin_url text,
  website_url text,
  
  -- Segmentation
  segment lead_segment not null,
  sub_segment lead_sub_segment,
  product_fit lead_product_fit,
  client_geography text, -- USA, UK, etc.
  
  -- Business Details
  currency_flow text, -- USD->INR, etc.
  use_case text,
  decision_maker_name text,
  role text,
  
  -- Sales Process
  source lead_source default 'Website',
  status lead_status default 'New',
  lead_score integer default 0,
  owner uuid references auth.users(id),
  
  -- Tracking & Ads (New)
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  ad_id text,
  ad_set_id text,
  campaign_id text,
  
  -- Follow-ups
  last_contact_date timestamp with time zone,
  next_followup_date timestamp with time zone,
  
  -- Simple Notes
  notes text,
  
  -- Audit
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- ACITVITY LOGS TABLE (Audit Trail)
create table activity_logs (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  lead_id uuid references leads(id) on delete cascade,
  user_id uuid references auth.users(id),
  action text not null, -- 'CREATED', 'UPDATED', 'STATUS_CHANGE'
  details jsonb -- Store what changed { from: 'New', to: 'Contacted' }
);

-- INDICES for Performance
create index leads_owner_idx on leads(owner);
create index leads_status_idx on leads(status);
create index leads_segment_idx on leads(segment);
create index leads_created_at_idx on leads(created_at desc);

-- RLS POLICIES (Security)
alter table leads enable row level security;
alter table activity_logs enable row level security;

-- Policy: Authenticated users can view/edit all leads (Team access)
create policy "Allow full access to authenticated users"
on leads for all
to authenticated
using (true)
with check (true);

create policy "Allow read access to activity logs"
on activity_logs for select
to authenticated
using (true);

create policy "Allow insert access to activity logs"
on activity_logs for insert
to authenticated
with check (true);

-- FUNCTION to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_leads_updated_at
before update on leads
for each row
execute procedure update_updated_at_column();
