import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate URL format
const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return url.includes('.supabase.co') || url.includes('localhost');
  } catch {
    return false;
  }
};

// Validate API key format (should be a JWT-like string)
const isValidApiKey = (key: string): boolean => {
  return typeof key === 'string' &&
         key.length > 100 &&
         key.startsWith('eyJ') &&
         key.split('.').length === 3;
};

// Placeholder values to check against
const placeholderValues = [
  'your_supabase_project_url',
  'your_supabase_anon_key_here',
  'your_supabase_anon_key',
  'https://demo.supabase.co',
  'demo_key_placeholder',
  'https://your-project-id.supabase.co',
  'REPLACE_WITH_YOUR_ACTUAL_SUPABASE_URL',
  'REPLACE_WITH_YOUR_ACTUAL_SUPABASE_ANON_KEY'
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

// Log configuration status for debugging
console.log('Supabase Configuration Check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseAnonKey,
  urlValid: supabaseUrl ? isValidUrl(supabaseUrl) : false,
  keyValid: supabaseAnonKey ? isValidApiKey(supabaseAnonKey) : false,
  isConfigured: isSupabaseConfigured,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'not set'
});

if (!isSupabaseConfigured) {
  console.warn('Supabase is not properly configured. Please set valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
}

// Create Supabase client with error handling
let supabase: ReturnType<typeof createClient> | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    });
    console.log('Supabase client created successfully');
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    supabase = null;
  }
}

export { supabase };

// Demo/Mock data for when Supabase is not configured
const DEMO_EVENTS = [
  {
    id: 'demo-1',
    title: 'HackFest 2024',
    description: 'A 36-hour hackathon focusing on AI and Machine Learning solutions.',
    event_type: 'hackathon',
    start_date: '2024-03-15T09:00:00Z',
    end_date: '2024-03-17T18:00:00Z',
    city: 'New Delhi',
    venue_name: 'IIT Delhi',
    is_online: false,
    max_attendees: 500,
    organizer: {
      organization_name: 'IIT Delhi Tech Club',
      contact_email: 'contact@iitd.ac.in'
    },
    ticket_types: [
      { id: 'demo-ticket-1', name: 'General', price: 500, currency: 'INR' }
    ]
  }
];

// Auth helpers
export const getCurrentUser = async () => {
  if (!supabase) {
    console.log('Demo mode: No user authentication available');
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.error('Failed to get current user:', error);
    return null;
  }
};

export const getCurrentProfile = async () => {
  if (!supabase) return null;
  
  try {
    const user = await getCurrentUser();
    if (!user) return null;
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (error) throw error;
    return profile;
  } catch (error) {
    console.error('Failed to get current profile:', error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  if (!supabase) {
    throw new Error('Authentication is not available. Please configure Supabase connection.');
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
    throw new Error('Authentication is not available. Please configure Supabase connection.');
  }
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  
  if (data.user) {
    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: data.user.id,
        email: data.user.email,
        ...profile
      }]);
      
    if (profileError) throw profileError;
  }
  
  return data;
};

export const signOut = async () => {
  if (!supabase) return;
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Event management
export const getEvents = async (filters?: any) => {
  if (!supabase) {
    console.log('Demo mode: Returning demo events');
    return DEMO_EVENTS;
  }
  
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:organizers!inner(*),
      ticket_types(*)
    `)
    .eq('event_status', 'published')
    .order('start_date', { ascending: true });

  if (filters?.city) {
    query = query.eq('city', filters.city);
  }
  
  if (filters?.event_type) {
    query = query.eq('event_type', filters.event_type);
  }
  
  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.error('Error fetching events:', error);
    return [];
  }
  return data || [];
};

export const getEventById = async (id: string) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:organizers!inner(*),
      ticket_types(*)
    `)
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching event:', error);
    return null;
  }
  return data;
};

export const getUserTickets = async (userId: string) => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events!inner(*),
      ticket_type:ticket_types!inner(*),
      payment:payments(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }
  return data || [];
};

export const createEvent = async (eventData: any) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const createTicketTypes = async (ticketTypes: any[]) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  const { data, error } = await supabase
    .from('ticket_types')
    .insert(ticketTypes)
    .select();
    
  if (error) throw error;
  return data;
};

