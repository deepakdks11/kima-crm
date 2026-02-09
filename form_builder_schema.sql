-- Add form_schema to workspaces
ALTER TABLE workspaces ADD COLUMN IF NOT EXISTS form_schema JSONB DEFAULT '[]'::jsonb;

-- Add custom_data to leads
ALTER TABLE leads ADD COLUMN IF NOT EXISTS custom_data JSONB DEFAULT '{}'::jsonb;

-- Ensure RLS allows updating these
-- (Already covered by existing policies if they cover "all columns" or the row itself, 
-- but good to verify. The existing policies were ON leads FOR UPDATE ... so it covers all columns)
