// ============================================================================
// LIBRARY MANAGEMENT SYSTEM - TYPESCRIPT TYPE DEFINITIONS
// ============================================================================

export type BookType = 'physical' | 'digital' | 'audio';
export type BookStatus = 'available' | 'issued' | 'reserved' | 'maintenance' | 'lost';
export type MemberType = 'student' | 'staff' | 'public';
export type MemberStatus = 'active' | 'suspended' | 'expired';
export type CirculationStatus = 'issued' | 'returned' | 'overdue';
export type ReservationStatus = 'pending' | 'ready' | 'fulfilled' | 'cancelled' | 'expired';
export type FineStatus = 'pending' | 'paid' | 'waived';
export type NotificationType = 'issue' | 'return' | 'overdue' | 'reservation' | 'fine';

// ============================================================================
// BOOK INTERFACES
// ============================================================================

export interface Book {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Book Information
  isbn?: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  edition?: string;
  language: string;
  pages?: number;
  
  // Classification
  category: string;
  subcategory?: string;
  dewey_decimal?: string;
  
  // Book Type and Format
  book_type: BookType;
  format?: string;
  
  // Physical Book Details
  barcode?: string;
  shelf_location?: string;
  total_copies: number;
  available_copies: number;
  
  // Digital Book Details
  file_url?: string;
  file_size?: number;
  
  // Metadata
  cover_image_url?: string;
  description?: string;
  keywords?: string[];
  
  // Status
  status: BookStatus;
  
  // Tracking
  added_by?: string;
  total_issues: number;
  popularity_score: number;
}

export interface BookFormData {
  isbn?: string;
  title: string;
  subtitle?: string;
  author: string;
  publisher?: string;
  publication_year?: number;
  edition?: string;
  language?: string;
  pages?: number;
  category: string;
  subcategory?: string;
  book_type: BookType;
  format?: string;
  shelf_location?: string;
  total_copies?: number;
  description?: string;
  keywords?: string[];
  cover_image?: File;
  digital_file?: File;
}

// ============================================================================
// LIBRARY MEMBER INTERFACES
// ============================================================================

export interface LibraryMember {
  id: string;
  created_at: string;
  updated_at: string;
  
  // Link to auth user
  user_id?: string;
  
  // Member Information
  member_id: string;
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  
  // Member Type
  member_type: MemberType;
  student_class?: string;
  staff_position?: string;
  
  // Address
  address?: string;
  
  // Membership Details
  membership_start: string;
  membership_end?: string;
  status: MemberStatus;
  
  // Borrowing Limits
  max_books_allowed: number;
  max_digital_books: number;
  
  // Statistics
  total_borrowed: number;
  total_fines_paid: number;
  current_fines: number;
  
  // Profile
  profile_photo_url?: string;
  qr_code?: string;
  notes?: string;
}

export interface MemberFormData {
  full_name: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  member_type: MemberType;
  student_class?: string;
  staff_position?: string;
  address?: string;
  membership_end?: string;
  max_books_allowed?: number;
  max_digital_books?: number;
  notes?: string;
  profile_photo?: File;
}

// ============================================================================
// CIRCULATION INTERFACES
// ============================================================================

export interface Circulation {
  id: string;
  created_at: string;
  updated_at: string;
  
  // References
  book_id: string;
  member_id: string;
  
  // Issue Details
  issue_date: string;
  due_date: string;
  return_date?: string;
  
  // Status
  status: CirculationStatus;
  
  // Staff tracking
  issued_by?: string;
  returned_to?: string;
  
  // Fine calculation
  overdue_days: number;
  fine_amount: number;
  fine_paid: boolean;
  
  // Renewal
  renewal_count: number;
  max_renewals: number;
  
  // Digital access
  access_expires_at?: string;
  
  // Notes
  issue_notes?: string;
  return_notes?: string;
  book_condition?: string;
  
  // Joined data
  book?: Book;
  member?: LibraryMember;
}

export interface IssueBookData {
  book_id: string;
  member_id: string;
  due_date: string;
  issue_notes?: string;
}

export interface ReturnBookData {
  circulation_id: string;
  book_condition: string;
  return_notes?: string;
}

// ============================================================================
// RESERVATION INTERFACES
// ============================================================================

export interface Reservation {
  id: string;
  created_at: string;
  updated_at: string;
  
  // References
  book_id: string;
  member_id: string;
  
  // Reservation Details
  reservation_date: string;
  expiry_date: string;
  
  // Status
  status: ReservationStatus;
  
  // Notification
  notified_at?: string;
  notification_method?: string;
  
  // Fulfillment
  fulfilled_at?: string;
  fulfilled_by?: string;
  
  // Priority queue
  queue_position?: number;
  notes?: string;
  
  // Joined data
  book?: Book;
  member?: LibraryMember;
}

