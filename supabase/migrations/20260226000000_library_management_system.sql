-- ============================================================================
-- LIBRARY MANAGEMENT SYSTEM - COMPLETE DATABASE SCHEMA
-- Modern Library Management System for Africana Muslim Secondary School
-- ============================================================================

-- Create enums for library system
CREATE TYPE public.book_type AS ENUM ('physical', 'digital', 'audio');
CREATE TYPE public.book_status AS ENUM ('available', 'issued', 'reserved', 'maintenance', 'lost');
CREATE TYPE public.member_type AS ENUM ('student', 'staff', 'public');
CREATE TYPE public.member_status AS ENUM ('active', 'suspended', 'expired');
CREATE TYPE public.circulation_status AS ENUM ('issued', 'returned', 'overdue');
CREATE TYPE public.reservation_status AS ENUM ('pending', 'ready', 'fulfilled', 'cancelled', 'expired');
CREATE TYPE public.fine_status AS ENUM ('pending', 'paid', 'waived');
CREATE TYPE public.notification_type AS ENUM ('issue', 'return', 'overdue', 'reservation', 'fine');

-- ============================================================================
-- BOOKS TABLE - Central catalog for all library resources
-- ============================================================================
CREATE TABLE public.books (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Book Information
  isbn TEXT UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT,
  author TEXT NOT NULL,
  publisher TEXT,
  publication_year INTEGER,
  edition TEXT,
  language TEXT DEFAULT 'English',
  pages INTEGER,
  
  -- Classification
  category TEXT NOT NULL, -- e.g., 'Physics', 'Literature', 'Mathematics'
  subcategory TEXT,
  dewey_decimal TEXT, -- Dewey Decimal Classification
  
  -- Book Type and Format
  book_type public.book_type NOT NULL,
  format TEXT, -- For digital: 'PDF', 'ePub', 'MOBI'; For audio: 'MP3', 'M4B'
  
  -- Physical Book Details
  barcode TEXT UNIQUE, -- Auto-generated for physical books
  shelf_location TEXT, -- e.g., 'A-12-3' (Section-Shelf-Position)
  total_copies INTEGER DEFAULT 1,
  available_copies INTEGER DEFAULT 1,
  
  -- Digital Book Details
  file_url TEXT, -- Storage path for digital/audio books
  file_size BIGINT, -- File size in bytes
  
  -- Metadata
  cover_image_url TEXT,
  description TEXT,
  keywords TEXT[], -- Array of searchable keywords
  
  -- Status
  status public.book_status DEFAULT 'available',
  
  -- Tracking
  added_by UUID REFERENCES public.staff_members(id),
  total_issues INTEGER DEFAULT 0,
  popularity_score INTEGER DEFAULT 0, -- For trending books
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(author, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(isbn, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'D')
  ) STORED,
  
  CONSTRAINT valid_copies CHECK (available_copies <= total_copies),
  CONSTRAINT valid_physical_book CHECK (
    (book_type = 'physical' AND barcode IS NOT NULL) OR
    (book_type IN ('digital', 'audio') AND file_url IS NOT NULL)
  )
);

-- Create index for full-text search
CREATE INDEX idx_books_search_vector ON public.books USING gin(search_vector);
CREATE INDEX idx_books_category ON public.books(category);
CREATE INDEX idx_books_isbn ON public.books(isbn);
CREATE INDEX idx_books_barcode ON public.books(barcode);
CREATE INDEX idx_books_status ON public.books(status);

