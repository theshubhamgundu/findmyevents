import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Edit,
  Trash2,
  Download,
  Filter,
  Search,
  QrCode,
  Activity,
  BarChart3,
  Settings,
  Bell,
  MessageSquare,
  UserCheck,
  Building,
  MapPin,
  Mail,
  Phone,
  Globe,
  Ban,
  UserX,
  RefreshCw,
  Database,
  FileText,
  ChevronRight,
  Star,
  TrendingDown,
  Zap,
  Target
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { isSupabaseConfigured } from '@/lib/supabase';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SecurityDashboard from '@/components/admin/SecurityDashboard';
import SupportTools from '@/components/admin/SupportTools';

// Types for the comprehensive admin dashboard
interface DashboardStats {
  totalEvents: number;
  eventsToday: number;
  eventsUpcoming: number;
  eventsPast: number;
  totalRegistrations: number;
  registrationsToday: number;
  totalOrganizers: number;
  activeOrganizers: number;
  totalVolunteers: number;
  ticketsScanned: number;
  topEvent: {
    name: string;
    registrations: number;
  };
  trendingCategory: string;
}

interface EventDetail {
  id: string;
  title: string;
  organizer_name: string;
  organizer_id: string;
  event_type: string;
  venue: string;
  city: string;
  start_date: string;
  end_date: string;
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'completed';
  registrations: number;
  max_participants: number;
  ticket_types: number;
  created_at: string;
  requires_approval: boolean;
}

interface OrganizerDetail {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  organization_name: string;
  organization_type: string;
  official_email: string;
  website_url?: string;
  verification_status: 'pending' | 'approved' | 'rejected';
  events_count: number;
  total_registrations: number;
  created_at: string;
  last_active: string;
  status: 'active' | 'suspended' | 'banned';
}

interface VolunteerDetail {
  id: string;
  username: string;
  event_id: string;
  event_title: string;
  organizer_name: string;
  created_at: string;
  last_active?: string;
  scans_count: number;
  status: 'active' | 'inactive';
}

interface TicketScanData {
  id: string;
  event_title: string;
  attendee_name: string;
  scan_time: string;
  scanned_by: string;
  ticket_type: string;
  status: 'valid' | 'invalid' | 'duplicate';
}

interface RegistrationDetail {
  id: string;
  event_title: string;
  attendee_name: string;
  attendee_email: string;
  ticket_type: string;
  registration_date: string;
  payment_status: 'paid' | 'pending' | 'failed';
  check_in_status: 'not_checked' | 'checked_in';
  team_name?: string;
  custom_data: Record<string, any>;
}

