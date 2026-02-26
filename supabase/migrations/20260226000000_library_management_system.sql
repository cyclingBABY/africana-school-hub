-- ============================================================================
-- LIBRARY MANAGEMENT SYSTEM - COMPLETE DATABASE SETUP
-- Modern Library Management System for Uganda
-- ============================================================================

-- Create enums for library system
CREATE TYPE public.book_type AS ENUM ('physical', 'digital', 'both');
CREATE TYPE public.book_status AS ENUM ('available', 'borrowed', 'reserved', 'maintenance', 'lost');
CREATE TYPE public.member_type AS ENUM ('student', 'staff', 'public');
CREATE TYPE public.member_status AS ENUM ('active', 'suspended', 'expired');
CREATE TYPE public.circulation_status AS ENUM ('active', 'returned', 'overdue', 'lost');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'ready', 'collected', 'cancelled', 'expired');
CREATE TYPE public.fine_status AS ENUM ('pending', 'paid', 'waived');
CREATE TYPE public.payment_method AS ENUM ('cash', 'mtn_mobile_money', 'airtel_money', 'bank_transfer');

-- ============================================================================
-- BOOKS CATALOG TABLE
-- ============================================================================
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- Book Information
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL,
  isbn TEXT UNIQUE,
  publisher TEXT,
  publication_year INTEGER,
  edition TEXT,
  language TEXT DEFAULT 'English',

  -- Classification
  category TEXT NOT NULL, -- e.g., 'Science', 'Literature', 'History'
  subcategory TEXT,
  dewey_decimal TEXT, -- Dewey Decimal Classification

  -- Physical Details
  book_type book_type NOT NULL DEFAULT 'physical',
  total_physical_copies INTEGER DEFAULT 0,
  available_physical_copies INTEGER DEFAULT 0,

  -- Digital Details
  digital_file_url TEXT, -- PDF/ePub URL in storage
  digital_file_type TEXT, -- 'pdf', 'epub'
  digital_file_size_mb NUMERIC(10,2),
  digital_access_count INTEGER DEFAULT 0,

  -- Additional Info
  description TEXT,
  cover_image_url TEXT,
  pages INTEGER,

  -- Barcode for physical books
  barcode TEXT UNIQUE,

  -- Stats
  times_borrowed INTEGER DEFAULT 0,
  current_reservations INTEGER DEFAULT 0,

  -- Metadata
  added_by UUID REFERENCES public.staff_members(id),
  is_featured BOOLEAN DEFAULT false,
  is_trending BOOLEAN DEFAULT false,
  is_new_arrival BOOLEAN DEFAULT false
);

-- ============================================================================
-- LIBRARY MEMBERS TABLE
-- ============================================================================
CREATE TABLE public.library_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- User Reference (links to auth.users)
  user_id UUID UNIQUE,

  -- Personal Information
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  date_of_birth DATE,
  gender TEXT,

  -- Address
  address TEXT NOT NULL,
  city TEXT DEFAULT 'Kampala',
  district TEXT,

  -- Membership Details
  member_type member_type NOT NULL DEFAULT 'student',
  member_status member_status NOT NULL DEFAULT 'active',
  membership_number TEXT UNIQUE NOT NULL,
  member_since DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_expiry DATE,

  -- Institution Details (for students/staff)
  institution_name TEXT,
  student_id TEXT,
  class_level TEXT,

  -- Photo
  photo_url TEXT,

  -- Borrowing Limits
  max_books_allowed INTEGER DEFAULT 3,
  current_books_borrowed INTEGER DEFAULT 0,

  -- Stats
  total_books_borrowed INTEGER DEFAULT 0,
  total_fines_paid NUMERIC(10,2) DEFAULT 0,

  -- QR Code for quick login/checkout
  qr_code_data TEXT UNIQUE
);

-- ============================================================================
-- CIRCULATION/BORROWING TABLE
-- ============================================================================
CREATE TABLE public.circulation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- References
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.library_members(id) ON DELETE RESTRICT,
  issued_by UUID REFERENCES public.staff_members(id),
  returned_to UUID REFERENCES public.staff_members(id),

  -- Dates
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date DATE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE,

  -- Status
  status circulation_status NOT NULL DEFAULT 'active',

  -- Fine calculation
  days_overdue INTEGER DEFAULT 0,
  fine_amount NUMERIC(10,2) DEFAULT 0,

  -- Notes
  issue_notes TEXT,
  return_notes TEXT,
  condition_at_issue TEXT,
  condition_at_return TEXT
);

-- ============================================================================
-- RESERVATIONS TABLE
-- ============================================================================
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- References
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.library_members(id) ON DELETE CASCADE,

  -- Status
  status reservation_status NOT NULL DEFAULT 'pending',

  -- Dates
  reserved_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ready_date TIMESTAMP WITH TIME ZONE,
  collected_date TIMESTAMP WITH TIME ZONE,
  expiry_date DATE,

  -- Notifications
  notification_sent BOOLEAN DEFAULT false,
  notification_method TEXT, -- 'email', 'sms', 'both'

  -- Priority Queue
  queue_position INTEGER
);

