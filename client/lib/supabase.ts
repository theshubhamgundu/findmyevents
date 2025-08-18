import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== 'your_supabase_project_url' &&
  supabaseAnonKey !== 'your_supabase_anon_key_here'
);

// Create a mock client for development when Supabase is not configured
const createMockClient = () => ({
  auth: {
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    signInWithPassword: () => Promise.reject(new Error('Supabase not configured')),
    signUp: () => Promise.reject(new Error('Supabase not configured')),
    signOut: () => Promise.reject(new Error('Supabase not configured')),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => ({ error: new Error('Supabase not configured') }),
    insert: () => ({ error: new Error('Supabase not configured') }),
    update: () => ({ error: new Error('Supabase not configured') }),
    delete: () => ({ error: new Error('Supabase not configured') }),
    eq: function() { return this; },
    single: function() { return this; },
    order: function() { return this; },
    or: function() { return this; },
  }),
  channel: () => ({
    on: function() { return this; },
    subscribe: () => {},
  }),
});

// Export the client - either real Supabase or mock client
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : createMockClient() as any;

// Auth helpers with error handling
export const getCurrentUser = async () => {
  if (!isSupabaseConfigured) {
    return null;
  }
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    console.warn('Failed to get current user:', error);
    return null;
  }
};

export const getCurrentProfile = async () => {
  if (!isSupabaseConfigured) {
    return null;
  }
  
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
    console.warn('Failed to get current profile:', error);
    return null;
  }
};

export const signIn = async (email: string, password: string) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please add your Supabase URL and API key to the environment variables.');
  }
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, profile: any) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please add your Supabase URL and API key to the environment variables.');
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
  if (!isSupabaseConfigured) {
    return;
  }
  
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database helpers with error handling
export const getEvents = async (filters?: any) => {
  if (!isSupabaseConfigured) {
    // Return mock data for development
    return [
      {
        id: '1',
        title: 'Mock Hackathon 2024',
        description: 'This is mock data - configure Supabase to see real events',
        event_type: 'hackathon',
        city: 'Delhi',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        end_date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
        venue: 'Mock Venue',
        current_participants: 150,
        max_participants: 500,
        is_team_event: true,
        event_status: 'published',
        organizer: {
          organization_name: 'Mock College',
          verification_status: 'approved'
        },
        ticket_types: [
          {
            id: '1',
            name: 'General',
            price: 500,
            quantity: 500,
            sold: 150
          }
        ]
      }
    ];
  }
  
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:organizers(*),
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
  if (error) throw error;
  return data;
};

export const getEventById = async (id: string) => {
  if (!isSupabaseConfigured) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      organizer:organizers(*),
      ticket_types(*)
    `)
    .eq('id', id)
    .single();
    
  if (error) throw error;
  return data;
};

export const getUserTickets = async (userId: string) => {
  if (!isSupabaseConfigured) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      event:events(*),
      ticket_type:ticket_types(*),
      payment:payments(*)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

export const createEvent = async (eventData: any) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Please add your Supabase URL and API key to create events.');
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
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
  
  const { data, error } = await supabase
    .from('ticket_types')
    .insert(ticketTypes)
    .select();
    
  if (error) throw error;
  return data;
};

export const registerForEvent = async (registrationData: any) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
  }
  
  const { data, error } = await supabase
    .from('tickets')
    .insert([registrationData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getOrganizerByUserId = async (userId: string) => {
  if (!isSupabaseConfigured) {
    return null;
  }
  
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createOrganizer = async (organizerData: any) => {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured.');
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
  if (!isSupabaseConfigured) {
    return [];
  }
  
  const { data, error } = await supabase
    .from('events')
    .select(`
      *,
      ticket_types(*),
      _count:tickets(count)
    `)
    .eq('organizer_id', organizerId)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
};

// Real-time subscriptions
export const subscribeToEvents = (callback: (payload: any) => void) => {
  if (!isSupabaseConfigured) {
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
  if (!isSupabaseConfigured) {
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
