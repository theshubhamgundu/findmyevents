// Core Types for FindMyEvent Platform

export type UserRole = "student" | "organizer" | "admin";
export type VerificationStatus = "pending" | "approved" | "rejected";
export type EventStatus =
  | "draft"
  | "pending"
  | "approved"
  | "published"
  | "cancelled";
export type EventType =
  | "hackathon"
  | "workshop"
  | "seminar"
  | "fest"
  | "ideathon"
  | "other";
export type TicketStatus = "active" | "used" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";

// User Profile
export interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  college?: string;
  course?: string;
  graduation_year?: number;
  city?: string;
  state?: string;
  country?: string;
  bio?: string;
  interests?: string[];
  preferred_event_types?: string[];
  preferred_duration?: string[];
  preferred_location?: string[];
  community_channels?: any;
  is_verified?: boolean;
  notification_preferences?: {
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
  };
  created_at: string;
  updated_at: string;
}

// Organizer
export interface Organizer {
  id: string;
  user_id: string;
  organization_name: string;
  organization_type: "college" | "club" | "startup" | "company";
  official_email?: string;
  website_url?: string;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  verification_status: VerificationStatus;
  verification_documents: string[];
  verified_at?: string;
  verified_by?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

// Event
export interface Event {
  id: string;
  organizer_id: string;
  title: string;
  description: string;
  event_type: EventType;
  banner_url?: string;
  venue: string;
  address?: string;
  city: string;
  state?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  max_participants?: number;
  current_participants: number;
  is_team_event: boolean;
  max_team_size?: number;
  event_status: EventStatus;
  is_featured: boolean;
  tags: string[];
  requirements?: string;
  prizes?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  created_at: string;
  updated_at: string;
  // Populated fields
  organizer?: Organizer;
  ticket_types?: TicketType[];
}

// Ticket Type
export interface TicketType {
  id: string;
  event_id: string;
  name: string;
  description?: string;
  price: number;
  quantity?: number;
  sold: number;
  is_active: boolean;
  sale_start?: string;
  sale_end?: string;
  created_at: string;
}

// Ticket/Registration
export interface Ticket {
  id: string;
  ticket_id: string; // Human readable ID
  event_id: string;
  ticket_type_id: string;
  user_id: string;
  status: TicketStatus;
  team_name?: string;
  team_members?: {
    name: string;
    email: string;
    college?: string;
    year?: number;
  }[];
  qr_code?: string;
  payment_id?: string;
  checked_in_at?: string;
  checked_in_by?: string;
  created_at: string;
  updated_at: string;
  // Populated fields
  event?: Event;
  ticket_type?: TicketType;
  user?: Profile;
  payment?: Payment;
}

// Payment
export interface Payment {
  id: string;
  ticket_id: string;
  razorpay_payment_id?: string;
  razorpay_order_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  organizer_upi_id?: string;
  payment_method?: string;
  paid_at?: string;
  created_at: string;
}

// Notification
export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  sent_via: string[];
  created_at: string;
}

// Event Analytics
export interface EventAnalytics {
  id: string;
  event_id: string;
  views: number;
  registrations: number;
  revenue: number;
  date: string;
  created_at: string;
}

// API Request/Response types
export interface CreateEventRequest {
  title: string;
  description: string;
  event_type: EventType;
  venue: string;
  address?: string;
  city: string;
  state?: string;
  start_date: string;
  end_date: string;
  registration_deadline?: string;
  max_participants?: number;
  is_team_event: boolean;
  max_team_size?: number;
  tags: string[];
  requirements?: string;
  prizes?: string;
  contact_info?: {
    email?: string;
    phone?: string;
    website?: string;
  };
  ticket_types: Omit<TicketType, "id" | "event_id" | "sold" | "created_at">[];
  organizer_upi_id?: string;
}

export interface RegisterEventRequest {
  event_id: string;
  ticket_type_id: string;
  team_name?: string;
  team_members?: {
    name: string;
    email: string;
    college?: string;
    year?: number;
  }[];
}

export interface UpdateProfileRequest {
  full_name?: string;
  college?: string;
  year?: number;
  phone?: string;
  city?: string;
  interests?: string[];
  notification_preferences?: {
    email: boolean;
    whatsapp: boolean;
    telegram: boolean;
  };
}

export interface CreateOrganizerRequest {
  organization_name: string;
  organization_type: "college" | "club" | "startup" | "company";
  official_email?: string;
  website_url?: string;
  social_links?: {
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
  verification_documents: string[];
}

// Search and Filter types
export interface EventFilters {
  city?: string;
  event_type?: EventType;
  price_range?: {
    min: number;
    max: number;
  };
  date_range?: {
    start: string;
    end: string;
  };
  is_team_event?: boolean;
  tags?: string[];
}

export interface EventSearchParams {
  query?: string;
  filters?: EventFilters;
  sort_by?: "date" | "price" | "popularity";
  sort_order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Response types
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Dashboard data types
export interface StudentDashboard {
  upcoming_events: (Event & { ticket?: Ticket })[];
  past_events: (Event & { ticket?: Ticket })[];
  tickets: Ticket[];
  notifications: Notification[];
  stats: {
    upcoming_events: number;
    total_events_attended: number;
    notifications_unread: number;
  };
}

export interface OrganizerDashboard {
  events: Event[];
  registrations: Ticket[];
  analytics: EventAnalytics[];
  stats: {
    total_events: number;
    total_registrations: number;
    total_revenue: number;
    pending_verification: boolean;
  };
}

// QR Code data
export interface QRCodeData {
  ticket_id: string;
  event_id: string;
  user_id: string;
  type: "individual" | "team";
  issued_at: string;
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined;
}

export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  full_name: string;
  college?: string;
  year?: number;
  role: UserRole;
}

// Component prop types
export interface EventCardProps {
  event: Event;
  showRegisterButton?: boolean;
  showManageButton?: boolean;
}

export interface TicketCardProps {
  ticket: Ticket;
  showQRCode?: boolean;
  showCheckIn?: boolean;
}
