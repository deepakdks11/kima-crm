-- FINAL ROBUST FIX FOR RLS RECURSION
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
DROP POLICY IF EXISTS "Users can only view leads in their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can only insert leads into their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can only update leads in their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can only delete leads in their workspaces" ON public.leads;
DROP POLICY IF EXISTS "Users can view workspaces they are members of" ON public.workspaces;

-- 3. Apply non-recursive policies for workspace_members
-- A user can always see their own membership
CREATE POLICY "members_read_own" ON public.workspace_members
    FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- A user can see others in the same workspace using the function
CREATE POLICY "members_read_others" ON public.workspace_members
    FOR SELECT TO authenticated USING (is_member_of_workspace(workspace_id));

-- 4. Apply policies for workspaces
CREATE POLICY "workspaces_read" ON public.workspaces
    FOR SELECT TO authenticated USING (is_member_of_workspace(id));

-- 5. Apply policies for leads
CREATE POLICY "leads_read" ON public.leads
    FOR SELECT TO authenticated USING (is_member_of_workspace(workspace_id));

CREATE POLICY "leads_insert" ON public.leads
    FOR INSERT TO authenticated WITH CHECK (is_member_of_workspace(workspace_id));

CREATE POLICY "leads_update" ON public.leads
    FOR UPDATE TO authenticated USING (is_member_of_workspace(workspace_id));

CREATE POLICY "leads_delete" ON public.leads
    FOR DELETE TO authenticated USING (is_member_of_workspace(workspace_id));

-- 6. Ensure RLS is enabled
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 7. Grant permission
GRANT EXECUTE ON FUNCTION public.is_member_of_workspace TO authenticated;
