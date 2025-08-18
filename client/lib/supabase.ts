import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helpers
export const getCurrentUser = async () => {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
};

export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
    
  if (error) throw error;
  return profile;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, profile: any) => {
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
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Database helpers
export const getEvents = async (filters?: any) => {
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
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const createTicketTypes = async (ticketTypes: any[]) => {
  const { data, error } = await supabase
    .from('ticket_types')
    .insert(ticketTypes)
    .select();
    
  if (error) throw error;
  return data;
};

export const registerForEvent = async (registrationData: any) => {
  const { data, error } = await supabase
    .from('tickets')
    .insert([registrationData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getOrganizerByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('user_id', userId)
    .single();
    
  if (error && error.code !== 'PGRST116') throw error;
  return data;
};

export const createOrganizer = async (organizerData: any) => {
  const { data, error } = await supabase
    .from('organizers')
    .insert([organizerData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const getOrganizerEvents = async (organizerId: string) => {
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
  return supabase
    .channel('events')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'events' },
      callback
    )
    .subscribe();
};

export const subscribeToTickets = (userId: string, callback: (payload: any) => void) => {
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