-- ============================================================================
-- LIBRARY MEMBERS TABLE - Users who can borrow books
-- ============================================================================
CREATE TABLE public.library_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Link to auth user (optional for students who already have accounts)
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  
  -- Member Information
  member_id TEXT UNIQUE NOT NULL, -- Auto-generated: LIB-2026-0001
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT,
  
  -- Member Type
  member_type public.member_type NOT NULL,
  student_class TEXT, -- For students: 'S1', 'S2', etc.
  staff_position TEXT, -- For staff members
  
  -- Address
  address TEXT,
  
  -- Membership Details
  membership_start DATE NOT NULL DEFAULT CURRENT_DATE,
  membership_end DATE,
  status public.member_status DEFAULT 'active',
  
  -- Borrowing Limits
  max_books_allowed INTEGER DEFAULT 3,
  max_digital_books INTEGER DEFAULT 5,
  
  -- Statistics
  total_borrowed INTEGER DEFAULT 0,
  total_fines_paid DECIMAL(10, 2) DEFAULT 0,
  current_fines DECIMAL(10, 2) DEFAULT 0,
  
  -- Profile
  profile_photo_url TEXT,
  
  -- QR Code for quick check-in
  qr_code TEXT UNIQUE,
  
  -- Notes
  notes TEXT
);

CREATE INDEX idx_members_member_id ON public.library_members(member_id);
CREATE INDEX idx_members_user_id ON public.library_members(user_id);
CREATE INDEX idx_members_status ON public.library_members(status);
CREATE INDEX idx_members_type ON public.library_members(member_type);

-- ============================================================================
-- CIRCULATION TABLE - Track book issues and returns
-- ============================================================================
CREATE TABLE public.circulation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- References
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE RESTRICT,
  member_id UUID NOT NULL REFERENCES public.library_members(id) ON DELETE RESTRICT,
  
  -- Issue Details
  issue_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE NOT NULL,
  return_date TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status public.circulation_status DEFAULT 'issued',
  
  -- Staff tracking
  issued_by UUID REFERENCES public.staff_members(id),
  returned_to UUID REFERENCES public.staff_members(id),
  
  -- Fine calculation
  overdue_days INTEGER DEFAULT 0,
  fine_amount DECIMAL(10, 2) DEFAULT 0,
  fine_paid BOOLEAN DEFAULT false,
  
  -- Renewal
  renewal_count INTEGER DEFAULT 0,
  max_renewals INTEGER DEFAULT 2,
  
  -- Digital access (for digital books)
  access_expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  issue_notes TEXT,
  return_notes TEXT,
  
  -- Book condition on return
  book_condition TEXT, -- 'good', 'damaged', 'lost'
  
  CONSTRAINT valid_dates CHECK (due_date > issue_date),
  CONSTRAINT valid_return_date CHECK (return_date IS NULL OR return_date >= issue_date)
);

CREATE INDEX idx_circulation_book ON public.circulation(book_id);
CREATE INDEX idx_circulation_member ON public.circulation(member_id);
CREATE INDEX idx_circulation_status ON public.circulation(status);
CREATE INDEX idx_circulation_due_date ON public.circulation(due_date);
CREATE INDEX idx_circulation_issue_date ON public.circulation(issue_date);

-- ============================================================================
-- RESERVATIONS TABLE - Book reservation system
-- ============================================================================
CREATE TABLE public.reservations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- References
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.library_members(id) ON DELETE CASCADE,
  
  -- Reservation Details
  reservation_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL, -- How long to hold the book
  
  -- Status
  status public.reservation_status DEFAULT 'pending',
  
  -- Notification
  notified_at TIMESTAMP WITH TIME ZONE,
  notification_method TEXT, -- 'email', 'sms', 'both'
  
  -- Fulfillment
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  fulfilled_by UUID REFERENCES public.staff_members(id),
  
  -- Priority queue position
  queue_position INTEGER,
  
  -- Notes
  notes TEXT
);

CREATE INDEX idx_reservations_book ON public.reservations(book_id);
CREATE INDEX idx_reservations_member ON public.reservations(member_id);
CREATE INDEX idx_reservations_status ON public.reservations(status);
CREATE INDEX idx_reservations_date ON public.reservations(reservation_date);

