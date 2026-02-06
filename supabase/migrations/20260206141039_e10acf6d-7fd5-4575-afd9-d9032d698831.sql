-- Create function to check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = auth.uid()
      AND role = 'super_admin'
      AND status = 'approved'
  )
$$;

-- Create function to check if user is approved staff
CREATE OR REPLACE FUNCTION public.is_approved_staff()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.staff_members
    WHERE user_id = auth.uid()
      AND status = 'approved'
  )
$$;

-- RLS policies for posts
-- Super admin can do everything
CREATE POLICY "Super admin full access to posts"
ON public.posts
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Staff can view all published posts
CREATE POLICY "Staff can view published posts"
ON public.posts
FOR SELECT
USING (is_approved_staff() AND is_published = true);

-- Staff can view their own posts
CREATE POLICY "Staff can view own posts"
ON public.posts
FOR SELECT
USING (is_approved_staff() AND author_id = get_staff_id());

-- Staff can create posts
CREATE POLICY "Staff can create posts"
ON public.posts
FOR INSERT
WITH CHECK (is_approved_staff() AND author_id = get_staff_id());

-- Staff can update only their own posts
CREATE POLICY "Staff can update own posts"
ON public.posts
FOR UPDATE
USING (is_approved_staff() AND author_id = get_staff_id())
WITH CHECK (is_approved_staff() AND author_id = get_staff_id());

-- Staff can delete only their own posts
CREATE POLICY "Staff can delete own posts"
ON public.posts
FOR DELETE
USING (is_approved_staff() AND author_id = get_staff_id());

-- Public can view published posts
CREATE POLICY "Public can view published posts"
ON public.posts
FOR SELECT
USING (is_published = true);

-- Update staff_members RLS to allow pending registrations
DROP POLICY IF EXISTS "Admins can add staff members" ON public.staff_members;

CREATE POLICY "Users can register as pending staff"
ON public.staff_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid() 
  AND status = 'pending'
  AND role = 'staff'
);

CREATE POLICY "Super admin can manage all staff"
ON public.staff_members
FOR ALL
USING (is_super_admin())
WITH CHECK (is_super_admin());

-- Update trigger for posts
CREATE TRIGGER update_posts_updated_at
BEFORE UPDATE ON public.posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();