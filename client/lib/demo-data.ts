// Demo Data Service - Centralized demo user and data management
import type { Profile, Event, Ticket, Organizer, Notification } from "@shared/types";

// Demo User IDs
export const DEMO_USER_IDS = {
  ADMIN: "00000000-0000-4000-8000-000000000001",
  ORGANIZER: "00000000-0000-4000-8000-000000000002", 
  STUDENT: "00000000-0000-4000-8000-000000000003",
} as const;

// Demo User Credentials
export const DEMO_CREDENTIALS = {
  ADMIN: { email: "shubsss", password: "shubsss@1911" },
  ORGANIZER: { email: "organizer", password: "organizer123" },
  STUDENT: { email: "student", password: "student123" },
} as const;

// Demo User Profiles
export const DEMO_PROFILES: Record<string, Profile> = {
  [DEMO_USER_IDS.ADMIN]: {
    id: DEMO_USER_IDS.ADMIN,
    email: "admin@findmyevent.com",
    full_name: "System Administrator",
    role: "admin",
    phone: "+91-9876543210",
    city: "Mumbai",
    college: "FindMyEvent HQ",
    year_of_study: null,
    interests: ["platform_management", "user_analytics"],
    notification_preferences: {
      email: true,
      whatsapp: true,
      telegram: false,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    verification_status: "verified",
    profile_completion: 100,
  },
  [DEMO_USER_IDS.ORGANIZER]: {
    id: DEMO_USER_IDS.ORGANIZER,
    email: "organizer@findmyevent.com",
    full_name: "Tech Events Organizer",
    role: "organizer",
    phone: "+91-9123456789",
    city: "Bangalore",
    college: "IIT Bangalore",
    year_of_study: null,
    interests: ["event_management", "hackathons", "workshops"],
    notification_preferences: {
      email: true,
      whatsapp: true,
      telegram: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    verification_status: "verified",
    profile_completion: 95,
  },
  [DEMO_USER_IDS.STUDENT]: {
    id: DEMO_USER_IDS.STUDENT,
    email: "student@findmyevent.com",
    full_name: "CS Student",
    role: "student",
    phone: "+91-9987654321",
    city: "Delhi",
    college: "Delhi Technological University",
    year_of_study: "3rd Year",
    interests: ["hackathons", "ai_ml", "web_development", "coding_competitions"],
    notification_preferences: {
      email: true,
      whatsapp: true,
      telegram: false,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_active: new Date().toISOString(),
    verification_status: "verified",
    profile_completion: 85,
  },
};

// Demo Organizer Data
export const DEMO_ORGANIZER: Organizer = {
  id: "demo-organizer-1",
  user_id: DEMO_USER_IDS.ORGANIZER,
  organization_name: "IIT Bangalore Tech Society",
  organization_type: "college",
  official_email: "events@iitb.ac.in",
  website_url: "https://iitb.ac.in/techsociety",
  social_links: {
    instagram: "@iitbtech",
    linkedin: "https://linkedin.com/company/iitb-tech",
  },
  upi_id: "techsociety@iitb",
  upi_name: "IIT Bangalore Tech Society",
  verification_status: "approved",
  verification_documents: ["demo-doc-1.pdf"],
  verified_at: new Date().toISOString(),
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Demo Events
export const DEMO_EVENTS: Event[] = [
  {
    id: "demo-event-1",
    organizer_id: "demo-organizer-1",
    title: "AI/ML Workshop 2024",
    description: "Comprehensive workshop on Artificial Intelligence and Machine Learning fundamentals.",
    event_type: "workshop",
    venue: "IIT Bangalore Campus, Lecture Hall 1",
    city: "Bangalore",
    start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
    max_participants: 200,
    current_participants: 145,
    is_team_event: false,
    event_status: "published",
    requires_tickets: true,
    is_featured: true,
    tags: ["AI", "ML", "Workshop", "Tech"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-event-2", 
    organizer_id: "demo-organizer-1",
    title: "HackFest 2024",
    description: "48-hour hackathon focused on solving real-world problems with technology.",
    event_type: "hackathon",
    venue: "Tech Hub Auditorium",
    city: "Bangalore",
    start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString(),
    max_participants: 500,
    current_participants: 287,
    is_team_event: true,
    max_team_size: 4,
    event_status: "published",
    requires_tickets: true,
    is_featured: true,
    tags: ["Hackathon", "Coding", "Innovation"],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Demo Tickets for Student
export const DEMO_STUDENT_TICKETS: Ticket[] = [
  {
    id: "demo-ticket-1",
    ticket_token: "FME-DEMO-001",
    registration_id: "demo-reg-1",
    event_id: "demo-event-1",
    user_id: DEMO_USER_IDS.STUDENT,
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    event: DEMO_EVENTS[0],
  },
];

// Demo Notifications
export const DEMO_NOTIFICATIONS: Record<string, Notification[]> = {
  [DEMO_USER_IDS.ADMIN]: [
    {
      id: "demo-notif-admin-1",
      user_id: DEMO_USER_IDS.ADMIN,
      type: "admin_welcome",
      title: "Welcome to Admin Dashboard",
      message: "You are now logged in as a demo admin user with full access to the Core Admin Dashboard.",
      data: {},
      is_read: false,
      sent_via: ["platform"],
      created_at: new Date().toISOString(),
    },
  ],
  [DEMO_USER_IDS.ORGANIZER]: [
    {
      id: "demo-notif-org-1",
      user_id: DEMO_USER_IDS.ORGANIZER,
      type: "organizer_welcome",
      title: "Welcome to Organizer Dashboard",
      message: "Start creating amazing events and connect with students across India.",
      data: {},
      is_read: false,
      sent_via: ["platform"],
      created_at: new Date().toISOString(),
    },
  ],
  [DEMO_USER_IDS.STUDENT]: [
    {
      id: "demo-notif-student-1",
      user_id: DEMO_USER_IDS.STUDENT,
      type: "event_reminder",
      title: "Event Reminder: AI/ML Workshop",
      message: "Your registered event 'AI/ML Workshop 2024' is starting in 3 days!",
      data: { event_id: "demo-event-1" },
      is_read: false,
      sent_via: ["platform"],
      created_at: new Date().toISOString(),
    },
  ],
};

// Helper functions
export const isDemoUser = (userId?: string): boolean => {
  if (!userId) return false;
  return Object.values(DEMO_USER_IDS).includes(userId as any);
};

export const getDemoUserByCredentials = (email: string, password: string) => {
  if (email === DEMO_CREDENTIALS.ADMIN.email && password === DEMO_CREDENTIALS.ADMIN.password) {
    return DEMO_USER_IDS.ADMIN;
  }
  if (email === DEMO_CREDENTIALS.ORGANIZER.email && password === DEMO_CREDENTIALS.ORGANIZER.password) {
    return DEMO_USER_IDS.ORGANIZER;
  }
  if (email === DEMO_CREDENTIALS.STUDENT.email && password === DEMO_CREDENTIALS.STUDENT.password) {
    return DEMO_USER_IDS.STUDENT;
  }
  return null;
};

export const getDemoProfile = (userId: string): Profile | null => {
  return DEMO_PROFILES[userId] || null;
};

export const getDemoTickets = (userId: string): Ticket[] => {
  if (userId === DEMO_USER_IDS.STUDENT) {
    return DEMO_STUDENT_TICKETS;
  }
  return [];
};

export const getDemoNotifications = (userId: string): Notification[] => {
  return DEMO_NOTIFICATIONS[userId] || [];
};

export const getDemoEvents = (): Event[] => {
  return DEMO_EVENTS;
};

export const getDemoOrganizer = (): Organizer => {
  return DEMO_ORGANIZER;
};

// Session management
export const saveDemoSession = (userId: string) => {
  const profile = getDemoProfile(userId);
  if (profile) {
    const user = {
      id: userId,
      email: profile.email,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      aud: "authenticated",
      role: "authenticated",
      user_metadata: { 
        provider: "demo",
        verified: true,
        last_sign_in: new Date().toISOString() 
      }
    };
    
    localStorage.setItem('demo_user_session', JSON.stringify({ user, profile }));
    return { user, profile };
  }
  return null;
};

export const loadDemoSession = () => {
  const savedSession = localStorage.getItem('demo_user_session');
  if (savedSession) {
    try {
      return JSON.parse(savedSession);
    } catch (error) {
      console.warn('Failed to parse demo session:', error);
      localStorage.removeItem('demo_user_session');
    }
  }
  return null;
};

export const clearDemoSession = () => {
  localStorage.removeItem('demo_user_session');
};
