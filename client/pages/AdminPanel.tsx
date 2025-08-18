import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Shield,
  Users,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  MessageSquare,
  FileText,
  Building,
  MapPin,
  Star,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { 
  getEvents,
  createNotification,
  getUserNotifications
} from '@/lib/supabase';
import { formatCurrency } from '@/lib/payment-utils';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Event, Organizer, Notification } from '@shared/types';

interface PendingOrganizer extends Organizer {
  user?: {
    full_name: string;
    email: string;
  };
}

export default function AdminPanel() {
  const [pendingOrganizers, setPendingOrganizers] = useState<PendingOrganizer[]>([]);
  const [pendingEvents, setPendingEvents] = useState<Event[]>([]);
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isConfigured || profile?.role !== 'admin') {
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [user, profile, isConfigured]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Mock data for demo - in real implementation, these would be actual Supabase queries
      const mockPendingOrganizers: PendingOrganizer[] = [
        {
          id: '1',
          user_id: 'user1',
          organization_name: 'IIT Delhi Tech Club',
          organization_type: 'club',
          official_email: 'tech@iitd.ac.in',
          website_url: 'https://iitd.ac.in/techclub',
          social_links: { instagram: '@iitdtech', linkedin: 'iit-delhi-tech' },
          verification_status: 'pending',
          verification_documents: ['doc1.pdf'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            full_name: 'Rahul Sharma',
            email: 'rahul@iitd.ac.in'
          }
        },
        {
          id: '2',
          user_id: 'user2',
          organization_name: 'CodeCraft Startup',
          organization_type: 'startup',
          official_email: 'events@codecraft.io',
          website_url: 'https://codecraft.io',
          social_links: { instagram: '@codecraft', linkedin: 'codecraft-startup' },
          verification_status: 'pending',
          verification_documents: ['startup_cert.pdf'],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user: {
            full_name: 'Priya Patel',
            email: 'priya@codecraft.io'
          }
        }
      ];

      // Load actual events but filter for pending ones
      const events = await getEvents();
      const pending = events.filter(event => event.event_status === 'pending');
      
      setPendingOrganizers(mockPendingOrganizers);
      setPendingEvents(pending);
      setAllEvents(events);

      // Load admin notifications
      const adminNotifications = await getUserNotifications(user!.id);
      setNotifications(adminNotifications);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveOrganizer = async (organizerId: string) => {
    try {
      // In real implementation, update organizer status to 'approved'
      console.log('Approving organizer:', organizerId);
      
      // Update local state
      setPendingOrganizers(prev => prev.filter(org => org.id !== organizerId));
      
      // Create notification for organizer
      const organizer = pendingOrganizers.find(org => org.id === organizerId);
      if (organizer) {
        await createNotification({
          user_id: organizer.user_id,
          type: 'organizer_approved',
          title: 'Organizer Application Approved!',
          message: 'Congratulations! Your organizer application has been approved. You can now create and publish events.',
          data: { organizer_id: organizerId }
        });
      }
    } catch (error) {
      console.error('Error approving organizer:', error);
    }
  };

  const handleRejectOrganizer = async (organizerId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      // In real implementation, update organizer status to 'rejected' with reason
      console.log('Rejecting organizer:', organizerId, 'Reason:', rejectionReason);
      
      // Update local state
      setPendingOrganizers(prev => prev.filter(org => org.id !== organizerId));
      
      // Create notification for organizer
      const organizer = pendingOrganizers.find(org => org.id === organizerId);
      if (organizer) {
        await createNotification({
          user_id: organizer.user_id,
          type: 'organizer_rejected',
          title: 'Organizer Application Rejected',
          message: `Your organizer application has been rejected. Reason: ${rejectionReason}`,
          data: { organizer_id: organizerId, reason: rejectionReason }
        });
      }

      setRejectionReason('');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error rejecting organizer:', error);
    }
  };

  const handleApproveEvent = async (eventId: string) => {
    try {
      // In real implementation, update event status to 'published'
      console.log('Approving event:', eventId);
      
      // Update local state
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
      setAllEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, event_status: 'published' }
          : event
      ));
      
      // Create notification for organizer
      const event = pendingEvents.find(e => e.id === eventId);
      if (event && event.organizer) {
        await createNotification({
          user_id: event.organizer.user_id,
          type: 'event_approved',
          title: 'Event Approved!',
          message: `Your event "${event.title}" has been approved and is now live.`,
          data: { event_id: eventId }
        });
      }
    } catch (error) {
      console.error('Error approving event:', error);
    }
  };

  const handleRejectEvent = async (eventId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      // In real implementation, update event status to 'rejected'
      console.log('Rejecting event:', eventId, 'Reason:', rejectionReason);
      
      // Update local state
      setPendingEvents(prev => prev.filter(event => event.id !== eventId));
      
      // Create notification for organizer
      const event = pendingEvents.find(e => e.id === eventId);
      if (event && event.organizer) {
        await createNotification({
          user_id: event.organizer.user_id,
          type: 'event_rejected',
          title: 'Event Rejected',
          message: `Your event "${event.title}" has been rejected. Reason: ${rejectionReason}`,
          data: { event_id: eventId, reason: rejectionReason }
        });
      }

      setRejectionReason('');
      setSelectedItem(null);
    } catch (error) {
      console.error('Error rejecting event:', error);
    }
  };

  if (!isConfigured) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Alert>
            <AlertDescription>
              Admin panel requires Supabase configuration.
            </AlertDescription>
          </Alert>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Access denied. Admin privileges required.
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

  const totalEvents = allEvents.length;
  const publishedEvents = allEvents.filter(e => e.event_status === 'published').length;
  const totalRegistrations = allEvents.reduce((sum, event) => sum + event.current_participants, 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Panel
            </h1>
            <p className="text-gray-600">
              Manage organizer approvals, event moderation, and platform oversight
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Organizers</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingOrganizers.length}</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Events</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingEvents.length}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Events</p>
                    <p className="text-2xl font-bold text-gray-900">{totalEvents}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                    <p className="text-2xl font-bold text-gray-900">{totalRegistrations}</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="organizers">
                Organizers
                {pendingOrganizers.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingOrganizers.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="events">
                Events
                {pendingEvents.length > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {pendingEvents.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notifications.slice(0, 5).map(notification => (
                        <div key={notification.id} className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">{notification.title}</h4>
                            <p className="text-sm text-gray-600">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(notification.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('organizers')}
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Review Pending Organizers ({pendingOrganizers.length})
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('events')}
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Review Pending Events ({pendingEvents.length})
                    </Button>
                    <Button 
                      className="w-full justify-start" 
                      variant="outline"
                      onClick={() => setActiveTab('reports')}
                    >
                      <TrendingUp className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="organizers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Organizer Applications</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingOrganizers.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-600">No pending organizer applications to review.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pendingOrganizers.map(organizer => (
                        <div key={organizer.id} className="border rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {organizer.organization_name}
                              </h3>
                              <p className="text-gray-600">
                                {organizer.user?.full_name} • {organizer.user?.email}
                              </p>
                              <Badge variant="outline" className="mt-1">
                                {organizer.organization_type}
                              </Badge>
                            </div>
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Contact Information</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                {organizer.official_email && (
                                  <p>Email: {organizer.official_email}</p>
                                )}
                                {organizer.website_url && (
                                  <p>Website: {organizer.website_url}</p>
                                )}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Social Media</h4>
                              <div className="text-sm text-gray-600 space-y-1">
                                {organizer.social_links?.instagram && (
                                  <p>Instagram: {organizer.social_links.instagram}</p>
                                )}
                                {organizer.social_links?.linkedin && (
                                  <p>LinkedIn: {organizer.social_links.linkedin}</p>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Verification Documents</h4>
                            <div className="flex space-x-2">
                              {organizer.verification_documents.map((doc, index) => (
                                <Button key={index} variant="outline" size="sm">
                                  <FileText className="w-4 h-4 mr-2" />
                                  Document {index + 1}
                                </Button>
                              ))}
                            </div>
                          </div>

                          {selectedItem === `organizer-${organizer.id}` && (
                            <div className="mb-4">
                              <Textarea
                                placeholder="Reason for rejection (required)"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleApproveOrganizer(organizer.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            {selectedItem === `organizer-${organizer.id}` ? (
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleRejectOrganizer(organizer.id)}
                                  variant="destructive"
                                  disabled={!rejectionReason.trim()}
                                >
                                  Confirm Reject
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedItem(null);
                                    setRejectionReason('');
                                  }}
                                  variant="outline"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setSelectedItem(`organizer-${organizer.id}`)}
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Pending Event Approvals</CardTitle>
                </CardHeader>
                <CardContent>
                  {pendingEvents.length === 0 ? (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
                      <p className="text-gray-600">No pending events to review.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {pendingEvents.map(event => (
                        <div key={event.id} className="border rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {event.title}
                              </h3>
                              <p className="text-gray-600">
                                by {event.organizer?.organization_name}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge>{event.event_type}</Badge>
                                <div className="flex items-center text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 mr-1" />
                                  {new Date(event.start_date).toLocaleDateString()}
                                </div>
                                <div className="flex items-center text-sm text-gray-600">
                                  <MapPin className="w-4 h-4 mr-1" />
                                  {event.city}
                                </div>
                              </div>
                            </div>
                            <Badge variant="secondary">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                          </div>

                          <div className="mb-4">
                            <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                            <p className="text-gray-600 text-sm">{event.description}</p>
                          </div>

                          {selectedItem === `event-${event.id}` && (
                            <div className="mb-4">
                              <Textarea
                                placeholder="Reason for rejection (required)"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                className="mb-2"
                              />
                            </div>
                          )}

                          <div className="flex space-x-3">
                            <Button
                              onClick={() => handleApproveEvent(event.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            {selectedItem === `event-${event.id}` ? (
                              <div className="flex space-x-2">
                                <Button
                                  onClick={() => handleRejectEvent(event.id)}
                                  variant="destructive"
                                  disabled={!rejectionReason.trim()}
                                >
                                  Confirm Reject
                                </Button>
                                <Button
                                  onClick={() => {
                                    setSelectedItem(null);
                                    setRejectionReason('');
                                  }}
                                  variant="outline"
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                onClick={() => setSelectedItem(`event-${event.id}`)}
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            )}
                            <Button variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                    <p className="text-gray-600">
                      Comprehensive platform analytics and reporting will be available here.
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
