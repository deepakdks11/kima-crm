-- 1. Create a security definer function to check workspace membership
-- This avoids recursion because it bypasses RLS for the internal query
CREATE OR REPLACE FUNCTION check_workspace_membership(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Update workspace_members policies
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON workspace_members;
CREATE POLICY "Users can view members of their workspaces"
ON workspace_members FOR SELECT
TO authenticated
USING (
    user_id = auth.uid() OR check_workspace_membership(workspace_id)
);

-- 3. Update leads policies to use the function
DROP POLICY IF EXISTS "Users can only view leads in their workspaces" ON leads;
CREATE POLICY "Users can only view leads in their workspaces"
ON leads FOR SELECT
TO authenticated
USING (
    check_workspace_membership(workspace_id)
);

DROP POLICY IF EXISTS "Users can only insert leads into their workspaces" ON leads;
CREATE POLICY "Users can only insert leads into their workspaces"
ON leads FOR INSERT
TO authenticated
WITH CHECK (
    check_workspace_membership(workspace_id)
);

DROP POLICY IF EXISTS "Users can only update leads in their workspaces" ON leads;
CREATE POLICY "Users can only update leads in their workspaces"
ON leads FOR UPDATE
TO authenticated
USING (
    check_workspace_membership(workspace_id)
)
WITH CHECK (
    check_workspace_membership(workspace_id)
);

DROP POLICY IF EXISTS "Users can only delete leads in their workspaces" ON leads;
CREATE POLICY "Users can only delete leads in their workspaces"
ON leads FOR DELETE
TO authenticated
USING (
    check_workspace_membership(workspace_id)
);

-- 4. Update workspaces policy
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON workspaces;
CREATE POLICY "Users can view workspaces they are members of"
ON workspaces FOR SELECT
TO authenticated
USING (
    check_workspace_membership(id)
);

-- 5. Grant permissions
GRANT EXECUTE ON FUNCTION check_workspace_membership TO authenticated;