export const registerForEvent = async (registrationData: any) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  // Generate unique ticket ID
  const ticketId = `FME-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  
  const { data, error } = await supabase
    .from('tickets')
    .insert([{
      ...registrationData,
      ticket_id: ticketId,
      status: 'active'
    }])
    .select(`
      *,
      event:events!inner(*),
      ticket_type:ticket_types!inner(*)
    `)
    .single();
    
  if (error) throw error;
  return data;
};

export const getOrganizerByUserId = async (userId: string) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error fetching organizer:', error);
    return null;
  }
  return data;
};

export const createOrganizer = async (organizerData: any) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  const { data, error } = await supabase
    .from('organizers')
    .insert([organizerData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getOrganizerEvents = async (organizerId: string) => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types(*),
      tickets(count)
    `)
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching organizer events:', error);
    return [];
  }
  return data || [];
};

// Payment processing
export const createPayment = async (paymentData: any) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  const { data, error } = await supabase
    .from('payments')
    .insert([paymentData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updatePayment = async (paymentId: string, updates: any) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  const { data, error } = await supabase
    .from('payments')
    .update(updates)
    .eq('id', paymentId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Ticket management
export const updateTicketStatus = async (ticketId: string, status: string, checkedInBy?: string) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  const updates: any = { status };
  if (status === 'used') {
    updates.checked_in_at = new Date().toISOString();
    if (checkedInBy) {
      updates.checked_in_by = checkedInBy;
    }
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// Notifications
export const createNotification = async (notificationData: any) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating notification:', error);
    return null;
  }
  return data;
};

export const getUserNotifications = async (userId: string) => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20);
    
  if (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
  return data || [];
};

export const markNotificationAsRead = async (notificationId: string) => {
  if (!supabase) return null;
  
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single();
    
  if (error) {
    console.error('Error marking notification as read:', error);
    return null;
  }
  return data;
};

// Analytics
export const updateEventAnalytics = async (eventId: string, type: 'view' | 'registration') => {
  if (!supabase) return;
  
  const today = new Date().toISOString().split('T')[0];
  
  // Try to update existing analytics record
  const { data: existing } = await supabase
    .from('event_analytics')
    .select('*')
    .eq('event_id', eventId)
    .eq('date', today)
    .single();
    
  if (existing) {
    // Update existing record
    const updates = type === 'view' 
      ? { views: existing.views + 1 }
      : { registrations: existing.registrations + 1 };
      
    await supabase
      .from('event_analytics')
      .update(updates)
      .eq('id', existing.id);
  } else {
    // Create new record
    const newRecord = {
      event_id: eventId,
      date: today,
      views: type === 'view' ? 1 : 0,
      registrations: type === 'registration' ? 1 : 0,
      revenue: 0
    };
    
    await supabase
      .from('event_analytics')
      .insert([newRecord]);
  }
};

export const getEventAnalytics = async (eventId: string) => {
  if (!supabase) return [];
  
  const { data, error } = await supabase
    .from('event_analytics')
    .select('*')
    .eq('event_id', eventId)
    .order('date', { ascending: true });
    
  if (error) {
    console.error('Error fetching analytics:', error);
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
    .channel('events')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'events' },
      callback
    )
    .subscribe();
};

export const subscribeToTickets = (userId: string, callback: (payload: any) => void) => {
  if (!supabase) {
    return { unsubscribe: () => {} };
  }
  
  return supabase
    .channel('tickets')
    .on('postgres_changes',
      { 
        event: '*', 
        schema: 'public', 
        table: 'tickets',
        filter: `user_id=eq.${userId}`
      },
      callback
    )
    .subscribe();
};

// File upload
export const uploadFile = async (bucket: string, path: string, file: File) => {
  if (!supabase) {
    throw new Error('Database connection not available.');
  }
  
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);
    
  if (error) throw error;
  return data;
};

export const getFileUrl = (bucket: string, path: string) => {
  if (!supabase) return '';
  
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);
    
  return data.publicUrl;
};
