import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Filter, 
  Calendar, 
  MapPin, 
  Users, 
  Star,
  Clock,
  IndianRupee,
  FilterX,
  Loader2
} from 'lucide-react';
import { getEvents, updateEventAnalytics } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { formatCurrency } from '@/lib/payment-utils';
import EventRegistrationModal from '@/components/EventRegistrationModal';
import type { Event, EventFilters } from '@shared/types';

const eventTypes = [
  { value: 'all', label: 'All Events' },
  { value: 'hackathon', label: 'Hackathons' },
  { value: 'workshop', label: 'Workshops' },
  { value: 'seminar', label: 'Seminars' },
  { value: 'fest', label: 'Tech Fests' },
  { value: 'ideathon', label: 'Ideathons' },
  { value: 'other', label: 'Other' },
];

const cities = [
  'All Cities', 'Delhi', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 
  'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur',
  'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad'
];

export default function Events() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventType, setSelectedEventType] = useState('all');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const { user, isConfigured } = useAuth();

  useEffect(() => {
    loadEvents();
  }, [searchQuery, selectedEventType, selectedCity]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      
      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }
      
      if (selectedEventType !== 'all') {
        filters.event_type = selectedEventType;
      }
      
      if (selectedCity !== 'All Cities') {
        filters.city = selectedCity;
      }

      const data = await getEvents(filters);
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = async (event: Event) => {
    // Track event view
    if (isConfigured) {
      try {
        await updateEventAnalytics(event.id, 'view');
      } catch (error) {
        console.error('Error tracking event view:', error);
      }
    }
  };

  const handleRegisterClick = (event: Event) => {
    if (!user) {
      // Redirect to login
      window.location.href = '/login';
      return;
    }
    
    setSelectedEvent(event);
    setShowRegistrationModal(true);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedEventType('all');
    setSelectedCity('All Cities');
  };

  const hasActiveFilters = searchQuery.trim() || selectedEventType !== 'all' || selectedCity !== 'All Cities';

  const getEventTypeColor = (eventType: string) => {
    switch (eventType) {
      case 'hackathon':
        return 'bg-fme-blue/10 text-fme-blue';
      case 'workshop':
        return 'bg-fme-orange/10 text-fme-orange';
      case 'seminar':
        return 'bg-green-100 text-green-600';
      case 'fest':
        return 'bg-purple-100 text-purple-600';
      case 'ideathon':
        return 'bg-pink-100 text-pink-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getButtonColor = (eventType: string) => {
    switch (eventType) {
      case 'hackathon':
        return 'bg-fme-blue hover:bg-fme-blue/90';
      case 'workshop':
        return 'bg-fme-orange hover:bg-fme-orange/90';
      case 'seminar':
        return 'bg-green-600 hover:bg-green-700';
      case 'fest':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'ideathon':
        return 'bg-pink-600 hover:bg-pink-700';
      default:
        return 'bg-fme-blue hover:bg-fme-blue/90';
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gray-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-fme-blue to-fme-blue/80 text-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl lg:text-5xl font-bold mb-6">
                Discover Amazing Events
              </h1>
              <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
                Explore hackathons, workshops, seminars, and tech fests happening near you
              </p>
              
              {/* Search Bar */}
              <div className="max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 pr-4 py-3 text-gray-900 bg-white border-0"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                      onClick={() => setShowFilters(!showFilters)}
                    >
                      <Filter className="w-5 h-5 mr-2" />
                      Filters
                    </Button>
                    
                    {hasActiveFilters && (
                      <Button
                        variant="outline"
                        className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        onClick={clearFilters}
                      >
                        <FilterX className="w-5 h-5 mr-2" />
                        Clear
                      </Button>
                    )}
                  </div>
                </div>

                {/* Filters */}
                {showFilters && (
                  <div className="mt-4 p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">Event Type</label>
                        <Select value={selectedEventType} onValueChange={setSelectedEventType}>
                          <SelectTrigger className="bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {eventTypes.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-white mb-2">City</label>
                        <Select value={selectedCity} onValueChange={setSelectedCity}>
                          <SelectTrigger className="bg-white text-gray-900">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {cities.map(city => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {hasActiveFilters ? 'Filtered Events' : 'All Events'}
                </h2>
                <p className="text-gray-600">
                  {loading ? 'Loading events...' : `${events.length} events found`}
                </p>
              </div>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-6">
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-6 bg-gray-200 rounded mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded mb-4"></div>
                      <div className="h-10 bg-gray-200 rounded"></div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? 'No events match your filters' : 'No events available'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters 
                    ? 'Try adjusting your search terms or filters to find more events.'
                    : isConfigured 
                    ? 'Events will appear here once organizers start creating them.'
                    : 'Configure Supabase to load real events or create new ones.'
                  }
                </p>
                {hasActiveFilters && (
                  <Button onClick={clearFilters} className="bg-fme-blue hover:bg-fme-blue/90">
                    Clear All Filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => {
                  const eventDate = new Date(event.start_date);
                  const day = eventDate.getDate();
                  const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  const isUpcoming = eventDate > new Date();
                  const cheapestTicket = event.ticket_types?.reduce((min, ticket) => 
                    ticket.price < min.price ? ticket : min
                  ) || event.ticket_types?.[0];

                  return (
                    <Card 
                      key={event.id} 
                      className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer"
                      onClick={() => handleEventClick(event)}
                    >
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <Badge className={getEventTypeColor(event.event_type)}>
                            {event.event_type.toUpperCase()}
                          </Badge>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{day}</div>
                            <div className="text-sm text-gray-500">{month}</div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                          {event.title}
                        </h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span className="truncate">{event.venue}, {event.city}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Clock className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{eventDate.toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>
                              {event.current_participants} registered
                              {event.max_participants && ` of ${event.max_participants}`}
                            </span>
                          </div>
                          {event.organizer && (
                            <div className="flex items-center text-gray-600 text-sm">
                              <span className="text-xs px-2 py-1 bg-green-100 text-green-600 rounded">
                                ✓ Verified Organizer
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {cheapestTicket && (
                              <div className="flex items-center text-fme-orange font-semibold">
                                {cheapestTicket.price === 0 ? (
                                  'Free'
                                ) : (
                                  <>
                                    <IndianRupee className="w-4 h-4" />
                                    {cheapestTicket.price}
                                  </>
                                )}
                              </div>
                            )}
                            {event.ticket_types && event.ticket_types.length > 1 && (
                              <span className="text-xs text-gray-500">onwards</span>
                            )}
                          </div>

                          <Button
                            className={`${getButtonColor(event.event_type)} text-white`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRegisterClick(event);
                            }}
                            disabled={!isUpcoming || (event.max_participants && event.current_participants >= event.max_participants)}
                          >
                            {!isUpcoming ? 'Past Event' : 
                             (event.max_participants && event.current_participants >= event.max_participants) ? 'Sold Out' :
                             'Register'}
                          </Button>
                        </div>

                        {event.is_team_event && (
                          <div className="mt-3 pt-3 border-t">
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2" />
                              <span>Team Event (Max {event.max_team_size || 4} members)</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />

      {/* Registration Modal */}
      {selectedEvent && (
        <EventRegistrationModal
          open={showRegistrationModal}
          onClose={() => {
            setShowRegistrationModal(false);
            setSelectedEvent(null);
          }}
          event={selectedEvent}
          onSuccess={() => {
            loadEvents(); // Refresh events to update registration count
          }}
        />
      )}
    </div>
  );
}
