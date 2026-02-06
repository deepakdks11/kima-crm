-- FINAL ROBUST FIX FOR RLS RECURSION, WORKSPACE CREATION, AND INVITATIONS
-- This script cleans up and uses a SECURITY DEFINER function to bypass recursion.

-- 1. Create the membership checking function
CREATE OR REPLACE FUNCTION public.is_member_of_workspace(ws_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- This inner query bypasses RLS because the function is SECURITY DEFINER
    -- and executed as the owner (postgres).
    RETURN EXISTS (
        SELECT 1 FROM public.workspace_members
        WHERE workspace_id = ws_id
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop all conflicting policies on relevant tables
DROP POLICY IF EXISTS "Users can view members of their workspaces" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can create their own workspace member entry" ON public.workspace_members;
DROP POLICY IF EXISTS "Users can only view leads in their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can only insert leads into their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can only update leads in their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can only delete leads in their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;
DROP POLICY IF EXISTS "Users can create workspaces" ON public.workspaces;

-- 3. Apply non-recursive policies for workspace_members
-- A user can always see their own membership
CREATE POLICY "members_read_own" ON public.workspace_members
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- A user can see others in the same workspace using the function
CREATE POLICY "members_read_others" ON public.workspace_members
    FOR SELECT TO authenticated USING (is_member_of_workspace(workspace_id));

-- IMPORTANT: Allow users to become members of workspaces (e.g. when creating one or accepting invite)
CREATE POLICY "members_insert" ON public.workspace_members
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "members_delete" ON public.workspace_members
    FOR DELETE TO authenticated USING (is_member_of_workspace(workspace_id));

-- 4. Apply policies for workspaces
CREATE POLICY "workspaces_read" ON public.workspaces
    FOR SELECT TO authenticated USING (is_member_of_workspace(id));

CREATE POLICY "workspaces_insert" ON public.workspaces
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = owner_id);

-- 5. Apply policies for leads
CREATE POLICY "leads_read" ON public.leads
    FOR SELECT TO authenticated USING (is_member_of_workspace(workspace_id));

CREATE POLICY "leads_insert" ON public.leads
    FOR INSERT TO authenticated WITH CHECK (is_member_of_workspace(workspace_id));

CREATE POLICY "leads_update" ON public.leads
    FOR UPDATE TO authenticated USING (is_member_of_workspace(workspace_id));

CREATE POLICY "leads_delete" ON public.leads
    FOR DELETE TO authenticated USING (is_member_of_workspace(workspace_id));

-- 6. Invitation Validation RPC
-- This function is used by the invite page to get workspace details without having access to the workspace yet.
CREATE OR REPLACE FUNCTION public.get_invitation_details(lookup_token TEXT)
RETURNS TABLE (
    id UUID,
    email TEXT,
    workspace_id UUID,
    workspace_name TEXT,
    role TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        i.id,
        i.email,
        i.workspace_id,
        w.name as workspace_name,
        i.role
    FROM public.invitations i
    JOIN public.workspaces w ON i.workspace_id = w.id
    WHERE i.token = lookup_token
    AND (i.expires_at > NOW() OR i.expires_at IS NULL);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 7. Ensure RLS is enabled
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 8. Invitation Table Policies
DROP POLICY IF EXISTS "invitations_read" ON public.invitations;
CREATE POLICY "invitations_read" ON public.invitations
    FOR SELECT TO authenticated USING (is_member_of_workspace(workspace_id));

DROP POLICY IF EXISTS "invitations_insert" ON public.invitations;
CREATE POLICY "invitations_insert" ON public.invitations
    FOR INSERT TO authenticated WITH CHECK (is_member_of_workspace(workspace_id));

DROP POLICY IF EXISTS "invitations_delete" ON public.invitations;
CREATE POLICY "invitations_delete" ON public.invitations
    FOR DELETE TO authenticated USING (is_member_of_workspace(workspace_id));

-- 9. Grant permissions
GRANT EXECUTE ON FUNCTION public.is_member_of_workspace TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invitation_details TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_invitation_details TO anon;