-- ============================================================================
-- FINES TABLE - Track library fines
-- ============================================================================
CREATE TABLE public.fines (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- References
  member_id UUID NOT NULL REFERENCES public.library_members(id) ON DELETE RESTRICT,
  circulation_id UUID REFERENCES public.circulation(id) ON DELETE SET NULL,
  
  -- Fine Details
  fine_type TEXT NOT NULL, -- 'overdue', 'damage', 'lost_book'
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  
  -- Status
  status public.fine_status DEFAULT 'pending',
  
  -- Payment Details
  payment_date TIMESTAMP WITH TIME ZONE,
  payment_method TEXT, -- 'cash', 'mtn_mobile_money', 'airtel_money', 'bank'
  payment_reference TEXT,
  received_by UUID REFERENCES public.staff_members(id),
  
  -- Waiver
  waived_by UUID REFERENCES public.staff_members(id),
  waiver_reason TEXT,
  waived_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  notes TEXT
);

CREATE INDEX idx_fines_member ON public.fines(member_id);
CREATE INDEX idx_fines_status ON public.fines(status);
CREATE INDEX idx_fines_circulation ON public.fines(circulation_id);

-- ============================================================================
-- NOTIFICATIONS TABLE - System notifications
-- ============================================================================
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Recipient
  member_id UUID REFERENCES public.library_members(id) ON DELETE CASCADE,
  staff_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
  
  -- Notification Details
  type public.notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- References
  book_id UUID REFERENCES public.books(id) ON DELETE SET NULL,
  circulation_id UUID REFERENCES public.circulation(id) ON DELETE SET NULL,
  reservation_id UUID REFERENCES public.reservations(id) ON DELETE SET NULL,
  
  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Delivery
  sent_via_email BOOLEAN DEFAULT false,
  sent_via_sms BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP WITH TIME ZONE,
  sms_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Priority
  priority TEXT DEFAULT 'normal' -- 'low', 'normal', 'high', 'urgent'
);

CREATE INDEX idx_notifications_member ON public.notifications(member_id);
CREATE INDEX idx_notifications_staff ON public.notifications(staff_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_notifications_type ON public.notifications(type);

-- ============================================================================
-- LIBRARY SETTINGS TABLE - System configuration
-- ============================================================================
CREATE TABLE public.library_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- General Settings
  library_name TEXT DEFAULT 'Africana Muslim Secondary School Library',
  library_email TEXT,
  library_phone TEXT,
  library_address TEXT,
  
  -- Circulation Rules
  default_loan_period_days INTEGER DEFAULT 14,
  max_renewals INTEGER DEFAULT 2,
  overdue_fine_per_day DECIMAL(10, 2) DEFAULT 500, -- UGX 500 per day
  
  -- Borrowing Limits
  max_books_student INTEGER DEFAULT 3,
  max_books_staff INTEGER DEFAULT 5,
  max_books_public INTEGER DEFAULT 2,
  
  -- Digital Books
  digital_loan_period_days INTEGER DEFAULT 7,
  max_digital_books INTEGER DEFAULT 5,
  
  -- Reservation Settings
  reservation_hold_days INTEGER DEFAULT 3,
  
  -- Fines
  damaged_book_fine DECIMAL(10, 2) DEFAULT 10000,
  lost_book_multiplier DECIMAL(3, 2) DEFAULT 1.5, -- 150% of book value
  
  -- Notifications
  enable_email_notifications BOOLEAN DEFAULT true,
  enable_sms_notifications BOOLEAN DEFAULT false,
  overdue_reminder_days INTEGER DEFAULT 3, -- Send reminder 3 days before due
  
  -- Working Hours
  working_days TEXT[] DEFAULT ARRAY['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  opening_time TIME DEFAULT '08:00:00',
  closing_time TIME DEFAULT '17:00:00',
  
  -- Statistics
  total_books INTEGER DEFAULT 0,
  total_members INTEGER DEFAULT 0,
  
  -- Only one settings row allowed
  CONSTRAINT single_row CHECK (id = gen_random_uuid())
);

-- Insert default settings
INSERT INTO public.library_settings (library_name) VALUES ('Africana Muslim Secondary School Library');

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.circulation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.library_settings ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR LIBRARY SYSTEM
-- ============================================================================

-- Check if user is a library member
CREATE OR REPLACE FUNCTION public.is_library_member()
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.library_members
    WHERE user_id = auth.uid()
      AND status = 'active'
  )