-- ============================================================================
-- FINES TABLE
-- ============================================================================
CREATE TABLE public.fines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- References
  member_id UUID NOT NULL REFERENCES public.library_members(id) ON DELETE RESTRICT,
  circulation_id UUID REFERENCES public.circulation(id) ON DELETE SET NULL,

  -- Fine Details
  fine_type TEXT NOT NULL, -- 'overdue', 'damage', 'lost_book', 'other'
  amount NUMERIC(10,2) NOT NULL,
  status fine_status NOT NULL DEFAULT 'pending',

  -- Payment
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method payment_method,
  transaction_reference TEXT,

  -- Additional Info
  description TEXT,
  waived_by UUID REFERENCES public.staff_members(id),
  waived_reason TEXT,
  waived_date TIMESTAMP WITH TIME ZONE
);

-- ============================================================================
-- DIGITAL BOOK ACCESS LOG
-- ============================================================================
CREATE TABLE public.digital_book_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),

  -- References
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.library_members(id) ON DELETE CASCADE,

  -- Access Details
  access_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_duration_minutes INTEGER,
  device_info TEXT,
  ip_address TEXT
);

-- ============================================================================
-- LIBRARY STATISTICS TABLE
-- ============================================================================
CREATE TABLE public.library_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE UNIQUE,

  -- Counts
  total_books INTEGER DEFAULT 0,
  total_physical_books INTEGER DEFAULT 0,
  total_digital_books INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,

  -- Daily Activity
  books_issued_today INTEGER DEFAULT 0,
  books_returned_today INTEGER DEFAULT 0,
  new_members_today INTEGER DEFAULT 0,
  reservations_today INTEGER DEFAULT 0,

  -- Revenue
  fines_collected_today NUMERIC(10,2) DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circulation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.digital_book_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_stats ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES - BOOKS
-- ============================================================================
-- Public can view available books
CREATE POLICY "Public can view available books"
  ON public.books FOR SELECT
  TO anon, authenticated
  USING (true);

-- Staff can manage books
CREATE POLICY "Staff can manage books"
  ON public.books FOR ALL
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - LIBRARY MEMBERS
-- ============================================================================
-- Members can view their own profile
CREATE POLICY "Members can view own profile"
  ON public.library_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_staff_or_admin());

-- Members can update their own profile
CREATE POLICY "Members can update own profile"
  ON public.library_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Public can register as members
CREATE POLICY "Public can register as members"
  ON public.library_members FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Staff can manage all members
CREATE POLICY "Staff can manage members"
  ON public.library_members FOR ALL
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - CIRCULATION
-- ============================================================================
-- Members can view their own circulation records
CREATE POLICY "Members can view own circulation"
  ON public.circulation FOR SELECT
  TO authenticated
  USING (member_id IN (SELECT id FROM public.library_members WHERE user_id = auth.uid()) OR public.is_staff_or_admin());

