-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Anyone can submit applications" ON public.applications;

-- Create a more specific policy - still allows public inserts but only for new pending applications
CREATE POLICY "Public can submit new applications"
  ON public.applications FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    status = 'pending' AND
    reviewed_by IS NULL AND
    reviewed_at IS NULL AND
    admin_notes IS NULL
  );