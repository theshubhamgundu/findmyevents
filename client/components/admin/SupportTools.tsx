import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bell,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Trash2,
  Eye,
  Search,
  Filter,
  Users,
  Calendar,
  FileText,
  Mail,
  Phone,
  User,
  Building
} from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  target_audience: 'all' | 'organizers' | 'students' | 'volunteers';
  created_at: string;
  created_by: string;
  is_active: boolean;
  expires_at?: string;
}

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  category: 'technical' | 'payment' | 'event' | 'account' | 'general';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reporter_id: string;
  reporter_name: string;
  reporter_email: string;
  reporter_role: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  event_id?: string;
  event_title?: string;
}

interface Message {
  id: string;
  to_user_id: string;
  to_user_name: string;
  to_user_role: string;
  subject: string;
  message: string;
  sent_at: string;
  status: 'sent' | 'delivered' | 'read';
  message_type: 'info' | 'warning' | 'instruction' | 'reminder';
}

export default function SupportTools() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Form states for creating new items
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    type: 'info' as const,
    target_audience: 'all' as const,
    expires_at: ''
  });

  const [newMessage, setNewMessage] = useState({
    to_user_id: '',
    to_user_name: '',
    subject: '',
    message: '',
    message_type: 'info' as const
  });

  useEffect(() => {
    loadSupportData();
  }, []);

  const loadSupportData = () => {
    // Mock announcements data
    const mockAnnouncements: Announcement[] = [
      {
        id: 'ann1',
        title: 'Platform Maintenance Scheduled',
        message: 'System will be down for maintenance on Feb 3, 2024 from 2:00 AM to 4:00 AM IST.',
        type: 'warning',
        target_audience: 'all',
        created_at: '2024-02-01T10:00:00Z',
        created_by: 'Admin',
        is_active: true,
        expires_at: '2024-02-04T00:00:00Z'
      },
      {
        id: 'ann2',
        title: 'New QR Scanner Features',
        message: 'We have added new features to the QR scanner including bulk scanning and offline mode.',
        type: 'success',
        target_audience: 'organizers',
        created_at: '2024-01-30T14:30:00Z',
        created_by: 'Admin',
        is_active: true
      }
    ];

    // Mock support tickets
    const mockTickets: SupportTicket[] = [
      {
        id: 'ticket1',
        title: 'Payment verification issue',
        description: 'Unable to verify payment for HackFest 2024 registration. UTR ID: 12345678.',
        category: 'payment',
        priority: 'high',
        status: 'open',
        reporter_id: 'user1',
        reporter_name: 'John Doe',
        reporter_email: 'john@student.ac.in',
        reporter_role: 'student',
        created_at: '2024-02-01T09:30:00Z',
        updated_at: '2024-02-01T09:30:00Z',
        event_id: 'event1',
        event_title: 'HackFest 2024'
      },
      {
        id: 'ticket2',
        title: 'QR scanner not working',
        description: 'The QR scanner app is not recognizing tickets during the event check-in.',
        category: 'technical',
        priority: 'urgent',
        status: 'in_progress',
        reporter_id: 'org1',
        reporter_name: 'IIT Delhi Tech Club',
        reporter_email: 'tech@iitd.ac.in',
        reporter_role: 'organizer',
        assigned_to: 'tech_support',
        created_at: '2024-02-01T08:15:00Z',
        updated_at: '2024-02-01T10:00:00Z',
        event_id: 'event1',
        event_title: 'HackFest 2024'
      }
    ];

    // Mock messages
    const mockMessages: Message[] = [
      {
        id: 'msg1',
        to_user_id: 'org1',
        to_user_name: 'IIT Delhi Tech Club',
        to_user_role: 'organizer',
        subject: 'Event Approval Guidelines',
        message: 'Please ensure all event details are complete before submitting for approval.',
        sent_at: '2024-02-01T11:00:00Z',
        status: 'read',
        message_type: 'instruction'
      }
    ];

    setAnnouncements(mockAnnouncements);
    setSupportTickets(mockTickets);
    setMessages(mockMessages);
  };

  const createAnnouncement = () => {
    if (!newAnnouncement.title || !newAnnouncement.message) return;

    const announcement: Announcement = {
      id: `ann${Date.now()}`,
      ...newAnnouncement,
      created_at: new Date().toISOString(),
      created_by: 'Admin',
      is_active: true
    };

    setAnnouncements(prev => [announcement, ...prev]);
    setNewAnnouncement({
      title: '',
      message: '',
      type: 'info',
      target_audience: 'all',
      expires_at: ''
    });
  };

  const sendMessage = () => {
    if (!newMessage.subject || !newMessage.message || !newMessage.to_user_name) return;

    const message: Message = {
      id: `msg${Date.now()}`,
      ...newMessage,
      to_user_id: newMessage.to_user_id || 'unknown',
      sent_at: new Date().toISOString(),
      status: 'sent'
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({
      to_user_id: '',
      to_user_name: '',
      subject: '',
      message: '',
      message_type: 'info'
    });
  };

  const updateTicketStatus = (ticketId: string, status: string) => {
    setSupportTickets(prev => prev.map(ticket =>
      ticket.id === ticketId
        ? { ...ticket, status: status as any, updated_at: new Date().toISOString() }
        : ticket
    ));
  };

  const toggleAnnouncement = (announcementId: string) => {
    setAnnouncements(prev => prev.map(ann =>
      ann.id === announcementId
        ? { ...ann, is_active: !ann.is_active }
        : ann
    ));
  };

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.reporter_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success': return 'bg-green-100 text-green-800 border-green-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800 border-red-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="support">Support Tickets</TabsTrigger>
          <TabsTrigger value="messaging">Messaging</TabsTrigger>
        </TabsList>

        {/* Announcements Tab */}
        <TabsContent value="announcements" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Announcements</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Create Announcement Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Create New Announcement</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="ann-title">Title</Label>
                    <Input
                      id="ann-title"
                      value={newAnnouncement.title}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Announcement title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ann-target">Target Audience</Label>
                    <Select
                      value={newAnnouncement.target_audience}
                      onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, target_audience: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Users</SelectItem>
                        <SelectItem value="organizers">Organizers Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        <SelectItem value="volunteers">Volunteers Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="ann-type">Type</Label>
                    <Select
                      value={newAnnouncement.type}
                      onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="ann-expires">Expires At (Optional)</Label>
                    <Input
                      id="ann-expires"
                      type="datetime-local"
                      value={newAnnouncement.expires_at}
                      onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expires_at: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="ann-message">Message</Label>
                  <Textarea
                    id="ann-message"
                    value={newAnnouncement.message}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Announcement message"
                    rows={3}
                  />
                </div>
                <Button onClick={createAnnouncement}>
                  <Bell className="w-4 h-4 mr-2" />
                  Create Announcement
                </Button>
              </div>

              {/* Announcements List */}
              <div className="space-y-4">
                {announcements.map(announcement => (
                  <div key={announcement.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{announcement.title}</h4>
                          <Badge className={getTypeColor(announcement.type)}>
                            {announcement.type}
                          </Badge>
                          <Badge variant="outline">
                            {announcement.target_audience}
                          </Badge>
                          {announcement.is_active ? (
                            <Badge variant="default">Active</Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{announcement.message}</p>
                        <div className="text-sm text-gray-500">
                          Created: {new Date(announcement.created_at).toLocaleString()}
                          {announcement.expires_at && (
                            <span className="ml-4">
                              Expires: {new Date(announcement.expires_at).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          onClick={() => toggleAnnouncement(announcement.id)}
                          variant="outline"
                          size="sm"
                        >
                          {announcement.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button variant="outline" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tickets Tab */}
        <TabsContent value="support" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Support Ticket Management</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search tickets..."
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tickets List */}
              <div className="space-y-4">
                {filteredTickets.map(ticket => (
                  <div key={ticket.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{ticket.title}</h4>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {ticket.category}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{ticket.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-500">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {ticket.reporter_name} ({ticket.reporter_role})
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {ticket.reporter_email}
                          </div>
                          {ticket.event_title && (
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1" />
                              {ticket.event_title}
                            </div>
                          )}
                        </div>
                        <div className="text-xs text-gray-400 mt-2">
                          Created: {new Date(ticket.created_at).toLocaleString()} • 
                          Updated: {new Date(ticket.updated_at).toLocaleString()}
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2">
                        {ticket.status === 'open' && (
                          <Button
                            onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                            size="sm"
                            variant="outline"
                          >
                            Start Working
                          </Button>
                        )}
                        {ticket.status === 'in_progress' && (
                          <Button
                            onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Resolve
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Messaging Tab */}
        <TabsContent value="messaging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Direct Messaging</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Send Message Form */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-gray-900 mb-4">Send Message to Organizer</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label htmlFor="msg-to">To (Organizer Name)</Label>
                    <Input
                      id="msg-to"
                      value={newMessage.to_user_name}
                      onChange={(e) => setNewMessage(prev => ({ ...prev, to_user_name: e.target.value }))}
                      placeholder="Organizer name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="msg-type">Message Type</Label>
                    <Select
                      value={newMessage.message_type}
                      onValueChange={(value) => setNewMessage(prev => ({ ...prev, message_type: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Information</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="instruction">Instruction</SelectItem>
                        <SelectItem value="reminder">Reminder</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="mb-4">
                  <Label htmlFor="msg-subject">Subject</Label>
                  <Input
                    id="msg-subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="Message subject"
                  />
                </div>
                <div className="mb-4">
                  <Label htmlFor="msg-message">Message</Label>
                  <Textarea
                    id="msg-message"
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Your message"
                    rows={4}
                  />
                </div>
                <Button onClick={sendMessage}>
                  <Send className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>

              {/* Sent Messages */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Sent Messages</h4>
                {messages.map(message => (
                  <div key={message.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{message.subject}</h4>
                          <Badge className={getTypeColor(message.message_type)}>
                            {message.message_type}
                          </Badge>
                          <Badge variant={message.status === 'read' ? 'default' : 'secondary'}>
                            {message.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{message.message}</p>
                        <div className="text-sm text-gray-500">
                          To: {message.to_user_name} ({message.to_user_role}) • 
                          Sent: {new Date(message.sent_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
