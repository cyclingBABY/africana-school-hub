export type UserRole = "admin" | "member";

export interface LibraryUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  membershipDate: string;
  membershipId: string;
  status: "active" | "suspended" | "expired";
}

export type BookFormat = "physical" | "digital";
export type BookStatus = "available" | "borrowed" | "reserved" | "maintenance";
export type DigitalFormat = "pdf" | "epub" | "audiobook";

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  coverUrl: string;
  description: string;
  category: string;
  format: BookFormat;
  status: BookStatus;
  totalCopies: number;
  availableCopies: number;
  publishedYear: number;
  publisher: string;
  pages: number;
  language: string;
  barcode?: string;
  digitalUrl?: string;
  digitalFormat?: DigitalFormat;
  addedDate: string;
  rating: number;
  borrowCount: number;
}

export type LoanStatus = "active" | "returned" | "overdue";

export interface Loan {
  id: string;
  bookId: string;
  book: Book;
  memberId: string;
  memberName: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: LoanStatus;
  renewCount: number;
  fine: number;
}

export type ReservationStatus = "pending" | "ready" | "collected" | "cancelled";

export interface Reservation {
  id: string;
  bookId: string;
  book: Book;
  memberId: string;
  memberName: string;
  reservedDate: string;
  status: ReservationStatus;
}

export interface LibraryStats {
  totalPhysicalBooks: number;
  totalEbooks: number;
  totalMembers: number;
  activeLoans: number;
  overdueBooks: number;
  newMemberRequests: number;
  todayReturns: number;
  todayIssues: number;
}

export interface Notification {
  id: string;
  type: "overdue" | "reservation" | "membership" | "return" | "system";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface FineRecord {
  id: string;
  loanId: string;
  bookTitle: string;
  amount: number;
  reason: string;
  status: "unpaid" | "paid";
  createdDate: string;
  paidDate?: string;
}
