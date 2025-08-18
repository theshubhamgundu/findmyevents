import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calendar, 
  QrCode, 
  Bell, 
  Ticket, 
  TrendingUp, 
  Users, 
  Plus,
  MapPin,
  Clock,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Building
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { 
  getUserTickets, 
  getOrganizerByUserId, 
  getOrganizerEvents,
  getUserNotifications,
  markNotificationAsRead,
  updateEventAnalytics
} from '@/lib/supabase';
import { generateTicketQR, downloadQRCode } from '@/lib/qr-utils';
import { formatCurrency } from '@/lib/payment-utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Ticket, Event, Notification, Organizer } from '@shared/types';

export default function Dashboard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingQR, setGeneratingQR] = useState<string | null>(null);
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isConfigured) {
      setLoading(false);
      return;
    }

    loadDashboardData();
  }, [user, isConfigured]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Load user tickets
      const userTickets = await getUserTickets(user.id);
      setTickets(userTickets);

      // Load organizer data if user is organizer
      if (profile?.role === 'organizer') {
        const organizerData = await getOrganizerByUserId(user.id);
        setOrganizer(organizerData);
        
        if (organizerData) {
          const organizerEvents = await getOrganizerEvents(organizerData.id);
          setEvents(organizerEvents);
        }
      }

      // Load notifications
      const userNotifications = await getUserNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQR = async (ticket: Ticket) => {
    try {
      setGeneratingQR(ticket.id);
      const qrCode = await generateTicketQR(ticket);
      
      // Download QR code
      downloadQRCode(qrCode, `ticket-${ticket.ticket_id}.png`);
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setGeneratingQR(null);
    }
  };

  const handleMarkNotificationRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getUpcomingEvents = () => {
    return tickets
      .filter(ticket => {
        if (!ticket.event) return false;
        const eventDate = new Date(ticket.event.start_date);
        return eventDate > new Date() && ticket.status === 'active';
      })
      .slice(0, 5);
  };

  const getPastEvents = () => {
    return tickets
      .filter(ticket => {
        if (!ticket.event) return false;
        const eventDate = new Date(ticket.event.end_date);
        return eventDate < new Date();
      })
      .slice(0, 5);
  };

  const getUnreadNotifications = () => {
    return notifications.filter(n => !n.is_read);
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-fme-orange mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Demo Mode</h2>
              <p className="text-gray-600 mb-4">
                Dashboard functionality requires Supabase configuration.
              </p>
              <Button 
                onClick={() => navigate('/events')}
                className="bg-fme-blue hover:bg-fme-blue/90"
              >
                Browse Events
              </Button>
            </CardContent>
          </Card>
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
          <Card className="max-w-md w-full mx-4">
            <CardContent className="p-6 text-center">
              <AlertCircle className="w-12 h-12 text-fme-orange mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Login Required</h2>
              <p className="text-gray-600 mb-4">
                Please log in to access your dashboard.
              </p>
              <Button 
                onClick={() => navigate('/login')}
                className="bg-fme-blue hover:bg-fme-blue/90"
              >
                Go to Login
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const upcomingEvents = getUpcomingEvents();
  const pastEvents = getPastEvents();
  const unreadNotifications = getUnreadNotifications();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {profile?.full_name}! 👋
            </h1>
            <p className="text-gray-600">
              {profile?.role === 'organizer' 
                ? 'Manage your events and track registrations' 
                : 'Keep track of your event registrations and tickets'
              }
            </p>
          </div>

          {/* Organizer Verification Status */}
          {profile?.role === 'organizer' && (
            <div className="mb-6">
              {!organizer ? (
                <Alert>
                  <Building className="h-4 w-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Complete your organizer profile to start creating events</span>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/become-organizer')}
                    >
                      Complete Profile
                    </Button>
                  </AlertDescription>
                </Alert>
              ) : organizer.verification_status === 'pending' ? (
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    Your organizer application is under review. Events will be published after approval.
                  </AlertDescription>
                </Alert>
              ) : organizer.verification_status === 'rejected' ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your organizer application was rejected. {organizer.rejection_reason}
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    Your organizer account is verified! You can now create and publish events.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                        <p className="text-2xl font-bold text-gray-900">{upcomingEvents.length}</p>
                      </div>
                      <Calendar className="w-8 h-8 text-fme-blue" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">My Tickets</p>
                        <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
                      </div>
                      <Ticket className="w-8 h-8 text-fme-orange" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Events Attended</p>
                        <p className="text-2xl font-bold text-gray-900">{pastEvents.length}</p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Notifications</p>
                        <p className="text-2xl font-bold text-gray-900">{unreadNotifications.length}</p>
                      </div>
                      <Bell className="w-8 h-8 text-red-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Upcoming Events */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Upcoming Events</span>
                        <Link to="/events">
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            Browse More
                          </Button>
                        </Link>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {upcomingEvents.length === 0 ? (
                        <div className="text-center py-8">
                          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming events</h3>
                          <p className="text-gray-600 mb-4">Explore events and register for exciting tech events!</p>
                          <Link to="/events">
                            <Button className="bg-fme-blue hover:bg-fme-blue/90">
                              Browse Events
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {upcomingEvents.map((ticket) => (
                            <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-fme-blue/10 rounded-lg flex items-center justify-center">
                                  <Calendar className="w-6 h-6 text-fme-blue" />
                                </div>
                                <div>
                                  <h4 className="font-semibold text-gray-900">{ticket.event?.title}</h4>
                                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                                    <span className="flex items-center">
                                      <Clock className="w-4 h-4 mr-1" />
                                      {new Date(ticket.event?.start_date!).toLocaleDateString()}
                                    </span>
                                    <span className="flex items-center">
                                      <MapPin className="w-4 h-4 mr-1" />
                                      {ticket.event?.venue}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <Button 
                                size="sm" 
                                className="bg-fme-blue hover:bg-fme-blue/90"
                                onClick={() => handleGenerateQR(ticket)}
                                disabled={generatingQR === ticket.id}
                              >
                                <QrCode className="w-4 h-4 mr-2" />
                                {generatingQR === ticket.id ? 'Generating...' : 'Get QR'}
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Organizer Events (if organizer) */}
                  {profile?.role === 'organizer' && organizer && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>My Events</span>
                          <Link to="/create-event">
                            <Button className="bg-fme-orange hover:bg-fme-orange/90" size="sm">
                              <Plus className="w-4 h-4 mr-2" />
                              Create Event
                            </Button>
                          </Link>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {events.length === 0 ? (
                          <div className="text-center py-8">
                            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No events created</h3>
                            <p className="text-gray-600 mb-4">Start creating amazing tech events for students!</p>
                            <Link to="/create-event">
                              <Button className="bg-fme-orange hover:bg-fme-orange/90">
                                <Plus className="w-4 h-4 mr-2" />
                                Create Your First Event
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {events.slice(0, 3).map((event) => (
                              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div>
                                  <div className="flex items-center space-x-2 mb-1">
                                    <h4 className="font-semibold text-gray-900">{event.title}</h4>
                                    <Badge 
                                      variant={event.event_status === 'published' ? 'default' : 'secondary'}
                                    >
                                      {event.event_status}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center text-sm text-gray-600 space-x-4">
                                    <span className="flex items-center">
                                      <Users className="w-4 h-4 mr-1" />
                                      {event.current_participants} registered
                                    </span>
                                    <span className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-1" />
                                      {new Date(event.start_date).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button variant="outline" size="sm">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    Analytics
                                  </Button>
                                  <Button variant="outline" size="sm">
                                    <Users className="w-4 h-4 mr-2" />
                                    Attendees
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Quick Actions */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Link to="/events">
                        <Button className="w-full bg-fme-blue hover:bg-fme-blue/90">
                          <Plus className="w-4 h-4 mr-2" />
                          Explore Events
                        </Button>
                      </Link>
                      {profile?.role === 'organizer' && organizer && (
                        <Link to="/create-event">
                          <Button variant="outline" className="w-full">
                            <Building className="w-4 h-4 mr-2" />
                            Create Event
                          </Button>
                        </Link>
                      )}
                      {profile?.role === 'student' && (
                        <Link to="/become-organizer">
                          <Button variant="outline" className="w-full">
                            <Building className="w-4 h-4 mr-2" />
                            Become Organizer
                          </Button>
                        </Link>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Notifications</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {notifications.length === 0 ? (
                        <div className="text-center py-4">
                          <Bell className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">No notifications yet</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-sm">
                          {notifications.slice(0, 5).map((notification) => (
                            <div 
                              key={notification.id} 
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                notification.is_read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                              }`}
                              onClick={() => handleMarkNotificationRead(notification.id)}
                            >
                              <div className="flex items-start space-x-2">
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  notification.is_read ? 'bg-gray-400' : 'bg-blue-500'
                                }`}></div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900">{notification.title}</h4>
                                  <p className="text-gray-600 text-xs mt-1">{notification.message}</p>
                                  <p className="text-gray-400 text-xs mt-1">
                                    {new Date(notification.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
