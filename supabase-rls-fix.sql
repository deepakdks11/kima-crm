-- FIX: RLS Recursion for team_members table
-- Run this in your Supabase SQL Editor

-- 1. Create a security definer function to check roles
-- This function runs with the privileges of the schema owner, 
-- bypassing RLS checks on the team_members table itself.
CREATE OR REPLACE FUNCTION check_is_team_admin(user_id_to_check UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM team_members 
    WHERE user_id = user_id_to_check 
    AND role IN ('Owner', 'Admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Clean up existing policies to ensure a fresh start
DROP POLICY IF EXISTS "Authenticated users can view team members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can invite members" ON team_members;
DROP POLICY IF EXISTS "Authenticated users can remove members" ON team_members;
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;

-- 3. Create safe, non-recursive policies

-- SELECT: Anyone authenticated can view the team list
CREATE POLICY "team_members_select"
  ON team_members FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: Only Owners or Admins can invite new members
-- We use the security definer function here to avoid recursion
CREATE POLICY "team_members_insert"
  ON team_members FOR INSERT
  WITH CHECK (
    auth.role() = 'authenticated' AND (
      -- Check if requester is an admin/owner
      check_is_team_admin(auth.uid()) OR 
      -- Allow the very first insert if table is empty (bootstrapping)
      NOT EXISTS (SELECT 1 FROM team_members)
    )
  );

-- DELETE: Only Owners or Admins can remove members, and they cannot remove Owners
CREATE POLICY "team_members_delete"
  ON team_members FOR DELETE
  USING (
    auth.role() = 'authenticated' AND 
    check_is_team_admin(auth.uid()) AND
    role != 'Owner'
  );

-- 4. Grant necessary permissions
GRANT EXECUTE ON FUNCTION check_is_team_admin TO authenticated;
GRANT EXECUTE ON FUNCTION check_is_team_admin TO service_role;
