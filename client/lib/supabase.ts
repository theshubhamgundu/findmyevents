import { createClient } from "@supabase/supabase-js";
import { isDemoUser, getDemoTickets, getDemoNotifications, getDemoEvents, getDemoOrganizer, DEMO_USER_IDS } from "./demo-data";

// Support both VITE_ and NEXT_PUBLIC_ prefixes for compatibility
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes(".supabase.co") || url.includes("localhost");
  } catch {
    return false;
  }
};

// Validate API key format (should be a JWT-like string)
const isValidApiKey = (key: string): boolean => {
  return (
    typeof key === "string" &&
    key.length > 100 &&
    key.startsWith("eyJ") &&
    key.split(".").length === 3
  );
};

// Placeholder values to check against
const placeholderValues = [
  "your_supabase_project_url",
  "your_supabase_anon_key_here",
  "your_supabase_anon_key",
  "https://demo.supabase.co",
  "demo_key_placeholder",
  "https://your-project-id.supabase.co",
  "REPLACE_WITH_YOUR_ACTUAL_SUPABASE_URL",
  "REPLACE_WITH_YOUR_ACTUAL_SUPABASE_ANON_KEY",
];

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  supabaseUrl &&
  supabaseAnonKey &&
  !placeholderValues.includes(supabaseUrl) &&
  !placeholderValues.includes(supabaseAnonKey) &&
  isValidUrl(supabaseUrl) &&
  isValidApiKey(supabaseAnonKey)
);

// Simple production-ready logging
if (!isSupabaseConfigured) {
  console.warn("Supabase configuration incomplete");
}

// Create Supabase client with error handling
let supabase: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  } catch (error) {
    console.error("Failed to create Supabase client:", error);
    supabase = null;
  }
}

export { supabase };

// Auth helpers
export const getCurrentUser = async () => {
  if (!supabase) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error("Failed to get current user:", error);
    return null;
  }
};

export const getCurrentProfile = async () => {
  if (!supabase) return null;

  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) throw error;
    return profile;
  } catch (error) {
    console.error("Failed to get current profile:", error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error(
      "Authentication is not available. Please configure Supabase connection.",
    );
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, profile: any) => {
  if (!supabase) {
    throw new Error(
      "Authentication is not available. Please configure Supabase connection.",
    );
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  if (data.user) {
    // Create profile
    const { error: profileError } = await supabase.from("profiles").insert([
      {
        id: data.user.id,
        email: data.user.email,
        ...profile,
      },
    ]);

    if (profileError) throw profileError;
  }

  return data;
};

export const signOut = async () => {
  if (!supabase) return;

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Google Sign-in
export const signInWithGoogle = async () => {
  if (!supabase) {
    throw new Error(
      "Authentication is not available. Please configure Supabase connection.",
    );
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw error;
  return data;
};

// Phone OTP Sign-in
export const signInWithPhone = async (phone: string) => {
  if (!supabase) {
    throw new Error(
      "Authentication is not available. Please configure Supabase connection.",
    );
  }

  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
  });

  if (error) throw error;
  return data;
};

// Verify OTP
export const verifyOtp = async (phone: string, token: string) => {
  if (!supabase) {
    throw new Error(
      "Authentication is not available. Please configure Supabase connection.",
    );
  }

  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: "sms",
  });

  if (error) throw error;
  return data;
};

// Event management
export const getEvents = async (filters?: any) => {
  // If Supabase is not configured, return demo events
  if (!supabase) {
    return getDemoEvents();
  }

  let query = supabase
    .from("events")
    .select(
      `
      *,
      organizer:organizers!inner(*),
      ticket_types(*)
    `,
    )
    .eq("event_status", "published")
    .order("start_date", { ascending: true });

  if (filters?.city) {
    query = query.eq("city", filters.city);
  }

  if (filters?.event_type) {
    query = query.eq("event_type", filters.event_type);
  }

  if (filters?.search) {
    query = query.or(
      `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
    );
  }

  const { data, error } = await query;
  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }
  return data || [];
};

export const getEventById = async (id: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      organizer:organizers!inner(*),
      ticket_types(*)
    `,
    )
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }
  return data;
};

export const getUserTickets = async (userId: string) => {
  // Handle demo users
  if (isDemoUser(userId)) {
    console.log("Demo user - returning mock tickets");
    return getDemoTickets(userId);
  }

  if (!supabase) {
    console.warn("Supabase not configured - returning empty tickets array");
    return [];
  }

  const { data, error } = await supabase
    .from("tickets")
    .select(
      `
      *,
      event:events!inner(*),
      ticket_type:ticket_types!inner(*),
      payment:payments(*)
    `,
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tickets:", error.message || error);
    return [];
  }
  return data || [];
};

