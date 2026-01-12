-- Fix RLS policies on emma_leads to allow anonymous upsert operations
-- The issue: upsert needs SELECT permission, but current policy requires auth.uid()

-- Drop existing restrictive SELECT policy
DROP POLICY IF EXISTS "Admins can view emma leads" ON emma_leads;

-- Create new SELECT policy that allows public read (required for upsert to work)
CREATE POLICY "Allow public select for upsert" ON emma_leads
  FOR SELECT USING (true);

-- Add admin-only DELETE policy for data management
CREATE POLICY "Only admins can delete emma leads" ON emma_leads
  FOR DELETE USING (
    auth.uid() IS NOT NULL AND 
    public.is_admin(auth.uid())
  );