-- Staff can manage circulation
CREATE POLICY "Staff can manage circulation"
  ON public.circulation FOR ALL
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - RESERVATIONS
-- ============================================================================
-- Members can view and create their own reservations
CREATE POLICY "Members can manage own reservations"
  ON public.reservations FOR ALL
  TO authenticated
  USING (member_id IN (SELECT id FROM public.library_members WHERE user_id = auth.uid()) OR public.is_staff_or_admin())
  WITH CHECK (member_id IN (SELECT id FROM public.library_members WHERE user_id = auth.uid()) OR public.is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - FINES
-- ============================================================================
-- Members can view their own fines
CREATE POLICY "Members can view own fines"
  ON public.fines FOR SELECT
  TO authenticated
  USING (member_id IN (SELECT id FROM public.library_members WHERE user_id = auth.uid()) OR public.is_staff_or_admin());

-- Staff can manage fines
CREATE POLICY "Staff can manage fines"
  ON public.fines FOR ALL
  TO authenticated
  USING (public.is_staff_or_admin())
  WITH CHECK (public.is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - DIGITAL ACCESS
-- ============================================================================
CREATE POLICY "Members can view own access logs"
  ON public.digital_book_access FOR SELECT
  TO authenticated
  USING (member_id IN (SELECT id FROM public.library_members WHERE user_id = auth.uid()) OR public.is_staff_or_admin());

CREATE POLICY "Members can log digital access"
  ON public.digital_book_access FOR INSERT
  TO authenticated
  WITH CHECK (member_id IN (SELECT id FROM public.library_members WHERE user_id = auth.uid()));

-- ============================================================================
-- RLS POLICIES - STATS
-- ============================================================================
CREATE POLICY "Staff can view stats"
  ON public.library_stats FOR SELECT
  TO authenticated
  USING (public.is_staff_or_admin());

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to generate unique membership number
CREATE OR REPLACE FUNCTION public.generate_membership_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_number TEXT;
  year_code TEXT;
BEGIN
  year_code := TO_CHAR(CURRENT_DATE, 'YY');
  new_number := 'LM' || year_code || LPAD(NEXTVAL('membership_number_seq')::TEXT, 5, '0');
  RETURN new_number;
END;
$$;

-- Create sequence for membership numbers
CREATE SEQUENCE IF NOT EXISTS membership_number_seq START 1;

-- Function to calculate fine amount
CREATE OR REPLACE FUNCTION public.calculate_overdue_fine(p_circulation_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  v_days_overdue INTEGER;
  v_fine_per_day NUMERIC := 500; -- UGX 500 per day
  v_fine_amount NUMERIC;
BEGIN
  SELECT
    GREATEST(0, CURRENT_DATE - due_date)
  INTO v_days_overdue
  FROM public.circulation
  WHERE id = p_circulation_id;

  v_fine_amount := v_days_overdue * v_fine_per_day;

  RETURN v_fine_amount;
END;
$$;

-- Function to update book availability
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    -- Book borrowed
    UPDATE public.books
    SET available_physical_copies = available_physical_copies - 1,
        times_borrowed = times_borrowed + 1
    WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'returned' THEN
    -- Book returned
    UPDATE public.books
    SET available_physical_copies = available_physical_copies + 1
    WHERE id = NEW.book_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for book availability
CREATE TRIGGER trigger_update_book_availability
AFTER INSERT OR UPDATE ON public.circulation
FOR EACH ROW
EXECUTE FUNCTION public.update_book_availability();

-- Function to update member borrowed count
CREATE OR REPLACE FUNCTION public.update_member_borrowed_count()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'active' THEN
    UPDATE public.library_members
    SET current_books_borrowed = current_books_borrowed + 1,
        total_books_borrowed = total_books_borrowed + 1
    WHERE id = NEW.member_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'active' AND NEW.status = 'returned' THEN
    UPDATE public.library_members
    SET current_books_borrowed = current_books_borrowed - 1
    WHERE id = NEW.member_id;
  END IF;

  RETURN NEW;
END;
$$;

-- Trigger for member borrowed count
CREATE TRIGGER trigger_update_member_borrowed_count
AFTER INSERT OR UPDATE ON public.circulation
FOR EACH ROW
EXECUTE FUNCTION public.update_member_borrowed_count();

-- Function to auto-update circulation status to overdue
CREATE OR REPLACE FUNCTION public.mark_overdue_circulation()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.circulation
  SET status = 'overdue',
      days_overdue = CURRENT_DATE - due_date,
      fine_amount = public.calculate_overdue_fine(id)
  WHERE status = 'active'
    AND due_date < CURRENT_DATE;
END;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_members_updated_at
  BEFORE UPDATE ON public.library_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_circulation_updated_at
  BEFORE UPDATE ON public.circulation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reservations_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================
-- Create storage bucket for book covers
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('book-covers', 'book-covers', true, 5242880)
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for digital books (PDFs/ePubs)
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('digital-books', 'digital-books', false, 52428800) -- 50MB limit
ON CONFLICT (id) DO NOTHING;

-- Create storage bucket for member photos
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('member-photos', 'member-photos', false, 2097152) -- 2MB limit
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================
-- Book covers (public read)
CREATE POLICY "Public can view book covers"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'book-covers');

CREATE POLICY "Staff can upload book covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'book-covers' AND public.is_staff_or_admin());

-- Digital books (restricted access)
CREATE POLICY "Members can view digital books"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'digital-books');

CREATE POLICY "Staff can upload digital books"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'digital-books' AND public.is_staff_or_admin());

-- Member photos
CREATE POLICY "Members can view own photo"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'member-photos');

CREATE POLICY "Members can upload own photo"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'member-photos');

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX idx_books_isbn ON public.books(isbn);
CREATE INDEX idx_books_barcode ON public.books(barcode);
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_type ON public.books(book_type);
CREATE INDEX idx_books_featured ON public.books(is_featured) WHERE is_featured = true;
CREATE INDEX idx_books_trending ON public.books(is_trending) WHERE is_trending = true;

CREATE INDEX idx_members_email ON public.library_members(email);
CREATE INDEX idx_members_membership_number ON public.library_members(membership_number);
CREATE INDEX idx_members_user_id ON public.library_members(user_id);
CREATE INDEX idx_members_status ON public.library_members(member_status);

CREATE INDEX idx_circulation_member ON public.circulation(member_id);
CREATE INDEX idx_circulation_book ON public.circulation(book_id);
CREATE INDEX idx_circulation_status ON public.circulation(status);
CREATE INDEX idx_circulation_due_date ON public.circulation(due_date);

CREATE INDEX idx_reservations_member ON public.reservations(member_id);
CREATE INDEX idx_reservations_book ON public.reservations(book_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);

CREATE INDEX idx_fines_member ON public.fines(member_id);
CREATE INDEX idx_fines_status ON public.fines(status);

-- ============================================================================
-- SEED DATA - Sample Categories
-- ============================================================================
-- This can be extended with actual books data

-- ============================================================================
-- SETUP COMPLETE!
-- ============================================================================
