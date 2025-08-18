import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, Filter, Calendar, MapPin, Users, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEvents } from '@/lib/supabase';

export default function Events() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await getEvents({ search: searchQuery });
        setEvents(data || []);
      } catch (error) {
        console.error('Error loading events:', error);
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [searchQuery]);

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
              <div className="max-w-2xl mx-auto">
                <div className="flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search events..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-lg border text-gray-900"
                    />
                  </div>
                  <Button className="bg-fme-orange hover:bg-fme-orange/90 px-6">
                    <Filter className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
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
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event: any) => {
                  const eventDate = new Date(event.start_date);
                  const day = eventDate.getDate();
                  const month = eventDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                  
                  return (
                    <Card key={event.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            event.event_type === 'hackathon' ? 'bg-fme-blue/10 text-fme-blue' :
                            event.event_type === 'workshop' ? 'bg-fme-orange/10 text-fme-orange' :
                            'bg-green-100 text-green-600'
                          }`}>
                            {event.event_type.toUpperCase()}
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-gray-900">{day}</div>
                            <div className="text-sm text-gray-500">{month}</div>
                          </div>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-gray-600 text-sm">
                            <MapPin className="w-4 h-4 mr-2" />
                            {event.venue}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Calendar className="w-4 h-4 mr-2" />
                            {eventDate.toLocaleDateString()}
                          </div>
                          <div className="flex items-center text-gray-600 text-sm">
                            <Users className="w-4 h-4 mr-2" />
                            {event.current_participants} registered
                          </div>
                        </div>
                        
                        <Button className={`w-full ${
                          event.event_type === 'hackathon' ? 'bg-fme-blue hover:bg-fme-blue/90' :
                          event.event_type === 'workshop' ? 'bg-fme-orange hover:bg-fme-orange/90' :
                          'bg-fme-blue hover:bg-fme-blue/90'
                        }`}>
                          Register Now • {event.ticket_types?.[0]?.price ? `₹${event.ticket_types[0].price}` : 'Free'}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {events.length === 0 && !loading && (
              <div className="text-center mt-12 py-12 bg-white rounded-lg">
                <Star className="w-12 h-12 text-fme-blue mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchQuery ? 'No events found' : 'No events available'}
                </h3>
                <p className="text-gray-600">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Configure Supabase to load real events or create new ones.'}
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}
