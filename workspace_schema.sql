-- 1. Ensure leads table has workspace_id and proper linking
-- Note: If workspace_id already exists, this will just ensure the FK and index
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='leads' AND column_name='workspace_id') THEN
        ALTER TABLE leads ADD COLUMN workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_leads_workspace_id ON leads(workspace_id);

-- 2. Correct RLS Policies for leads
-- First, drop the permissive policy
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON leads;

-- Create restrictive policies
CREATE POLICY "Users can only view leads in their workspaces"
ON leads FOR SELECT
TO authenticated
USING (
    workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can only insert leads into their workspaces"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
    workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can only update leads in their workspaces"
ON leads FOR UPDATE
TO authenticated
USING (
    workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
)
WITH CHECK (
    workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can only delete leads in their workspaces"
ON leads FOR DELETE
TO authenticated
USING (
    workspace_id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
);

-- 3. Ensure RLS is enabled for all tables
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- 4. RLS for workspaces
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
CREATE POLICY "Users can view workspaces they are members of"
ON workspaces FOR SELECT
TO authenticated
USING (
    id IN (
        SELECT workspace_id FROM workspace_members WHERE user_id = auth.uid()
    )
);

-- Allow users to create workspaces
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;
CREATE POLICY "Users can create workspaces"
ON workspaces FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- 5. RLS for workspace_members
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
CREATE POLICY "Users can view members of their workspaces"
ON workspace_members FOR SELECT
TO authenticated
USING (
    workspace_id IN (
        SELECT wm.workspace_id FROM workspace_members wm WHERE wm.user_id = auth.uid()
    )
);