export default function CoreAdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  
  // Data states
  const [dashboardStats, setDashboardStats] = useState<DashboardStats>({
    totalEvents: 0,
    eventsToday: 0,
    eventsUpcoming: 0,
    eventsPast: 0,
    totalRegistrations: 0,
    registrationsToday: 0,
    totalOrganizers: 0,
    activeOrganizers: 0,
    totalVolunteers: 0,
    ticketsScanned: 0,
    topEvent: { name: '', registrations: 0 },
    trendingCategory: ''
  });
  
  const [events, setEvents] = useState<EventDetail[]>([]);
  const [organizers, setOrganizers] = useState<OrganizerDetail[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerDetail[]>([]);
  const [ticketScans, setTicketScans] = useState<TicketScanData[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationDetail[]>([]);

  const { user, profile, isConfigured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || profile?.role !== 'admin') {
      setLoading(false);
      return;
    }

    loadAdminData();
  }, [user, profile]);

  const loadAdminData = async () => {
    try {
      setLoading(true);

      // Mock comprehensive data - in real implementation, these would be Supabase queries
      const mockStats: DashboardStats = {
        totalEvents: 248,
        eventsToday: 12,
        eventsUpcoming: 45,
        eventsPast: 191,
        totalRegistrations: 15247,
        registrationsToday: 89,
        totalOrganizers: 67,
        activeOrganizers: 52,
        totalVolunteers: 156,
        ticketsScanned: 8934,
        topEvent: {
          name: 'HackFest 2024 - IIT Delhi',
          registrations: 847
        },
        trendingCategory: 'Hackathons'
      };

      const mockEvents: EventDetail[] = [
        {
          id: '1',
          title: 'HackFest 2024 - IIT Delhi',
          organizer_name: 'IIT Delhi Tech Club',
          organizer_id: 'org1',
          event_type: 'hackathon',
          venue: 'IIT Delhi Campus',
          city: 'New Delhi',
          start_date: '2024-02-15T09:00:00Z',
          end_date: '2024-02-17T18:00:00Z',
          status: 'published',
          registrations: 847,
          max_participants: 1000,
          ticket_types: 2,
          created_at: '2024-01-10T10:00:00Z',
          requires_approval: true
        },
        {
          id: '2',
          title: 'AI Workshop Series',
          organizer_name: 'CodeCraft Startup',
          organizer_id: 'org2',
          event_type: 'workshop',
          venue: 'Online',
          city: 'Mumbai',
          start_date: '2024-02-20T14:00:00Z',
          end_date: '2024-02-20T17:00:00Z',
          status: 'pending',
          registrations: 234,
          max_participants: 500,
          ticket_types: 1,
          created_at: '2024-01-25T15:30:00Z',
          requires_approval: true
        }
      ];

      const mockOrganizers: OrganizerDetail[] = [
        {
          id: 'org1',
          user_id: 'user1',
          full_name: 'Dr. Rahul Sharma',
          email: 'rahul@iitd.ac.in',
          phone: '+91-9876543210',
          organization_name: 'IIT Delhi Tech Club',
          organization_type: 'college',
          official_email: 'tech@iitd.ac.in',
          website_url: 'https://iitd.ac.in/techclub',
          verification_status: 'approved',
          events_count: 8,
          total_registrations: 2340,
          created_at: '2024-01-01T00:00:00Z',
          last_active: '2024-02-01T14:30:00Z',
          status: 'active'
        },
        {
          id: 'org2',
          user_id: 'user2',
          full_name: 'Priya Patel',
          email: 'priya@codecraft.io',
          phone: '+91-9123456789',
          organization_name: 'CodeCraft Startup',
          organization_type: 'startup',
          official_email: 'events@codecraft.io',
          website_url: 'https://codecraft.io',
          verification_status: 'pending',
          events_count: 3,
          total_registrations: 567,
          created_at: '2024-01-15T00:00:00Z',
          last_active: '2024-02-01T10:15:00Z',
          status: 'active'
        }
      ];

      const mockVolunteers: VolunteerDetail[] = [
        {
          id: 'vol1',
          username: 'scanner_amit',
          event_id: '1',
          event_title: 'HackFest 2024 - IIT Delhi',
          organizer_name: 'IIT Delhi Tech Club',
          created_at: '2024-02-01T09:00:00Z',
          last_active: '2024-02-01T15:30:00Z',
          scans_count: 156,
          status: 'active'
        },
        {
          id: 'vol2',
          username: 'helper_sarah',
          event_id: '1',
          event_title: 'HackFest 2024 - IIT Delhi',
          organizer_name: 'IIT Delhi Tech Club',
          created_at: '2024-02-01T08:30:00Z',
          last_active: '2024-02-01T16:00:00Z',
          scans_count: 203,
          status: 'active'
        }
      ];

      const mockTicketScans: TicketScanData[] = [
        {
          id: 'scan1',
          event_title: 'HackFest 2024 - IIT Delhi',
          attendee_name: 'John Doe',
          scan_time: '2024-02-15T09:15:00Z',
          scanned_by: 'scanner_amit',
          ticket_type: 'Standard Pass',
          status: 'valid'
        },
        {
          id: 'scan2',
          event_title: 'HackFest 2024 - IIT Delhi',
          attendee_name: 'Jane Smith',
          scan_time: '2024-02-15T09:18:00Z',
          scanned_by: 'helper_sarah',
          ticket_type: 'Premium Pass',
          status: 'valid'
        },
        {
          id: 'scan3',
          event_title: 'AI Workshop Series',
          attendee_name: 'Bob Wilson',
          scan_time: '2024-02-15T09:20:00Z',
          scanned_by: 'scanner_amit',
          ticket_type: 'Standard Pass',
          status: 'duplicate'
        }
      ];

      const mockRegistrations: RegistrationDetail[] = [
        {
          id: 'reg1',
          event_title: 'HackFest 2024 - IIT Delhi',
          attendee_name: 'John Doe',
          attendee_email: 'john@student.ac.in',
          ticket_type: 'Standard Pass',
          registration_date: '2024-01-20T14:30:00Z',
          payment_status: 'paid',
          check_in_status: 'checked_in',
          team_name: 'Code Warriors',
          custom_data: {
            college: 'XYZ University',
            year: '3rd Year',
            skills: 'JavaScript, Python'
          }
        },
        {
          id: 'reg2',
          event_title: 'AI Workshop Series',
          attendee_name: 'Jane Smith',
          attendee_email: 'jane@example.com',
          ticket_type: 'Premium Pass',
          registration_date: '2024-01-22T10:15:00Z',
          payment_status: 'paid',
          check_in_status: 'not_checked',
          custom_data: {
            college: 'ABC Institute',
            experience: 'Beginner'
          }
        }
      ];

      setDashboardStats(mockStats);
      setEvents(mockEvents);
      setOrganizers(mockOrganizers);
      setVolunteers(mockVolunteers);
      setTicketScans(mockTicketScans);
      setRegistrations(mockRegistrations);

    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter functions
  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.organizer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredOrganizers = organizers.filter(organizer => {
    const matchesSearch = organizer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organizer.organization_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         organizer.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || organizer.verification_status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredRegistrations = registrations.filter(registration => {
    const matchesSearch = registration.attendee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.event_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         registration.attendee_email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Action handlers
  const handleEventAction = async (eventId: string, action: 'approve' | 'reject' | 'edit' | 'delete') => {
    console.log(`${action} event:`, eventId);
    // In real implementation, this would update the database
  };

  const handleOrganizerAction = async (organizerId: string, action: 'approve' | 'reject' | 'suspend' | 'activate') => {
    console.log(`${action} organizer:`, organizerId);
    // In real implementation, this would update the database
  };

  const exportData = (type: string) => {
    console.log(`Exporting ${type} data...`);
    // In real implementation, this would generate CSV/Excel files
  };


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
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading admin dashboard...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Core Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Complete platform oversight and management control
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="events">Events</TabsTrigger>
              <TabsTrigger value="organizers">Organizers</TabsTrigger>
              <TabsTrigger value="volunteers">Volunteers</TabsTrigger>
              <TabsTrigger value="tickets">Tickets/QR</TabsTrigger>
              <TabsTrigger value="registrations">Registrations</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="support">Support</TabsTrigger>
            </TabsList>

            {/* Overview/Analytics Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Events</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalEvents}</p>
                        <div className="flex items-center text-sm mt-1">
                          <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                          <span className="text-green-600">Today: {dashboardStats.eventsToday}</span>
                        </div>
                      </div>
                      <Calendar className="w-8 h-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total Registrations</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalRegistrations.toLocaleString()}</p>
                        <div className="flex items-center text-sm mt-1">
                          <Activity className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-blue-600">Today: {dashboardStats.registrationsToday}</span>
                        </div>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Active Organizers</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeOrganizers}</p>
                        <div className="flex items-center text-sm mt-1">
                          <Building className="w-4 h-4 text-purple-500 mr-1" />
                          <span className="text-purple-600">Total: {dashboardStats.totalOrganizers}</span>
                        </div>
                      </div>
                      <Building className="w-8 h-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Tickets Scanned</p>
                        <p className="text-2xl font-bold text-gray-900">{dashboardStats.ticketsScanned.toLocaleString()}</p>
                        <div className="flex items-center text-sm mt-1">
                          <QrCode className="w-4 h-4 text-orange-500 mr-1" />
                          <span className="text-orange-600">Volunteers: {dashboardStats.totalVolunteers}</span>
                        </div>
                      </div>
                      <QrCode className="w-8 h-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Event Status Overview */}
              <div className="grid lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Status Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Upcoming Events</span>
                        <Badge variant="default">{dashboardStats.eventsUpcoming}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Events Today</span>
                        <Badge variant="secondary">{dashboardStats.eventsToday}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Past Events</span>
                        <Badge variant="outline">{dashboardStats.eventsPast}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Top Performing Event</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <Star className="w-8 h-8 text-yellow-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{dashboardStats.topEvent.name}</h4>
                        <p className="text-sm text-gray-600">{dashboardStats.topEvent.registrations} registrations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Trending Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="w-8 h-8 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-gray-900">{dashboardStats.trendingCategory}</h4>
                        <p className="text-sm text-gray-600">Most popular event type</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-4 gap-4">
                    <Button onClick={() => setActiveTab('events')} variant="outline" className="justify-start">
                      <Calendar className="w-4 h-4 mr-2" />
                      Manage Events
                    </Button>
                    <Button onClick={() => setActiveTab('organizers')} variant="outline" className="justify-start">
                      <Building className="w-4 h-4 mr-2" />
                      Review Organizers
                    </Button>
                    <Button onClick={() => setActiveTab('tickets')} variant="outline" className="justify-start">
                      <QrCode className="w-4 h-4 mr-2" />
                      Monitor Scans
                    </Button>
                    <Button onClick={() => exportData('all')} variant="outline" className="justify-start">
                      <Download className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Events Management Tab */}
            <TabsContent value="events" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Event Management</CardTitle>
                    <Button onClick={() => exportData('events')} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Events
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search events or organizers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Events List */}
                  <div className="space-y-4">
                    {filteredEvents.map(event => (
                      <div key={event.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {event.title}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Building className="w-4 h-4 mr-2" />
                                  {event.organizer_name}
                                </div>
                                <div className="flex items-center">
                                  <MapPin className="w-4 h-4 mr-2" />
                                  {event.venue}, {event.city}
                                </div>
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {new Date(event.start_date).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-2" />
                                  {event.registrations}/{event.max_participants} registered
                                </div>
                                <div className="flex items-center">
                                  <Target className="w-4 h-4 mr-2" />
                                  {event.ticket_types} ticket types
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Created {new Date(event.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant={
                              event.status === 'published' ? 'default' :
                              event.status === 'pending' ? 'secondary' :
                              event.status === 'approved' ? 'default' : 'destructive'
                            }>
                              {event.status}
                            </Badge>
                            <Badge variant="outline">
                              {event.event_type}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {event.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleEventAction(event.id, 'approve')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleEventAction(event.id, 'reject')}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            onClick={() => handleEventAction(event.id, 'edit')}
                            size="sm"
                            variant="outline"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Organizers Management Tab */}
            <TabsContent value="organizers" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Organizer Management</CardTitle>
                    <Button onClick={() => exportData('organizers')} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Organizers
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search and Filters */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search organizers..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Organizers List */}
                  <div className="space-y-4">
                    {filteredOrganizers.map(organizer => (
                      <div key={organizer.id} className="border rounded-lg p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                              {organizer.organization_name}
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Users className="w-4 h-4 mr-2" />
                                  {organizer.full_name}
                                </div>
                                <div className="flex items-center">
                                  <Mail className="w-4 h-4 mr-2" />
                                  {organizer.email}
                                </div>
                                {organizer.phone && (
                                  <div className="flex items-center">
                                    <Phone className="w-4 h-4 mr-2" />
                                    {organizer.phone}
                                  </div>
                                )}
                                {organizer.website_url && (
                                  <div className="flex items-center">
                                    <Globe className="w-4 h-4 mr-2" />
                                    {organizer.website_url}
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center">
                                  <Calendar className="w-4 h-4 mr-2" />
                                  {organizer.events_count} events created
                                </div>
                                <div className="flex items-center">
                                  <Target className="w-4 h-4 mr-2" />
                                  {organizer.total_registrations} total registrations
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-2" />
                                  Last active: {new Date(organizer.last_active).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <Badge variant={
                              organizer.verification_status === 'approved' ? 'default' :
                              organizer.verification_status === 'pending' ? 'secondary' : 'destructive'
                            }>
                              {organizer.verification_status}
                            </Badge>
                            <Badge variant={organizer.status === 'active' ? 'default' : 'destructive'}>
                              {organizer.status}
                            </Badge>
                            <Badge variant="outline">
                              {organizer.organization_type}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {organizer.verification_status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleOrganizerAction(organizer.id, 'approve')}
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleOrganizerAction(organizer.id, 'reject')}
                                size="sm"
                                variant="destructive"
                              >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          {organizer.status === 'active' ? (
                            <Button
                              onClick={() => handleOrganizerAction(organizer.id, 'suspend')}
                              size="sm"
                              variant="outline"
                            >
                              <Ban className="w-4 h-4 mr-2" />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              onClick={() => handleOrganizerAction(organizer.id, 'activate')}
                              size="sm"
                              variant="outline"
                            >
                              <UserCheck className="w-4 h-4 mr-2" />
                              Activate
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Volunteers Tab */}
            <TabsContent value="volunteers" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Volunteer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {volunteers.map(volunteer => (
                      <div key={volunteer.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{volunteer.username}</h4>
                            <p className="text-sm text-gray-600">{volunteer.event_title}</p>
                            <p className="text-sm text-gray-500">by {volunteer.organizer_name}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>Scans: {volunteer.scans_count}</span>
                              {volunteer.last_active && (
                                <span>Last active: {new Date(volunteer.last_active).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={volunteer.status === 'active' ? 'default' : 'secondary'}>
                              {volunteer.status}
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-2" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tickets/QR Tab */}
            <TabsContent value="tickets" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ticket & QR Code Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <QrCode className="w-8 h-8 mx-auto mb-2 text-green-500" />
                            <p className="text-2xl font-bold">{ticketScans.filter(s => s.status === 'valid').length}</p>
                            <p className="text-sm text-gray-600">Valid Scans</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
                            <p className="text-2xl font-bold">{ticketScans.filter(s => s.status === 'duplicate').length}</p>
                            <p className="text-sm text-gray-600">Duplicate Scans</p>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <div className="text-center">
                            <XCircle className="w-8 h-8 mx-auto mb-2 text-gray-500" />
                            <p className="text-2xl font-bold">{ticketScans.filter(s => s.status === 'invalid').length}</p>
                            <p className="text-sm text-gray-600">Invalid Scans</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <h4 className="font-medium text-gray-900 mb-4">Recent Scan Activity</h4>
                    <div className="space-y-3">
                      {ticketScans.map(scan => (
                        <div key={scan.id} className="flex items-center justify-between p-3 border rounded">
                          <div>
                            <h5 className="font-medium">{scan.attendee_name}</h5>
                            <p className="text-sm text-gray-600">{scan.event_title}</p>
                            <p className="text-xs text-gray-500">
                              Scanned by {scan.scanned_by} • {new Date(scan.scan_time).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              scan.status === 'valid' ? 'default' :
                              scan.status === 'duplicate' ? 'secondary' : 'destructive'
                            }>
                              {scan.status}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{scan.ticket_type}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Registrations Tab */}
            <TabsContent value="registrations" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Registrations Management</CardTitle>
                    <Button onClick={() => exportData('registrations')} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export Registrations
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Search */}
                  <div className="mb-6">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search registrations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  {/* Registrations List */}
                  <div className="space-y-4">
                    {filteredRegistrations.map(registration => (
                      <div key={registration.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-gray-900">{registration.attendee_name}</h4>
                            <p className="text-sm text-gray-600">{registration.attendee_email}</p>
                            <p className="text-sm text-gray-600">{registration.event_title}</p>
                            {registration.team_name && (
                              <p className="text-sm text-blue-600">Team: {registration.team_name}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <Badge variant={registration.payment_status === 'paid' ? 'default' : 'secondary'}>
                              {registration.payment_status}
                            </Badge>
                            <Badge 
                              variant={registration.check_in_status === 'checked_in' ? 'default' : 'outline'}
                              className="ml-2"
                            >
                              {registration.check_in_status === 'checked_in' ? 'Checked In' : 'Not Checked'}
                            </Badge>
                            <p className="text-xs text-gray-500 mt-1">{registration.ticket_type}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(registration.registration_date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {/* Custom Data */}
                        {Object.keys(registration.custom_data).length > 0 && (
                          <div className="bg-gray-50 rounded p-3 mt-3">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Additional Information:</h5>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              {Object.entries(registration.custom_data).map(([key, value]) => (
                                <div key={key}>
                                  <span className="font-medium text-gray-700">{key}:</span>
                                  <span className="ml-1 text-gray-600">{String(value)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-6">
              <SecurityDashboard />
            </TabsContent>

            {/* Support Tab */}
            <TabsContent value="support" className="space-y-6">
              <SupportTools />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