$$;

-- Get current library member id
CREATE OR REPLACE FUNCTION public.get_library_member_id()
RETURNS UUID
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.library_members
  WHERE user_id = auth.uid()
  LIMIT 1
$$;

-- ============================================================================
-- RLS POLICIES - BOOKS
-- ============================================================================

-- Public can view available books (for catalog browsing)
CREATE POLICY "Public can view available books"
  ON public.books FOR SELECT
  USING (status = 'available' OR status = 'reserved');

-- Members can view all books
CREATE POLICY "Members can view all books"
  ON public.books FOR SELECT
  TO authenticated
  USING (is_library_member() OR is_staff_or_admin());

-- Only staff/admin can manage books
CREATE POLICY "Staff can manage books"
  ON public.books FOR ALL
  TO authenticated
  USING (is_staff_or_admin())
  WITH CHECK (is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - LIBRARY MEMBERS
-- ============================================================================

-- Staff can view all members
CREATE POLICY "Staff can view all members"
  ON public.library_members FOR SELECT
  TO authenticated
  USING (is_staff_or_admin());

-- Members can view their own profile
CREATE POLICY "Members can view own profile"
  ON public.library_members FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Members can update their own profile (limited fields)
CREATE POLICY "Members can update own profile"
  ON public.library_members FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Staff can manage members
CREATE POLICY "Staff can manage members"
  ON public.library_members FOR ALL
  TO authenticated
  USING (is_staff_or_admin())
  WITH CHECK (is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - CIRCULATION
-- ============================================================================

-- Members can view their own circulation records
CREATE POLICY "Members can view own circulation"
  ON public.circulation FOR SELECT
  TO authenticated
  USING (member_id = get_library_member_id() OR is_staff_or_admin());

-- Staff can manage circulation
CREATE POLICY "Staff can manage circulation"
  ON public.circulation FOR ALL
  TO authenticated
  USING (is_staff_or_admin())
  WITH CHECK (is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - RESERVATIONS
-- ============================================================================

-- Members can create reservations
CREATE POLICY "Members can create reservations"
  ON public.reservations FOR INSERT
  TO authenticated
  WITH CHECK (is_library_member() AND member_id = get_library_member_id());

-- Members can view their own reservations
CREATE POLICY "Members can view own reservations"
  ON public.reservations FOR SELECT
  TO authenticated
  USING (member_id = get_library_member_id() OR is_staff_or_admin());

-- Members can cancel their own pending reservations
CREATE POLICY "Members can cancel own reservations"
  ON public.reservations FOR UPDATE
  TO authenticated
  USING (member_id = get_library_member_id() AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- Staff can manage all reservations
CREATE POLICY "Staff can manage reservations"
  ON public.reservations FOR ALL
  TO authenticated
  USING (is_staff_or_admin())
  WITH CHECK (is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - FINES
-- ============================================================================

-- Members can view their own fines
CREATE POLICY "Members can view own fines"
  ON public.fines FOR SELECT
  TO authenticated
  USING (member_id = get_library_member_id() OR is_staff_or_admin());

-- Staff can manage fines
CREATE POLICY "Staff can manage fines"
  ON public.fines FOR ALL
  TO authenticated
  USING (is_staff_or_admin())
  WITH CHECK (is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - NOTIFICATIONS
-- ============================================================================

-- Members can view their own notifications
CREATE POLICY "Members can view own notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (member_id = get_library_member_id() OR staff_id = get_staff_id());

-- Members can mark their notifications as read
CREATE POLICY "Members can update own notifications"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (member_id = get_library_member_id() OR staff_id = get_staff_id())
  WITH CHECK (member_id = get_library_member_id() OR staff_id = get_staff_id());

-- Staff can create notifications
CREATE POLICY "Staff can create notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (is_staff_or_admin());

-- ============================================================================
-- RLS POLICIES - LIBRARY SETTINGS
-- ============================================================================

-- Everyone can view library settings
CREATE POLICY "Everyone can view library settings"
  ON public.library_settings FOR SELECT
  USING (true);

-- Only admins can update library settings
CREATE POLICY "Admins can update library settings"
  ON public.library_settings FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp
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

CREATE TRIGGER update_fines_updated_at
  BEFORE UPDATE ON public.fines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_library_settings_updated_at
  BEFORE UPDATE ON public.library_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- AUTO-GENERATE MEMBER ID
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_member_id()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  year_part TEXT;
BEGIN
  -- Get current year
  year_part := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
  
  -- Get next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(member_id FROM '\d+$') AS INTEGER)), 0) + 1
  INTO next_number
  FROM public.library_members
  WHERE member_id LIKE 'LIB-' || year_part || '-%';
  
  -- Generate member ID: LIB-2026-0001
  NEW.member_id := 'LIB-' || year_part || '-' || LPAD(next_number::TEXT, 4, '0');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_member_id_trigger
  BEFORE INSERT ON public.library_members
  FOR EACH ROW
  WHEN (NEW.member_id IS NULL)
  EXECUTE FUNCTION public.generate_member_id();

-- ============================================================================
-- AUTO-GENERATE BARCODE FOR PHYSICAL BOOKS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.generate_book_barcode()
RETURNS TRIGGER AS $$
DECLARE
  next_number INTEGER;
  category_code TEXT;
BEGIN
  -- Only generate barcode for physical books
  IF NEW.book_type = 'physical' AND NEW.barcode IS NULL THEN
    -- Get category code (first 3 letters, uppercase)
    category_code := UPPER(SUBSTRING(NEW.category FROM 1 FOR 3));
    
    -- Get next sequence number for this category
    SELECT COALESCE(MAX(CAST(SUBSTRING(barcode FROM '\d+$') AS INTEGER)), 0) + 1
    INTO next_number
    FROM public.books
    WHERE barcode LIKE category_code || '-%'
      AND book_type = 'physical';
    
    -- Generate barcode: PHY-00001, LIT-00001, etc.
    NEW.barcode := category_code || '-' || LPAD(next_number::TEXT, 5, '0');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_book_barcode_trigger
  BEFORE INSERT ON public.books
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_book_barcode();

-- ============================================================================
-- UPDATE BOOK AVAILABILITY ON CIRCULATION CHANGES
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Decrease available copies when book is issued
    UPDATE public.books
    SET available_copies = available_copies - 1,
        total_issues = total_issues + 1,
        popularity_score = popularity_score + 1,
        status = CASE 
          WHEN available_copies - 1 <= 0 THEN 'issued'::book_status
          ELSE status
        END
    WHERE id = NEW.book_id;
    
  ELSIF TG_OP = 'UPDATE' THEN
    -- Increase available copies when book is returned
    IF OLD.status != 'returned' AND NEW.status = 'returned' THEN
      UPDATE public.books
      SET available_copies = available_copies + 1,
          status = 'available'::book_status
      WHERE id = NEW.book_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_book_availability_trigger
  AFTER INSERT OR UPDATE ON public.circulation
  FOR EACH ROW
  EXECUTE FUNCTION public.update_book_availability();

-- ============================================================================
-- AUTO-CALCULATE FINES FOR OVERDUE BOOKS
-- ============================================================================
CREATE OR REPLACE FUNCTION public.calculate_overdue_fines()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  circulation_record RECORD;
  fine_per_day DECIMAL(10, 2);
  days_overdue INTEGER;
  fine_amount DECIMAL(10, 2);
BEGIN
  -- Get fine per day from settings
  SELECT overdue_fine_per_day INTO fine_per_day
  FROM public.library_settings
  LIMIT 1;
  
  -- Loop through overdue circulations
  FOR circulation_record IN
    SELECT *
    FROM public.circulation
    WHERE status = 'issued'
      AND due_date < CURRENT_DATE
      AND return_date IS NULL
  LOOP
    -- Calculate days overdue
    days_overdue := CURRENT_DATE - circulation_record.due_date::date;
    fine_amount := days_overdue * fine_per_day;
    
    -- Update circulation record
    UPDATE public.circulation
    SET status = 'overdue',
        overdue_days = days_overdue,
        fine_amount = fine_amount
    WHERE id = circulation_record.id;
    
    -- Create or update fine record
    INSERT INTO public.fines (member_id, circulation_id, fine_type, amount, description)
    VALUES (
      circulation_record.member_id,
      circulation_record.id,
      'overdue',
      fine_amount,
      'Overdue fine for ' || days_overdue || ' days'
    )
    ON CONFLICT (circulation_id)
    DO UPDATE SET
      amount = fine_amount,
      description = 'Overdue fine for ' || days_overdue || ' days',
      updated_at = now();
    
    -- Update member's current fines
    UPDATE public.library_members
    SET current_fines = (
      SELECT COALESCE(SUM(amount), 0)
      FROM public.fines
      WHERE member_id = circulation_record.member_id
        AND status = 'pending'
    )
    WHERE id = circulation_record.member_id;
  END LOOP;
END;
$$;

-- ============================================================================
-- CREATE STORAGE BUCKETS FOR DIGITAL LIBRARY
-- ============================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('library-books', 'library-books', false, 524288000, ARRAY['application/pdf', 'application/epub+zip', 'application/x-mobipocket-ebook']), -- 500MB for eBooks
  ('library-audio', 'library-audio', false, 1073741824, ARRAY['audio/mpeg', 'audio/mp4', 'audio/x-m4b']), -- 1GB for audio books
  ('library-covers', 'library-covers', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']) -- 5MB for book covers
ON CONFLICT (id) DO NOTHING;

-- Storage policies for library books (digital content)
CREATE POLICY "Staff can upload library books"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id IN ('library-books', 'library-audio') AND public.is_staff_or_admin());

CREATE POLICY "Members can view library content"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id IN ('library-books', 'library-audio', 'library-covers') AND public.is_library_member());

CREATE POLICY "Staff can manage library content"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id IN ('library-books', 'library-audio', 'library-covers') AND public.is_staff_or_admin());

-- Public access to book covers
CREATE POLICY "Public can view book covers"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'library-covers');

