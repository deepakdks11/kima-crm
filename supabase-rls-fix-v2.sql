-- FOOLPROOF FIX: RLS Recursion for team_members table (V2)
-- Run this in your Supabase SQL Editor

-- 1. Create a comprehensive security definer function
-- This handles ALL logic that requires querying the team_members table.
CREATE OR REPLACE FUNCTION can_manage_team_members(user_id_to_check UUID)
RETURNS BOOLEAN AS $$
DECLARE
    is_empty BOOLEAN;
    is_admin BOOLEAN;
BEGIN
    -- Check if table is empty (bootstrapping)
    -- Using public schema explicitly to be safe
    SELECT NOT EXISTS (SELECT 1 FROM public.team_members) INTO is_empty;
    
    IF is_empty THEN
        RETURN TRUE;
    END IF;

    -- Check if user is Admin or Owner
    SELECT EXISTS (
        SELECT 1 FROM public.team_members 
        WHERE user_id = user_id_to_check 
        AND role IN ('Owner', 'Admin')
    ) INTO is_admin;

    RETURN is_admin;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Clean up ALL possible policies to avoid conflicts
-- Disable RLS temporarily to ensure we can drop everything cleanly
ALTER TABLE team_members DISABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can invite members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can remove members" ON team_members;
DROP POLICY IF EXISTS "team_members_select" ON team_members;
DROP POLICY IF EXISTS "team_members_insert" ON team_members;
DROP POLICY IF EXISTS "team_members_delete" ON team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;

-- 3. Re-enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- 4. Create ultra-simple policies that only call the function or check auth role

-- SELECT: All authenticated users can see the team
CREATE POLICY "team_members_read_v2"
  ON team_members FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Logic is entirely contained in the function
CREATE POLICY "team_members_write_v2"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND 
    can_manage_team_members(auth.uid())
  );

-- DELETE: Logic is entirely contained in the function
CREATE POLICY "team_members_delete_v2"
  ON team_members FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    can_manage_team_members(auth.uid()) AND
    role != 'Owner' -- Safety: Cannot delete owners
  );

-- 5. Grant permissions to the function
GRANT EXECUTE ON FUNCTION can_manage_team_members TO authenticated;
GRANT EXECUTE ON FUNCTION can_manage_team_members TO service_role;
GRANT EXECUTE ON FUNCTION can_manage_team_members TO anon;
