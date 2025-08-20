import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Shield,
  Activity,
  Users,
  Lock,
  Eye,
  AlertTriangle,
  Clock,
  MapPin,
  Monitor,
  Smartphone,
  Globe,
  Database,
  Search,
  Download,
  RefreshCw
} from 'lucide-react';

interface SecurityEvent {
  id: string;
  type: 'login' | 'logout' | 'failed_login' | 'suspicious_activity' | 'role_change' | 'data_export';
  user_id: string;
  user_name: string;
  user_role: 'student' | 'organizer' | 'admin' | 'volunteer';
  timestamp: string;
  ip_address: string;
  user_agent: string;
  location?: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface ActiveSession {
  id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  login_time: string;
  last_activity: string;
  ip_address: string;
  device_type: 'desktop' | 'mobile' | 'tablet';
  location: string;
  status: 'active' | 'idle' | 'expired';
}

interface RolePermission {
  role: string;
  permissions: {
    events: { read: boolean; write: boolean; delete: boolean };
    users: { read: boolean; write: boolean; delete: boolean };
    registrations: { read: boolean; write: boolean; delete: boolean };
    analytics: { read: boolean; write: boolean; delete: boolean };
    admin: { read: boolean; write: boolean; delete: boolean };
  };
}

export default function SecurityDashboard() {
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [activeSessions, setActiveSessions] = useState<ActiveSession[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterTimeRange, setFilterTimeRange] = useState('24h');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = () => {
    // Mock security events data
    const mockEvents: SecurityEvent[] = [
      {
        id: 'sec1',
        type: 'failed_login',
        user_id: 'unknown',
        user_name: 'Unknown User',
        user_role: 'student',
        timestamp: '2024-02-01T10:30:00Z',
        ip_address: '192.168.1.100',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Mumbai, India',
        details: 'Multiple failed login attempts detected',
        severity: 'high'
      },
      {
        id: 'sec2',
        type: 'login',
        user_id: 'user1',
        user_name: 'John Doe',
        user_role: 'organizer',
        timestamp: '2024-02-01T09:15:00Z',
        ip_address: '203.0.113.42',
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        location: 'Delhi, India',
        details: 'Successful login from new device',
        severity: 'low'
      },
      {
        id: 'sec3',
        type: 'data_export',
        user_id: 'admin1',
        user_name: 'Admin User',
        user_role: 'admin',
        timestamp: '2024-02-01T08:45:00Z',
        ip_address: '198.51.100.23',
        user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        location: 'Bangalore, India',
        details: 'Exported user registrations data',
        severity: 'medium'
      }
    ];

    // Mock active sessions
    const mockSessions: ActiveSession[] = [
      {
        id: 'sess1',
        user_id: 'user1',
        user_name: 'John Doe',
        user_role: 'organizer',
        login_time: '2024-02-01T09:15:00Z',
        last_activity: '2024-02-01T10:30:00Z',
        ip_address: '203.0.113.42',
        device_type: 'desktop',
        location: 'Delhi, India',
        status: 'active'
      },
      {
        id: 'sess2',
        user_id: 'user2',
        user_name: 'Jane Smith',
        user_role: 'student',
        login_time: '2024-02-01T08:00:00Z',
        last_activity: '2024-02-01T08:45:00Z',
        ip_address: '198.51.100.15',
        device_type: 'mobile',
        location: 'Mumbai, India',
        status: 'idle'
      }
    ];

    // Mock role permissions
    const mockPermissions: RolePermission[] = [
      {
        role: 'admin',
        permissions: {
          events: { read: true, write: true, delete: true },
          users: { read: true, write: true, delete: true },
          registrations: { read: true, write: true, delete: true },
          analytics: { read: true, write: true, delete: true },
          admin: { read: true, write: true, delete: true }
        }
      },
      {
        role: 'organizer',
        permissions: {
          events: { read: true, write: true, delete: false },
          users: { read: false, write: false, delete: false },
          registrations: { read: true, write: true, delete: false },
          analytics: { read: true, write: false, delete: false },
          admin: { read: false, write: false, delete: false }
        }
      },
      {
        role: 'volunteer',
        permissions: {
          events: { read: true, write: false, delete: false },
          users: { read: false, write: false, delete: false },
          registrations: { read: true, write: true, delete: false },
          analytics: { read: false, write: false, delete: false },
          admin: { read: false, write: false, delete: false }
        }
      },
      {
        role: 'student',
        permissions: {
          events: { read: true, write: false, delete: false },
          users: { read: false, write: false, delete: false },
          registrations: { read: true, write: false, delete: false },
          analytics: { read: false, write: false, delete: false },
          admin: { read: false, write: false, delete: false }
        }
      }
    ];

    setSecurityEvents(mockEvents);
    setActiveSessions(mockSessions);
    setRolePermissions(mockPermissions);
  };

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.details.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const terminateSession = (sessionId: string) => {
    setActiveSessions(prev => prev.filter(session => session.id !== sessionId));
    console.log('Terminating session:', sessionId);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="events">Security Events</TabsTrigger>
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="permissions">Role Permissions</TabsTrigger>
        </TabsList>

        {/* Security Events Tab */}
        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Security Event Log</CardTitle>
                <div className="flex space-x-2">
                  <Button onClick={loadSecurityData} variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Export Log
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search events..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterTimeRange} onValueChange={setFilterTimeRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Events List */}
              <div className="space-y-3">
                {filteredEvents.map(event => (
                  <div key={event.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <Badge variant="outline">
                            {event.type.replace('_', ' ')}
                          </Badge>
                          <span className="text-sm text-gray-600">
                            {new Date(event.timestamp).toLocaleString()}
                          </span>
                        </div>
                        <h4 className="font-medium text-gray-900 mb-1">{event.details}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-1" />
                            {event.user_name} ({event.user_role})
                          </div>
                          <div className="flex items-center">
                            <Globe className="w-4 h-4 mr-1" />
                            {event.ip_address}
                          </div>
                          {event.location && (
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-1" />
                              {event.location}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Sessions Tab */}
        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active User Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map(session => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">{session.user_name}</h4>
                          <Badge variant="outline">{session.user_role}</Badge>
                          <Badge variant={session.status === 'active' ? 'default' : 'secondary'}>
                            {session.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            Login: {new Date(session.login_time).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            <Activity className="w-4 h-4 mr-1" />
                            Last: {new Date(session.last_activity).toLocaleString()}
                          </div>
                          <div className="flex items-center">
                            {session.device_type === 'mobile' ? <Smartphone className="w-4 h-4 mr-1" /> : <Monitor className="w-4 h-4 mr-1" />}
                            {session.device_type} • {session.ip_address}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {session.location}
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={() => terminateSession(session.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Terminate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Permissions Tab */}
        <TabsContent value="permissions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Role-Based Access Control</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {rolePermissions.map(rolePermission => (
                  <div key={rolePermission.role} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
                      {rolePermission.role} Role
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      {Object.entries(rolePermission.permissions).map(([module, perms]) => (
                        <div key={module} className="bg-gray-50 rounded p-3">
                          <h4 className="font-medium text-gray-900 mb-2 capitalize">{module}</h4>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center justify-between">
                              <span>Read</span>
                              <Badge variant={perms.read ? 'default' : 'destructive'}>
                                {perms.read ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Write</span>
                              <Badge variant={perms.write ? 'default' : 'destructive'}>
                                {perms.write ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span>Delete</span>
                              <Badge variant={perms.delete ? 'default' : 'destructive'}>
                                {perms.delete ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
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