export const createEvent = async (eventData: any) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  const { data, error } = await supabase
    .from("events")
    .insert([eventData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const createTicketTypes = async (ticketTypes: any[]) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  const { data, error } = await supabase
    .from("ticket_types")
    .insert(ticketTypes)
    .select();

  if (error) throw error;
  return data;
};

export const registerForEvent = async (registrationData: any) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  // Generate unique ticket ID
  const ticketId = `FME-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  const { data, error } = await supabase
    .from("tickets")
    .insert([
      {
        ...registrationData,
        ticket_id: ticketId,
        status: "active",
      },
    ])
    .select(
      `
      *,
      event:events!inner(*),
      ticket_type:ticket_types!inner(*)
    `,
    )
    .single();

  if (error) throw error;
  return data;
};

export const getOrganizerByUserId = async (userId: string) => {
  // Handle demo organizer user
  if (isDemoUser(userId) && userId === DEMO_USER_IDS.ORGANIZER) {
    return getDemoOrganizer();
  }

  if (!supabase) return null;

  const { data, error } = await supabase
    .from("organizers")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("Error fetching organizer:", error);
    return null;
  }
  return data;
};

export const createOrganizer = async (organizerData: any) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  const { data, error } = await supabase
    .from("organizers")
    .insert([organizerData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getOrganizerEvents = async (organizerId: string) => {
  // Handle demo organizer events
  if (organizerId === "demo-organizer-1") {
    return getDemoEvents();
  }

  if (!supabase) return [];

  const { data, error } = await supabase
    .from("events")
    .select(
      `
      *,
      ticket_types(*),
      tickets(count)
    `,
    )
    .eq("organizer_id", organizerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching organizer events:", error);
    return [];
  }
  return data || [];
};

// Payment processing
export const createPayment = async (paymentData: any) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  const { data, error } = await supabase
    .from("payments")
    .insert([paymentData])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const updatePayment = async (paymentId: string, updates: any) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  const { data, error } = await supabase
    .from("payments")
    .update(updates)
    .eq("id", paymentId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Ticket management
export const updateTicketStatus = async (
  ticketId: string,
  status: string,
  checkedInBy?: string,
) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  const updates: any = { status };
  if (status === "used") {
    updates.checked_in_at = new Date().toISOString();
    if (checkedInBy) {
      updates.checked_in_by = checkedInBy;
    }
  }

  const { data, error } = await supabase
    .from("tickets")
    .update(updates)
    .eq("id", ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// Notifications
export const createNotification = async (notificationData: any) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("notifications")
    .insert([notificationData])
    .select()
    .single();

  if (error) {
    console.error("Error creating notification:", error);
    return null;
  }
  return data;
};

export const getUserNotifications = async (userId: string) => {
  // Handle demo users
  if (isDemoUser(userId)) {
    console.log("Demo user - returning mock notifications");
    return getDemoNotifications(userId);
  }

  if (!supabase) {
    console.warn(
      "Supabase not configured - returning empty notifications array",
    );
    return [];
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error fetching notifications:", error.message || error);
    return [];
  }
  return data || [];
};

export const markNotificationAsRead = async (notificationId: string) => {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)
    .select()
    .single();

  if (error) {
    console.error("Error marking notification as read:", error);
    return null;
  }
  return data;
};

// Analytics
export const updateEventAnalytics = async (
  eventId: string,
  type: "view" | "registration",
) => {
  if (!supabase) return;

  const today = new Date().toISOString().split("T")[0];

  // Try to update existing analytics record
  const { data: existing } = await supabase
    .from("event_analytics")
    .select("*")
    .eq("event_id", eventId)
    .eq("date", today)
    .single();

  if (existing) {
    // Update existing record
    const updates =
      type === "view"
        ? { views: existing.views + 1 }
        : { registrations: existing.registrations + 1 };

    await supabase
      .from("event_analytics")
      .update(updates)
      .eq("id", existing.id);
  } else {
    // Create new record
    const newRecord = {
      event_id: eventId,
      date: today,
      views: type === "view" ? 1 : 0,
      registrations: type === "registration" ? 1 : 0,
      revenue: 0,
    };

    await supabase.from("event_analytics").insert([newRecord]);
  }
};

export const getEventAnalytics = async (eventId: string) => {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("event_analytics")
    .select("*")
    .eq("event_id", eventId)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching analytics:", error);
    return [];
  }
  return data || [];
};

// Real-time subscriptions
export const subscribeToEvents = (callback: (payload: any) => void) => {
  if (!supabase) {
    return { unsubscribe: () => {} };
  }

  return supabase
    .channel("events")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "events" },
      callback,
    )
    .subscribe();
};

export const subscribeToTickets = (
  userId: string,
  callback: (payload: any) => void,
) => {
  if (!supabase) {
    return { unsubscribe: () => {} };
  }

  return supabase
    .channel("tickets")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "tickets",
        filter: `user_id=eq.${userId}`,
      },
      callback,
    )
    .subscribe();
};

// File upload
export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!supabase) {
    throw new Error("Database connection not available.");
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) throw error;
  return data;
};

export const getFileUrl = (bucket: string, path: string) => {
  if (!supabase) return "";

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return data.publicUrl;
};