export interface CreateReservationData {
  book_id: string;
  member_id: string;
  notification_method?: string;
}

// ============================================================================
// FINE INTERFACES
// ============================================================================

export interface Fine {
  id: string;
  created_at: string;
  updated_at: string;
  
  // References
  member_id: string;
  circulation_id?: string;
  
  // Fine Details
  fine_type: string;
  amount: number;
  description?: string;
  
  // Status
  status: FineStatus;
  
  // Payment Details
  payment_date?: string;
  payment_method?: string;
  payment_reference?: string;
  received_by?: string;
  
  // Waiver
  waived_by?: string;
  waiver_reason?: string;
  waived_at?: string;
  notes?: string;
  
  // Joined data
  member?: LibraryMember;
  circulation?: Circulation;
}

export interface PayFineData {
  fine_id: string;
  payment_method: string;
  payment_reference?: string;
}

export interface WaiveFineData {
  fine_id: string;
  waiver_reason: string;
}

// ============================================================================
// NOTIFICATION INTERFACES
// ============================================================================

export interface Notification {
  id: string;
  created_at: string;
  
  // Recipient
  member_id?: string;
  staff_id?: string;
  
  // Notification Details
  type: NotificationType;
  title: string;
  message: string;
  
  // References
  book_id?: string;
  circulation_id?: string;
  reservation_id?: string;
  
  // Status
  is_read: boolean;
  read_at?: string;
  
  // Delivery
  sent_via_email: boolean;
  sent_via_sms: boolean;
  email_sent_at?: string;
  sms_sent_at?: string;
  
  // Priority
  priority: string;
  
  // Joined data
  book?: Book;
}

// ============================================================================
// LIBRARY SETTINGS INTERFACES
// ============================================================================

export interface LibrarySettings {
  id: string;
  created_at: string;
  updated_at: string;
  
  // General Settings
  library_name: string;
  library_email?: string;
  library_phone?: string;
  library_address?: string;
  
  // Circulation Rules
  default_loan_period_days: number;
  max_renewals: number;
  overdue_fine_per_day: number;
  
  // Borrowing Limits
  max_books_student: number;
  max_books_staff: number;
  max_books_public: number;
  
  // Digital Books
  digital_loan_period_days: number;
  max_digital_books: number;
  
  // Reservation Settings
  reservation_hold_days: number;
  
  // Fines
  damaged_book_fine: number;
  lost_book_multiplier: number;
  
  // Notifications
  enable_email_notifications: boolean;
  enable_sms_notifications: boolean;
  overdue_reminder_days: number;
  
  // Working Hours
  working_days: string[];
  opening_time: string;
  closing_time: string;
  
  // Statistics
  total_books: number;
  total_members: number;
}

// ============================================================================
// STATISTICS INTERFACES
// ============================================================================

export interface LibraryStatistics {
  total_books: number;
  total_physical_books: number;
  total_digital_books: number;
  total_audio_books: number;
  total_active_members: number;
  books_currently_issued: number;
  books_overdue: number;
  pending_reservations: number;
  total_pending_fines: number;
  unread_notifications: number;
}

export interface PopularBook {
  id: string;
  title: string;
  author: string;
  category: string;
  cover_image_url?: string;
  total_issues: number;
  popularity_score: number;
  unique_borrowers: number;
}

// ============================================================================
// SEARCH AND FILTER INTERFACES
// ============================================================================

export interface BookSearchParams {
  query?: string;
  category?: string;
  book_type?: BookType;
  status?: BookStatus;
  author?: string;
  isbn?: string;
  language?: string;
  available_only?: boolean;
}

export interface MemberSearchParams {
  query?: string;
  member_type?: MemberType;
  status?: MemberStatus;
  student_class?: string;
}

export interface CirculationSearchParams {
  member_id?: string;
  book_id?: string;
  status?: CirculationStatus;
  overdue_only?: boolean;
  from_date?: string;
  to_date?: string;
}

// ============================================================================
// DASHBOARD DATA INTERFACES
// ============================================================================

export interface AdminDashboardData {
  statistics: LibraryStatistics;
  recentCirculations: Circulation[];
  pendingReservations: Reservation[];
  overdueBooks: Circulation[];
  recentMembers: LibraryMember[];
  pendingFines: Fine[];
  popularBooks: PopularBook[];
}

export interface MemberDashboardData {
  member: LibraryMember;
  currentBorrowedBooks: Circulation[];
  borrowingHistory: Circulation[];
  reservations: Reservation[];
  fines: Fine[];
  notifications: Notification[];
  recommendedBooks: Book[];
}

// ============================================================================
// API RESPONSE INTERFACES
// ============================================================================

export interface ApiResponse<T> {
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type SortOrder = 'asc' | 'desc';

export interface SortConfig {
  field: string;
  order: SortOrder;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}