-- ============================================================================
-- STATISTICS VIEWS FOR DASHBOARD
-- ============================================================================

CREATE OR REPLACE VIEW public.library_statistics AS
SELECT
  (SELECT COUNT(*) FROM public.books) AS total_books,
  (SELECT COUNT(*) FROM public.books WHERE book_type = 'physical') AS total_physical_books,
  (SELECT COUNT(*) FROM public.books WHERE book_type = 'digital') AS total_digital_books,
  (SELECT COUNT(*) FROM public.books WHERE book_type = 'audio') AS total_audio_books,
  (SELECT COUNT(*) FROM public.library_members WHERE status = 'active') AS total_active_members,
  (SELECT COUNT(*) FROM public.circulation WHERE status = 'issued') AS books_currently_issued,
  (SELECT COUNT(*) FROM public.circulation WHERE status = 'overdue') AS books_overdue,
  (SELECT COUNT(*) FROM public.reservations WHERE status = 'pending') AS pending_reservations,
  (SELECT COALESCE(SUM(amount), 0) FROM public.fines WHERE status = 'pending') AS total_pending_fines,
  (SELECT COUNT(*) FROM public.notifications WHERE is_read = false) AS unread_notifications;

-- ============================================================================
-- POPULAR BOOKS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW public.popular_books AS
SELECT
  b.id,
  b.title,
  b.author,
  b.category,
  b.cover_image_url,
  b.total_issues,
  b.popularity_score,
  COUNT(DISTINCT c.member_id) AS unique_borrowers
FROM public.books b
LEFT JOIN public.circulation c ON b.id = c.book_id
WHERE b.status = 'available'
GROUP BY b.id
ORDER BY b.popularity_score DESC, b.total_issues DESC
LIMIT 20;

-- ============================================================================
-- LIBRARY MANAGEMENT SYSTEM SETUP COMPLETE!
-- ============================================================================
