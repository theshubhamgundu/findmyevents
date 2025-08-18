import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft,
  Users,
  TrendingUp,
  QrCode,
  Download,
  Calendar,
  MapPin,
  IndianRupee,
  Eye,
  CheckCircle,
  Clock,
  Mail,
  Phone,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { 
  getEventById, 
  getOrganizerByUserId,
  getUserTickets, 
  getEventAnalytics 
} from '@/lib/supabase';
import { formatCurrency } from '@/lib/payment-utils';
import QRScanner from '@/components/QRScanner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Event, Ticket, EventAnalytics, Organizer } from '@shared/types';

export default function ManageEvent() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<EventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');
  const { user, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!eventId || !user || !isConfigured) {
      setLoading(false);
      return;
    }

    loadEventData();
  }, [eventId, user, isConfigured]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError('');

      // Load event details
      const eventData = await getEventById(eventId!);
      if (!eventData) {
        setError('Event not found');
        return;
      }

      // Check if user is the organizer
      const organizerData = await getOrganizerByUserId(user!.id);
      if (!organizerData || organizerData.id !== eventData.organizer_id) {
        setError('You are not authorized to manage this event');
        return;
      }

      setEvent(eventData);
      setOrganizer(organizerData);

      // Load tickets for this event
      // In a real implementation, this would be a specific query for event tickets
      const eventTickets = await getUserTickets('all'); // This needs to be replaced with event-specific query
      setTickets(eventTickets.filter(ticket => ticket.event_id === eventId));

      // Load analytics
      const analyticsData = await getEventAnalytics(eventId!);
      setAnalytics(analyticsData);

    } catch (err: any) {
      setError(err.message || 'Failed to load event data');
    } finally {
      setLoading(false);
    }
  };

  const handleTicketScanned = (ticket: Ticket, isValid: boolean) => {
    if (isValid) {
      // Update local ticket list
      setTickets(prev => 
        prev.map(t => 
          t.id === ticket.id 
            ? { ...t, status: 'used', checked_in_at: new Date().toISOString() }
            : t
        )
      );
    }
  };

  const exportAttendeeList = () => {
    const csvContent = [
      ['Name', 'Email', 'Ticket ID', 'Status', 'Check-in Time', 'Team Name'].join(','),
      ...tickets.map(ticket => [
        ticket.user?.full_name || '',
        ticket.user?.email || '',
        ticket.ticket_id,
        ticket.status,
        ticket.checked_in_at ? new Date(ticket.checked_in_at).toLocaleString() : '',
        ticket.team_name || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event?.title}-attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Alert>
            <AlertDescription>
              Event management requires Supabase configuration.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Alert>
            <AlertDescription>
              Please log in to manage events.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button 
                onClick={() => navigate('/dashboard')}
                className="mt-4"
                variant="outline"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const registeredCount = tickets.length;
  const checkedInCount = tickets.filter(t => t.status === 'used').length;
  const totalRevenue = tickets
    .filter(t => t.payment?.status === 'completed')
    .reduce((sum, t) => sum + (t.payment?.amount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Button 
              onClick={() => navigate('/dashboard')}
              variant="ghost"
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h1>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(event.start_date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    {event.venue}, {event.city}
                  </div>
                  <Badge 
                    variant={event.event_status === 'published' ? 'default' : 'secondary'}
                  >
                    {event.event_status}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" onClick={exportAttendeeList}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Attendees
                </Button>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Registered</p>
                    <p className="text-2xl font-bold text-gray-900">{registeredCount}</p>
                  </div>
                  <Users className="w-8 h-8 text-fme-blue" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Checked In</p>
                    <p className="text-2xl font-bold text-gray-900">{checkedInCount}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCurrency(totalRevenue)}
                    </p>
                  </div>
                  <IndianRupee className="w-8 h-8 text-fme-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Attendance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {registeredCount > 0 ? Math.round((checkedInCount / registeredCount) * 100) : 0}%
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="attendees">Attendees</TabsTrigger>
              <TabsTrigger value="checkin">Check-in</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Event Details */}
                <Card>
                  <CardHeader>
                    <CardTitle>Event Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                      <p className="text-gray-600">{event.description}</p>
                    </div>
                    
                    {event.requirements && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Requirements</h4>
                        <p className="text-gray-600">{event.requirements}</p>
                      </div>
                    )}
                    
                    {event.prizes && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Prizes</h4>
                        <p className="text-gray-600">{event.prizes}</p>
                      </div>
                    )}

                    {event.tags && event.tags.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-2">Tags</h4>
                        <div className="flex flex-wrap gap-2">
                          {event.tags.map(tag => (
                            <Badge key={tag} variant="outline">{tag}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Ticket Types */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ticket Types</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {event.ticket_types?.map(ticketType => (
                        <div key={ticketType.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <h4 className="font-medium text-gray-900">{ticketType.name}</h4>
                            {ticketType.description && (
                              <p className="text-sm text-gray-600">{ticketType.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">
                              {ticketType.price === 0 ? 'Free' : formatCurrency(ticketType.price)}
                            </p>
                            <p className="text-sm text-gray-600">
                              {ticketType.sold} / {ticketType.quantity || '∞'} sold
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="attendees" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Registered Attendees</span>
                    <Button onClick={exportAttendeeList} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export CSV
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {tickets.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No registrations yet</h3>
                      <p className="text-gray-600">Attendees will appear here as they register for your event.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {tickets.map(ticket => (
                        <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 bg-fme-blue/10 rounded-full flex items-center justify-center">
                              {ticket.team_name ? (
                                <Users className="w-5 h-5 text-fme-blue" />
                              ) : (
                                <Users className="w-5 h-5 text-fme-blue" />
                              )}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {ticket.user?.full_name}
                                {ticket.team_name && ` (${ticket.team_name})`}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {ticket.user?.email} • {ticket.ticket_id}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={ticket.status === 'used' ? 'default' : 'secondary'}
                            >
                              {ticket.status === 'used' ? 'Checked In' : 'Registered'}
                            </Badge>
                            {ticket.checked_in_at && (
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(ticket.checked_in_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="checkin" className="space-y-6">
              <QRScanner 
                eventId={event.id} 
                onTicketScanned={handleTicketScanned}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Event Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-600">
                      Detailed analytics and insights about your event performance will be available here.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
