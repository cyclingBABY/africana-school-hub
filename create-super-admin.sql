-- ============================================================================
-- CREATE SUPER ADMIN USER
-- Africana Muslim Secondary School Hub
-- ============================================================================
-- Run this script AFTER running supabase-complete-setup.sql
-- This will create the super admin user and staff member record
-- ============================================================================

-- Step 1: Create the authentication user
-- Note: You need to do this in the Supabase Dashboard > Authentication > Users
-- Click "Add User" and use these credentials:
-- Email: africanamuslim_code5_creations@gmail.com
-- Password: admin.africana.2026
-- Make sure to check "Auto Confirm User"

-- Step 2: After creating the user in the dashboard, get the user_id
-- Go to Authentication > Users and copy the UUID of the user you just created
-- Replace 'YOUR_USER_ID_HERE' below with that UUID

-- Step 3: Run this SQL to create the staff member record
-- Replace 'YOUR_USER_ID_HERE' with the actual user ID from Step 2

INSERT INTO public.staff_members (
  user_id,
  email,
  full_name,
  role,
  status,
  school_position
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- Replace with actual user ID from Auth > Users
  'africanamuslim_code5_creations@gmail.com',
  'Super Admin',
  'super_admin',
  'approved',
  'Head of Operations'
)
ON CONFLICT (user_id) DO UPDATE SET
  role = 'super_admin',
  status = 'approved',
  full_name = 'Super Admin',
  school_position = 'Head of Operations';

-- ============================================================================
-- ALTERNATIVE: Automatic Creation on First Login
-- ============================================================================
-- The Auth.tsx file is already configured to automatically create the 
-- staff_members record when the super admin logs in for the first time.
-- 
-- So you can simply:
-- 1. Create the user in Supabase Dashboard (Authentication > Users)
-- 2. Login at http://localhost:8081/auth
-- 3. The staff_members record will be created automatically
-- ============================================================================

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================
-- After creating the super admin, run this to verify:

SELECT 
  sm.id,
  sm.user_id,
  sm.email,
  sm.full_name,
  sm.role,
  sm.status,
  sm.school_position,
  sm.created_at
FROM public.staff_members sm
WHERE sm.email = 'africanamuslim_code5_creations@gmail.com';

-- Expected result:
-- - role should be 'super_admin'
-- - status should be 'approved'
-- - full_name should be 'Super Admin'

-- ============================================================================
-- TROUBLESHOOTING
-- ============================================================================

-- If you need to update an existing user to super admin:
UPDATE public.staff_members
SET 
  role = 'super_admin',
  status = 'approved',
  school_position = 'Head of Operations'
WHERE email = 'africanamuslim_code5_creations@gmail.com';

-- If you need to delete and recreate:
DELETE FROM public.staff_members 
WHERE email = 'africanamuslim_code5_creations@gmail.com';

-- Then insert again with the correct user_id
